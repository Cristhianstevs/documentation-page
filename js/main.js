import './components/AppHeader.js';
import './components/AppSidebar.js';
import { loadSite } from './load-site.js';
import { readRoute, resolveRoute } from './routes.js';

// A versão pertence ao tema, independentemente do conteúdo de cada instalação.
const THEME_VERSION = '1.0.0';
const mainContent = document.getElementById('main-content');

function showMessage(title, message) {
  const heading = document.createElement('h1');
  const paragraph = document.createElement('p');
  heading.textContent = title;
  paragraph.textContent = message;
  mainContent.replaceChildren(heading, paragraph);
}

async function start() {
  const site = await loadSite();
  const header = document.querySelector('app-header');
  const sidebar = document.querySelector('app-sidebar');

  document.title = site.appSettings.siteTitle;
  header.render(site.docsConfig, site.appSettings);
  sidebar.configure(site.docsConfig, site.appSettings, THEME_VERSION);

  const customStyles = document.createElement('link');
  customStyles.rel = 'stylesheet';
  customStyles.href = site.customCssUrl.href;
  document.head.append(customStyles);

  let navigationId = 0;

  async function renderRoute() {
    const currentNavigation = ++navigationId;
    const route = resolveRoute(site.docsConfig, readRoute(window.location.hash));
    const { section, page } = route;

    if (route.status === 'page' && window.location.hash !== route.canonicalHash) {
      window.history.replaceState(null, '', route.canonicalHash);
    }

    sidebar.renderMenu(section?.id, page?.id);
    for (const link of header.querySelectorAll('.nav-link')) {
      const active = link.dataset.section === section?.id;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
    document.title = site.appSettings.siteTitle;
    mainContent.setAttribute('aria-busy', 'false');

    if (route.status === 'empty') {
      showMessage(
        section?.title ?? `Bem-vindo a ${site.appSettings.siteTitle}`,
        section ? 'Esta aba está vazia.' : 'Nenhuma aba cadastrada.',
      );
      return;
    }
    if (route.status === 'invalid') {
      showMessage('Página não encontrada', 'Este endereço não está cadastrado na configuração.');
      return;
    }

    mainContent.setAttribute('aria-busy', 'true');
    showMessage('Carregando…', page.title);
    try {
      const response = await fetch(new URL(page.file, site.pagesUrl));
      if (!response.ok) {
        if (response.status === 404) throw new Error(`O arquivo ${page.file} não foi encontrado.`);
        if (response.status === 401 || response.status === 403) {
          throw new Error('Você não tem acesso a esta página.');
        }
        throw new Error(`O servidor respondeu com HTTP ${response.status}.`);
      }
      const html = await response.text();
      // Uma resposta atrasada não pode substituir a última escolha do usuário.
      if (currentNavigation !== navigationId) return;
      document.title = `${page.title} — ${site.appSettings.siteTitle}`;
      if (!html.trim()) {
        showMessage(page.title, 'Esta página ainda não tem conteúdo.');
        return;
      }
      const container = document.createElement('div');
      container.className = 'content-container';
      // Os fragmentos HTML são escritos por autores confiáveis da instalação.
      container.innerHTML = html;
      mainContent.replaceChildren(container);
    } catch (error) {
      if (currentNavigation !== navigationId) return;
      showMessage(
        'Não foi possível carregar a página',
        error instanceof TypeError ? 'Confira sua conexão com o servidor.' : error.message,
      );
    } finally {
      if (currentNavigation === navigationId) mainContent.setAttribute('aria-busy', 'false');
    }
  }

  // Os links nativos preservam copiar endereço, nova aba e histórico.
  window.addEventListener('hashchange', renderRoute);
  await renderRoute();
}

start().catch((error) => {
  showMessage('Não foi possível iniciar a documentação', error.message);
});
