import assert from 'node:assert/strict';
import { test } from 'node:test';
import { previewOrigin } from '../scripts/preview-origin';
import { createServer } from 'vite';
import { resolve } from 'node:path';

test('preview proxy only normalizes exact HTTPS same-origin within trusted runtime namespace', () => {
  const suffix = '.preview.usehoplite.com';
  const host = 'quiet-harbor.preview.usehoplite.com';
  assert.equal(previewOrigin(`https://${host}`, host, suffix), 'http://127.0.0.1:3000');
  for (const origin of [undefined, 'null', 'https://attacker.example', 'https://sibling.preview.usehoplite.com', `http://${host}`, `https://${host}/`]) {
    assert.equal(previewOrigin(origin, host, suffix), origin);
  }
  for (const untrusted of ['evilpreview.usehoplite.com', 'preview.usehoplite.com.attacker.example', 'other.example', 'host@quiet-harbor.preview.usehoplite.com']) {
    assert.equal(previewOrigin(`https://${untrusted}`, untrusted, suffix), `https://${untrusted}`);
  }
  assert.equal(previewOrigin(`https://${host}`, host, undefined), `https://${host}`);
});

test('Vite refuses direct, raw and absolute private-file access while serving public graphs', async t => {
  const server = await createServer({ server: { port: 0, host: '127.0.0.1', hmr: false }, logLevel: 'silent' });
  t.after(() => server.close());
  await server.listen();
  const address = server.httpServer!.address();
  assert(address && typeof address !== 'string');
  const base = `http://127.0.0.1:${address.port}`;
  for (const file of ['server/content-data.json', 'server/service.ts', 'reports/content-validation.json', 'tests/content.test.ts', 'scripts/dev.mjs']) {
    for (const path of [`/${file}`, `/${file}?raw`, `/@fs${resolve(file)}`]) {
      const response = await fetch(base + path);
      assert.equal(response.status, 403, path);
    }
  }
  const publicGraph = await fetch(base + '/assets/map-previews.json');
  assert.equal(publicGraph.status, 200);
  assert.equal((await publicGraph.json()).length, 10);
});
