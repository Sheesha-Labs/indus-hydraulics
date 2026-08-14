import type { LeadBlock } from '@indus/domain'

export default function LeadBlockView({ block }: { block: LeadBlock }) {
  // The .sc-lead utility (in globals.css) gives the orange accent drop-cap.
  return <p className="sc-lead" dangerouslySetInnerHTML={{ __html: block.html }} />
}
