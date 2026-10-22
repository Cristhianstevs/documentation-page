import { expect, test } from '@playwright/test';

test('carrega o editor somente após a ação e salva Markdown', async ({ page, isMobile }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Início' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Conteúdo da página' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  const editor = page.getByRole('textbox', { name: 'Conteúdo da página' });
  await expect(editor).toBeVisible();
  await editor.click();
  await page.keyboard.press('Control+End');
  await page.keyboard.type(' Texto salvo pelo estúdio.');
  await expect(page.getByText('Alterações não salvas')).toBeVisible();
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByText(/^Salvo$/)).toBeVisible();
  await expect(page.getByText(/Salvo com backup/)).toBeVisible();
  if (isMobile) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('alterna entre fonte e prévia preservando o conteúdo', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await page.getByRole('tab', { name: 'Markdown' }).click();
  const source = page.getByRole('textbox', { name: 'Fonte Markdown' });
  await source.fill('# Título pelo modo fonte\n\nConteúdo da prévia.\n');
  await page.getByRole('tab', { name: 'Prévia' }).click();
  await expect(page.getByRole('heading', { name: 'Título pelo modo fonte' })).toBeVisible();
  await expect(page.getByText('Conteúdo da prévia.')).toBeVisible();
});

test('recupera rascunho local e avisa sobre conflito de revisão', async ({ page, request }) => {
  await page.goto('/');
  await page.evaluate(() =>
    localStorage.setItem('documentation-draft:v1:inicio', '# Rascunho recuperado\n'),
  );
  await page.reload();
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await expect(page.getByText('Existe um rascunho local')).toBeVisible();
  await page.getByRole('button', { name: 'Recuperar' }).click();
  await expect(page.getByRole('textbox', { name: 'Conteúdo da página' })).toContainText(
    'Rascunho recuperado',
  );

  const opened = await request.get('/api/pages/inicio');
  const current = await opened.json();
  await request.put('/api/pages/inicio', {
    data: { markdown: `${current.markdown}\nMudança concorrente.\n`, revision: current.revision },
  });
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByText(/mudou desde que foi aberta/i)).toBeVisible();
});

test('configura abas e páginas com alias, lixeira e restauração', async ({ page, isMobile }) => {
  test.skip(
    isMobile,
    'O fluxo completo é exercitado uma vez; o diálogo móvel possui teste próprio.',
  );
  await page.goto('/');
  await page.getByRole('button', { name: 'Configurações' }).click();
  const dialog = page.getByRole('dialog', { name: 'Configurações' });
  await expect(dialog).toBeVisible();

  await dialog.getByLabel('Nova aba').fill('Referência');
  await expect(dialog.getByLabel('ID', { exact: true }).first()).toHaveValue('referencia');
  await dialog.getByRole('button', { name: 'Criar aba' }).click();
  await expect(dialog.getByText('Aba criada. Backup do catálogo criado.')).toBeVisible();

  await dialog.getByLabel('Nova página').fill('API pública');
  await dialog.getByRole('combobox', { name: 'Aba', exact: true }).selectOption('referencia');
  await dialog.getByRole('button', { name: 'Criar página' }).click();
  await expect(dialog.getByText('Página criada. Backup do catálogo criado.')).toBeVisible();

  let card = dialog.locator('article').filter({ hasText: 'api-publica' });
  await card.getByText('Duplicar ou alterar ID').click();
  await card.getByLabel('Novo ID da página API pública').fill('api-v2');
  page.once('dialog', (confirmation) => confirmation.accept());
  await card.getByRole('button', { name: 'Alterar ID' }).click();
  await expect(
    dialog.getByText('ID da página alterado e alias criado. Backup do catálogo criado.'),
  ).toBeVisible();

  card = dialog.locator('article').filter({ hasText: 'api-v2' });
  page.once('dialog', (confirmation) => confirmation.accept());
  await card.getByRole('button', { name: 'Lixeira' }).click();
  await expect(
    dialog.getByText('Página movida para a lixeira. Backup do catálogo criado.'),
  ).toBeVisible();
  await dialog.getByRole('button', { name: 'Restaurar' }).click();
  await expect(dialog.getByText('Página restaurada. Backup do catálogo criado.')).toBeVisible();
  await expect(dialog.locator('article').filter({ hasText: 'api-v2' })).toBeVisible();
});

test('diálogo de configurações cabe na tela móvel e fecha com Escape', async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, 'Cenário específico de tela estreita.');
  await page.goto('/');
  await page.getByRole('button', { name: 'Configurações' }).click();
  await expect(page.getByRole('dialog', { name: 'Configurações' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog', { name: 'Configurações' })).not.toBeVisible();
});
