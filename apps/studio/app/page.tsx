import { RepositoryError, readSiteCatalog } from '@documentation-page/content/repository';
import { siteRoot } from '@/lib/site-root';
import { StudioClient } from './studio-client';

export const dynamic = 'force-dynamic';

export default async function StudioPage() {
  try {
    const catalog = await readSiteCatalog(siteRoot());
    const pages = catalog.tabs.flatMap((tab) =>
      tab.pages.map((pageId) => ({
        id: pageId,
        title: catalog.pages[pageId].title,
        tab: tab.title,
      })),
    );
    return <StudioClient brand={catalog.site.brand} pages={pages} title={catalog.site.title} />;
  } catch (error) {
    const message =
      error instanceof RepositoryError
        ? error.message
        : 'Não foi possível abrir a instalação local.';
    return (
      <main className="setup-state">
        <p className="eyebrow">Estúdio local</p>
        <h1>Prepare uma instalação em Markdown</h1>
        <p>{message}</p>
        <p>
          Crie <code>site/site.json</code> e ao menos uma página <code>site/pages/*.md</code> no
          formato v1.
        </p>
      </main>
    );
  }
}
