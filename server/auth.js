import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'raiox_igor_session';
const SESSION_SECONDS = 60 * 60 * 24 * 7;

export function config() {
  const password = process.env.RAIOX_PASSWORD;
  const secret = process.env.RAIOX_SESSION_SECRET;
  if (!password || !secret || secret.length < 32) return null;
  return { password, secret };
}

function equal(a, b) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

function signature(expires, secret) {
  return createHmac('sha256', secret).update(`igor:${expires}`).digest('base64url');
}

export function passwordMatches(input, expected) {
  return typeof input === 'string' && input.length <= 128 && equal(input, expected);
}

export function authorized(cookieHeader, secret, now = Date.now()) {
  const cookies = (cookieHeader || '').split(';').map((item) => item.trim());
  const value = cookies.find((item) => item.startsWith(`${COOKIE_NAME}=`))?.slice(COOKIE_NAME.length + 1);
  if (!value) return false;
  const [expiresRaw, supplied, extra] = value.split('.');
  if (extra || !/^\d{13}$/.test(expiresRaw || '') || !supplied) return false;
  const expires = Number(expiresRaw);
  return expires > now && expires <= now + SESSION_SECONDS * 1000 && equal(supplied, signature(expiresRaw, secret));
}

export function sessionCookie(secret, secure = true, now = Date.now()) {
  const expires = String(now + SESSION_SECONDS * 1000);
  const value = `${expires}.${signature(expires, secret)}`;
  return `${COOKIE_NAME}=${value}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_SECONDS}${secure ? '; Secure' : ''}`;
}

export function expiredCookie(secure = true) {
  return `${COOKIE_NAME}=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0${secure ? '; Secure' : ''}`;
}
