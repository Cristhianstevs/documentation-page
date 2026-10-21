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
