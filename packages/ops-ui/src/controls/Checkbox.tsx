import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../lib/cn'
import CheckboxInput from './CheckboxInput'
import ControlLabel, { controlAria } from './ControlLabel'

export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'checked'
> {
  checked?: boolean | 'mixed'
  label?: ReactNode
  /** 12px ink-3 line under the label, read as the description. */
  sub?: ReactNode
  /** Set by policy: navy, always checked, aria-disabled; the reason is read through aria-describedby. */
  locked?: { reason: string }
}

/**
 * Controls kit Checkbox: a native checkbox (appearance-none, 16, radius 4); checked and mixed are accent,
 * locked is navy. Shared; the input itself is the small client part (CheckboxInput) because 'mixed' is a
 * DOM property. The ✓ and – glyphs follow the input's own state through `peer-*`.
 */
export default function Checkbox({
  checked,
  label,
  sub,
  locked,
  disabled,
  className,
  id: idProp,
  ...rest
}: CheckboxProps) {
  const auto = useId()
  const id = idProp ?? auto
  return (
    <span
      className={cn(
        'inline-flex items-start gap-[9px] text-[13px] leading-[1.4]',
        disabled && 'pointer-events-none opacity-45',
        className
      )}
    >
      <span className="relative mt-px inline-grid size-4 flex-none">
        <CheckboxInput
          {...rest}
          id={id}
          {...(checked === undefined ? {} : { checked })}
          {...(disabled === undefined ? {} : { disabled })}
          locked={Boolean(locked)}
          {...controlAria(id, { label, sub, reason: locked?.reason })}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden place-items-center text-[10px] font-bold text-white peer-checked:grid"
        >
          ✓
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 hidden place-items-center text-[10px] font-bold text-white peer-data-[state=mixed]:grid"
        >
          –
        </span>
      </span>
      <ControlLabel id={id} label={label} sub={sub} reason={locked?.reason} />
    </span>
  )
}
