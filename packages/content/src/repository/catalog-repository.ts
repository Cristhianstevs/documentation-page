import { createHash, randomUUID } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { z } from 'zod';
import { validateSiteCatalog, type SiteCatalog } from '../schema/site.ts';
import { readSiteCatalog, RepositoryError } from './site-repository.ts';

const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const revisionOf = (source: string) => createHash('sha256').update(source, 'utf8').digest('hex');

const operationId = z.string().regex(ID_PATTERN);
const operationText = z.string().trim().min(1);
const catalogOperationSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('updateSite'),
    title: operationText,
    brand: operationText,
    language: operationText,
    defaultTheme: z.enum(['light', 'dark', 'system']),
  }),
  z.object({ type: z.literal('createTab'), id: operationId, title: operationText }),
  z.object({ type: z.literal('renameTab'), tabId: operationId, title: operationText }),
  z.object({ type: z.literal('renameTabId'), tabId: operationId, nextId: operationId }),
  z.object({ type: z.literal('moveTab'), tabId: operationId, index: z.number().int().nonnegative() }),
  z.object({ type: z.literal('removeTab'), tabId: operationId }),
  z.object({ type: z.literal('createPage'), tabId: operationId, id: operationId, title: operationText }),
  z.object({ type: z.literal('renamePage'), pageId: operationId, title: operationText }),
  z.object({ type: z.literal('renamePageId'), pageId: operationId, nextId: operationId }),
  z.object({ type: z.literal('movePage'), pageId: operationId, tabId: operationId, index: z.number().int().nonnegative() }),
  z.object({ type: z.literal('duplicatePage'), pageId: operationId, tabId: operationId, id: operationId, title: operationText }),
  z.object({ type: z.literal('removePage'), pageId: operationId }),
  z.object({ type: z.literal('restorePage'), trashId: z.string().trim().min(1).max(160) }),
]);

export type CatalogOperation = z.infer<typeof catalogOperationSchema>;

export type CatalogState = { catalog: SiteCatalog; revision: string };
export type TrashItem = { id: string; pageId: string; title: string; tabId: string; trashedAt: string };
type TrashManifest = TrashItem & { source: string; index: number };

function assertId(id: string, label: string) {
  if (!ID_PATTERN.test(id)) {
    throw new RepositoryError('invalid-operation', `${label} deve usar letras minúsculas, números e hífen.`);
  }
}

function requiredText(value: string, label: string) {
  const normalized = value.trim();
  if (!normalized) throw new RepositoryError('invalid-operation', `${label} é obrigatório.`);
  return normalized;
}

function tabOf(catalog: SiteCatalog, tabId: string) {
  const tab = catalog.tabs.find((candidate) => candidate.id === tabId);
  if (!tab) throw new RepositoryError('invalid-operation', 'A aba solicitada não existe.');
  return tab;
}

function pageLocation(catalog: SiteCatalog, pageId: string) {
  const page = catalog.pages[pageId];
  if (!page) throw new RepositoryError('page-not-found', 'A página solicitada não existe.');
  const tab = catalog.tabs.find((candidate) => candidate.pages.includes(pageId));
  if (!tab) throw new RepositoryError('invalid-catalog', 'A página não pertence a uma aba.');
  return { page, tab, index: tab.pages.indexOf(pageId) };
}

async function readCatalogSource(root: string) {
  const source = await readFile(join(root, 'site.json'), 'utf8');
  return { source, catalog: await readSiteCatalog(root), revision: revisionOf(source) };
}

async function writeCatalog(root: string, catalog: SiteCatalog, expectedRevision: string) {
  const validated = validateSiteCatalog(catalog);
  const destination = join(root, 'site.json');
  const revisionDirectory = join(root, '.revisions', 'catalog');
  await mkdir(revisionDirectory, { recursive: true });
  const stamp = new Date().toISOString().replaceAll(':', '-');
  const backup = join(revisionDirectory, `${stamp}-site.json`);
  const temporary = join(root, `.site.json.${randomUUID()}.tmp`);
  await copyFile(destination, backup);
  const source = `${JSON.stringify(validated, null, 2)}\n`;
  try {
    await writeFile(temporary, source, { encoding: 'utf8', flag: 'wx' });
    const currentSource = await readFile(destination, 'utf8');
    if (revisionOf(currentSource) !== expectedRevision) {
      throw new RepositoryError(
        'revision-conflict',
        'O catálogo mudou durante o salvamento. Nenhuma configuração foi substituída.',
      );
    }
    await rename(temporary, destination);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }
  return {
    catalog: validated,
    revision: revisionOf(source),
    backup: relative(root, backup).replaceAll('\\', '/'),
  };
}

export async function readCatalogState(root: string): Promise<CatalogState> {
  const normalizedRoot = resolve(root);
  const { catalog, revision } = await readCatalogSource(normalizedRoot);
  return { catalog, revision };
}

