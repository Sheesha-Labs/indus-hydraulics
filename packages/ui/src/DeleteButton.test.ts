import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { DeleteButton } from './DeleteButton'

const render = (props: Parameters<typeof DeleteButton>[0]) => renderToStaticMarkup(createElement(DeleteButton, props))

describe('DeleteButton', () => {
  it('renders a trash icon, not the word, with the label as name and tooltip', () => {
    const html = render({ label: 'Delete template Axial Piston Pump' })
    expect(html).toContain('aria-label="Delete template Axial Piston Pump"')
    expect(html).toContain('title="Delete template Axial Piston Pump"')
    expect(html).toContain('lucide-trash')
    expect(html).not.toMatch(/>\s*Delete/)
    expect(html).toContain('type="button"')
  })

  it('lets title explain a disabled state', () => {
    const html = render({ label: 'Delete brand', title: 'Cannot delete: products reference this brand', disabled: true })
    expect(html).toContain('title="Cannot delete: products reference this brand"')
    expect(html).toContain('disabled=""')
  })

  it('swaps the icon for a spinner and disables while pending', () => {
    const html = render({ label: 'Delete', pending: true })
    expect(html).toContain('aria-busy="true"')
    expect(html).toContain('disabled=""')
    expect(html).toContain('animate-spin')
    expect(html).not.toContain('lucide-trash')
  })

  it('shows the label beside the icon only when asked', () => {
    expect(render({ label: 'Delete product', showLabel: true })).toContain('>Delete product</span>')
  })
})
