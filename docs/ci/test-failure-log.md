# Test failure log

Two weeks of evidence, 2026-11-21 to 2026-12-05, for deciding which tests earn
their keep (see `AGENTS.md`, "Fewer tests, on evidence"). One row per test failure
fixed, newest last.

| Date | Test file | Kind | What failed and what the fix was | PR |
|---|---|---|---|---|
| 2026-11-21 | `apps/web/src/lib/enquiry-admin-conventions.test.ts` | change detector | Failed when the suite ran from the repo root: it resolved the screens to scan from `process.cwd()`. Fixed the test to resolve from its own file. | #658 |
| 2026-11-21 | `apps/web/src/lib/market-map-assets.test.ts` | change detector | Same cause as above (`process.cwd()` + `src/app/globals.css`). Fixed the test. | #658 |
| 2026-11-21 | `apps/web/src/lib/diagram-roundtrip.test.ts` | change detector | Failed after `bun fmt` rewrote the generated import scripts' SVG strings from double to single quotes, which its regex expects. Fixed by keeping generated import scripts out of formatting; the test is unchanged. | #659 |
| 2026-11-21 | `apps/web/tests/e2e/category-caching.spec.ts` (page 2) | change detector | Expected deep pages to be noindex; they are indexable with a self-canonical since the 2026-09-26 indexability audit. Test updated to the policy. | #670 |
| 2026-11-21 | `apps/web/tests/e2e/hero-geo.spec.ts` (rotating term links) | change detector | Looked for the static hero pill row removed on 2026-11-19 (#625, owner call), and matched hidden megamenu links first. Test now asserts the links are in the served HTML. | #670 |
| 2026-11-21 | `apps/web/tests/e2e/translucent-header.spec.ts` (open menu) | change detector | The crawlable megamenu renders one `role="menu"` panel per item; the test assumed one. Now selects the shown panel. | #670 |
| 2026-11-21 | `apps/web/tests/e2e/translucent-header.spec.ts` (AA contrast) | change detector | Failed only on CI's Linux headless shell, which does not paint `backdrop-filter`, so the bar read as transparent (1.21:1). Real browsers and macOS pass. Smoke now runs full Chromium (`channel: 'chromium'`). | #670 |
