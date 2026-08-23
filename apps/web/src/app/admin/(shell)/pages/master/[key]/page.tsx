import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { db } from '@indus/db'
import { getMasterPage } from '@indus/domain'
import AdminPageShell from '../../../../../../components/admin/AdminPageShell'
import type { Seeds } from '../../../../../../components/admin/pages/section-fields'
import { getMasterPageContentFresh } from '../../../../../../lib/page-content'
import { requireStaffRole } from '../../../../../../lib/staff-session'
import { ROLES } from '../../../../../../lib/rbac'
import MasterPageEditorClient from './MasterPageEditorClient'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ key: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { key } = await params
  const def = getMasterPage(key)
  return { title: def ? `${def.label} — Pages & Blocks` : 'Pages & Blocks' }
}

/**
 * The editor for one master page.
 *
 * The whole form is generated from the registry — labels, help, limits, list
 * caps. Nothing about the Home page or the About page is written here, which
 * is what keeps twelve editors from drifting into twelve slightly different
 * forms.
 */
export default async function MasterPageEditorRoute({ params }: Props) {
  await requireStaffRole(ROLES.CMS_WRITE)

  const { key } = await params
  const def = getMasterPage(key)
  if (!def) notFound()

  const [content, brands, industries, categories] = await Promise.all([
    getMasterPageContentFresh(key),
    db.brand.findMany({
      where: { isPublished: true },
      orderBy: { name: 'asc' },
      select: { slug: true, name: true },
    }),
    db.industry.findMany({
      where: { isPublished: true },
      orderBy: { position: 'asc' },
      select: { slug: true, name: true },
    }),
    db.category.findMany({
      where: { isPublished: true, parentId: null },
      orderBy: { position: 'asc' },
      select: { slug: true, name: true },
    }),
  ])

  // Everything a `select` field can offer. Cheap enough to fetch for every
  // page: three indexed reads against small tables, and it means adding a
  // picker to a section is a registry edit rather than a route edit.
  const seeds: Seeds = {
    brands: brands.map((b) => ({ slug: b.slug, name: b.name })),
    industries: industries.map((i) => ({ slug: i.slug, name: i.name })),
    categories: categories.map((c) => ({ slug: c.slug, name: c.name })),
  }

  const storefront = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com').replace(
    /\/$/,
    '',
  )

  return (
    <AdminPageShell
      title={def.label}
      breadcrumbs={
        <Link
          href="/admin/pages"
          className="inline-flex items-center gap-1 text-ih-muted transition-colors hover:text-ih-ink"
        >
          <ChevronLeft size={12} strokeWidth={1.8} aria-hidden="true" />
          Pages &amp; Blocks
        </Link>
      }
      actions={
        <a
          href={`${storefront}${def.path}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-9 items-center gap-1.5 rounded-md border border-ih-border px-3 font-mono text-[12px] text-ih-ink-2 transition-colors hover:border-ih-accent hover:text-ih-accent"
        >
          View page <ExternalLink size={12} aria-hidden="true" />
        </a>
      }
      bodyClassName="max-w-[900px]"
    >
      <p className="mb-5 text-[13px] leading-[1.6] text-ih-ink-2">
        {def.description} Drag a section to move it, use the eye to hide one, and open it to edit
        its wording, links and images. Anything you leave alone renders exactly as it does today.
      </p>
      <MasterPageEditorClient
        pageKey={def.key}
        pageLabel={def.label}
        path={def.path}
        usingDefaults={content.usingDefaults}
        seeds={seeds}
        initial={content.sections.map((s) => ({
          key: s.key,
          def: s.def,
          enabled: s.enabled,
          values: s.values,
        }))}
      />
    </AdminPageShell>
  )
}
