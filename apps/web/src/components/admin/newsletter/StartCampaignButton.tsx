'use client'

import { Button, type ButtonProps } from '@indus/ui'
import { useState, useTransition } from 'react'

import { createCampaignAction } from '../../../app/admin/(shell)/newsletter/campaign-actions'
import type { Starter } from '../../../lib/newsletter/starters'

type Props = {
  input: { starter: Starter } | { templateId: string } | { duplicateOf: string }
  label: string
  kind?: ButtonProps['kind']
}

/** Creates a draft and opens it (the action redirects). */
export default function StartCampaignButton({ input, label, kind = 'outline' }: Props) {
  const [pending, start] = useTransition()
  const [error, setError] = useState<string | null>(null)
  return (
    <span className="inline-flex items-center gap-2">
      <Button
        type="button"
        kind={kind}
        size="dense-sm"
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await createCampaignAction(input)
            if (r && !r.success) setError(r.message)
          })
        }
      >
        {pending ? 'Opening…' : label}
      </Button>
      {error ? (
        <span role="alert" className="text-[12.5px] text-ih-danger-ink">
          {error}
        </span>
      ) : null}
    </span>
  )
}
