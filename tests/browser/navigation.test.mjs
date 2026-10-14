import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (route) => route.abort());
  await page.route('**/site/config.js', (route) => route.fulfill({ status: 404, body: 'Ausente' }));
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
  const expectedOffset = position.scrollMarginTop;
  expect(position.headingTop - position.mainTop).toBeGreaterThanOrEqual(expectedOffset - 2);

  await page.reload();
  await expect(heading).toBeFocused();
  await expect(page).toHaveURL(/#guias\/instalacao\/pre-requisitos$/);
});

test('normaliza início e permite Voltar e Avançar entre páginas', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/#guias\/introducao$/);
  await openMobileSidebar(page);
  await page.locator('.sidebar-link[data-page="instalacao"]').click();
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
  await expect(page.getByRole('heading', { name: 'Comece por aqui', exact: true })).toBeVisible();
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
  await page.locator('.sidebar-link[data-page="api-base"]').click();
  await openMobileSidebar(page);
  await page.locator('.sidebar-link[data-page="estilos"]').click();
  await expect(page.getByRole('heading', { name: 'Catálogo visual' })).toBeVisible();
  await page.waitForTimeout(650);
  await expect(page).toHaveURL(/#referencia\/estilos$/);
  await expect(page.getByRole('heading', { name: 'Catálogo visual' })).toBeVisible();
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

  await page.getByRole('button', { name: 'Nesta página' }).click();
  await expect(page.locator('app-toc')).toHaveAttribute('mobile-open', '');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('painéis laterais podem ser recolhidos e redimensionados no desktop', async ({ page }) => {
  test.skip(test.info().project.name.startsWith('mobile'), 'Cenário exclusivo do projeto desktop.');
  await page.goto('/#guias/introducao');

  const sidebar = page.locator('app-sidebar');
  const sidebarButton = page.getByRole('button', { name: 'Recolher menu de páginas' });
  await sidebarButton.click();
  await expect(sidebar).toHaveAttribute('collapsed', '');
  await page.getByRole('button', { name: 'Expandir menu de páginas' }).click();
  await expect(sidebar).not.toHaveAttribute('collapsed', '');

  const initialWidth = await sidebar.evaluate((element) => element.getBoundingClientRect().width);
  await page.getByRole('separator', { name: 'Redimensionar menu de páginas' }).press('ArrowRight');
  const resizedWidth = await sidebar.evaluate((element) => element.getBoundingClientRect().width);
  expect(resizedWidth).toBeGreaterThan(initialWidth);
});

test('rolagem manual atualiza o título da URL sem criar nova entrada no histórico', async ({
  page,
}) => {
  await page.goto('/#guias/exemplos-praticos');
  const historyLength = await page.evaluate(() => history.length);
  const target = page.getByRole('heading', { name: 'Tabelas completas', exact: true });
  await target.evaluate((element) => {
    const main = document.querySelector('main');
    main.dispatchEvent(new WheelEvent('wheel'));
    main.scrollTop = element.offsetTop;
  });
  await expect(page).toHaveURL(/#guias\/exemplos-praticos\/tabelas$/);
  await expect.poll(() => page.evaluate(() => history.length)).toBe(historyLength);
});

test('o primeiro título volta ao início e múltiplos h1 geram aviso', async ({ page }) => {
  await page.route('**/examples/pages/introducao.html', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'text/html',
      body: '<h1>Primeiro</h1><p>Texto</p><h1>Segundo</h1>',
    }),
  );
  await page.goto('/#guias/introducao');
  await expect(page.getByRole('status')).toContainText('apenas um h1');

  if (test.info().project.name.startsWith('mobile')) {
    await page.getByRole('button', { name: 'Nesta página' }).click();
  }

  const main = page.locator('main');
  await main.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await page.locator('.toc-link').first().click();
  await expect.poll(() => main.evaluate((element) => element.scrollTop)).toBe(0);
});

test('bloco de código mostra a linguagem e permite copiar', async ({ page }) => {
  await page.goto('/#guias/exemplos-praticos');
  const blocks = page.locator('pre:has(> code)');
  const block = page.locator('pre[data-language="HTML"]').first();
  await expect(block).toBeVisible();
  await expect(block).toHaveCSS('position', 'relative');
  await expect(block.locator('.code-language')).toHaveText('HTML');
  await expect(blocks).toHaveCount(20);
  await expect(page.locator('.copy-code-button')).toHaveCount(20);
  const copyButton = block.locator('.copy-code-button');
  await expect(copyButton).toHaveAccessibleName('Copiar código');
  await copyButton.click();
  await expect(copyButton).toHaveAttribute('data-copied', 'true');
});

test('lista de tarefas e detalhes são interativos por teclado', async ({ page }) => {
  await page.goto('/#guias/exemplos-praticos/tarefas');

  const task = page.getByLabel('Revisar o conteúdo');
  await expect(task).not.toBeChecked();
  await task.focus();
  await page.keyboard.press('Space');
  await expect(task).toBeChecked();

  const details = page.locator('details').filter({ hasText: 'Como preparar uma página?' }).first();
  const summary = details.locator(':scope > summary');
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(details).toHaveAttribute('open', '');
  await expect(details.locator(':scope > details')).toBeVisible();
});
