import { describe, expect, it } from 'vitest'
import { hrefsIn, htmlText, linkPhraseInHtml } from './link-text'

describe('linkPhraseInHtml', () => {
  it('links the first whole-word occurrence', () => {
    const r = linkPhraseInHtml('Fit 2SN here, then 2SN there.', '2SN', '/p/x')
    expect(r).toEqual({ html: 'Fit <a href="/p/x">2SN</a> here, then 2SN there.', linked: true })
  })

  it('skips a match inside a longer token and takes the next whole word', () => {
    const r = linkPhraseInHtml('SAE 100R5 is odd; an R5 hose is sized on OD.', 'R5', '/p/r5')
    expect(r.html).toBe('SAE 100R5 is odd; an <a href="/p/r5">R5</a> hose is sized on OD.')
  })

  it('does not treat BSPP as BSP, or ferrules as ferrule', () => {
    expect(linkPhraseInHtml('BSPP only', 'BSP', '/c/b').linked).toBe(false)
    expect(linkPhraseInHtml('two ferrules', 'ferrule', '/c/f').linked).toBe(false)
  })

  it('never links inside an existing anchor or a heading', () => {
    const html = '<h3>JIC fittings</h3><p>See <a href="/c/a">JIC adapters</a> and JIC hose ends.</p>'
    expect(linkPhraseInHtml(html, 'JIC', '/c/j').html).toBe(
      '<h3>JIC fittings</h3><p>See <a href="/c/a">JIC adapters</a> and <a href="/c/j">JIC</a> hose ends.</p>',
    )
  })

  it('never matches inside an attribute', () => {
    const html = '<span title="ORFS">a face seal</span> ORFS'
    expect(linkPhraseInHtml(html, 'ORFS', '/c/o').html).toBe('<span title="ORFS">a face seal</span> <a href="/c/o">ORFS</a>')
  })

  it('respects minOffset across tags, keeping the lead opening clear', () => {
    const html = '<strong>JIC</strong> leads, and later JIC returns.'
    expect(linkPhraseInHtml(html, 'JIC', '/c/j', { minOffset: 5 }).html).toBe(
      '<strong>JIC</strong> leads, and later <a href="/c/j">JIC</a> returns.',
    )
  })

  it('reports a miss without touching the html', () => {
    expect(linkPhraseInHtml('nothing here', 'R13', '/p/r13')).toEqual({ html: 'nothing here', linked: false })
  })
})

describe('htmlText and hrefsIn', () => {
  it('strips tags and decodes the common entities', () => {
    expect(htmlText('<p>Safety &amp; <strong>clamps</strong></p>')).toBe('Safety & clamps')
  })

  it('lists hrefs in order', () => {
    expect(hrefsIn('<a href="/c/a">a</a> <a href="/p/b">b</a>')).toEqual(['/c/a', '/p/b'])
  })
})
