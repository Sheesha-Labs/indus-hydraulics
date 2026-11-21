# Test failure log

Two weeks of evidence, 2026-11-21 to 2026-12-05, for deciding which tests earn
their keep (see `AGENTS.md`, "Fewer tests, on evidence"). One row per test failure
fixed, newest last.

| Date | Test file | Kind | What failed and what the fix was | PR |
|---|---|---|---|---|
| 2026-11-21 | `apps/web/src/lib/enquiry-admin-conventions.test.ts` | change detector | Failed when the suite ran from the repo root: it resolved the screens to scan from `process.cwd()`. Fixed the test to resolve from its own file. | #658 |
| 2026-11-21 | `apps/web/src/lib/market-map-assets.test.ts` | change detector | Same cause as above (`process.cwd()` + `src/app/globals.css`). Fixed the test. | #658 |
| 2026-11-21 | `apps/web/src/lib/diagram-roundtrip.test.ts` | change detector | Failed after `bun fmt` rewrote the generated import scripts' SVG strings from double to single quotes, which its regex expects. Fixed by keeping generated import scripts out of formatting; the test is unchanged. | #659 |
