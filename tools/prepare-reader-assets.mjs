import { access, cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const readerDirectory = path.resolve(process.cwd());
const projectRoot = process.env.READER_CONTENT_ROOT
  ? path.resolve(process.env.READER_CONTENT_ROOT)
  : path.resolve(readerDirectory, '../..');
const localConfig = path.join(projectRoot, 'site', 'config.js');

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

const source = (await exists(localConfig)) ? 'site' : 'examples';
const sourceDirectory = path.join(projectRoot, source);
const configPath = path.join(sourceDirectory, 'config.js');
const configuration = await import(`${pathToFileURL(configPath).href}?updated=${Date.now()}`);
const publicDirectory = path.join(readerDirectory, 'public');
const assetTarget = path.join(publicDirectory, 'legacy-assets');

if (path.dirname(assetTarget) !== publicDirectory) {
  throw new Error('O destino dos assets saiu da pasta pública do leitor.');
}

await mkdir(publicDirectory, { recursive: true });
await rm(assetTarget, { recursive: true, force: true });
const assetSource = path.join(sourceDirectory, 'assets');
if (await exists(assetSource)) await cp(assetSource, assetTarget, { recursive: true });

const customCssSource = path.join(sourceDirectory, 'custom.css');
const customCss = (await exists(customCssSource)) ? await readFile(customCssSource, 'utf8') : '';
await writeFile(path.join(publicDirectory, 'legacy-custom.css'), customCss, 'utf8');

const generatedDirectory = path.join(readerDirectory, 'generated');
await mkdir(generatedDirectory, { recursive: true });
await writeFile(
  path.join(generatedDirectory, 'legacy-config.json'),
  `${JSON.stringify({ configuration, projectRoot, source }, null, 2)}\n`,
  'utf8',
);

console.log(`Conteúdo do leitor preparado a partir de ${source}/.`);
