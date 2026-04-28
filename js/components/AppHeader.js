import { docsConfig } from '../config.js';

class AppHeader extends HTMLElement {
  connectedCallback() {
    const navLinks = docsConfig
      .map((section, index) => {
        const isActive = index === 0 ? 'active' : '';
        return `<a href="#" class="nav-link ${isActive}" data-section="${section.id}">${section.title}</a>`;
      })
      .join('');

    this.innerHTML = `
      <header class="global-header">
        <div class="header-nav">
          <div class="logo">
            <span class="logo-text">LOGO</span>
          </div>
          <nav class="top-nav">
            ${navLinks}
          </nav>
        </div>

        <div class="header-actions">
          <div class="icon-buttons">
            <button aria-label="Configurações">⚙️</button>
            <button aria-label="Alternar Tema">🌙</button>
          </div>
        </div>
      </header>
    `;
  }
}

customElements.define('app-header', AppHeader);
