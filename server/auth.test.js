import test from 'node:test';
import assert from 'node:assert/strict';
import { authorized, expiredCookie, passwordMatches, sessionCookie } from './auth.js';

const secret = 'a-real-secret-with-more-than-thirty-two-characters';

test('aceita a senha correta e rejeita senha diferente', () => {
  assert.equal(passwordMatches('senha-teste', 'senha-teste'), true);
  assert.equal(passwordMatches('Senha-teste', 'senha-teste'), false);
  assert.equal(passwordMatches('', 'senha-teste'), false);
});

test('sessão assinada permite acesso e resiste a alteração', () => {
  const now = Date.now();
  const cookie = sessionCookie(secret, false, now).split(';')[0];
  assert.equal(authorized(cookie, secret, now), true);
  assert.equal(authorized(cookie.replace(/.$/, 'x'), secret, now), false);
  assert.equal(authorized(cookie, 'outro-segredo', now), false);
  assert.equal(authorized(cookie, secret, now + 8 * 24 * 60 * 60 * 1000), false);
});

test('saída expira o cookie de sessão', () => {
  assert.match(expiredCookie(), /Max-Age=0/);
});
