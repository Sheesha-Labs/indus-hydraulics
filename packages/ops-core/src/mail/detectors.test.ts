import { describe, expect, it } from 'vitest'
import { inspectAttachmentHeader } from './attachment-checks'
import { detectAutoReply } from './auto-reply'
import { parseBounce } from './bounce'
import { linksFromHtml, runDetectors } from './detectors'
import { domainOf, type HeaderMap } from './headers'
import { damerauLevenshtein, fold } from './homoglyph'
import { detectBulk } from './mailing-list'
import { assessPhishing, type KnownDomain } from './phishing'
import { isPublicMailDomain } from './public-domains'
import { findReference, splitQuoted } from './reply-attribution'

/**
 * S05-T03 detectors, table-driven. Every address and domain is a reserved example (example.test,
 * example.org, example.com) and every name is invented.
 */

const H = (o: Record<string, string>): HeaderMap =>
  Object.fromEntries(Object.entries(o).map(([k, v]) => [k.toLowerCase(), [v]]))

// ── Auto-reply ─────────────────────────────────────────────────────────────────────────

describe('detectAutoReply · out-of-office subjects in twelve languages', () => {
  it.each([
    'Out of Office: RFQ 2 inch ball valves',
    'Out of the office until Monday',
    'OOO - back 3 December',
    'Automatic reply: Price request',
    'Autoreply: your message',
    'Abwesenheitsnotiz: Anfrage',
    'Nicht im Büro',
    'Réponse automatique : Demande de prix',
    'Absence du bureau',
    'Respuesta automática: Cotización',
    'Fuera de la oficina',
    'Risposta automatica: Richiesta',
    'Fuori ufficio fino al 3',
    'Resposta automática: Pedido',
    'Fora do escritório',
    'Automatisch antwoord: Offerte',
    'Afwezig tot maandag',
    '自动回复: 询价',
    '不在办公室',
    '自動応答: お見積り',
    'Otomatik yanıt: Teklif',
    'Ofis dışında',
    'Автоответ: Запрос цены',
    'Нет в офисе до понедельника',
    'رد تلقائي: طلب عرض سعر',
    'خارج المكتب',
  ])('%s', (subject) => {
    const r = detectAutoReply({ headers: {}, subject, bodyText: '' })
    expect(r.isAutoReply).toBe(true)
  })
})

describe('detectAutoReply · headers', () => {
  it.each([
    [{ 'Auto-Submitted': 'auto-replied' }, true],
    [{ 'Auto-Submitted': 'auto-generated' }, true],
    [{ 'Auto-Submitted': 'no' }, false],
    [{ 'X-Autoreply': 'yes' }, true],
    [{ 'X-Autorespond': 'yes' }, true],
    [{ Precedence: 'auto_reply' }, true],
    [{ Precedence: 'junk' }, true],
    [{ Precedence: 'bulk' }, false], // bulk alone is a newsletter, not an auto-reply
    [{ 'X-MS-Exchange-Inbox-Rules-Loop': 'sales@example.test' }, true],
    [{}, false],
  ] as const)('%o → %s', (headers, expected) => {
    expect(
      detectAutoReply({ headers: H(headers), subject: 'Quotation', bodyText: '' }).isAutoReply
    ).toBe(expected)
  })

  it.each([
    'Re: Quotation for ball valves',
    'Please quote 10 pcs gate valve',
    'Office relocation notice', // not "out of office"
    'Automatic transmission parts', // "automatic" without reply
  ])('ordinary subject %s is not an auto-reply', (subject) => {
    expect(detectAutoReply({ headers: {}, subject, bodyText: 'Hello' }).isAutoReply).toBe(false)
  })

  it('extracts the return-date and alternate-contact sentences, never a parsed date', () => {
    const r = detectAutoReply({
      headers: H({ 'Auto-Submitted': 'auto-replied' }),
      subject: 'Out of Office',
      bodyText:
        'Thank you for your email. I am out of the office and will be back on 3 December 2026. ' +
        'For urgent matters please contact a.buyer@example.test or +971 4 000 0000.',
    })
    expect(r.kind).toBe('out_of_office')
    expect(r.returnDateText).toMatch(/back on 3 December/)
    expect(r.alternateContactText).toMatch(/a\.buyer@example\.test/)
  })

  it('reads an auto acknowledgement as auto_ack', () => {
    const r = detectAutoReply({
      headers: H({ 'Auto-Submitted': 'auto-generated' }),
      subject: 'We have received your request [Ticket #4411]',
      bodyText: 'This is an automated message.',
    })
    expect(r.kind).toBe('auto_ack')
  })
})

