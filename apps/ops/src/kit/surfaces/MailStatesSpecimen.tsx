import type { ReactNode } from 'react'
import { ToastProvider } from '@indus/ops-ui/overlay'
import { Banner } from '@indus/ops-ui/status'
import AssistantCard from '../../components/mail/AssistantCard'
import CaughtUp from '../../components/mail/CaughtUp'
import MailStateCards from '../../components/mail/MailStateCards'
import MailStateNotes from '../../components/mail/MailStateNotes'
import TranslationToggle from '../../components/mail/TranslationToggle'
import type { AssistantActionView, MailStateView, ThreadView } from '../../data/mail'

/**
 * Boards 96 and 97 as sheets: each case in its own column or card, drawn with the components the Mail view
 * uses. Fictional mail on example.test only.
 */
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
  latest: Partial<ThreadView['latest']>,
  actions: AssistantActionView[] = []
): ThreadView {
  return {
    id: '00000000-0000-7000-8000-000000000001',
    subject: 'Specimen',
    mailbox: { id: 'm', address: 'purchase@example.test', role: 'supplier' },
    gmailUrl: 'https://mail.google.com/mail/u/?authuser=purchase%40example.test#all/specimen',
    latest: {
      id: '00000000-0000-7000-8000-000000000002',
      classification: 'auto_reply',
      confidence: 'sure',
      note: null,
      type: null,
      classLabel: '',
      handledState: 'handled',
      from: { name: 'Gina Ferro', address: 'g.ferro@valve-maker.example' },
      rfcMessageId: null,
      referencesRfcIds: [],
      state: { ...NONE, ...state },
      ...latest,
    },
    records: [],
    messages: [],
    earlier: 0,
    collapsedAfterFirst: false,
    crossMailbox: null,
    mailboxesInThread: [],
    total: 1,
    actions,
    levelWord: '',
  }
}

const proposal = (options: Array<{ key: string; label: string }>): AssistantActionView => ({
  id: 'p',
  ref: 'A-KIT-0001',
  time: '09:12',
  headline: '',
  state: 'proposed',
  surface: 'review',
  actionKey: 'resend_alternate_contact',
  options,
})

function Mark({ children }: { children: ReactNode }) {
  return <mark className="bg-io-mark text-io-ink rounded-io-tag px-0.5">{children}</mark>
}

function Excerpt({
  from,
  subject,
  children,
}: {
  from: string
  subject: string
  children: ReactNode
}) {
  return (
    <section className="bg-io-card border-io-line rounded-io-card flex flex-col gap-1.5 border px-4 py-3.5">
      <p className="text-io-ink-3 text-[12.5px]">{from}</p>
      <p className="text-[13px] font-medium">{subject}</p>
      <p className="text-io-ink-2 text-[13px] leading-[1.55]">{children}</p>
    </section>
  )
}

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="io-eyebrow">{title}</p>
      {children}
    </div>
  )
}

