import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft, ExternalLink } from 'lucide-react'
import { getSubPageKind, isSubPageKind } from '@indus/domain'
import AdminPageShell from '../../../../../../../components/admin/AdminPageShell'
import { getSubPageContentFresh } from '../../../../../../../lib/page-content'
import { findSubPageRecord } from '../../../../../../../lib/sub-page-records'
import { requireStaffRole } from '../../../../../../../lib/staff-session'
import { ROLES } from '../../../../../../../lib/rbac'
import SubPageEditorClient from './SubPageEditorClient'

export const dynamic = 'force-dynamic'

type Props = { params: Promise<{ kind: string; slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kind, slug } = await params
  if (!isSubPageKind(kind)) return { title: 'Pages & Blocks' }
  const record = await findSubPageRecord(kind, slug)
  return { title: record ? `${record.name} — Pages & Blocks` : 'Pages & Blocks' }
}

/**
 * The editor for one sub-page.
 *
 * Every copy field here is an OVERRIDE. Left blank the band renders what the
 * template builds from the record, which is why a market nobody has edited
 * looks exactly like one that did not exist before this editor.
 */
export default async function SubPageEditorRoute({ params }: Props) {
  await requireStaffRole(ROLES.CMS_WRITE)

  const { kind, slug } = await params
  if (!isSubPageKind(kind)) notFound()
  const kindDef = getSubPageKind(kind)
  if (!kindDef) notFound()

  const record = await findSubPageRecord(kind, slug)
  if (!record) notFound()

  const content = await getSubPageContentFresh(kind, { name: record.name, slug: record.slug })

  const storefront = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://indushydraulics.com').replace(
    /\/$/,
    '',
  )
  const path = `${kindDef.publicPath}/${slug}`

  return (
    <AdminPageShell
      title={record.name}
      breadcrumbs={
        <Link
          href={kindDef.adminPath}
          className="inline-flex items-center gap-1 text-ih-muted transition-colors hover:text-ih-ink"
        >
          <ChevronLeft size={12} strokeWidth={1.8} aria-hidden="true" />
          {kindDef.label}
        </Link>
      }
      actions={
        <a
          href={`${storefront}${path}`}
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
        Drag a band to move it, use the eye to hide one, and open it to override a heading. Every
        field here is an override — leave it blank and the band keeps the wording the template
        builds from the {kind === 'market' ? 'market' : 'brand'} record.
      </p>

      {record.live ? null : (
        <div className="mb-5 rounded-lg border border-ih-warning bg-ih-warning-soft px-4 py-3">
          <p className="text-[13px] leading-[1.55] text-ih-warning-ink">
            {kind === 'market' ? (
              <>
                This market renders the plain layout, not the designed template — its regulatory
                copy has not been signed off by a forwarder yet, so the bands below are not live.
                Edits save and apply the moment it is released. See{' '}
                <Link href="/admin/markets" className="underline">
                  Export markets
                </Link>{' '}
                for the review queue.
              </>
            ) : (
              <>
                This brand is unpublished, so its page is not reachable. Edits save and apply the
                moment it is published under{' '}
                <Link href="/admin/brands" className="underline">
                  Catalogue · Brands
                </Link>
                .
              </>
            )}
          </p>
        </div>
      )}

      <SubPageEditorClient
        pageId={`${kind}:${slug}`}
        pageLabel={record.name}
        path={path}
        usingDefaults={content.usingDefaults}
        seeds={{}}
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
