export async function loadPage({ page, pagesUrl, fetchPage = globalThis.fetch }) {
  let response;
  try {
    response = await fetchPage(new URL(page.file, pagesUrl));
  } catch {
    return {
      status: 'network-error',
      title: 'Não foi possível carregar a página',
      message: 'Confira sua conexão com o servidor.',
    };
  }

  if (!response.ok) {
    if (response.status === 404) {
      return {
        status: 'not-found',
        title: 'Arquivo não encontrado',
        message: `O arquivo ${page.file} não foi encontrado.`,
      };
    }
    if (response.status === 401 || response.status === 403) {
      return {
        status: 'access-denied',
        title: 'Acesso negado',
        message: 'Você não tem acesso a esta página.',
      };
    }
    return {
      status: 'server-error',
      title: 'Não foi possível carregar a página',
      message: `O servidor respondeu com HTTP ${response.status}.`,
    };
  }

  let html;
  try {
    html = await response.text();
  } catch {
    return {
      status: 'network-error',
      title: 'Não foi possível carregar a página',
      message: 'A conexão foi interrompida durante o carregamento.',
    };
  }

  if (!html.trim()) {
    return {
      status: 'empty',
      title: page.title,
      message: 'Esta página ainda não tem conteúdo.',
    };
  }

  return { status: 'ready', html };
}
