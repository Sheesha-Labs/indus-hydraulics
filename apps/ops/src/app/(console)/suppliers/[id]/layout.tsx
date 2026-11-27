import { Button, ButtonLink } from '@indus/ops-ui/controls'
import { Chip } from '@indus/ops-ui/status'
import type { Route } from 'next'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'
import ProfileHeader from '../../../../components/directory/ProfileHeader'
import SupplierTabs from '../../../../components/directory/SupplierTabs'
import { supplierProfileOnce, TIER_TONE, TIER_WORD } from '../../../../data/suppliers'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { recordId, routeParam } from '../../../../lib/route-params'

/**
 * Board 129 · the supplier profile frame (S10-T03): header (name, type tag, tier chip, place, website, "Quotes in",
 * "Usually <incoterm> <place>"), Block (secondary) and Send RFQ (the one primary; disabled until supplier RFQs land
 * in S12), and the section tabs. The bank-change banner (board 132) sits above it. Pages under it call
 * requireOpsUser() themselves; this read is the same one the page uses (React cache).
 */
export default async function SupplierLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ id: string }>
}) {
  const id = routeParam(recordId, (await params).id)
  const user = await requireOpsUser().catch(signInFor(`/suppliers/${id}`))
  const page = await supplierProfileOnce(id, user)
  if (!page) notFound()
  const h = page.header
  return (
    <div data-built="supplier-profile">
      {h.bankChangeAccountId ? (
        <div
          role="alert"
          className="bg-io-bad-tint text-io-banner-bad-ink border-io-line border-b px-7 py-2.5 text-[12.5px]"
        >
          Bank change requested · payments to {h.name} blocked. Shown on the supplier, on its POs
          and on every payment to them.{' '}
          <a
            href={`/suppliers/${h.id}/bank-change/${h.bankChangeAccountId}`}
            className="io-focus rounded-io-tag font-medium underline"
          >
            Review
          </a>
        </div>
      ) : null}
      <ProfileHeader
        crumb={{ label: 'Suppliers', href: '/suppliers' }}
        title={h.name}
        meta={
          <span className="flex flex-wrap items-center gap-x-5 gap-y-1">
            <Chip tone="n" label={h.type} />
            <Chip tone={TIER_TONE[h.tier]} label={TIER_WORD[h.tier]} />
            {h.onboarding && h.onboarding !== 'approved' && h.onboarding !== 'approved_trial' ? (
              <Chip tone="warn" label="Proposed · not selectable" />
            ) : null}
            {h.place ? <span>{h.place}</span> : null}
            {h.website || h.domain ? (
              <a
                href={h.website ?? `https://${h.domain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="io-focus rounded-io-tag"
              >
                {h.domain ?? h.website} ↗
              </a>
            ) : null}
            {h.quotesIn ? <span className="text-io-ink-3">Quotes in {h.quotesIn}</span> : null}
            {h.usually ? (
              <span className="text-io-ink-3">
                Usually <b className="text-io-ink font-medium">{h.usually}</b>
              </span>
            ) : null}
          </span>
        }
        actions={
          <>
            {h.tier !== 'blocked' ? (
              <ButtonLink href={`/suppliers/${h.id}/block` as Route}>Block</ButtonLink>
            ) : null}
            <Button variant="primary" disabled aria-describedby="send-rfq-later">
              Send RFQ
            </Button>
            <span id="send-rfq-later" className="sr-only">
              Supplier RFQs arrive with S12
            </span>
          </>
        }
        below={
          <div className="mt-4 -mb-5">
            <SupplierTabs id={h.id} />
          </div>
        }
      />
      {children}
    </div>
  )
}
