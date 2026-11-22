import { useId } from 'react'
import { cn } from '../lib/cn'
import FieldControl from './FieldControl'
import type { FieldProps } from './types'

/**
 * Form kit Field (`kf-fl`): a 12/500 label over a 36px control and an 11.5px hint. Shared: the label and
 * column render on the server; the control is a small client part (FieldControl) only so it can read the
 * enclosing ActionForm's field errors. Uncontrolled (`defaultValue`), so it posts with FormData.
 *
 * Types: text, email, number and money (right-aligned, decimal keypad, money prefixed by its currency and
 * parsed on the server from the decimal string), date (native input, posts ISO), select (native), textarea.
 */
export default function Field(props: FieldProps) {
  const generated = useId()
  const id = props.id ?? generated
  const { label, required = false, optional = false, className } = props
  return (
    <div data-part="field" className={cn('flex w-full min-w-0 flex-col gap-1.5', className)}>
      <label
        htmlFor={id}
        className="text-io-ink-2 flex items-baseline gap-1.5 text-[12px] leading-[1.45] font-medium"
      >
        {label}
        {required ? (
          <span aria-hidden="true" className="text-io-bad-solid">
            *
          </span>
        ) : null}
        {/* ink-3, not the kit's ink-4: axe fails ink-4 text on white (2.8:1). */}
        {optional && !required ? <span className="text-io-ink-3 font-normal">optional</span> : null}
      </label>
      <FieldControl {...props} id={id} />
    </div>
  )
}
