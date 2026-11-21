import type { MetadataRoute } from 'next'

// The console is private: nothing on this host is for search engines.
export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: '*', disallow: '/' }] }
}
