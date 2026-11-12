import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { authorized, config, expiredCookie, passwordMatches, sessionCookie } from './server/auth.js';

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 4184);
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8', true]],
  ['/index.html', ['index.html', 'text/html; charset=utf-8', true]],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8', true]],
  ['/script.js', ['script.js', 'text/javascript; charset=utf-8', true]],
  ['/login.html', ['login.html', 'text/html; charset=utf-8', false]],
  ['/login.css', ['login.css', 'text/css; charset=utf-8', false]],
  ['/assets/multiplix-symbol.jpg', ['assets/multiplix-symbol.jpg', 'image/jpeg', false]],
  ['/assets/multiplix-wordmark.jpg', ['assets/multiplix-wordmark.jpg', 'image/jpeg', false]]
]);

const settings = config();
if (!settings) throw new Error('Defina RAIOX_PASSWORD e RAIOX_SESSION_SECRET em .env.local.');

function redirect(response, path, cookie) {
  response.writeHead(303, { Location: path, ...(cookie ? { 'Set-Cookie': cookie } : {}), 'Cache-Control': 'no-store' });
  response.end();
}

const server = createServer(async (request, response) => {
  const path = new URL(request.url, `http://${request.headers.host}`).pathname;
  response.setHeader('X-Robots-Tag', 'noindex, nofollow');
  response.setHeader('X-Content-Type-Options', 'nosniff');

  if (path === '/login') {
    if (request.method !== 'POST') return redirect(response, '/login.html');
    let body = '';
    for await (const chunk of request) {
      body += chunk;
      if (body.length > 4096) {
        response.writeHead(413).end();
        return;
      }
    }
    const input = new URLSearchParams(body).get('password');
    if (passwordMatches(input, settings.password)) return redirect(response, '/', sessionCookie(settings.secret, false));
    return redirect(response, '/login.html?erro=1');
  }
  if (path === '/logout') {
    if (request.method !== 'POST') return response.writeHead(405).end('Método não permitido.');
    return redirect(response, '/login.html', expiredCookie(false));
  }

  const file = files.get(path);
  if (!file) {
    response.writeHead(404).end('Página não encontrada.');
    return;
  }
  const [name, type, protectedFile] = file;
  if (protectedFile && !authorized(request.headers.cookie, settings.secret)) return redirect(response, '/login.html');

  try {
    const content = await readFile(join(root, name));
    response.writeHead(200, { 'Content-Type': type, 'Cache-Control': protectedFile ? 'private, no-store' : 'public, max-age=300' });
    response.end(content);
  } catch {
    response.writeHead(404).end('Página não encontrada.');
  }
});

server.listen(port, '127.0.0.1', () => console.log(`Raio-X Igor em http://127.0.0.1:${port}/`));
