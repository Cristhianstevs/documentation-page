import { mergeAttributes, Node } from '@tiptap/core';

const LABELS: Record<string, string> = {
  table: 'Tabela',
  thematicBreak: 'Divisor',
  image: 'Imagem',
  callout: 'Aviso',
  toggle: 'Bloco expansível',
  columns: 'Colunas',
  file: 'Arquivo',
  video: 'Vídeo',
  audio: 'Áudio',
  date: 'Data',
  embed: 'Embed',
};

export const AdvancedBlock = Node.create({
  name: 'advancedBlock',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return { block: { default: '{}' } };
  },

  parseHTML() {
    return [{ tag: 'div[data-advanced-block]' }];
  },

  renderHTML({ HTMLAttributes }) {
    let type = 'block';
    try {
      type = JSON.parse(String(HTMLAttributes.block)).type;
    } catch {}
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-advanced-block': type,
        class: 'advanced-block-card',
        tabindex: '0',
      }),
      `Bloco: ${LABELS[type] ?? type}`,
    ];
  },

  addKeyboardShortcuts() {
    const move = (direction: -1 | 1) =>
      this.editor.commands.command(({ state, tr }) => {
        const position = state.selection.from;
        const node = state.doc.nodeAt(position);
        const resolved = state.doc.resolve(position);
        if (node?.type.name !== this.name || resolved.depth !== 0) return false;
        const index = resolved.index();
        if (direction === -1) {
          if (index === 0) return false;
          const previous = state.doc.child(index - 1);
          tr.delete(position, position + node.nodeSize).insert(position - previous.nodeSize, node);
        } else {
          if (index >= state.doc.childCount - 1) return false;
          const next = state.doc.child(index + 1);
          tr.delete(position, position + node.nodeSize).insert(position + next.nodeSize, node);
        }
        return true;
      });
    return {
      'Alt-ArrowUp': () => move(-1),
      'Alt-ArrowDown': () => move(1),
    };
  },
});