// ── Bounce ─────────────────────────────────────────────────────────────────────────────

const DSN_HARD = `Reporting-MTA: dns; mx.example.org
Final-Recipient: rfc822; buyer@example.test
Action: failed
Status: 5.1.1
Diagnostic-Code: smtp; 550 5.1.1 The email account that you tried to reach does not exist`

const DSN_SOFT = `Final-Recipient: rfc822; buyer@example.test
Action: delayed
Status: 4.4.1
Diagnostic-Code: smtp; 421 4.4.1 Connection timed out`

const RETURNED = `From: sales@example.com
To: buyer@example.test
Subject: IH-RFQ-2611-P03
Message-ID: <abc123@mail.example.com>
X-Indus-Outbound: 01937a5e-0000-7000-8000-0000000000aa`

describe('parseBounce', () => {
  const REPORT = 'multipart/report; report-type=delivery-status; boundary="b"'

  it('a hard bounce returns the recipient, status, diagnostic and our outbound id', () => {
    const r = parseBounce({
      fromAddress: 'mailer-daemon@googlemail.com',
      headers: H({ 'Content-Type': REPORT }),
      dsnText: DSN_HARD,
      returnedHeadersText: RETURNED,
    })
    expect(r).toEqual({
      isBounce: true,
      hard: true,
      finalRecipient: 'buyer@example.test',
      status: '5.1.1',
      diagnostic: expect.stringContaining('does not exist'),
      originalMessageId: 'abc123@mail.example.com',
      xIndusOutbound: '01937a5e-0000-7000-8000-0000000000aa',
    })
  })

  it('a delayed delivery is a soft bounce', () => {
    const r = parseBounce({
      fromAddress: 'postmaster@example.org',
      headers: H({ 'Content-Type': REPORT }),
      dsnText: DSN_SOFT,
    })
    expect(r).toMatchObject({ isBounce: true, hard: false, status: '4.4.1' })
  })

  it.each([
    ['mailer-daemon@example.org', true],
    ['MAILER-DAEMON@example.org', true],
    ['postmaster@example.test', true],
    ['mail-daemon@example.org', true],
    ['buyer@example.test', false],
    ['daemon.fan@example.test', false],
  ])('sender %s → bounce %s', (fromAddress, isBounce) => {
    expect(
      parseBounce({ fromAddress, headers: {}, bodyText: 'Delivery failed 5.1.1' }).isBounce
    ).toBe(isBounce)
  })

  it.each([
    ['5.1.1', true],
    ['5.7.1', true],
    ['5.2.2', true],
    ['4.2.2', false],
    ['4.7.0', false],
  ])('status %s → hard %s', (status, hard) => {
    const r = parseBounce({
      fromAddress: 'mailer-daemon@example.org',
      headers: {},
      dsnText: `Final-Recipient: rfc822; a@example.test\nAction: failed\nStatus: ${status}`,
    })
    expect(r.hard).toBe(hard)
  })

  it('reads a status from prose when there is no DSN part', () => {
    const r = parseBounce({
      fromAddress: 'mailer-daemon@example.org',
      headers: {},
      bodyText: 'Delivery to the following recipient failed permanently: 550 5.1.1 user unknown',
    })
    expect(r).toMatchObject({ isBounce: true, hard: true, status: '5.1.1' })
  })

  it('a delivery-success report is not a bounce', () => {
    const r = parseBounce({
      fromAddress: 'postmaster@example.org',
      headers: H({ 'Content-Type': REPORT }),
      dsnText: 'Final-Recipient: rfc822; a@example.test\nAction: delivered\nStatus: 2.0.0',
    })
    expect(r.isBounce).toBe(false)
  })

  it('folds continuation lines of a long diagnostic', () => {
    const r = parseBounce({
      fromAddress: 'mailer-daemon@example.org',
      headers: {},
      dsnText:
        'Action: failed\nStatus: 5.2.2\nDiagnostic-Code: smtp; 552 5.2.2 mailbox full\n  please try later',
    })
    expect(r.diagnostic).toBe('552 5.2.2 mailbox full please try later')
  })
})

