/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, render, screen } from '../lib/test-dom'
import ProgressBar from './ProgressBar'

afterEach(cleanup)

describe('ProgressBar', () => {
  it('exposes value, max and text on a named progressbar', () => {
    render(<ProgressBar label="Lines quoted" value={9} total={12} />)
    const bar = screen.getByRole('progressbar', { name: 'Lines quoted' })
    expect(bar).toHaveAttribute('aria-valuenow', '9')
    expect(bar).toHaveAttribute('aria-valuemax', '12')
    expect(bar).toHaveAttribute('aria-valuetext', '9 of 12')
    expect(bar).toHaveTextContent('9 of 12')
  })

  it('draws the fill as an SVG width attribute', () => {
    const { container } = render(<ProgressBar value={30} total={100} tone="ok" valueText="30%" />)
    const fill = container.querySelectorAll('svg > rect')[1]
    expect(fill).toHaveAttribute('width', '30%')
    expect(fill).toHaveClass('fill-io-ok-solid')
    expect(screen.getByRole('progressbar', { name: 'Progress' })).toHaveAttribute(
      'aria-valuetext',
      '30%'
    )
  })

  it('clamps the fill to the total', () => {
    const { container } = render(<ProgressBar value={7} total={5} />)
    expect(container.querySelectorAll('svg > rect')[1]).toHaveAttribute('width', '100%')
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '5')
  })
})
