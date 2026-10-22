import {
  RepositoryError,
  readEditablePage,
  saveEditablePage,
} from '@documentation-page/content/repository';
import { NextResponse } from 'next/server';
import { siteRoot } from '@/lib/site-root';

type RouteContext = { params: Promise<{ pageId: string }> };

function errorResponse(error: unknown) {
  if (!(error instanceof RepositoryError)) {
    return NextResponse.json({ error: 'Falha inesperada ao acessar a página.' }, { status: 500 });
  }
  const status =
    error.code === 'revision-conflict'
      ? 409
      : error.code === 'page-not-found' || error.code === 'document-not-found'
        ? 404
        : 400;
  return NextResponse.json({ error: error.message, code: error.code }, { status });
}

export async function GET(_request: Request, context: RouteContext) {
  try {
    const { pageId } = await context.params;
    return NextResponse.json(await readEditablePage(siteRoot(), pageId));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { pageId } = await context.params;
    const body = (await request.json()) as { markdown?: unknown; revision?: unknown };
    if (typeof body.markdown !== 'string' || typeof body.revision !== 'string') {
      return NextResponse.json({ error: 'Conteúdo e revisão são obrigatórios.' }, { status: 400 });
    }
    return NextResponse.json(
      await saveEditablePage(siteRoot(), {
        pageId,
        markdown: body.markdown,
        revision: body.revision,
      }),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
