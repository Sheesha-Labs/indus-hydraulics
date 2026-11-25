import { describe, expect, it } from 'vitest'
import { segmentEmail } from './email-segments'
import {
  SAME_AS_BEFORE,
  clientRefFromSubject,
  emailBodyRegions,
  neededByPhrase,
  sourceOfRange,
  splitCells,
} from './email-sources'

/** Board 36's body, neutral names: a table, a free-text line, a signature and an earlier reply. */
const BODY = [
  'Dear team,',
  '',
  'Please quote your best price and delivery for the below, required onboard by 30 Sep.',
  '',
  'Item\tDescription\tP/N\tQty',
  '1\tHose 1" 4SH, 1.5 m, JIC F/F\t\t6 nos',
  '2\tDirectional valve NG10, 24 VDC\tTEST-NG10-24\t2 nos',
  '3\tReturn filter element\tTEST-HF-220\t6 nos',
  '',
  'Also need 4 nos pressure gauge 0-250 bar, same as last order.',
  '',
  'Best regards,',
  'Sample Buyer',
  '',
  'On 2 Sep 2026, Example Sales <sales@example.test> wrote:',
  '> Please find our quotation attached for the gauges and fittings.',
].join('\n')

describe('emailBodyRegions', () => {
  const regions = emailBodyRegions(BODY, segmentEmail(BODY))

  it('finds the table, keeps the reply as ignored, and reads nothing else as a table', () => {
    expect(regions.map((r) => r.kind)).toEqual(['table', 'ignored'])
    const table = regions[0]!
    expect(table.rows![0]).toEqual(['Item', 'Description', 'P/N', 'Qty'])
    expect(table.rows).toHaveLength(4)
    expect(BODY.slice(regions[1]!.start)).toMatch(/^On 2 Sep/)
  })

  it('a line read inside the table is Table, the sentence is Text', () => {
    const inTable = BODY.indexOf('Directional valve')
    const sentence = BODY.indexOf('Also need')
    expect(sourceOfRange(regions, [inTable, inTable + 10])).toBe('table')
    expect(sourceOfRange(regions, [sentence, sentence + 20])).toBe('text')
    expect(sourceOfRange(regions, null)).toBe('text')
  })

  it('splits cells on tabs, pipes and wide spaces', () => {
    expect(splitCells('| 1 | Hose | 6 nos |')).toEqual(['1', 'Hose', '6 nos'])
    expect(splitCells('1    Hose 1/2"    6')).toEqual(['1', 'Hose 1/2"', '6'])
    expect(splitCells('   ')).toEqual([])
    expect(splitCells('1\tHose 1" 4SH\t\t6 nos')).toEqual(['1', 'Hose 1" 4SH', '', '6 nos'])
  })

  it('needed-by is the phrase in the fresh text, never in a reply', () => {
    expect(neededByPhrase(BODY, regions)).toMatchObject({
      quote: 'required onboard by 30 Sep',
      dateText: '30 Sep',
    })
    const replyOnly = 'Hello\n\nOn 1 Sep, X wrote:\n> delivery by 3 Oct please'
    expect(
      neededByPhrase(replyOnly, emailBodyRegions(replyOnly, segmentEmail(replyOnly)))
    ).toBeNull()
  })
})

describe('subject reference and same-as-before', () => {
  it('reads a reference-shaped token from the subject', () => {
    expect(clientRefFromSubject('RE: RFQ – hydraulic spares / SC-RFQ-0924')).toBe('SC-RFQ-0924')
    expect(clientRefFromSubject('Fwd: PO 4471/2026 spares')).toBeNull()
    expect(clientRefFromSubject('Enquiry SAMPLE-RFQ')).toBeNull()
    expect(clientRefFromSubject(null)).toBeNull()
  })

  it('spots lines that point at an earlier order', () => {
    for (const s of [
      'same as last order',
      'as per our PO 4471',
      'same as previous supply',
      'as supplied before',
    ])
      expect(SAME_AS_BEFORE.test(s)).toBe(true)
    expect(SAME_AS_BEFORE.test('Hose 1/2" 2SN, 3 m')).toBe(false)
  })
})
