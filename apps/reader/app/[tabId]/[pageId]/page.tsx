import Link from 'next/link';
import { notFound } from 'next/navigation';
import { legacySitePromise } from '@/lib/legacy-site';

type PageProperties = {
  params: Promise<{ tabId: string; pageId: string }>;
};

export async function generateStaticParams() {
  const site = await legacySitePromise;
  return site.tabs.flatMap((tab) => tab.pages.map((page) => ({ tabId: tab.id, pageId: page.id })));
}

export const dynamicParams = false;

export default async function DocumentationPage({ params }: PageProperties) {
  const route = await params;
  const site = await legacySitePromise;
  const activeTab = site.tabs.find((tab) => tab.id === route.tabId);
  const activePage = activeTab?.pages.find((page) => page.id === route.pageId);

  if (!activeTab || !activePage) notFound();

  return (
    <div className="reader-shell">
      <header className="reader-header">
        <Link className="brand" href="/">
          {site.appSettings.logoText}
        </Link>
        <nav aria-label="Abas da documentação">
          {site.tabs.map((tab) => (
            <Link
              aria-current={tab.id === activeTab.id ? 'page' : undefined}
              className="tab-link"
              href={`/${tab.id}/${tab.pages[0].id}/`}
              key={tab.id}
            >
              {tab.title}
            </Link>
          ))}
        </nav>
      </header>

      <aside className="page-sidebar" aria-label="Páginas da aba">
        <p className="sidebar-label">Nesta aba</p>
        {activeTab.pages.map((page) => (
          <Link
            aria-current={page.id === activePage.id ? 'page' : undefined}
            className="page-link"
            href={`/${activeTab.id}/${page.id}/`}
            key={page.id}
          >
            {page.title}
          </Link>
        ))}
      </aside>

      <main className="document-content">
        <p className="eyebrow">{activeTab.title}</p>
        {activePage.issues.map((issue) => (
          <p className="content-warning" key={issue} role="status">
            {issue}
          </p>
        ))}
        <div dangerouslySetInnerHTML={{ __html: activePage.html }} />
      </main>

      <aside className="table-of-contents" aria-label="Nesta página">
        <p className="sidebar-label">Nesta página</p>
        {activePage.headings.map((heading) => (
          <a className={`toc-level-${heading.level}`} href={`#${heading.id}`} key={heading.id}>
            {heading.text}
          </a>
        ))}
      </aside>
    </div>
  );
}
