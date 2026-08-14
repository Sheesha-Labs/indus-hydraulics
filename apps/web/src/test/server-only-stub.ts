// No-op shim used only when running under Vitest. The real `server-only`
// package throws at import time, which breaks unit-testing pure-logic
// modules that happen to live under a 'server-only' boundary.
//
// This file is aliased in `vitest.config.ts`. It should never be loaded
// at runtime in production (the real `server-only` is bundled there).
export {}
