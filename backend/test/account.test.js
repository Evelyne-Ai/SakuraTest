process.env.DATA_DIR = 'memory';
process.env.FREE_DAILY_LIMIT = '3';
process.env.ADMIN_EMAILS = 'boss@example.com';

import test from 'node:test';
import assert from 'node:assert/strict';

const users = await import('../src/services/users.js');
const { signToken, verifyToken } = await import('../src/services/auth.js');
const keys = await import('../src/services/keys.js');
const usage = await import('../src/services/usage.js');
const { requireApiKey } = await import('../src/middleware/auth.js');
const { getDb } = await import('../src/services/store.js');

test('register + login, password di-hash, email unik', async () => {
  const u = await users.register({ email: 'a@example.com', password: 'rahasia123' });
  assert.ok(u.passwordHash.includes(':') && !u.passwordHash.includes('rahasia123'));
  assert.equal(u.name, 'a');
  assert.equal(u.role, 'user');
  await assert.rejects(() => users.register({ email: 'a@example.com', password: 'rahasia123' }), /terdaftar/);
  assert.equal((await users.login({ email: 'a@example.com', password: 'rahasia123' })).id, u.id);
  await assert.rejects(() => users.login({ email: 'a@example.com', password: 'salah' }), /salah/);
  await assert.rejects(() => users.login({ email: 'tidak@ada.com', password: 'x' }), /salah/);
});

test('email di ADMIN_EMAILS menjadi admin', async () => {
  assert.equal((await users.register({ email: 'boss@example.com', password: 'rahasia123' })).role, 'admin');
});

test('token: valid, dirusak, dan kedaluwarsa', () => {
  const t = signToken('user-1');
  assert.equal(verifyToken(t), 'user-1');
  assert.equal(verifyToken(t.slice(0, -2) + 'xx'), null);
  assert.equal(verifyToken(signToken('user-1', -1000)), null);
  assert.equal(verifyToken('sampah'), null);
});

test('API key: hanya hash yang disimpan, bisa dicabut, ada batas jumlah', async () => {
  const u = await users.register({ email: 'k@example.com', password: 'rahasia123' });
  const { key, record } = keys.createKey(u, 'app');
  assert.ok(key.startsWith('sk_sakura_'));
  const stored = getDb().keys.find((k) => k.id === record.id);
  assert.notEqual(stored.hash, key);
  assert.ok(!JSON.stringify(stored).includes(key));
  assert.equal(keys.findActiveByRaw(key).id, record.id);
  assert.equal(keys.findActiveByRaw(key + 'x'), null);
  keys.createKey(u, 'dua');
  keys.createKey(u, 'tiga');
  assert.throws(() => keys.createKey(u, 'empat'), /Batas 3/);
  keys.revokeKey(u.id, record.id);
  assert.equal(keys.findActiveByRaw(key), null);
  assert.equal(keys.createKey(u, 'pengganti').record.label, 'pengganti');
});

function call(rawKey) {
  const handlers = {};
  const res = { headers: {}, statusCode: 200, set(k, v) { this.headers[k] = v; }, on(ev, fn) { handlers[ev] = fn; }, off() {} };
  const req = { get: (h) => (h.toLowerCase() === 'x-api-key' ? rawKey : ''), path: '/v1/x', baseUrl: '/api', method: 'POST' };
  let err = null;
  requireApiKey(req, res, (e) => { err = e ?? null; });
  return { req, res, err, finish: () => handlers.finish?.() };
}

test('requireApiKey: tolak tanpa/palsu, hitung pemakaian, limit harian', async () => {
  const u = await users.register({ email: 'l@example.com', password: 'rahasia123' });
  const { key } = keys.createKey(u, 'x');
  assert.equal(call(undefined).err.code, 'API_KEY_REQUIRED');
  assert.equal(call('sk_sakura_palsu_palsu_palsu').err.code, 'INVALID_API_KEY');
  for (let i = 0; i < 3; i++) {
    const c = call(key);
    assert.equal(c.err, null);
    c.finish();
  }
  assert.equal(usage.todayCount(u), 3);
  const blocked = call(key);
  assert.equal(blocked.err.code, 'DAILY_LIMIT');
  assert.equal(blocked.res.headers['X-RateLimit-Limit'], '3');
  blocked.finish();
  assert.equal(usage.todayCount(u), 3, 'request yang ditolak tidak dihitung');
  assert.equal(u.usage.total, 3);
  assert.equal(usage.trafficLast24h(u).length, 24);
  assert.equal(usage.trafficLast24h(u).at(-1).requests, 3);
  assert.ok(getDb().logs.every((l) => !('body' in l) && !('ip' in l)));
});

test('admin setPlan menaikkan limit', async () => {
  const u = await users.register({ email: 'p@example.com', password: 'rahasia123' });
  users.setPlan('p@example.com', 'premium');
  assert.equal(users.publicUser(u).plan, 'premium');
  assert.throws(() => users.setPlan('x@tidak.ada', 'premium'), /tidak ditemukan/);
});
