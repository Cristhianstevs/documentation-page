import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { validateConfig } from '../js/load-site.js';

const projectRoot = path.resolve(import.meta.dirname, '..');
const referenceSite = path.join(
  projectRoot,
  'tests',
  'fixtures',
  'migration',
  'reference-site',
  'site',
);

test('a instalação de referência mantém o contrato mínimo da migração', async () => {
  const configPath = path.join(referenceSite, 'config.js');
  const configUrl = `${pathToFileURL(configPath).href}?test=${Date.now()}`;
  const configuration = validateConfig(await import(configUrl));

  assert.equal(configuration.docsConfig.length, 2);
  assert.equal(configuration.docsConfig.flatMap((section) => section.pages).length, 3);

  for (const section of configuration.docsConfig) {
    for (const page of section.pages) {
      const pagePath = path.join(referenceSite, 'pages', page.file);
      await assert.doesNotReject(access(pagePath), `${page.file} precisa existir`);
      assert.match(await readFile(pagePath, 'utf8'), /<h1>[^<]+<\/h1>/);
    }
  }

  const allContent = await Promise.all(
    configuration.docsConfig
      .flatMap((section) => section.pages)
      .map((page) => readFile(path.join(referenceSite, 'pages', page.file), 'utf8')),
  );
  const joinedContent = allContent.join('\n');
  for (const expectedPattern of [
    /<table>/,
    /<pre data-language=/,
    /<details>/,
    /class="task-list"/,
    /class="callout /,
    /<img [^>]*alt="[^"]+"/,
  ]) {
    assert.match(joinedContent, expectedPattern);
  }
});
