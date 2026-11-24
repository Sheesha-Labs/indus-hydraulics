import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { buildSystem } from '@indus/ops-ai'
import * as classify from './classify-mail.v1'
import * as link from './link-mail.v1'

/**
 * Prompts are versioned code (CLAUDE.md §9.9): the text of a released version never changes. A different
 * hash means the prompt changed: write `<action>.v<N+1>.ts`, run the evals, and add its hash here instead
 * of editing this one.
 */
const RELEASED: Record<string, string> = {
  'classify-mail@1': '56f0e99312ab29590dece15960ed655d4423c6a30da72cb03c666d562edd8618',
  'link-mail@1': '76299dfff606b322cf7fd0b38c57f0b253bcb378e33a12f4129d81070ec288f6',
}

describe('released prompts are byte-stable', () => {
  it.each([classify, link])('$PROMPT_VERSION', (m) => {
    const hash = createHash('sha256').update(JSON.stringify(m.SYSTEM_PARTS)).digest('hex')
    expect(hash).toBe(RELEASED[m.PROMPT_VERSION])
    // and cacheable: no timestamps or ids in system text, one 1 h breakpoint on the last part
    const blocks = buildSystem(m.SYSTEM_PARTS)
    expect(blocks.at(-1)?.cache_control).toEqual({ type: 'ephemeral', ttl: '1h' })
  })

  it('the user turn carries the per-message values, not the system', () => {
    const u = classify.classifyUser({
      today: 'Tuesday, 24 November 2026',
      mailboxRole: 'client',
      senderRole: 'client',
      senderCompany: 'Sample Client LLC',
      previousClass: null,
      referenceFound: null,
      from: 'buyer@client.example',
      to: ['sales@example.test'],
      cc: [],
      subject: 'RFQ',
      newText: 'Please quote',
      attachments: [],
    })
    expect(u).toContain('Today: Tuesday, 24 November 2026')
    // the company's name is not passed to the model, only that it is known
    expect(u).not.toContain('Sample Client LLC')
  })
})
