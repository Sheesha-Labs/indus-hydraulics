/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import { cleanup, render, screen } from '../lib/test-dom'
import Chip from './Chip'

afterEach(cleanup)

describe('Chip', () => {
  it('takes its tone from the family, so "No reply" differs by family', () => {
    render(
      <>
        <Chip family="rfq" status="No reply" />
        <Chip family="client" status="No reply" />
      </>
    )
    const [rfq, client] = screen.getAllByText('No reply')
    expect(rfq).toHaveAttribute('data-tone', 'bad')
    expect(client).toHaveAttribute('data-tone', 'warn')
  })

  it('strikes Superseded and prints the word', () => {
    render(<Chip family="doc" status="Superseded" />)
    const chip = screen.getByText('Superseded')
    expect(chip).toHaveClass('line-through')
    expect(chip).toHaveAttribute('data-tone', 'n')
  })

  it('an explicit tone needs a label; strike is optional', () => {
    render(<Chip tone="solid-ok" label="Paid in full" />)
    expect(screen.getByText('Paid in full')).toHaveAttribute('data-tone', 'solid-ok')
  })

  it('label overrides the printed word but keeps the tone', () => {
    render(<Chip family="money" status="Overdue" label="Overdue 12 days" />)
    expect(screen.getByText('Overdue 12 days')).toHaveAttribute('data-tone', 'bad')
  })

  it('the dot is decorative; sizes and classes resolve to tokens', () => {
    const { container } = render(
      <>
        <Chip family="assistant" status="Running" dot />
        <Chip family="enquiry" status="Quoted" size="sm" />
        <Chip family="enquiry" status="Quoted" size="lg" />
      </>
    )
    const chips = container.querySelectorAll('[data-part="chip"]')
    expect(chips[0]!.querySelector('[aria-hidden="true"]')).not.toBeNull()
    for (const c of chips) expect(problemsIn(c.className)).toEqual([])
    expect(chips[1]).toHaveClass('h-io-chip-sm')
    expect(chips[2]).toHaveClass('h-io-chip-lg')
  })

  it('types: a word needs its family, and must belong to it', () => {
    // @ts-expect-error a status word without a family is a type error
    const a = <Chip status="Quoted" />
    // @ts-expect-error "Viewed" is not a supplier RFQ word
    const b = <Chip family="rfq" status="Viewed" />
    // @ts-expect-error a tone without a label
    const c = <Chip tone="ok" />
    expect([a, b, c]).toHaveLength(3)
  })
})
