/**
 * @vitest-environment jsdom
 */
import { err, ok, type Result } from '@indus/ops-core'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { problemsIn } from '../guards/token-classes'
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  userEvent,
  waitFor,
  within,
} from '../lib/test-dom'
import ActionForm, { type FormAction } from './ActionForm'
import Dropzone, { formatBytes, isAccepted, MAX_UPLOAD_BYTES, type UploadFile } from './Dropzone'
import Field from './Field'
import Fields from './Fields'
import FormSection from './FormSection'

afterEach(cleanup)

function tokensOk(container: HTMLElement) {
  expect(container.querySelector('[style]')).toBeNull()
  for (const el of container.querySelectorAll<HTMLElement>('[class]'))
    expect(problemsIn(el.getAttribute('class') ?? '')).toEqual([])
}

/** A File that reports `size` bytes without allocating them. */
function fakeFile(name: string, type: string, size: number): File {
  const file = new File(['x'], name, { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

describe('Field', () => {
  it('an error replaces the hint, sets aria-invalid and is the control’s description', () => {
    const { container } = render(
      <Field
        type="money"
        currency="USD"
        name="unitPrice"
        label="Unit price"
        required
        hint="Per unit, before VAT"
        error="Enter a price or mark the line Regret"
      />
    )
    const input = screen.getByRole('textbox', { name: /Unit price/ })
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toBeRequired()
    expect(input).toHaveAccessibleDescription(/Enter a price or mark the line Regret/)
    expect(input).toHaveAccessibleDescription(/USD/)
    expect(screen.queryByText('Per unit, before VAT')).toBeNull()
    expect(input).toHaveAttribute('inputmode', 'decimal')
    expect(input).toHaveClass('text-right')
    tokensOk(container)
  })

  it('without an error the hint describes the control and aria-invalid is absent', () => {
    render(
      <Field type="text" name="deadline" label="Client deadline" hint="From the client email" />
    )
    const input = screen.getByRole('textbox', { name: 'Client deadline' })
    expect(input).not.toHaveAttribute('aria-invalid')
    expect(input).toHaveAccessibleDescription('From the client email')
  })

  it('money requires a currency and select requires options, at the type level', () => {
    // @ts-expect-error a money field without a currency is a type error
    const money = <Field type="money" name="price" label="Price" />
    // @ts-expect-error a select without options is a type error
    const select = <Field type="select" name="incoterm" label="Incoterm" />
    // @ts-expect-error currency belongs to money only
    const text = <Field type="text" name="ref" label="Ref" currency="USD" />
    expect([money, select, text]).toHaveLength(3)
  })

  it('renders each type with its native control, uncontrolled', () => {
    render(
      <Fields cols={3}>
        <Field type="number" name="margin" label="Margin" suffix="%" defaultValue="12" />
        <Field
          type="select"
          name="incoterm"
          label="Incoterm"
          defaultValue="dap"
          options={[
            { value: 'exw', label: 'EXW' },
            { value: 'dap', label: 'DAP site' },
          ]}
        />
        <Field type="date" name="due" label="Due" defaultValue="2026-09-30" />
        <Field type="textarea" name="note" label="Note to supplier" optional />
        <Field type="email" name="email" label="Email" />
      </Fields>
    )
    expect(screen.getByRole('textbox', { name: 'Margin' })).toHaveValue('12')
    expect(screen.getByRole('combobox', { name: 'Incoterm' })).toHaveValue('dap')
    expect(screen.getByLabelText('Due')).toHaveAttribute('type', 'date')
    expect(screen.getByLabelText('Due')).toHaveValue('2026-09-30')
    expect(screen.getByRole('textbox', { name: /Note to supplier/ }).tagName).toBe('TEXTAREA')
    expect(screen.getByRole('textbox', { name: 'Email' })).toHaveAttribute('type', 'email')
  })

  it('readonly, disabled and assistant states', () => {
    render(
      <>
        <Field type="text" name="a" label="Read only" state="readonly" defaultValue="x" />
        <Field type="text" name="b" label="Disabled" state="disabled" defaultValue="x" />
        <Field
          type="text"
          name="c"
          label="Filled"
          state="assistant"
          assistantSource={{ evidenceId: 'ev-1' }}
          hint="From the client email"
        />
      </>
    )
    expect(screen.getByRole('textbox', { name: 'Read only' })).toHaveAttribute('readonly')
    expect(screen.getByRole('textbox', { name: 'Disabled' })).toBeDisabled()
    const filled = screen.getByRole('textbox', { name: 'Filled' })
    expect(filled).toHaveAccessibleDescription(/Assistant/)
    expect(screen.getByRole('link', { name: 'Why?' })).toHaveAttribute('href', '/why/ev-1')
  })

  it('FormSection is a group named by its title', () => {
    render(
      <FormSection title="Company" description="Printed on every quotation." cols={3}>
        <Field type="text" name="name" label="Company name" />
      </FormSection>
    )
    const group = screen.getByRole('group', { name: 'Company' })
    expect(within(group).getByRole('textbox', { name: 'Company name' })).toBeInTheDocument()
  })
})

describe('Dropzone', () => {
  const props = {
    title: 'Drop the supplier’s offer here',
    text: 'PDF, Excel or email.',
    accept: ['.pdf', '.xlsx', 'message/rfc822'],
  }

  it('refuses a 21 MB file without calling upload', () => {
    const upload = vi.fn<UploadFile>(async () => ok({ fileId: 'f1' }))
    const { container } = render(<Dropzone {...props} upload={upload} />)
    const input = container.querySelector<HTMLInputElement>('input[type=file]')!
    fireEvent.change(input, {
      target: { files: [fakeFile('offer.pdf', 'application/pdf', 21 * 1024 * 1024)] },
    })
    expect(upload).not.toHaveBeenCalled()
    const row = screen.getByRole('listitem')
    expect(within(row).getByRole('status')).toHaveTextContent('Over 20 MB')
    expect(row).toHaveTextContent('21.0 MB')
    tokensOk(container)
  })

  it('refuses a type outside the accept list without calling upload', () => {
    const upload = vi.fn<UploadFile>(async () => ok({ fileId: 'f1' }))
    const { container } = render(<Dropzone {...props} upload={upload} />)
    fireEvent.drop(container.querySelector('[data-part=dropzone-frame]')!, {
      dataTransfer: { files: [fakeFile('setup.exe', 'application/x-msdownload', 10)] },
    })
    expect(upload).not.toHaveBeenCalled()
    expect(screen.getByRole('listitem')).toHaveTextContent('Not an accepted file type')
  })

  it('the Choose files button opens the picker from the keyboard', async () => {
    const { container } = render(<Dropzone {...props} upload={vi.fn<UploadFile>()} />)
    const input = container.querySelector<HTMLInputElement>('input[type=file]')!
    expect(input).not.toHaveAttribute('name')
    const opened = vi.fn<(e: Event) => void>((e) => e.preventDefault())
    input.addEventListener('click', opened)
    const button = screen.getByRole('button', { name: 'Choose files' })
    button.focus()
    await userEvent.keyboard('{Enter}')
    expect(opened).toHaveBeenCalledTimes(1)
  })

  it('uploads an accepted file and posts only its id', async () => {
    let finish: (r: Result<{ fileId: string }>) => void = () => {}
    const upload = vi.fn<UploadFile>(
      () => new Promise<Result<{ fileId: string }>>((resolve) => (finish = resolve))
    )
    const onUploaded = vi.fn<(file: { name: string; fileId: string }) => void>()
    const { container } = render(
      <Dropzone {...props} name="fileIds" upload={upload} onUploaded={onUploaded} />
    )
    const input = container.querySelector<HTMLInputElement>('input[type=file]')!
    fireEvent.change(input, { target: { files: [fakeFile('offer.pdf', 'application/pdf', 2048)] } })
    expect(upload).toHaveBeenCalledTimes(1)
    expect(screen.getByRole('listitem')).toHaveTextContent('Uploading…')
    await act(async () => finish(ok({ fileId: 'file-1' })))
    expect(screen.getByRole('listitem')).toHaveTextContent('Uploaded')
    expect(onUploaded).toHaveBeenCalledWith({ name: 'offer.pdf', fileId: 'file-1' })
    expect(container.querySelector('input[type=hidden][name=fileIds]')).toHaveValue('file-1')
    await userEvent.click(screen.getByRole('button', { name: 'Remove offer.pdf' }))
    expect(screen.queryByRole('listitem')).toBeNull()
  })

  it('shows the upload’s safe error when it fails', async () => {
    const upload = vi.fn<UploadFile>(async () => err('Storage is not reachable. Try again.'))
    const { container } = render(<Dropzone {...props} upload={upload} />)
    const input = container.querySelector<HTMLInputElement>('input[type=file]')!
    await act(async () => {
      fireEvent.change(input, {
        target: { files: [fakeFile('offer.xlsx', 'application/vnd.ms-excel', 10)] },
      })
    })
    expect(screen.getByRole('listitem')).toHaveTextContent('Storage is not reachable. Try again.')
  })

  it('announces the drag state', () => {
    const { container } = render(<Dropzone {...props} upload={vi.fn<UploadFile>()} />)
    const frame = container.querySelector<HTMLElement>('[data-part=dropzone-frame]')!
    fireEvent.dragEnter(frame, { dataTransfer: { items: [{}, {}], files: [] } })
    expect(frame).toHaveAttribute('data-state', 'over')
    expect(frame).toHaveTextContent('Release to add 2 files')
    expect(container.querySelector('[aria-live=polite]')).toHaveTextContent(
      'Release to add 2 files'
    )
    fireEvent.dragLeave(frame)
    expect(frame).toHaveAttribute('data-state', 'ready')
  })

  it('helpers: size label, accept patterns, the C19 limit', () => {
    expect(MAX_UPLOAD_BYTES).toBe(20 * 1024 * 1024)
    expect(formatBytes(512)).toBe('512 B')
    expect(formatBytes(340 * 1024)).toBe('340 KB')
    expect(formatBytes(1.25 * 1024 * 1024)).toBe('1.3 MB')
    expect(isAccepted({ name: 'A.PDF', type: '' }, ['.pdf'])).toBe(true)
    expect(isAccepted({ name: 'a.png', type: 'image/png' }, ['image/*'])).toBe(true)
    expect(isAccepted({ name: 'a.txt', type: 'text/plain' }, ['.pdf', 'image/*'])).toBe(false)
    expect(isAccepted({ name: 'a.txt', type: 'text/plain' }, [])).toBe(true)
  })
})

describe('ActionForm', () => {
  it('maps fieldErrors onto fields by name and shows the form error', async () => {
    const action = vi.fn<FormAction<{ id: string }>>(async (_prev, data) => {
      expect(data.get('unitPrice')).toBe('')
      return err('Check the highlighted fields.', { unitPrice: 'Enter a price' })
    })
    render(
      <ActionForm action={action} submitLabel="Save">
        <Field type="money" currency="USD" name="unitPrice" label="Unit price" hint="Per unit" />
        <Field type="text" name="note" label="Note" />
      </ActionForm>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    expect(action).toHaveBeenCalledTimes(1)
    const price = screen.getByRole('textbox', { name: 'Unit price' })
    // useActionState settles after the click resolves; wait for the result, do not race it.
    await waitFor(() => expect(price).toHaveAttribute('aria-invalid', 'true'))
    expect(price).toHaveAccessibleDescription(/Enter a price/)
    expect(screen.getByRole('textbox', { name: 'Note' })).not.toHaveAttribute('aria-invalid')
    expect(screen.getByText('Check the highlighted fields.')).toBeInTheDocument()
  })

  it('the submit button is busy while the action is pending; success calls onSuccess', async () => {
    let finish: (r: Result<{ id: string }>) => void = () => {}
    const action = vi.fn<FormAction<{ id: string }>>(
      () => new Promise<Result<{ id: string }>>((resolve) => (finish = resolve))
    )
    const onSuccess = vi.fn<(data: { id: string }) => void>()
    render(
      <ActionForm action={action} submitLabel="Save" busyLabel="Saving…" onSuccess={onSuccess}>
        <Field type="text" name="note" label="Note" defaultValue="hello" />
      </ActionForm>
    )
    await userEvent.click(screen.getByRole('button', { name: 'Save' }))
    const busy = screen.getByRole('button', { name: 'Saving…' })
    expect(busy).toHaveAttribute('aria-busy', 'true')
    await act(async () => finish(ok({ id: 'r1' })))
    expect(onSuccess).toHaveBeenCalledWith({ id: 'r1' })
    expect(screen.getByRole('button', { name: 'Save' })).not.toHaveAttribute('aria-busy')
  })
})
