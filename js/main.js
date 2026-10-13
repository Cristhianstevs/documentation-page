import './components/AppHeader.js';
import './components/AppSidebar.js';
import './components/AppToc.js';
import { indexContentHeadings } from './headings.js';
import { loadPage } from './load-page.js';
import { loadSite } from './load-site.js';
import { createPageHash, readRoute, resolveRoute } from './routes.js';

// A versão pertence ao tema, independentemente do conteúdo de cada instalação.
const THEME_VERSION = '0.1.0';
const mainContent = document.getElementById('main-content');

function showMessage(title, message, action) {
  const heading = document.createElement('h1');
  const paragraph = document.createElement('p');
  heading.textContent = title;
  paragraph.textContent = message;
  const children = [heading, paragraph];
  if (action) {
    const link = document.createElement('a');
    link.href = action.href;
    link.textContent = action.label;
    children.push(link);
  }
  mainContent.replaceChildren(...children);
}

function focusContent() {
  const heading = mainContent.querySelector('h1');
  const target = heading ?? mainContent;
  target.setAttribute('tabindex', '-1');
  target.focus();
}

async function start() {
  const site = await loadSite();
  const header = document.querySelector('app-header');
  const sidebar = document.querySelector('app-sidebar');
  const toc = document.querySelector('app-toc');
  const layout = document.querySelector('.layout-wrapper');

  document.title = site.appSettings.siteTitle;
  header.render(site.docsConfig, site.appSettings);
  sidebar.configure(site.docsConfig, site.appSettings, THEME_VERSION);
  const mobileLayout = window.matchMedia('(max-width: 800px)');

  function syncPanelButton(panel) {
    const button = panel.querySelector('.panel-collapse-button');
    if (!button) return;
    const collapsed = panel.hasAttribute('collapsed');
    const isSidebar = panel === sidebar;
    button.textContent = isSidebar === collapsed ? '›' : '‹';
    button.setAttribute('aria-expanded', String(!collapsed));
    const action = collapsed ? 'Expandir' : 'Recolher';
    const name = isSidebar ? 'menu de páginas' : 'índice da página';
    button.setAttribute('aria-label', `${action} ${name}`);
    button.title = `${action} ${name}`;
  }

  function setPanelWidth(panel, width) {
    const nextWidth = Math.min(420, Math.max(180, Math.round(width)));
    panel.style.setProperty('--panel-current-width', `${nextWidth}px`);
    panel.querySelector('.panel-resizer')?.setAttribute('aria-valuenow', String(nextWidth));
  }

  layout.addEventListener('click', (event) => {
    const button = event.target.closest('.panel-collapse-button');
    if (!button || mobileLayout.matches) return;
    const panel = button.dataset.panel === 'sidebar' ? sidebar : toc;
    panel.toggleAttribute('collapsed');
    syncPanelButton(panel);
  });

  layout.addEventListener('keydown', (event) => {
    const resizer = event.target.closest('.panel-resizer');
    if (!resizer || mobileLayout.matches || !['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      return;
    }
    event.preventDefault();
    const panel = resizer.dataset.panel === 'sidebar' ? sidebar : toc;
    const direction = event.key === 'ArrowRight' ? 1 : -1;
    const orientation = panel === sidebar ? 1 : -1;
    setPanelWidth(panel, panel.getBoundingClientRect().width + direction * orientation * 16);
  });

  layout.addEventListener('pointerdown', (event) => {
    const resizer = event.target.closest('.panel-resizer');
    if (!resizer || mobileLayout.matches) return;
    event.preventDefault();
    const panel = resizer.dataset.panel === 'sidebar' ? sidebar : toc;
    const startX = event.clientX;
    const startWidth = panel.getBoundingClientRect().width;
    const orientation = panel === sidebar ? 1 : -1;
    resizer.setPointerCapture(event.pointerId);

    const move = (moveEvent) => {
      setPanelWidth(panel, startWidth + (moveEvent.clientX - startX) * orientation);
    };
    const finish = () => {
      resizer.removeEventListener('pointermove', move);
      resizer.removeEventListener('pointerup', finish);
      resizer.removeEventListener('pointercancel', finish);
    };
    resizer.addEventListener('pointermove', move);
    resizer.addEventListener('pointerup', finish);
    resizer.addEventListener('pointercancel', finish);
  });

  function setSidebarOpen(open) {
    const expanded = mobileLayout.matches && open;
    sidebar.toggleAttribute('open', expanded);
    sidebar.toggleAttribute('inert', mobileLayout.matches && !expanded);
    header.setSidebarExpanded(expanded);
  }

  header.addEventListener('sidebar-toggle', () => {
    setSidebarOpen(!sidebar.hasAttribute('open'));
  });
  sidebar.addEventListener('click', (event) => {
    if (event.target.closest('.sidebar-link')) setSidebarOpen(false);
  });
  mobileLayout.addEventListener('change', () => setSidebarOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setSidebarOpen(false);
  });
  setSidebarOpen(false);

  const customStyles = document.createElement('link');
  customStyles.rel = 'stylesheet';
  customStyles.href = site.customCssUrl.href;
  document.head.append(customStyles);

  let navigationId = 0;
  let renderedPageKey;
  let currentHeadings = [];
  let scrollFrame;
  let pinnedHeadingId;
  let tocPinned = false;
  let scrollRoutingEnabled = false;

  function resumeScrollTracking() {
    tocPinned = false;
    pinnedHeadingId = undefined;
    scrollRoutingEnabled = true;
  }

  function resetScrollTracking() {
    tocPinned = false;
    pinnedHeadingId = undefined;
    scrollRoutingEnabled = false;
  }

  mainContent.addEventListener('wheel', resumeScrollTracking, { passive: true });
  mainContent.addEventListener('touchstart', resumeScrollTracking, { passive: true });
  mainContent.addEventListener('pointerdown', resumeScrollTracking);
  document.addEventListener('keydown', (event) => {
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End', ' '].includes(event.key)) {
      resumeScrollTracking();
    }
  });

  function clearPageState() {
    renderedPageKey = undefined;
    currentHeadings = [];
    resetScrollTracking();
    toc.render([], '');
  }

  function showRouteNotice(message) {
    document.getElementById('route-notice')?.remove();
    if (!message) return undefined;
    const notice = document.createElement('p');
    notice.id = 'route-notice';
    notice.className = 'route-notice';
    notice.setAttribute('role', 'status');
    notice.setAttribute('tabindex', '-1');
    notice.textContent = message;
    mainContent.prepend(notice);
    return notice;
  }

  function applyHeadingRoute(route, focusPage = false, animate = false) {
    showRouteNotice();
    if (!route.headingId) {
      resetScrollTracking();
      document.title = `${route.page.title} — ${site.appSettings.siteTitle}`;
      toc.setActive(currentHeadings[0]?.id);
      if (focusPage) focusContent();
      return;
    }

    const entry = currentHeadings.find((heading) => heading.id === route.headingId);
    if (!entry) {
      tocPinned = true;
      pinnedHeadingId = undefined;
      document.title = `Trecho não encontrado — ${route.page.title} — ${site.appSettings.siteTitle}`;
      toc.setActive();
      const notice = showRouteNotice(
        `O trecho “${route.headingId}” não existe nesta página. O restante do conteúdo continua disponível.`,
      );
      notice.focus();
      return;
    }

    tocPinned = true;
    pinnedHeadingId = entry.id;
    scrollRoutingEnabled = false;
    document.title = `${entry.text} — ${route.page.title} — ${site.appSettings.siteTitle}`;
    toc.setActive(entry.id);
    entry.element.setAttribute('tabindex', '-1');
    entry.element.focus({ preventScroll: true });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const behavior = animate && !reduceMotion ? 'smooth' : 'auto';
    if (entry.level === 1) mainContent.scrollTo({ top: 0, behavior });
    else entry.element.scrollIntoView({ behavior, block: 'start' });
  }

  mainContent.addEventListener('scroll', () => {
    if (scrollFrame || !currentHeadings.length) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = undefined;
      if (tocPinned) {
        toc.setActive(pinnedHeadingId);
        return;
      }
      const contentTop = mainContent.getBoundingClientRect().top;
      const activationOffset = Math.min(120, mainContent.clientHeight * 0.2);
      const passed = currentHeadings.filter(
        (heading) => heading.element.getBoundingClientRect().top <= contentTop + activationOffset,
      );
      const activeHeading = passed.at(-1) ?? currentHeadings[0];
      toc.setActive(activeHeading.id);
      if (scrollRoutingEnabled) {
        const route = resolveRoute(site.docsConfig, readRoute(window.location.hash));
        if (route.status === 'page') {
          const nextHash = createPageHash(route.section.id, route.page.id, activeHeading.id);
          if (window.location.hash !== nextHash) window.history.replaceState(null, '', nextHash);
        }
      }
    });
  });

  function updateNavigation(route) {
    const { section, page } = route;
    sidebar.renderMenu(section?.id, page?.id);
    syncPanelButton(sidebar);
    for (const link of header.querySelectorAll('.nav-link')) {
      const active = link.dataset.section === section?.id;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }

    if (route.status === 'page') {
      document.title = `${page.title} — ${site.appSettings.siteTitle}`;
    } else if (route.status === 'invalid') {
      document.title = `Página não encontrada — ${site.appSettings.siteTitle}`;
    } else if (section) {
      document.title = `${section.title} — ${site.appSettings.siteTitle}`;
    } else {
      document.title = site.appSettings.siteTitle;
    }
  }

  async function renderRoute() {
    const currentNavigation = ++navigationId;
    const route = resolveRoute(site.docsConfig, readRoute(window.location.hash));
    const { section, page } = route;

    if (route.status === 'page' && window.location.hash !== route.canonicalHash) {
      window.history.replaceState(null, '', route.canonicalHash);
    }

    updateNavigation(route);
    mainContent.setAttribute('aria-busy', 'false');

    if (route.status === 'empty') {
      clearPageState();
      showMessage(
        section?.title ?? `Bem-vindo a ${site.appSettings.siteTitle}`,
        section ? 'Esta aba está vazia.' : 'Nenhuma aba cadastrada.',
      );
      focusContent();
      return;
    }
    if (route.status === 'invalid') {
      clearPageState();
      const fallback = resolveRoute(site.docsConfig, { type: 'start' });
      showMessage(
        'Página não encontrada',
        'Este endereço não está cadastrado na configuração.',
        fallback.status === 'page'
          ? { href: fallback.canonicalHash, label: 'Ir para a primeira página' }
          : undefined,
      );
      focusContent();
      return;
    }

    const pageKey = `${section.id}/${page.id}`;
    if (renderedPageKey === pageKey) {
      applyHeadingRoute(route, false, true);
      return;
    }

    clearPageState();
    mainContent.setAttribute('aria-busy', 'true');
    showMessage('Carregando…', page.title);
    try {
      const result = await loadPage({ page, pagesUrl: site.pagesUrl });
      // Uma resposta atrasada não pode substituir a última escolha do usuário.
      if (currentNavigation !== navigationId) return;

      if (result.status !== 'ready') {
        clearPageState();
        showMessage(result.title, result.message);
        focusContent();
        return;
      }

      const container = document.createElement('div');
      container.className = 'content-container';
      // Os fragmentos HTML são escritos por autores confiáveis da instalação.
      container.innerHTML = result.html;
      mainContent.replaceChildren(container);
      const indexed = indexContentHeadings(container);
      currentHeadings = indexed.entries;
      renderedPageKey = pageKey;
      toc.render(currentHeadings, createPageHash(section.id, page.id), indexed.issues);
      syncPanelButton(toc);
      if (indexed.issues.length) {
        const warning = document.createElement('p');
        warning.className = 'content-warning';
        warning.setAttribute('role', 'status');
        warning.textContent = indexed.issues.join(' ');
        container.prepend(warning);
      }
      applyHeadingRoute(route, true);
    } catch {
      if (currentNavigation !== navigationId) return;
      clearPageState();
      showMessage('Erro inesperado', 'A página não pôde ser exibida. Tente novamente.');
      focusContent();
    } finally {
      if (currentNavigation === navigationId) mainContent.setAttribute('aria-busy', 'false');
    }
  }

  // Os links nativos preservam copiar endereço, nova aba e histórico.
  window.addEventListener('hashchange', () => {
    setSidebarOpen(false);
    if (mobileLayout.matches) toc.collapse();
    renderRoute();
  });
  await renderRoute();
}

start().catch((error) => {
  showMessage('Não foi possível iniciar a documentação', error.message);
  focusContent();
});
