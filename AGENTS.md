# AGENTS.md

`CLAUDE.md` is the full engineering guide for this repository and applies to every
agent. This file holds the rules about tests that agents most often get wrong.

## Checks run as hooks

Install the git hooks once per clone with `hk install` (see `hk.pkl`). pre-commit
formats and lints staged files; pre-push runs what CI runs (`scripts/ci/local.sh`).
Do not skip them with `--no-verify`.

## Fewer tests, on evidence

From 2026-11-21 to 2026-12-05, every test failure you fix gets one row in
[`docs/ci/test-failure-log.md`](docs/ci/test-failure-log.md), classified as:

- **caught regression**: the test failed because the code was wrong, and the fix
  was to the code; or
- **change detector**: the test failed because the code changed on purpose, and the
  fix was to the test (an updated snapshot, string, count or call order).

After 2026-12-05, delete the test files that only ever logged change detectors, and
list the pattern each one used under "Banned test patterns" below so it is not
written again.

**Never delete tests for authorization, privacy, migrations or concurrency**,
whatever the log says. They guard failures that are rare, silent and expensive.

## Banned test patterns

None yet. Filled in from the log after 2026-12-05.

## Never hide a failure

No retries, wider timeouts or skipped tests to make CI green. A test that needs a
retry has a bug: find it. CI runs tests in random order with each file's modules
loaded fresh; a test that passes alone and fails in the suite is leaking state.
