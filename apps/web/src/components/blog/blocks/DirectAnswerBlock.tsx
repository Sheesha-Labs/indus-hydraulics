import type { DirectAnswerBlock } from '@indus/domain'

/**
 * The "Quick answer" box: a question as a real heading, with the answer as the
 * very next element. The proximity is the point — an extractor looking for
 * "what answers this question" takes the first block after the heading, so the
 * label sits above the question and nothing goes between question and answer.
 */
export default function DirectAnswerBlockView({ block }: { block: DirectAnswerBlock }) {
  return (
    <aside
      aria-label="Quick answer"
      className="rounded-lg border border-ih-accent-line bg-ih-accent-soft p-5 min-[761px]:px-[26px] min-[761px]:py-6"
    >
      <p className="font-mono text-[10.5px] font-medium uppercase tracking-[0.13em] text-ih-accent">Quick answer</p>
      <h3 className="mt-2.5 text-[18px] font-semibold leading-[1.3] tracking-[-0.015em] text-ih-ink min-[761px]:text-[20px]">
        {block.question}
      </h3>
      <p className="mt-2 text-[15.5px] leading-[1.65] text-ih-ink min-[761px]:text-[16.5px]">{block.answer}</p>
    </aside>
  )
}
