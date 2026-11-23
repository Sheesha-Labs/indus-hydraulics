'use client'

import { Button } from '@indus/ops-ui/controls'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useId, useState, useTransition } from 'react'
import { saveSignatureAction } from '../../app/(console)/settings/sending/actions/sending'
import type { SignerView } from '../../data/sending'

/**
 * Board 87 signature blocks, one per sender (the Owner for sales@, the Helper for purchase@). Until one is
 * saved here the block shown is the mailbox's detected Gmail signature. Edit opens a plain-lines editor; the
 * sender's own name line is set bold, the stored HTML is sanitised and its text kept beside it.
 */
export default function SignatureBlocks({
  signers,
  version,
  canEdit,
}: {
  signers: SignerView[]
  version: number
  canEdit: boolean
}) {
  return (
    <div id="signatures" className="flex scroll-mt-6 flex-col gap-2">
      <div className="grid grid-cols-2 gap-4">
        {signers.map((s) => (
          <SignatureCard key={s.userId} signer={s} version={version} canEdit={canEdit} />
        ))}
      </div>
      <p className="text-io-ink-3 m-0 text-[12px]">
        Gmail does not add its own signature to mail the console sends, so these blocks are inserted
        by the console.
      </p>
    </div>
  )
}

function SignatureCard({
  signer,
  version,
  canEdit,
}: {
  signer: SignerView
  version: number
  canEdit: boolean
}) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState(signer.lines.join('\n'))
  const [error, setError] = useState<string | null>(null)
  const [pending, start] = useTransition()
  const { toast } = useToast()
  const router = useRouter()
  const fieldId = useId()

  function save() {
    setError(null)
    start(async () => {
      const res = await saveSignatureAction({
        userId: signer.userId,
        name: signer.name,
        lines: text.split('\n'),
        expectedVersion: version,
      })
      if (!res.success) {
        setError(res.error)
        return
      }
      setOpen(false)
      toast({ kind: 'success', title: `${signer.firstName}’s signature saved.` })
      router.refresh()
    })
  }

  const eyebrow = `Signature · ${signer.firstName}${signer.mailboxAddress ? ` · ${signer.mailboxAddress.split('@')[0]}@` : ''}`
  return (
    <section
      aria-label={eyebrow}
      className="bg-io-card border-io-line rounded-io-card flex min-h-[156px] flex-col gap-3 border px-4.5 py-4"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="io-eyebrow">{eyebrow}</span>
        {canEdit ? (
          <Modal
            open={open}
            onOpenChange={setOpen}
            title={`${signer.firstName}’s signature`}
            trigger={
              <Button variant="link" size="sm">
                Edit
              </Button>
            }
            note="One line per row. Your name is set in bold."
            actions={
              <>
                <Button variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" busy={pending} onClick={save}>
                  Save signature
                </Button>
              </>
            }
          >
            <div className="flex flex-col gap-2">
              <label htmlFor={fieldId} className="text-io-ink text-[12.5px] font-medium">
                Signature lines
              </label>
              <textarea
                id={fieldId}
                rows={7}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="io-focus-field border-io-stroke rounded-io-ctl bg-io-card text-io-ink w-full border px-3 py-2 text-[13px] leading-[1.55]"
              />
              {error ? (
                <p role="alert" className="text-io-bad m-0 text-[12.5px]">
                  {error}
                </p>
              ) : null}
            </div>
          </Modal>
        ) : null}
      </div>
      {signer.lines.length ? (
        <div className="text-io-ink text-[13px] leading-[1.55]">
          {signer.lines.map((line, i) => (
            <div
              key={`${i}-${line}`}
              className={line === signer.name ? 'font-semibold' : undefined}
            >
              {line}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-io-ink-3 m-0 text-[12.5px]">
          No signature yet. Emails go without one until you add it.
        </p>
      )}
      {!signer.saved && signer.lines.length ? (
        <span className="text-io-ink-3 text-[11.5px]">
          Detected from Gmail · not saved here yet
        </span>
      ) : null}
    </section>
  )
}
