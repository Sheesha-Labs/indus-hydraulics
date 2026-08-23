/**
 * The small icon set the designed industry pages use.
 *
 * Ported from the handoff's inline set rather than pulled from a library: 24×24
 * viewBox, `fill: none`, `stroke: currentColor`, round caps and joins, 1.6
 * stroke — and 2.2–2.4 on the check marks, which are drawn at 13–15px and
 * would disappear at 1.6. There is no icon package in this workspace, and the
 * two icons already hand-rolled elsewhere (the market form's check, the header's
 * carets) share exactly this character.
 *
 * Every one is `aria-hidden` — each sits beside its own text label, so
 * announcing it would only repeat the label.
 */

type IconProps = { size?: number; className?: string }

function Icon({
  size = 16,
  strokeWidth = 1.6,
  className,
  children,
}: IconProps & { strokeWidth?: number; children: React.ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  )
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </Icon>
  )
}

export function DocIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5" />
    </Icon>
  )
}

export function MailIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </Icon>
  )
}

/** The bullet tick. Heavier stroke because it renders at 13–15px. */
export function CheckIcon({ size = 15, strokeWidth = 2.2, className }: IconProps & { strokeWidth?: number }) {
  return (
    <Icon size={size} strokeWidth={strokeWidth} className={className}>
      <path d="m5 12 5 5L20 7" />
    </Icon>
  )
}
