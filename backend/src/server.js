import { createApp } from './app.js';
import { env } from './config/env.js';
import { flushNow } from './services/store.js';

const server = createApp().listen(env.port, () => {
  console.log(`SakuraApis API listening on :${env.port} (${env.nodeEnv})`);
});

for (const sig of ['SIGINT', 'SIGTERM']) {
  process.on(sig, () => server.close(() => { try { flushNow(); } catch (e) { console.error(e.message); } process.exit(0); }));
}
