/**
 * @vitest-environment jsdom
 */
import { Send } from 'lucide-react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { cleanup, render, screen, userEvent } from '../lib/test-dom'
import type { ButtonVariant } from '../types'
import Button, { buttonVariants, type ButtonSize } from './Button'
import ButtonLink from './ButtonLink'

afterEach(cleanup)

const VARIANTS: ButtonVariant[] = [
  'primary',
  'secondary',
  'navy',
  'ghost',
  'danger',
  'destructive',
  'link',
]
const SIZES: ButtonSize[] = ['lg', 'md', 'sm', 'xs']

describe('buttonVariants', () => {
  it.each(VARIANTS.flatMap((v) => SIZES.map((s) => [v, s] as const)))(
    '%s/%s uses only defined io- classes',
    (variant, size) => {
      expect(problemsIn(buttonVariants({ variant, size }))).toEqual([])
    }
  )

  it.each(VARIANTS)('%s names its own border colour', (variant) => {
    const classes = buttonVariants({ variant }).split(/\s+/)
    expect(classes.some((c) => /^border-(io-[a-z0-9-]+|transparent)$/.test(c))).toBe(true)
  })

  it('the base names no border colour (the packages/ui Button bug)', () => {
    // With variant and size cleared by an impossible compound, only the base remains.
    const base = buttonVariants({ variant: null, size: null }).split(/\s+/)
    expect(base).toContain('border')
    expect(base.filter((c) => /^border-(io-|transparent)/.test(c))).toEqual([])
  })

  it('defaults to secondary/md', () => {
    expect(buttonVariants()).toBe(buttonVariants({ variant: 'secondary', size: 'md' }))
    expect(buttonVariants()).toContain('h-io-btn ')
  })

  it('link carries no height or padding from its size', () => {
    const link = buttonVariants({ variant: 'link', size: 'lg' })
    expect(link).not.toMatch(/\bh-io-btn/)
    expect(link).not.toMatch(/\bpx-3\.5\b/)
  })
})

describe('Button', () => {
  it('is a type="button" with its label as the name, secondary/md by default', () => {
    render(<Button>Edit</Button>)
    const b = screen.getByRole('button', { name: 'Edit' })
    expect(b).toHaveAttribute('type', 'button')
    expect(b).toHaveAttribute('data-variant', 'secondary')
    expect(b).toHaveAttribute('data-size', 'md')
  })

  it('reflects the variant for the one-primary check', () => {
    render(<Button variant="primary">Approve and send</Button>)
    expect(screen.getByRole('button')).toHaveAttribute('data-variant', 'primary')
  })

  it('busy keeps the name, sets aria-busy, shows the spinner and ignores clicks', async () => {
    const onClick = vi.fn()
    render(
      <Button variant="primary" busy onClick={onClick}>
        Sending…
      </Button>
    )
    const b = screen.getByRole('button', { name: 'Sending…' })
    expect(b).toHaveAttribute('aria-busy', 'true')
    expect(b).toHaveAttribute('data-state', 'busy')
    expect(b.querySelector('[data-part="spinner"]')).toHaveAttribute('aria-hidden', 'true')
    await userEvent.click(b)
    expect(onClick).not.toHaveBeenCalled()
  })

  it('disabled is a real disabled button', () => {
    render(<Button disabled>Send quotation</Button>)
    expect(screen.getByRole('button', { name: 'Send quotation' })).toBeDisabled()
  })

  it('renders a decorative icon, the trail and a Kbd', () => {
    render(
      <Button icon={Send} trail="3" kbd="esc">
        Review
      </Button>
    )
    const b = screen.getByRole('button')
    expect(b.querySelector('svg')).toHaveAttribute('aria-hidden', 'true')
    expect(b.querySelector('kbd')).toHaveTextContent('esc')
    expect(b).toHaveTextContent('Review3esc')
  })

  it('an icon-only button is named by aria-label', () => {
    render(<Button icon={Send} aria-label="Send" />)
    expect(screen.getByRole('button', { name: 'Send' })).toBeInTheDocument()
  })

  it('an icon-only button without aria-label is a type error', () => {
    // @ts-expect-error: no children and no aria-label
    const el = <Button icon={Send} />
    expect(el).toBeTruthy()
  })

  it('asChild renders the child element with the button look', () => {
    render(
      <Button asChild variant="ghost">
        <a href="#top">Open</a>
      </Button>
    )
    const a = screen.getByRole('link', { name: 'Open' })
    expect(a).toHaveAttribute('data-variant', 'ghost')
    expect(a).not.toHaveAttribute('type')
  })

  it('passes onClick through when not busy', async () => {
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Edit</Button>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})

describe('ButtonLink', () => {
  it('is a link with the button look', () => {
    render(
      <ButtonLink href="/enquiries" variant="primary">
        Open enquiries
      </ButtonLink>
    )
    const a = screen.getByRole('link', { name: 'Open enquiries' })
    expect(a).toHaveAttribute('href', '/enquiries')
    expect(a).toHaveAttribute('data-variant', 'primary')
  })

  it('a new-tab link gets rel="noopener noreferrer"', () => {
    render(
      <ButtonLink href="https://example.com" target="_blank" variant="link">
        Open thread in Mail ↗
      </ButtonLink>
    )
    expect(screen.getByRole('link')).toHaveAttribute('rel', 'noopener noreferrer')
  })
})
