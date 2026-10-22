import type {
  DocumentAst,
  DocumentBlock,
  DocumentInline,
} from '@documentation-page/content/document';
import { validateDocument } from '@documentation-page/content/document';

const escapeHtml = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

function safeUrl(value: string) {
  const normalized = value.trim();
  if (/^(?:javascript|data):/i.test(normalized)) return '#';
  return escapeHtml(normalized);
}

function safeEmbedUrl(provider: 'figma' | 'miro', value: string) {
  try {
    const url = new URL(value);
    const allowed =
      provider === 'figma' ? ['figma.com', 'www.figma.com'] : ['miro.com', 'www.miro.com'];
    if (url.protocol !== 'https:' || !allowed.includes(url.hostname)) return undefined;
    return escapeHtml(url.toString());
  } catch {
    return undefined;
  }
}

function renderInline(node: DocumentInline): string {
  if (node.type === 'link') {
    const title = node.title ? ` title="${escapeHtml(node.title)}"` : '';
    return `<a href="${safeUrl(node.url)}"${title}>${node.children.map(renderInline).join('')}</a>`;
  }
  let output = escapeHtml(node.value);
  for (const mark of node.marks) {
    const tag = { bold: 'strong', italic: 'em', underline: 'u', strikethrough: 's', code: 'code' }[
      mark
    ];
    output = `<${tag}>${output}</${tag}>`;
  }
  return output;
}

const renderInlines = (nodes: DocumentInline[]) => nodes.map(renderInline).join('');

function slug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function renderBlock(node: DocumentBlock, headingIds: Set<string>): string {
  if (node.type === 'paragraph') return `<p>${renderInlines(node.children)}</p>`;
  if (node.type === 'heading') {
    const label = node.children.map((child) => (child.type === 'text' ? child.value : '')).join('');
    const base = node.id ?? (slug(label) || 'secao');
    let id = base;
    let suffix = 2;
    while (headingIds.has(id)) id = `${base}-${suffix++}`;
    headingIds.add(id);
    return `<h${node.level} id="${escapeHtml(id)}">${renderInlines(node.children)}</h${node.level}>`;
  }
  if (node.type === 'quote') {
    return `<blockquote>${node.children.map((child) => renderBlock(child, headingIds)).join('')}</blockquote>`;
  }
  if (node.type === 'code') {
    const language = node.language ? ` data-language="${escapeHtml(node.language)}"` : '';
    return `<pre${language}><code>${escapeHtml(node.value)}</code></pre>`;
  }
  if (node.type === 'thematicBreak') return '<hr>';
  if (node.type === 'image') {
    const title = node.title ? ` title="${escapeHtml(node.title)}"` : '';
    return `<img src="${safeUrl(node.src)}" alt="${escapeHtml(node.alt)}"${title}>`;
  }
  if (node.type === 'list') {
    const tag = node.ordered ? 'ol' : 'ul';
    const start = node.ordered && node.start && node.start !== 1 ? ` start="${node.start}"` : '';
    const items = node.items
      .map((item) => {
        const checkbox =
          item.checked === undefined
            ? ''
            : `<input type="checkbox" disabled${item.checked ? ' checked' : ''}> `;
        return `<li>${checkbox}${item.children.map((child) => renderBlock(child, headingIds)).join('')}</li>`;
      })
      .join('');
    return `<${tag}${start}>${items}</${tag}>`;
  }
  if (node.type === 'table') {
    const rows = node.rows
      .map((row, rowIndex) => {
        const cellTag = rowIndex === 0 ? 'th' : 'td';
        return `<tr>${row.map((cell) => `<${cellTag}>${renderInlines(cell)}</${cellTag}>`).join('')}</tr>`;
      })
      .join('');
    return `<div class="table-scroll" tabindex="0"><table>${rows}</table></div>`;
  }
  if (node.type === 'callout') {
    const title = node.title ? `<strong>${escapeHtml(node.title)}</strong>` : '';
    return `<aside class="callout ${node.tone}">${title}${node.children
      .map((child) => renderBlock(child, headingIds))
      .join('')}</aside>`;
  }
  if (node.type === 'toggle') {
    return `<details><summary>${escapeHtml(node.title)}</summary>${node.children
      .map((child) => renderBlock(child, headingIds))
      .join('')}</details>`;
  }
  if (node.type === 'columns') {
    return `<div class="content-columns">${node.columns
      .map(
        (column) =>
          `<section>${column.map((child) => renderBlock(child, headingIds)).join('')}</section>`,
      )
      .join('')}</div>`;
  }
  if (node.type === 'file') {
    const description = node.description ? `<small>${escapeHtml(node.description)}</small>` : '';
    return `<a class="file-card" href="${safeUrl(node.src)}" download><strong>${escapeHtml(node.label)}</strong>${description}</a>`;
  }
  if (node.type === 'video') {
    const title = node.title ? ` title="${escapeHtml(node.title)}"` : '';
    const caption = node.caption ? `<figcaption>${escapeHtml(node.caption)}</figcaption>` : '';
    return `<figure><video controls preload="metadata" src="${safeUrl(node.src)}"${title}></video>${caption}</figure>`;
  }
  if (node.type === 'audio') {
    const title = node.title ? `<strong>${escapeHtml(node.title)}</strong>` : '';
    return `<figure class="audio-block">${title}<audio controls preload="metadata" src="${safeUrl(node.src)}"></audio></figure>`;
  }
  if (node.type === 'date') {
    return `<time datetime="${escapeHtml(node.value)}">${escapeHtml(node.label ?? node.value)}</time>`;
  }
  const embedUrl = safeEmbedUrl(node.provider, node.url);
  if (!embedUrl)
    return `<p class="embed-fallback">Embed ${escapeHtml(node.provider)} inválido.</p>`;
  const title = escapeHtml(node.title ?? `Conteúdo do ${node.provider}`);
  return `<figure class="embed-block"><iframe src="${embedUrl}" title="${title}" loading="lazy" sandbox="allow-scripts allow-same-origin allow-popups" referrerpolicy="no-referrer"></iframe><figcaption><a href="${embedUrl}">${title}</a></figcaption></figure>`;
}

export function renderDocumentToHtml(input: DocumentAst): string {
  const document = validateDocument(input);
  const headingIds = new Set<string>();
  return document.children.map((node) => renderBlock(node, headingIds)).join('\n');
}
