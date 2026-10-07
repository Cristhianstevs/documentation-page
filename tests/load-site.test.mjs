import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { loadSite, validateConfig } from '../js/load-site.js';

const baseUrl = new URL('https://example.test/documentacao/');
const config = {
  appSettings: { siteTitle: 'Wiki fictícia', logoText: 'WIKI', sidebarTitle: 'Conteúdo' },
  docsConfig: [
    {
      id: 'pesca',
      title: 'Pesca',
      pages: [{ id: 'equipamentos', title: 'Varas', file: 'varas.html' }],
    },
  ],
};

test('prefere a instalação e mantém todos os caminhos na subpasta', async () => {
  const imports = [];
  const site = await loadSite({
    baseUrl,
    fetchConfig: async (url) => {
      assert.equal(url, 'https://example.test/documentacao/site/config.js');
      return { ok: true, status: 200 };
    },
    importConfig: async (url) => {
      imports.push(url);
      return config;
    },
  });
  assert.deepEqual(imports, ['https://example.test/documentacao/site/config.js']);
  assert.equal(site.source, 'site');
  assert.equal(site.appSettings.siteTitle, 'Wiki fictícia');
  assert.equal(site.pagesUrl.href, 'https://example.test/documentacao/site/pages/');
  assert.equal(site.customCssUrl.href, 'https://example.test/documentacao/site/custom.css');
});

test('carrega os exemplos somente quando a configuração local responde 404', async () => {
  const site = await loadSite({
    baseUrl,
    fetchConfig: async () => ({ ok: false, status: 404 }),
    importConfig: async (url) => {
      assert.equal(url, 'https://example.test/documentacao/examples/config.js');
      return config;
    },
  });
  assert.equal(site.source, 'examples');
  assert.equal(site.pagesUrl.href, 'https://example.test/documentacao/examples/pages/');
});

for (const status of [401, 403, 500]) {
  test(`HTTP ${status} não abre os exemplos`, async () => {
    let imports = 0;
    await assert.rejects(
      loadSite({
        baseUrl,
        fetchConfig: async () => ({ ok: false, status }),
        importConfig: async () => {
          imports++;
          return config;
        },
      }),
      status === 500 ? /HTTP 500/ : /Acesso negado/,
    );
    assert.equal(imports, 0);
  });
}

test('falha de rede não abre os exemplos', async () => {
  await assert.rejects(
    loadSite({
      baseUrl,
      fetchConfig: async () => {
        throw new TypeError('offline');
      },
      importConfig: async () => assert.fail('Não deve importar após falha de rede'),
    }),
    /conexão e o servidor/,
  );
});

test('configuração com sintaxe inválida não tenta importar outra instalação', async () => {
  const imports = [];
  await assert.rejects(
    loadSite({
      baseUrl,
      fetchConfig: async () => ({ ok: true, status: 200 }),
      importConfig: async (url) => {
        imports.push(url);
        throw new SyntaxError('Configuração de teste inválida');
      },
    }),
    /site\/config.js.*sintaxe/,
  );
  assert.equal(imports.length, 1);
});

test('ausência do export obrigatório é erro; lista vazia é uma instalação válida', () => {
  assert.throws(() => validateConfig({}), /docsConfig/);
  assert.deepEqual(validateConfig({ docsConfig: [] }).docsConfig, []);
  assert.equal(validateConfig({ docsConfig: [] }).appSettings.siteTitle, 'Documentação');
});

test('rejeita caminhos fora da pasta de páginas', () => {
  for (const file of ['../segredo.html', 'https://example.test/pagina.html', 'pasta/pagina.html']) {
    const invalid = structuredClone(config);
    invalid.docsConfig[0].pages[0].file = file;
    assert.throws(() => validateConfig(invalid), /minha-pagina.html/);
  }
});

test('valida nomes e tipos antes de renderizar', () => {
  for (const id of [123, 'Minha Aba', 'ação']) {
    const invalid = structuredClone(config);
    invalid.docsConfig[0].id = id;
    assert.throws(() => validateConfig(invalid), /id/);
  }
  assert.throws(() => validateConfig({ ...config, appSettings: { logoText: null } }), /logoText/);
});

test('rejeita abas e páginas duplicadas', () => {
  assert.throws(
    () => validateConfig({ ...config, docsConfig: [config.docsConfig[0], config.docsConfig[0]] }),
    /Aba repetida/,
  );
  const invalid = structuredClone(config);
  invalid.docsConfig[0].pages.push(invalid.docsConfig[0].pages[0]);
  assert.throws(() => validateConfig(invalid), /Página repetida/);
});

test('normaliza o id de página antigo a partir do arquivo', () => {
  const legacy = structuredClone(config);
  delete legacy.docsConfig[0].pages[0].id;
  const validated = validateConfig(legacy);
  assert.equal(validated.docsConfig[0].pages[0].id, 'varas');
});

test('valida ids de página explícitos e rejeita repetições na mesma aba', () => {
  const invalidId = structuredClone(config);
  invalidId.docsConfig[0].pages[0].id = 'Ação';
  assert.throws(() => validateConfig(invalidId), /página varas\.html.*id/);

  const duplicate = structuredClone(config);
  duplicate.docsConfig[0].pages.push({
    id: 'equipamentos',
    title: 'Linhas',
    file: 'linhas.html',
  });
  assert.throws(() => validateConfig(duplicate), /ID de página repetido/);
});

test('a demonstração real mantém os identificadores das páginas antigas', async () => {
  const demo = validateConfig(await import('../examples/config.js'));
  const guias = demo.docsConfig.find((section) => section.id === 'guias');
  assert.ok(
    guias.pages.some((page) => page.id === 'introducao' && page.file === 'introducao.html'),
  );
  assert.ok(
    guias.pages.some((page) => page.id === 'instalacao' && page.file === 'instalacao.html'),
  );
  const html = await readFile(
    new URL('../examples/pages/instalacao.html', import.meta.url),
    'utf8',
  );
  assert.match(html, /site\/config.js/);
});

test('o Git do tema ignora a instalação e não rastreia seu conteúdo', () => {
  const root = new URL('../', import.meta.url);
  const options = { cwd: root, encoding: 'utf8' };
  const ignored = execFileSync(
    'git',
    ['check-ignore', 'site/config.js', 'site/pages/varas.html'],
    options,
  );
  assert.equal(ignored.trim().split(/\r?\n/).length, 2);
  assert.equal(execFileSync('git', ['ls-files', 'site'], options).trim(), '');
});
