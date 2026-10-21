import { expect, test } from '@playwright/test';

test('renderiza configuração, páginas e índice em rotas estáveis', async ({ page }) => {
  await page.goto('/guias/introducao/#como-este-tema-funciona');

  await expect(page.getByRole('navigation', { name: 'Abas da documentação' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Guias', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  );
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('.table-of-contents a')).not.toHaveCount(0);
  await expect(page).toHaveTitle(/Guia do tema/);
});

test('navega entre abas e páginas com links reais', async ({ page }) => {
  await page.goto('/guias/introducao/');
  await page.getByRole('link', { name: 'Referência', exact: true }).click();
  await expect(page).toHaveURL(/\/referencia\/core-concepts\/$/, { timeout: 15_000 });
  if (test.info().project.name.includes('mobile')) {
    await page.locator('.menu-toggle').click();
  }
  await page.getByRole('link', { name: 'Configurar menus' }).click();
  await expect(page).toHaveURL(/\/referencia\/api-base\/$/, { timeout: 15_000 });
});

test('preserva recarregamento, Voltar e Avançar', async ({ page }) => {
  await page.goto('/guias/introducao/');
  if (test.info().project.name.includes('mobile')) {
    await page.locator('.menu-toggle').click();
  }
  await page.getByRole('link', { name: 'Criar seu site', exact: true }).first().click();
  await expect(page).toHaveURL(/\/guias\/instalacao\/$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Criar seu site', exact: true })).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/guias\/introducao\/$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/guias\/instalacao\/$/);
});

test('converte hashes antigos para a rota nova, inclusive o título', async ({ page }) => {
  await page.goto('/#guias/instalacao/pre-requisitos');
  await expect(page).toHaveURL(/\/guias\/instalacao\/#pre-requisitos$/);
  await expect(page.locator('#pre-requisitos')).toBeVisible();
});

test('oferece recuperação para uma rota inexistente', async ({ page }) => {
  const response = await page.goto('/inexistente/pagina/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ir para a primeira página' })).toHaveAttribute(
    'href',
    '/guias/introducao/',
  );
});

test('alterna o tema e preserva a escolha', async ({ page }) => {
  await page.goto('/guias/introducao/');
  const themeButton = page.getByRole('button', { name: 'Usar tema claro' });
  await themeButton.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await expect(page.getByRole('button', { name: 'Usar tema escuro' })).toBeVisible();
});

test('menu móvel abre, fecha com Escape e não causa corte horizontal', async ({ page }) => {
  test.skip(!test.info().project.name.includes('mobile'), 'Cenário exclusivo do leitor móvel.');
  await page.goto('/guias/introducao/');
  const menu = page.locator('.menu-toggle');
  await expect(menu).toHaveAccessibleName('Abrir menu de páginas');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('#page-sidebar')).toBeInViewport();
  await page.keyboard.press('Escape');
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
