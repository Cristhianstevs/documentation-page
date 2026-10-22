import { createHash, randomUUID } from 'node:crypto';
import { copyFile, mkdir, readFile, rename, rm, stat, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve, sep } from 'node:path';
import { parseMarkdown } from '../markdown/parse-markdown.ts';
import { validateSiteCatalog, type SiteCatalog } from '../schema/site.ts';

const MAX_DOCUMENT_BYTES = 2 * 1024 * 1024;

export type RepositoryErrorCode =
  | 'catalog-not-found'
  | 'invalid-catalog'
  | 'page-not-found'
  | 'unsupported-source'
  | 'document-not-found'
  | 'document-too-large'
  | 'invalid-document'
  | 'invalid-operation'
  | 'revision-conflict';

export class RepositoryError extends Error {
  readonly code: RepositoryErrorCode;

  constructor(code: RepositoryErrorCode, message: string) {
    super(message);
    this.name = 'RepositoryError';
    this.code = code;
  }
}

export type EditablePage = {
  pageId: string;
  title: string;
  markdown: string;
  revision: string;
};

const revisionOf = (markdown: string) =>
  createHash('sha256').update(markdown, 'utf8').digest('hex');

function inside(root: string, candidate: string) {
  const path = relative(root, candidate);
  return path === '' || (!path.startsWith(`..${sep}`) && path !== '..' && !path.includes(':'));
}

function pagePath(root: string, catalog: SiteCatalog, pageId: string) {
  const page = catalog.pages[pageId];
  if (!page) throw new RepositoryError('page-not-found', 'A página solicitada não está no catálogo.');
  if (!page.source.endsWith('.md')) {
    throw new RepositoryError(
      'unsupported-source',
      'Esta página ainda usa HTML legado. Converta-a para Markdown antes de editar.',
    );
  }
  const candidate = resolve(root, page.source);
  if (!inside(root, candidate)) {
    throw new RepositoryError('invalid-catalog', 'O catálogo aponta para fora da instalação.');
  }
  return { candidate, page };
}

export async function readSiteCatalog(root: string): Promise<SiteCatalog> {
  let source: string;
  try {
    source = await readFile(join(resolve(root), 'site.json'), 'utf8');
  } catch {
    throw new RepositoryError('catalog-not-found', 'O arquivo site.json não foi encontrado.');
  }
  try {
    return validateSiteCatalog(JSON.parse(source));
  } catch {
    throw new RepositoryError('invalid-catalog', 'O arquivo site.json não segue o formato v1.');
  }
}

export async function readEditablePage(root: string, pageId: string): Promise<EditablePage> {
  const normalizedRoot = resolve(root);
  const catalog = await readSiteCatalog(normalizedRoot);
  const { candidate, page } = pagePath(normalizedRoot, catalog, pageId);
  let metadata;
  let markdown: string;
  try {
    [metadata, markdown] = await Promise.all([stat(candidate), readFile(candidate, 'utf8')]);
  } catch {
    throw new RepositoryError('document-not-found', 'O arquivo Markdown da página não foi encontrado.');
  }
  if (metadata.size > MAX_DOCUMENT_BYTES) {
    throw new RepositoryError('document-too-large', 'O documento excede o limite de 2 MiB.');
  }
  try {
    parseMarkdown(markdown);
  } catch {
    throw new RepositoryError('invalid-document', 'O documento Markdown não segue o formato v1.');
  }
  return { pageId, title: page.title, markdown, revision: revisionOf(markdown) };
}

export async function saveEditablePage(
  root: string,
  input: { pageId: string; markdown: string; revision: string },
) {
  if (Buffer.byteLength(input.markdown, 'utf8') > MAX_DOCUMENT_BYTES) {
    throw new RepositoryError('document-too-large', 'O documento excede o limite de 2 MiB.');
  }
  try {
    parseMarkdown(input.markdown);
  } catch {
    throw new RepositoryError('invalid-document', 'O documento Markdown não segue o formato v1.');
  }

  const normalizedRoot = resolve(root);
  const catalog = await readSiteCatalog(normalizedRoot);
  const { candidate } = pagePath(normalizedRoot, catalog, input.pageId);
  let previous: string;
  try {
    previous = await readFile(candidate, 'utf8');
  } catch {
    throw new RepositoryError('document-not-found', 'O arquivo Markdown da página não foi encontrado.');
  }
  if (revisionOf(previous) !== input.revision) {
    throw new RepositoryError(
      'revision-conflict',
      'A página mudou desde que foi aberta. Recarregue antes de salvar.',
    );
  }

  const revisionDirectory = join(normalizedRoot, '.revisions', input.pageId);
  await mkdir(revisionDirectory, { recursive: true });
  const stamp = new Date().toISOString().replaceAll(':', '-');
  const backup = join(revisionDirectory, `${stamp}-${basename(candidate)}`);
  const temporary = join(dirname(candidate), `.${basename(candidate)}.${randomUUID()}.tmp`);
  await copyFile(candidate, backup);
  try {
    await writeFile(temporary, input.markdown, { encoding: 'utf8', flag: 'wx' });
    const current = await readFile(candidate, 'utf8');
    if (revisionOf(current) !== input.revision) {
      throw new RepositoryError(
        'revision-conflict',
        'A página mudou durante o salvamento. Nenhum conteúdo foi substituído.',
      );
    }
    await rename(temporary, candidate);
  } catch (error) {
    await rm(temporary, { force: true });
    throw error;
  }

  return {
    revision: revisionOf(input.markdown),
    backup: relative(normalizedRoot, backup).replaceAll('\\', '/'),
  };
}