function Board96() {
  return (
    <div className="grid grid-cols-3 gap-[22px] px-8 py-7">
      <Column title="Out of office">
        <Excerpt
          from="Gina Ferro <g.ferro@valve-maker.example> · automatic reply"
          subject="Automatic reply: RE: IH-RFQ-2611-P05"
        >
          I am out of the office <Mark>until 21 September</Mark>. For urgent matters please contact{' '}
          <Mark>Alex Example, alex@valve-maker.example</Mark>.
        </Excerpt>
        <MailStateCards
          thread={thread(
            {
              ooo: {
                until: '21 Sep',
                alternate: { name: 'Alex Example', email: 'alex@valve-maker.example' },
              },
            },
            {},
            [
              proposal([
                { key: 'send', label: 'Send to Alex' },
                { key: 'wait', label: 'Wait for Gina' },
              ]),
            ]
          )}
          notBusiness={null}
        />
      </Column>
      <Column title="Bounce">
        <Excerpt from="Mail Delivery Subsystem" subject="Delivery Status Notification (Failure)">
          Your message to <strong className="font-medium">m.alvarez@seal-maker.example</strong>{' '}
          couldn’t be delivered. <Mark>Address not found.</Mark>
        </Excerpt>
        <MailStateCards
          thread={thread(
            {
              bounce: {
                hard: true,
                recipient: 'm.alvarez@seal-maker.example',
                diagnostic: 'Address not found',
              },
            },
            { classification: 'bounce' },
            [
              proposal([
                { key: 'send', label: 'Resend to quotes@' },
                { key: 'fix', label: 'Fix contact' },
              ]),
            ]
          )}
          notBusiness={null}
        />
      </Column>
      <Column title="Not business">
        <Excerpt
          from="“Procurement Portal” <noreply@bid-docs-share.example>"
          subject="New RFQ — log in to view documents"
        >
          You have received a new RFQ from{' '}
          <strong className="font-medium">0ILFIELD Procurement</strong>.{' '}
          <Mark>Click here and sign in with your email password to view the documents.</Mark>
        </Excerpt>
        <MailStateCards
          thread={thread(
            {
              phishing: {
                reasons: [
                  'asks you to log in to view an RFQ, a common phishing pattern',
                  'the sender domain is 3 days old and the company name is misspelt (zero for O)',
                ],
              },
            },
            { classification: 'phishing' }
          )}
          notBusiness={{ total: 27, newsletters: 19, pitches: 6, phishing: 2 }}
        />
      </Column>
    </div>
  )
}

function Cell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-io-card border-io-line rounded-io-card flex flex-col gap-3 border px-4 py-4">
      <p className="io-eyebrow">{title}</p>
      {children}
    </section>
  )
}

function Board97() {
  const row = (text: string) => (
    <p className="border-io-line rounded-io-ctl border px-3 py-2 text-[12.5px]">{text}</p>
  )
  return (
    <div className="grid grid-cols-4 items-start gap-[18px] px-8 py-7">
      <Cell title="Empty · all caught up">
        <CaughtUp today={64} />
      </Cell>
      <Cell title="Loading thread">
        <MailStateNotes thread={thread({ bodyPending: true }, {})} />
      </Cell>
      <Cell title="Attachment can’t be read">
        <MailStateNotes
          thread={thread(
            { protectedFiles: ['RFQ_list.pdf'] },
            { classification: 'client_enquiry' }
          )}
        />
      </Cell>
      <Cell title="Huge thread">
        {row('Omar Example · 14 Sep')}
        <p className="border-io-line text-io-accent rounded-io-ctl border border-dashed px-3 py-2 text-center text-[12.5px]">
          57 earlier messages · show
        </p>
        {row('Krishna Example · 22 Sep')}
        {row('Omar Example · today')}
      </Cell>
      <Cell title="Mailbox disconnected">
        <Banner tone="bad" icon="bad" title="sales@ disconnected 09:12." announce={false}>
          Client mail is not being read.
        </Banner>
        <p className="text-io-ink-3 text-[12px]">Same banner as board 89.</p>
      </Cell>
      <Cell title="Thread spans both mailboxes">
        <p className="flex flex-wrap items-center gap-1.5 text-[12.5px]">
          <span className="bg-io-info-tint text-io-info rounded-io-pill px-2 py-0.5 text-[11px]">
            sales@
          </span>
          <span className="bg-io-fill text-io-ink-2 rounded-io-pill px-2 py-0.5 text-[11px]">
            purchase@
          </span>
          RE: Site spares · 7 messages
        </p>
        <p className="text-io-ink-3 text-[12px]">
          Client messages came to sales@; the forward went to purchase@. Shown as one conversation.
        </p>
      </Cell>
      <Cell title="Arabic or Chinese email">
        <TranslationToggle
          messageId="00000000-0000-7000-8000-000000000003"
          english="“Please send your price for 20 sets of seal kits for the hydraulic cylinders, delivery to the port.”"
          languageName="Arabic"
          initialView="english"
        />
      </Cell>
    </div>
  )
}

export default function MailStatesSpecimen({ board }: { board: '96' | '97' }) {
  return (
    <ToastProvider>
      <main className="bg-io-ground min-h-[940px] w-[1440px]">
        {board === '96' ? <Board96 /> : <Board97 />}
      </main>
    </ToastProvider>
  )
}
