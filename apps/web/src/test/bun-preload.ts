// bun test preload: the equivalent of the `server-only` alias the old
// vitest.config.ts carried. The real package throws at import time outside a
// React Server Component, which breaks unit tests of pure-logic modules that sit
// behind a 'server-only' boundary.
import { vi } from 'vitest'

vi.mock('server-only', () => ({}))
