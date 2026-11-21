import type { ReactNode } from 'react'

interface ControlLabelProps {
  /** The control's id. */
  id: string
  label?: ReactNode
  sub?: ReactNode
  /** Read-only reason (locked controls), for screen readers only. */
  reason?: string | undefined
}

/**
 * The text beside a Toggle, Checkbox or Radio (kit `kc-row` span + small). One <label> holds the label and
 * the 12px sub line, so a click anywhere on the text works the control, and both count as the text of a
 * disabled control (WCAG exempts it; axe skips a disabled control's label but not a loose sibling). The
 * control takes its name from the label span alone and its description from the sub line and the reason:
 * see controlAria.
 */
export default function ControlLabel({ id, label, sub, reason }: ControlLabelProps) {
  if (!label && !sub && !reason) return null
  return (
    <label htmlFor={id} className="flex cursor-pointer flex-col">
      {label ? <span id={`${id}-label`}>{label}</span> : null}
      {sub ? (
        <small id={`${id}-sub`} className="text-io-ink-3 block text-[12px] leading-[1.45]">
          {sub}
        </small>
      ) : null}
      {reason ? (
        <span id={`${id}-reason`} className="sr-only">
          {reason}
        </span>
      ) : null}
    </label>
  )
}

/** aria-labelledby / aria-describedby for a control rendered with ControlLabel. */
export function controlAria(
  id: string,
  { label, sub, reason }: { label?: ReactNode; sub?: ReactNode; reason?: string | undefined }
): { 'aria-labelledby'?: string; 'aria-describedby'?: string } {
  const describedBy = [sub ? `${id}-sub` : '', reason ? `${id}-reason` : '']
    .filter(Boolean)
    .join(' ')
  return {
    ...(label ? { 'aria-labelledby': `${id}-label` } : {}),
    ...(describedBy ? { 'aria-describedby': describedBy } : {}),
  }
}