// ── Bulk ───────────────────────────────────────────────────────────────────────────────

describe('detectBulk', () => {
  it.each([
    [{ 'List-Id': '<news.example.org>' }, true],
    [{ 'List-Unsubscribe': '<mailto:unsub@example.org>' }, true],
    [{ Precedence: 'list' }, true],
    [{ Precedence: 'bulk' }, true],
    [{ 'X-MC-User': 'abc' }, true],
    [{ 'X-SG-EID': 'abc' }, true],
    [{ 'Feedback-ID': '1:2:3' }, true],
    [{ 'X-Mailchimp-Campaign': 'x' }, true],
    [{ 'X-SES-Outgoing': 'x' }, true],
    [{ 'X-Mailgun-Sid': 'x' }, true],
    [{ Precedence: 'first-class' }, false],
    [{ Subject: 'Hello' }, false],
  ] as const)('%o → %s', (headers, isBulk) => {
    expect(detectBulk({ headers: H(headers) }).isBulk).toBe(isBulk)
  })
})

// ── Homoglyphs and phishing ────────────────────────────────────────────────────────────

describe('fold and damerauLevenshtein', () => {
  it.each([
    ['examp1e-va1ve.test', 'example-valve.test'],
    ['exarnple.test', 'example.test'],
    ['ЕХАМРLЕ.test', 'example.test'], // Cyrillic capitals
    ['vvidget.example', 'widget.example'],
    ['0range.example', 'orange.example'],
    ['ехample.test', 'example.test'], // Cyrillic е and х
  ])('fold(%s) = fold(%s)', (a, b) => {
    expect(fold(a)).toBe(fold(b))
  })

  it.each([
    ['example', 'example', 0],
    ['example', 'exmaple', 1], // transposition
    ['example', 'examples', 1],
    ['example', 'exampel', 1],
    ['valve', 'valves', 1],
    ['abc', '', 3],
    ['sample', 'example', 2],
  ] as const)('%s ↔ %s = %d', (a, b, d) => {
    expect(damerauLevenshtein(a, b)).toBe(d)
  })
})

const KNOWN: KnownDomain[] = [
  { domain: 'example-valve.test', companyName: 'Example Valve Co', role: 'supplier' },
  { domain: 'sample-client.example', companyName: 'Sample Client LLC', role: 'client' },
]

const base = {
  fromName: null,
  auth: { spf: 'pass', dkim: 'pass', dmarc: 'pass' },
  gmailLabels: [] as string[],
  knownDomains: KNOWN,
  firstSeenDomainDays: 400,
  links: [] as Array<{ text: string; href: string }>,
  bodyText: 'Please find our quotation attached.',
}

