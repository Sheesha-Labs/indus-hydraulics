import type { BlogBlock } from '@indus/domain'

// The eleven blocks shared with ServiceCase reuse their existing views rather
// than being reimplemented. The schemas are literally the same types, so a
// second set would be duplicate markup guaranteed to drift.
import ApproachGridBlockView from '../services/blocks/ApproachGridBlock'
import FigureBlockView from '../services/blocks/FigureBlock'
import LeadBlockView from '../services/blocks/LeadBlock'
import ParagraphBlockView from '../services/blocks/ParagraphBlock'
import ProblemSolutionBlockView from '../services/blocks/ProblemSolutionBlock'
import PullQuoteBlockView from '../services/blocks/PullQuoteBlock'
import ResultBoxBlockView from '../services/blocks/ResultBoxBlock'
import SectionHeadBlockView from '../services/blocks/SectionHeadBlock'
import SopBlockView from '../services/blocks/SopBlock'
import SpecTableBlockView from '../services/blocks/SpecTableBlock'
import TeamListBlockView from '../services/blocks/TeamListBlock'

import AsOfStampBlockView from './blocks/AsOfStampBlock'
import CalloutBlockView from './blocks/CalloutBlock'
import CategoryLinkBlockView from './blocks/CategoryLinkBlock'
import ComparisonTableBlockView from './blocks/ComparisonTableBlock'
import CtaBlockView, { type ArticleContact } from './blocks/CtaBlock'
import DecisionTreeBlockView from './blocks/DecisionTreeBlock'
import DirectAnswerBlockView from './blocks/DirectAnswerBlock'
import DownloadBlockView from './blocks/DownloadBlock'
import FaqBlockView from './blocks/FaqBlock'
import KeyTakeawaysBlockView from './blocks/KeyTakeawaysBlock'
import ProductEmbedBlockView from './blocks/ProductEmbedBlock'
import StandardCitationBlockView from './blocks/StandardCitationBlock'

import type { ResolvedBlogArticle } from '../../lib/blog-article'

type Props = {
  article: ResolvedBlogArticle
  contact: ArticleContact
}

/**
 * Renders a validated blog article body.
 *
 * Takes already-parsed blocks rather than raw JSON, because resolving product
 * SKUs and category slugs needs a database round trip and that belongs in the
 * page, not in a render pass. `resolveBlogArticle` does both in two queries
 * for the whole article.
 *
 * Contrast with ArticleRenderer for service cases, which parses inside the
 * component and returns null if any block fails — blanking a whole article
 * over one bad block, with the page chrome still rendering as if nothing were
 * wrong. Here invalid blocks are dropped upstream and logged by name.
 */
export default function BlogArticleRenderer({ article, contact }: Props) {
  if (article.dropped.length > 0) {
    console.error(
      '[BlogArticleRenderer] dropped invalid blocks',
      article.dropped.map((d) => `#${d.index} ${d.reason}`).join('; '),
    )
  }

  return (
    // min-w-0: as a grid item this defaults to min-width:auto, so the widest
    // comparison table would set the column width and the overflow-x-auto
    // wrapper inside it would have no constrained parent to scroll within.
    // Same fix as the service ArticleRenderer.
    <article className="sc-article-body min-w-0">
      {article.blocks.map((block, i) => (
        <BlockSwitch key={i} block={block} article={article} contact={contact} />
      ))}
    </article>
  )
}

function BlockSwitch({
  block,
  article,
  contact,
}: {
  block: BlogBlock
  article: ResolvedBlogArticle
  contact: ArticleContact
}) {
  switch (block.type) {
    // ── Shared with ServiceCase ──────────────────────────────────────────
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

    // ── Blog-specific ────────────────────────────────────────────────────
    case 'key_takeaways':
      return <KeyTakeawaysBlockView block={block} />
    case 'direct_answer':
      return <DirectAnswerBlockView block={block} />
    case 'comparison_table':
      return <ComparisonTableBlockView block={block} />
    case 'standard_citation':
      return <StandardCitationBlockView block={block} />
    case 'faq_block':
      return <FaqBlockView block={block} />
    case 'decision_tree':
      return <DecisionTreeBlockView block={block} />
    case 'callout':
      return <CalloutBlockView block={block} />
    case 'product_embed':
      return <ProductEmbedBlockView block={block} productsBySku={article.productsBySku} />
    case 'category_link':
      return <CategoryLinkBlockView block={block} categoriesBySlug={article.categoriesBySlug} />
    case 'download_block':
      return <DownloadBlockView block={block} />
    case 'cta_block':
      return <CtaBlockView block={block} contact={contact} />
    case 'as_of_stamp':
      return <AsOfStampBlockView block={block} />

    default: {
      // Exhaustiveness check — a new block type without a renderer is a
      // compile error, not a blank space discovered in production.
      const _exhaustive: never = block
      void _exhaustive
      return null
    }
  }
}
