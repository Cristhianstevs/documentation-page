import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const readProjectFile = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('o experimento do leitor mantém TypeScript estrito e exportação estática', async () => {
  const [configuration, typescript, route] = await Promise.all([
    readProjectFile('apps/reader/next.config.ts'),
    readProjectFile('apps/reader/tsconfig.json'),
    readProjectFile('apps/reader/app/[tabId]/[pageId]/page.tsx'),
  ]);
  const compilerOptions = JSON.parse(typescript).compilerOptions;

  assert.match(configuration, /output:\s*'export'/);
  assert.equal(compilerOptions.strict, true);
  assert.match(route, /generateStaticParams/);
  assert.doesNotMatch(route, /['"]use client['"]/);
});

test('o leitor usa o adaptador legado sem colocar parser no componente visual', async () => {
  const [page, adapter] = await Promise.all([
    readProjectFile('apps/reader/app/[tabId]/[pageId]/page.tsx'),
    readProjectFile('packages/content/src/legacy/read-legacy-site.ts'),
  ]);

  assert.match(page, /legacySitePromise/);
  assert.match(adapter, /validateConfig/);
  assert.match(adapter, /readFile\(pagePath, 'utf8'\)/);
  assert.doesNotMatch(page, /node-html-parser/);
});
