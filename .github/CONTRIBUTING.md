# Contributing

## CI gate

Every push to `main` and every pull request runs `.github/workflows/ci.yml`,
which executes:

1. `bun install --frozen-lockfile` (also generates the Prisma client)
2. `bun run db:generate` (only after a schema change)
3. `bun run typecheck`
4. `bun run lint`
5. `bun run test`

A red CI run blocks merge **only if branch protection is enabled** in
GitHub settings. To enable:

1. Repo → Settings → Branches → Branch protection rules → Add rule.
2. Branch name pattern: `main`.
3. Check **Require status checks to pass before merging**.
4. Pick `typecheck · lint · test` from the list (after the workflow has
   run at least once on a PR so GitHub knows the check exists).
5. (Recommended) Also check **Require pull request reviews before
   merging** and **Require branches to be up to date before merging**.
6. Save.

This is a one-time founder action — Claude Code cannot toggle branch
protection via the CLI.

## Local pre-flight

Git hooks run the checks for you. Install [hk](https://hk.jdx.dev) once, then in
each clone:

```bash
hk install
```

- **pre-commit** formats and lints the staged files and fixes what it can.
- **pre-push** runs what CI checks (`scripts/ci/local.sh`): typecheck, lint,
  format and every test, in under 9 seconds.

To run the same thing by hand:

```bash
scripts/ci/local.sh
```

If any of those fail, CI will fail too. The `chore/lint-and-test-baseline`
PR cleared the previous backlog of pre-existing breakages so CI starts
green.
