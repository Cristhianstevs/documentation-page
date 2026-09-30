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
      { title: 'Introdução', file: 'introducao.html', icon: '📘' },
      { title: 'Instalação', file: 'instalacao.html', icon: '🛠️' },
    ],
  },
  {
    id: 'referencia',
    title: 'Referência',
    pages: [
      { title: 'Core Concepts', file: 'core-concepts.html', icon: '📚' },
      { title: 'API Base', file: 'api-base.html', icon: '⚙️' },
    ],
  },
  {
    id: 'comunidade',
    title: 'Comunidade',
    pages: [
      { title: 'Colaboradores', file: 'colaboradores.html', icon: '👥' },
      { title: 'Sobre o Setor', file: 'sobre.html', icon: '🏢' },
    ],
  },
];
