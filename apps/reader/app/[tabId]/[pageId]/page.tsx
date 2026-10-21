import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ReaderHeader } from '@/app/components/reader-header';
import { legacySitePromise } from '@/lib/legacy-site';

type PageProperties = {
  params: Promise<{ tabId: string; pageId: string }>;
};

export async function generateStaticParams() {
  const site = await legacySitePromise;
  return site.tabs.flatMap((tab) => tab.pages.map((page) => ({ tabId: tab.id, pageId: page.id })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: PageProperties): Promise<Metadata> {
  const route = await params;
  const site = await legacySitePromise;
  const page = site.tabs
    .find((tab) => tab.id === route.tabId)
    ?.pages.find((candidate) => candidate.id === route.pageId);
  return {
    title: page ? `${page.title} | ${site.appSettings.siteTitle}` : site.appSettings.siteTitle,
  };
}

export default async function DocumentationPage({ params }: PageProperties) {
  const route = await params;
  const site = await legacySitePromise;
  const activeTab = site.tabs.find((tab) => tab.id === route.tabId);
  const activePage = activeTab?.pages.find((page) => page.id === route.pageId);

  if (!activeTab || !activePage) notFound();

  return (
    <div className="reader-shell">
      <ReaderHeader activeTab={activeTab} site={site} />

      <aside className="page-sidebar" aria-label="Páginas da aba" id="page-sidebar">
        <p className="sidebar-label">{site.appSettings.sidebarTitle}</p>
        {activeTab.pages.map((page) => (
          <a
            aria-current={page.id === activePage.id ? 'page' : undefined}
            className="page-link"
            href={`/${activeTab.id}/${page.id}/`}
            key={page.id}
          >
            {page.icon ? <span aria-hidden="true">{page.icon}</span> : null}
            <span>{page.title}</span>
          </a>
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
