import { ImportError, importDocumentFile, MAX_UPLOAD_BYTES } from '@documentation-page/importers';
import { renderDocumentToHtml } from '@documentation-page/renderer';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const declaredLength = Number(request.headers.get('content-length') ?? 0);
  if (declaredLength > MAX_UPLOAD_BYTES + 64 * 1024) {
    return Response.json({ error: 'O envio excede o limite permitido.' }, { status: 413 });
  }

  try {
    if (request.signal.aborted) throw new ImportError('aborted', 'A importação foi cancelada.');
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return Response.json({ error: 'Selecione um arquivo para importar.' }, { status: 400 });
    }
    const preview = await importDocumentFile({
      bytes: new Uint8Array(await file.arrayBuffer()),
      fileName: file.name,
      mediaType: file.type,
      signal: request.signal,
    });
    return Response.json({ ...preview, ast: undefined, html: renderDocumentToHtml(preview.ast) });
  } catch (error) {
    if (error instanceof ImportError) {
      const status = error.code === 'too-large' ? 413 : error.code === 'aborted' ? 408 : 422;
      return Response.json({ error: error.message, code: error.code }, { status });
    }
    return Response.json({ error: 'Não foi possível preparar a importação.' }, { status: 400 });
  }
}
