import path from 'path'
import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'),
  /*
   * Type checking is CI's job, not the deploy's.
   *
   * `next build` re-ran tsc over the whole app on every deployment — about 13
   * seconds of a build that happens hundreds of times a month, repeating work
   * GitHub Actions had already done on the same commit.
   *
   * There is no `eslint` counterpart here: Next 16 dropped that config key, and
   * `next build` no longer lints. `pnpm lint` in CI is the only linter.
   *
   * The gate moves rather than disappears, and it is worth naming exactly where
   * it now lives: `typecheck · lint · test` is a REQUIRED status check on the
   * `main` ruleset, with `strict_required_status_checks_policy` on — so the
   * branch must be up to date with main when it passes — and the `pull_request`
   * rule blocks direct pushes. Nothing reaches main without tsc and eslint
   * passing on exactly the state that gets merged.
   *
   * What would have to break for a type error to ship: someone removes that
   * required check, or disables the ruleset. If either happens, put this flag
   * back.
   */
  typescript: { ignoreBuildErrors: true },
  serverExternalPackages: ['@prisma/client', '.prisma/client'],
  transpilePackages: ['@indus/ui', '@indus/domain'],
  images: {
    /*
     * The srcset ladder, deliberately narrowed.
     *
     * Next's defaults are deviceSizes [640…3840] and imageSizes [16…384] — 15
     * widths per image. Measured on a single category shelf: 17 source images
     * produced 180 distinct `/_next/image` URLs, including a brand logo
     * offered at 3840px. Every unique (source, width, quality) a browser
     * actually asks for is a billed image transformation, and there are 856
     * distinct product images in the catalogue.
     *
     * These lists are matched to what the components ask for. The layout caps
     * at `--spacing-max-w: 1440px`, so 2048 covers a full-bleed image on a 2x
     * display and 3840 was never reachable. `imageSizes` covers the fixed
     * small sizes in use — 44, 60, 64, 80, 88, 120, 320px — at 2x.
     */
    deviceSizes: [640, 828, 1080, 1920, 2048],
    imageSizes: [64, 96, 128, 256, 384],
    /*
     * One quality, so a stray `quality={90}` cannot silently double the
     * transformation count. 75 is Next's default and what every call site uses.
     */
    qualities: [75],
    /*
     * 30 days, against a default of 4 hours.
     *
     * Safe because these URLs are immutable in practice: uploads are keyed by
     * `randomUUID()` (admin/media/actions.ts), so replacing an image produces a
     * new storage path and therefore a new URL rather than new bytes behind an
     * old one. The short default meant re-transforming the same image six times
     * a day for no benefit.
     */
    minimumCacheTTL: 2_592_000,
    remotePatterns: [
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      /*
       * This project's storage bucket only — not `*.supabase.co`.
       *
       * A wildcard here makes `/_next/image` an open image proxy: anyone can
       * pass any Supabase URL and have it fetched and re-encoded. Vercel's
       * fleet absorbed that; a single VPS is the one paying the CPU.
       */
      { protocol: 'https', hostname: 'hesezbozronntejnsopr.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async redirects() {
    return [
      // The company page moved from /about to a URL that describes what the
      // company sells. Kept here rather than in the `redirects` table because
      // this move is coupled to the route folder: config redirects ship in the
      // same deploy as the new route, so there is no window where /about is
      // dead or the redirect points at a 404. Table rows are the right home
      // for moves decided after a deploy — see lib/slug-redirect.ts.
      {
        source: '/about',
        destination: '/hydraulic-components-supplier-uae',
        permanent: true,
      },
      // India and China shipped with the /markets expansion and were withdrawn
      // the same day — not markets we serve. They were publicly reachable in
      // between, and the sitemap listed them, so they redirect rather than
      // 404. Config redirects rather than table rows because these are coupled
      // to the route existing at all.
      {
        source: '/markets/india',
        destination: '/markets',
        permanent: true,
      },
      {
        source: '/markets/china',
        destination: '/markets',
        permanent: true,
      },
      // The blog moved out of the CMS tab strip into its own admin section
      // (Blog Editor). These keep bookmarks and the deep links that shipped in
      // the SEO inspector working rather than 404ing on a route that no
      // longer exists.
      {
        source: '/admin/cms/blog/:id',
        destination: '/admin/blog/:id',
        permanent: false,
      },
      {
        source: '/admin/cms',
        has: [{ type: 'query', key: 'tab', value: 'blog' }],
        destination: '/admin/blog',
        permanent: false,
      },
      // "Pages & Hero" became "Pages & Blocks" at /admin/pages. The old
      // section is gone entirely, so these are the only thing standing between
      // a bookmarked editor link and a 404. Ordered before the bare /admin/cms
      // rule, which would otherwise swallow the editor path.
      {
        source: '/admin/cms/pages/:id',
        destination: '/admin/pages/static/:id',
        permanent: false,
      },
      {
        source: '/admin/cms',
        has: [{ type: 'query', key: 'tab', value: 'hero' }],
        destination: '/admin/pages/hero',
        permanent: false,
      },
      {
        source: '/admin/cms',
        destination: '/admin/pages',
        permanent: false,
      },

      // Legacy metallic-ptfe-hoses category was split into the new
      // metallic-hoses parent + 7 sub-categories during the Metallic
      // Hoses initiative (Batch 0, PR #93). The old slug remains in DB
      // (now empty) so direct links don't 404, but inbound traffic /
      // SEO is best served by 301-ing to the new parent landing page.
      {
        source: '/c/metallic-ptfe-hoses',
        destination: '/c/metallic-hoses',
        permanent: true,
      },

      // Molykote Specialty Lubricants was folded into Molykote Greases. Three
      // of its four products were deleted as unsourced placeholder listings
      // (PR #247) and the fourth, Long Term 2 Plus, is a bearing grease. The
      // category row stays (now unpublished, so the page 404s) and inbound
      // links are best served by the Greases landing page.
      {
        source: '/c/molykote-specialty-lubricants',
        destination: '/c/molykote-greases',
        permanent: true,
      },

      // BOP services migration (PR #131). The 13 IH-BOP-SVC-* products were
      // decommissioned and re-modelled as ServiceCase rows under /services.
      // 3 of them have direct case-study analogs (cases 03, 04, 06 in the
      // launch wave); the other 10 became their own service-offering pages
      // (cases 11-20). Old product URLs 301 here so any inbound links / SEO
      // keep flowing.
      {
        source: '/p/bop-api-16a-5-year-major-inspection-recertification',
        destination: '/services/bop-13-58-10k-cameron-u-5-year-recertification',
        permanent: true,
      },
      {
        source: '/p/accumulator-koomey-service-api-16d-5-year-recertification',
        destination: '/services/koomey-accumulator-rebladder-api-16d-recert',
        permanent: true,
      },
      {
        source: '/p/choke-kill-manifold-testing-5-year-recertification-api-16c',
        destination: '/services/choke-kill-manifold-3116-10k-api-16c-recert',
        permanent: true,
      },
      {
        source: '/p/bop-pressure-testing-service-per-api-std-53-5k-10k-15k-stacks',
        destination: '/services/bop-pressure-testing-service-api-std-53',
        permanent: true,
      },
      {
        source: '/p/annual-bop-redress-12-month-elastomer-service-per-aramco-specification',
        destination: '/services/annual-bop-redress-12-month-elastomer-service',
        permanent: true,
      },
      {
        source: '/p/bop-stack-rental-11-10k-workover-stack-sour-service-nace-mr0175',
        destination: '/services/bop-stack-rental-11-10k-workover-sour-service',
        permanent: true,
      },
      {
        source: '/p/bop-field-service-crew-nipple-up-function-test-troubleshooting-h-s-trained',
        destination: '/services/bop-field-service-crew-h2s-trained-day-rate',
        permanent: true,
      },
      {
        source: '/p/coiled-tubing-snubbing-wireline-bop-testing-recertification',
        destination: '/services/ct-snubbing-wireline-bop-testing-recertification',
        permanent: true,
      },
      {
        source: '/p/subsea-bop-stack-fat-sit-witness-engineering-support',
        destination: '/services/subsea-bop-stack-fat-sit-witness-engineering-support',
        permanent: true,
      },
      {
        source: '/p/15k-hpht-bop-service-hail-ghasha-jafurah-sour-gas',
        destination: '/services/15k-hpht-bop-service-hail-ghasha-jafurah-sour-gas',
        permanent: true,
      },
      {
        source: '/p/diverter-system-testing-recertification-21-1-4-2k-class',
        destination: '/services/diverter-system-recertification-21-1-4-2k-offshore',
        permanent: true,
      },
      {
        source: '/p/rotating-control-device-rcd-service-mpd-equipment-support',
        destination: '/services/rotating-control-device-rcd-service-mpd-equipment-support',
        permanent: true,
      },
      {
        source: '/p/iwcf-iadc-wellsharp-well-control-training-levels-2-4-supervisor',
        destination: '/services/iwcf-iadc-wellsharp-well-control-training-levels-2-4',
        permanent: true,
      },

      // Molykote cleanup (2026-08-17). "Molykote 7439" was really CU-7439 Plus
      // Paste — a copper paste filed under anti-friction coatings — so it was
      // retitled, recategorised and moved to a matching slug. "Molykote CU 7435
      // Plus" was not a real product at all (DuPont publishes no 7435); it
      // duplicated CU-7439 and was deleted.
      //
      // `permanent: true` emits a 308, not a 301 — Next uses 307/308 so the
      // request method survives the redirect.
      //
      // NOTE: matching rows also exist in the `redirects` table, which IS
      // served at runtime (src/lib/redirects.ts, called from proxy.ts). This
      // array wins because Next applies config redirects before the proxy
      // runs; the duplicate rows are harmless but redundant.
      {
        source: '/p/molykote-7439',
        destination: '/p/molykote-cu-7439-plus-paste',
        permanent: true,
      },
      {
        source: '/p/molykote-cu-7435-plus',
        destination: '/p/molykote-cu-7439-plus-paste',
        permanent: true,
      },

      // "Molykote EP" and "Molykote EP Grease" were not real products either —
      // DuPont publishes nothing called EP. Both were deleted and replaced by
      // G-1074 Grease, the one DuPont extreme-pressure grease the catalogue
      // did not already carry.
      {
        source: '/p/molykote-ep',
        destination: '/p/molykote-g-1074-grease',
        permanent: true,
      },
      {
        source: '/p/molykote-ep-grease',
        destination: '/p/molykote-g-1074-grease',
        permanent: true,
      },
    ]
  },
}

// Sentry build-time wrapper.
//
// Everything the bundler plugin does at build time — creating a release,
// uploading source maps — needs an auth token, which only exists on Vercel
// (SENTRY_AUTH_TOKEN). Without one it used to print two warnings on every
// single build. Rather than let that noise become permanent, the whole
// upload/release half is gated on the token: no token, nothing to warn about;
// token present, full behaviour with zero config changes. Runtime error
// reporting is unaffected either way — that comes from the sentry.*.config.ts
// files and only needs the DSN.
const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: sentryAuthToken,
  // Quiet build output unless we're in CI where logs are useful.
  silent: !process.env.CI,
  // Upload all client bundles' source maps for cleaner stack traces.
  widenClientFileUpload: true,
  // Source maps are generated for upload to Sentry, then removed from the
  // build output so they aren't shipped to the browser.
  sourcemaps: sentryAuthToken
    ? { deleteSourcemapsAfterUpload: true }
    : { disable: true },
  // Tokenless builds must not even look like they want a release, or the
  // bundler plugin warns once per build. `create: false` stops the Next SDK
  // resolving a release name, and the empty `name` stops the bundler plugin
  // filling one back in from the git SHA — both are needed, the first alone
  // is not enough.
  release: sentryAuthToken ? { create: true } : { create: false, name: '' },
  // Strip Sentry's own logger from the prod bundle. This is the replacement
  // for the deprecated top-level `disableLogger`; the SDK maps one to the
  // other internally, so behaviour is identical.
  webpack: { treeshake: { removeDebugLogging: true } },
})
