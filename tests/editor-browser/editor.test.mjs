import { expect, test } from '@playwright/test';

const percentile95 = (values) => {
  const ordered = values.toSorted((first, second) => first - second);
  return ordered[Math.ceil(ordered.length * 0.95) - 1];
};

const median = (values) => {
  const ordered = values.toSorted((first, second) => first - second);
  return ordered[Math.floor(ordered.length / 2)];
};

test('edita por teclado e preserva desfazer/refazer', async ({ page }) => {
  await page.goto('/');
  const editor = page.getByRole('textbox', { name: 'Conteúdo do documento' });
  await editor.focus();
  await page.keyboard.press('Control+A');
  await page.keyboard.type('Texto escrito pelo teclado');
  await expect(editor).toContainText('Texto escrito pelo teclado');
  await page.keyboard.press('Control+Z');
  await expect(editor).not.toContainText('Texto escrito pelo teclado');
  await page.keyboard.press('Control+Shift+Z');
  await expect(editor).toContainText('Texto escrito pelo teclado');
});

test('mede Lexical com documento de 5.000 blocos', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await page.getByRole('button', { name: 'Carregar 5.000 blocos' }).click();
  const status = page.getByTestId('experiment-status');
  await expect(status).toContainText('5.000 blocos carregados', { timeout: 15_000 });
  const loadDuration = Number((await status.textContent())?.match(/(\d+) ms/)?.[1]);
  expect(loadDuration).toBeLessThan(5_000);

  const editor = page.getByRole('textbox', { name: 'Conteúdo do documento' });
  await editor.evaluate((element) => {
    const target = element.lastElementChild;
    const range = document.createRange();
    range.selectNodeContents(target);
    range.collapse(false);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    element.focus();
  });
  const samples = [];
  for (let run = 0; run < 5; run += 1) {
    await page.evaluate(() => {
      window.__editorTypingLatencies = [];
    });
    await page.keyboard.type('abcdefghijklmnopqrst');
    const latencies = await page.evaluate(() => window.__editorTypingLatencies ?? []);
    expect(latencies.length).toBeGreaterThanOrEqual(15);
    samples.push(percentile95(latencies));
  }
  const typingP95 = median(samples);
  console.log(
    `Lexical com 5.000 blocos: carga ${loadDuration} ms; mediana do p95 ${typingP95.toFixed(2)} ms.`,
  );
  expect(typingP95).toBeLessThan(100);
});

test('compara Tiptap com o mesmo documento e teclado', async ({ page }) => {
  await page.goto('/tiptap/');
  await page.getByRole('button', { name: 'Carregar 5.000 blocos' }).click();
  const status = page.getByTestId('experiment-status');
  await expect(status).toContainText('5.000 blocos carregados', { timeout: 15_000 });
  const loadDuration = Number((await status.textContent())?.match(/(\d+) ms/)?.[1]);
  const editor = page.getByRole('textbox', { name: 'Conteúdo do documento Tiptap' });
  await editor.evaluate((element) => {
    const target = element.lastElementChild;
    const range = document.createRange();
    range.selectNodeContents(target);
    range.collapse(false);
    const selection = getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    element.focus();
  });
  const samples = [];
  for (let run = 0; run < 5; run += 1) {
    await page.evaluate(() => {
      window.__tiptapTypingLatencies = [];
    });
    await page.keyboard.type('abcdefghijklmnopqrst');
    const latencies = await page.evaluate(() => window.__tiptapTypingLatencies ?? []);
    expect(latencies.length).toBeGreaterThanOrEqual(15);
    samples.push(percentile95(latencies));
  }
  const typingP95 = median(samples);
  console.log(
    `Tiptap com 5.000 blocos: carga ${loadDuration} ms; mediana do p95 ${typingP95.toFixed(2)} ms.`,
  );
  expect(loadDuration).toBeLessThan(5_000);
  expect(typingP95).toBeLessThan(50);
});
