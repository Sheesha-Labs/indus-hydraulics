import { describe, expect, it } from 'vitest'

import { CONTACT_PATHS, extractContacts, pickPrimaryContact } from './contact-extraction'

const PAGE = 'https://acme-valves.de/contact'

function run(html: string, ownDomain: string | null = 'acme-valves.de') {
  return extractContacts({ html, pageUrl: PAGE, ownDomain })
}

describe('finding addresses', () => {
  it('reads a mailto link', () => {
    expect(run('<a href="mailto:sales@acme-valves.de">Email us</a>')[0]).toMatchObject({
      email: 'sales@acme-valves.de',
      confidence: 'high',
      onOwnDomain: true,
      isRoleAddress: true,
    })
  })

  it('reads an address from body text', () => {
    const out = run('<p>Write to export@acme-valves.de for quotations.</p>')
    expect(out[0]!.email).toBe('export@acme-valves.de')
    expect(out[0]!.confidence).toBe('medium')
  })

  it('decodes a percent-encoded mailto', () => {
    expect(run('<a href="mailto:sales%40acme-valves.de">x</a>')[0]!.email).toBe(
      'sales@acme-valves.de',
    )
  })

  it('lowercases addresses so they de-duplicate', () => {
    const out = run('<a href="mailto:Sales@Acme-Valves.de">a</a> Sales@acme-valves.de')
    expect(out).toHaveLength(1)
  })

  it('prefers the mailto hit when the same address also appears as text', () => {
    const out = run('sales@acme-valves.de <a href="mailto:sales@acme-valves.de">x</a>')
    expect(out).toHaveLength(1)
    expect(out[0]!.confidence).toBe('high')
  })
})

describe('rejecting things that are not supplier contacts', () => {
  it('rejects an image filename that parses as an address', () => {
    expect(run('<img src="logo@2x.png">')).toEqual([])
  })

  it('rejects other asset extensions read as a TLD', () => {
    expect(run('<img srcset="hero@3x.jpg, icon@2x.svg">')).toEqual([])
  })

  it('rejects noreply and postmaster style mailboxes', () => {
    expect(run('noreply@acme-valves.de postmaster@acme-valves.de')).toEqual([])
  })

  it('rejects placeholder domains', () => {
    expect(run('someone@example.com you@yourdomain.com')).toEqual([])
  })

  it('rejects platform and tooling addresses', () => {
    expect(run('abc@sentry.io help@wordpress.org')).toEqual([])
  })

  it('rejects a purely numeric local part', () => {
    expect(run('12345@acme-valves.de')).toEqual([])
  })

  it('rejects privacy and abuse mailboxes, which never quote', () => {
    expect(run('privacy@acme-valves.de dpo@acme-valves.de abuse@acme-valves.de')).toEqual([])
  })
})

describe('own-domain classification', () => {
  it('marks a third-party address as off-domain and low confidence', () => {
    const out = run('<a href="mailto:hi@webagency-berlin.de">agency</a>', 'acme-valves.de')
    expect(out[0]).toMatchObject({ onOwnDomain: false, confidence: 'low' })
  })

  it('accepts a subdomain of the own domain', () => {
    expect(run('sales@export.acme-valves.de')[0]!.onOwnDomain).toBe(true)
  })

  it('tolerates a www prefix on the supplied own domain', () => {
    expect(run('sales@acme-valves.de', 'www.acme-valves.de')[0]!.onOwnDomain).toBe(true)
  })

  it('marks everything off-domain when the domain is unknown', () => {
    expect(run('sales@acme-valves.de', null)[0]!.onOwnDomain).toBe(false)
  })
})

describe('ordering', () => {
  it('puts own-domain addresses before third-party ones', () => {
    const out = run('<a href="mailto:hi@agency-berlin.de">a</a> info@acme-valves.de')
    expect(out[0]!.onOwnDomain).toBe(true)
  })

  it('prefers a named person over a generic mailbox at equal confidence', () => {
    const out = run('m.schmidt@acme-valves.de info@acme-valves.de')
    expect(out[0]!.email).toBe('m.schmidt@acme-valves.de')
  })

  it('is deterministic regardless of order in the source', () => {
    const a = run('info@acme-valves.de export@acme-valves.de')
    const b = run('export@acme-valves.de info@acme-valves.de')
    expect(a.map((c) => c.email)).toEqual(b.map((c) => c.email))
  })
})

describe('pickPrimaryContact', () => {
  it('returns the best own-domain address', () => {
    const picked = pickPrimaryContact(run('<a href="mailto:sales@acme-valves.de">x</a>'))
    expect(picked?.email).toBe('sales@acme-valves.de')
  })

  it('returns null rather than falling back to a third-party address', () => {
    expect(pickPrimaryContact(run('<a href="mailto:hi@agency-berlin.de">x</a>'))).toBeNull()
  })

  it('returns null for a page with nothing usable', () => {
    expect(pickPrimaryContact(run('<p>Call us on +49 123 456</p>'))).toBeNull()
  })
})

describe('contact paths', () => {
  it('includes impressum — legally mandated on German sites, so highest yield', () => {
    expect(CONTACT_PATHS).toContain('/impressum')
  })

  it('is all root-relative, so it can never be pointed at another host', () => {
    for (const p of CONTACT_PATHS) expect(p.startsWith('/')).toBe(true)
  })
})

describe('never guesses', () => {
  it('returns nothing for a page with no address, rather than inventing sales@', () => {
    expect(run('<html><body><h1>Acme Valves</h1><p>Contact form below.</p></body></html>')).toEqual([])
  })
})
