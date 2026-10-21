import { legacySitePromise } from '@/lib/legacy-site';

export default async function NotFound() {
  const site = await legacySitePromise;
  const firstTab = site.tabs[0];
  const firstPage = firstTab?.pages[0];
  const fallback = firstTab && firstPage ? `/${firstTab.id}/${firstPage.id}/` : '/';

  return (
    <main className="entry-page">
      <p className="eyebrow">Rota inválida</p>
      <h1>Página não encontrada</h1>
      <p>O endereço não corresponde a uma página cadastrada nesta documentação.</p>
      <a className="primary-link" href={fallback}>
        Ir para a primeira página
      </a>
    </main>
  );
}
