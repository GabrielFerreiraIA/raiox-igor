import { next } from '@vercel/functions';
import { authorized, config, expiredCookie, passwordMatches, sessionCookie } from './server/auth.js';

const publicFiles = new Set([
  '/login.html',
  '/login.css',
  '/assets/multiplix-symbol.jpg',
  '/assets/multiplix-wordmark.jpg'
]);
const protectedFiles = new Set(['/', '/index.html', '/styles.css', '/script.js']);

function redirect(path, cookie) {
  const headers = new Headers({ Location: path, 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' });
  if (cookie) headers.set('Set-Cookie', cookie);
  return new Response(null, { status: 303, headers });
}

export default async function proxy(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  const secure = url.protocol === 'https:';

  if (publicFiles.has(path)) return next();
  if (!protectedFiles.has(path) && path !== '/login' && path !== '/logout') {
    return new Response('Página não encontrada.', { status: 404 });
  }

  const settings = config();
  if (!settings) {
    return new Response('Acesso ainda não configurado. Defina RAIOX_PASSWORD e RAIOX_SESSION_SECRET na Vercel.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }
    });
  }

  if (path === '/login') {
    if (request.method !== 'POST') return redirect('/login.html');
    const form = await request.formData();
    const input = form.get('password');
    if (passwordMatches(input, settings.password)) return redirect('/', sessionCookie(settings.secret, secure));
    return redirect('/login.html?erro=1');
  }

  if (path === '/logout') {
    if (request.method !== 'POST') return new Response('Método não permitido.', { status: 405 });
    return redirect('/login.html', expiredCookie(secure));
  }
  if (!authorized(request.headers.get('cookie'), settings.secret)) return redirect('/login.html');

  const response = next();
  response.headers.set('Cache-Control', 'private, no-store');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
