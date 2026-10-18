import Link from 'next/link'

/**
 * Home / Blog / … for the blog's article and topic pages. Every crumb is at
 * least 32px tall. `current`, when given, is the page itself: plain text with
 * `aria-current="page"`, not a link back to where the reader already is.
 */
export default function BlogBreadcrumb({
  trail = [],
  current,
}: {
  trail?: Array<{ href: string; label: string }>
  current?: string
}) {
  const crumbs = [{ href: '/', label: 'Home' }, { href: '/blog', label: 'Blog' }, ...trail]
  return (
    <nav aria-label="Breadcrumb" className="pt-3 min-[761px]:pt-5">
      <ol className="m-0 flex list-none flex-wrap items-center gap-2 p-0 text-[12.5px] text-ih-muted min-[761px]:text-[13px]">
        {crumbs.map((crumb, i) => (
          <li key={crumb.href} className="flex items-center gap-2">
            {i > 0 && <Slash />}
            <Link href={crumb.href} className="inline-flex min-h-8 items-center hover:text-ih-accent">
              {crumb.label}
            </Link>
          </li>
        ))}
        {current && (
          <li className="flex items-center gap-2">
            <Slash />
            <span aria-current="page" className="inline-flex min-h-8 items-center text-ih-ink-2">
              {current}
            </span>
          </li>
        )}
      </ol>
    </nav>
  )
}

function Slash() {
  return (
    <span aria-hidden="true" className="text-ih-muted-2">
      /
    </span>
  )
}
