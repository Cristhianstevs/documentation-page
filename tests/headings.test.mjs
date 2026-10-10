import assert from 'node:assert/strict';
import test from 'node:test';
import { buildHeadingEntries, normalizeHeadingId } from '../js/headings.js';

test('gera IDs legíveis para acentos e pontuação', () => {
  assert.equal(normalizeHeadingId('Pré-requisitos'), 'pre-requisitos');
  assert.equal(normalizeHeadingId('Como começar?'), 'como-comecar');
});

test('mantém a ordem, os níveis e IDs explícitos', () => {
  const result = buildHeadingEntries([
    { text: 'Página', id: 'endereco-estavel', level: 1 },
    { text: 'Detalhes', id: '', level: 2 },
    { text: 'Exemplo', id: '', level: 3 },
  ]);
  assert.deepEqual(
    result.entries.map(({ id, text, level }) => ({ id, text, level })),
    [
      { id: 'endereco-estavel', text: 'Página', level: 1 },
      { id: 'detalhes', text: 'Detalhes', level: 2 },
      { id: 'exemplo', text: 'Exemplo', level: 3 },
    ],
  );
});

test('evita colisões entre IDs automáticos, repetidos e explícitos', () => {
  const result = buildHeadingEntries([
    { text: 'Exemplo', id: '', level: 2 },
    { text: 'Exemplo', id: '', level: 2 },
    { text: 'Outro texto', id: 'exemplo', level: 2 },
    { text: 'Repetido', id: 'exemplo', level: 2 },
  ]);
  assert.deepEqual(
    result.entries.map((entry) => entry.id),
    ['exemplo-2', 'exemplo-3', 'exemplo', 'exemplo-4'],
  );
  assert.match(result.issues.join(' '), /ID explícito repetido ou em conflito/);
});

test('não reutiliza IDs reservados por outros elementos do conteúdo', () => {
  const result = buildHeadingEntries([{ text: 'Exemplo', id: '', level: 2 }], {
    reservedIds: ['exemplo'],
  });
  assert.equal(result.entries[0].id, 'exemplo-2');
});

test('gera destino e aviso para título vazio', () => {
  const result = buildHeadingEntries([{ text: '   ', id: '', level: 2 }]);
  assert.equal(result.entries[0].id, 'secao');
  assert.equal(result.entries[0].text, 'Seção sem título');
  assert.match(result.issues.join(' '), /Título vazio/);
});