describe('assessPhishing', () => {
  it('a known sender with good auth is not flagged', () => {
    expect(assessPhishing({ ...base, fromAddress: 'sales@example-valve.test' }).flagged).toBe(false)
  })

  it.each([
    'sales@examp1e-valve.test',
    'sales@example-va1ve.test',
    'sales@exarnple-valve.test',
    'sales@example-valves.test',
    'sales@exmaple-valve.test',
    'sales@sample-cl1ent.example',
  ])('look-alike %s is flagged naming the real domain', (fromAddress) => {
    const r = assessPhishing({ ...base, fromAddress })
    expect(r.flagged).toBe(true)
    const reason = r.reasons.find((x) => x.code === 'lookalike_domain')!
    expect(reason.text).toMatch(/example-valve\.test|sample-client\.example/)
  })

  it.each(['someone@unrelated.example', 'buyer@gmail.com', 'sales@sub.example-valve.test'])(
    '%s is not a look-alike',
    (fromAddress) => {
      expect(
        assessPhishing({ ...base, fromAddress }).reasons.some((r) => r.code === 'lookalike_domain')
      ).toBe(false)
    }
  )

  it('flags a display name borrowing a known company from another domain, homoglyphs included', () => {
    for (const fromName of [
      'Example Valve Co Accounts',
      'Exarnple Va1ve Co',
      'Sample Client LLC',
    ]) {
      const r = assessPhishing({ ...base, fromName, fromAddress: 'accounts@unrelated.example' })
      expect(r.reasons.map((x) => x.code)).toContain('display_name_impostor')
    }
  })

  it.each([
    [{ spf: 'fail', dkim: 'pass', dmarc: 'pass' }, 'SPF'],
    [{ spf: 'pass', dkim: 'pass', dmarc: 'fail' }, 'DMARC'],
  ])('authentication failure %o is flagged', (auth, word) => {
    const r = assessPhishing({ ...base, auth, fromAddress: 'sales@example-valve.test' })
    expect(r.reasons.find((x) => x.code === 'auth_failed')?.text).toContain(word)
  })

  it('Gmail spam is flagged', () => {
    expect(
      assessPhishing({ ...base, gmailLabels: ['SPAM'], fromAddress: 'x@unrelated.example' })
        .reasons[0]!.code
    ).toBe('gmail_spam')
  })

  it.each([
    [{ text: 'www.example-valve.test/invoice', href: 'https://unrelated.example/login' }, true],
    [{ text: 'example-valve.test', href: 'https://www.example-valve.test/q' }, false],
    [{ text: 'Click here', href: 'https://unrelated.example' }, false],
  ])('link %o mismatch → %s', (link, flagged) => {
    const r = assessPhishing({ ...base, links: [link], fromAddress: 'sales@example-valve.test' })
    expect(r.reasons.some((x) => x.code === 'link_mismatch')).toBe(flagged)
  })

  it.each([
    'Please note our new bank account details for the next payment.',
    'Kindly update our IBAN as below.',
    'Change of bank details effective today.',
    'Bitte beachten Sie unsere neue Bankverbindung.',
    'Veuillez noter nos nouvelles coordonnées bancaires.',
    'Por favor tome nota de nuestra nueva cuenta bancaria.',
    'Si prega di notare le nuove coordinate bancarie.',
    'يرجى ملاحظة حساب بنكي جديد',
  ])('payment-change wording from a new domain: %s', (bodyText) => {
    const r = assessPhishing({
      ...base,
      bodyText,
      firstSeenDomainDays: 3,
      fromAddress: 'accounts@unrelated.example',
    })
    const reason = r.reasons.find((x) => x.code === 'payment_change_new_sender')
    expect(reason?.text).toContain('first seen 3 days ago')
  })

  it('payment-change wording from a long-known domain is not flagged by that rule', () => {
    const r = assessPhishing({
      ...base,
      bodyText: 'Please note our new bank account details.',
      firstSeenDomainDays: 400,
      fromAddress: 'sales@example-valve.test',
    })
    expect(r.flagged).toBe(false)
  })

  it('a domain never seen before says so', () => {
    const r = assessPhishing({
      ...base,
      bodyText: 'New beneficiary details attached.',
      firstSeenDomainDays: undefined,
      fromAddress: 'x@unrelated.example',
    })
    expect(r.reasons.find((x) => x.code === 'payment_change_new_sender')?.text).toContain(
      'never seen before'
    )
  })

  it('a log-in-to-view request is flagged', () => {
    const r = assessPhishing({
      ...base,
      bodyText: 'Please log in to view the RFQ document.',
      fromAddress: 'x@unrelated.example',
    })
    expect(r.reasons.map((x) => x.code)).toContain('login_to_view')
  })
})

// ── Attachments ────────────────────────────────────────────────────────────────────────

