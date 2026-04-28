import './components/AppHeader.js';
import './components/AppSidebar.js';

document.addEventListener('DOMContentLoaded', () => {
  const sidebar = document.querySelector('app-sidebar');
  const headerLinks = document.querySelectorAll('.nav-link');
  const mainContent = document.getElementById('main-content');

  // ==========================================
  // FUNÇÃO CENTRAL: O CARREGADOR DE PÁGINAS
  // ==========================================
  async function loadPage(sectionId, fileName, saveHistory = true) {
    try {
      const response = await fetch(`./pages/${fileName}`);
      if (!response.ok) throw new Error('Página não encontrada');
      const htmlText = await response.text();

      mainContent.innerHTML = `<div class="content-container">${htmlText}</div>`;

      if (saveHistory) {
        const urlLimpa = fileName.replace('.html', '');
        history.pushState({ sectionId, fileName }, '', `#${sectionId}/${urlLimpa}`);
      }

      headerLinks.forEach((nav) => nav.classList.remove('active'));
      const activeHeader = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
      if (activeHeader) activeHeader.classList.add('active');

      sidebar.renderMenu(sectionId);

      setTimeout(() => {
        const allSidebarLinks = sidebar.querySelectorAll('.sidebar-link');
        allSidebarLinks.forEach((l) => l.classList.remove('active'));

        const activeSidebarLink = sidebar.querySelector(`.sidebar-link[data-file="${fileName}"]`);
        if (activeSidebarLink) activeSidebarLink.classList.add('active');
      }, 50);
    } catch (error) {
      mainContent.innerHTML = `
        <div style="padding: 2rem;">
          <h1>Erro 404</h1>
          <p style="color: var(--color-laranja); margin-top: 1rem;">O arquivo <strong>${fileName}</strong> não foi encontrado na pasta "pages/".</p>
        </div>
      `;
    }
  }

  // ==========================================
  // EVENTO 1: CLIQUES NO HEADER
  // ==========================================
  headerLinks.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const sectionId = link.getAttribute('data-section');
      if (!sectionId) return;

      headerLinks.forEach((nav) => nav.classList.remove('active'));
      link.classList.add('active');
      sidebar.renderMenu(sectionId);
    });
  });

  // ==========================================
  // EVENTO 2: CLIQUES NA SIDEBAR
  // ==========================================
  sidebar.addEventListener('click', (event) => {
    const link = event.target.closest('.sidebar-link');
    if (!link) return;
    event.preventDefault();

    const fileName = link.getAttribute('data-file');
    const activeHeader = document.querySelector('.nav-link.active');
    const sectionId = activeHeader ? activeHeader.getAttribute('data-section') : 'guias';

    loadPage(sectionId, fileName);
  });

  // ==========================================
  // EVENTO 3: SOBREVIVENDO AO F5 (ON LOAD)
  // ==========================================
  function checkUrlOnLoad() {
    const hash = window.location.hash.substring(1);

    if (hash) {
      const [sectionId, urlLimpa] = hash.split('/');

      if (sectionId && urlLimpa) {
        loadPage(sectionId, `${urlLimpa}.html`, false);
        return;
      }
    }

    sidebar.renderMenu('guias');
  }

  // ==========================================
  // EVENTO 4: O BOTÃO "VOLTAR" DO NAVEGADOR
  // ==========================================
  window.addEventListener('popstate', (event) => {
    if (event.state && event.state.sectionId && event.state.fileName) {
      loadPage(event.state.sectionId, event.state.fileName, false);
    } else {
      mainContent.innerHTML =
        '<h1>Bem-vindo à Documentação</h1><p>Selecione um tópico no menu ao lado.</p>';
      sidebar.renderMenu('guias');
    }
  });

  checkUrlOnLoad();
});
