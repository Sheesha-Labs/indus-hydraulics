import 'server-only'

import { emptyDesign, newBlock } from './blocks/document'
import type { Block, RecordKind, RecordLayout, RecordsValue } from './blocks/types'
import type { CampaignDraft } from './campaign'
import { latestRecordIds } from './records'

/**
 * The layouts a new newsletter can start from. The ones that feature site
 * records fill themselves with the latest published ones, so a starter is
 * close to sendable; staff swap the picks in the designer.
 *
 * Starter copy is real copy, except where only staff can know what to say
 * (the announcement's body): that is written in [brackets], which the send
 * gate refuses until replaced. Subjects are left empty for the same reason.
 */

export const STARTERS = ['new-stock', 'spotlight', 'from-the-blog', 'industry', 'announcement', 'blank'] as const
export type Starter = (typeof STARTERS)[number]

export const STARTER_META: Record<Starter, { label: string; hint: string }> = {
  'new-stock': { label: 'New in stock', hint: 'A hero and the latest products, with a quote call to action.' },
  spotlight: { label: 'Product spotlight', hint: 'One range up close: a heading, a paragraph, a few products.' },
  'from-the-blog': { label: 'From the blog', hint: 'The latest technical articles, with a short intro.' },
  industry: { label: 'Industry update', hint: 'Industries we serve and the categories that go with them.' },
  announcement: { label: 'Announcement', hint: 'Plain news: a heading, a few paragraphs and a button.' },
  blank: { label: 'Blank', hint: 'An empty page of blocks.' },
}

async function records(kind: RecordKind, n: number, layout: RecordLayout): Promise<RecordsValue | null> {
  const picks = await latestRecordIds(kind, n)
  return picks.length ? { kind, ids: picks.map((p) => p.id), labels: picks.map((p) => p.label), layout } : null
}

function recordsBlock(heading: string, intro: string, value: RecordsValue | null, buttonLabel: string, buttonUrl: string): Block {
  return newBlock('records', { heading, intro, records: value, buttonLabel, buttonUrl })
}

const QUOTE_BAND = () => newBlock('cta-band')

export async function starterDraft(starter: Starter): Promise<CampaignDraft> {
  const design = emptyDesign()
  switch (starter) {
    case 'new-stock':
      design.blocks = [
        newBlock('hero'),
        recordsBlock('New in stock', 'Just landed in our UAE warehouse and ready to ship.', await records('product', 6, 'grid'), 'View the catalogue', '/c'),
        QUOTE_BAND(),
      ]
      break
    case 'spotlight':
      design.blocks = [
        newBlock('heading', { heading: 'Product spotlight', size: 'l' }),
        newBlock('text', {
          text: 'A closer look at one of the ranges we keep in stock — what it is for, the sizes we hold, and how to order it.',
        }),
        recordsBlock('In the range', '', await records('product', 3, 'cards'), 'See the full range', '/c'),
        newBlock('button', { label: 'Request a quote', url: '/contact' }),
      ]
      break
    case 'from-the-blog':
      design.blocks = [
        newBlock('heading', { heading: 'From the Indus Hydraulics blog', size: 'l' }),
        newBlock('text', { text: 'Practical guides from our engineers on choosing, fitting and maintaining hydraulic and industrial parts.' }),
        recordsBlock('Latest articles', '', await records('article', 4, 'list'), 'Read more on the blog', '/blog'),
      ]
      break
    case 'industry':
      design.blocks = [
        newBlock('heading', { heading: 'Industries we supply', size: 'l' }),
        newBlock('text', { text: 'From oil and gas to marine and construction, here is what we stock for the work you do.' }),
        recordsBlock('Industries', '', await records('industry', 4, 'cards'), 'All industries', '/industries'),
        recordsBlock('Popular categories', '', await records('category', 6, 'grid'), 'Browse the catalogue', '/c'),
        QUOTE_BAND(),
      ]
      break
    case 'announcement':
      design.blocks = [
        newBlock('heading', { heading: 'News from Indus Hydraulics', size: 'l' }),
        newBlock('text', {
          text: '[Write what has changed, what it means for customers, and what they should do next.]',
        }),
        newBlock('button', { label: 'Contact us', url: '/contact' }),
      ]
      break
    case 'blank':
      break
  }
  return { subject: '', preheader: '', format: 'blocks', design, bodyHtml: '', audience: 'all', listIds: [] }
}
