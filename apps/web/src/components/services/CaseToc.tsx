import { BodyBlocksSchema } from '@indus/domain'
import ReadingProgress from './ReadingProgress'

type Props = {
  bodyBlocksRaw: unknown
  estimatedMinutes?: number
}

/**
 * Sticky left TOC built from the section_head blocks in the article body.
 * Each link anchors to the corresponding `id` we render on SectionHeadBlock.
 * Reading-progress bar at the bottom (client component) tracks scroll %.
 */
export default function CaseToc({ bodyBlocksRaw, estimatedMinutes = 10 }: Props) {
  const parsed = BodyBlocksSchema.safeParse(bodyBlocksRaw)
  if (!parsed.success) return null
  const sections = parsed.data
    .filter((b): b is Extract<typeof b, { type: 'section_head' }> => b.type === 'section_head')
    .map((b) => ({ number: b.number, anchor: b.anchor, title: b.title }))

  if (sections.length === 0) return null

  return (
    <nav className="mono text-[11.5px]">
      <div className="mb-1 border-b border-ih-border pb-3 uppercase tracking-[0.12em] text-ih-muted-2">
        In this case
      </div>
      {sections.map((s) => (
        <a
          key={s.anchor}
          href={`#${s.anchor}`}
          className="flex gap-2.5 border-b border-dashed border-ih-border py-2.5 leading-[1.4] text-ih-muted hover:text-ih-accent"
        >
          <span className="w-[18px] flex-shrink-0 text-ih-muted-2">{s.number}</span>
          <span>{stripTrailingPeriod(s.title)}</span>
        </a>
      ))}
      <ReadingProgress estimatedMinutes={estimatedMinutes} />
    </nav>
  )
}

function stripTrailingPeriod(s: string): string {
  return s.replace(/\.$/, '')
}
