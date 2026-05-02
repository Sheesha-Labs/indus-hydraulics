import { redirect } from 'next/navigation'

/**
 * `/seo` is a layout shell — the actual landing page is the Inspector.
 * Anyone hitting `/seo` directly gets pushed to the central grid.
 */
export default function SeoIndexPage() {
  redirect('/seo/inspector')
}
