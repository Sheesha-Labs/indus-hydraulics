import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Match Vitest's default include + co-located convention.
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
  resolve: {
    alias: {
      // `server-only` throws at import time outside a React Server
      // Component context. Vitest runs plain Node — alias to a no-op so
      // pure-logic modules that happen to be marked server-only can still
      // be unit-tested.
      'server-only': new URL('./src/test/server-only-stub.ts', import.meta.url).pathname,
    },
  },
})
