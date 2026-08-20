import path from 'path'
import type { NextConfig } from 'next'
import { withSentryConfig } from '@sentry/nextjs'

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'),
  serverExternalPackages: ['@prisma/client', '.prisma/client'],
  transpilePackages: ['@indus/ui', '@indus/domain'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.r2.cloudflarestorage.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async redirects() {
    return [
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
      // NOTE: matching rows also exist in the `redirects` table, but nothing
      // serves that table at runtime — only this array is honoured. See the
      // admin SEO redirects section, whose entries are currently inert.
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

// Sentry build-time wrapper. Source-map upload only runs when SENTRY_AUTH_TOKEN
// is set (in CI / Vercel); locally the build still succeeds without it.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Quiet build output unless we're in CI where logs are useful.
  silent: !process.env.CI,
  // Upload all client bundles' source maps for cleaner stack traces.
  widenClientFileUpload: true,
  // Source maps are generated for upload to Sentry, then removed from the
  // build output so they aren't shipped to the browser.
  sourcemaps: { deleteSourcemapsAfterUpload: true },
  // Strip Sentry's own logger from the prod bundle.
  disableLogger: true,
})
