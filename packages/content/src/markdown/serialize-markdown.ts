import type { DocumentAst, DocumentBlock, DocumentInline } from '../schema/document.ts';
import { validateDocument } from '../schema/document.ts';

function escapeText(value: string) {
  return value.replace(/([\\`*_[\]<>])/g, '\\$1');
}

function inline(node: DocumentInline): string {
  if (node.type === 'link') {
    const label = node.children.map(inline).join('');
    return `[${label}](${node.url}${node.title ? ` "${node.title}"` : ''})`;
  }
  let value = node.marks.includes('code')
    ? `\`${node.value.replaceAll('`', '\\`')}\``
    : escapeText(node.value);
  if (node.marks.includes('bold')) value = `**${value}**`;
  if (node.marks.includes('italic')) value = `_${value}_`;
  if (node.marks.includes('strikethrough')) value = `~~${value}~~`;
  if (node.marks.includes('underline')) value = `:u[${value}]`;
  return value;
}

const inlineContent = (children: DocumentInline[]) => children.map(inline).join('');

function indent(value: string, prefix: string) {
  return value
    .split('\n')
    .map((line, index) => (index === 0 ? line : `${prefix}${line}`))
    .join('\n');
}

function attribute(value: string) {
  return value.replaceAll('\\', '\\\\').replaceAll('"', '\\"');
}

function attributes(values: Record<string, string | undefined>) {
  return Object.entries(values)
    .filter((entry): entry is [string, string] => entry[1] !== undefined)
    .map(([key, value]) => `${key}="${attribute(value)}"`)
    .join(' ');
}

function block(node: DocumentBlock): string {
  if (node.type === 'paragraph') return inlineContent(node.children);
  if (node.type === 'heading') return `${'#'.repeat(node.level)} ${inlineContent(node.children)}`;
  if (node.type === 'quote') return node.children.map(block).join('\n\n').replace(/^/gm, '> ');
  if (node.type === 'code') return `\`\`\`${node.language ?? ''}\n${node.value}\n\`\`\``;
  if (node.type === 'thematicBreak') return '---';
  if (node.type === 'image')
    return `![${node.alt}](${node.src}${node.title ? ` "${node.title}"` : ''})`;
  if (node.type === 'list') {
    return node.items
      .map((item, index) => {
        const marker = node.ordered ? `${(node.start ?? 1) + index}.` : '-';
        const checked = item.checked === undefined ? '' : ` [${item.checked ? 'x' : ' '}]`;
        return `${marker}${checked} ${indent(item.children.map(block).join('\n\n'), '   ')}`;
      })
      .join('\n');
  }
  if (node.type === 'table') {
    const rows = node.rows.map((row) => `| ${row.map(inlineContent).join(' | ')} |`);
    const width = node.rows[0]?.length ?? 0;
    const separator = `| ${Array.from({ length: width }, (_, index) => {
      const alignment = node.align[index];
      if (alignment === 'center') return ':---:';
      if (alignment === 'right') return '---:';
      if (alignment === 'left') return ':---';
      return '---';
    }).join(' | ')} |`;
    rows.splice(1, 0, separator);
    return rows.join('\n');
  }
  if (node.type === 'callout') {
    const directiveAttributes = [
      `tone=${node.tone}`,
      node.title ? `title="${attribute(node.title)}"` : '',
    ]
      .filter(Boolean)
      .join(' ');
    return `:::callout{${directiveAttributes}}\n${node.children.map(block).join('\n\n')}\n:::`;
  }
  if (node.type === 'toggle') {
    return `:::toggle{title="${attribute(node.title)}"}\n${node.children.map(block).join('\n\n')}\n:::`;
  }
  if (node.type === 'columns') {
    const columns = node.columns
      .map((column) => `:::column\n${column.map(block).join('\n\n')}\n:::`)
      .join('\n');
    return `::::columns\n${columns}\n::::`;
  }
  if (node.type === 'file') {
    return `::file{${attributes({ src: node.src, label: node.label, description: node.description })}}`;
  }
  if (node.type === 'video') {
    return `::video{${attributes({ src: node.src, title: node.title, caption: node.caption })}}`;
  }
  if (node.type === 'audio') {
    return `::audio{${attributes({ src: node.src, title: node.title })}}`;
  }
  if (node.type === 'date') {
    return `::date{${attributes({ value: node.value, label: node.label })}}`;
  }
  return `::embed{${attributes({ provider: node.provider, url: node.url, title: node.title })}}`;
}

export function serializeMarkdown(input: DocumentAst): string {
  const document = validateDocument(input);
  return `${document.children.map(block).join('\n\n')}\n`;
}
