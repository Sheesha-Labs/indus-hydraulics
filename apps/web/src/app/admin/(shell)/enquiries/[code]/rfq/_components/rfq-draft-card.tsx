'use client'

import { Button, Panel, StatusPill, ToastProvider, useToast } from '@indus/ui'
import * as React from 'react'

type Props = {
  supplierName: string
  country: string | null
  score: number
  email: string | null
  evidenceUrl: string | null
  subject: string
  body: string
  mailtoUrl: string | null
}

function Card(props: Props) {
  const { toast } = useToast()
  const [open, setOpen] = React.useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(`Subject: ${props.subject}\n\n${props.body}`)
      toast({ title: 'Draft copied', description: 'Paste it into your mail client.' })
    } catch {
      toast({ title: 'Could not copy', description: 'Select the text below instead.', tone: 'danger' })
    }
  }

  return (
    <Panel>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-medium text-ih-ink">{props.supplierName}</h2>
            <StatusPill tone={props.email ? 'good' : 'warn'} size="sm">
              {props.email ? 'Reachable' : 'No address'}
            </StatusPill>
          </div>
          <p className="font-mono text-[12px] text-ih-muted">
            {props.country ?? 'country unknown'} · score {props.score}
            {props.email ? ` · ${props.email}` : ''}
          </p>
          {props.evidenceUrl ? (
            <a
              className="text-[12px] text-ih-muted underline"
              href={props.evidenceUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              where this address came from
            </a>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <Button kind="outline" size="dense" onClick={() => setOpen((v) => !v)}>
            {open ? 'Hide draft' : 'Show draft'}
          </Button>
          <Button kind="outline" size="dense" onClick={copy}>
            Copy
          </Button>
          {props.mailtoUrl ? (
            <Button asChild kind="primary" size="dense">
              <a href={props.mailtoUrl}>Open in mail</a>
            </Button>
          ) : null}
        </div>
      </div>

      {open ? (
        <div className="mt-4 flex flex-col gap-2">
          <p className="font-mono text-[12px] text-ih-ink-2">{props.subject}</p>
          <pre className="max-h-[420px] overflow-auto whitespace-pre-wrap rounded-[6px] border border-ih-border bg-ih-surface-2 p-3 font-mono text-[12px] leading-relaxed text-ih-ink-2">
            {props.body}
          </pre>
        </div>
      ) : null}
    </Panel>
  )
}

export default function RfqDraftCard(props: Props) {
  return (
    <ToastProvider>
      <Card {...props} />
    </ToastProvider>
  )
}
