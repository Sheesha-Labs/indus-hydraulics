/**
 * The small icon set the designed pages use.
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

export function UploadIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8l-5-5-5 5" />
      <path d="M12 3v13" />
    </Icon>
  )
}

/** A dial at three-quarter sweep — the engineering-evaluation step. */
export function GaugeIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3.5 17a9 9 0 1 1 17 0" />
      <path d="M12 17l4.5-5" />
      <circle cx="12" cy="17" r="1.2" />
    </Icon>
  )
}

export function WrenchIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M15.5 3.5a5.5 5.5 0 0 0-6.9 6.9L3.6 15.4a2 2 0 0 0 0 2.8l2.2 2.2a2 2 0 0 0 2.8 0l5-5a5.5 5.5 0 0 0 6.9-6.9l-3.2 3.2-3-3z" />
    </Icon>
  )
}

export function SettingsIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M12 2.5v2.4M12 19.1v2.4M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7" />
    </Icon>
  )
}

export function TruckIcon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 6.5h10.5v9H3z" />
      <path d="M13.5 10h3.8l2.7 3v2.5h-6.5z" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
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
