import { HarborService } from './service.ts';

const production = process.env.NODE_ENV === 'production';
const port = Number(process.env.PORT ?? 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be a valid TCP port');
const service = new HarborService({
  production,
  allowDevAuth: process.env.ALLOW_DEV_AUTH === '1',
  botToken: process.env.TELEGRAM_BOT_TOKEN,
  origins: (process.env.APP_ORIGINS ?? 'http://localhost:3000,http://127.0.0.1:3000').split(',').map(v => v.trim()).filter(Boolean),
  databasePath: process.env.DATABASE_PATH ?? 'data/quiet-harbor.sqlite',
});
service.server.listen(port, '0.0.0.0', () => console.info(`Quiet Harbor service listening on ${port}`));
for (const signal of ['SIGTERM', 'SIGINT'] as const) process.once(signal, () => { void service.close().then(() => process.exit(0)); });
