import assert from 'node:assert/strict';
import test from 'node:test';
import { readRoute, resolveRoute } from '../js/routes.js';

const docsConfig = [
  { id: 'vazia', title: 'Vazia', pages: [] },
  {
    id: 'guias',
    title: 'Guias',
    pages: [
      { id: 'introducao', title: 'Introdução', file: 'introducao.html' },
      { id: 'instalacao', title: 'Instalação', file: 'instalacao.html' },
    ],
  },
];

test('lê início, aba e página sem depender do navegador', () => {
  assert.deepEqual(readRoute(''), { type: 'start' });
  assert.deepEqual(readRoute('#guias'), {
    type: 'target',
    sectionId: 'guias',
    pageId: undefined,
    headingId: undefined,
  });
  assert.deepEqual(readRoute('#guias/instalacao'), {
    type: 'target',
    sectionId: 'guias',
    pageId: 'instalacao',
    headingId: undefined,
  });
  assert.deepEqual(readRoute('#guias/instalacao/pr%C3%A9-requisitos'), {
    type: 'target',
    sectionId: 'guias',
    pageId: 'instalacao',
    headingId: 'pré-requisitos',
  });
});

test('rejeita segmentos vazios ou além de aba e página', () => {
  for (const hash of ['#guias/', '#/introducao', '#guias/introducao/titulo/extra', '#guias/pagina/%']) {
    assert.deepEqual(readRoute(hash), { type: 'invalid' });
  }
});

test('o início abre a primeira página válida da configuração', () => {
  const result = resolveRoute(docsConfig, readRoute(''));
  assert.equal(result.status, 'page');
  assert.equal(result.section.id, 'guias');
  assert.equal(result.page.id, 'introducao');
  assert.equal(result.canonicalHash, '#guias/introducao');
});

test('uma aba abre sua primeira página e produz endereço completo', () => {
  const result = resolveRoute(docsConfig, readRoute('#guias'));
  assert.equal(result.status, 'page');
  assert.equal(result.page.id, 'introducao');
  assert.equal(result.canonicalHash, '#guias/introducao');
});

test('preserva uma página válida e rejeita destinos desconhecidos', () => {
  const valid = resolveRoute(docsConfig, readRoute('#guias/instalacao'));
  assert.equal(valid.status, 'page');
  assert.equal(valid.page.file, 'instalacao.html');

  assert.equal(resolveRoute(docsConfig, readRoute('#outra')).status, 'invalid');
  assert.equal(resolveRoute(docsConfig, readRoute('#guias/outra')).status, 'invalid');
});

test('preserva o título solicitado na rota da página', () => {
  const result = resolveRoute(docsConfig, readRoute('#guias/instalacao/pre-requisitos'));
  assert.equal(result.status, 'page');
  assert.equal(result.headingId, 'pre-requisitos');
  assert.equal(result.canonicalHash, '#guias/instalacao/pre-requisitos');
});

test('trata configuração e aba sem páginas como estados vazios', () => {
  assert.equal(resolveRoute([], readRoute('')).status, 'empty');
  const emptySection = resolveRoute(docsConfig, readRoute('#vazia'));
  assert.equal(emptySection.status, 'empty');
  assert.equal(emptySection.section.id, 'vazia');
});
