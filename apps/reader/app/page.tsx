import { legacySitePromise } from '@/lib/legacy-site';

export default async function HomePage() {
  const site = await legacySitePromise;
  const firstTab = site.tabs[0];
  const firstPage = firstTab?.pages[0];
  const firstRoute = firstTab && firstPage ? `/${firstTab.id}/${firstPage.id}/` : '/';
  const routes = site.tabs.flatMap((tab) =>
    tab.pages.map((page) => ({ pageId: page.id, tabId: tab.id })),
  );
  const serializedRoutes = JSON.stringify(routes).replaceAll('<', '\\u003c');

  return (
    <main className="entry-page">
      <p className="eyebrow">Experimento da Etapa 1</p>
      <h1>Leitor Next.js</h1>
      <p>
        Esta tela prova que o novo leitor pode gerar HTML estático sem substituir a versão atual.
      </p>
      {firstTab && firstPage ? (
        <>
          <a className="primary-link" href={firstRoute}>
            Abrir {site.appSettings.siteTitle}
          </a>
          <p role="status">Abrindo a documentação…</p>
          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){var routes=${serializedRoutes},parts=decodeURIComponent(location.hash.slice(1)).split('/').filter(Boolean),route=routes.find(function(item){return item.tabId===parts[0]&&item.pageId===parts[1]});if(route){location.replace('/'+route.tabId+'/'+route.pageId+'/'+(parts[2]?'#'+encodeURIComponent(parts[2]):''))}else{location.replace('${firstRoute}')}})()`,
            }}
          />
        </>
      ) : (
        <p>Nenhuma página foi cadastrada.</p>
      )}
    </main>
  );
}
