import type { DirectAnswerBlock } from '@indus/domain'

/**
 * A question as a real heading, with the answer as the very next element.
 * The proximity is the point: an extractor looking for "what answers this
 * question" takes the first block after the heading, so nothing decorative
 * goes between them.
 */
export default function DirectAnswerBlockView({ block }: { block: DirectAnswerBlock }) {
  return (
    <div className="my-6">
      <h3 className="mb-2 text-[17px] font-semibold tracking-tight text-ih-ink">{block.question}</h3>
      <p className="border-l-2 border-ih-accent pl-4 text-[15px] leading-[1.6] text-ih-ink-2">
        {block.answer}
      </p>
    </div>
  )
}
