import assert from 'node:assert/strict';
import test from 'node:test';
import JSZip from 'jszip';
import {
  ImportError,
  importDocumentFile,
  importTextFile,
  MAX_IMPORT_BYTES,
} from '../packages/importers/src/index.ts';

const bytes = (value) => new TextEncoder().encode(value);

function simplePdf(text) {
  const stream = `BT /F1 18 Tf 72 720 Td (${text}) Tj ET`;
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  let source = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(source.length);
    source += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xref = source.length;
  source += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  source += offsets
    .slice(1)
    .map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`)
    .join('');
  source += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return bytes(source);
}

test('importa Markdown e devolve uma prévia normalizada sem escrever arquivos', () => {
  const result = importTextFile({
    bytes: bytes('# Guia\n\nTexto com **destaque**.'),
    fileName: 'guia.md',
    mediaType: 'text/markdown',
  });

  assert.equal(result.kind, 'markdown');
  assert.match(result.markdown, /^# Guia/m);
  assert.equal(result.ast.children[0].type, 'heading');
  assert.deepEqual(result.warnings, []);
});

test('converte texto simples em parágrafos e informa a simplificação', () => {
  const result = importTextFile({
    bytes: bytes('Primeiro parágrafo.\n\nSegundo parágrafo.'),
    fileName: 'anotacoes.txt',
    mediaType: 'text/plain',
  });

  assert.equal(result.kind, 'text');
  assert.equal(result.ast.children.length, 2);
  assert.equal(result.warnings.length, 1);
});

test('recusa tipo falso, conteúdo binário, arquivo grande e operação cancelada', () => {
  assert.throws(
    () => importTextFile({ bytes: bytes('texto'), fileName: 'ata.md', mediaType: 'text/plain' }),
    (error) => error instanceof ImportError && error.code === 'invalid-type',
  );
  assert.throws(
    () =>
      importTextFile({
        bytes: Uint8Array.from([65, 0, 66]),
        fileName: 'ata.txt',
        mediaType: 'text/plain',
      }),
    (error) => error instanceof ImportError && error.code === 'invalid-content',
  );
  assert.throws(
    () =>
      importTextFile({
        bytes: new Uint8Array(MAX_IMPORT_BYTES + 1),
        fileName: 'ata.txt',
        mediaType: 'text/plain',
      }),
    (error) => error instanceof ImportError && error.code === 'too-large',
  );
  assert.throws(
    () =>
      importTextFile({
        bytes: bytes('texto'),
        fileName: 'ata.txt',
        mediaType: 'text/plain',
        signal: AbortSignal.abort(),
      }),
    (error) => error instanceof ImportError && error.code === 'aborted',
  );
});

test('converte HTML permitido e descarta conteúdo ativo e URLs perigosas', async () => {
  const result = await importDocumentFile({
    bytes: bytes(
      '<h1>Guia</h1><script>alert(1)</script><p><a href="javascript:alert(2)">Link</a></p><img src="data:text/html,ruim">',
    ),
    fileName: 'guia.html',
    mediaType: 'text/html',
  });
  assert.equal(result.kind, 'html');
  assert.match(result.markdown, /# Guia/);
  assert.doesNotMatch(result.markdown, /javascript:|alert\(|data:text/i);
  assert.ok(result.warnings.some((warning) => warning.includes('script')));
});

test('importa DOCX no servidor com aviso de simplificação', async () => {
  const archive = new JSZip();
  archive.file(
    '[Content_Types].xml',
    '<?xml version="1.0"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>',
  );
  archive.file(
    '_rels/.rels',
    '<?xml version="1.0"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>',
  );
  archive.file(
    'word/document.xml',
    '<?xml version="1.0"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body><w:p><w:pPr><w:pStyle w:val="Heading1"/></w:pPr><w:r><w:t>Documento Word</w:t></w:r></w:p><w:p><w:r><w:t>Conteúdo importado.</w:t></w:r></w:p></w:body></w:document>',
  );
  const docx = await archive.generateAsync({ type: 'uint8array' });
  const result = await importDocumentFile({
    bytes: docx,
    fileName: 'documento.docx',
    mediaType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  });
  assert.equal(result.kind, 'docx');
  assert.match(result.markdown, /Documento Word/);
  assert.ok(result.warnings.some((warning) => warning.includes('Word')));
});

test('importa o documento principal de uma exportação ZIP do Notion', async () => {
  const archive = new JSZip();
  archive.file('index.md', '# Página do Notion\n\nConteúdo exportado.');
  archive.file('anexos/nota.txt', 'Outro arquivo.');
  const zip = await archive.generateAsync({ type: 'uint8array' });
  const result = await importDocumentFile({
    bytes: zip,
    fileName: 'notion.zip',
    mediaType: 'application/zip',
  });
  assert.equal(result.kind, 'notion');
  assert.match(result.markdown, /Página do Notion/);
  assert.ok(result.warnings.some((warning) => warning.includes('index.md')));
});

test('extrai texto de PDF e avisa sobre possível perda estrutural', async () => {
  const result = await importDocumentFile({
    bytes: simplePdf('Manual PDF'),
    fileName: 'manual.pdf',
    mediaType: 'application/pdf',
  });
  assert.equal(result.kind, 'pdf');
  assert.match(result.markdown, /Manual PDF/);
  assert.ok(result.warnings.some((warning) => warning.includes('ordem de leitura')));
});

test('recusa arquivo corrompido e tipo binário falso', async () => {
  await assert.rejects(
    importDocumentFile({
      bytes: bytes('não é PDF'),
      fileName: 'falso.pdf',
      mediaType: 'application/pdf',
    }),
    (error) => error instanceof ImportError && error.code === 'invalid-type',
  );
  await assert.rejects(
    importDocumentFile({
      bytes: bytes('PK corrompido'),
      fileName: 'quebrado.docx',
      mediaType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }),
    (error) => error instanceof ImportError && error.code === 'invalid-content',
  );
  await assert.rejects(
    importDocumentFile({
      bytes: new Uint8Array(10 * 1024 * 1024 + 1),
      fileName: 'grande.pdf',
      mediaType: 'application/pdf',
    }),
    (error) => error instanceof ImportError && error.code === 'too-large',
  );
});
