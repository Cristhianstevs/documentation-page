export const appSettings = {
  siteTitle: 'Guia do tema',
  logoText: 'DOCS',
  sidebarTitle: 'Páginas',
};

export const docsConfig = [
  {
    id: 'guias',
    title: 'Guias',
    pages: [
      { id: 'introducao', title: 'Introdução', file: 'introducao.html', icon: '📘' },
      { id: 'instalacao', title: 'Criar seu site', file: 'instalacao.html', icon: '🛠️' },
      {
        id: 'exemplos-praticos',
        title: 'Escrever páginas',
        file: 'exemplos-praticos.html',
        icon: '🧩',
      },
    ],
  },
  {
    id: 'referencia',
    title: 'Referência',
    pages: [
      {
        id: 'core-concepts',
        title: 'Como funciona',
        file: 'core-concepts.html',
        icon: '📚',
      },
      { id: 'api-base', title: 'Configurar menus', file: 'api-base.html', icon: '⚙️' },
      { id: 'estilos', title: 'Ver o visual', file: 'style-catalog.html', icon: '🎨' },
    ],
  },
  {
    id: 'comunidade',
    title: 'Projeto',
    pages: [
      { id: 'colaboradores', title: 'Colaboradores', file: 'colaboradores.html', icon: '👥' },
      { id: 'sobre', title: 'Sobre o tema', file: 'sobre.html', icon: '🏠' },
    ],
  },
];
