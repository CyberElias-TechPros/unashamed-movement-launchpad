// Teach vitest-pool-workers about our bindings (DB, secrets, etc).
import type { Env } from '../src/types';

declare module 'cloudflare:test' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface ProvidedEnv extends Env {}
}
