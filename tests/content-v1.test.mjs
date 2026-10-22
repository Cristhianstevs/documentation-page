import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {
  convertLegacyPage,
  parseLegacyHtml,
  parseMarkdown,
  serializeMarkdown,
  validateDocument,
  validateSiteCatalog,
} from '../packages/content/src/index.ts';
import { roundTripDocument } from '../packages/editor/src/index.ts';
import { renderDocumentToHtml } from '../packages/renderer/src/index.ts';

const richMarkdown = `# Guia

Texto com **negrito**, _itálico_, :u[sublinhado], ~~riscado~~, \`código\` e [link](https://example.com).

- [ ] Preparar
- [x] Publicar

> Uma citação.

\`\`\`js
const exemplo = true;
\`\`\`

| Item | Estado |
| :--- | ---: |
| Guia | Pronto |

---

![Mapa](./assets/mapa.svg)

:::callout{tone=warning title="Atenção"}
Revise antes de publicar.
:::

:::toggle{title="Mais detalhes"}
Conteúdo recolhível.
:::
`;

test('schemas v1 validam catálogo, caminhos e referências', () => {
  const catalog = validateSiteCatalog({
    schemaVersion: 1,
    site: { title: 'Guia', brand: 'DOCS' },
    tabs: [{ id: 'guias', title: 'Guias', pages: ['inicio'] }],
    pages: { inicio: { title: 'Início', source: 'pages/inicio.md' } },
  });
  assert.equal(catalog.site.language, 'pt-BR');
  assert.throws(() =>
    validateSiteCatalog({
      schemaVersion: 1,
      site: { title: 'Guia', brand: 'DOCS' },
      tabs: [{ id: 'guias', title: 'Guias', pages: ['ausente'] }],
      pages: {},
    }),
  );
});

test('fixture v1 permanece legível e validada fora do editor', async () => {
  const catalog = validateSiteCatalog(
    JSON.parse(await readFile('tests/fixtures/content-v1/site.json', 'utf8')),
  );
  const markdown = await readFile(
    path.join('tests/fixtures/content-v1', catalog.pages.inicio.source),
    'utf8',
  );
  const document = parseMarkdown(markdown);
  assert.equal(document.children[0].type, 'heading');
  assert.match(renderDocumentToHtml(document), /Ambiente de teste/);
});

test('Markdown v1 cobre GFM, diretivas e renderiza HTML seguro', () => {
  const document = parseMarkdown(richMarkdown);
  const types = new Set(document.children.map((block) => block.type));
  for (const type of [
    'heading',
    'paragraph',
    'list',
    'quote',
    'code',
    'table',
    'thematicBreak',
    'image',
    'callout',
    'toggle',
  ]) {
    assert.equal(types.has(type), true, `Bloco ausente: ${type}`);
  }
  const html = renderDocumentToHtml(document);
  assert.match(html, /<h1 id="guia">Guia<\/h1>/);
  assert.match(html, /class="callout warning"/);
  assert.doesNotMatch(html, /javascript:/i);
  validateDocument(document);
});

test('Markdown preserva o significado depois de serializar e abrir novamente', () => {
  const first = parseMarkdown(richMarkdown);
  const second = parseMarkdown(serializeMarkdown(first));
  assert.deepEqual(second, first);
});

test('HTML legado entra no AST permitido sem executar conteúdo ativo', () => {
  const result = parseLegacyHtml(
    '<h1>Guia</h1><p><strong>Seguro</strong></p><script>alert(1)</script><details><summary>Ajuda</summary><p>Texto</p></details>',
  );
  assert.deepEqual(
    result.document.children.map((block) => block.type),
    ['heading', 'paragraph', 'toggle'],
  );
  assert.match(result.issues.join(' '), /script/);
  assert.doesNotMatch(renderDocumentToHtml(result.document), /alert/);
});

test('conversor faz prévia e somente grava com backup explícito', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'documentation-page-conversion-'));
  const sourcePath = path.join(directory, 'pagina.html');
  const targetPath = path.join(directory, 'pagina.md');
  await import('node:fs/promises').then(({ writeFile }) =>
    writeFile(sourcePath, '<h1>Guia</h1><p>Conteúdo.</p>', 'utf8'),
  );
  const preview = await convertLegacyPage({ sourcePath, targetPath });
  assert.equal(preview.applied, false);
  await assert.rejects(readFile(targetPath, 'utf8'));

  const applied = await convertLegacyPage({
    apply: true,
    backupDirectory: path.join(directory, '.revisions'),
    sourcePath,
    targetPath,
  });
  assert.equal(applied.applied, true);
  assert.equal(await readFile(applied.backupPath, 'utf8'), await readFile(sourcePath, 'utf8'));
  assert.match(await readFile(targetPath, 'utf8'), /^# Guia/m);
});

test('AST suportada faz ida e volta pelo Lexical sem perda semântica', () => {
  const document = parseMarkdown(`# Título

Texto com **negrito**, _itálico_, :u[sublinhado] e ~~riscado~~.

1. Primeiro
2. Segundo

- Marcador

- [ ] Pendente
- [x] Concluído

\`\`\`js
const teste = true;
\`\`\`
`);
  assert.deepEqual(roundTripDocument(document), document);
});

test('experimento processa 5.000 blocos dentro do orçamento', () => {
  const document = {
    schemaVersion: 1,
    children: Array.from({ length: 5_000 }, (_, index) => ({
      type: 'paragraph',
      children: [{ type: 'text', value: `Bloco ${index + 1}`, marks: [] }],
    })),
  };
  const startedAt = performance.now();
  const result = roundTripDocument(document);
  const duration = performance.now() - startedAt;
  assert.equal(result.children.length, 5_000);
  assert.ok(duration < 5_000, `Round-trip demorou ${Math.round(duration)} ms.`);
});

test('o leitor não depende do Lexical', async () => {
  const readerPackage = JSON.parse(await readFile('apps/reader/package.json', 'utf8'));
  assert.equal(
    Object.keys(readerPackage.dependencies).some((dependency) => dependency.includes('lexical')),
    false,
  );
});
