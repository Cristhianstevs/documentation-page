import { mkdir, stat, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export async function createStudioSite(baseDirectory = process.cwd()) {
  const root = resolve(baseDirectory, 'site');
  try {
    await stat(root);
    throw new Error('A pasta site/ já existe. Nada foi alterado.');
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  await mkdir(resolve(root, 'pages'), { recursive: true });
  await writeFile(
    resolve(root, 'site.json'),
    `${JSON.stringify(
      {
        schemaVersion: 1,
        site: {
          title: 'Minha documentação',
          brand: 'DOCS',
          language: 'pt-BR',
          defaultTheme: 'system',
        },
        tabs: [{ id: 'guias', title: 'Guias', pages: ['inicio'] }],
        pages: { inicio: { title: 'Início', source: 'pages/inicio.md' } },
      },
      null,
      2,
    )}\n`,
  );
  await writeFile(
    resolve(root, 'pages/inicio.md'),
    '# Minha documentação\n\nComece a escrever usando o estúdio local.\n',
  );
  console.log('Instalação Markdown criada em site/. Execute npm run studio:dev para editar.');
}

const isDirectExecution =
  process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url;
if (isDirectExecution) {
  createStudioSite().catch((error) => {
    console.error(error instanceof Error ? error.message : 'Não foi possível criar a instalação.');
    process.exitCode = 1;
  });
}
