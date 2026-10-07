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
    ],
  },
  {
    id: 'referencia',
    title: 'Referência',
    pages: [
      { id: 'core-concepts', title: 'Core Concepts', file: 'core-concepts.html', icon: '📚' },
      { id: 'api-base', title: 'API Base', file: 'api-base.html', icon: '⚙️' },
    ],
  },
  {
    id: 'comunidade',
    title: 'Comunidade',
    pages: [
      { id: 'colaboradores', title: 'Colaboradores', file: 'colaboradores.html', icon: '👥' },
      { id: 'sobre', title: 'Sobre o Setor', file: 'sobre.html', icon: '🏢' },
    ],
  },
];