const bytes = (...parts: Array<number[] | string>): Uint8Array =>
  new Uint8Array(
    parts.flatMap((p) => (typeof p === 'string' ? [...p].map((c) => c.charCodeAt(0)) : p))
  )

describe('inspectAttachmentHeader', () => {
  it.each([
    [
      bytes('%PDF-1.7\n1 0 obj\n<<>>\ntrailer << /Encrypt 5 0 R >>'),
      'q.pdf',
      'application/pdf',
      'pdf',
      true,
    ],
    [
      bytes('%PDF-1.7\n1 0 obj\n<<>>\ntrailer << /Root 1 0 R >>'),
      'q.pdf',
      'application/pdf',
      'pdf',
      false,
    ],
    [
      bytes([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], 'rest'),
      'list.xlsx',
      'application/octet-stream',
      'ooxml',
      true,
    ],
    [
      bytes([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1], 'rest'),
      'old.xls',
      'application/vnd.ms-excel',
      'ole',
      false,
    ],
    [
      bytes([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x01, 0x00]),
      'docs.zip',
      'application/zip',
      'zip',
      true,
    ],
    [
      bytes([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00]),
      'docs.zip',
      'application/zip',
      'zip',
      false,
    ],
    [
      bytes([0x50, 0x4b, 0x03, 0x04, 0x14, 0x00, 0x00, 0x00]),
      'rfq.docx',
      'application/zip',
      'ooxml',
      false,
    ],
    [bytes('hello'), 'note.txt', 'text/plain', 'other', false],
  ] as const)('%#', (b, name, mime, kind, locked) => {
    expect(inspectAttachmentHeader(b, name, mime)).toEqual({ kind, passwordProtected: locked })
  })
})

// ── Public domains, domain parsing, links ──────────────────────────────────────────────

describe('public mail domains and domainOf', () => {
  it.each([
    ['gmail.com', true],
    ['GMAIL.COM', true],
    ['outlook.com', true],
    ['qq.com', true],
    ['example-valve.test', false],
    [null, false],
  ])('%s → %s', (d, pub) => {
    expect(isPublicMailDomain(d)).toBe(pub)
  })

  it.each([
    ['Buyer <buyer@Sample-Client.example>', 'sample-client.example'],
    ['buyer@example.test.', 'example.test'],
    ['no-at-sign', null],
  ])('domainOf(%s)', (a, d) => {
    expect(domainOf(a)).toBe(d)
  })

  it('extracts http(s) links from HTML', () => {
    expect(
      linksFromHtml(
        '<p><a href="https://x.example/a"><b>x.example</b></a> <a href="mailto:a@b.example">m</a></p>'
      )
    ).toEqual([{ href: 'https://x.example/a', text: 'x.example' }])
  })
})

// ── References ─────────────────────────────────────────────────────────────────────────

