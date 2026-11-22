'use client'

import { err, ok, type Result } from '@indus/ops-core'
import { ActionForm, Dropzone, Field, Fields } from '@indus/ops-ui/form'

// Client islands for the Form specimen. ActionForm and Dropzone take functions (the action, the upload),
// which a server component cannot pass. Both are local stand-ins: nothing is posted or uploaded.

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

let uploads = 0
async function fakeUpload(): Promise<Result<{ fileId: string }>> {
  await wait(900)
  uploads += 1
  return ok({ fileId: `file-${uploads}` })
}

/** A working dropzone against a stand-in upload (20 MB limit, PDF/Excel/email). */
export function DropzoneDemo({ title, text }: { title: string; text: string }) {
  return (
    <Dropzone
      title={title}
      text={text}
      accept={['.pdf', '.xls', '.xlsx', '.csv', '.eml', '.msg']}
      upload={fakeUpload}
      name="fileIds"
    />
  )
}

async function saveLine(
  _previous: Result<{ saved: string }> | null,
  data: FormData
): Promise<Result<{ saved: string }>> {
  await wait(700)
  const raw = data.get('unitPrice')
  const price = typeof raw === 'string' ? raw.trim() : ''
  if (!price)
    return err('Check the highlighted fields.', {
      unitPrice: 'Enter a price or mark the line Regret',
    })
  return ok({ saved: price })
}

/** An ActionForm against a stand-in action: submit empty to see the field error. */
export function ActionFormDemo() {
  return (
    <ActionForm action={saveLine} submitLabel="Save line" busyLabel="Saving…">
      <Fields cols={2}>
        <Field
          type="money"
          currency="USD"
          name="unitPrice"
          label="Unit price"
          hint="Per unit, before VAT"
        />
        <Field type="text" name="lineNote" label="Line note" optional />
      </Fields>
    </ActionForm>
  )
}
