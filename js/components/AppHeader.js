class AppHeader extends HTMLElement {
  render(docsConfig, appSettings) {
    this.innerHTML = `
      <header class="global-header">
        <div class="header-nav">
          <div class="logo">
            <span class="logo-text"></span>
          </div>
          <nav class="top-nav" aria-label="Assuntos"></nav>
        </div>

        <div class="header-actions">
          <button
            class="sidebar-toggle"
            type="button"
            aria-controls="documentation-sidebar"
            aria-expanded="false"
            aria-label="Abrir menu de páginas"
          >
            ☰
          </button>
        </div>
      </header>
    `;

    this.querySelector('.logo-text').textContent = appSettings.logoText;
    const nav = this.querySelector('.top-nav');
    for (const section of docsConfig) {
      const link = document.createElement('a');
      const firstPage = section.pages[0];
      link.href = firstPage
        ? `#${section.id}/${firstPage.id}`
        : `#${section.id}`;
      link.className = 'nav-link';
      link.dataset.section = section.id;
      link.textContent = section.title;
      nav.append(link);
    }

    this.querySelector('.sidebar-toggle').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('sidebar-toggle'));
    });
  }

  setSidebarExpanded(expanded) {
    const button = this.querySelector('.sidebar-toggle');
    if (!button) return;
    button.setAttribute('aria-expanded', String(expanded));
    button.setAttribute('aria-label', expanded ? 'Fechar menu de páginas' : 'Abrir menu de páginas');
  }
}

customElements.define('app-header', AppHeader);
