'use client';

import { parseMarkdown } from '@documentation-page/content/markdown';
import type { SiteCatalog } from '@documentation-page/content/site';
import { renderDocumentToHtml } from '@documentation-page/renderer';
import { useMemo, useRef, useState } from 'react';

type Preview = {
  bytes: number;
  fileName: string;
  html: string;
  kind: 'docx' | 'html' | 'markdown' | 'notion' | 'pdf' | 'text';
  markdown: string;
  warnings: string[];
};

type Destination = 'create' | 'replace';

const kindLabels: Record<Preview['kind'], string> = {
  docx: 'Word DOCX',
  html: 'HTML',
  markdown: 'Markdown',
  notion: 'Notion ZIP',
  pdf: 'PDF',
  text: 'texto simples',
};

export function ImportDialog({
  catalog,
  catalogRevision,
  onApplied,
  onClose,
}: {
  catalog: SiteCatalog;
  catalogRevision: string;
  onApplied: (catalog: SiteCatalog, revision: string, pageId: string) => void;
  onClose: () => void;
}) {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [markdown, setMarkdown] = useState('');
  const [status, setStatus] = useState(
    'Selecione Markdown, texto, HTML, DOCX, PDF ou ZIP do Notion de até 10 MiB.',
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [destination, setDestination] = useState<Destination>('create');
  const [tabId, setTabId] = useState(catalog.tabs[0]?.id ?? '');
  const [pageId, setPageId] = useState('');
  const [title, setTitle] = useState('');
  const [existingPageId, setExistingPageId] = useState(
    catalog.tabs.flatMap((tab) => tab.pages)[0] ?? '',
  );
  const controller = useRef<AbortController | null>(null);

  const rendered = useMemo(() => {
    if (!preview) return { html: '', error: '' };
    try {
      return { html: renderDocumentToHtml(parseMarkdown(markdown)), error: '' };
    } catch {
      return { html: '', error: 'Corrija o Markdown para atualizar a prévia.' };
    }
  }, [markdown, preview]);

  async function upload(file: File) {
    controller.current?.abort();
    const nextController = new AbortController();
    controller.current = nextController;
    const timeout = window.setTimeout(() => nextController.abort(), 10_000);
    setLoading(true);
    setStatus('Preparando a prévia…');
    try {
      const form = new FormData();
      form.set('file', file);
      const response = await fetch('/api/imports/preview', {
        method: 'POST',
        body: form,
        signal: nextController.signal,
      });
      const result = (await response.json()) as Preview & { error?: string };
      if (!response.ok) throw new Error(result.error ?? 'Não foi possível importar o arquivo.');
      setPreview(result);
      setMarkdown(result.markdown);
      const suggestedTitle =
        result.markdown.match(/^#\s+(.+)$/m)?.[1]?.trim() ??
        result.fileName.replace(/\.(?:docx|html?|md|markdown|pdf|txt|zip)$/i, '');
      setTitle(suggestedTitle);
      setPageId(
        suggestedTitle
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, ''),
      );
      setStatus('Prévia pronta. Nenhum arquivo da instalação foi alterado.');
    } catch (error) {
      setPreview(null);
      setMarkdown('');
      setStatus(
        nextController.signal.aborted
          ? 'A importação foi cancelada ou excedeu 10 segundos.'
          : error instanceof Error
            ? error.message
            : 'Não foi possível importar o arquivo.',
      );
    } finally {
      window.clearTimeout(timeout);
      if (controller.current === nextController) controller.current = null;
      setLoading(false);
    }
  }

  async function applyImport() {
    if (!preview) return;
    setSaving(true);
    setStatus('Confirmando a importação…');
    try {
      if (destination === 'replace') {
        if (!existingPageId) throw new Error('Escolha uma página existente.');
        const openedResponse = await fetch(`/api/pages/${encodeURIComponent(existingPageId)}`);
        const opened = (await openedResponse.json()) as { revision?: string; error?: string };
        if (!openedResponse.ok || !opened.revision) {
          throw new Error(opened.error ?? 'Não foi possível abrir a página de destino.');
        }
        const response = await fetch(`/api/pages/${encodeURIComponent(existingPageId)}`, {
          method: 'PUT',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ markdown, revision: opened.revision }),
        });
        const result = (await response.json()) as { backup?: string; error?: string };
        if (!response.ok) throw new Error(result.error ?? 'Não foi possível substituir a página.');
        onApplied(catalog, catalogRevision, existingPageId);
        return;
      }

      if (!tabId || !pageId.trim() || !title.trim()) {
        throw new Error('Aba, ID e título da nova página são obrigatórios.');
      }
      const response = await fetch('/api/catalog', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          revision: catalogRevision,
          operation: {
            type: 'createPage',
            tabId,
            id: pageId.trim(),
            title: title.trim(),
            markdown,
          },
        }),
      });
      const result = (await response.json()) as {
        catalog?: SiteCatalog;
        revision?: string;
        backup?: string;
        error?: string;
      };
      if (!response.ok || !result.catalog || !result.revision) {
        throw new Error(result.error ?? 'Não foi possível criar a página.');
      }
      onApplied(result.catalog, result.revision, pageId.trim());
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Não foi possível aplicar a importação.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div aria-labelledby="import-title" aria-modal="true" className="dialog-backdrop" role="dialog">
      <section className="settings-dialog import-dialog">
        <div className="dialog-heading">
          <div>
            <p className="eyebrow">Importação segura</p>
            <h2 id="import-title">Revisar arquivo</h2>
          </div>
          <button
            onClick={() => {
              controller.current?.abort();
              onClose();
            }}
            type="button"
          >
            Fechar
          </button>
        </div>
        <label className="import-file">
          Arquivo
          <input
            accept=".docx,.htm,.html,.md,.markdown,.pdf,.txt,.zip,text/html,text/markdown,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/zip"
            disabled={loading}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
            }}
            type="file"
          />
        </label>
        {loading ? (
          <button onClick={() => controller.current?.abort()} type="button">
            Cancelar importação
          </button>
        ) : null}
        <p aria-live="polite" className="form-status">
          {status}
        </p>
        {preview ? (
          <>
            <p className="import-summary">
              <strong>{preview.fileName}</strong> · {preview.bytes} bytes ·{' '}
              {kindLabels[preview.kind]}
            </p>
            {preview.warnings.map((warning) => (
              <p className="import-warning" key={warning}>
                Atenção: {warning}
              </p>
            ))}
            <div className="import-review">
              <label>
                Markdown normalizado e editável
                <textarea onChange={(event) => setMarkdown(event.target.value)} value={markdown} />
              </label>
              <section aria-label="Prévia do conteúdo" className="document-preview">
                {rendered.error ? (
                  <p>{rendered.error}</p>
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: rendered.html }} />
                )}
              </section>
            </div>
            <fieldset className="import-destination">
              <legend>Destino</legend>
              <label>
                <input
                  checked={destination === 'create'}
                  name="import-destination"
                  onChange={() => setDestination('create')}
                  type="radio"
                />
                Criar uma página
              </label>
              <label>
                <input
                  checked={destination === 'replace'}
                  name="import-destination"
                  onChange={() => setDestination('replace')}
                  type="radio"
                />
                Substituir uma página existente
              </label>
            </fieldset>
            {destination === 'create' ? (
              <div className="import-fields">
                <label>
                  Aba
                  <select onChange={(event) => setTabId(event.target.value)} value={tabId}>
                    {catalog.tabs.map((tab) => (
                      <option key={tab.id} value={tab.id}>
                        {tab.title}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  ID da nova página
                  <input onChange={(event) => setPageId(event.target.value)} value={pageId} />
                </label>
                <label>
                  Título da nova página
                  <input onChange={(event) => setTitle(event.target.value)} value={title} />
                </label>
              </div>
            ) : (
              <label className="import-existing">
                Página que será substituída
                <select
                  onChange={(event) => setExistingPageId(event.target.value)}
                  value={existingPageId}
                >
                  {catalog.tabs.flatMap((tab) =>
                    tab.pages.map((candidateId) => (
                      <option key={candidateId} value={candidateId}>
                        {tab.title} — {catalog.pages[candidateId].title}
                      </option>
                    )),
                  )}
                </select>
              </label>
            )}
            <p className="import-warning">
              {destination === 'create'
                ? 'A confirmação criará um arquivo Markdown e atualizará o catálogo.'
                : 'A confirmação substituirá todo o conteúdo da página escolhida depois de criar um backup.'}
            </p>
            <button disabled={saving} onClick={() => void applyImport()} type="button">
              {saving
                ? 'Salvando…'
                : destination === 'create'
                  ? 'Confirmar e criar página'
                  : 'Confirmar e substituir página'}
            </button>
          </>
        ) : null}
      </section>
    </div>
  );
}
