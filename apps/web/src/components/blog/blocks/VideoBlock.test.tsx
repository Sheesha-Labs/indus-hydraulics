import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import VideoBlockView from './VideoBlock'

/**
 * The video block's server output: a labelled play button over the poster
 * frame, the title as real text, and no player until someone asks for one.
 */
describe('VideoBlockView', () => {
  const block = {
    type: 'video' as const,
    url: 'https://youtu.be/dQw4w9WgXcQ',
    title: 'Crimping a 2SN hose',
    uploadDate: '2026-09-01',
    caption: 'Bench crimp, -08.',
  }

  it('renders the poster and a labelled play button, never the iframe on load', () => {
    const html = renderToStaticMarkup(<VideoBlockView block={block} />)
    expect(html).toContain('aria-label="Play video: Crimping a 2SN hose"')
    expect(html).toContain('i.ytimg.com')
    expect(html).not.toContain('<iframe')
  })

  it('carries the title and caption as text under the frame', () => {
    const html = renderToStaticMarkup(<VideoBlockView block={block} />)
    expect(html).toContain('<figcaption')
    expect(html).toContain('Crimping a 2SN hose')
    expect(html).toContain('Bench crimp, -08.')
  })

  it('renders nothing for a URL that names no YouTube video', () => {
    const html = renderToStaticMarkup(
      <VideoBlockView block={{ ...block, url: 'https://vimeo.com/123' }} />,
    )
    expect(html).toBe('')
  })
})
