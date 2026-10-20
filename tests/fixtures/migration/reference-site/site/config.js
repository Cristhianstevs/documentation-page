export const appSettings = {
  siteTitle: 'Guia de hospedagem fictício',
  logoText: 'GUIA',
  sidebarTitle: 'Conteúdo',
};

export const docsConfig = [
  {
    id: 'fundamentos',
    title: 'Fundamentos',
    pages: [
      { id: 'inicio', title: 'Início', file: 'inicio.html', icon: '📘' },
      { id: 'reservas', title: 'Fazer uma reserva', file: 'reservas.html', icon: '🧳' },
    ],
  },
  {
    id: 'referencia',
    title: 'Referência',
    pages: [{ id: 'componentes', title: 'Componentes', file: 'componentes.html', icon: '🧩' }],
  },
];
