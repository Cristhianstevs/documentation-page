class AppSidebar extends HTMLElement {
  configure(docsConfig, appSettings, themeVersion) {
    this.sections = docsConfig;
    this.settings = appSettings;
    this.themeVersion = themeVersion;
  }

  renderMenu(sectionId, pageId) {
    const section = this.sections.find((item) => item.id === sectionId);
    this.innerHTML = `
      <button class="panel-collapse-button" type="button" data-panel="sidebar" aria-label="Recolher menu de páginas" title="Recolher menu de páginas">‹</button>
      <aside class="sidebar-nav" id="documentation-sidebar">
        <div class="panel-content">
          <h3 class="sidebar-title"></h3>
          <p class="sidebar-version"></p>
          <nav aria-label="Páginas"><ul class="sidebar-list"></ul></nav>
        </div>
      </aside>
      <div class="panel-resizer" data-panel="sidebar" role="separator" aria-label="Redimensionar menu de páginas" aria-orientation="vertical" aria-valuemin="180" aria-valuemax="420" tabindex="0"></div>
    `;
    this.querySelector('.sidebar-title').textContent = this.settings.sidebarTitle;
    this.querySelector('.sidebar-version').textContent = `V${this.themeVersion}`;
    const list = this.querySelector('.sidebar-list');

    for (const page of section?.pages ?? []) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = `#${section.id}/${page.id}`;
      link.className = 'sidebar-link';
      link.dataset.page = page.id;
      if (page.id === pageId) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
      if (page.icon) {
        const icon = document.createElement('span');
        icon.className = 'link-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = page.icon;
        link.append(icon);
      }
      link.append(document.createTextNode(page.title));
      item.append(link);
      list.append(item);
    }
  }
}

customElements.define('app-sidebar', AppSidebar);
