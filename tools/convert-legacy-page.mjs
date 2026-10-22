import path from 'node:path';
import { convertLegacyPage } from '@documentation-page/content';

const arguments_ = process.argv.slice(2);
const option = (name) => {
  const index = arguments_.indexOf(name);
  return index >= 0 ? arguments_[index + 1] : undefined;
};
const source = option('--source');
const target = option('--target');

if (!source || !target) {
  throw new Error(
    'Use --source caminho/pagina.html --target caminho/pagina.md. Acrescente --apply para gravar.',
  );
}

const report = await convertLegacyPage({
  apply: arguments_.includes('--apply'),
  backupDirectory: option('--backup-directory'),
  sourcePath: path.resolve(source),
  targetPath: path.resolve(target),
});

console.log(
  JSON.stringify(
    {
      applied: report.applied,
      backupPath: report.backupPath,
      blockCount: report.blockCount,
      headingCount: report.headingCount,
      issues: report.issues,
      sourcePath: report.sourcePath,
      targetPath: report.targetPath,
      preview: report.markdown,
    },
    null,
    2,
  ),
);
