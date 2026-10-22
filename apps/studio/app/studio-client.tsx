'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const EditorWorkspace = dynamic(() => import('./editor-workspace'), {
  loading: () => <p className="loading">Carregando o editor…</p>,
  ssr: false,
});

type PageOption = { id: string; title: string; tab: string };

export function StudioClient({
  brand,
  pages,
  title,
}: {
  brand: string;
  pages: PageOption[];
  title: string;
}) {
  const [pageId, setPageId] = useState(pages[0]?.id ?? '');
  const [editing, setEditing] = useState(false);
  const [dirty, setDirty] = useState(false);

  function mayLeave() {
    return !dirty || window.confirm('Há alterações não salvas. Deseja descartá-las?');
  }

  return (
    <main className="studio-shell">
      <header className="studio-header">
        <div>
          <span className="brand">{brand}</span>
          <p>{title}</p>
        </div>
        {editing ? (
          <button onClick={() => mayLeave() && setEditing(false)} type="button">
            Fechar editor
          </button>
        ) : (
          <button disabled={!pageId} onClick={() => setEditing(true)} type="button">
            Editar
          </button>
        )}
      </header>
      <nav aria-label="Páginas" className="page-picker">
        <label htmlFor="studio-page">Página</label>
        <select
          id="studio-page"
          onChange={(event) => {
            if (!mayLeave()) return;
            setEditing(false);
            setDirty(false);
            setPageId(event.target.value);
          }}
          value={pageId}
        >
          {pages.map((page) => (
            <option key={page.id} value={page.id}>
              {page.tab} — {page.title}
            </option>
          ))}
        </select>
      </nav>
      {editing ? (
        <EditorWorkspace key={pageId} onDirtyChange={setDirty} pageId={pageId} />
      ) : (
        <section className="welcome">
          <p className="eyebrow">Escrita manual</p>
          <h1>{pages.find((page) => page.id === pageId)?.title ?? 'Nenhuma página cadastrada'}</h1>
          <p>
            O editor será baixado somente depois de selecionar <strong>Editar</strong>.
          </p>
        </section>
      )}
    </main>
  );
}
