'use client'

import { Button, RadioGroup, Segmented } from '@indus/ops-ui/controls'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState, useTransition } from 'react'
import { getLinkSuggestions } from '../../actions/read/link-suggestions'
import { linkToAction } from '../../app/(console)/mail/actions/mail'
import type { LinkSuggestion } from '../../server/mail/suggest-links'

/**
 * Board 95 "Link to…" (Overlay · Modal): search clients, suppliers and our references; the suggestions with
 * their reasons (deterministic, no model); "Use this email as" Client reply · Supplier quote · Document · Just
 * keep; the primary names the choice ("Link to ENQ-2026-0416"). Opened from Mail by `?link=1`; closing drops
 * the param and focus returns to the page. A link replaces the message's other record links, which stay as
 * history.
 */
type UseAs = 'client_reply' | 'supplier_quote' | 'document' | 'just_keep'

const USE_AS: Array<{ value: UseAs; label: string }> = [
  { value: 'client_reply', label: 'Client reply' },
  { value: 'supplier_quote', label: 'Supplier quote' },
  { value: 'document', label: 'Document' },
  { value: 'just_keep', label: 'Just keep' },
]

export default function LinkToModal({
  messageId,
  title,
  defaultUseAs,
}: {
  messageId: string
  title: string
  defaultUseAs: UseAs
}) {
  const router = useRouter()
  const pathname = usePathname()
  const params = useSearchParams()
  const { toast } = useToast()
  const [q, setQ] = useState('')
  const [items, setItems] = useState<LinkSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [chosen, setChosen] = useState<string | null>(null)
  const [useAs, setUseAs] = useState<UseAs>(defaultUseAs)
  const [busy, setBusy] = useState(false)
  const [, start] = useTransition()
  const seq = useRef(0)

  // Suggestions, debounced 120 ms; a stale answer never replaces a newer one.
  useEffect(() => {
    const n = ++seq.current
    const t = setTimeout(async () => {
      const res = await getLinkSuggestions({ messageId, q })
      if (n !== seq.current) return
      setLoading(false)
      if (res.success) {
        setItems(res.data)
        setChosen((c) => (c && res.data.some((x) => x.key === c) ? c : (res.data[0]?.key ?? null)))
      } else toast({ kind: 'error', title: res.error })
    }, 120)
    return () => clearTimeout(t)
  }, [messageId, q, toast])

  function close() {
    const next = new URLSearchParams(params.toString())
    next.delete('link')
    const qs = next.toString()
    router.replace(`${pathname}${qs ? `?${qs}` : ''}` as never, { scroll: false })
  }

  const target = items.find((x) => x.key === chosen) ?? null
  const primary = target ? `Link to ${target.title.split(' · ')[0]}` : 'Link'

  async function submit() {
    if (!target) return
    setBusy(true)
    try {
      const res = await linkToAction({
        messageId,
        subjectType: target.subjectType,
        subjectId: target.subjectId,
        enquiryId: target.enquiryId,
        useAs,
      })
      if (!res.success) {
        toast({ kind: 'error', title: res.error })
        return
      }
      toast({ kind: 'success', title: `✓ Linked to ${target.title.split(' · ')[0]}` })
      close()
      start(() => router.refresh())
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal
      open
      onOpenChange={(open) => (open ? undefined : close())}
      title={title}
      width={560}
      actions={
        <>
          <Button variant="ghost" onClick={close}>
            Cancel
          </Button>
          <Button variant="primary" busy={busy} disabled={!target} onClick={() => void submit()}>
            {primary}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <label className="sr-only" htmlFor="link-search">
          Search
        </label>
        <input
          id="link-search"
          type="search"
          autoFocus
          value={q}
          onChange={(e) => {
            setLoading(true)
            setQ(e.target.value)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void submit()
            }
          }}
          placeholder="Search clients, suppliers, ENQ-, INDUS/Q, IH-RFQ-, client PO no."
          className="io-focus-field border-io-stroke rounded-io-ctl h-io-btn-lg bg-io-card text-io-ink placeholder:text-io-ink-3 w-full border px-3 text-[13px]"
        />
        <p className="io-eyebrow">{q ? 'Matches' : 'Suggested'}</p>
        {loading && items.length === 0 ? (
          <p className="text-io-ink-3 text-[12.5px]" aria-busy="true">
            Looking…
          </p>
        ) : items.length === 0 ? (
          <p className="text-io-ink-3 text-[12.5px]">
            Nothing matches. Try a company name or one of our references.
          </p>
        ) : (
          <RadioGroup
            name="link-target"
            legend="Link this email to"
            hideLegend
            value={chosen ?? ''}
            onValueChange={(v) => setChosen(v)}
            options={items.map((x) => ({ value: x.key, label: x.title, sub: x.detail }))}
          />
        )}
        <div className="border-io-line flex flex-col gap-2 border-t pt-3">
          <p className="text-[12.5px] font-medium">Use this email as</p>
          <Segmented
            aria-label="Use this email as"
            options={USE_AS}
            value={useAs}
            onValueChange={setUseAs}
          />
        </div>
      </div>
    </Modal>
  )
}
