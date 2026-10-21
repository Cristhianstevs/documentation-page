import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGzip } from 'node:zlib';

const projectRoot = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const rootArgument = process.argv.indexOf('--root');
const root = path.resolve(
  projectRoot,
  rootArgument >= 0 ? process.argv[rootArgument + 1] : projectRoot,
);
if (root !== projectRoot && !root.startsWith(`${projectRoot}${path.sep}`)) {
  throw new Error('A raiz do servidor precisa ficar dentro do projeto.');
}
const portArgument = process.argv.indexOf('--port');
const port = Number(portArgument >= 0 ? process.argv[portArgument + 1] : process.env.PORT || 4173);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('Informe uma porta válida com --port, por exemplo: --port 4173.');
}

const contentTypes = new Map([
  ['.css', 'text/css; charset=utf-8'],
  ['.html', 'text/html; charset=utf-8'],
  ['.ico', 'image/x-icon'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
]);

function sendFile(request, response, filePath, status = 200) {
  const contentType = contentTypes.get(path.extname(filePath)) ?? 'application/octet-stream';
  const canCompress = /^(text\/|application\/(javascript|json))/.test(contentType);
  const useGzip = canCompress && request.headers['accept-encoding']?.includes('gzip');
  const headers = {
    'Cache-Control': 'no-store',
    'Content-Type': contentType,
  };
  if (useGzip) {
    headers['Content-Encoding'] = 'gzip';
    headers.Vary = 'Accept-Encoding';
  }
  response.writeHead(status, headers);
  if (request.method === 'HEAD') {
    response.end();
    return;
  }
  const stream = createReadStream(filePath);
  if (useGzip) stream.pipe(createGzip()).pipe(response);
  else stream.pipe(response);
}

function resolveRequestPath(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
  const relativePath =
    pathname === '/'
      ? 'index.html'
      : `${pathname.replace(/^\/+/, '')}${pathname.endsWith('/') ? 'index.html' : ''}`;
  const resolvedPath = path.resolve(root, relativePath);
  return resolvedPath === root || resolvedPath.startsWith(`${root}${path.sep}`)
    ? resolvedPath
    : undefined;
}

const server = createServer(async (request, response) => {
  let filePath;
  try {
    filePath = resolveRequestPath(request.url ?? '/');
  } catch {
    response.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Requisição inválida.');
    return;
  }

  if (!filePath) {
    response.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Acesso negado.');
    return;
  }

  try {
    const file = await stat(filePath);
    if (!file.isFile()) throw new Error('Não é um arquivo.');
    sendFile(request, response, filePath);
  } catch {
    const notFoundPath = path.join(root, '404.html');
    try {
      const notFound = await stat(notFoundPath);
      if (!notFound.isFile()) throw new Error('404.html não é um arquivo.');
      sendFile(request, response, notFoundPath, 404);
    } catch {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      response.end('Arquivo não encontrado.');
    }
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Documentação disponível em http://127.0.0.1:${port}`);
});

function closeServer() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);
