import type {
  DocumentAst,
  DocumentBlock,
  DocumentInline,
  DocumentText,
} from '@documentation-page/content';
import { validateDocument } from '@documentation-page/content';
import { $createCodeNode, $isCodeNode, CodeNode } from '@lexical/code';
import { createHeadlessEditor } from '@lexical/headless';
import {
  $createListItemNode,
  $createListNode,
  $isListItemNode,
  $isListNode,
  ListItemNode,
  ListNode,
} from '@lexical/list';
import { $createHeadingNode, $isHeadingNode, HeadingNode, QuoteNode } from '@lexical/rich-text';
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $isParagraphNode,
  $isTextNode,
  type ElementNode,
  type LexicalEditor,
  type LexicalNode,
  type TextFormatType,
  TextNode,
} from 'lexical';

const nodes = [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode];

function appendInlines(parent: ElementNode, inlines: DocumentInline[]) {
  for (const inline of inlines) {
    if (inline.type === 'link') {
      for (const child of inline.children) appendText(parent, child);
    } else {
      appendText(parent, inline);
    }
  }
}

function appendText(parent: ElementNode, value: DocumentText) {
  const node = $createTextNode(value.value);
  for (const mark of value.marks) {
    if (
      mark === 'code' ||
      mark === 'bold' ||
      mark === 'italic' ||
      mark === 'underline' ||
      mark === 'strikethrough'
    ) {
      node.toggleFormat(mark as TextFormatType);
    }
  }
  parent.append(node);
}

function appendBlock(block: DocumentBlock) {
  const root = $getRoot();
  if (block.type === 'paragraph') {
    const node = $createParagraphNode();
    appendInlines(node, block.children);
    root.append(node);
    return;
  }
  if (block.type === 'heading') {
    const node = $createHeadingNode(`h${block.level}`);
    appendInlines(node, block.children);
    root.append(node);
    return;
  }
  if (block.type === 'code') {
    const node = $createCodeNode(block.language);
    node.append($createTextNode(block.value));
    root.append(node);
    return;
  }
  if (block.type === 'list') {
    const list = $createListNode(
      block.ordered
        ? 'number'
        : block.items.some((item) => item.checked !== undefined)
          ? 'check'
          : 'bullet',
      block.start ?? 1,
    );
    for (const item of block.items) {
      const itemNode = $createListItemNode(item.checked);
      for (const child of item.children) {
        if (child.type === 'paragraph' || child.type === 'heading')
          appendInlines(itemNode, child.children);
      }
      list.append(itemNode);
    }
    root.append(list);
  }
}

function textFromNode(node: TextNode): DocumentText {
  const marks: DocumentText['marks'] = [];
  for (const mark of ['bold', 'italic', 'underline', 'strikethrough', 'code'] as const) {
    if (node.hasFormat(mark)) marks.push(mark);
  }
  return { type: 'text', value: node.getTextContent(), marks };
}

function inlinesFromChildren(node: ElementNode): DocumentInline[] {
  return node.getChildren().flatMap((child) => ($isTextNode(child) ? [textFromNode(child)] : []));
}

function blockFromNode(node: LexicalNode): DocumentBlock | undefined {
  if ($isParagraphNode(node)) return { type: 'paragraph', children: inlinesFromChildren(node) };
  if ($isHeadingNode(node)) {
    return {
      type: 'heading',
      level: Number(node.getTag().slice(1)) as 1 | 2 | 3,
      children: inlinesFromChildren(node),
    };
  }
  if ($isCodeNode(node)) {
    return {
      type: 'code',
      value: node.getTextContent(),
      language: node.getLanguage() ?? undefined,
    };
  }
  if ($isListNode(node)) {
    const ordered = node.getListType() === 'number';
    const checkList = node.getListType() === 'check';
    return {
      type: 'list',
      ordered,
      start: ordered ? node.getStart() : undefined,
      items: node.getChildren().flatMap((child) =>
        $isListItemNode(child)
          ? [
              {
                checked: checkList ? (child.getChecked() ?? false) : undefined,
                children: [{ type: 'paragraph' as const, children: inlinesFromChildren(child) }],
              },
            ]
          : [],
      ),
    };
  }
  return undefined;
}

export function createEditorFromDocument(input: DocumentAst): LexicalEditor {
  const document = validateDocument(input);
  const editor = createHeadlessEditor({ namespace: 'documentation-page-experiment', nodes });
  editor.update(
    () => {
      const root = $getRoot();
      root.clear();
      for (const block of document.children) appendBlock(block);
    },
    { discrete: true },
  );
  return editor;
}

export function readDocumentFromEditor(editor: LexicalEditor): DocumentAst {
  let document: DocumentAst = { schemaVersion: 1, children: [] };
  editor.getEditorState().read(() => {
    document = validateDocument({
      schemaVersion: 1,
      children: $getRoot()
        .getChildren()
        .flatMap((node) => {
          const result = blockFromNode(node);
          return result ? [result] : [];
        }),
    });
  });
  return document;
}

export function roundTripDocument(input: DocumentAst): DocumentAst {
  return readDocumentFromEditor(createEditorFromDocument(input));
}

export {
  documentToTiptap,
  tiptapToDocument,
  UnsupportedEditorContentError,
} from './tiptap.ts';
