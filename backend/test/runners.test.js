import test from 'node:test';
import assert from 'node:assert/strict';
import { runners } from '../src/services/toolRunners.js';
import { runTool } from '../src/services/toolService.js';

test('base64 round trip', () => {
  const enc = runners.base64({ mode: 'encode', text: 'Sakura 桜' }).output;
  assert.equal(enc, Buffer.from('Sakura 桜').toString('base64'));
  assert.equal(runners.base64({ mode: 'decode', text: enc }).output, 'Sakura 桜');
});

test('base64 decode rejects garbage', () => {
  assert.throws(() => runners.base64({ mode: 'decode', text: '***' }), /Base64/);
});

test('sha256 known vector', () => {
  assert.equal(
    runners.hash({ algorithm: 'sha256', text: 'abc' }).output,
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
  );
});

test('json format / minify / invalid', () => {
  assert.equal(runners['json-formatter']({ mode: 'minify', text: '{ "a": 1 }' }).output, '{"a":1}');
  assert.ok(runners['json-formatter']({ mode: 'format', text: '{"a":1}' }).output.includes('\n'));
  assert.throws(() => runners['json-formatter']({ mode: 'format', text: '{a' }), /JSON tidak valid/);
});

test('uuid count and format', () => {
  const { items } = runners.uuid({ count: 3 });
  assert.equal(items.length, 3);
  for (const u of items) assert.match(u, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('url codec', () => {
  assert.equal(runners['url-codec']({ mode: 'encode', text: 'a b&c' }).output, 'a%20b%26c');
  assert.throws(() => runners['url-codec']({ mode: 'decode', text: '%E0%A4%A' }), /percent/);
});

test('slugify', () => {
  assert.equal(runners.slugify({ text: '  Éxample Title — Sakura!! ' }).output, 'example-title-sakura');
});

test('text stats', () => {
  const { stats } = runners['text-stats']({ text: 'Halo dunia. Apa kabar?\nBaik.' });
  assert.equal(stats.words, 5);
  assert.equal(stats.sentences, 3);
  assert.equal(stats.lines, 2);
});

test('case converter', () => {
  assert.equal(runners['case-converter']({ mode: 'camel', text: 'hello big world' }).output, 'helloBigWorld');
  assert.equal(runners['case-converter']({ mode: 'snake', text: 'Hello Big World' }).output, 'hello_big_world');
  assert.equal(runners['case-converter']({ mode: 'title', text: 'hello world' }).output, 'Hello World');
});

test('password generator respects length and classes', () => {
  const p = runners['password-generator']({ length: 24, symbols: 'yes' }).output;
  assert.equal(p.length, 24);
  assert.match(p, /[a-z]/);
  assert.match(p, /[A-Z]/);
  assert.match(p, /[2-9]/);
  assert.match(p, /[^A-Za-z0-9]/);
  assert.doesNotMatch(runners['password-generator']({ length: 64, symbols: 'no' }).output, /[^A-Za-z0-9]/);
});

test('runTool validates input via zod', () => {
  assert.throws(() => runTool('hash', { algorithm: 'md5', text: 'x' }), (e) => e.code === 'VALIDATION_ERROR');
  assert.throws(() => runTool('hash', { text: '' }), (e) => e.code === 'VALIDATION_ERROR');
  assert.throws(() => runTool('uuid', { count: 999 }), (e) => e.code === 'VALIDATION_ERROR');
  assert.throws(() => runTool('hash', { text: 'x', evil: 1 }), (e) => e.code === 'VALIDATION_ERROR');
  assert.equal(runTool('hash', { text: 'abc' }).algorithm, 'sha256');
});

test('runTool reports not configured and unknown', () => {
  assert.throws(() => runTool('media-downloader', {}), (e) => e.code === 'NOT_CONFIGURED' && e.status === 409);
  assert.throws(() => runTool('nope', {}), (e) => e.status === 404);
});

import { record, snapshot } from '../src/services/statsService.js';
import { buildOpenApi } from '../src/services/openapi.js';

test('stats: successRate null tanpa request, lalu dihitung nyata', () => {
  assert.equal(snapshot().successRate, null);
  record({ method: 'GET', route: '/api/health', status: 200, ms: 1 });
  record({ method: 'POST', route: '/api/tools/:slug/run', status: 400, ms: 2 });
  const s = snapshot();
  assert.equal(s.totalRequests, 2);
  assert.equal(s.successRate, 50);
  assert.equal(s.clientErrors, 1);
});

test('openapi memuat tool aktif saja', () => {
  const spec = buildOpenApi('http://x');
  assert.ok(spec.paths['/api/tools/hash/run']);
  assert.equal(spec.paths['/api/tools/media-downloader/run'], undefined);
  assert.deepEqual(spec.paths['/api/tools/hash/run'].post.requestBody.content['application/json'].schema.required, ['text']);
});
