import assert from 'node:assert/strict';
import test from 'node:test';
import { loadPage } from '../js/load-page.js';

const page = { id: 'introducao', title: 'Introdução', file: 'introducao.html' };
const pagesUrl = new URL('https://example.test/docs/pages/');

test('carrega HTML de uma página cadastrada', async () => {
  const result = await loadPage({
    page,
    pagesUrl,
    fetchPage: async (url) => {
      assert.equal(url.href, 'https://example.test/docs/pages/introducao.html');
      return { ok: true, status: 200, text: async () => '<h1>Introdução</h1>' };
    },
  });
  assert.deepEqual(result, { status: 'ready', html: '<h1>Introdução</h1>' });
});

test('diferencia página vazia e arquivo inexistente', async () => {
  const empty = await loadPage({
    page,
    pagesUrl,
    fetchPage: async () => ({ ok: true, status: 200, text: async () => '  ' }),
  });
  assert.equal(empty.status, 'empty');

  const missing = await loadPage({
    page,
    pagesUrl,
    fetchPage: async () => ({ ok: false, status: 404 }),
  });
  assert.equal(missing.status, 'not-found');
  assert.match(missing.message, /introducao\.html/);
});

test('diferencia acesso negado e outros erros do servidor', async () => {
  for (const status of [401, 403]) {
    const denied = await loadPage({
      page,
      pagesUrl,
      fetchPage: async () => ({ ok: false, status }),
    });
    assert.equal(denied.status, 'access-denied');
  }

  const serverError = await loadPage({
    page,
    pagesUrl,
    fetchPage: async () => ({ ok: false, status: 500 }),
  });
  assert.equal(serverError.status, 'server-error');
  assert.match(serverError.message, /HTTP 500/);
});

test('diferencia falha de conexão e interrupção ao ler a resposta', async () => {
  const connectionFailure = await loadPage({
    page,
    pagesUrl,
    fetchPage: async () => {
      throw new TypeError('offline');
    },
  });
  assert.equal(connectionFailure.status, 'network-error');

  const interrupted = await loadPage({
    page,
    pagesUrl,
    fetchPage: async () => ({
      ok: true,
      status: 200,
      text: async () => {
        throw new TypeError('interrompido');
      },
    }),
  });
  assert.equal(interrupted.status, 'network-error');
  assert.match(interrupted.message, /interrompida/);
});
