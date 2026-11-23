import { describe, expect, it } from 'vitest'
import {
  DAY_MS,
  initialsOf,
  inviteDomainVerdict,
  inviteExpiry,
  inviteState,
  lastOwnerBanner,
  lastOwnerMessage,
  nameFromEmail,
  openWorkSentence,
  removalNote,
  signInRefusal,
  signatureToHtml,
  signatureToText,
} from './team-core'

const NOW = new Date('2026-11-23T08:00:00Z')

describe('invite rules', () => {
  it('accepts the Workspace domain, refuses another unless overridden', () => {
    expect(inviteDomainVerdict('helper@example.test', 'example.test', false)).toBe('workspace')
    expect(inviteDomainVerdict('Helper@EXAMPLE.test', 'example.test', false)).toBe('workspace')
    expect(inviteDomainVerdict('helper@elsewhere.test', 'example.test', false)).toBe('refused')
    expect(inviteDomainVerdict('helper@elsewhere.test', 'example.test', true)).toBe('override')
    // A subdomain is another domain.
    expect(inviteDomainVerdict('helper@mail.example.test', 'example.test', false)).toBe('refused')
  })

  it('expires seven days after it was made (auth.inviteDays)', () => {
    const expires = inviteExpiry(NOW, 7)
    expect(expires.getTime() - NOW.getTime()).toBe(7 * DAY_MS)
    const row = { expiresAt: expires, acceptedAt: null, revokedAt: null }
    expect(inviteState(row, new Date(expires.getTime() - 1))).toBe('valid')
    expect(inviteState(row, expires)).toBe('expired')
  })

  it('says used before revoked before expired', () => {
    const past = new Date(NOW.getTime() - 1)
    expect(inviteState({ expiresAt: past, acceptedAt: past, revokedAt: past }, NOW)).toBe('used')
    expect(inviteState({ expiresAt: past, acceptedAt: null, revokedAt: past }, NOW)).toBe('revoked')
    expect(inviteState({ expiresAt: past, acceptedAt: null, revokedAt: null }, NOW)).toBe('expired')
  })
})

describe('names', () => {
  it('derives a name and initials from an address', () => {
    expect(nameFromEmail('helper.example@example.test')).toBe('Helper Example')
    expect(nameFromEmail('helper@example.test')).toBe('Helper')
    expect(nameFromEmail('@example.test')).toBe('Helper')
    expect(initialsOf('Helper Example')).toBe('HE')
    expect(initialsOf('Helper')).toBe('HE')
    expect(initialsOf('Ann Bea Cee Dee')).toBe('ABC')
  })
})

describe('84b sentences', () => {
  it('names the only Owner', () => {
    expect(lastOwnerMessage('Owner Example')).toBe(
      'Owner Example is the only Owner. Transfer ownership first.'
    )
    expect(lastOwnerBanner('Owner')).toMatch(/^Owner is the only Owner\. Transfer ownership/)
  })

  it('counts the open work that moves', () => {
    expect(openWorkSentence('Owner', { supplierRfqs: 0, draftChasers: 0 })).toBe(
      'Their open work moves to Owner: 0 supplier RFQs and 0 draft chasers. Their log entries stay.'
    )
    expect(removalNote('Owner', 'Helper', { supplierRfqs: 1, draftChasers: 2 })).toBe(
      'Removing a helper reassigns their open work to Owner: 1 supplier RFQ and 2 draft chasers for Helper today. Their log entries stay.'
    )
  })
})

describe('sign-in refusal (deactivated accounts)', () => {
  it('lets an active person in', () => {
    expect(signInRefusal({ status: 'active' }, 'google')).toBeNull()
    expect(signInRefusal({ status: 'active' }, 'password')).toBeNull()
  })

  it('says deactivated to a removed or suspended person only after Google proved the address', () => {
    expect(signInRefusal({ status: 'removed' }, 'google')).toBe('deactivated')
    expect(signInRefusal({ status: 'suspended' }, 'google')).toBe('deactivated')
    expect(signInRefusal({ status: 'removed' }, 'password')).toBe('not_invited')
  })

  it('treats an invited (not yet accepted) person like an unknown address', () => {
    expect(signInRefusal({ status: 'invited' }, 'google')).toBe('not_invited')
    expect(signInRefusal(null, 'google')).toBe('not_invited')
  })
})

describe('signature text', () => {
  it('round-trips plain text through the stored HTML, escaped', () => {
    const text = 'Owner Example\nSales <desk> & "quotes"'
    const html = signatureToHtml(text)
    expect(html).toBe('Owner Example<br>Sales &lt;desk&gt; &amp; &quot;quotes&quot;')
    expect(signatureToText(html)).toBe(text)
    expect(signatureToText(null)).toBe('')
  })
})
