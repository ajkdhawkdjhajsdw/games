import assert from 'node:assert/strict';
import { HarborService } from '../server/service.ts';

const service = new HarborService({
  production: true,
  allowDevAuth: false,
  botToken: 'runtime-smoke-test-not-a-real-token',
  origins: ['https://quiet-harbor.example'],
  databasePath: ':memory:',
  tickMs: 0,
});
try {
  await new Promise((resolve, reject) => {
    service.server.once('error', reject);
    service.server.listen(0, '127.0.0.1', resolve);
  });
  const { port } = service.server.address();
  const response = await fetch(`http://127.0.0.1:${port}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  const auth = await fetch(`http://127.0.0.1:${port}/api/auth/dev`, {
    method: 'POST',
    headers: { Origin: 'https://quiet-harbor.example', 'Content-Type': 'application/json', 'X-Client-Id': 'runtime-smoke-check' },
    body: '{}',
  });
  assert.equal(auth.status, 404);
  console.log('Production runtime health and disabled development login verified.');
} finally {
  await service.close();
}
