import 'server-only'
import { opsDb } from '@indus/ops-db'

/**
 * The enquiry Overview stub (S08-T06): the confirmed lines, read-only, and the thread the enquiry came from.
 * One read. S09-T03 replaces the page (board 05) and this loader.
 */
export interface OverviewLine {
  no: number
  description: string
  partNo: string | null
  qty: string
  uom: string
  confidence: 'sure' | 'likely' | 'unsure' | null
}

export interface EnquiryOverview {
  ref: string
  lines: OverviewLine[]
  questions: number
}

export async function getEnquiryOverview(ref: string): Promise<EnquiryOverview | null> {
  const e = await opsDb.enquiry.findUnique({
    where: { ref },
    select: {
      ref: true,
      lines: {
        orderBy: { no: 'asc' },
        select: {
          no: true,
          description: true,
          clientPartNo: true,
          qty: true,
          uom: true,
          extractionConfidence: true,
        },
      },
      _count: {
        select: { actions: { where: { actionKey: 'resolve_extracted_line', state: { in: ['proposed', 'later'] } } } },
      },
    },
  })
  if (!e) return null
  return {
    ref: e.ref,
    lines: e.lines.map((l) => ({
      no: l.no,
      description: l.description,
      partNo: l.clientPartNo,
      qty: l.qty.toString(),
      uom: l.uom,
      confidence: l.extractionConfidence,
    })),
    questions: e._count.actions,
  }
}
