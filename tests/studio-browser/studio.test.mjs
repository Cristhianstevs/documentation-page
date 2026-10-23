import { expect, test } from '@playwright/test';

test('revisa a importação e confirma a criação da página', async ({ page, isMobile }) => {
  const importedTitle = isMobile ? 'Guia importado mobile' : 'Guia importado desktop';
  const importedId = isMobile ? 'guia-importado-mobile' : 'guia-importado-desktop';
  await page.request.post('/api/imports/preview', {
    multipart: {
      file: { name: 'aquecimento.txt', mimeType: 'text/plain', buffer: Buffer.from('Aquecimento') },
    },
  });
  await page.goto('/');
  await page.getByRole('button', { name: 'Importar' }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: 'guia.md',
    mimeType: 'text/markdown',
    buffer: Buffer.from(`# ${importedTitle}\n\nConteúdo fictício.`),
  });

  await expect(
    page.getByText('Prévia pronta. Nenhum arquivo da instalação foi alterado.'),
  ).toBeVisible({ timeout: 15_000 });
  const source = page.getByLabel('Markdown normalizado e editável');
  await expect(source).toContainText(`# ${importedTitle}`);
  await expect(page.getByRole('heading', { name: importedTitle })).toBeVisible();
  await source.fill('# Guia revisado\n\nPrévia alterada pela pessoa.');
  await expect(page.getByRole('heading', { name: 'Guia revisado' })).toBeVisible();
  await page.getByRole('button', { name: 'Confirmar e criar página' }).click();
  await expect(page.getByRole('dialog', { name: 'Revisar arquivo' })).toHaveCount(0, {
    timeout: 15_000,
  });
  await expect(page.getByRole('heading', { name: importedTitle })).toBeVisible();

  const created = await page.request.get(`/api/pages/${importedId}`);
  expect(created.ok()).toBe(true);
  expect((await created.json()).markdown).toContain('Prévia alterada pela pessoa.');

  if (isMobile) {
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
});

test('substitui uma página importada somente depois da confirmação', async ({ page, isMobile }) => {
  test.skip(isMobile, 'A criação já cobre o diálogo no celular; este caso valida a outra ação.');
  await page.goto('/');
  await page.getByRole('button', { name: 'Importar' }).click();
  await page.locator('input[type="file"]').setInputFiles({
    name: 'substituicao.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('Conteúdo substituto confirmado.'),
  });
  await page.getByLabel('Substituir uma página existente').check();
  await page.getByRole('button', { name: 'Confirmar e substituir página' }).click();
  await expect(page.getByRole('dialog', { name: 'Revisar arquivo' })).toHaveCount(0, {
    timeout: 15_000,
  });

  const replaced = await page.request.get('/api/pages/inicio');
  expect(replaced.ok()).toBe(true);
  expect((await replaced.json()).markdown).toContain('Conteúdo substituto confirmado.');
});

test('API de importação normaliza HTML malicioso e recusa tipo falso', async ({
  request,
  isMobile,
}) => {
  test.skip(isMobile, 'O endpoint é independente do dispositivo.');
  const html = await request.post('/api/imports/preview', {
    multipart: {
      file: {
        name: 'pagina.html',
        mimeType: 'text/html',
        buffer: Buffer.from(
          '<h1>Página segura</h1><script>alert(1)</script><a href="javascript:alert(2)">Link</a>',
        ),
      },
    },
  });
  expect(html.ok()).toBe(true);
  const preview = await html.json();
  expect(preview.markdown).toContain('Página segura');
  expect(preview.markdown).not.toMatch(/javascript:|alert\(/i);
  expect(preview.warnings.join(' ')).toContain('script');

  const fake = await request.post('/api/imports/preview', {
    multipart: {
      file: { name: 'falso.pdf', mimeType: 'application/pdf', buffer: Buffer.from('texto') },
    },
  });
  expect(fake.status()).toBe(422);
});

test('carrega o editor somente após a ação e salva Markdown', async ({ page, isMobile }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Início' })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Conteúdo da página' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  const editor = page.getByRole('textbox', { name: 'Conteúdo da página' });
  await expect(editor).toBeVisible({ timeout: 15_000 });
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

test('insere bloco avançado e preserva a configuração em Markdown', async ({ page, isMobile }) => {
  test.skip(isMobile, 'O fluxo é coberto no desktop; a leitura estreita é validada separadamente.');
  await page.goto('/');
  await page.getByRole('button', { name: 'Editar', exact: true }).click();
  await page.getByRole('button', { name: '/ Inserir' }).click();
  const answers = ['warning', 'Atenção'];
  page.on('dialog', (dialog) => dialog.accept(answers.shift() ?? ''));
  await page.getByRole('menuitem', { name: 'Aviso' }).click();
  await expect(page.locator('[data-advanced-block="callout"]')).toBeVisible();
  await page.getByRole('tab', { name: 'Markdown' }).click();
  await expect(page.getByRole('textbox', { name: 'Fonte Markdown' })).toContainText(
    ':::callout{tone=warning title="Atenção"}',
  );
  await page.getByRole('tab', { name: 'Prévia' }).click();
  await expect(page.locator('.preview .callout.warning')).toContainText('Escreva o aviso.');
});

test('upload local valida o tipo e serve o arquivo salvo', async ({ request, isMobile }) => {
  test.skip(isMobile, 'O endpoint é independente do dispositivo.');
  const uploaded = await request.post('/api/assets', {
    multipart: {
      file: {
        name: 'exemplo.txt',
        mimeType: 'text/plain',
        buffer: Buffer.from('conteúdo público'),
      },
    },
  });
  expect(uploaded.ok()).toBe(true);
  const result = await uploaded.json();
  expect(result.kind).toBe('file');
  expect(result.src).toMatch(/^\/assets\/[a-f0-9-]+\.txt$/);
  const served = await request.get(result.src);
  expect(served.ok()).toBe(true);
  expect(await served.text()).toBe('conteúdo público');

  const rejected = await request.post('/api/assets', {
    multipart: {
      file: { name: 'pagina.html', mimeType: 'text/html', buffer: Buffer.from('<script>') },
    },
  });
  expect(rejected.status()).toBe(415);
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
  const concurrentSave = await request.put('/api/pages/inicio', {
    data: { markdown: `${current.markdown}\nMudança concorrente.\n`, revision: current.revision },
  });
  expect(concurrentSave.ok()).toBe(true);
  await page.getByRole('button', { name: 'Salvar', exact: true }).click();
  await expect(page.getByText(/mudou desde que foi aberta/i)).toBeVisible({ timeout: 15_000 });
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
