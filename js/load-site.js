const defaults = {
  siteTitle: 'Documentação',
  logoText: 'LOGO',
  sidebarTitle: 'Documentação',
};

// Valida o contrato mínimo antes de entregar a configuração aos componentes.
export function validateConfig({ appSettings = {}, docsConfig }) {
  if (!appSettings || typeof appSettings !== 'object' || Array.isArray(appSettings)) {
    throw new Error('appSettings deve ser um objeto.');
  }
  for (const key of Object.keys(defaults)) {
    if (key in appSettings && (typeof appSettings[key] !== 'string' || !appSettings[key].trim())) {
      throw new Error(`appSettings.${key} deve ser um texto não vazio.`);
    }
  }
  if (!Array.isArray(docsConfig)) {
    throw new Error('Exporte docsConfig como uma lista de abas.');
  }

  const sectionIds = new Set();
  const normalizedSections = [];
  for (const section of docsConfig) {
    if (
      !section ||
      typeof section.id !== 'string' ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(section.id)
    ) {
      throw new Error('Cada aba precisa de um id em minúsculas, sem espaços ou acentos.');
    }
    if (sectionIds.has(section.id)) throw new Error(`Aba repetida: ${section.id}.`);
    sectionIds.add(section.id);
    if (typeof section.title !== 'string' || !section.title.trim()) {
      throw new Error(`A aba ${section.id} precisa de um title.`);
    }
    if (!Array.isArray(section.pages)) {
      throw new Error(`A aba ${section.id} precisa de uma lista pages.`);
    }
    const files = new Set();
    const pageIds = new Set();
    const normalizedPages = [];
    for (const page of section.pages) {
      if (!page || typeof page.title !== 'string' || !page.title.trim()) {
        throw new Error(`Uma página da aba ${section.id} está sem title.`);
      }
      if (typeof page.file !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*\.html$/.test(page.file)) {
        throw new Error(`Use um arquivo como minha-pagina.html na aba ${section.id}.`);
      }
      if (files.has(page.file)) throw new Error(`Página repetida: ${page.file}.`);
      files.add(page.file);
      const pageId = page.id ?? page.file.slice(0, -5);
      if (typeof pageId !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pageId)) {
        throw new Error(
          `A página ${page.file} precisa de um id em minúsculas, sem espaços ou acentos.`,
        );
      }
      if (pageIds.has(pageId)) {
        throw new Error(`ID de página repetido na aba ${section.id}: ${pageId}.`);
      }
      pageIds.add(pageId);
      if (page.icon !== undefined && typeof page.icon !== 'string') {
        throw new Error(`O ícone de ${page.file} deve ser um texto.`);
      }
      normalizedPages.push({ ...page, id: pageId });
    }
    normalizedSections.push({ ...section, pages: normalizedPages });
  }

  return { appSettings: { ...defaults, ...appSettings }, docsConfig: normalizedSections };
}

export async function loadSite({
  baseUrl = new URL('../', import.meta.url),
  fetchConfig = globalThis.fetch,
  importConfig = (url) => import(url),
} = {}) {
  const localConfigUrl = new URL('site/config.js', baseUrl);
  let response;
  try {
    response = await fetchConfig(localConfigUrl.href, { cache: 'no-store' });
  } catch {
    throw new Error('Não foi possível verificar site/config.js. Confira a conexão e o servidor.');
  }

  // Apenas 404 significa instalação ausente. Erros não devem abrir a demonstração.
  const source = response.status === 404 ? 'examples' : 'site';
  if (!response.ok && response.status !== 404) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Acesso negado à configuração da instalação.');
    }
    throw new Error(`Falha ao verificar site/config.js (HTTP ${response.status}).`);
  }

  const directoryUrl = new URL(`${source}/`, baseUrl);
  let config;
  try {
    config = await importConfig(new URL('config.js', directoryUrl).href);
  } catch {
    throw new Error(
      `Não foi possível carregar ${source}/config.js. Confira a sintaxe e seus imports.`,
    );
  }

  return {
    ...validateConfig(config),
    source,
    pagesUrl: new URL('pages/', directoryUrl),
    customCssUrl: new URL('custom.css', directoryUrl),
  };
}
