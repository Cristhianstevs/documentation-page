import { spawn } from 'node:child_process';

export async function withLocalServer(callback, { port = 4180 } = {}) {
  const baseURL = `http://127.0.0.1:${port}`;
  const server = spawn(process.execPath, ['tools/serve.mjs', '--port', String(port)], {
    cwd: process.cwd(),
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let serverErrors = '';
  server.stderr.setEncoding('utf8');
  server.stderr.on('data', (chunk) => {
    serverErrors += chunk;
  });

  try {
    const deadline = Date.now() + 10_000;
    while (Date.now() < deadline) {
      if (server.exitCode !== null) {
        throw new Error(`O servidor encerrou antes da medição. ${serverErrors}`.trim());
      }
      try {
        const response = await fetch(baseURL);
        if (response.ok) break;
      } catch {
        // O servidor ainda está iniciando.
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    const response = await fetch(baseURL);
    if (!response.ok) throw new Error(`O servidor respondeu HTTP ${response.status}.`);
    return await callback(baseURL);
  } finally {
    server.kill('SIGTERM');
    await new Promise((resolve) => {
      if (server.exitCode !== null) resolve();
      else server.once('exit', resolve);
    });
  }
}

export function median(values) {
  const ordered = [...values].sort((first, second) => first - second);
  const middle = Math.floor(ordered.length / 2);
  return ordered.length % 2 === 0 ? (ordered[middle - 1] + ordered[middle]) / 2 : ordered[middle];
}
