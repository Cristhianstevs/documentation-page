import type { DocumentAst, DocumentBlock } from '@documentation-page/content/document';
import { validateDocument } from '@documentation-page/content/document';
import { parseLegacyHtml } from '@documentation-page/content/legacy-html';
import { parseMarkdown, serializeMarkdown } from '@documentation-page/content/markdown';
import JSZip from 'jszip';
import mammoth from 'mammoth';

export const MAX_IMPORT_BYTES = 1024 * 1024;
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const supportedTypes = new Map([
  ['text/markdown', 'markdown'],
  ['text/plain', 'text'],
] as const);

export type ImportKind = 'docx' | 'html' | 'markdown' | 'notion' | 'pdf' | 'text';

export type ImportPreview = {
  ast: DocumentAst;
  bytes: number;
  fileName: string;
  kind: ImportKind;
  markdown: string;
  warnings: string[];
};

export class ImportError extends Error {
  readonly code: 'aborted' | 'empty' | 'invalid-type' | 'too-large' | 'invalid-content';

  constructor(
    code: 'aborted' | 'empty' | 'invalid-type' | 'too-large' | 'invalid-content',
    message: string,
  ) {
    super(message);
    this.code = code;
    this.name = 'ImportError';
  }
}

function kindFrom(fileName: string, mediaType: string): ImportKind | undefined {
  const normalizedType = mediaType.split(';', 1)[0].trim().toLowerCase();
  const extension = fileName.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  const typeKind = supportedTypes.get(normalizedType as 'text/markdown' | 'text/plain');
  const extensionKind =
    extension === 'md' || extension === 'markdown'
      ? 'markdown'
      : extension === 'txt'
        ? 'text'
        : undefined;

  if (typeKind && extensionKind && typeKind !== extensionKind) return undefined;
  return typeKind ?? extensionKind;
}

function textToDocument(value: string): DocumentAst {
  const blocks: DocumentBlock[] = value
    .replace(/\r\n?/g, '\n')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => ({
      type: 'paragraph',
      children: [{ type: 'text', value: paragraph.replace(/\n/g, ' '), marks: [] }],
    }));
  return validateDocument({ schemaVersion: 1, children: blocks });
}

export function importTextFile(input: {
  bytes: Uint8Array;
  fileName: string;
  mediaType: string;
  signal?: AbortSignal;
}): ImportPreview {
  if (input.signal?.aborted) throw new ImportError('aborted', 'A importação foi cancelada.');
  if (input.bytes.byteLength === 0) throw new ImportError('empty', 'O arquivo está vazio.');
  if (input.bytes.byteLength > MAX_IMPORT_BYTES) {
    throw new ImportError('too-large', 'O arquivo excede o limite de 1 MiB.');
  }

  const kind = kindFrom(input.fileName, input.mediaType);
  if (!kind) throw new ImportError('invalid-type', 'Use um arquivo .md, .markdown ou .txt.');
  if (input.bytes.includes(0)) {
    throw new ImportError(
      'invalid-content',
      'O arquivo parece binário e não pode ser importado como texto.',
    );
  }

  const text = new TextDecoder('utf-8', { fatal: true }).decode(input.bytes).replace(/^\uFEFF/, '');
  if (!text.trim()) throw new ImportError('empty', 'O arquivo não possui texto utilizável.');
  if (input.signal?.aborted) throw new ImportError('aborted', 'A importação foi cancelada.');

  try {
    const ast = kind === 'markdown' ? parseMarkdown(text) : textToDocument(text);
    return {
      ast,
      bytes: input.bytes.byteLength,
      fileName: input.fileName,
      kind,
      markdown: serializeMarkdown(ast),
      warnings:
        kind === 'text' ? ['A formatação do arquivo de texto foi reduzida a parágrafos.'] : [],
    };
  } catch (error) {
    if (error instanceof ImportError) throw error;
    throw new ImportError(
      'invalid-content',
      error instanceof Error ? error.message : 'O conteúdo do arquivo é inválido.',
    );
  }
}

