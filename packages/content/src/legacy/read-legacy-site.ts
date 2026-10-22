import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'node-html-parser';
import { validateConfig } from '../../../../js/config-validation.js';
import { buildHeadingEntries } from '../../../../js/headings.js';
import { parseLegacyHtml } from './parse-legacy-html.ts';
import type { LegacyHeading, LegacyPage, LegacySite } from './types.ts';

function assertInsideDirectory(directory: string, filePath: string) {
  const relativePath = path.relative(directory, filePath);
  if (relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    throw new Error(`O arquivo ${filePath} está fora da pasta permitida.`);
  }
}

function prepareHtml(html: string, routes: Set<string>) {
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
  root.querySelectorAll('a[href]').forEach((element) => {
    const href = element.getAttribute('href');
    const match = href?.match(/^#([^/]+)\/([^/]+)(?:\/(.+))?$/);
    if (!match || !routes.has(`${match[1]}/${match[2]}`)) return;
    const heading = match[3] ? `#${encodeURIComponent(match[3])}` : '';
    element.setAttribute('href', `/${match[1]}/${match[2]}/${heading}`);
  });
  const legacyAst = parseLegacyHtml(root.toString());

  return {
    document: legacyAst.document,
    headings: entries as LegacyHeading[],
    html: root.toString(),
    issues,
    migrationIssues: legacyAst.issues,
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
  const routes = new Set(
    docsConfig.flatMap((tab) => tab.pages.map((page) => `${tab.id}/${page.id}`)),
  );

  const tabs = await Promise.all(
    docsConfig.map(async (tab) => ({
      id: tab.id,
      title: tab.title,
      pages: await Promise.all(
        tab.pages.map(async (page): Promise<LegacyPage> => {
          const pagePath = path.resolve(pagesDirectory, page.file);
          assertInsideDirectory(pagesDirectory, pagePath);
          const prepared = prepareHtml(await readFile(pagePath, 'utf8'), routes);
          return { ...page, ...prepared };
        }),
      ),
    })),
  );

  return { appSettings, source, sourceDirectory, tabs };
}
