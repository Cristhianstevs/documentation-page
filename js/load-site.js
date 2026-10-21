import { validateConfig } from './config-validation.js';

export { validateConfig } from './config-validation.js';

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
