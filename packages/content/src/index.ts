export { parseLegacyHtml } from './legacy/parse-legacy-html.ts';
export { readLegacySite } from './legacy/read-legacy-site.ts';
export type {
  LegacyHeading,
  LegacyPage,
  LegacySite,
  LegacyTab,
} from './legacy/types.ts';
export { parseMarkdown } from './markdown/parse-markdown.ts';
export { serializeMarkdown } from './markdown/serialize-markdown.ts';
export type { ConversionReport } from './migration/convert-legacy-page.ts';
export { convertLegacyPage } from './migration/convert-legacy-page.ts';
export type { EditablePage, RepositoryErrorCode } from './repository/site-repository.ts';
export {
  readEditablePage,
  readSiteCatalog,
  RepositoryError,
  saveEditablePage,
} from './repository/site-repository.ts';
export type {
  DocumentAst,
  DocumentBlock,
  DocumentInline,
  DocumentText,
} from './schema/document.ts';
export { documentSchema, validateDocument } from './schema/document.ts';
export type { SiteCatalog } from './schema/site.ts';
export { siteSchema, validateSiteCatalog } from './schema/site.ts';
