import { redirect } from 'next/navigation'

/**
 * `/seo/search` is a sub-shell — actual content lives under each tab.
 */
export default function SearchIndexPage() {
  redirect('/admin/seo/search/synonyms')
}
