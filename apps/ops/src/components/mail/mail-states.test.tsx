import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import type { MailStateView, ThreadView } from '../../data/mail'

/**
 * Boards 96 and 97 render from the thread's state (S05-T07). The client parts are stubbed: this checks what
 * the server draws. "Report to Google" is a plain link to the thread in Gmail: no action, no API call.
 */
vi.mock('./ItsRealMenu', () => ({ default: () => <button type="button">It’s real</button> }))
vi.mock('./AskOpenCopyButton', () => ({
  default: () => <button type="button">Draft “Ask sender for an open copy”</button>,
}))
vi.mock('./TranslationToggle', () => ({
  default: ({ languageName }: { languageName: string | null }) => (
    <div>Original English {languageName ? `translated from ${languageName}` : ''}</div>
  ),
}))

const { default: MailStateCards } = await import('./MailStateCards')
const { default: MailStateNotes } = await import('./MailStateNotes')

const NONE: MailStateView = {
  ooo: null,
  bounce: null,
  phishing: null,
  protectedFiles: [],
  oversized: [],
  unreadable: [],
  translation: null,
  bodyPending: false,
}

function thread(
  state: Partial<MailStateView>,
  over: Partial<ThreadView['latest']> = {},
  actions: ThreadView['actions'] = []
): ThreadView {
  return {
    id: 't1',
    subject: 'RFQ for ball valves',
    mailbox: { id: 'm1', address: 'purchase@example.test', role: 'supplier' },
    gmailUrl: 'https://mail.google.com/mail/u/?authuser=purchase%40example.test#all/abc',
    latest: {
      id: 'msg1',
      classification: 'auto_reply',
      confidence: 'sure',
      note: null,
      type: null,
      classLabel: 'Auto-reply',
      handledState: 'handled',
      from: { name: 'Away Person', address: 'away@example-valve.test' },
      rfcMessageId: null,
      referencesRfcIds: [],
      state: { ...NONE, ...state },
      ...over,
    },
    records: [],
    messages: [],
    earlier: 0,
    collapsedAfterFirst: false,
    crossMailbox: null,
    mailboxesInThread: ['purchase@example.test'],
    total: 1,
    actions,
    levelWord: 'Does it quietly',
  }
}

const resend = {
  id: 'a1',
  ref: 'A-26-11-24-0001',
  time: '09:12',
  headline: 'Send our email to Alex Example?',
  state: 'proposed',
  surface: 'review',
  actionKey: 'resend_alternate_contact',
  options: [
    { key: 'send', label: 'Send to Alex' },
    { key: 'wait', label: 'Wait for Away' },
  ],
}

describe('board 96 cards', () => {
  it('out of office: the date, the chip, and the stand-in choices open the Review card', () => {
    const html = renderToStaticMarkup(
      <MailStateCards
        thread={thread(
          { ooo: { until: '21 Sep', alternate: { name: 'Alex Example', email: 'alex@x.test' } } },
          {},
          [resend]
        )}
        notBusiness={null}
      />
    )
    expect(html).toContain('Away Person out until 21 Sep (auto-reply)')
    expect(html).toContain('Out of office · until 21 Sep')
    expect(html).toContain('Alex Example')
    expect(html).toContain('href="/review?action=A-26-11-24-0001"')
    expect(html).toContain('Send to Alex')
    expect(html).toContain('Wait for Away')
  })

  it('bounce: contact marked bad, the reason, and "Asks you · first email to a new address"', () => {
    const html = renderToStaticMarkup(
      <MailStateCards
        thread={thread(
          { bounce: { hard: true, recipient: 'gone@x.test', diagnostic: '550 user unknown' } },
          { classification: 'bounce' },
          [
            {
              ...resend,
              options: [
                { key: 'send', label: 'Resend to orders@' },
                { key: 'fix', label: 'Fix contact' },
              ],
            },
          ]
        )}
        notBusiness={null}
      />
    )
    expect(html).toContain('Contact marked bad: gone@x.test')
    expect(html).toContain('550 user unknown')
    expect(html).toContain('Resend to orders@')
    expect(html).toContain('first email to a new address')
  })

  it('phishing: why, nothing acted on, Report to Google is only a link to Gmail; the not-business counts', () => {
    const html = renderToStaticMarkup(
      <MailStateCards
        thread={thread(
          { phishing: { reasons: ['Asks you to log in to view'] } },
          { classification: 'phishing' }
        )}
        notBusiness={{ total: 27, newsletters: 19, pitches: 6, phishing: 2 }}
      />
    )
    expect(html).toContain('Flagged: phishing')
    expect(html).toContain('Asks you to log in to view')
    expect(html).toContain('The link was never opened and nothing was acted on.')
    expect(html).toMatch(
      /<a[^>]+href="https:\/\/mail\.google\.com\/[^"]+"[^>]*>[^<]*(<[^>]+>)*Report to Google/
    )
    expect(html).toContain('Also not business today · 27')
    expect(html).toContain('19 newsletters · 6 cold sales pitches · 2 phishing')
    expect(html).toContain('Labelled in Gmail only; never opened, never answered.')
  })
})

describe('board 97 states', () => {
  it('password-protected, stored-not-opened, unreadable, fetching and another language each render', () => {
    const html = renderToStaticMarkup(
      <MailStateNotes
        thread={thread({
          protectedFiles: ['RFQ_list.pdf'],
          oversized: [
            { name: 'drawings.zip', note: 'Stored, not opened: too large to read safely' },
          ],
          unreadable: ['broken.xls'],
          bodyPending: true,
          translation: { english: null, languageName: null },
        })}
      />
    )
    expect(html).toContain('RFQ_list.pdf is password-protected.')
    expect(html).toContain('Draft “Ask sender for an open copy”')
    expect(html).toContain('drawings.zip')
    expect(html).toContain('Stored, not opened: too large to read safely')
    expect(html).toContain('broken.xls could not be read here')
    expect(html).toContain('Fetching from Gmail…')
    expect(html).toContain('Original English')
  })

  it('once asked, the protected-file note points at the reply in Review', () => {
    const html = renderToStaticMarkup(
      <MailStateNotes
        thread={thread({ protectedFiles: ['a.pdf'] }, {}, [
          { ...resend, actionKey: 'ask_open_copy', options: [] },
        ])}
      />
    )
    expect(html).toContain('The reply waits in Review')
    expect(html).not.toContain('Draft “Ask sender')
  })
})
