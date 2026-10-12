import assert from 'node:assert/strict';
import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';

const projectRoot = path.resolve(import.meta.dirname, '..');

async function markdownFiles(directory) {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
    .map((entry) => path.join(entry.parentPath, entry.name));
}

test('todos os links locais da documentação apontam para arquivos existentes', async () => {
  const files = [
    path.join(projectRoot, 'AGENTS.md'),
    path.join(projectRoot, 'CHANGELOG.md'),
    path.join(projectRoot, 'README.md'),
    ...(await markdownFiles(path.join(projectRoot, 'docs'))),
  ];

  for (const file of files) {
    const markdown = await readFile(file, 'utf8');
    const links = markdown.matchAll(/!?(?:\[[^\]]*\])\(([^)]+)\)/g);

    for (const [, rawTarget] of links) {
      const target = rawTarget.trim().split('#')[0];
      if (!target || /^(?:https?:|mailto:)/i.test(target)) continue;

      const decodedTarget = decodeURIComponent(target.replace(/^<|>$/g, ''));
      const absoluteTarget = path.resolve(path.dirname(file), decodedTarget);
      await assert.doesNotReject(
        access(absoluteTarget),
        `${path.relative(projectRoot, file)} aponta para ${target}, que não existe`,
      );
    }
  }
});
