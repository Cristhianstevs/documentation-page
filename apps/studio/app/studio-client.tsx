'use client';

import type { SiteCatalog } from '@documentation-page/content/site';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { SettingsDialog } from './settings-dialog';

const EditorWorkspace = dynamic(() => import('./editor-workspace'), {
  loading: () => <p className="loading">Carregando o editor…</p>,
  ssr: false,
});

function pageOptions(catalog: SiteCatalog) {
  return catalog.tabs.flatMap((tab) =>
    tab.pages.map((pageId) => ({
      id: pageId,
      title: catalog.pages[pageId].title,
      tab: tab.title,
    })),
  );
}

export function StudioClient({
  initialCatalog,
  initialRevision,
}: {
  initialCatalog: SiteCatalog;
  initialRevision: string;
}) {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [revision, setRevision] = useState(initialRevision);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pages = pageOptions(catalog);
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
          <span className="brand">{catalog.site.brand}</span>
          <p>{catalog.site.title}</p>
        </div>
        <div className="header-actions">
          <button onClick={() => setSettingsOpen(true)} type="button">
            Configurações
          </button>
          {editing ? (
            <button onClick={() => mayLeave() && setEditing(false)} type="button">
              Fechar editor
            </button>
          ) : (
            <button disabled={!pageId} onClick={() => setEditing(true)} type="button">
              Editar
            </button>
          )}
        </div>
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
      <SettingsDialog
        initialRevision={revision}
        onCatalogChange={(nextCatalog, nextRevision) => {
          setCatalog(nextCatalog);
          setRevision(nextRevision);
          if (!nextCatalog.pages[pageId]) {
            setEditing(false);
            setDirty(false);
            setPageId(pageOptions(nextCatalog)[0]?.id ?? '');
          }
        }}
        onClose={() => setSettingsOpen(false)}
        open={settingsOpen}
      />
    </main>
  );
}
