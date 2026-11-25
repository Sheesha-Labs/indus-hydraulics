'use client'

import { Button, ButtonLink } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import { Chip } from '@indus/ops-ui/status'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  continueFromEmailAction,
  startEmailIntakeAction,
} from '../../../app/(console)/mail/[folder]/[threadId]/read-lines/actions/email'
import type { EmailBlock, EmailLinesModel } from '../../../data/email-lines'

/**
 * Board 36 · Read lines from email (S08-T05). Left: the message as received — the table it carries framed as
 * "Table · n lines", a sentence read as a line framed as "Text · 1 line", the earlier reply greyed as "Ignored ·
 * earlier reply". Right: client, client ref and needed by with where each was found; the lines with Source and
 * confidence; each attachment queued as its own file. Arriving here opens the message's intake once.
 */
export default function EmailLinesWorkspace({ model: m }: { model: EmailLinesModel }) {
  const router = useRouter()
  const { toast } = useToast()
  const [busy, setBusy] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (m.batch || started.current) return
    started.current = true
    void startEmailIntakeAction({
      messageId: m.message.id,
      folder: m.folder,
      threadId: m.threadId,
    }).then((r) => {
      if (!r.success) toast({ kind: 'error', title: r.error })
      router.refresh()
    })
  }, [m.batch, m.message.id, m.folder, m.threadId, router, toast])

  async function next() {
    if (!m.batch) return
    setBusy(true)
    const r = await continueFromEmailAction({ batchId: m.batch.id })
    setBusy(false)
    if (!r.success) {
      toast({ kind: 'error', title: r.error })
      router.refresh()
      return
    }
    toast({
      kind: 'success',
      title: `${r.data.ref} created${r.data.unsure ? ` · ${r.data.unsure} line${r.data.unsure === 1 ? '' : 's'} to answer` : ''}`,
    })
    router.push(`/enquiries/${r.data.ref}` as Route)
  }

  const att = m.message.attachments.length
  return (
    <div data-built="intake-email" className="grid min-h-0 flex-1 grid-cols-[560px_minmax(0,1fr)]">
      <section aria-label="Email" className="bg-io-well flex min-h-0 min-w-0 flex-col">
        <p className="text-io-ink-2 m-0 flex flex-none items-center justify-between px-5 py-3 text-[12px]">
          <span>Email{att ? ` · ${att} attachment${att === 1 ? '' : 's'}` : ''}</span>
          <span>
            {m.sources} source{m.sources === 1 ? '' : 's'} found in body
          </span>
        </p>
        <div
          tabIndex={0}
          aria-label="Message"
          className="io-focus min-h-0 flex-1 overflow-y-auto px-5 pb-5"
        >
          <article className="rounded-io-card border-io-line bg-io-card border">
            <header className="border-io-line flex flex-col gap-1 border-b px-5 pt-5 pb-4">
              <h2 className="m-0 text-[18px] leading-[1.3] font-normal">{m.message.subject}</h2>
              <p className="m-0 mt-1.5 text-[12.5px]">
                <b className="font-semibold">{m.message.fromName ?? m.message.fromAddress}</b>
                {m.message.fromName ? (
                  <span className="text-io-ink-2"> &lt;{m.message.fromAddress}&gt;</span>
                ) : null}
              </p>
              <p className="text-io-ink-2 m-0 text-[12.5px]">
                To {m.message.to} · {m.message.sentAt}
              </p>
              {m.message.attachments.length ? (
                <ul className="m-0 mt-2 flex list-none flex-wrap gap-2 p-0">
                  {m.message.attachments.map((a) => (
                    <li
                      key={a.id}
                      className="rounded-io-ctl border-io-stroke inline-flex items-center gap-2 border px-2.5 py-1.5 text-[12.5px]"
                    >
                      <span className="text-io-bad text-[10.5px] font-semibold">{a.type}</span>
                      {a.name}
                      {a.size ? <span className="text-io-ink-2"> · {a.size}</span> : null}
                    </li>
                  ))}
                </ul>
              ) : null}
            </header>
            <div className="flex flex-col gap-2 px-5 pt-5 pb-5 text-[13px] leading-[20px]">
              {m.blocks.map((b, i) => (
                <Block key={i} block={b} textLines={m.textLines} />
              ))}
            </div>
          </article>
        </div>
      </section>

      <section aria-label="Lines read" className="bg-io-paper flex min-h-0 min-w-0 flex-col">
        <div
          tabIndex={0}
          aria-label="Facts and lines"
          className="io-focus min-h-0 flex-1 overflow-y-auto px-6 py-6"
        >
          <div className="flex flex-col gap-4">
            <dl className="rounded-io-card border-io-line bg-io-card m-0 grid grid-cols-3 gap-4 border px-5 py-[14px]">
              <Fact
                title="Client"
                value={m.facts.client?.name ?? null}
                sub={m.facts.client?.sub ?? 'Not matched yet'}
              />
              <Fact
                title="Client ref"
                value={m.facts.clientRef?.value ?? null}
                sub={m.facts.clientRef?.sub ?? 'Not found'}
              />
              <Fact
                title="Needed by"
                value={m.facts.neededBy?.date ?? null}
                sub={m.facts.neededBy ? `“${m.facts.neededBy.quote}”` : 'Not stated'}
              />
            </dl>

            <section
              aria-label="Lines"
              className="rounded-io-card border-io-line bg-io-card overflow-hidden border"
            >
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr className="border-io-line text-io-ink-3 border-b text-left text-[10.5px] tracking-[0.12em] uppercase">
                    <th scope="col" className="w-[40px] py-3 pl-5 font-medium">
                      #
                    </th>
                    <th scope="col" className="py-3 font-medium">
                      Description
                    </th>
                    <th scope="col" className="w-[150px] py-3 font-medium">
                      Part no.
                    </th>
                    <th scope="col" className="w-[44px] py-3 pr-2 text-right font-medium">
                      Qty
                    </th>
                    <th scope="col" className="w-[48px] py-3 font-medium">
                      UoM
                    </th>
                    <th scope="col" className="w-[70px] py-3 font-medium">
                      Source
                    </th>
                    <th scope="col" className="w-[66px] py-3 pr-5 font-medium">
                      Conf.
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {m.lines.map((l) => (
                    <tr key={l.id} className="border-io-line border-b align-top last:border-b-0">
                      <td className="text-io-ink-3 py-[11px] pl-5">{l.ord}</td>
                      <td className="max-w-0 py-[11px] pr-3">
                        <span className="block truncate" title={l.description}>
                          {l.description}
                        </span>
                        {l.note ? (
                          <span
                            className={`mt-1.5 block text-[12px] whitespace-nowrap ${l.tone === 'bad' ? 'text-io-bad' : 'text-io-warn'}`}
                          >
                            {l.note}
                          </span>
                        ) : null}
                      </td>
                      <td className="max-w-0 py-[11px] pr-2">
                        <span className="block truncate">{l.partNo ?? '—'}</span>
                      </td>
                      <td className="py-[11px] pr-2 text-right">{l.qty}</td>
                      <td className="text-io-ink-3 py-[11px]">{l.uom}</td>
                      <td className="py-[9px]">
                        <Chip
                          tone={
                            l.sourceTone === 'info' ? 'acc' : l.sourceTone === 'warn' ? 'warn' : 'n'
                          }
                          label={l.source}
                        />
                      </td>
                      <td className="py-[9px] pr-5">
                        <Chip tone={l.tone} label={l.label} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {m.lines.length ? null : (
                <p className="text-io-ink-3 m-0 px-5 py-6 text-[13px]">
                  {m.batch
                    ? 'Reading the message: lines appear here as they are read.'
                    : 'Opening the intake…'}
                </p>
              )}
            </section>

            {m.attachments.map((a) => (
              <section
                key={a.id}
                aria-label={`Attachment ${a.name}`}
                className="rounded-io-card border-io-line bg-io-card flex items-start justify-between gap-4 border px-5 py-4"
              >
                <span className="flex flex-col gap-1.5">
                  <span className="text-[13px] font-medium">{a.name}</span>
                  <span className="text-io-ink-2 text-[12px] leading-[1.5]">{a.note}</span>
                </span>
                <Chip tone={a.tone === 'info' ? 'acc' : a.tone} label={a.chip} />
              </section>
            ))}
            {m.unitsNote ? <p className="text-io-ink-2 m-0 text-[12.5px]">{m.unitsNote}</p> : null}
          </div>
        </div>
        <footer className="border-io-line bg-io-card flex flex-none items-center justify-between gap-3 border-t px-5 py-3.5">
          <span className="text-[13px]">
            {m.lineCount} line{m.lineCount === 1 ? '' : 's'} · {m.toCheck} to check
          </span>
          <span className="flex gap-2">
            {m.batch ? (
              <ButtonLink variant="secondary" href={`/enquiries/intake/${m.batch.id}` as Route}>
                Edit as table
              </ButtonLink>
            ) : null}
            <Button
              variant="primary"
              disabled={busy || !m.batch || !!m.blocker || m.reading}
              title={
                m.reading
                  ? 'Still reading the message and its attachments.'
                  : (m.blocker ?? undefined)
              }
              onClick={() => void next()}
            >
              Continue to match
            </Button>
          </span>
        </footer>
      </section>
    </div>
  )
}

function Fact({ title, value, sub }: { title: string; value: string | null; sub: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <dt className="text-io-ink-3 text-[10.5px] font-medium tracking-[0.12em] uppercase">
        {title}
      </dt>
      <dd className="m-0 truncate text-[13px] leading-[18px] font-medium">{value ?? '—'}</dd>
      <dd className="text-io-ink-2 m-0 truncate text-[12px] leading-[17px]">{sub}</dd>
    </div>
  )
}

function Label({ tone, children }: { tone: 'acc' | 'warn' | 'n'; children: string }) {
  const cls =
    tone === 'acc'
      ? 'bg-io-accent text-white'
      : tone === 'warn'
        ? 'bg-io-warn text-white'
        : 'bg-io-ink-3 text-white'
  return (
    <span className="flex justify-end">
      <span className={`rounded-io-tag px-2 py-0.5 text-[11.5px] font-medium ${cls}`}>
        {children}
      </span>
    </span>
  )
}

function Block({ block: b, textLines }: { block: EmailBlock; textLines: number }) {
  if (b.kind === 'table') {
    const [head, ...rows] = b.rows
    return (
      <div className="flex flex-col gap-1">
        <Label tone="acc">{`Table · ${b.lines} line${b.lines === 1 ? '' : 's'}`}</Label>
        <div className="rounded-io-card border-io-accent border-2 p-1">
          <table className="w-full border-collapse text-[12.5px]">
            {head ? (
              <thead>
                <tr className="bg-io-accent-tint">
                  {head.map((h, i) => (
                    <th
                      key={i}
                      scope="col"
                      className="border-io-line border px-2 py-[5px] text-left font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
            ) : null}
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {(head ?? r).map((_, j) => (
                    <td key={j} className="border-io-line border px-2 py-[5px]">
                      {r[j] ?? ''}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  if (b.kind === 'ignored')
    return (
      <div className="flex flex-col gap-1">
        <Label tone="n">Ignored · earlier reply</Label>
        <div className="rounded-io-card border-io-line text-io-ink-3 border border-dashed px-4 py-3 text-[12px] leading-[1.6] whitespace-pre-wrap">
          {b.text.length > 400 ? `${b.text.slice(0, 400)}…` : b.text}
        </div>
      </div>
    )
  // Plain text as paragraphs (a blank line is a paragraph gap), each line read from it framed.
  const paras: Array<{ start: number; end: number }> = []
  const re = /\n{2,}/g
  let from = 0
  for (const m of b.text.matchAll(re)) {
    paras.push({ start: from, end: m.index ?? 0 })
    from = (m.index ?? 0) + m[0].length
  }
  paras.push({ start: from, end: b.text.length })
  return (
    <div className="flex flex-col gap-3">
      {paras
        .filter((p) => b.text.slice(p.start, p.end).trim())
        .map((p) => {
          const pieces: Array<{ text: string; mark: boolean }> = []
          let at = p.start
          for (const mk of b.marks
            .map((x) => ({ start: x.start - b.start, end: x.end - b.start }))
            .filter((x) => x.start >= p.start && x.end <= p.end)
            .sort((x, y) => x.start - y.start)) {
            if (mk.start > at) pieces.push({ text: b.text.slice(at, mk.start), mark: false })
            pieces.push({ text: b.text.slice(mk.start, mk.end), mark: true })
            at = mk.end
          }
          pieces.push({ text: b.text.slice(at, p.end), mark: false })
          return (
            <p key={p.start} className="m-0 whitespace-pre-wrap">
              {pieces.map((x, i) =>
                x.mark ? (
                  <span key={i} className="relative inline-block">
                    <span className="absolute -top-5 right-0">
                      <Label tone="warn">{`Text · ${textLines} line${textLines === 1 ? '' : 's'}`}</Label>
                    </span>
                    <span className="rounded-io-tag border-io-warn border px-1">{x.text}</span>
                  </span>
                ) : (
                  <span key={i}>{x.text}</span>
                )
              )}
            </p>
          )
        })}
    </div>
  )
}
