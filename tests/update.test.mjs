import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { cp, mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { validateConfig } from '../js/load-site.js';
import { resolveRoute } from '../js/routes.js';

const projectRoot = path.resolve(import.meta.dirname, '..');
const fixturesRoot = path.join(import.meta.dirname, 'fixtures', 'installations');

async function directoryFingerprint(directory) {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(entry.parentPath, entry.name))
    .sort();
  const hash = createHash('sha256');
  for (const file of files) {
    hash.update(path.relative(directory, file));
    hash.update(await readFile(file));
  }
  return hash.digest('hex');
}

async function copyThemeFiles(destination) {
  const themePaths = ['css', 'js', 'index.html'];
  for (const relativePath of themePaths) {
    const target = path.join(destination, relativePath);
    await mkdir(path.dirname(target), { recursive: true });
    await cp(path.join(projectRoot, relativePath), target, { recursive: true });
  }
}

for (const fixtureName of ['pesca', 'culinaria']) {
  test(`atualização e reversão preservam a instalação fictícia ${fixtureName}`, async () => {
    const temporaryRoot = await mkdtemp(path.join(tmpdir(), `documentation-page-${fixtureName}-`));
    const installation = path.join(temporaryRoot, 'site');
    const backup = path.join(temporaryRoot, 'backup-site');
    try {
      await writeFile(path.join(temporaryRoot, 'index.html'), '<p>tema anterior</p>');
      await cp(path.join(fixturesRoot, fixtureName), installation, { recursive: true });
      await cp(installation, backup, { recursive: true });
      const originalFingerprint = await directoryFingerprint(installation);

      await copyThemeFiles(temporaryRoot);
      assert.equal(await directoryFingerprint(installation), originalFingerprint);

      const configUrl = `${pathToFileURL(path.join(installation, 'config.js')).href}?test=${Date.now()}`;
      const configuration = validateConfig(await import(configUrl));
      const firstSection = configuration.docsConfig[0];
      const firstPage = firstSection.pages[0];
      const route = resolveRoute(configuration.docsConfig, {
        type: 'target',
        sectionId: firstSection.id,
        pageId: firstPage.id,
      });
      assert.equal(route.status, 'page');

      await writeFile(path.join(installation, 'custom.css'), 'alteração acidental');
      await rm(installation, { recursive: true });
      await cp(backup, installation, { recursive: true });
      assert.equal(await directoryFingerprint(installation), originalFingerprint);
    } finally {
      await rm(temporaryRoot, { recursive: true, force: true });
    }
  });
}
