import { spawn } from 'node:child_process';

const children = [
  spawn('node', ['--watch', '--import', 'tsx', 'server/index.ts'], { stdio: 'inherit', env: { ...process.env, ALLOW_DEV_AUTH: '1', PORT: '3001', APP_ORIGINS: process.env.APP_ORIGINS || 'http://localhost:3000,http://127.0.0.1:3000' } }),
  // Managed previews have no interactive stdin; EOF must not shut down Vite.
  spawn('node', ['node_modules/vite/bin/vite.js'], { stdio: 'inherit', env: { ...process.env, CI: 'true' } }),
];
let closing = false;
function close(code = 0) {
  if (closing) return;
  closing = true;
  for (const child of children) child.kill('SIGTERM');
  process.exitCode = code;
}
for (const child of children) {
  child.on('error', error => { console.error(error); close(1); });
  child.on('exit', (code, signal) => {
    if (!closing) console.error(`Development server exited unexpectedly (${signal || code}).`);
    close(code || 1);
  });
}
process.on('SIGINT', () => close());
process.on('SIGTERM', () => close());
