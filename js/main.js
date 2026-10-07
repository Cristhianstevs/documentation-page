import './components/AppHeader.js';
import './components/AppSidebar.js';
import './components/AppToc.js';
import { indexContentHeadings } from './headings.js';
import { loadPage } from './load-page.js';
import { loadSite } from './load-site.js';
import { createPageHash, readRoute, resolveRoute } from './routes.js';

// A versão pertence ao tema, independentemente do conteúdo de cada instalação.
const THEME_VERSION = '1.0.0';
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

  document.title = site.appSettings.siteTitle;
  header.render(site.docsConfig, site.appSettings);
  sidebar.configure(site.docsConfig, site.appSettings, THEME_VERSION);

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

  function resumeScrollTracking() {
    tocPinned = false;
    pinnedHeadingId = undefined;
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
    resumeScrollTracking();
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
      resumeScrollTracking();
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
    document.title = `${entry.text} — ${route.page.title} — ${site.appSettings.siteTitle}`;
    toc.setActive(entry.id);
    entry.element.setAttribute('tabindex', '-1');
    entry.element.focus({ preventScroll: true });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    entry.element.scrollIntoView({
      behavior: animate && !reduceMotion ? 'smooth' : 'auto',
      block: 'start',
    });
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
      const passed = currentHeadings.filter(
        (heading) => heading.element.getBoundingClientRect().top <= contentTop + 32,
      );
      toc.setActive((passed.at(-1) ?? currentHeadings[0]).id);
    });
  });

  function updateNavigation(route) {
    const { section, page } = route;
    sidebar.renderMenu(section?.id, page?.id);
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
      toc.render(
        currentHeadings,
        createPageHash(section.id, page.id),
        indexed.issues,
      );
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
  window.addEventListener('hashchange', renderRoute);
  await renderRoute();
}

start().catch((error) => {
  showMessage('Não foi possível iniciar a documentação', error.message);
  focusContent();
});
