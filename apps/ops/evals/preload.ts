// Eval scripts run under plain `bun`, outside React Server Components: stub `server-only` the way the test
// preload does, so server modules can be imported.
import { plugin } from 'bun'

plugin({
  name: 'server-only-stub',
  setup(build) {
    build.module('server-only', () => ({ exports: {}, loader: 'object' }))
  },
})
