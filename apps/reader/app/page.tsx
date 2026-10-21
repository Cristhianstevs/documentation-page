import Link from 'next/link';
import { legacySitePromise } from '@/lib/legacy-site';

export default async function HomePage() {
  const site = await legacySitePromise;
  const firstTab = site.tabs[0];
  const firstPage = firstTab?.pages[0];

  return (
    <main className="entry-page">
      <p className="eyebrow">Experimento da Etapa 1</p>
      <h1>Leitor Next.js</h1>
      <p>
        Esta tela prova que o novo leitor pode gerar HTML estático sem substituir a versão atual.
      </p>
      {firstTab && firstPage ? (
        <Link className="primary-link" href={`/${firstTab.id}/${firstPage.id}/`}>
          Abrir {site.appSettings.siteTitle}
        </Link>
      ) : (
        <p>Nenhuma página foi cadastrada.</p>
      )}
    </main>
  );
}
