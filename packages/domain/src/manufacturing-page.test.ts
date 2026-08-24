import { describe, expect, it } from 'vitest'
import { DESIGNED_INDUSTRY_PAGES } from './industry-pages'
import { MANUFACTURING_ENQUIRY, MANUFACTURING_PAGE } from './manufacturing-page'

/**
 * The record is content, so most of it cannot be tested — nobody can assert a
 * lede reads well. What CAN be asserted is the set of mistakes that would ship
 * silently: a stage dropped from the twelve, an icon key the renderer has no
 * component for, a guarantee left blank, an image still pointing at the
 * supplier's own server, or a cross-link that does not point at a real page.
 */

const page = MANUFACTURING_PAGE

describe('manufacturing page record', () => {
  it('lives at /manufacturing and says so consistently', () => {
    expect(page.path).toBe('/manufacturing')
    expect(MANUFACTURING_ENQUIRY.path).toBe(page.path)
  })

  it('states three workshops and ships exactly three', () => {
    // The hero's stat row is a claim about the rest of the page. If someone
    // adds a fourth workshop and forgets the figure, the page contradicts
    // itself in its own first screen.
    const claimed = page.hero.stats.find((s) => s.label === 'Production workshops')
    expect(claimed?.value).toBe(String(page.workshops.items.length))
    expect(page.workshops.items).toHaveLength(3)
  })

  it('states twelve process stages and ships exactly twelve', () => {
    const claimed = page.hero.stats.find((s) => s.label === 'Controlled process stages')
    expect(claimed?.value).toBe(String(page.process.items.length))
    expect(page.process.items).toHaveLength(12)
  })

  it('numbers the stages 01 to 12 in order, without gaps', () => {
    expect(page.process.items.map((s) => s.stage)).toEqual([
      '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12',
    ])
  })

  it('gives every stage a guarantee', () => {
    // The guarantee is the reason the grid exists — it is what turns a list of
    // steps into a set of commitments. A blank one renders an empty rule.
    for (const stage of page.process.items) {
      expect(stage.guarantee.trim().length).toBeGreaterThan(20)
      expect(stage.title.trim()).toBe(stage.title)
    }
  })

  it('numbers the OEM steps 01 to 05 and gives each an icon the renderer knows', () => {
    expect(page.oem.items.map((s) => s.step)).toEqual(['01', '02', '03', '04', '05'])
    const known = new Set(['upload', 'gauge', 'wrench', 'settings', 'truck'])
    for (const step of page.oem.items) expect(known.has(step.icon)).toBe(true)
  })

  it('never repeats an OEM icon', () => {
    // Five steps, five distinct marks. A repeat means two steps read as the
    // same kind of action at a glance.
    const icons = page.oem.items.map((s) => s.icon)
    expect(new Set(icons).size).toBe(icons.length)
  })
})

describe('imagery', () => {
  const images = page.workshops.items.map((w) => w.image)

  it('gives every workshop a photograph with real alt text', () => {
    expect(images).toHaveLength(3)
    for (const image of images) expect(image.alt.trim().length).toBeGreaterThan(20)
  })

  it('serves every image from the manufacturing-images bucket', () => {
    // A src left pointing at the supplier's own server would 403 in
    // production: they block cross-origin requests, which is why the files
    // were copied.
    for (const image of images) {
      expect(image.src).toMatch(
        /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/manufacturing-images\//,
      )
    }
  })

  it('never reuses one photograph in two workshops', () => {
    const sources = images.map((i) => i.src)
    expect(new Set(sources).size).toBe(sources.length)
  })

  it('gives every workshop its own visible caption, distinct from the alt text', () => {
    // The caption is read by everyone; the alt is read instead of the image.
    // Making them identical wastes one of the two.
    for (const shop of page.workshops.items) {
      expect(shop.caption.trim().length).toBeGreaterThan(10)
      expect(shop.caption).not.toBe(shop.image.alt)
    }
  })
})

describe('the enquiry config', () => {
  it('offers "Not sure — advise" first, because it is the default the form selects', () => {
    // Most senders do not know their process route — that is what they are
    // asking. A required choice they cannot make is a lost lead.
    expect(MANUFACTURING_ENQUIRY.choices[0]).toBe('Not sure — advise')
  })

  it('offers a clean, unique option list', () => {
    const { choices } = MANUFACTURING_ENQUIRY
    expect(choices.length).toBeGreaterThan(1)
    expect(new Set(choices).size).toBe(choices.length)
    for (const choice of choices) expect(choice.trim()).toBe(choice)
  })
})

describe('cross-links', () => {
  it('points at the sibling designed page, and it points back', () => {
    // The two pages were built from the same handoff family and each is the
    // other's most useful next click. A one-way link is the version that rots.
    expect(page.related.href).toBe('/industries/data-center-liquid-cooling')

    const sibling = DESIGNED_INDUSTRY_PAGES.find((p) => `/industries/${p.slug}` === page.related.href)
    expect(sibling).toBeDefined()
    expect(sibling?.related.href).toBe(page.path)
  })

  it('sends the OEM button at a real internal path', () => {
    // The designed label named a quality-control page the site does not have.
    // Whatever it says, the href has to resolve.
    expect(page.oem.ctaHref.startsWith('/')).toBe(true)
  })
})
