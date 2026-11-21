/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen, within } from '../lib/test-dom'
import StatusVocabulary from './StatusVocabulary'

afterEach(cleanup)

describe('StatusVocabulary', () => {
  it('shows the 12 kit families by default, each with every word', () => {
    render(<StatusVocabulary />)
    expect(screen.getAllByRole('region')).toHaveLength(12)
    const rfq = screen.getByRole('region', { name: 'Supplier RFQ' })
    expect(within(rfq).getAllByRole('listitem')).toHaveLength(9)
    expect(within(rfq).getByText('No reply')).toHaveAttribute('data-tone', 'bad')
    const client = screen.getByRole('region', { name: 'Client response' })
    expect(within(client).getByText('No reply')).toHaveAttribute('data-tone', 'warn')
  })

  it('takes any families', () => {
    render(<StatusVocabulary families={['recipient', 'mailbox']} />)
    expect(screen.getAllByRole('region')).toHaveLength(2)
  })
})
