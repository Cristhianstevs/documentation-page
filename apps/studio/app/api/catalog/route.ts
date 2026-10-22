import {
  applyCatalogOperation,
  type CatalogOperation,
  listTrash,
  readCatalogState,
} from '@documentation-page/content/catalog-repository';
import { RepositoryError } from '@documentation-page/content/repository';
import { NextResponse } from 'next/server';
import { siteRoot } from '@/lib/site-root';

function errorResponse(error: unknown) {
  if (!(error instanceof RepositoryError)) {
    return NextResponse.json(
      { error: 'Falha inesperada ao atualizar as configurações.' },
      { status: 500 },
    );
  }
  return NextResponse.json(
    { error: error.message, code: error.code },
    {
      status:
        error.code === 'revision-conflict' ? 409 : error.code === 'page-not-found' ? 404 : 400,
    },
  );
}

export async function GET() {
  try {
    const root = siteRoot();
    const [state, trash] = await Promise.all([readCatalogState(root), listTrash(root)]);
    return NextResponse.json({ ...state, trash });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { revision?: unknown; operation?: unknown };
    if (
      typeof body.revision !== 'string' ||
      !body.operation ||
      typeof body.operation !== 'object'
    ) {
      return NextResponse.json({ error: 'Revisão e operação são obrigatórias.' }, { status: 400 });
    }
    return NextResponse.json(
      await applyCatalogOperation(siteRoot(), {
        revision: body.revision,
        operation: body.operation as CatalogOperation,
      }),
    );
  } catch (error) {
    return errorResponse(error);
  }
}
