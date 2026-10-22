import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import {
  parseMarkdown,
  RepositoryError,
  readEditablePage,
  saveEditablePage,
} from '../packages/content/src/index.ts';
import {
  applyCatalogOperation,
  listTrash,
  readCatalogState,
} from '../packages/content/src/repository/catalog-repository.ts';
import { documentToTiptap, tiptapToDocument } from '../packages/editor/src/tiptap.ts';

async function installation() {
  const root = await mkdtemp(join(tmpdir(), 'documentation-studio-'));
  await mkdir(join(root, 'pages'));
  await writeFile(
    join(root, 'site.json'),
    JSON.stringify({
      schemaVersion: 1,
      site: { title: 'Teste', brand: 'TESTE' },
      tabs: [{ id: 'guias', title: 'Guias', pages: ['inicio'] }],
      pages: { inicio: { title: 'Início', source: 'pages/inicio.md' } },
    }),
  );
  await writeFile(join(root, 'pages', 'inicio.md'), '# Início\n\nTexto inicial.\n');
  return root;
}

test('repositório salva com backup e uma nova revisão', async (context) => {
  const root = await installation();
  context.after(() => rm(root, { recursive: true, force: true }));
  const opened = await readEditablePage(root, 'inicio');
  const markdown = '# Início\n\nTexto alterado.\n';
  const saved = await saveEditablePage(root, {
    pageId: 'inicio',
    markdown,
    revision: opened.revision,
  });
  assert.notEqual(saved.revision, opened.revision);
  assert.equal(await readFile(join(root, 'pages', 'inicio.md'), 'utf8'), markdown);
  const revisions = await readdir(join(root, '.revisions', 'inicio'));
  assert.equal(revisions.length, 1);
  assert.equal(
    await readFile(join(root, '.revisions', 'inicio', revisions[0]), 'utf8'),
    opened.markdown,
  );
});

test('repositório recusa conflito e não substitui mudança concorrente', async (context) => {
  const root = await installation();
  context.after(() => rm(root, { recursive: true, force: true }));
  const opened = await readEditablePage(root, 'inicio');
  await writeFile(join(root, 'pages', 'inicio.md'), '# Concorrente\n');
  await assert.rejects(
    saveEditablePage(root, {
      pageId: 'inicio',
      markdown: '# Minha versão\n',
      revision: opened.revision,
    }),
    (error) => error instanceof RepositoryError && error.code === 'revision-conflict',
  );
  assert.equal(await readFile(join(root, 'pages', 'inicio.md'), 'utf8'), '# Concorrente\n');
});

test('repositório resolve somente páginas Markdown cadastradas', async (context) => {
  const root = await installation();
  context.after(() => rm(root, { recursive: true, force: true }));
  await assert.rejects(
    readEditablePage(root, '../segredo'),
    (error) => error instanceof RepositoryError && error.code === 'page-not-found',
  );
});

test('AST faz ida e volta pelo adaptador Tiptap do conjunto editável', () => {
  const document = parseMarkdown(
    '# Título\n\nTexto **forte**, _ênfase_, :u[sublinhado] e [link](https://example.com).\n\n- [ ] Tarefa\n\n> Citação\n\n```js\nconst valor = 1;\n```\n',
  );
  assert.deepEqual(tiptapToDocument(documentToTiptap(document)), document);
});

test('blocos avançados fazem ida e volta pelo adaptador Tiptap', () => {
  const document = parseMarkdown(`# Recursos

| Nome | Estado |
| --- | --- |
| Guia | Pronto |

:::callout{tone=warning title="Atenção"}
Revise.
:::

::::columns
:::column
Uma.
:::
:::column
Duas.
:::
::::

::date{value="2026-10-22" label="Publicação"}
`);
  assert.deepEqual(tiptapToDocument(documentToTiptap(document)), document);
});

