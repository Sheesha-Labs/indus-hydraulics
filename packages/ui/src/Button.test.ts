import { describe, expect, it } from 'vitest'
import { buttonVariants } from './Button'

/**
 * cva concatenates; it does not merge. If the base and a kind both name a
 * border colour, the raw `buttonVariants()` string carries two, and the one
 * Tailwind happens to emit later wins — for outline that was
 * `border-transparent`, which made every raw-styled outline link borderless.
 */
const KINDS = ['primary', 'navy', 'outline', 'ghost', 'onnavy', 'danger'] as const

/** Unprefixed border-colour utilities: `border-transparent`, `border-ih-*`, `border-white/28`. */
function borderColours(classes: string): string[] {
  return classes
    .split(/\s+/)
    .filter((c) => !c.includes(':'))
    .filter((c) => /^border-(transparent|ih-|white|black|\[)/.test(c))
}

describe('buttonVariants', () => {
  it.each(KINDS)('%s names exactly one resting border colour', (kind) => {
    expect(borderColours(buttonVariants({ kind }))).toHaveLength(1)
  })

  it('outline keeps its visible border without a merge step', () => {
    const cls = buttonVariants({ kind: 'outline', size: 'md' })
    expect(cls).toContain('border-ih-border-strong')
    expect(cls).not.toContain('border-transparent')
  })
})
