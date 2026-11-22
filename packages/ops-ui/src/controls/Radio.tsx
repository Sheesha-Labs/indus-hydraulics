import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '../lib/cn'
import ControlLabel, { controlAria } from './ControlLabel'

export interface RadioOption<V extends string> {
  value: V
  label: ReactNode
  sub?: ReactNode
  disabled?: boolean
}

export interface RadioGroupProps<V extends string> {
  name: string
  legend: string
  options: RadioOption<V>[]
  /** Controlled with `onValueChange`; on its own it is the starting value. */
  value?: V
  defaultValue?: V
  onValueChange?: (v: V) => void
  /** Keep the legend for screen readers only (the surrounding card already names the group). */
  hideLegend?: boolean
  className?: string
}

export interface RadioProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'type' | 'children'
> {
  name: string
  value: string
  label?: ReactNode
  sub?: ReactNode
}

/**
 * Controls kit Radio: a native radio (appearance-none, 16 round, on = a 5px accent border). Shared.
 * Use RadioGroup for a set (fieldset + legend); Radio alone is for layouts that place each option apart.
 */
export function Radio({ label, sub, disabled, className, id: idProp, ...rest }: RadioProps) {
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
      <input
        {...rest}
        id={id}
        type="radio"
        {...(disabled === undefined ? {} : { disabled })}
        {...controlAria(id, { label, sub })}
        className="border-io-stroke rounded-io-pill bg-io-card io-focus checked:border-io-accent m-0 mt-px size-4 flex-none cursor-pointer appearance-none border checked:border-[5px]"
      />
      <ControlLabel id={id} label={label} sub={sub} />
    </span>
  )
}

/** A set of radios in a fieldset with its legend; arrow keys move between them natively. */
export default function RadioGroup<V extends string>({
  name,
  legend,
  options,
  value,
  defaultValue,
  onValueChange,
  hideLegend = false,
  className,
}: RadioGroupProps<V>) {
  return (
    <fieldset className={cn('m-0 flex flex-col gap-2.5 border-0 p-0', className)}>
      <legend
        className={cn(hideLegend ? 'sr-only' : 'text-io-ink-2 mb-2.5 p-0 text-[12px] font-medium')}
      >
        {legend}
      </legend>
      {options.map((o) => (
        <Radio
          key={o.value}
          name={name}
          value={o.value}
          label={o.label}
          {...(o.sub ? { sub: o.sub } : {})}
          {...(o.disabled ? { disabled: true } : {})}
          {...(onValueChange
            ? { checked: o.value === value, onChange: () => onValueChange(o.value) }
            : { defaultChecked: o.value === (value ?? defaultValue) })}
        />
      ))}
    </fieldset>
  )
}
