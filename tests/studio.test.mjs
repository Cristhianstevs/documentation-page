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
