# Contributing

## CI gate

Every push to `main` and every pull request runs `.github/workflows/ci.yml`,
which executes:

1. `pnpm install --frozen-lockfile`
2. `pnpm db:generate` (Prisma client)
3. `pnpm typecheck`
4. `pnpm lint`
5. `pnpm test`

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

Before opening a PR, run the same commands locally:

```bash
pnpm typecheck && pnpm lint && pnpm test
```

If any of those fail, CI will fail too. The `chore/lint-and-test-baseline`
PR cleared the previous backlog of pre-existing breakages so CI starts
green.
