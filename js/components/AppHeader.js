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
          <div class="icon-buttons">
            <button aria-label="Configurações">⚙️</button>
            <button aria-label="Alternar Tema">🌙</button>
          </div>
        </div>
      </header>
    `;

    this.querySelector('.logo-text').textContent = appSettings.logoText;
    const nav = this.querySelector('.top-nav');
    for (const section of docsConfig) {
      const link = document.createElement('a');
      const firstPage = section.pages[0];
      link.href = firstPage
        ? `#${section.id}/${firstPage.file.slice(0, -5)}`
        : `#${section.id}`;
      link.className = 'nav-link';
      link.dataset.section = section.id;
      link.textContent = section.title;
      nav.append(link);
    }
  }
}

customElements.define('app-header', AppHeader);
