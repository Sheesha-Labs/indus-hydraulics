import type { DirectAnswerBlock } from '@indus/domain'

/**
 * The "Quick answer" box: a question as a real heading, with the answer as the
 * very next element. The proximity is the point — an extractor looking for
 * "what answers this question" takes the first block after the heading, so the
 * label sits above the question and nothing goes between question and answer.
 */
export default function DirectAnswerBlockView({
  block,
  headingLevel = 'h3',
}: {
  block: DirectAnswerBlock
  /** `h2` when it sits in a page header (the topic hub) rather than under a section head. */
  headingLevel?: 'h2' | 'h3'
}) {
  const Heading = headingLevel
  return (
    <aside
      aria-label="Quick answer"
      className="border-ih-accent-line bg-ih-accent-soft rounded-lg border p-5 min-[761px]:px-[26px] min-[761px]:py-6"
    >
      <p className="text-ih-accent font-mono text-[10.5px] font-medium tracking-[0.13em] uppercase">
        Quick answer
      </p>
      <Heading className="text-ih-ink mt-2.5 text-[18px] leading-[1.3] font-semibold tracking-[-0.015em] min-[761px]:text-[20px]">
        {block.question}
      </Heading>
      <p className="text-ih-ink mt-2 text-[15.5px] leading-[1.65] min-[761px]:text-[16.5px]">
        {block.answer}
      </p>
    </aside>
  )
}
