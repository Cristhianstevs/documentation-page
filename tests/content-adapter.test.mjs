import assert from 'node:assert/strict';
import test from 'node:test';
import { readLegacySite } from '../packages/content/src/legacy/read-legacy-site.ts';
import * as configuration from './fixtures/migration/reference-site/site/config.js';

test('o adaptador lê a instalação legada sem alterar seus arquivos', async () => {
  const site = await readLegacySite('./tests/fixtures/migration/reference-site', {
    configuration,
    source: 'site',
  });
  const pages = site.tabs.flatMap((tab) => tab.pages);
  const startPage = site.tabs[0].pages[0];
  const componentsPage = site.tabs[1].pages[0];

  assert.equal(site.tabs.length, 2);
  assert.equal(pages.length, 3);
  assert.deepEqual(
    startPage.headings.map((heading) => heading.id),
    ['guia-de-hospedagem', 'primeiros-passos', 'informacoes-uteis', 'informacoes-uteis-2'],
  );
  assert.match(componentsPage.html, /src="\/legacy-assets\/mapa-ficticio\.svg"/);
});
