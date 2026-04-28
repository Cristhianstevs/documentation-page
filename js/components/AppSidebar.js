import { appSettings, docsConfig } from '../config.js';

class AppSidebar extends HTMLElement {
  connectedCallback() {
    this.renderMenu(docsConfig[0].id);
  }

  renderMenu(sectionId) {
    const sectionData = docsConfig.find((sec) => sec.id === sectionId);

    if (!sectionData) return;

    const linksHtml = sectionData.pages
      .map((page) => {
        const icon = page.icon ? `<span class="link-icon">${page.icon}</span>` : '';
        return `
        <li>
          <a href="#" class="sidebar-link" data-file="${page.file}">
            ${icon} ${page.title}
          </a>
        </li>
      `;
      })
      .join('');

    this.innerHTML = `
      <aside class="sidebar-nav">
        <!-- Puxando os dados do appSettings em vez do sectionData -->
        <h3 class="sidebar-title">${appSettings.sidebarTitle}</h3>
        <p class="sidebar-version">V${appSettings.version}</p>

        <ul class="sidebar-list">
          ${linksHtml}
        </ul>
      </aside>
    `;
  }
}

customElements.define('app-sidebar', AppSidebar);
