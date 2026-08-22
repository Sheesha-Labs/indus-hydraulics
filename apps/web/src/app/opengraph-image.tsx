import { ImageResponse } from 'next/og'

/**
 * Default Open Graph card for the storefront. Next.js auto-emits the
 * `<meta property="og:image">` and `<meta name="twitter:image">` tags
 * pointing at this file, and the rendered PNG becomes the share preview
 * when someone posts an indushydraulics.com link to LinkedIn, Twitter,
 * Slack, WhatsApp, etc.
 *
 * Per-route segments (e.g. /p/[slug], /c/[slug]) can override by emitting
 * their own openGraph.images via generateMetadata; this file is the
 * fallback for everything else.
 *
 * Kept JSX-free of any custom font fetch — Satori's bundled Noto Sans
 * renders consistently across regions without a network dependency.
 *
 * Deliberately NOT `export const runtime = 'edge'`. Edge runtime on a route
 * opts it out of static generation, so the card was re-rendered per request
 * and every build logged "Using edge runtime on a page currently disables
 * static generation for that page". On the Node runtime Next renders the PNG
 * once at build time and serves it as a static asset — faster for the
 * scrapers that fetch it, and one less warning forever.
 */

export const alt =
  'Indus Hydraulics — Industrial hydraulic distributor in Dubai, UAE'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background: 'linear-gradient(135deg, #0A0A0A 0%, #1A1A1A 100%)',
          color: '#FFFFFF',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 18,
            letterSpacing: 4,
            color: '#888888',
            textTransform: 'uppercase',
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#E85A0C',
              color: '#FFFFFF',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: 0,
            }}
          >
            IH
          </div>
          <span>Indus Hydraulics</span>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
          }}
        >
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: -1.5,
              color: '#FFFFFF',
            }}
          >
            Industrial hydraulic distribution.
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.35,
              color: '#BBBBBB',
              maxWidth: 920,
            }}
          >
            Pumps, valves, cylinders, and hose assemblies for engineers who
            can&apos;t afford downtime.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: 18,
            color: '#888888',
            borderTop: '1px solid #2A2A2A',
            paddingTop: 28,
          }}
        >
          <span>
            Authorized distributor · Parker · Bosch Rexroth · Yuken · HYDAC
          </span>
          <span style={{ letterSpacing: 2 }}>DUBAI · UAE</span>
        </div>
      </div>
    ),
    { ...size },
  )
}
