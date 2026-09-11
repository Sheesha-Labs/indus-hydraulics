import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * `vercel.json` and `vercel-ignore-build.sh` must not drift apart.
 *
 * They did, from the commit that introduced them. PR #417 added the script
 * with two rules and, in the same commit, an INLINE `ignoreCommand` that
 * reimplemented only the first. `vercel.json` never referenced the script, so
 * rule 2 — skip a production build for a commit that changes only
 * documentation — has never run once, while `docs/deployment-budget.md`
 * documented it as active the whole time.
 *
 * Nothing catches that. The inline command works, builds happen, deployments
 * succeed; the only symptom is a bill nobody attributes to the right cause.
 * Hence a test that the config actually points at the script.
 */
const WEB = join(__dirname, '../..')
const config = JSON.parse(readFileSync(join(WEB, 'vercel.json'), 'utf8')) as {
  ignoreCommand?: string
}
const script = readFileSync(join(WEB, 'vercel-ignore-build.sh'), 'utf8')

describe('vercel ignore build step', () => {
  it('runs the script rather than an inline copy of it', () => {
    expect(config.ignoreCommand).toBeDefined()
    expect(config.ignoreCommand).toContain('vercel-ignore-build.sh')
  })

  /**
   * An inline command cannot express rule 2 and cannot be reviewed. If one
   * reappears the two descriptions have forked again, whatever it says.
   */
  it('does not reimplement the logic inline', () => {
    expect(config.ignoreCommand).not.toContain('VERCEL_ENV')
    expect(config.ignoreCommand).not.toContain('VERCEL_GIT_COMMIT_MESSAGE')
  })

  it('keeps both rules in the script', () => {
    // Rule 1 — previews build only when asked.
    expect(script).toContain('VERCEL_ENV')
    expect(script).toContain('[preview]')
    // Rule 2 — a documentation-only commit ships nothing.
    expect(script).toContain('docs/')
  })

  /**
   * Vercel runs the step from the project Root Directory, `apps/web`. Rule 2
   * diffs the whole repository, so the script must resolve to the repo root
   * first. Without it a commit touching only `packages/` looks like no change
   * at all, reads as documentation-only, and silently skips a real deploy.
   */
  it('resolves to the repository root before diffing', () => {
    expect(script).toContain('git rev-parse --show-toplevel')
    const cdAt = script.indexOf('rev-parse --show-toplevel')
    const diffAt = script.indexOf('git diff')
    expect(cdAt).toBeGreaterThan(-1)
    expect(diffAt).toBeGreaterThan(cdAt)
  })

  /** A shallow clone may have no HEAD^. Building is the safe answer. */
  it('builds rather than guesses when there is no parent commit', () => {
    expect(script).toContain('HEAD^')
    expect(script).toMatch(/rev-parse --verify --quiet HEAD\^/)
  })
})
