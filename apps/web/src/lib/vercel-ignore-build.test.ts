import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
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

  /**
   * Runs the real script against a throwaway repository, so the pathspecs are
   * exercised rather than string-matched. Exit 0 skips, exit 1 builds.
   */
  describe('rule 2 in production', () => {
    function decide(files: Record<string, string>): 'skip' | 'build' {
      const repo = mkdtempSync(join(tmpdir(), 'ignore-build-'))
      try {
        const git = (...args: string[]) =>
          execFileSync('git', ['-c', 'user.email=t@t', '-c', 'user.name=t', ...args], { cwd: repo })
        git('init', '-q')
        writeFileSync(join(repo, 'seed.txt'), 'seed')
        git('add', '-A')
        git('commit', '-q', '-m', 'seed')
        for (const [path, body] of Object.entries(files)) {
          mkdirSync(dirname(join(repo, path)), { recursive: true })
          writeFileSync(join(repo, path), body)
        }
        git('add', '-A')
        git('commit', '-q', '-m', 'change')
        const run = spawnSync('bash', [join(WEB, 'vercel-ignore-build.sh')], {
          cwd: repo,
          env: { ...process.env, VERCEL_ENV: 'production' },
        })
        if (run.status !== 0 && run.status !== 1) throw new Error(String(run.stderr))
        return run.status === 0 ? 'skip' : 'build'
      } finally {
        rmSync(repo, { recursive: true, force: true })
      }
    }

    it('skips a documentation-only commit', () => {
      expect(decide({ 'docs/x.txt': 'x', 'README.md': 'x' })).toBe('skip')
    })

    /**
     * Twelve payload-only PRs merged together on 2026-10-10 started twelve
     * concurrent production builds and exhausted the database pooler; the live
     * site served EMAXCONN 500s. The app never reads these files.
     */
    it('skips an already-applied import payload', () => {
      expect(
        decide({
          'packages/db/data/hd-example/catalogue.json': '{}',
          'packages/db/data/hd-example/README.md': 'x',
        }),
      ).toBe('skip')
    })

    it('builds when a payload ships with code', () => {
      expect(
        decide({
          'packages/db/data/hd-example/catalogue.json': '{}',
          'packages/db/src/x.ts': 'export {}',
        }),
      ).toBe('build')
    })

    it('builds for app code', () => {
      expect(decide({ 'apps/web/src/x.ts': 'export {}' })).toBe('build')
    })
  })
})
