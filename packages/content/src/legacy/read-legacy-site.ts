import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'node-html-parser';
import { validateConfig } from '../../../../js/config-validation.js';
import { buildHeadingEntries } from '../../../../js/headings.js';
import type { LegacyHeading, LegacyPage, LegacySite } from './types';

function assertInsideDirectory(directory: string, filePath: string) {
  const relativePath = path.relative(directory, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error(`O arquivo ${filePath} está fora da pasta permitida.`);
  }
}

function prepareHtml(html: string) {
  const root = parse(html);
  const headingElements = root.querySelectorAll('h1, h2, h3');
  const headingSet = new Set(headingElements);
  const reservedIds = root
    .querySelectorAll('[id]')
    .filter((element) => !headingSet.has(element))
    .map((element) => element.id)
    .filter(Boolean);
  const { entries, issues } = buildHeadingEntries(
    headingElements.map((element) => ({
      id: element.id,
      level: Number(element.tagName.slice(1)),
      text: element.textContent,
    })),
    { reservedIds },
  );

  entries.forEach((entry, index) => headingElements[index].setAttribute('id', entry.id));
  root.querySelectorAll('[src]').forEach((element) => {
    const source = element.getAttribute('src');
    const assetPrefixes = ['../assets/', './examples/assets/', './site/assets/'];
    const prefix = assetPrefixes.find((candidate) => source?.startsWith(candidate));
    if (source && prefix) {
      element.setAttribute('src', `/legacy-assets/${source.slice(prefix.length)}`);
    }
  });

  return {
    headings: entries as LegacyHeading[],
    html: root.toString(),
    issues,
  };
}

export async function readLegacySite(
  projectRoot: string,
  input: { configuration: unknown; source: 'examples' | 'site' },
): Promise<LegacySite> {
  const absoluteRoot = path.resolve(projectRoot);
  const { configuration, source } = input;
  const sourceDirectory = path.join(absoluteRoot, source);
  const { appSettings, docsConfig } = validateConfig(configuration);
  const pagesDirectory = path.join(sourceDirectory, 'pages');

  const tabs = await Promise.all(
    docsConfig.map(async (tab) => ({
      id: tab.id,
      title: tab.title,
      pages: await Promise.all(
        tab.pages.map(async (page): Promise<LegacyPage> => {
          const pagePath = path.resolve(pagesDirectory, page.file);
          assertInsideDirectory(pagesDirectory, pagePath);
          const prepared = prepareHtml(await readFile(pagePath, 'utf8'));
          return { ...page, ...prepared };
        }),
      ),
    })),
  );

  return { appSettings, source, sourceDirectory, tabs };
}
