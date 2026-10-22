'use client';

import type { DocumentBlock } from '@documentation-page/content/document';
import { parseMarkdown, serializeMarkdown } from '@documentation-page/content/markdown';
import { AdvancedBlock } from '@documentation-page/editor/advanced-block';
import { documentToTiptap, tiptapToDocument } from '@documentation-page/editor/tiptap';
import { renderDocumentToHtml } from '@documentation-page/renderer';
import CodeBlock from '@tiptap/extension-code-block';
import Link from '@tiptap/extension-link';
import TaskItem from '@tiptap/extension-task-item';
import TaskList from '@tiptap/extension-task-list';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useMemo, useRef, useState } from 'react';

type EditablePage = { pageId: string; title: string; markdown: string; revision: string };
type Mode = 'visual' | 'source' | 'preview';
const DRAFT_VERSION = 1;

const extensions = [
  StarterKit.configure({ codeBlock: false, link: false, underline: false }),
  CodeBlock.extend({
    addAttributes() {
      return { language: { default: null } };
    },
  }),
  Link.configure({ openOnClick: false, autolink: true }),
  Underline,
  TaskList,
  TaskItem.configure({ nested: true }),
  AdvancedBlock,
];

export default function EditorWorkspace({
  onDirtyChange,
  pageId,
}: {
  onDirtyChange: (dirty: boolean) => void;
  pageId: string;
}) {
  const [page, setPage] = useState<EditablePage | null>(null);
  const [markdown, setMarkdown] = useState('');
  const [mode, setMode] = useState<Mode>('visual');
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState('Abrindo página…');
  const [draft, setDraft] = useState<string | null>(null);
  const [slashOpen, setSlashOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const loaded = useRef(false);

  const editor = useEditor({
    extensions,
    content: '',
    immediatelyRender: false,
    editorProps: { attributes: { 'aria-label': 'Conteúdo da página', class: 'visual-editor' } },
    onUpdate: ({ editor: currentEditor }) => {
      if (!loaded.current) return;
      const nextMarkdown = serializeMarkdown(tiptapToDocument(currentEditor.getJSON()));
      setMarkdown(nextMarkdown);
      setDirty(true);
      setSlashOpen(currentEditor.getText().endsWith('/'));
    },
  });

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`/api/pages/${encodeURIComponent(pageId)}`, {
          signal: controller.signal,
        });
        const result = (await response.json()) as EditablePage & { error?: string };
        if (!response.ok) throw new Error(result.error ?? 'Não foi possível abrir a página.');
        setPage(result);
        setMarkdown(result.markdown);
        const stored = localStorage.getItem(`documentation-draft:v${DRAFT_VERSION}:${pageId}`);
        if (stored && stored !== result.markdown) setDraft(stored);
        loaded.current = true;
        try {
          editor?.commands.setContent(documentToTiptap(parseMarkdown(result.markdown)), {
            emitUpdate: false,
          });
          setStatus('Página aberta.');
        } catch (error) {
          setMode('source');
          setStatus(
            `${error instanceof Error ? error.message : 'Há blocos sem edição visual.'} Use o modo Markdown para preservar o documento.`,
          );
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setStatus(error instanceof Error ? error.message : 'Não foi possível abrir a página.');
        }
      }
    }
    if (editor) void load();
    return () => controller.abort();
  }, [editor, pageId]);

  useEffect(() => {
    onDirtyChange(dirty);
    if (!dirty) return;
    const timeout = window.setTimeout(() => {
      localStorage.setItem(`documentation-draft:v${DRAFT_VERSION}:${pageId}`, markdown);
      setStatus('Rascunho guardado neste navegador.');
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [dirty, markdown, onDirtyChange, pageId]);

  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  useEffect(() => {
    const saveShortcut = (event: KeyboardEvent) => {
      if (!(event.ctrlKey || event.metaKey) || event.key.toLowerCase() !== 's') return;
      event.preventDefault();
      void save();
    };
    window.addEventListener('keydown', saveShortcut);
    return () => window.removeEventListener('keydown', saveShortcut);
  });

  const preview = useMemo(() => {
    try {
      return { html: renderDocumentToHtml(parseMarkdown(markdown)), error: '' };
    } catch {
      return { html: '', error: 'Corrija o Markdown para atualizar a prévia.' };
    }
  }, [markdown]);

  function selectMode(nextMode: Mode) {
    if (nextMode === 'visual' && editor) {
      try {
        editor.commands.setContent(documentToTiptap(parseMarkdown(markdown)), {
          emitUpdate: false,
        });
      } catch (error) {
        setStatus(error instanceof Error ? error.message : 'Não foi possível abrir o modo visual.');
        return;
      }
    }
    setMode(nextMode);
  }

  async function save() {
    if (!page || !dirty) return;
    setStatus('Salvando…');
    try {
      const response = await fetch(`/api/pages/${encodeURIComponent(pageId)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ markdown, revision: page.revision }),
      });
      const result = (await response.json()) as {
        revision?: string;
        backup?: string;
        error?: string;
      };
      if (!response.ok || !result.revision)
        throw new Error(result.error ?? 'Não foi possível salvar.');
      setPage({ ...page, markdown, revision: result.revision });
      setDirty(false);
      localStorage.removeItem(`documentation-draft:v${DRAFT_VERSION}:${pageId}`);
      setStatus(`Salvo com backup em ${result.backup}.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível salvar.');
    }
  }

  function recoverDraft() {
    if (!draft || !editor) return;
    setMarkdown(draft);
    try {
      editor.commands.setContent(documentToTiptap(parseMarkdown(draft)), { emitUpdate: false });
      setMode('visual');
    } catch {
      setMode('source');
    }
    setDirty(true);
    setDraft(null);
    setStatus('Rascunho recuperado. Revise antes de salvar.');
  }

  function discardDraft() {
    localStorage.removeItem(`documentation-draft:v${DRAFT_VERSION}:${pageId}`);
    setDraft(null);
    setStatus('Rascunho descartado.');
  }

  function setLink() {
    if (!editor) return;
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Endereço do link', previous ?? 'https://');
    if (url === null) return;
    if (url === '') editor.chain().focus().unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }

  function insertAdvanced(block: DocumentBlock) {
    editor
      ?.chain()
      .focus()
      .insertContent({ type: 'advancedBlock', attrs: { block: JSON.stringify(block) } })
      .run();
    setSlashOpen(false);
  }

  const ask = (label: string, initial = '') => window.prompt(label, initial)?.trim();
  const paragraph = (value: string): DocumentBlock => ({
    type: 'paragraph',
    children: [{ type: 'text', value, marks: [] }],
  });

  function insertConfigured(type: string) {
    if (type === 'table') {
      const rowCount = Math.max(2, Math.min(20, Number(ask('Quantidade de linhas', '3')) || 3));
      const columnCount = Math.max(2, Math.min(8, Number(ask('Quantidade de colunas', '2')) || 2));
      insertAdvanced({
        type: 'table',
        align: Array(columnCount).fill(null),
        rows: Array.from({ length: rowCount }, (_, row) =>
          Array.from({ length: columnCount }, (_, column) => [
            {
              type: 'text',
              value: row === 0 ? `Coluna ${column + 1}` : '',
              marks: [],
            },
          ]),
        ),
      });
    } else if (type === 'callout') {
      const tone = ask('Tom: info, warning ou danger', 'info');
      if (!tone) return;
      insertAdvanced({
        type: 'callout',
        tone: tone === 'warning' || tone === 'danger' ? tone : 'info',
        title: ask('Título do aviso (opcional)'),
        children: [paragraph('Escreva o aviso.')],
      });
    } else if (type === 'toggle') {
      insertAdvanced({
        type: 'toggle',
        title: ask('Título', 'Mais detalhes') || 'Mais detalhes',
        children: [paragraph('Escreva os detalhes.')],
      });
    } else if (type === 'columns') {
      const count = Math.max(
        2,
        Math.min(4, Number(ask('Quantidade de colunas (2 a 4)', '2')) || 2),
      );
      insertAdvanced({
        type: 'columns',
        columns: Array.from({ length: count }, (_, index) => [paragraph(`Coluna ${index + 1}`)]),
      });
    } else if (type === 'date') {
      const value = ask('Data no formato AAAA-MM-DD', new Date().toISOString().slice(0, 10));
      if (value) insertAdvanced({ type: 'date', value, label: ask('Texto exibido (opcional)') });
    } else if (type === 'embed') {
      const provider = ask('Provedor: figma ou miro', 'figma');
      const url = ask('URL HTTPS do embed');
      if (url && (provider === 'figma' || provider === 'miro')) {
        insertAdvanced({
          type: 'embed',
          provider,
          url,
          title: ask('Título acessível (opcional)'),
        });
      }
    } else if (type === 'divider') {
      insertAdvanced({ type: 'thematicBreak' });
    } else if (type === 'code') {
      const language = ask('Linguagem do código (opcional)');
      editor
        ?.chain()
        .focus()
        .toggleCodeBlock()
        .updateAttributes('codeBlock', { language: language || null })
        .run();
      setSlashOpen(false);
    }
  }

  async function uploadAsset(file: File) {
    setUploading(true);
    setStatus('Enviando arquivo local…');
    try {
      const form = new FormData();
      form.set('file', file);
      const response = await fetch('/api/assets', { method: 'POST', body: form });
      const result = (await response.json()) as { src?: string; kind?: string; error?: string };
      if (!response.ok || !result.src) throw new Error(result.error ?? 'Falha no envio.');
      if (result.kind === 'image') {
        const alt = ask('Texto alternativo da imagem');
        if (alt === undefined) return;
        insertAdvanced({ type: 'image', src: result.src, alt, title: ask('Título (opcional)') });
      } else if (result.kind === 'audio') {
        insertAdvanced({
          type: 'audio',
          src: result.src,
          title: ask('Título do áudio (opcional)'),
        });
      } else if (result.kind === 'video') {
        insertAdvanced({
          type: 'video',
          src: result.src,
          title: ask('Título do vídeo (opcional)'),
          caption: ask('Legenda (opcional)'),
        });
      } else {
        insertAdvanced({
          type: 'file',
          src: result.src,
          label: ask('Rótulo do arquivo', file.name) || file.name,
          description: ask('Descrição (opcional)'),
        });
      }
      setStatus('Arquivo enviado e bloco inserido.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível enviar o arquivo.');
    } finally {
      setUploading(false);
    }
  }

  if (!page)
    return (
      <p aria-live="polite" className="loading">
        {status}
      </p>
    );

  return (
    <section aria-labelledby="editor-title" className="workspace">
      <div className="workspace-heading">
        <div>
          <p className="eyebrow">Editando</p>
          <h1 id="editor-title">{page.title}</h1>
        </div>
        <div className="save-area">
          <span className={dirty ? 'dirty' : 'saved'}>
            {dirty ? 'Alterações não salvas' : 'Salvo'}
          </span>
          <button disabled={!dirty} onClick={() => void save()} type="button">
            Salvar
          </button>
        </div>
      </div>

      {draft ? (
        <aside className="draft-banner">
          <p>Existe um rascunho local diferente do arquivo salvo.</p>
          <button onClick={recoverDraft} type="button">
            Recuperar
          </button>
          <button onClick={discardDraft} type="button">
            Descartar
          </button>
        </aside>
      ) : null}

      <div aria-label="Modo de edição" className="mode-tabs" role="tablist">
        {(['visual', 'source', 'preview'] as const).map((item) => (
          <button
            aria-selected={mode === item}
            key={item}
            onClick={() => selectMode(item)}
            role="tab"
            type="button"
          >
            {{ visual: 'Visual', source: 'Markdown', preview: 'Prévia' }[item]}
          </button>
        ))}
      </div>

      {mode === 'visual' ? (
        <>
          <div aria-label="Formatação" className="toolbar" role="toolbar">
            <button
              aria-pressed={editor?.isActive('bold')}
              onClick={() => editor?.chain().focus().toggleBold().run()}
              type="button"
            >
              <strong>N</strong>
            </button>
            <button
              aria-pressed={editor?.isActive('italic')}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              type="button"
            >
              <em>I</em>
            </button>
            <button
              aria-pressed={editor?.isActive('underline')}
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              type="button"
            >
              <u>S</u>
            </button>
            <button onClick={setLink} type="button">
              Link
            </button>
            <button onClick={() => setSlashOpen((open) => !open)} type="button">
              / Inserir
            </button>
            <button onClick={() => editor?.chain().focus().undo().run()} type="button">
              Desfazer
            </button>
            <button onClick={() => editor?.chain().focus().redo().run()} type="button">
              Refazer
            </button>
          </div>
          {slashOpen ? (
            <div aria-label="Inserir bloco" className="slash-menu" role="menu">
              <button
                onClick={() => {
                  editor?.chain().focus().toggleHeading({ level: 2 }).run();
                  setSlashOpen(false);
                }}
                role="menuitem"
                type="button"
              >
                Título 2
              </button>
              <button
                onClick={() => {
                  editor?.chain().focus().toggleBulletList().run();
                  setSlashOpen(false);
                }}
                role="menuitem"
                type="button"
              >
                Lista
              </button>
              <button
                onClick={() => {
                  editor?.chain().focus().toggleTaskList().run();
                  setSlashOpen(false);
                }}
                role="menuitem"
                type="button"
              >
                Tarefas
              </button>
              <button
                onClick={() => {
                  insertConfigured('code');
                }}
                role="menuitem"
                type="button"
              >
                Código
              </button>
              {[
                ['table', 'Tabela'],
                ['callout', 'Aviso'],
                ['toggle', 'Expansível'],
                ['divider', 'Divisor'],
                ['columns', 'Colunas'],
                ['date', 'Data'],
                ['embed', 'Embed Figma/Miro'],
              ].map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => insertConfigured(type)}
                  role="menuitem"
                  type="button"
                >
                  {label}
                </button>
              ))}
              <label className="upload-control">
                {uploading ? 'Enviando…' : 'Imagem, áudio, vídeo ou arquivo'}
                <input
                  disabled={uploading}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void uploadAsset(file);
                    event.currentTarget.value = '';
                  }}
                  type="file"
                />
              </label>
            </div>
          ) : null}
          <div className="editor-frame">
            <EditorContent editor={editor} />
          </div>
        </>
      ) : null}

      {mode === 'source' ? (
        <textarea
          aria-label="Fonte Markdown"
          className="source-editor"
          onChange={(event) => {
            setMarkdown(event.target.value);
            setDirty(true);
          }}
          spellCheck="true"
          value={markdown}
        />
      ) : null}

      {mode === 'preview' ? (
        preview.error ? (
          <p className="error">{preview.error}</p>
        ) : (
          <article className="preview" dangerouslySetInnerHTML={{ __html: preview.html }} />
        )
      ) : null}

      <p aria-live="polite" className="status">
        {status}
      </p>
    </section>
  );
}
