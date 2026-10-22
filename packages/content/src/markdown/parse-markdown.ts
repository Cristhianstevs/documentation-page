import remarkDirective from 'remark-directive';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import { unified } from 'unified';
import type {
  DocumentAst,
  DocumentBlock,
  DocumentInline,
  DocumentText,
} from '../schema/document.ts';
import { validateDocument } from '../schema/document.ts';

type MdNode = {
  type: string;
  value?: string;
  depth?: number;
  url?: string;
  title?: string | null;
  alt?: string | null;
  lang?: string | null;
  ordered?: boolean;
  start?: number | null;
  checked?: boolean | null;
  align?: Array<'left' | 'center' | 'right' | null>;
  name?: string;
  attributes?: Record<string, string | null>;
  children?: MdNode[];
};

function text(value: string, marks: DocumentText['marks'] = []): DocumentText {
  return { type: 'text', value, marks };
}

function inlines(nodes: MdNode[] = [], marks: DocumentText['marks'] = []): DocumentInline[] {
  return nodes.flatMap((node): DocumentInline[] => {
    if (node.type === 'text') return [text(node.value ?? '', marks)];
    if (node.type === 'inlineCode') return [text(node.value ?? '', [...marks, 'code'])];
    if (node.type === 'strong') return inlines(node.children, [...marks, 'bold']);
    if (node.type === 'emphasis') return inlines(node.children, [...marks, 'italic']);
    if (node.type === 'delete') return inlines(node.children, [...marks, 'strikethrough']);
    if (node.type === 'textDirective' && node.name === 'u') {
      return inlines(node.children, [...marks, 'underline']);
    }
    if (node.type === 'break') return [text('\n', marks)];
    if (node.type === 'link') {
      const children = inlines(node.children, marks).flatMap((child) =>
        child.type === 'text' ? [child] : child.children,
      );
      return [{ type: 'link', url: node.url ?? '', title: node.title ?? undefined, children }];
    }
    if (node.type === 'image') return [text(node.alt ?? '')];
    return inlines(node.children, marks);
  });
}

function blocks(nodes: MdNode[] = []): DocumentBlock[] {
  return nodes.flatMap((node): DocumentBlock[] => {
    if (node.type === 'paragraph') {
      const image =
        node.children?.length === 1 && node.children[0].type === 'image'
          ? node.children[0]
          : undefined;
      if (image) {
        return [
          {
            type: 'image',
            src: image.url ?? '',
            alt: image.alt ?? '',
            title: image.title ?? undefined,
          },
        ];
      }
      return [{ type: 'paragraph', children: inlines(node.children) }];
    }
    if (node.type === 'heading' && node.depth && node.depth <= 3) {
      return [
        { type: 'heading', level: node.depth as 1 | 2 | 3, children: inlines(node.children) },
      ];
    }
    if (node.type === 'list') {
      const sourceItems = node.children ?? [];
      const taskList = sourceItems.some(
        (item) => item.checked !== null && item.checked !== undefined,
      );
      return [
        {
          type: 'list',
          ordered: Boolean(node.ordered),
          start: node.start ?? undefined,
          items: sourceItems.map((item) => ({
            checked: taskList ? (item.checked ?? false) : undefined,
            children: blocks(item.children),
          })),
        },
      ];
    }
    if (node.type === 'blockquote') return [{ type: 'quote', children: blocks(node.children) }];
    if (node.type === 'code') {
      return [{ type: 'code', value: node.value ?? '', language: node.lang ?? undefined }];
    }
    if (node.type === 'thematicBreak') return [{ type: 'thematicBreak' }];
    if (node.type === 'image') {
      return [
        {
          type: 'image',
          src: node.url ?? '',
          alt: node.alt ?? '',
          title: node.title ?? undefined,
        },
      ];
    }
    if (node.type === 'table') {
      return [
        {
          type: 'table',
          align: node.align ?? [],
          rows: (node.children ?? []).map((row) =>
            (row.children ?? []).map((cell) => inlines(cell.children)),
          ),
        },
      ];
    }
    if (node.type === 'containerDirective' && node.name === 'callout') {
      const tone = node.attributes?.tone;
      return [
        {
          type: 'callout',
          tone: tone === 'warning' || tone === 'danger' ? tone : 'info',
          title: node.attributes?.title ?? undefined,
          children: blocks(node.children),
        },
      ];
    }
    if (node.type === 'containerDirective' && node.name === 'toggle') {
      return [
        {
          type: 'toggle',
          title: node.attributes?.title || 'Detalhes',
          children: blocks(node.children),
        },
      ];
    }
    if (node.type === 'containerDirective' && node.name === 'columns') {
      const columns = (node.children ?? [])
        .filter((child) => child.type === 'containerDirective' && child.name === 'column')
        .map((column) => blocks(column.children));
      if (columns.length >= 2 && columns.length <= 4) return [{ type: 'columns', columns }];
      return blocks(node.children);
    }
    if (node.type === 'leafDirective') {
      const attributes = node.attributes ?? {};
      if (node.name === 'file' && attributes.src && attributes.label) {
        return [
          {
            type: 'file',
            src: attributes.src,
            label: attributes.label,
            description: attributes.description ?? undefined,
          },
        ];
      }
      if (node.name === 'video' && attributes.src) {
        return [
          {
            type: 'video',
            src: attributes.src,
            title: attributes.title ?? undefined,
            caption: attributes.caption ?? undefined,
          },
        ];
      }
      if (node.name === 'audio' && attributes.src) {
        return [{ type: 'audio', src: attributes.src, title: attributes.title ?? undefined }];
      }
      if (node.name === 'date' && attributes.value) {
        return [{ type: 'date', value: attributes.value, label: attributes.label ?? undefined }];
      }
      if (
        node.name === 'embed' &&
        (attributes.provider === 'figma' || attributes.provider === 'miro') &&
        attributes.url
      ) {
        return [
          {
            type: 'embed',
            provider: attributes.provider,
            url: attributes.url,
            title: attributes.title ?? undefined,
          },
        ];
      }
    }
    return blocks(node.children);
  });
}

export function parseMarkdown(markdown: string): DocumentAst {
  const tree = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkDirective)
    .parse(markdown) as MdNode;
  return validateDocument({ schemaVersion: 1, children: blocks(tree.children) });
}
