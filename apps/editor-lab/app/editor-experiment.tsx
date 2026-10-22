'use client';

import { CodeNode } from '@lexical/code';
import { ListItemNode, ListNode } from '@lexical/list';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';
import { useEffect, useState } from 'react';

declare global {
  interface Window {
    __editorKeyStartedAt?: number;
    __editorTypingLatencies?: number[];
  }
}

const theme = {
  paragraph: 'editor-paragraph',
  text: { bold: 'editor-bold', italic: 'editor-italic', underline: 'editor-underline' },
};

function LargeDocumentButton() {
  const [editor] = useLexicalComposerContext();
  const [status, setStatus] = useState('Documento curto carregado.');

  function loadLargeDocument() {
    const startedAt = performance.now();
    editor.update(
      () => {
        const root = $getRoot();
        root.clear();
        for (let index = 1; index <= 5_000; index += 1) {
          root.append(
            $createParagraphNode().append($createTextNode(`Bloco de desempenho ${index}`)),
          );
        }
      },
      {
        discrete: true,
        onUpdate: () => {
          const duration = Math.round(performance.now() - startedAt);
          setStatus(`5.000 blocos carregados em ${duration} ms.`);
        },
      },
    );
  }

  return (
    <div className="experiment-actions">
      <button onClick={loadLargeDocument} type="button">
        Carregar 5.000 blocos
      </button>
      <p aria-live="polite" data-testid="experiment-status">
        {status}
      </p>
    </div>
  );
}

export function EditorExperiment() {
  useEffect(() => {
    const recordStart = () => {
      window.__editorKeyStartedAt = performance.now();
    };
    const recordEnd = () => {
      if (window.__editorKeyStartedAt === undefined) return;
      window.__editorTypingLatencies ??= [];
      window.__editorTypingLatencies.push(performance.now() - window.__editorKeyStartedAt);
    };
    document.addEventListener('keydown', recordStart, true);
    document.addEventListener('input', recordEnd, true);
    return () => {
      document.removeEventListener('keydown', recordStart, true);
      document.removeEventListener('input', recordEnd, true);
    };
  }, []);

  return (
    <section aria-labelledby="editor-title" className="experiment">
      <h2 id="editor-title">Documento de teste</h2>
      <LexicalComposer
        initialConfig={{
          namespace: 'documentation-page-editor-lab',
          nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, CodeNode],
          onError(error) {
            throw error;
          },
          editorState() {
            $getRoot()
              .clear()
              .append(
                $createParagraphNode().append(
                  $createTextNode('Edite este parágrafo usando o teclado.'),
                ),
              );
          },
          theme,
        }}
      >
        <LargeDocumentButton />
        <div className="editor-frame">
          <RichTextPlugin
            contentEditable={
              <ContentEditable aria-label="Conteúdo do documento" className="editor-input" />
            }
            ErrorBoundary={LexicalErrorBoundary}
            placeholder={<p className="editor-placeholder">Comece a escrever…</p>}
          />
          <HistoryPlugin />
          <ListPlugin />
        </div>
      </LexicalComposer>
    </section>
  );
}
