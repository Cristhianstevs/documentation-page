import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { chromium, devices } from '@playwright/test';
import { withLocalServer } from './baseline-utils.mjs';

const outputDirectory = path.resolve('tests', 'baselines', '0.1.0', 'screenshots');

async function preparePage(context, baseURL, route) {
  const page = await context.newPage();
  await page.route(/fonts\.(googleapis|gstatic)\.com/, (request) => request.abort());
  await page.route('**/site/config.js', (request) =>
    request.fulfill({ status: 404, body: 'Instalação local ausente.' }),
  );
  await page.goto(`${baseURL}/${route}`);
  await page.locator('h1').waitFor();
  return page;
}

await mkdir(outputDirectory, { recursive: true });

await withLocalServer(async (baseURL) => {
  const browser = await chromium.launch({ headless: true });
  try {
    const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const desktopHome = await preparePage(desktop, baseURL, '#guias/introducao');
    await desktopHome.screenshot({
      path: path.join(outputDirectory, 'desktop-inicio.png'),
      fullPage: true,
    });
    await desktopHome.close();

    const desktopCatalog = await preparePage(desktop, baseURL, '#referencia/estilos');
    await desktopCatalog.screenshot({
      path: path.join(outputDirectory, 'desktop-catalogo.png'),
      fullPage: true,
    });
    await desktopCatalog.close();
    await desktop.close();

    const mobile = await browser.newContext(devices['Pixel 5']);
    const mobileLong = await preparePage(mobile, baseURL, '#guias/exemplos-praticos');
    await mobileLong.screenshot({
      path: path.join(outputDirectory, 'mobile-pagina-longa.png'),
      fullPage: true,
    });
    await mobileLong.close();

    const mobileMenu = await preparePage(mobile, baseURL, '#guias/instalacao');
    await mobileMenu.locator('.sidebar-toggle').click();
    await mobileMenu.screenshot({ path: path.join(outputDirectory, 'mobile-menu-aberto.png') });
    await mobileMenu.close();

    const mobileToc = await preparePage(mobile, baseURL, '#guias/instalacao');
    await mobileToc.getByRole('button', { name: 'Nesta página' }).click();
    await mobileToc.screenshot({ path: path.join(outputDirectory, 'mobile-indice-aberto.png') });
    await mobileToc.close();

    const mobileError = await preparePage(mobile, baseURL, '#aba-inexistente/pagina-inexistente');
    await mobileError.screenshot({ path: path.join(outputDirectory, 'mobile-rota-invalida.png') });
    await mobileError.close();
    await mobile.close();
  } finally {
    await browser.close();
  }
});

console.log(`Capturas gravadas em ${path.relative(process.cwd(), outputDirectory)}.`);
