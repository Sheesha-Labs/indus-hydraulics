'use client'

import { Button } from '@indus/ops-ui/controls'
import { Modal, useToast } from '@indus/ops-ui/overlay'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { addRuleAction } from '../../app/(console)/assistant/learned/actions/learned'

/**
 * Board 115 "+ Add a rule yourself" (S07-T05): a manual preference, used at once (no batch), linted like a
 * learned one. For everyone, or for one client or supplier.
 */
export default function AddRule({ companies }: { companies: { id: string; name: string }[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [scope, setScope] = useState<'global' | 'client' | 'supplier'>('global')
  const [companyId, setCompanyId] = useState('')
  async function save() {
    const res = await addRuleAction({
      description: text,
      scope,
      ...(scope === 'global' ? {} : { companyId: companyId || null }),
    })
    if (!res.success) {
      toast({ kind: 'error', title: res.error })
      return
    }
    toast({ kind: 'success', title: 'Rule added' })
    setOpen(false)
    setText('')
    router.refresh()
  }
  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>
        + Add a rule yourself
      </Button>
      {open ? (
        <Modal
          open
          onOpenChange={setOpen}
          title="Add a rule yourself"
          actions={
            <>
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => void save()}>
                Add rule
              </Button>
            </>
          }
        >
          <div className="flex flex-col gap-3 text-[13px]">
            <label className="flex flex-col gap-1.5">
              The rule, in one sentence
              <textarea
                rows={3}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="io-focus-field rounded-io-ctl border-io-stroke border px-2.5 py-2"
              />
            </label>
            <label className="flex flex-col gap-1.5">
              Applies to
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as typeof scope)}
                className="io-focus-field rounded-io-ctl border-io-stroke bg-io-card h-9 border px-2.5"
              >
                <option value="global">Everyone</option>
                <option value="client">One client</option>
                <option value="supplier">One supplier</option>
              </select>
            </label>
            {scope !== 'global' ? (
              <label className="flex flex-col gap-1.5">
                {scope === 'client' ? 'Client' : 'Supplier'}
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="io-focus-field rounded-io-ctl border-io-stroke bg-io-card h-9 border px-2.5"
                >
                  <option value="">Choose…</option>
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
            <p className="text-io-ink-3 m-0 text-[12px]">
              Wording and choices only: a rule never changes a level, an approval, a check or money.
            </p>
          </div>
        </Modal>
      ) : null}
    </>
  )
}
