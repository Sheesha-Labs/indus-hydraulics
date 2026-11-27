import { describe, expect, it } from 'vitest'
import { decideCompanyMatch, isFreeMail, matchSentence, type MatchEvidence } from './company-match'

const A = { companyId: 'a', companyName: 'Sample Client LLC' }
const B = { companyId: 'b', companyName: 'Example Works' }
const C = { companyId: 'c', companyName: 'Demo Marine' }
const D = { companyId: 'd', companyName: 'Another Client' }

describe('decideCompanyMatch', () => {
  it('no evidence, or only weak letterhead evidence, is none', () => {
    expect(decideCompanyMatch([])).toEqual({ kind: 'none' })
    expect(decideCompanyMatch([{ ...A, basis: 'letterhead', score: 0.79 }])).toEqual({
      kind: 'none',
    })
  })

  it('one company is Sure with all its bases and the contact', () => {
    expect(
      decideCompanyMatch([
        { ...A, basis: 'letterhead', score: 0.92 },
        { ...A, basis: 'contact_email', score: 1, contactId: 'k' },
      ])
    ).toEqual({
      kind: 'sure',
      companyId: 'a',
      companyName: 'Sample Client LLC',
      contactId: 'k',
      basis: ['contact_email', 'letterhead'],
    })
    expect(decideCompanyMatch([{ ...B, basis: 'sender_domain', score: 1 }])).toMatchObject({
      kind: 'sure',
      contactId: null,
      basis: ['sender_domain'],
    })
  })

  it('a single contact-email match decides over other companies', () => {
    expect(
      decideCompanyMatch([
        { ...A, basis: 'contact_email', score: 1, contactId: 'k' },
        { ...B, basis: 'letterhead', score: 0.85 },
      ])
    ).toMatchObject({ kind: 'sure', companyId: 'a' })
  })

  it('several companies without one contact are Unsure, strongest first, at most three', () => {
    const ev: MatchEvidence[] = [
      { ...A, basis: 'letterhead', score: 0.81 },
      { ...B, basis: 'sender_domain', score: 1 },
      { ...C, basis: 'letterhead', score: 0.9 },
      { ...D, basis: 'letterhead', score: 0.8 },
    ]
    expect(decideCompanyMatch(ev)).toEqual({
      kind: 'unsure',
      candidates: [
        { companyId: 'b', companyName: 'Example Works', why: 'the sender’s domain' },
        { companyId: 'c', companyName: 'Demo Marine', why: 'the letterhead name' },
        { companyId: 'a', companyName: 'Sample Client LLC', why: 'the letterhead name' },
      ],
    })
    expect(
      decideCompanyMatch([
        { ...A, basis: 'contact_email', score: 1 },
        { ...B, basis: 'contact_email', score: 1 },
      ])
    ).toMatchObject({ kind: 'unsure' })
    expect(
      decideCompanyMatch([
        { ...A, basis: 'letterhead', score: 0.9 },
        { ...B, basis: 'letterhead', score: 0.9 },
      ])
    ).toMatchObject({ kind: 'unsure', candidates: [{ companyId: 'b' }, { companyId: 'a' }] })
  })
})

describe('domains and the sentence', () => {
  it('free mail by domain', () => {
    expect(isFreeMail('a@webmail.example', ['webmail.example'])).toBe(true)
    expect(isFreeMail('a@client.example', ['webmail.example'])).toBe(false)
    expect(isFreeMail(undefined, ['webmail.example'])).toBe(false)
  })
  it('says what matched', () => {
    expect(matchSentence(['letterhead', 'contact_email'], 'j@x.test')).toBe(
      'Matched on letterhead and sender j@x.test'
    )
    expect(matchSentence(['sender_domain'], null)).toBe('Matched on sender')
    expect(matchSentence(['letterhead'], 'j@x.test')).toBe('Matched on letterhead')
    expect(matchSentence([], null)).toBe('Matched')
  })
})