function preview(
  ast: DocumentAst,
  input: { bytes: Uint8Array; fileName: string },
  kind: ImportKind,
  warnings: string[],
): ImportPreview {
  return {
    ast,
    bytes: input.bytes.byteLength,
    fileName: input.fileName,
    kind,
    markdown: serializeMarkdown(ast),
    warnings,
  };
}

function assertUpload(input: { bytes: Uint8Array; signal?: AbortSignal }) {
  if (input.signal?.aborted) throw new ImportError('aborted', 'A importação foi cancelada.');
  if (!input.bytes.byteLength) throw new ImportError('empty', 'O arquivo está vazio.');
  if (input.bytes.byteLength > MAX_UPLOAD_BYTES) {
    throw new ImportError('too-large', 'O arquivo excede o limite de 10 MiB.');
  }
}

async function importHtml(input: { bytes: Uint8Array; fileName: string }) {
  const html = new TextDecoder('utf-8', { fatal: true }).decode(input.bytes);
  const { document, issues } = parseLegacyHtml(html);
  return preview(document, input, 'html', issues);
}

async function importDocx(input: { bytes: Uint8Array; fileName: string }) {
  await assertZipBudget(input.bytes, 500, 25 * 1024 * 1024);
  const converted = await mammoth.convertToHtml(
    { buffer: Buffer.from(input.bytes) },
    { convertImage: mammoth.images.imgElement(() => Promise.resolve({ src: '', alt: '' })) },
  );
  const html = new TextEncoder().encode(converted.value.replace(/<img\b[^>]*>/gi, ''));
  const result = await importHtml({ bytes: html, fileName: input.fileName });
  return {
    ...result,
    kind: 'docx' as const,
    warnings: [
      'A aparência do Word foi simplificada; confira listas, tabelas, imagens e notas.',
      ...converted.messages.map((message) => message.message),
      ...result.warnings,
    ],
  };
}

async function importPdf(input: { bytes: Uint8Array; fileName: string }) {
  const { getDocument } = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const loading = getDocument({ data: input.bytes.slice() });
  const pdf = await loading.promise;
  const paragraphs: string[] = [];
  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const content = await page.getTextContent();
      const value = content.items
        .map((item) => ('str' in item ? item.str : ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (value) paragraphs.push(value);
    }
  } finally {
    await loading.destroy();
  }
  if (!paragraphs.length) {
    throw new ImportError('invalid-content', 'O PDF não possui texto extraível.');
  }
  const ast = textToDocument(paragraphs.join('\n\n'));
  return preview(ast, input, 'pdf', [
    'PDF preserva texto, mas pode perder ordem de leitura, colunas, tabelas e imagens.',
  ]);
}

async function importNotion(input: { bytes: Uint8Array; fileName: string }) {
  await assertZipBudget(input.bytes, 100, 10 * 1024 * 1024);
  const archive = await JSZip.loadAsync(input.bytes, { checkCRC32: true });
  const entries = Object.values(archive.files).filter((entry) => !entry.dir);
  if (entries.length > 100) {
    throw new ImportError('too-large', 'A exportação do Notion excede 100 arquivos.');
  }
  const candidates = entries.filter((entry) => {
    const name = entry.name.toLowerCase();
    return !name.includes('..') && /\.(md|markdown|html|txt)$/.test(name);
  });
  const entry =
    candidates.find((candidate) => /(^|\/)index\.(md|markdown|html)$/i.test(candidate.name)) ??
    candidates[0];
  if (!entry) {
    throw new ImportError('invalid-content', 'O ZIP do Notion não contém Markdown, HTML ou texto.');
  }
  const bytes = await entry.async('uint8array');
  if (bytes.byteLength > MAX_IMPORT_BYTES) {
    throw new ImportError('too-large', 'O documento principal do Notion excede 1 MiB.');
  }
  const nested = entry.name.toLowerCase().endsWith('.html')
    ? await importHtml({ bytes, fileName: entry.name })
    : importTextFile({
        bytes,
        fileName: entry.name,
        mediaType: entry.name.toLowerCase().endsWith('.txt') ? 'text/plain' : 'text/markdown',
      });
  return {
    ...nested,
    bytes: input.bytes.byteLength,
    fileName: input.fileName,
    kind: 'notion' as const,
    warnings: [
      `Documento escolhido no arquivo do Notion: ${entry.name}.`,
      'Links e anexos para outros arquivos da exportação devem ser revisados.',
      ...nested.warnings,
    ],
  };
}

