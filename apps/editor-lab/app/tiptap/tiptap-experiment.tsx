'use client';

import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    __tiptapKeyStartedAt?: number;
    __tiptapTypingLatencies?: number[];
  }
}

export function TiptapExperiment() {
  const [status, setStatus] = useState('Documento curto carregado.');
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Edite este parágrafo usando o teclado.</p>',
    immediatelyRender: false,
    editorProps: {
      attributes: { 'aria-label': 'Conteúdo do documento Tiptap', class: 'editor-input' },
    },
  });

  useEffect(() => {
    const recordStart = () => {
      window.__tiptapKeyStartedAt = performance.now();
    };
    const recordEnd = () => {
      if (window.__tiptapKeyStartedAt === undefined) return;
      window.__tiptapTypingLatencies ??= [];
      window.__tiptapTypingLatencies.push(performance.now() - window.__tiptapKeyStartedAt);
    };
    document.addEventListener('keydown', recordStart, true);
    document.addEventListener('input', recordEnd, true);
    return () => {
      document.removeEventListener('keydown', recordStart, true);
      document.removeEventListener('input', recordEnd, true);
    };
  }, []);

  function loadLargeDocument() {
    if (!editor) return;
    const startedAt = performance.now();
    editor.commands.setContent({
      type: 'doc',
      content: Array.from({ length: 5_000 }, (_, index) => ({
        type: 'paragraph',
        content: [{ type: 'text', text: `Bloco de desempenho ${index + 1}` }],
      })),
    });
    setStatus(`5.000 blocos carregados em ${Math.round(performance.now() - startedAt)} ms.`);
  }

  return (
    <section aria-labelledby="tiptap-title" className="experiment">
      <h2 id="tiptap-title">Documento de teste</h2>
      <div className="experiment-actions">
        <button disabled={!editor} onClick={loadLargeDocument} type="button">
          Carregar 5.000 blocos
        </button>
        <p aria-live="polite" data-testid="experiment-status">
          {status}
        </p>
      </div>
      <div className="editor-frame">
        <EditorContent editor={editor} />
      </div>
    </section>
  );
}
