import test from 'node:test';
import assert from 'node:assert/strict';
import proxy from '../proxy.js';

process.env.RAIOX_PASSWORD = 'senha-teste';
process.env.RAIOX_SESSION_SECRET = 'a-test-secret-with-more-than-thirty-two-characters';

test('proxy manda visitante sem sessão para o login', async () => {
  const response = await proxy(new Request('https://exemplo.vercel.app/'));
  assert.equal(response.status, 303);
  assert.equal(response.headers.get('location'), '/login.html');
});

test('proxy rejeita senha errada e cria sessão para a correta', async () => {
  const wrong = await proxy(new Request('https://exemplo.vercel.app/login', {
    method: 'POST',
    body: new URLSearchParams({ password: 'errada' })
  }));
  assert.equal(wrong.headers.get('location'), '/login.html?erro=1');

  const correct = await proxy(new Request('https://exemplo.vercel.app/login', {
    method: 'POST',
    body: new URLSearchParams({ password: 'senha-teste' })
  }));
  assert.equal(correct.status, 303);
  assert.equal(correct.headers.get('location'), '/');
  assert.match(correct.headers.get('set-cookie'), /HttpOnly.*Secure/);

  const session = correct.headers.get('set-cookie').split(';')[0];
  const admitted = await proxy(new Request('https://exemplo.vercel.app/index.html', {
    headers: { cookie: session }
  }));
  assert.equal(admitted.headers.get('cache-control'), 'private, no-store');
});
