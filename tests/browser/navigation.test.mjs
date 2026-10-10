import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
});

async function openMobileSidebar(page) {
  if (!test.info().project.name.startsWith('mobile')) return;
  const button = page.locator('.sidebar-toggle');
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
}

test('abre um link de título, preserva F5 e posiciona no início da margem', async ({ page }) => {
  await page.goto('/#guias/instalacao/pre-requisitos');

  const heading = page.getByRole('heading', { name: 'Pré-requisitos', exact: true });
  await expect(heading).toBeFocused();
  await expect(page.locator('.toc-link.active')).toHaveText('Pré-requisitos');

  const position = await heading.evaluate((element) => {
    const main = document.querySelector('main');
    return {
      headingTop: element.getBoundingClientRect().top,
      mainTop: main.getBoundingClientRect().top,
      marginTop: Number.parseFloat(getComputedStyle(element).marginTop),
      scrollMarginTop: Number.parseFloat(getComputedStyle(element).scrollMarginTop),
    };
  });
  const expectedOffset = test.info().project.name.startsWith('mobile')
    ? position.scrollMarginTop
    : position.marginTop;
  expect(position.headingTop - position.mainTop).toBeGreaterThanOrEqual(expectedOffset - 2);

  await page.reload();
  await expect(heading).toBeFocused();
  await expect(page).toHaveURL(/#guias\/instalacao\/pre-requisitos$/);
});

test('normaliza início e permite Voltar e Avançar entre páginas', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/#guias\/introducao$/);
  await openMobileSidebar(page);
  await page.getByRole('link', { name: /Instalação/ }).click();
  await expect(page).toHaveURL(/#guias\/instalacao$/);
  await page.goBack();
  await expect(page).toHaveURL(/#guias\/introducao$/);
  await page.goForward();
  await expect(page).toHaveURL(/#guias\/instalacao$/);
});

test('mantém recuperação para rota e título inexistentes', async ({ page }) => {
  await page.goto('/#aba-inexistente/pagina-inexistente');
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Ir para a primeira página' })).toHaveAttribute(
    'href',
    '#guias/introducao',
  );

  await page.goto('/#guias/introducao/titulo-inexistente');
  await expect(page.getByRole('status')).toContainText('não existe nesta página');
  await expect(page.getByRole('heading', { name: 'Introdução', exact: true })).toBeVisible();
});

test('diferencia arquivo ausente sem manter conteúdo antigo', async ({ page }) => {
  await page.route('**/examples/pages/instalacao.html', (route) =>
    route.fulfill({ status: 404, body: 'Ausente' }),
  );
  await page.goto('/#guias/instalacao');
  await expect(page.getByRole('heading', { name: 'Arquivo não encontrado' })).toBeVisible();
  await expect(page.getByText('instalacao.html')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Instalação', exact: true })).toHaveCount(0);
});

test('a última página clicada vence uma resposta anterior atrasada', async ({ page }) => {
  await page.goto('/#referencia/core-concepts');
  await page.route('**/examples/pages/api-base.html', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    await route.continue();
  });

  await openMobileSidebar(page);
  await page.getByRole('link', { name: /API Base/ }).click();
  await openMobileSidebar(page);
  await page.getByRole('link', { name: /Catálogo de estilos/ }).click();
  await expect(page.getByRole('heading', { name: 'Catálogo de conteúdo' })).toBeVisible();
  await page.waitForTimeout(650);
  await expect(page).toHaveURL(/#referencia\/estilos$/);
  await expect(page.getByRole('heading', { name: 'Catálogo de conteúdo' })).toBeVisible();
});

test('interface móvel mantém menu, índice e conteúdo dentro da largura', async ({ page }) => {
  test.skip(!test.info().project.name.startsWith('mobile'), 'Cenário exclusivo do projeto móvel.');
  await page.goto('/#guias/instalacao');

  const menuButton = page.locator('.sidebar-toggle');
  await expect(menuButton).toHaveAttribute('aria-label', 'Abrir menu de páginas');
  await menuButton.click();
  await expect(menuButton).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menuButton).toHaveAttribute('aria-expanded', 'false');

  await page.getByText('Nesta página').click();
  await expect(page.locator('.toc-details')).toHaveAttribute('open', '');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});
