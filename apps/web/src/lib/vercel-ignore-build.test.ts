import { execFileSync, spawnSync } from 'node:child_process'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * Both vercel.json files and the shared scripts/vercel-ignore-build.sh must not
 * drift apart.
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
 * Hence a test that each config actually points at the script, with its own app.
 */
const REPO = join(import.meta.dirname, '../../../..')
const SCRIPT = join(REPO, 'scripts/vercel-ignore-build.sh')
const AFFECTED = join(REPO, 'scripts/affected-workspaces.mjs')
const script = readFileSync(SCRIPT, 'utf8')
const configFor = (app: string) =>
  JSON.parse(readFileSync(join(REPO, app, 'vercel.json'), 'utf8')) as { ignoreCommand?: string }

describe('vercel ignore build step', () => {
  it("runs the shared script with each app's own package name", () => {
    expect(configFor('apps/web').ignoreCommand).toBe(
      'bash ../../scripts/vercel-ignore-build.sh web'
    )
    expect(configFor('apps/ops').ignoreCommand).toBe(
      'bash ../../scripts/vercel-ignore-build.sh @indus/ops'
    )
  })

  /**
   * An inline command cannot express the rules and cannot be reviewed. If one
   * reappears the two descriptions have forked again, whatever it says.
   */
  it('does not reimplement the logic inline', () => {
    for (const app of ['apps/web', 'apps/ops']) {
      expect(configFor(app).ignoreCommand).not.toContain('VERCEL_ENV')
      expect(configFor(app).ignoreCommand).not.toContain('VERCEL_GIT_COMMIT_MESSAGE')
    }
  })

  it('keeps all three rules in the script', () => {
    // Rule 1 — previews build only when asked.
    expect(script).toContain('VERCEL_ENV')
    expect(script).toContain('[preview]')
    // Rule 2 — a documentation-only commit ships nothing.
    expect(script).toContain('docs/')
    // Rule 3 — only the apps the commit affects.
    expect(script).toContain('scripts/affected-workspaces.mjs')
  })

  /**
   * Vercel runs the step from the project Root Directory (`apps/web`,
   * `apps/ops`). The rules diff the whole repository, so the script must
   * resolve to the repo root first. Without it a commit touching only
   * `packages/` looks like no change at all, reads as documentation-only, and
   * silently skips a real deploy.
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
   * Runs the real scripts against a throwaway repository shaped like this
   * workspace, so the pathspecs and the dependency graph are exercised rather
   * than string-matched. Exit 0 skips, exit 1 builds.
   */
  const WORKSPACE: Record<string, object> = {
    'package.json': { name: 'repo', private: true, workspaces: ['apps/*', 'packages/*'] },
    'apps/web/package.json': { name: 'web', dependencies: { '@indus/domain': 'workspace:^' } },
    'apps/ops/package.json': {
      name: '@indus/ops',
      dependencies: { '@indus/ops-core': 'workspace:^' },
    },
    'packages/domain/package.json': { name: '@indus/domain' },
    'packages/ops-core/package.json': { name: '@indus/ops-core' },
    // Test-only and imported by nothing (S18-T01): affects neither app.
    'packages/ops-crosscheck/package.json': {
      name: '@indus/ops-crosscheck',
      devDependencies: { '@indus/ops-core': 'workspace:^', '@indus/domain': 'workspace:^' },
    },
  }

  function decide(
    app: 'web' | '@indus/ops',
    files: Record<string, string>,
    opts: { env?: string; message?: string; brokenAffected?: boolean } = {}
  ): 'skip' | 'build' {
    const repo = mkdtempSync(join(tmpdir(), 'ignore-build-'))
    try {
      const git = (...args: string[]) =>
        execFileSync('git', ['-c', 'user.email=t@t', '-c', 'user.name=t', ...args], { cwd: repo })
      git('init', '-q')
      for (const [path, body] of Object.entries(WORKSPACE)) {
        mkdirSync(dirname(join(repo, path)), { recursive: true })
        writeFileSync(join(repo, path), JSON.stringify(body))
      }
      mkdirSync(join(repo, 'scripts'), { recursive: true })
      copyFileSync(SCRIPT, join(repo, 'scripts/vercel-ignore-build.sh'))
      if (opts.brokenAffected) {
        writeFileSync(join(repo, 'scripts/affected-workspaces.mjs'), 'process.exit(3)\n')
      } else {
        copyFileSync(AFFECTED, join(repo, 'scripts/affected-workspaces.mjs'))
      }
      writeFileSync(join(repo, 'bun.lock'), 'v1')
      git('add', '-A')
      git('commit', '-q', '-m', 'seed')
      for (const [path, body] of Object.entries(files)) {
        mkdirSync(dirname(join(repo, path)), { recursive: true })
        writeFileSync(join(repo, path), body)
      }
      git('add', '-A')
      git('commit', '-q', '-m', opts.message ?? 'change')
      const run = spawnSync('bash', [join(repo, 'scripts/vercel-ignore-build.sh'), app], {
        cwd: join(repo, app === 'web' ? 'apps/web' : 'apps/ops'),
        env: {
          ...process.env,
          VERCEL_ENV: opts.env ?? 'production',
          VERCEL_GIT_COMMIT_MESSAGE: opts.message ?? 'change',
        },
      })
      if (run.status !== 0 && run.status !== 1) throw new Error(String(run.stderr))
      return run.status === 0 ? 'skip' : 'build'
    } finally {
      rmSync(repo, { recursive: true, force: true })
    }
  }

  const both = (files: Record<string, string>, opts = {}) => ({
    web: decide('web', files, opts),
    ops: decide('@indus/ops', files, opts),
  })

  describe('in production', () => {
    it('an apps/ops-only commit builds Ops, not the storefront', () => {
      expect(both({ 'apps/ops/src/x.ts': 'export {}' })).toEqual({ web: 'skip', ops: 'build' })
    })

    it('an ops-core commit builds Ops, not the storefront', () => {
      expect(both({ 'packages/ops-core/src/x.ts': 'export {}' })).toEqual({
        web: 'skip',
        ops: 'build',
      })
    })

    it('a domain commit builds the storefront, not Ops (Ops never depends on it)', () => {
      expect(both({ 'packages/domain/src/x.ts': 'export {}' })).toEqual({
        web: 'build',
        ops: 'skip',
      })
    })

    it('an apps/web-only commit builds the storefront, not Ops', () => {
      expect(both({ 'apps/web/src/x.ts': 'export {}' })).toEqual({ web: 'build', ops: 'skip' })
    })

    it('a documentation-only commit builds nothing', () => {
      expect(both({ 'docs/x.txt': 'x', 'README.md': 'x' })).toEqual({ web: 'skip', ops: 'skip' })
    })

    it('a CI-only commit builds nothing', () => {
      expect(both({ '.github/workflows/ci.yml': 'x', 'scripts/ci/test.sh': 'x' })).toEqual({
        web: 'skip',
        ops: 'skip',
      })
    })

    it('an ops-crosscheck-only commit builds nothing', () => {
      expect(both({ 'packages/ops-crosscheck/src/x.test.ts': 'x' })).toEqual({
        web: 'skip',
        ops: 'skip',
      })
    })

    it('an Ops-only dependency (manifest + lockfile) does not build the storefront', () => {
      expect(
        both({ 'apps/ops/package.json': JSON.stringify({ name: '@indus/ops' }), 'bun.lock': 'v2' })
      ).toEqual({ web: 'skip', ops: 'build' })
    })

    it('a lockfile-only commit builds both: the owner cannot be told', () => {
      expect(both({ 'bun.lock': 'v2' })).toEqual({ web: 'build', ops: 'build' })
    })

    it('a root manifest or shared config commit builds both', () => {
      expect(both({ 'tsconfig.base.json': '{}' })).toEqual({ web: 'build', ops: 'build' })
    })

    it('builds both when the affected script fails', () => {
      expect(both({ 'apps/ops/src/x.ts': 'export {}' }, { brokenAffected: true })).toEqual({
        web: 'build',
        ops: 'build',
      })
    })

    /**
     * Twelve payload-only PRs merged together on 2026-10-10 started twelve
     * concurrent production builds and exhausted the database pooler; the live
     * site served EMAXCONN 500s. The app never reads these files.
     */
    it('skips an already-applied import payload', () => {
      expect(
        decide('web', {
          'packages/db/data/catalogue-example/catalogue.json': '{}',
          'packages/db/data/catalogue-example/README.md': 'x',
        })
      ).toBe('skip')
    })
  })

  describe('previews', () => {
    it('build nothing without the [preview] marker', () => {
      expect(both({ 'apps/ops/src/x.ts': 'export {}' }, { env: 'preview' })).toEqual({
        web: 'skip',
        ops: 'skip',
      })
    })

    it('with [preview], build only the apps the commit affects', () => {
      expect(
        both({ 'apps/ops/src/x.ts': 'export {}' }, { env: 'preview', message: 'x [preview]' })
      ).toEqual({ web: 'skip', ops: 'build' })
    })
  })
})
