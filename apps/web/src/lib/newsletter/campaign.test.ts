import { describe, expect, it } from 'vitest'

import { emptyDesign, newBlock } from './blocks/document'
import type { Design } from './blocks/types'
import {
  campaignDraftSchema,
  campaignProblems,
  footerReason,
  htmlToText,
  isBlankBody,
  renderCampaign,
  sanitiseEmailHtml,
  type CampaignDraft,
} from './campaign'

// Bazar's campaign.test.ts, adapted: one edition, no {{tokens}}, plus the
// rich-text sanitiser Bazar kept elsewhere.

const SITE = 'https://indushydraulics.com'
const OK = { missingRecords: 0, listsFound: 0 }

function design(...types: string[]): Design {
  const d = emptyDesign()
  d.blocks = types.map((t) => newBlock(t))
  return d
}

const base: CampaignDraft = {
  subject: 'New in stock: 316 stainless fittings',
  preheader: 'JIC, ORFS and BSPP, ready to ship from Dubai',
  format: 'blocks',
  design: design('heading', 'text'),
  bodyHtml: '',
  audience: 'all',
  listIds: [],
}

describe('campaignProblems', () => {
  it('passes a complete draft', () => {
    expect(campaignProblems(base, OK)).toEqual({})
  })

  it('wants a subject, a body and an audience', () => {
    expect(campaignProblems({ ...base, subject: '  ' }, OK).subject).toBeTruthy()
    expect(campaignProblems({ ...base, design: emptyDesign() }, OK).body).toBeTruthy()
    expect(campaignProblems({ ...base, format: 'rich', design: null, bodyHtml: '<p> </p>' }, OK).body).toBeTruthy()
    expect(campaignProblems({ ...base, audience: 'none', listIds: [] }, OK).audience).toBeTruthy()
  })

  it('catches template text left in', () => {
    expect(campaignProblems({ ...base, subject: '[Your headline]' }, OK).subject).toBeTruthy()
    expect(campaignProblems({ ...base, format: 'rich', design: null, bodyHtml: '<p>Lorem ipsum dolor</p>' }, OK).body).toBeTruthy()
  })

  it('catches a link an email cannot follow', () => {
    const r = campaignProblems({ ...base, format: 'rich', design: null, bodyHtml: '<p><a href="javascript:alert(1)">x</a></p>' }, OK)
    expect(r.body).toMatch(/not a link/)
  })

  it('reports unpublished records and deleted lists', () => {
    expect(campaignProblems(base, { missingRecords: 2, listsFound: 0 }).body).toMatch(/2 featured items/)
    const listId = '11111111-1111-4111-8111-111111111111'
    expect(campaignProblems({ ...base, listIds: [listId] }, { missingRecords: 0, listsFound: 0 }).audience).toMatch(/deleted/)
  })

  it('validates the stored shape', () => {
    expect(campaignDraftSchema.safeParse({ ...base, listIds: ['not-a-uuid'] }).success).toBe(false)
    expect(campaignDraftSchema.safeParse({ ...base, audience: 'en' }).success).toBe(false)
    expect(campaignDraftSchema.safeParse({ ...base, subject: 'x'.repeat(201) }).success).toBe(false)
  })
})

describe('sanitiseEmailHtml', () => {
  it('keeps prose, drops scripts, handlers, styles and classes', () => {
    const out = sanitiseEmailHtml(
      '<p class="x" style="color:red" onclick="steal()">Hello <strong>there</strong></p><script>alert(1)</script><iframe src="x"></iframe>',
      SITE,
    )
    expect(out).toContain('Hello <strong>there</strong>')
    expect(out).not.toMatch(/script|onclick|iframe|class=|color:red/)
    expect(out).toMatch(/<p style="margin:0 0 16px 0;/)
  })

  it('keeps only followable links, makes site links absolute, images https only', () => {
    const out = sanitiseEmailHtml(
      '<a href="/c/hoses">Hoses</a> <a href="javascript:alert(1)">bad</a> <a href="//evil.com">evil</a> <img src="http://x.com/a.jpg" alt="a"><img src="https://cdn.x.com/b.jpg" alt="b">',
      SITE,
    )
    expect(out).toContain(`href="${SITE}/c/hoses"`)
    expect(out).not.toContain('javascript:')
    expect(out).not.toContain('evil.com')
    expect(out).not.toContain('http://x.com')
    expect(out).toContain('src="https://cdn.x.com/b.jpg"')
  })
})

describe('htmlToText and isBlankBody', () => {
  it('turns HTML into readable text with link targets', () => {
    expect(htmlToText('<h2>Title</h2><p>See <a href="https://x.com/a">the range</a>.</p><ul><li>One</li><li>Two</li></ul>')).toBe(
      'Title\n\nSee the range (https://x.com/a).\n\n- One\n\n- Two',
    )
  })

  it('knows an empty body from a picture-only one', () => {
    expect(isBlankBody('<p>&nbsp;</p>')).toBe(true)
    expect(isBlankBody('<p><img src="https://x.com/a.jpg" alt=""></p>')).toBe(false)
  })
})

describe('renderCampaign', () => {
  const opts = {
    siteUrl: SITE,
    brand: { legalName: 'Indus Hydraulic Power Trading LLC', addressLines: ['Dubai'] },
    records: new Map(),
    unsubscribeUrl: 'https://indushydraulics.com/newsletter/unsubscribe/abc',
  }

  it('renders both formats with the legal footer and the right reason', () => {
    for (const c of [base, { ...base, format: 'rich' as const, design: null, bodyHtml: '<p>Hello</p>' }]) {
      const r = renderCampaign(c, { ...opts, recipient: 'list' })
      expect(r.subject).toBe(base.subject)
      expect(r.html).toContain('Indus Hydraulic Power Trading LLC')
      expect(r.html).toContain(opts.unsubscribeUrl)
      expect(r.text).toContain(opts.unsubscribeUrl)
      expect(r.html).toContain(footerReason('list'))
    }
  })

  it('prefixes a test subject and kills the unsubscribe link', () => {
    const r = renderCampaign(base, { ...opts, unsubscribeUrl: null, recipient: 'subscriber', subjectPrefix: '[Test] ' })
    expect(r.subject).toBe(`[Test] ${base.subject}`)
    expect(r.html).not.toContain('/newsletter/unsubscribe/')
  })
})
