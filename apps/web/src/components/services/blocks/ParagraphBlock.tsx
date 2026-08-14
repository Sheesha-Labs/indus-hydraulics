import type { ParagraphBlock } from '@indus/domain'

export default function ParagraphBlockView({ block }: { block: ParagraphBlock }) {
  return <p dangerouslySetInnerHTML={{ __html: block.html }} />
}