test('catálogo cria, ordena, move, duplica, cria alias e restaura página', async (context) => {
  const root = await installation();
  context.after(() => rm(root, { recursive: true, force: true }));
  let state = await readCatalogState(root);
  const apply = async (operation) => {
    const result = await applyCatalogOperation(root, { revision: state.revision, operation });
    state = { catalog: result.catalog, revision: result.revision };
    return result;
  };

  await apply({ type: 'createTab', id: 'referencia', title: 'Referência' });
  await apply({ type: 'moveTab', tabId: 'referencia', index: 0 });
  await apply({ type: 'createPage', tabId: 'referencia', id: 'api', title: 'API' });
  assert.match(await readFile(join(root, 'pages', 'api.md'), 'utf8'), /^# API/);
  await apply({ type: 'renamePage', pageId: 'api', title: 'API pública' });
  await apply({ type: 'renamePageId', pageId: 'api', nextId: 'api-publica' });
  assert.equal(state.catalog.aliases.pages.api, 'api-publica');
  assert.equal(state.catalog.pages['api-publica'].source, 'pages/api-publica.md');
  await apply({
    type: 'duplicatePage',
    pageId: 'api-publica',
    tabId: 'guias',
    id: 'api-copia',
    title: 'API cópia',
  });
  await apply({ type: 'movePage', pageId: 'api-copia', tabId: 'referencia', index: 0 });
  await apply({ type: 'renameTabId', tabId: 'referencia', nextId: 'referencias' });
  assert.equal(state.catalog.aliases.tabs.referencia, 'referencias');

  await apply({ type: 'removePage', pageId: 'api-copia' });
  const [trash] = await listTrash(root);
  assert.equal(trash.pageId, 'api-copia');
  await apply({ type: 'restorePage', trashId: trash.id });
  assert.equal(state.catalog.pages['api-copia'].title, 'API cópia');
  assert.equal((await listTrash(root)).length, 0);
  assert.ok((await readdir(join(root, '.revisions', 'catalog'))).length >= 1);
});

test('catálogo recusa revisão antiga, ID duplicado e remoção de aba ocupada', async (context) => {
  const root = await installation();
  context.after(() => rm(root, { recursive: true, force: true }));
  const state = await readCatalogState(root);
  const changed = await applyCatalogOperation(root, {
    revision: state.revision,
    operation: { type: 'renamePage', pageId: 'inicio', title: 'Começo' },
  });
  await assert.rejects(
    applyCatalogOperation(root, {
      revision: state.revision,
      operation: { type: 'createTab', id: 'nova', title: 'Nova' },
    }),
    (error) => error instanceof RepositoryError && error.code === 'revision-conflict',
  );
  await assert.rejects(
    applyCatalogOperation(root, {
      revision: changed.revision,
      operation: { type: 'createPage', tabId: 'guias', id: 'inicio', title: 'Duplicada' },
    }),
    (error) => error instanceof RepositoryError && error.code === 'invalid-operation',
  );
  await assert.rejects(
    applyCatalogOperation(root, {
      revision: changed.revision,
      operation: { type: 'removeTab', tabId: 'guias' },
    }),
    (error) => error instanceof RepositoryError && error.code === 'invalid-operation',
  );
});

test('catálogo vazio é utilizável e catálogo manual inválido é rejeitado', async (context) => {
  const root = await installation();
  context.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(
    join(root, 'site.json'),
    JSON.stringify({
      schemaVersion: 1,
      site: { title: 'Vazio', brand: 'VAZIO' },
      tabs: [],
      pages: {},
    }),
  );
  const empty = await readCatalogState(root);
  assert.deepEqual(empty.catalog.tabs, []);
  assert.deepEqual(empty.catalog.pages, {});

  await writeFile(
    join(root, 'site.json'),
    JSON.stringify({
      schemaVersion: 1,
      site: { title: 'Inválido', brand: 'ERRO' },
      tabs: [
        { id: 'repetida', title: 'Uma', pages: [] },
        { id: 'repetida', title: 'Duas', pages: [] },
      ],
      pages: {},
    }),
  );
  await assert.rejects(
    readCatalogState(root),
    (error) => error instanceof RepositoryError && error.code === 'invalid-catalog',
  );
});
