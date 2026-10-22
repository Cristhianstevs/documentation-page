import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const destination = resolve('test-results/studio-site');
await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });
await cp(resolve('tests/fixtures/content-v1'), destination, { recursive: true });
await writeFile(
  resolve(destination, 'pages/inicio.md'),
  '# Guia de hospedagem\n\nDocumento básico para validar a edição visual.\n\n- Primeiro item\n- Segundo item\n',
);
console.log(`Instalação de teste preparada em ${destination}.`);
