import { access, copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseLegacyHtml } from '../legacy/parse-legacy-html.ts';
import { serializeMarkdown } from '../markdown/serialize-markdown.ts';

export type ConversionReport = {
  applied: boolean;
  backupPath?: string;
  blockCount: number;
  headingCount: number;
  issues: string[];
  markdown: string;
  sourcePath: string;
  targetPath: string;
};

async function exists(filePath: string) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function convertLegacyPage(options: {
  apply?: boolean;
  backupDirectory?: string;
  sourcePath: string;
  targetPath: string;
}): Promise<ConversionReport> {
  const sourcePath = path.resolve(options.sourcePath);
  const targetPath = path.resolve(options.targetPath);
  if (path.extname(sourcePath) !== '.html')
    throw new Error('A origem precisa ser um arquivo .html.');
  if (path.extname(targetPath) !== '.md') throw new Error('O destino precisa ser um arquivo .md.');
  if (sourcePath === targetPath) throw new Error('Origem e destino precisam ser diferentes.');

  const html = await readFile(sourcePath, 'utf8');
  const { document, issues } = parseLegacyHtml(html);
  const markdown = serializeMarkdown(document);
  const report: ConversionReport = {
    applied: false,
    blockCount: document.children.length,
    headingCount: document.children.filter((block) => block.type === 'heading').length,
    issues,
    markdown,
    sourcePath,
    targetPath,
  };

  if (!options.apply) return report;
  if (await exists(targetPath)) throw new Error(`O destino já existe: ${targetPath}.`);

  const backupDirectory = path.resolve(
    options.backupDirectory ?? path.join(path.dirname(sourcePath), '..', '.revisions'),
  );
  await mkdir(backupDirectory, { recursive: true });
  const backupPath = path.join(backupDirectory, `${path.basename(sourcePath)}.backup`);
  if (await exists(backupPath)) throw new Error(`O backup já existe: ${backupPath}.`);
  await copyFile(sourcePath, backupPath);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, markdown, { encoding: 'utf8', flag: 'wx' });

  return { ...report, applied: true, backupPath };
}
