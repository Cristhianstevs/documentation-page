import { parse } from 'node-html-parser';
import type {
  DocumentAst,
  DocumentBlock,
  DocumentInline,
  DocumentText,
} from '../schema/document.ts';
import { validateDocument } from '../schema/document.ts';

type HtmlNode = {
  nodeType: number;
  textContent: string;
  childNodes: HtmlNode[];
  rawTagName?: string;
  id?: string;
  getAttribute?: (name: string) => string | undefined;
};

type LegacyAstResult = { document: DocumentAst; issues: string[] };

function text(value: string, marks: DocumentText['marks'] = []): DocumentText[] {
  return value ? [{ type: 'text', value, marks }] : [];
}

function inlineNodes(nodes: HtmlNode[], marks: DocumentText['marks'] = []): DocumentInline[] {
  return nodes.flatMap((node): DocumentInline[] => {
    if (node.nodeType === 3) return text(node.textContent, marks);
    const tag = node.rawTagName?.toLowerCase();
    if (tag === 'strong' || tag === 'b') return inlineNodes(node.childNodes, [...marks, 'bold']);
    if (tag === 'em' || tag === 'i') return inlineNodes(node.childNodes, [...marks, 'italic']);
    if (tag === 'u') return inlineNodes(node.childNodes, [...marks, 'underline']);
    if (tag === 'del' || tag === 's') {
      return inlineNodes(node.childNodes, [...marks, 'strikethrough']);
    }
    if (tag === 'code') return inlineNodes(node.childNodes, [...marks, 'code']);
    if (tag === 'br') return text('\n', marks);
    if (tag === 'a') {
      const children = inlineNodes(node.childNodes, marks).flatMap((child) =>
        child.type === 'text' ? [child] : child.children,
      );
      return [
        {
          type: 'link',
          url: node.getAttribute?.('href') ?? '',
          title: node.getAttribute?.('title'),
          children,
        },
      ];
    }
    return inlineNodes(node.childNodes, marks);
  });
}

function elementBlocks(node: HtmlNode, issues: string[]): DocumentBlock[] {
  if (node.nodeType === 3) {
    return node.textContent.trim()
      ? [{ type: 'paragraph', children: text(node.textContent.trim()) }]
      : [];
  }
  const tag = node.rawTagName?.toLowerCase();
  if (tag === 'p') return [{ type: 'paragraph', children: inlineNodes(node.childNodes) }];
  if (tag === 'h1' || tag === 'h2' || tag === 'h3') {
    return [
      {
        type: 'heading',
        level: Number(tag.slice(1)) as 1 | 2 | 3,
        id: node.id || undefined,
        children: inlineNodes(node.childNodes),
      },
    ];
  }
  if (tag === 'ul' || tag === 'ol') {
    const items = node.childNodes
      .filter((child) => child.rawTagName?.toLowerCase() === 'li')
      .map((child) => {
        const checkedInput = child.childNodes.find(
          (item) =>
            item.rawTagName?.toLowerCase() === 'input' &&
            item.getAttribute?.('type') === 'checkbox',
        );
        const nestedBlocks = child.childNodes.flatMap((item) => {
          const itemTag = item.rawTagName?.toLowerCase();
          return itemTag === 'ul' || itemTag === 'ol'
            ? elementBlocks(item, issues)
            : itemTag === 'input'
              ? []
              : itemTag === 'p'
                ? elementBlocks(item, issues)
                : [];
        });
        return {
          checked: checkedInput ? checkedInput.getAttribute?.('checked') !== undefined : undefined,
          children:
            nestedBlocks.length > 0
              ? nestedBlocks
              : [{ type: 'paragraph' as const, children: inlineNodes(child.childNodes) }],
        };
      });
    return [{ type: 'list', ordered: tag === 'ol', items }];
  }
  if (tag === 'blockquote') return [{ type: 'quote', children: childBlocks(node, issues) }];
  if (tag === 'pre') {
    const code = node.childNodes.find((child) => child.rawTagName?.toLowerCase() === 'code');
    const language = node.getAttribute?.('data-language') ?? code?.getAttribute?.('data-language');
    return [{ type: 'code', value: code?.textContent ?? node.textContent, language }];
  }
  if (tag === 'hr') return [{ type: 'thematicBreak' }];
  if (tag === 'img') {
    return [
      {
        type: 'image',
        src: node.getAttribute?.('src') ?? '',
        alt: node.getAttribute?.('alt') ?? '',
        title: node.getAttribute?.('title'),
      },
    ];
  }
  if (tag === 'details') {
    const summary = node.childNodes.find((child) => child.rawTagName?.toLowerCase() === 'summary');
    return [
      {
        type: 'toggle',
        title: summary?.textContent.trim() || 'Detalhes',
        children: node.childNodes
          .filter((child) => child !== summary)
          .flatMap((child) => elementBlocks(child, issues)),
      },
    ];
  }
  if (tag === 'div' && node.getAttribute?.('class')?.split(/\s+/).includes('callout')) {
    const classes = node.getAttribute?.('class')?.split(/\s+/) ?? [];
    const tone = classes.includes('danger')
      ? 'danger'
      : classes.includes('warning')
        ? 'warning'
        : 'info';
    return [{ type: 'callout', tone, children: childBlocks(node, issues) }];
  }
  if (tag === 'script' || tag === 'style' || tag === 'iframe') {
    issues.push(`Elemento legado descartado: ${tag}.`);
    return [];
  }
  if (tag && !['div', 'section', 'article', 'main'].includes(tag)) {
    issues.push(`Elemento legado simplificado: ${tag}.`);
  }
  return childBlocks(node, issues);
}

function childBlocks(node: HtmlNode, issues: string[]) {
  return node.childNodes.flatMap((child) => elementBlocks(child, issues));
}

export function parseLegacyHtml(html: string): LegacyAstResult {
  const root = parse(html) as unknown as HtmlNode;
  const issues: string[] = [];
  const document = validateDocument({ schemaVersion: 1, children: childBlocks(root, issues) });
  return { document, issues: [...new Set(issues)] };
}
