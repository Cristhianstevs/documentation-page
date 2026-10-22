'use client';

import type { CatalogOperation, TrashItem } from '@documentation-page/content/catalog-repository';
import type { SiteCatalog } from '@documentation-page/content/site';
import { useEffect, useRef, useState } from 'react';

type CatalogResponse = {
  catalog: SiteCatalog;
  revision: string;
  trash: TrashItem[];
  error?: string;
};

const slug = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const text = (form: FormData, name: string) => String(form.get(name) ?? '');

export function SettingsDialog({
  initialRevision,
  onCatalogChange,
  onClose,
  open,
}: {
  initialRevision: string;
  onCatalogChange: (catalog: SiteCatalog, revision: string) => void;
  onClose: () => void;
  open: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [catalog, setCatalog] = useState<SiteCatalog | null>(null);
  const [revision, setRevision] = useState(initialRevision);
  const [trash, setTrash] = useState<TrashItem[]>([]);
  const [status, setStatus] = useState('');
  const [pending, setPending] = useState(false);

  async function reload() {
    setPending(true);
    try {
      const response = await fetch('/api/catalog', { cache: 'no-store' });
      const result = (await response.json()) as CatalogResponse;
      if (!response.ok) throw new Error(result.error ?? 'Não foi possível abrir as configurações.');
      setCatalog(result.catalog);
      setRevision(result.revision);
      setTrash(result.trash);
      onCatalogChange(result.catalog, result.revision);
      setStatus('Configurações atualizadas.');
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : 'Não foi possível abrir as configurações.',
      );
    } finally {
      setPending(false);
    }
  }

  useEffect(() => {
    if (!open) {
      dialog.current?.close();
      return;
    }
    dialog.current?.showModal();
    void reload();
  }, [open]);

  async function run(operation: CatalogOperation, success: string) {
    setPending(true);
    setStatus('Salvando configuração…');
    try {
      const response = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ revision, operation }),
      });
      const result = (await response.json()) as CatalogResponse;
      if (!response.ok) throw new Error(result.error ?? 'Não foi possível salvar a configuração.');
      setCatalog(result.catalog);
      setRevision(result.revision);
      setTrash(result.trash);
      onCatalogChange(result.catalog, result.revision);
      setStatus(`${success} Backup do catálogo criado.`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível salvar a configuração.');
    } finally {
      setPending(false);
    }
  }

  function submit(
    event: React.FormEvent<HTMLFormElement>,
    build: (data: FormData) => CatalogOperation,
    success: string,
  ) {
    event.preventDefault();
    void run(build(new FormData(event.currentTarget)), success);
  }

  return (
    <dialog
      aria-labelledby="settings-title"
      className="settings-dialog"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      ref={dialog}
    >
      <header className="settings-header">
        <div>
          <p className="eyebrow">Catálogo v1</p>
          <h2 id="settings-title">Configurações</h2>
        </div>
        <button aria-label="Fechar configurações" onClick={onClose} type="button">
          ×
        </button>
      </header>

      {!catalog ? (
        <p className="loading">{status || 'Carregando configurações…'}</p>
      ) : (
        <div className="settings-content">
          <section aria-labelledby="site-settings">
            <h3 id="site-settings">Site</h3>
            <form
              className="settings-form"
              onSubmit={(event) =>
                submit(
                  event,
                  (data) => ({
                    type: 'updateSite',
                    title: text(data, 'title'),
                    brand: text(data, 'brand'),
                    language: text(data, 'language'),
                    defaultTheme: text(data, 'defaultTheme') as 'light' | 'dark' | 'system',
                  }),
                  'Identidade atualizada.',
                )
              }
            >
              <label>
                Título
                <input defaultValue={catalog.site.title} name="title" required />
              </label>
              <label>
                Marca
                <input defaultValue={catalog.site.brand} name="brand" required />
              </label>
              <label>
                Idioma
                <input defaultValue={catalog.site.language} name="language" required />
              </label>
              <label>
                Tema padrão
                <select defaultValue={catalog.site.defaultTheme} name="defaultTheme">
                  <option value="system">Sistema</option>
                  <option value="light">Claro</option>
                  <option value="dark">Escuro</option>
                </select>
              </label>
              <button disabled={pending} type="submit">
                Salvar site
              </button>
            </form>
          </section>

          <section aria-labelledby="tab-settings">
            <h3 id="tab-settings">Abas</h3>
            <form
              className="create-row"
              onSubmit={(event) =>
                submit(
                  event,
                  (data) => ({
                    type: 'createTab',
                    id: text(data, 'id'),
                    title: text(data, 'title'),
                  }),
                  'Aba criada.',
                )
              }
            >
              <label>
                Nova aba
                <input
                  name="title"
                  onChange={(event) => {
                    const input = event.currentTarget.form?.elements.namedItem('id');
                    if (input instanceof HTMLInputElement && !input.dataset.edited)
                      input.value = slug(event.currentTarget.value);
                  }}
                  placeholder="Nome da aba"
                  required
                />
              </label>
              <label>
                ID
                <input
                  name="id"
                  onInput={(event) => {
                    event.currentTarget.dataset.edited = 'true';
                  }}
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  required
                />
              </label>
              <button disabled={pending} type="submit">
                Criar aba
              </button>
            </form>
            <div className="settings-list">
              {catalog.tabs.map((tab, index) => (
                <article className="settings-card" key={tab.id}>
                  <form
                    onSubmit={(event) =>
                      submit(
                        event,
                        (data) => ({
                          type: 'renameTab',
                          tabId: tab.id,
                          title: text(data, 'title'),
                        }),
                        'Aba renomeada.',
                      )
                    }
                  >
                    <label>
                      Título
                      <input defaultValue={tab.title} name="title" required />
                    </label>
                    <button disabled={pending} type="submit">
                      Atualizar
                    </button>
                  </form>
                  <div className="row-actions">
                    <button
                      aria-label={`Mover ${tab.title} para cima`}
                      disabled={pending || index === 0}
                      onClick={() =>
                        void run(
                          { type: 'moveTab', tabId: tab.id, index: index - 1 },
                          'Aba movida.',
                        )
                      }
                      type="button"
                    >
                      ↑
                    </button>
                    <button
                      aria-label={`Mover ${tab.title} para baixo`}
                      disabled={pending || index === catalog.tabs.length - 1}
                      onClick={() =>
                        void run(
                          { type: 'moveTab', tabId: tab.id, index: index + 1 },
                          'Aba movida.',
                        )
                      }
                      type="button"
                    >
                      ↓
                    </button>
                    <button
                      disabled={pending || tab.pages.length > 0}
                      onClick={() =>
                        window.confirm(`Remover a aba vazia “${tab.title}”?`) &&
                        void run({ type: 'removeTab', tabId: tab.id }, 'Aba removida.')
                      }
                      type="button"
                    >
                      Remover
                    </button>
                  </div>
                  {tab.pages.length ? (
                    <p className="hint">
                      Mova ou remova as {tab.pages.length} página(s) antes de excluir a aba.
                    </p>
                  ) : null}
                  <details>
                    <summary>Alterar ID avançado</summary>
                    <p className="warning">
                      Mudar o ID altera URLs. Um alias será criado automaticamente.
                    </p>
                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        const data = new FormData(event.currentTarget);
                        const nextId = text(data, 'nextId');
                        if (window.confirm(`Alterar o ID ${tab.id} para ${nextId}?`))
                          void run(
                            { type: 'renameTabId', tabId: tab.id, nextId },
                            'ID da aba alterado e alias criado.',
                          );
                      }}
                    >
                      <input
                        aria-label={`Novo ID da aba ${tab.title}`}
                        defaultValue={tab.id}
                        name="nextId"
                        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                        required
                      />
                      <button disabled={pending} type="submit">
                        Alterar ID
                      </button>
                    </form>
                  </details>
                </article>
              ))}
            </div>
          </section>

          <section aria-labelledby="page-settings">
            <h3 id="page-settings">Páginas</h3>
            {catalog.tabs.length ? (
              <form
                className="create-row"
                onSubmit={(event) =>
                  submit(
                    event,
                    (data) => ({
                      type: 'createPage',
                      tabId: text(data, 'tabId'),
                      id: text(data, 'id'),
                      title: text(data, 'title'),
                    }),
                    'Página criada.',
                  )
                }
              >
                <label>
                  Nova página
                  <input
                    name="title"
                    onChange={(event) => {
                      const input = event.currentTarget.form?.elements.namedItem('id');
                      if (input instanceof HTMLInputElement && !input.dataset.edited)
                        input.value = slug(event.currentTarget.value);
                    }}
                    placeholder="Nome da página"
                    required
                  />
                </label>
                <label>
                  ID
                  <input
                    name="id"
                    onInput={(event) => {
                      event.currentTarget.dataset.edited = 'true';
                    }}
                    pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                    required
                  />
                </label>
                <label>
                  Aba
                  <select name="tabId">
                    {catalog.tabs.map((tab) => (
                      <option key={tab.id} value={tab.id}>
                        {tab.title}
                      </option>
                    ))}
                  </select>
                </label>
                <button disabled={pending} type="submit">
                  Criar página
                </button>
              </form>
            ) : (
              <p>Crie uma aba antes de adicionar páginas.</p>
            )}
            <div className="settings-list">
              {catalog.tabs.flatMap((tab) =>
                tab.pages.map((pageId, index) => {
                  const page = catalog.pages[pageId];
                  return (
                    <article className="settings-card" key={pageId}>
                      <p className="card-label">
                        {tab.title} · <code>{pageId}</code>
                      </p>
                      <form
                        onSubmit={(event) =>
                          submit(
                            event,
                            (data) => ({ type: 'renamePage', pageId, title: text(data, 'title') }),
                            'Página renomeada.',
                          )
                        }
                      >
                        <label>
                          Título
                          <input defaultValue={page.title} name="title" required />
                        </label>
                        <button disabled={pending} type="submit">
                          Atualizar
                        </button>
                      </form>
                      <div className="row-actions">
                        <button
                          aria-label={`Mover ${page.title} para cima`}
                          disabled={pending || index === 0}
                          onClick={() =>
                            void run(
                              { type: 'movePage', pageId, tabId: tab.id, index: index - 1 },
                              'Página movida.',
                            )
                          }
                          type="button"
                        >
                          ↑
                        </button>
                        <button
                          aria-label={`Mover ${page.title} para baixo`}
                          disabled={pending || index === tab.pages.length - 1}
                          onClick={() =>
                            void run(
                              { type: 'movePage', pageId, tabId: tab.id, index: index + 1 },
                              'Página movida.',
                            )
                          }
                          type="button"
                        >
                          ↓
                        </button>
                        <label className="inline-label">
                          Mover para
                          <select
                            aria-label={`Mover ${page.title} para outra aba`}
                            disabled={pending}
                            onChange={(event) =>
                              void run(
                                {
                                  type: 'movePage',
                                  pageId,
                                  tabId: event.target.value,
                                  index:
                                    catalog.tabs.find((item) => item.id === event.target.value)
                                      ?.pages.length ?? 0,
                                },
                                'Página movida.',
                              )
                            }
                            value={tab.id}
                          >
                            {catalog.tabs.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.title}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          disabled={pending}
                          onClick={() =>
                            window.confirm(`Mover “${page.title}” para a lixeira?`) &&
                            void run(
                              { type: 'removePage', pageId },
                              'Página movida para a lixeira.',
                            )
                          }
                          type="button"
                        >
                          Lixeira
                        </button>
                      </div>
                      <details>
                        <summary>Duplicar ou alterar ID</summary>
                        <form
                          onSubmit={(event) =>
                            submit(
                              event,
                              (data) => ({
                                type: 'duplicatePage',
                                pageId,
                                tabId: text(data, 'tabId'),
                                id: text(data, 'id'),
                                title: text(data, 'title'),
                              }),
                              'Página duplicada.',
                            )
                          }
                        >
                          <input
                            aria-label="Título da cópia"
                            defaultValue={`${page.title} (cópia)`}
                            name="title"
                            required
                          />
                          <input
                            aria-label="ID da cópia"
                            defaultValue={`${pageId}-copia`}
                            name="id"
                            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                            required
                          />
                          <select aria-label="Aba da cópia" defaultValue={tab.id} name="tabId">
                            {catalog.tabs.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.title}
                              </option>
                            ))}
                          </select>
                          <button disabled={pending} type="submit">
                            Duplicar
                          </button>
                        </form>
                        <p className="warning">
                          Mudar o ID altera URLs e renomeia o arquivo. Um alias será criado.
                        </p>
                        <form
                          onSubmit={(event) => {
                            event.preventDefault();
                            const nextId = text(new FormData(event.currentTarget), 'nextId');
                            if (window.confirm(`Alterar o ID ${pageId} para ${nextId}?`))
                              void run(
                                { type: 'renamePageId', pageId, nextId },
                                'ID da página alterado e alias criado.',
                              );
                          }}
                        >
                          <input
                            aria-label={`Novo ID da página ${page.title}`}
                            defaultValue={pageId}
                            name="nextId"
                            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                            required
                          />
                          <button disabled={pending} type="submit">
                            Alterar ID
                          </button>
                        </form>
                      </details>
                    </article>
                  );
                }),
              )}
            </div>
          </section>

          <section aria-labelledby="trash-settings">
            <h3 id="trash-settings">Lixeira</h3>
            {trash.length ? (
              trash.map((item) => (
                <div className="trash-row" key={item.id}>
                  <span>
                    {item.title} <code>{item.pageId}</code>
                  </span>
                  <button
                    disabled={pending}
                    onClick={() =>
                      void run({ type: 'restorePage', trashId: item.id }, 'Página restaurada.')
                    }
                    type="button"
                  >
                    Restaurar
                  </button>
                </div>
              ))
            ) : (
              <p>Nenhuma página na lixeira.</p>
            )}
          </section>
        </div>
      )}

      <footer className="settings-footer">
        <p aria-live="polite" className="status">
          {status}
        </p>
        <button disabled={pending} onClick={() => void reload()} type="button">
          Recarregar
        </button>
        <button onClick={onClose} type="button">
          Concluir
        </button>
      </footer>
    </dialog>
  );
}
