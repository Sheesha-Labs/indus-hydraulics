// Root-level not-found — handles 404s that escape the [locale] segment.
// The [locale]/not-found.tsx is wrapped by [locale]/layout.tsx (which provides
// <html>/<body>); but a 404 outside any locale segment lands here, where the
// root layout is intentionally empty. We must therefore render our own
// <html>/<body> shell.
import Link from 'next/link'

export default function RootNotFound() {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          background: '#f5f3ee',
          color: '#111418',
        }}
      >
        <div style={{ textAlign: 'center', padding: '0 24px', maxWidth: 480 }}>
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: 80,
              color: '#d9d4c8',
              margin: 0,
              lineHeight: 1,
            }}
          >
            404
          </p>
          <h1 style={{ fontSize: 24, fontWeight: 600, marginTop: 24 }}>
            Page not found
          </h1>
          <p style={{ color: '#5b6068', fontSize: 14, marginTop: 8 }}>
            The page you&apos;re looking for doesn&apos;t exist or may have been
            moved.
          </p>
          <Link
            href="/en"
            style={{
              display: 'inline-block',
              marginTop: 24,
              fontFamily: 'monospace',
              fontSize: 12,
              color: 'oklch(0.62 0.16 45)',
              textDecoration: 'none',
            }}
          >
            ← Back to home
          </Link>
        </div>
      </body>
    </html>
  )
}
