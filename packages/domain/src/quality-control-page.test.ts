import { describe, expect, it } from 'vitest'
import type { DesignedPageImage } from './designed-pages'
import { DESIGNED_INDUSTRY_PAGES } from './industry-pages'
import { MANUFACTURING_PAGE } from './manufacturing-page'
import { QUALITY_CONTROL_ENQUIRY, QUALITY_CONTROL_PAGE } from './quality-control-page'

/**
 * The record is content, so most of it cannot be tested. What CAN be asserted
 * is the set of mistakes that would ship silently on a page whose whole
 * argument is evidentiary: a frame with no alt text, a caption that has drifted
 * from the alt it is supposed to mirror, a check dropped from the twelve, an
 * image still pointing at the supplier's origin, or the certificate gallery
 * finding its way back in.
 */

const page = QUALITY_CONTROL_PAGE

function everyImage(): DesignedPageImage[] {
  return [
    ...page.lab.items.map((i) => i.image),
    ...page.dimensional.portraitRow.map((f) => f.image),
    ...page.dimensional.landscapeRow.map((f) => f.image),
    ...page.stages.items.flatMap((s) => s.checks.map((c) => c.image)),
    page.records.image,
  ]
}

describe('quality control page record', () => {
  it('lives at /quality-control and says so consistently', () => {
    expect(page.path).toBe('/quality-control')
    expect(QUALITY_CONTROL_ENQUIRY.path).toBe(page.path)
  })

  it('states twelve instruments and ships exactly twelve', () => {
    const claimed = page.hero.stats.find((s) => s.label === 'Laboratory instruments')
    expect(claimed?.value).toBe(String(page.lab.items.length))
    expect(page.lab.items).toHaveLength(12)
  })

  it('states twelve checkpoints and ships exactly twelve across three stages', () => {
    const checks = page.stages.items.flatMap((s) => s.checks)
    const claimed = page.hero.stats.find((s) => s.label === 'Inspection checkpoints')
    expect(claimed?.value).toBe(String(checks.length))
    expect(page.stages.items).toHaveLength(3)
    expect(checks).toHaveLength(12)
    // The hero spec table says the same thing in words; keep the two in step.
    expect(page.hero.spec).toContainEqual(['Inspection stages', '3 · 12 checks'])
  })

  it('numbers the stages 01 to 03 and gives each four checks', () => {
    expect(page.stages.items.map((s) => s.number)).toEqual(['01', '02', '03'])
    for (const stage of page.stages.items) expect(stage.checks).toHaveLength(4)
  })

  it('never repeats an instrument name or a check title', () => {
    const names = page.lab.items.map((i) => i.name)
    expect(new Set(names).size).toBe(names.length)
    const titles = page.stages.items.flatMap((s) => s.checks.map((c) => c.title))
    expect(new Set(titles).size).toBe(titles.length)
  })
})

describe('the contact sheet', () => {
  it('is two rows of four, one orientation each', () => {
    // The rows are uniform by construction — four portraits, four landscapes —
    // which is what removes the need for a stretched "fill" frame and the
    // ragged bottom edge that came with it.
    expect(page.dimensional.portraitRow).toHaveLength(4)
    expect(page.dimensional.landscapeRow).toHaveLength(4)
    for (const f of page.dimensional.portraitRow) expect(f.image.ratio).toBe('3/4')
    for (const f of page.dimensional.landscapeRow) expect(f.image.ratio).toBe('4/3')
  })

  it('gives every frame a caption and an alt that agree', () => {
    /*
      The caption asserts what the photograph shows and the alt says the same
      thing to a screen reader. Six of the eight captions the handoff supplied
      named the wrong instrument, so these two strings drifting apart is a
      live failure mode, not a hypothetical one. They need not be identical —
      the alt is fuller — but the caption's substance must appear in the alt.
    */
    const frames = [...page.dimensional.portraitRow, ...page.dimensional.landscapeRow]
    for (const frame of frames) {
      expect(frame.caption.trim().length).toBeGreaterThan(10)
      expect(frame.image.alt.trim().length).toBeGreaterThan(20)
      // The distinguishing noun in each caption also appears in its alt.
      const keyword = frame.caption.toLowerCase().split(' ')[0]!
      expect(frame.image.alt.toLowerCase()).toContain(keyword.replace(/[^a-z]/g, ''))
    }
  })
})

describe('imagery', () => {
  it('gives every one of the 32 frames real alt text', () => {
    // On a page whose argument is evidentiary, an empty alt is both an
    // accessibility failure and a wasted indexing surface.
    const images = everyImage()
    expect(images).toHaveLength(33)
    for (const image of images) expect(image.alt.trim().length).toBeGreaterThan(15)
  })

  it('serves every image from the quality-control-images bucket', () => {
    for (const image of everyImage()) {
      expect(image.src).toMatch(
        /^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\/quality-control-images\//,
      )
    }
  })

  it('reuses exactly one photograph, and it is the composition-analysis frame', () => {
    // One intentional reuse: laboratory card 12 and the navy records portrait.
    // A second reuse means a frame is doing two jobs and one of its two alt
    // texts is describing the wrong thing.
    const sources = everyImage().map((i) => i.src)
    const counts = new Map<string, number>()
    for (const src of sources) counts.set(src, (counts.get(src) ?? 0) + 1)
    const reused = [...counts.entries()].filter(([, n]) => n > 1)
    expect(reused).toHaveLength(1)
    expect(reused[0]![0]).toContain('chemical-composition-analysis')
    expect(reused[0]![1]).toBe(2)
  })
})

describe('the removed certificate gallery', () => {
  it('leaves no certificate section behind', () => {
    // The client dropped the source page's four certificate scans. Its absence
    // is a decision; this test is what makes reinstating it a deliberate act.
    const serialised = JSON.stringify(page).toLowerCase()
    expect(serialised).not.toContain('certificates attest')
    expect(serialised).not.toContain('comprehensive certification')
  })

  it('keeps the ISO 9001 credential the gallery used to carry', () => {
    // Dropping the images must not drop the claim — it moved to the hero spec
    // table and stage 01.
    expect(page.hero.spec).toContainEqual(['Quality system', 'ISO 9001'])
    expect(page.stages.lede).toContain('ISO 9001')
  })
})

describe('the enquiry config', () => {
  it('offers "Not sure — advise" first, the same default as the manufacturing page', () => {
    expect(QUALITY_CONTROL_ENQUIRY.choices[0]).toBe('Not sure — advise')
  })

  it('offers a clean, unique option list', () => {
    const { choices } = QUALITY_CONTROL_ENQUIRY
    expect(new Set(choices).size).toBe(choices.length)
    for (const choice of choices) expect(choice.trim()).toBe(choice)
  })
})

describe('the designed-page family is fully interlinked', () => {
  it('links quality control to both siblings', () => {
    const hrefs = page.related.map((r) => r.href)
    expect(hrefs).toContain('/manufacturing')
    expect(hrefs).toContain('/industries/data-center-liquid-cooling')
  })

  it('is linked back from manufacturing and from the data-centre page', () => {
    // Both siblings' navy CTAs promised a quality-control page long before it
    // existed. Now that it does, they must actually point at it.
    expect(MANUFACTURING_PAGE.oem.ctaHref).toBe(page.path)
    expect(MANUFACTURING_PAGE.related.map((r) => r.href)).toContain(page.path)

    const dataCentre = DESIGNED_INDUSTRY_PAGES.find(
      (p) => p.slug === 'data-center-liquid-cooling',
    )
    expect(dataCentre?.risk.ctaHref).toBe(page.path)
  })
})