export async function listTrash(root: string): Promise<TrashItem[]> {
  const directory = join(resolve(root), '.trash');
  let entries;
  try {
    entries = await readdir(directory, { withFileTypes: true });
  } catch {
    return [];
  }
  const items = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory())
      .map(async (entry): Promise<TrashItem | null> => {
        try {
          return JSON.parse(await readFile(join(directory, entry.name, 'manifest.json'), 'utf8')) as TrashManifest;
        } catch {
          return null;
        }
      }),
  );
  return items.filter((item): item is TrashItem => item !== null).toSorted((a, b) => b.trashedAt.localeCompare(a.trashedAt));
}

export async function applyCatalogOperation(
  root: string,
  input: { revision: string; operation: CatalogOperation },
) {
  const normalizedRoot = resolve(root);
  const { catalog: current, revision } = await readCatalogSource(normalizedRoot);
  if (revision !== input.revision) {
    throw new RepositoryError('revision-conflict', 'O catálogo mudou desde que foi aberto. Recarregue as configurações.');
  }
  const catalog = structuredClone(current);
  const parsedOperation = catalogOperationSchema.safeParse(input.operation);
  if (!parsedOperation.success) {
    throw new RepositoryError('invalid-operation', 'A operação de configuração possui dados inválidos.');
  }
  const operation = parsedOperation.data;
  let rollback: (() => Promise<void>) | undefined;
  let cleanup: (() => Promise<void>) | undefined;

  try {
    if (operation.type === 'updateSite') {
    catalog.site = {
      title: requiredText(operation.title, 'Título'),
      brand: requiredText(operation.brand, 'Marca'),
      language: requiredText(operation.language, 'Idioma'),
      defaultTheme: operation.defaultTheme,
    };
  } else if (operation.type === 'createTab') {
    assertId(operation.id, 'ID da aba');
    if (catalog.tabs.some((tab) => tab.id === operation.id)) throw new RepositoryError('invalid-operation', 'Este ID de aba já existe.');
    catalog.tabs.push({ id: operation.id, title: requiredText(operation.title, 'Título da aba'), pages: [] });
  } else if (operation.type === 'renameTab') {
    tabOf(catalog, operation.tabId).title = requiredText(operation.title, 'Título da aba');
  } else if (operation.type === 'renameTabId') {
    assertId(operation.nextId, 'Novo ID da aba');
    if (catalog.tabs.some((tab) => tab.id === operation.nextId)) throw new RepositoryError('invalid-operation', 'Este ID de aba já existe.');
    const tab = tabOf(catalog, operation.tabId);
    tab.id = operation.nextId;
    catalog.aliases.tabs[operation.tabId] = operation.nextId;
    for (const [source, target] of Object.entries(catalog.aliases.tabs)) if (target === operation.tabId) catalog.aliases.tabs[source] = operation.nextId;
  } else if (operation.type === 'moveTab') {
    const currentIndex = catalog.tabs.findIndex((tab) => tab.id === operation.tabId);
    if (currentIndex < 0) throw new RepositoryError('invalid-operation', 'A aba solicitada não existe.');
    const [tab] = catalog.tabs.splice(currentIndex, 1);
    catalog.tabs.splice(Math.max(0, Math.min(operation.index, catalog.tabs.length)), 0, tab);
  } else if (operation.type === 'removeTab') {
    const index = catalog.tabs.findIndex((tab) => tab.id === operation.tabId);
    if (index < 0) throw new RepositoryError('invalid-operation', 'A aba solicitada não existe.');
    if (catalog.tabs[index].pages.length) throw new RepositoryError('invalid-operation', 'Mova ou remova as páginas antes de excluir esta aba.');
    catalog.tabs.splice(index, 1);
    delete catalog.aliases.tabs[operation.tabId];
    for (const [source, target] of Object.entries(catalog.aliases.tabs)) {
      if (target === operation.tabId) delete catalog.aliases.tabs[source];
    }
  } else if (operation.type === 'createPage' || operation.type === 'duplicatePage') {
    assertId(operation.id, 'ID da página');
    if (catalog.pages[operation.id]) throw new RepositoryError('invalid-operation', 'Este ID de página já existe.');
    const tab = tabOf(catalog, operation.tabId);
    const destination = join(normalizedRoot, 'pages', `${operation.id}.md`);
    await mkdir(dirname(destination), { recursive: true });
    const content = operation.type === 'duplicatePage'
      ? await readFile(join(normalizedRoot, pageLocation(catalog, operation.pageId).page.source), 'utf8')
      : `# ${requiredText(operation.title, 'Título da página')}\n\nComece a escrever.\n`;
    await writeFile(destination, content, { encoding: 'utf8', flag: 'wx' }).catch(() => {
      throw new RepositoryError('invalid-operation', 'O arquivo da nova página já existe.');
    });
    rollback = () => rm(destination, { force: true });
    catalog.pages[operation.id] = { title: requiredText(operation.title, 'Título da página'), source: `pages/${operation.id}.md` };
    tab.pages.push(operation.id);
  } else if (operation.type === 'renamePage') {
    pageLocation(catalog, operation.pageId).page.title = requiredText(operation.title, 'Título da página');
  } else if (operation.type === 'movePage') {
    const { tab: sourceTab } = pageLocation(catalog, operation.pageId);
    sourceTab.pages.splice(sourceTab.pages.indexOf(operation.pageId), 1);
    const destinationTab = tabOf(catalog, operation.tabId);
    destinationTab.pages.splice(Math.max(0, Math.min(operation.index, destinationTab.pages.length)), 0, operation.pageId);
  } else if (operation.type === 'renamePageId') {
    assertId(operation.nextId, 'Novo ID da página');
    if (catalog.pages[operation.nextId]) throw new RepositoryError('invalid-operation', 'Este ID de página já existe.');
    const { page, tab, index } = pageLocation(catalog, operation.pageId);
    const extension = page.source.endsWith('.html') ? '.html' : '.md';
    const previousPath = join(normalizedRoot, page.source);
    const nextSource = `pages/${operation.nextId}${extension}`;
    const nextPath = join(normalizedRoot, nextSource);
    await rename(previousPath, nextPath);
    rollback = () => rename(nextPath, previousPath);
    delete catalog.pages[operation.pageId];
    catalog.pages[operation.nextId] = { ...page, source: nextSource };
    tab.pages[index] = operation.nextId;
    catalog.aliases.pages[operation.pageId] = operation.nextId;
    for (const [source, target] of Object.entries(catalog.aliases.pages)) if (target === operation.pageId) catalog.aliases.pages[source] = operation.nextId;
  } else if (operation.type === 'removePage') {
    const { page, tab, index } = pageLocation(catalog, operation.pageId);
    const trashId = `${new Date().toISOString().replaceAll(':', '-')}-${operation.pageId}`;
    const trashDirectory = join(normalizedRoot, '.trash', trashId);
    const previousPath = join(normalizedRoot, page.source);
    const trashedPath = join(trashDirectory, basename(page.source));
    await mkdir(trashDirectory, { recursive: true });
    await rename(previousPath, trashedPath);
    rollback = async () => {
      await rename(trashedPath, previousPath);
      await rm(trashDirectory, { recursive: true, force: true });
    };
    const manifest: TrashManifest = { id: trashId, pageId: operation.pageId, title: page.title, source: page.source, tabId: tab.id, index, trashedAt: new Date().toISOString() };
    await writeFile(join(trashDirectory, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
    tab.pages.splice(index, 1);
    delete catalog.pages[operation.pageId];
    delete catalog.aliases.pages[operation.pageId];
    for (const [source, target] of Object.entries(catalog.aliases.pages)) {
      if (target === operation.pageId) delete catalog.aliases.pages[source];
    }
    cleanup = async () => {};
  } else if (operation.type === 'restorePage') {
    const trashDirectory = join(normalizedRoot, '.trash', basename(operation.trashId));
    const manifest = JSON.parse(await readFile(join(trashDirectory, 'manifest.json'), 'utf8')) as TrashManifest;
    assertId(manifest.pageId, 'ID da página restaurada');
    const expectedSource = `pages/${manifest.pageId}${manifest.source.endsWith('.html') ? '.html' : '.md'}`;
    if (manifest.source !== expectedSource) {
      throw new RepositoryError('invalid-operation', 'A entrada da lixeira possui um caminho inválido.');
    }
    if (catalog.pages[manifest.pageId]) throw new RepositoryError('invalid-operation', 'O ID original já está em uso.');
    const tab = tabOf(catalog, manifest.tabId);
    const destination = join(normalizedRoot, manifest.source);
    const trashedPath = join(trashDirectory, basename(manifest.source));
    await rename(trashedPath, destination);
    rollback = () => rename(destination, trashedPath);
    catalog.pages[manifest.pageId] = { title: manifest.title, source: manifest.source };
    tab.pages.splice(Math.max(0, Math.min(manifest.index, tab.pages.length)), 0, manifest.pageId);
    cleanup = () => rm(trashDirectory, { recursive: true, force: true });
    } else {
      throw new RepositoryError('invalid-operation', 'A operação de configuração não é reconhecida.');
    }
    const result = await writeCatalog(normalizedRoot, catalog, input.revision);
    await cleanup?.();
    return { ...result, trash: await listTrash(normalizedRoot) };
  } catch (error) {
    await rollback?.();
    throw error;
  }
}
