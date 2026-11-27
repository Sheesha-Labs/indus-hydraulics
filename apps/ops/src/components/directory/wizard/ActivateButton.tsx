'use client'

import { Button } from '@indus/ops-ui/controls'
import { useToast } from '@indus/ops-ui/overlay'
import type { Route } from 'next'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { activateSupplierAction } from '../../../app/(console)/suppliers/new/actions/line-card'

/** Board 52's one primary: activate the approved supplier with its line card (refused without a decision). */
export default function ActivateButton({
  supplierId,
  disabled,
}: {
  supplierId: string
  disabled: boolean
}) {
  const [busy, setBusy] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  return (
    <Button
      variant="primary"
      disabled={busy || disabled}
      onClick={() =>
        void (async () => {
          setBusy(true)
          const r = await activateSupplierAction({ supplierId })
          setBusy(false)
          if (!r.success) {
            toast({ kind: 'error', title: r.error })
            return
          }
          toast({
            kind: 'success',
            title: `Supplier active with ${r.data.categories} categor${r.data.categories === 1 ? 'y' : 'ies'}`,
          })
          router.push(`/suppliers/${supplierId}` as Route)
        })()
      }
    >
      Activate supplier
    </Button>
  )
}
