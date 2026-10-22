import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { NextResponse } from 'next/server';
import { siteRoot } from '@/lib/site-root';

const MAX_BYTES = 25 * 1024 * 1024;
const allowedTypes = new Map([
  ['image/png', { extension: '.png', kind: 'image' }],
  ['image/jpeg', { extension: '.jpg', kind: 'image' }],
  ['image/gif', { extension: '.gif', kind: 'image' }],
  ['image/webp', { extension: '.webp', kind: 'image' }],
  ['audio/mpeg', { extension: '.mp3', kind: 'audio' }],
  ['audio/ogg', { extension: '.ogg', kind: 'audio' }],
  ['video/mp4', { extension: '.mp4', kind: 'video' }],
  ['video/webm', { extension: '.webm', kind: 'video' }],
  ['application/pdf', { extension: '.pdf', kind: 'file' }],
  ['text/plain', { extension: '.txt', kind: 'file' }],
]);

export async function POST(request: Request) {
  const form = await request.formData();
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Selecione um arquivo.' }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json({ error: 'O arquivo deve ter até 25 MB.' }, { status: 413 });
  }
  const accepted = allowedTypes.get(file.type);
  if (!accepted) {
    return NextResponse.json({ error: 'Tipo de arquivo não permitido.' }, { status: 415 });
  }
  const originalExtension = extname(file.name).toLowerCase();
  const extension =
    originalExtension === accepted.extension ? originalExtension : accepted.extension;
  const name = `${randomUUID()}${extension}`;
  const directory = join(siteRoot(), 'assets');
  await mkdir(directory, { recursive: true });
  await writeFile(join(directory, name), Buffer.from(await file.arrayBuffer()), { flag: 'wx' });
  return NextResponse.json({ src: `/assets/${name}`, kind: accepted.kind, name: file.name });
}
