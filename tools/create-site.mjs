import { access, cp, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = fileURLToPath(new URL('../examples/starter/', import.meta.url));

export async function createSite(projectRoot = process.cwd()) {
  const destination = join(projectRoot, 'site');

  try {
    await access(destination);
    throw new Error('A pasta site já existe. Nada foi alterado.');
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }

  await cp(source, destination, { recursive: true, errorOnExist: true });
  await mkdir(join(destination, 'assets'), { recursive: true });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    await createSite();
    console.log('Pasta site criada. Execute npm start e abra http://127.0.0.1:4173.');
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
