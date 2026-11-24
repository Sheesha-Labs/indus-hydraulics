import { CLASS_LABEL, MAIL_CLASSES } from '@indus/ops-core'
import { ButtonLink } from '@indus/ops-ui/controls'
import { Chip } from '@indus/ops-ui/status'
import type { AssistantActionView, NotBusinessToday, ThreadView } from '../../data/mail'
import AssistantCard from './AssistantCard'
import ItsRealMenu from './ItsRealMenu'

/**
 * Board 96: what the Assistant made of an out-of-office reply, a bounce or a phishing email, above the
 * conversation. Decisions about a proposal (Send to…, Resend, Fix contact) happen on its Review card (S06);
 * here each option opens it. "Report to Google" only opens the thread in Gmail: no API call, nothing moved.
 */
const REAL_CLASSES = MAIL_CLASSES.filter(
  (c) => !['unclassified', 'phishing', 'bounce', 'auto_reply'].includes(c)
).map((c) => ({ value: c, label: CLASS_LABEL[c] }))

function openProposal(thread: ThreadView, key: string): AssistantActionView | undefined {
  return thread.actions.find(
    (a) => a.actionKey === key && (a.state === 'proposed' || a.state === 'later')
  )
}

function ProposalButtons({ action }: { action: AssistantActionView }) {
  const href = `/review?action=${action.ref}`
  return (
    <div className="flex flex-wrap gap-2">
      {action.options.map((o, i) => (
        <ButtonLink key={o.key} href={href} variant={i === 0 ? 'primary' : 'secondary'}>
          {o.label}
        </ButtonLink>
      ))}
    </div>
  )
}

function firstName(name: string | null, address: string): string {
  return name?.trim().split(/\s+/)[0] ?? address
}

export default function MailStateCards({
  thread,
  notBusiness,
}: {
  thread: ThreadView
  notBusiness: NotBusinessToday | null
}) {
  const l = thread.latest
  const s = l.state
  const who = l.from.name ?? l.from.address
  const resend = openProposal(thread, 'resend_alternate_contact')
  return (
    <>
      {s.ooo ? (
        <>
          <AssistantCard
            title={
              s.ooo.until
                ? `${who} out until ${s.ooo.until} (auto-reply)`
                : `${who} is away (auto-reply)`
            }
          >
            <p className="text-io-ink-2 text-[12.5px] leading-[1.5]">
              An automatic reply is never an answer or a regret: what we asked stays open
              {s.ooo.until ? ` until ${firstName(l.from.name, l.from.address)} is back` : ''}.
            </p>
            {resend && s.ooo.alternate ? (
              <div className="bg-io-fill rounded-io-ctl flex flex-col gap-2 px-3 py-2.5">
                <p className="text-[12.5px]">
                  Or send it to <span className="font-medium">{s.ooo.alternate.name}</span>, named
                  in the auto-reply?
                </p>
                <ProposalButtons action={resend} />
              </div>
            ) : null}
          </AssistantCard>
          <p className="flex items-center gap-2">
            <Chip
              tone="warn"
              label={s.ooo.until ? `Out of office · until ${s.ooo.until}` : 'Out of office'}
            />
          </p>
        </>
      ) : null}

      {s.bounce ? (
        <AssistantCard
          title={
            s.bounce.hard
              ? `Contact marked bad: ${s.bounce.recipient ?? 'the recipient'}`
              : `Delivery delayed: ${s.bounce.recipient ?? 'the recipient'}`
          }
        >
          <p className="text-io-ink-2 text-[12.5px] leading-[1.5]">
            {s.bounce.hard
              ? `Our email could not be delivered${s.bounce.diagnostic ? `: ${s.bounce.diagnostic}` : '.'}`
              : 'The server is still trying. It shows here only if nothing comes back within a day.'}
          </p>
          {resend ? <ProposalButtons action={resend} /> : null}
          {resend ? (
            <p className="text-io-ink-3 flex items-center gap-1.5 text-[11.5px]">
              <span className="border-io-line rounded-io-tag border px-1.5 py-0.5 text-[11px]">
                Asks you
              </span>
              first email to a new address
            </p>
          ) : null}
        </AssistantCard>
      ) : null}

      {s.phishing ? (
        <AssistantCard title="Flagged: phishing">
          {s.phishing.reasons.length ? (
            <p className="text-io-ink-2 text-[12.5px] leading-[1.5]">
              <span className="text-io-ink font-medium">Why:</span> {s.phishing.reasons.join('; ')}.
            </p>
          ) : null}
          <p className="text-io-ink-3 text-[12px]">
            The link was never opened and nothing was acted on.
          </p>
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={thread.gmailUrl} target="_blank" variant="secondary">
              Report to Google
            </ButtonLink>
            <ItsRealMenu messageId={l.id} classes={REAL_CLASSES} />
          </div>
        </AssistantCard>
      ) : null}

      {notBusiness &&
      (l.classification === 'not_business' || l.classification === 'phishing') &&
      notBusiness.total > 0 ? (
        <section
          aria-label="Also not business today"
          className="bg-io-card border-io-line rounded-io-card flex flex-col gap-1.5 border px-4 py-3"
        >
          <p className="io-eyebrow">Also not business today · {notBusiness.total}</p>
          <p className="text-[12.5px]">
            {[
              `${notBusiness.newsletters} newsletters`,
              `${notBusiness.pitches} cold sales pitches`,
              `${notBusiness.phishing} phishing`,
            ].join(' · ')}
          </p>
          <p className="text-io-ink-3 text-[12px]">
            Labelled in Gmail only; never opened, never answered.
          </p>
        </section>
      ) : null}
    </>
  )
}
