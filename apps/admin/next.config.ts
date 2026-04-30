import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('../../packages/i18n/src/request.ts')

const nextConfig: NextConfig = {
  transpilePackages: ['@indus/ui', '@indus/domain', '@indus/i18n'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
    ],
  },
}

export default withNextIntl(nextConfig)