async function assertZipBudget(bytes: Uint8Array, maxEntries: number, maxExpandedBytes: number) {
  const archive = await JSZip.loadAsync(bytes);
  const entries = Object.values(archive.files).filter((entry) => !entry.dir);
  if (entries.length > maxEntries) {
    throw new ImportError('too-large', `O arquivo compactado excede ${maxEntries} entradas.`);
  }
  const expandedBytes = entries.reduce((total, entry) => {
    const metadata = entry as typeof entry & { _data?: { uncompressedSize?: number } };
    return total + (metadata._data?.uncompressedSize ?? 0);
  }, 0);
  if (expandedBytes > maxExpandedBytes) {
    throw new ImportError('too-large', 'O conteúdo descompactado excede o limite permitido.');
  }
}

export async function importDocumentFile(input: {
  bytes: Uint8Array;
  fileName: string;
  mediaType: string;
  signal?: AbortSignal;
}): Promise<ImportPreview> {
  assertUpload(input);
  const extension = input.fileName.toLowerCase().match(/\.([a-z0-9]+)$/)?.[1];
  const mediaType = input.mediaType.split(';', 1)[0].trim().toLowerCase();
  const allowedMediaTypes: Record<string, string[]> = {
    docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    htm: ['text/html'],
    html: ['text/html'],
    md: ['text/markdown', 'text/plain'],
    markdown: ['text/markdown', 'text/plain'],
    pdf: ['application/pdf'],
    txt: ['text/plain'],
    zip: ['application/zip', 'application/x-zip-compressed'],
  };
  const permitted = extension ? allowedMediaTypes[extension] : undefined;
  if (
    !permitted ||
    (mediaType && mediaType !== 'application/octet-stream' && !permitted.includes(mediaType))
  ) {
    throw new ImportError(
      'invalid-type',
      'A extensão e o tipo declarado do arquivo não correspondem.',
    );
  }
  const signature = new TextDecoder('latin1').decode(input.bytes.slice(0, 5));
  if (extension === 'pdf' && signature !== '%PDF-') {
    throw new ImportError('invalid-type', 'O arquivo não possui uma assinatura PDF válida.');
  }
  if ((extension === 'docx' || extension === 'zip') && !signature.startsWith('PK')) {
    throw new ImportError('invalid-type', 'O arquivo não possui uma assinatura ZIP válida.');
  }
  try {
    let result: ImportPreview;
    if (extension === 'md' || extension === 'markdown' || extension === 'txt') {
      result = importTextFile(input);
    } else if (extension === 'html' || extension === 'htm') {
      result = await importHtml(input);
    } else if (extension === 'docx') {
      result = await importDocx(input);
    } else if (extension === 'pdf') {
      result = await importPdf(input);
    } else if (extension === 'zip') {
      result = await importNotion(input);
    } else {
      throw new ImportError(
        'invalid-type',
        'Use um arquivo Markdown, texto, HTML, DOCX, PDF ou ZIP exportado pelo Notion.',
      );
    }
    if (input.signal?.aborted) throw new ImportError('aborted', 'A importação foi cancelada.');
    return result;
  } catch (error) {
    if (error instanceof ImportError) throw error;
    throw new ImportError(
      'invalid-content',
      error instanceof Error ? error.message : 'O arquivo está corrompido ou é inválido.',
    );
  }
}
