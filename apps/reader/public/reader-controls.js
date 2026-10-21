const root = document.documentElement;
const menu = document.querySelector('.menu-toggle');
const backdrop = document.querySelector('.menu-backdrop');
const sidebar = document.querySelector('#page-sidebar');
const theme = document.querySelector('.theme-toggle');

function updateThemeLabel() {
  theme.setAttribute(
    'aria-label',
    `Usar tema ${root.dataset.theme === 'dark' ? 'claro' : 'escuro'}`,
  );
}

function closeMenu() {
  root.classList.remove('mobile-menu-open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Abrir menu de páginas');
  menu.querySelector('.menu-icon').textContent = '☰';
}

function toggleMenu() {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  if (!open) {
    closeMenu();
    return;
  }
  root.classList.add('mobile-menu-open');
  menu.setAttribute('aria-expanded', 'true');
  menu.setAttribute('aria-label', 'Fechar menu de páginas');
  menu.querySelector('.menu-icon').textContent = '×';
}

menu.addEventListener('click', toggleMenu);
backdrop.addEventListener('click', closeMenu);
sidebar.addEventListener('click', (event) => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || menu.getAttribute('aria-expanded') !== 'true') return;
  closeMenu();
  menu.focus();
});
updateThemeLabel();
theme.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  localStorage.setItem('documentation-page-theme', next);
  updateThemeLabel();
});
