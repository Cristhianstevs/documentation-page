import { readFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { siteRoot } from '@/lib/site-root';

const contentTypes: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
};

type AssetRouteContext = { params: Promise<{ name: string }> };

export async function GET(_request: Request, context: AssetRouteContext) {
  const { name } = await context.params;
  if (name !== basename(name) || !contentTypes[extname(name).toLowerCase()]) {
    return new Response('Arquivo inválido.', { status: 400 });
  }
  try {
    const contents = await readFile(join(siteRoot(), 'assets', name));
    return new Response(contents, {
      headers: {
        'content-type': contentTypes[extname(name).toLowerCase()],
        'cache-control': 'private, max-age=3600',
        'x-content-type-options': 'nosniff',
      },
    });
  } catch {
    return new Response('Arquivo não encontrado.', { status: 404 });
  }
}
