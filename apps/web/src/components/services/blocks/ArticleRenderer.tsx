import { BodyBlocksSchema, type BodyBlock } from '@indus/domain'
import SectionHeadBlockView from './SectionHeadBlock'
import LeadBlockView from './LeadBlock'
import ParagraphBlockView from './ParagraphBlock'
import ProblemSolutionBlockView from './ProblemSolutionBlock'
import FigureBlockView from './FigureBlock'
import PullQuoteBlockView from './PullQuoteBlock'
import ApproachGridBlockView from './ApproachGridBlock'
import SopBlockView from './SopBlock'
import SpecTableBlockView from './SpecTableBlock'
import ResultBoxBlockView from './ResultBoxBlock'
import TeamListBlockView from './TeamListBlock'

type Props = {
  blocksRaw: unknown
}

/**
 * Switch on `block.type` to render the right component for each body block.
 * Validates the array via Zod first; invalid blocks are silently dropped
 * (logged server-side) so a single broken block doesn't break the page.
 */
export default function ArticleRenderer({ blocksRaw }: Props) {
  const parsed = BodyBlocksSchema.safeParse(blocksRaw)
  if (!parsed.success) {
    console.error('[ArticleRenderer] invalid bodyBlocks', parsed.error.flatten())
    return null
  }
  return (
    // min-w-0: as a grid item this defaults to min-width:auto, so the widest
    // spec table set the column width and the overflow-x-auto wrapper inside it
    // never had a constrained parent to scroll within.
    <article className="sc-article-body min-w-0">
      {parsed.data.map((block, i) => (
        <BlockSwitch key={i} block={block} />
      ))}
    </article>
  )
}

function BlockSwitch({ block }: { block: BodyBlock }) {
  switch (block.type) {
    case 'section_head':
      return <SectionHeadBlockView block={block} />
    case 'lead':
      return <LeadBlockView block={block} />
    case 'paragraph':
      return <ParagraphBlockView block={block} />
    case 'problem_solution':
      return <ProblemSolutionBlockView block={block} />
    case 'figure':
      return <FigureBlockView block={block} />
    case 'pull_quote':
      return <PullQuoteBlockView block={block} />
    case 'approach_grid':
      return <ApproachGridBlockView block={block} />
    case 'sop_block':
      return <SopBlockView block={block} />
    case 'spec_table':
      return <SpecTableBlockView block={block} />
    case 'result_box':
      return <ResultBoxBlockView block={block} />
    case 'team_list':
      return <TeamListBlockView block={block} />
    default: {
      // Exhaustiveness check — TS catches missing cases at compile time.
      const _exhaustive: never = block
      return null
    }
  }
}
