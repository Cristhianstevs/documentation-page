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
    const attributes = [`tone=${node.tone}`, node.title ? `title="${node.title}"` : '']
      .filter(Boolean)
      .join(' ');
    return `:::callout{${attributes}}\n${node.children.map(block).join('\n\n')}\n:::`;
  }
  return `:::toggle{title="${node.title}"}\n${node.children.map(block).join('\n\n')}\n:::`;
}

export function serializeMarkdown(input: DocumentAst): string {
  const document = validateDocument(input);
  return `${document.children.map(block).join('\n\n')}\n`;
}
