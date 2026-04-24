class AppHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header class="global-header">
        <div class="header-nav">
          <div class="logo">
            <span class="logo-text">STAFF</span>
          </div>
          <nav class="top-nav">
            <a href="#" class="nav-link active">Documentação</a>
            <a href="#" class="nav-link">API</a>
            <a href="#" class="nav-link">Colaboradores</a>
            <a href="#" class="nav-link">Grupos</a>
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
