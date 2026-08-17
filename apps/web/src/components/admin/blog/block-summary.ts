import type { BlogBlockInput } from '@indus/domain'

/**
 * Human labels and one-line summaries for the block types the editor carries
 * but cannot yet edit.
 *
 * The summary is what stops the body from reading as a stack of anonymous grey
 * boxes: an author scrolling their article needs to recognise *which* table or
 * FAQ set they are looking at without opening anything.
 */

export const BLOCK_LABELS: Record<string, string> = {
  key_takeaways: 'Key takeaways',
  direct_answer: 'Direct answer',
  comparison_table: 'Comparison table',
  standard_citation: 'Standard citation',
  faq_block: 'FAQ',
  decision_tree: 'Decision tree',
  callout: 'Callout',
  product_embed: 'Product embed',
  category_link: 'Category link',
  download_block: 'Download',
  cta_block: 'Call to action',
  as_of_stamp: 'As-of stamp',
  problem_solution: 'Problem / solution',
  pull_quote: 'Pull quote',
  approach_grid: 'Approach grid',
  sop_block: 'Procedure',
  spec_table: 'Spec table',
  result_box: 'Result box',
  team_list: 'Team list',
}

export type BlockSummary = { label: string; detail: string }

function count(n: number, singular: string): string {
  return `${n} ${singular}${n === 1 ? '' : 's'}`
}

export function describeBlogBlock(block: BlogBlockInput | null | undefined): BlockSummary {
  if (!block || typeof block !== 'object' || !('type' in block)) {
    return { label: 'Unknown block', detail: 'This block could not be read.' }
  }

  const label = BLOCK_LABELS[block.type] ?? block.type.replace(/_/g, ' ')

  switch (block.type) {
    case 'key_takeaways':
      return { label, detail: count(block.items.length, 'point') }
    case 'direct_answer':
      return { label, detail: block.question }
    case 'comparison_table':
      return {
        label,
        detail: `${count(block.columns.length, 'column')} · ${count(block.rows.length, 'row')}`,
      }
    case 'standard_citation':
      return { label, detail: `${block.standard}${block.clause ? ` · ${block.clause}` : ''}` }
    case 'faq_block':
      return { label, detail: count(block.items.length, 'question') }
    case 'decision_tree':
      return { label, detail: count(block.branches.length, 'branch') }
    case 'callout':
      return { label, detail: `${block.tone} · ${block.title}` }
    case 'product_embed':
      return { label, detail: block.skus.join(', ') }
    case 'category_link':
      return { label, detail: `/c/${block.slug}` }
    case 'download_block':
      return { label, detail: count(block.items.length, 'file') }
    case 'cta_block':
      return { label, detail: block.heading }
    case 'as_of_stamp':
      return { label, detail: `Verified ${block.verifiedOn}` }
    case 'problem_solution':
      return { label, detail: block.problem.title }
    case 'pull_quote':
      return { label, detail: block.quote }
    case 'approach_grid':
      return { label, detail: count(block.phases.length, 'phase') }
    case 'sop_block':
      return { label, detail: block.header }
    case 'spec_table':
      return { label, detail: `${block.caption} · ${count(block.rows.length, 'row')}` }
    case 'result_box':
      return { label, detail: block.title }
    case 'team_list':
      return { label, detail: count(block.members.length, 'member') }
    default:
      return { label, detail: 'Carried through unchanged.' }
  }
}
