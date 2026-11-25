import { Chip } from '@indus/ops-ui/status'
import type { Route } from 'next'
import Link from 'next/link'
import Arrives from '../../../../components/skeleton/Arrives'
import { getEnquiryOverview } from '../../../../data/enquiry-overview'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { enquiryRef, routeParam } from '../../../../lib/route-params'

const CONF = {
  sure: ['ok', 'High'],
  likely: ['warn', 'Check'],
  unsure: ['bad', 'Answered'],
} as const

/**
 * Board 05 · Enquiry overview (T2, Overview tab). S08-T06 stub for an enquiry created in Ops: its lines read-only
 * (the header carries "Open thread in Mail"); questions left from Unsure lines wait in Review. S09-T03 builds
 * the board.
 */
export default async function EnquiriesRefPage({ params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params
  await requireOpsUser().catch(signInFor(`/enquiries/${ref}`))
  routeParam(enquiryRef, ref)
  const o = await getEnquiryOverview(ref)
  if (!o)
    return (
      <Arrives
        sprint="S09"
        what="Board 05: the enquiry’s lines, client, deadline and what happens next."
      />
    )
  return (
    <div data-built="enquiry-overview-stub" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="m-0 text-[15px] font-medium">
          {o.lines.length} line{o.lines.length === 1 ? '' : 's'}
          {o.questions ? (
            <span className="text-io-ink-2 font-normal">
              {' '}
              · {o.questions} question{o.questions === 1 ? '' : 's'} in{' '}
              <Link
                href={'/review' as Route}
                className="text-io-accent io-focus rounded-io-tag underline underline-offset-2"
              >
                Review
              </Link>
            </span>
          ) : null}
        </h2>
      </div>
      <table className="rounded-io-card border-io-line bg-io-card w-full border-separate border-spacing-0 overflow-hidden border text-[13px]">
        <thead>
          <tr className="text-io-ink-3 text-left text-[10.5px] tracking-[0.12em] uppercase">
            <th scope="col" className="border-io-line w-[48px] border-b py-3 pl-5 font-medium">
              #
            </th>
            <th scope="col" className="border-io-line border-b py-3 font-medium">
              Description
            </th>
            <th scope="col" className="border-io-line w-[180px] border-b py-3 font-medium">
              Part no.
            </th>
            <th
              scope="col"
              className="border-io-line w-[80px] border-b py-3 pr-3 text-right font-medium"
            >
              Qty
            </th>
            <th scope="col" className="border-io-line w-[60px] border-b py-3 font-medium">
              UoM
            </th>
            <th scope="col" className="border-io-line w-[110px] border-b py-3 pr-5 font-medium">
              Read as
            </th>
          </tr>
        </thead>
        <tbody>
          {o.lines.map((l) => (
            <tr key={l.no}>
              <td className="border-io-line text-io-ink-3 border-b py-3 pl-5">{l.no}</td>
              <td className="border-io-line border-b py-3 pr-3">{l.description}</td>
              <td className="border-io-line border-b py-3">{l.partNo ?? '—'}</td>
              <td className="border-io-line border-b py-3 pr-3 text-right">{l.qty}</td>
              <td className="border-io-line text-io-ink-3 border-b py-3">{l.uom}</td>
              <td className="border-io-line border-b py-2.5 pr-5">
                {l.confidence ? (
                  <Chip tone={CONF[l.confidence][0]} label={CONF[l.confidence][1]} />
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
