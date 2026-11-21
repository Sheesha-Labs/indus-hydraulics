// bun test preload: `server-only` throws outside a React Server Component, which
// breaks unit tests of pure-logic modules behind a 'server-only' boundary.
import { vi } from 'vitest'

vi.mock('server-only', () => ({}))
