import type { LegacySite, LegacyTab } from '@documentation-page/content';

export function ReaderHeader({ activeTab, site }: { activeTab: LegacyTab; site: LegacySite }) {
  return (
    <header className="reader-header">
      <a className="brand" href={`/${site.tabs[0].id}/${site.tabs[0].pages[0].id}/`}>
        {site.appSettings.logoText}
      </a>
      <nav aria-label="Abas da documentação">
        {site.tabs.map((tab) => (
          <a
            aria-current={tab.id === activeTab.id ? 'page' : undefined}
            className="tab-link"
            href={`/${tab.id}/${tab.pages[0].id}/`}
            key={tab.id}
          >
            {tab.title}
          </a>
        ))}
      </nav>
      <div className="reader-controls">
        <button
          aria-controls="page-sidebar"
          aria-expanded="false"
          aria-label="Abrir menu de páginas"
          className="menu-toggle"
          type="button"
        >
          <span aria-hidden="true" className="menu-icon">
            ☰
          </span>
          <span>Menu</span>
        </button>
        <button aria-label="Alternar tema" className="theme-toggle" type="button">
          <span aria-hidden="true">◐</span>
        </button>
        <button
          aria-label="Fechar menu de páginas"
          className="menu-backdrop"
          tabIndex={-1}
          type="button"
        />
      </div>
      <script defer src="/reader-controls.js" />
    </header>
  );
}
