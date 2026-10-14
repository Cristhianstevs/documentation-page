import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { createSite } from '../tools/create-site.mjs';

test('cria uma instalação mínima e não sobrescreve uma pasta site existente', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'documentation-page-'));

  try {
    await createSite(directory);
    assert.match(await readFile(join(directory, 'site/config.js'), 'utf8'), /docsConfig/);
    assert.match(await readFile(join(directory, 'site/pages/inicio.html'), 'utf8'), /<h1>/);

    await assert.rejects(createSite(directory), /Nada foi alterado/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
