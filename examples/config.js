export const appSettings = {
  siteTitle: 'Documentação',
  logoText: 'LOGO',
  sidebarTitle: 'GLOBAL_NAV',
};

export const docsConfig = [
  {
    id: 'guias',
    title: 'Guias',
    pages: [
      { id: 'introducao', title: 'Introdução', file: 'introducao.html', icon: '📘' },
      { id: 'instalacao', title: 'Instalação', file: 'instalacao.html', icon: '🛠️' },
      {
        id: 'exemplos-praticos',
        title: 'Exemplos práticos',
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
        title: 'Como o tema funciona',
        file: 'core-concepts.html',
        icon: '📚',
      },
      { id: 'api-base', title: 'Configuração', file: 'api-base.html', icon: '⚙️' },
      { id: 'estilos', title: 'Catálogo de estilos', file: 'style-catalog.html', icon: '🎨' },
    ],
  },
  {
    id: 'comunidade',
    title: 'Comunidade',
    pages: [
      { id: 'colaboradores', title: 'Colaboradores', file: 'colaboradores.html', icon: '👥' },
      { id: 'sobre', title: 'Sobre o tema', file: 'sobre.html', icon: '🏠' },
    ],
  },
];
