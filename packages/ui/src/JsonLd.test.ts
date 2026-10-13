import { describe, expect, it } from 'vitest'
import { serializeJsonLd } from './JsonLd'

describe('serializeJsonLd', () => {
  it('cannot be closed early by a string field carrying </script>', () => {
    const out = serializeJsonLd({ name: 'Hose </script><script>alert(1)</script>' })
    expect(out).not.toContain('</script>')
    expect(out).not.toContain('<')
  })

  it('round-trips to the same object', () => {
    const item = {
      '@type': 'FAQPage',
      text: 'a < b & "quoted" \u2028 line',
      nested: { list: ['<x>', 1, true, null] },
    }
    expect(JSON.parse(serializeJsonLd(item))).toEqual(item)
  })

  it('escapes the line and paragraph separators', () => {
    const out = serializeJsonLd({ a: '\u2028\u2029' })
    expect(out).toBe('{"a":"\\u2028\\u2029"}')
  })
})
