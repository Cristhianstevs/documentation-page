import type {
  DocumentAst,
  DocumentBlock,
  DocumentInline,
  DocumentText,
} from '@documentation-page/content/document';
import { validateDocument } from '@documentation-page/content/document';
import type { JSONContent } from '@tiptap/core';

export class UnsupportedEditorContentError extends Error {
  readonly blockType: string;

  constructor(blockType: string) {
    super(`O bloco ${blockType} ainda não possui edição visual.`);
    this.name = 'UnsupportedEditorContentError';
    this.blockType = blockType;
  }
}

const markNames = new Map<string, DocumentText['marks'][number]>([
  ['bold', 'bold'],
  ['italic', 'italic'],
  ['underline', 'underline'],
  ['strike', 'strikethrough'],
  ['code', 'code'],
]);

function inlineToTiptap(node: DocumentInline): JSONContent[] {
  if (node.type === 'link') {
    return node.children.map((child) => ({
      type: 'text',
      text: child.value,
      marks: [
        ...child.marks.map((mark) => ({ type: mark === 'strikethrough' ? 'strike' : mark })),
        { type: 'link', attrs: { href: node.url, title: node.title ?? null } },
      ],
    }));
  }
  return [
    {
      type: 'text',
      text: node.value,
      marks: node.marks.map((mark) => ({ type: mark === 'strikethrough' ? 'strike' : mark })),
    },
  ];
}

const inlineContentToTiptap = (children: DocumentInline[]) => children.flatMap(inlineToTiptap);

function blockToTiptap(block: DocumentBlock): JSONContent {
  if (block.type === 'paragraph') {
    return { type: 'paragraph', content: inlineContentToTiptap(block.children) };
  }
  if (block.type === 'heading') {
    return {
      type: 'heading',
      attrs: { level: block.level },
      content: inlineContentToTiptap(block.children),
    };
  }
  if (block.type === 'quote') {
    return { type: 'blockquote', content: block.children.map(blockToTiptap) };
  }
  if (block.type === 'code') {
    return {
      type: 'codeBlock',
      attrs: { language: block.language ?? null },
      content: [{ type: 'text', text: block.value }],
    };
  }
  if (block.type === 'thematicBreak') return { type: 'horizontalRule' };
  if (block.type === 'list') {
    const task = block.items.some((item) => item.checked !== undefined);
    return {
      type: task ? 'taskList' : block.ordered ? 'orderedList' : 'bulletList',
      attrs: block.ordered ? { start: block.start ?? 1 } : undefined,
      content: block.items.map((item) => ({
        type: task ? 'taskItem' : 'listItem',
        attrs: task ? { checked: item.checked ?? false } : undefined,
        content: item.children.map(blockToTiptap),
      })),
    };
  }
  return { type: 'advancedBlock', attrs: { block: JSON.stringify(block) } };
}

export function documentToTiptap(input: DocumentAst): JSONContent {
  const document = validateDocument(input);
  return { type: 'doc', content: document.children.map(blockToTiptap) };
}

function inlineFromTiptap(node: JSONContent): DocumentInline[] {
  if (node.type === 'hardBreak') return [{ type: 'text', value: '\n', marks: [] }];
  if (node.type !== 'text') return (node.content ?? []).flatMap(inlineFromTiptap);
  const marks: DocumentText['marks'] = [];
  const link = node.marks?.find((mark) => mark.type === 'link');
  for (const mark of node.marks ?? []) {
    const mapped = markNames.get(mark.type);
    if (mapped && !marks.includes(mapped)) marks.push(mapped);
  }
  const text: DocumentText = { type: 'text', value: node.text ?? '', marks };
  if (!link) return [text];
  return [
    {
      type: 'link',
      url: String(link.attrs?.href ?? ''),
      title: link.attrs?.title ? String(link.attrs.title) : undefined,
      children: [text],
    },
  ];
}

function blockFromTiptap(node: JSONContent): DocumentBlock[] {
  if (node.type === 'paragraph') {
    return [{ type: 'paragraph', children: (node.content ?? []).flatMap(inlineFromTiptap) }];
  }
  if (node.type === 'heading') {
    const level = Number(node.attrs?.level);
    return [
      {
        type: 'heading',
        level: level === 2 || level === 3 ? level : 1,
        children: (node.content ?? []).flatMap(inlineFromTiptap),
      },
    ];
  }
  if (node.type === 'blockquote') {
    return [{ type: 'quote', children: (node.content ?? []).flatMap(blockFromTiptap) }];
  }
  if (node.type === 'codeBlock') {
    return [
      {
        type: 'code',
        value: (node.content ?? []).map((child) => child.text ?? '').join(''),
        language: node.attrs?.language ? String(node.attrs.language) : undefined,
      },
    ];
  }
  if (node.type === 'horizontalRule') return [{ type: 'thematicBreak' }];
  if (node.type === 'bulletList' || node.type === 'orderedList' || node.type === 'taskList') {
    return [
      {
        type: 'list',
        ordered: node.type === 'orderedList',
        start: node.type === 'orderedList' ? Number(node.attrs?.start ?? 1) : undefined,
        items: (node.content ?? []).map((item) => ({
          checked: node.type === 'taskList' ? Boolean(item.attrs?.checked) : undefined,
          children: (item.content ?? []).flatMap(blockFromTiptap),
        })),
      },
    ];
  }
  if (node.type === 'advancedBlock') {
    try {
      return [JSON.parse(String(node.attrs?.block ?? '{}')) as DocumentBlock];
    } catch {
      throw new UnsupportedEditorContentError('avançado inválido');
    }
  }
  return (node.content ?? []).flatMap(blockFromTiptap);
}

export function tiptapToDocument(input: JSONContent): DocumentAst {
  return validateDocument({
    schemaVersion: 1,
    children: (input.content ?? []).flatMap(blockFromTiptap),
  });
}