describe('findReference', () => {
  it.each([
    ['Re: IH-RFQ-2611-P03', null, 'IH-RFQ-2611-P03'],
    ['Our ref ENQ-2026-0444', null, 'ENQ-2026-0444'],
    ['Re: quote', 'Further to INDUS/Q10023-R2 please …', 'INDUS/Q10023-R2'],
    ['Order SO-2611', null, 'SO-2611'],
    ['PO acknowledgement', 'Your INDUS/PO10045 is confirmed', 'INDUS/PO10045'],
    ['re: enq 2026 0007', null, 'ENQ-2026-0007'],
    ['IHRFQ2611P03', null, 'IH-RFQ-2611-P03'],
  ])('%s / %s → %s', (subject, body, expected) => {
    expect(findReference(body, subject).match?.canonical).toBe(expected)
  })

  it('the more specific reference wins: an RFQ ref beats the enquiry it belongs to', () => {
    expect(findReference('Our ENQ-2026-0444', 'Re: IH-RFQ-2611-P03').match?.canonical).toBe(
      'IH-RFQ-2611-P03'
    )
  })

  it('two different references of the same rank in the new text → null, not a guess', () => {
    const r = findReference('Please see IH-RFQ-2611-P03 and IH-RFQ-2611-P04', 'Re: quotes')
    expect(r.match).toBeNull()
    expect(r.ambiguous).toBe(true)
    expect(r.candidates).toEqual(['IH-RFQ-2611-P03', 'IH-RFQ-2611-P04'])
  })

  it('the same reference written several times is one match', () => {
    expect(
      findReference('ENQ-2026-0444 … ENQ 2026 0444 … enq-2026-0444', null).match?.canonical
    ).toBe('ENQ-2026-0444')
  })

  it('a reference in the new text beats an older one quoted below', () => {
    const body =
      'Updated price for ENQ-2026-0500.\n\nOn Mon, 3 Nov 2026 at 10:00, Sales <s@example.com> wrote:\n> ENQ-2026-0444'
    expect(findReference(body, 'Re: price').match).toMatchObject({
      canonical: 'ENQ-2026-0500',
      source: 'new_text',
    })
  })

  it('falls back to a quoted reference when the new text has none', () => {
    const body = 'Thanks, noted.\n\n> Our reference: IH-RFQ-2611-P07\n> Please quote'
    expect(findReference(body, 'Re:').match).toMatchObject({
      canonical: 'IH-RFQ-2611-P07',
      source: 'quoted',
    })
  })

  it('reads an Outlook reply header as the start of quoted text', () => {
    const body =
      'See attached.\n\nFrom: Sales <s@example.com>\nSent: Monday\nSubject: ENQ-2026-0444\n\nOld text'
    expect(findReference(body, null).match).toMatchObject({
      canonical: 'ENQ-2026-0444',
      source: 'quoted',
    })
  })

  it.each(['ENQ-26-7', 'SO-24', 'IH-RFQ-26-P3', 'Please quote', ''])(
    'no reference in %s',
    (text) => {
      expect(findReference(text, null).match).toBeNull()
    }
  )

  it('subject references are reported as from the subject', () => {
    expect(findReference('no refs here', 'Re: ENQ-2026-0444').match?.source).toBe('subject')
  })
})

describe('splitQuoted', () => {
  it.each([
    ['New\n> old', 'New', '> old'],
    [
      'New\nOn Tue, 4 Nov 2026, A <a@example.test> wrote:\nold',
      'New',
      'On Tue, 4 Nov 2026, A <a@example.test> wrote:\nold',
    ],
    ['New\n-----Original Message-----\nold', 'New', '-----Original Message-----\nold'],
    [
      'Neu\nAm 4. Nov. 2026 schrieb A <a@example.test>:\nalt',
      'Neu',
      'Am 4. Nov. 2026 schrieb A <a@example.test>:\nalt',
    ],
    ['Only new', 'Only new', ''],
  ])('%#', (text, fresh, quoted) => {
    expect(splitQuoted(text)).toEqual({ fresh, quoted })
  })
})

// ── All together ───────────────────────────────────────────────────────────────────────

describe('runDetectors', () => {
  it('returns every fact for one message', () => {
    const facts = runDetectors(
      {
        fromAddress: 'sales@examp1e-valve.test',
        fromName: 'Example Valve Co',
        subject: 'Re: IH-RFQ-2611-P03',
        bodyText: 'Price attached.',
        headers: H({ 'List-Unsubscribe': '<mailto:u@example.org>' }),
        gmailLabels: [],
        auth: { spf: 'pass', dmarc: 'pass' },
        attachments: [{ filename: 'q.pdf', passwordProtected: true }, { filename: 'b.pdf' }],
      },
      { knownDomains: KNOWN, firstSeenDomainDays: 2 }
    )
    expect(facts.reference.match?.canonical).toBe('IH-RFQ-2611-P03')
    expect(facts.phishing.flagged).toBe(true)
    expect(facts.bulk.isBulk).toBe(true)
    expect(facts.autoReply.isAutoReply).toBe(false)
    expect(facts.bounce.isBounce).toBe(false)
    expect(facts.attachments).toEqual({ count: 2, passwordProtected: ['q.pdf'] })
  })
})
