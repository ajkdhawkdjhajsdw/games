import { createHmac, createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Store, StoredUser } from './store.ts';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) { super(message); }
}
export function fail(status: number, code: string, message: string): never { throw new ApiError(status, code, message); }
export function hash(value: string): string { return createHash('sha256').update(value).digest('hex'); }
export function safeName(value: unknown): string {
  const text = typeof value === 'string' ? value.normalize('NFKC').replace(/[\p{Cc}\p{Cf}]/gu, '').trim() : '';
  return [...new Intl.Segmenter('en', { granularity: 'grapheme' }).segment(text)].slice(0, 32).map(s => s.segment).join('') || 'Captain';
}
export interface AuthConfig { production: boolean; allowDevAuth: boolean; botToken?: string; origins: string[] }
export function verifyTelegram(initData: string, botToken: string, now: number): { subject: string; name: string } {
  if (initData.length > 8192 || /%(?![\da-f]{2})/i.test(initData)) fail(401, 'AUTH_INVALID', 'Reopen Quiet Harbor from Telegram.');
  const data = new URLSearchParams(initData);
  if ([...data.keys()].some((key, i, keys) => keys.indexOf(key) !== i)) fail(401, 'AUTH_INVALID', 'Reopen Quiet Harbor from Telegram.');
  const provided = data.get('hash') || '';
  if (!/^[a-f\d]{64}$/i.test(provided)) fail(401, 'AUTH_INVALID', 'Reopen Quiet Harbor from Telegram.');
  data.delete('hash');
  const canonical = [...data.entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, value]) => `${key}=${value}`).join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const expected = createHmac('sha256', secret).update(canonical).digest();
  if (!timingSafeEqual(expected, Buffer.from(provided, 'hex'))) fail(401, 'AUTH_INVALID', 'Reopen Quiet Harbor from Telegram.');
  const authDate = data.get('auth_date');
  if (!authDate || !/^\d+$/.test(authDate)) fail(401, 'AUTH_INVALID', 'Reopen Quiet Harbor from Telegram.');
  const age = now - Number(authDate) * 1000;
  if (!Number.isFinite(age) || age > 300_000 || age < -30_000) fail(401, 'AUTH_EXPIRED', 'Reopen Quiet Harbor from Telegram.');
  let user: { id?: unknown; first_name?: unknown; last_name?: unknown };
  try { user = JSON.parse(data.get('user') || '{}'); } catch { return fail(401, 'AUTH_INVALID', 'Reopen Quiet Harbor from Telegram.'); }
  if (!user || typeof user !== 'object' || !Number.isSafeInteger(user.id) || Number(user.id) <= 0) fail(401, 'AUTH_INVALID', 'Reopen Quiet Harbor from Telegram.');
  return { subject: `telegram:${user.id}`, name: safeName([user.first_name, user.last_name].filter(v => typeof v === 'string').join(' ')) };
}

export class Auth {
  constructor(private store: Store, readonly config: AuthConfig) {
    if (config.production && config.allowDevAuth) throw new Error('Development authentication is forbidden in production');
    if (config.production && !config.botToken) throw new Error('Production requires TELEGRAM_BOT_TOKEN');
    if (!config.origins.length || config.origins.some(origin => !/^https?:\/\//.test(origin) || new URL(origin).origin !== origin)) throw new Error('APP_ORIGINS must contain exact HTTP(S) origins');
    if (config.production && config.origins.some(origin => !origin.startsWith('https://'))) throw new Error('Production origins require HTTPS');
  }
  origin(req: IncomingMessage): void {
    const origin = req.headers.origin;
    if (origin && !this.config.origins.includes(origin)) fail(403, 'ORIGIN_DENIED', 'Request not allowed.');
    if (req.method !== 'GET' && req.method !== 'HEAD' && !origin) fail(403, 'ORIGIN_DENIED', 'Request not allowed.');
    if (req.headers['sec-fetch-site'] === 'cross-site') fail(403, 'ORIGIN_DENIED', 'Request not allowed.');
  }
  session(req: IncomingMessage, now: number): StoredUser | undefined {
    const token = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('qh_session='))?.slice(11);
    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) return;
    const row = this.store.db.prepare('SELECT users.* FROM sessions JOIN users ON users.id=sessions.user_id WHERE hash=? AND expires_at>?').get(hash(token), now);
    if (!row) return;
    return { id: String(row.id), subject: String(row.subject), name: String(row.name), createdAt: Number(row.created_at) };
  }
  login(res: ServerResponse, subject: string, name: string, now: number): StoredUser {
    const user = this.store.user(subject, safeName(name), now);
    const token = randomBytes(32).toString('base64url');
    this.store.db.prepare('INSERT INTO sessions VALUES (?,?,?)').run(hash(token), user.id, now + 3_600_000);
    this.store.db.prepare('DELETE FROM sessions WHERE expires_at<=?').run(now);
    res.setHeader('Set-Cookie', `qh_session=${token}; Path=/api; HttpOnly; SameSite=Lax; Max-Age=3600${this.config.production ? '; Secure' : ''}`);
    return user;
  }
  logout(req: IncomingMessage, res: ServerResponse): void {
    const token = (req.headers.cookie || '').split(';').map(s => s.trim()).find(s => s.startsWith('qh_session='))?.slice(11);
    if (token) this.store.db.prepare('DELETE FROM sessions WHERE hash=?').run(hash(token));
    res.setHeader('Set-Cookie', `qh_session=; Path=/api; HttpOnly; SameSite=Lax; Max-Age=0${this.config.production ? '; Secure' : ''}`);
  }
}
