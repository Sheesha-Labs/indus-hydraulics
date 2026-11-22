// Shared types for every Ops kit (05-map-frontend §3.0). Kits import from here; nothing here renders.
import type { ComponentType, SVGProps } from 'react'

export type Tone = 'ok' | 'warn' | 'bad' | 'n' | 'acc' | 'navy' | 'out' | 'solid-ok' | 'solid-bad'
export type MarkTone = 'ok' | 'warn' | 'bad' | 'n' | 'acc' | 'run' | 'todo'
export type BarTone = 'acc' | 'ok' | 'warn' | 'bad' | 'navy'
export type ChartTone = BarTone | 'n' | 'l' /* accent-line */
export type Size3 = 'sm' | 'md' | 'lg'
export type Actor = 'owner' | 'helper' | 'assistant' | 'ext'
export type AssistantStatus = 'running' | 'paused' | 'disconnected' | 'unsure' | 'off'
export type Confidence = 'Sure' | 'Likely' | 'Unsure'
export type FileType = 'PDF' | 'XLS' | 'CSV' | 'DOC' | 'IMG' | 'MAIL'
export type Ccy = 'AED' | 'USD' | 'EUR' | 'GBP' | 'CNY' | 'INR' | 'JPY'

/** A decimal as a string, serialised from Prisma.Decimal. Never a float. */
export type DecimalString = `${number}` | string

export interface LinkSpec {
  label: string
  href: string
  external?: boolean
}
export type Icon = ComponentType<SVGProps<SVGSVGElement>>

/** Replaces the kit's `*primary|~ghost|!danger|>link` prefixes. */
export type ButtonVariant =
  'primary' | 'secondary' | 'navy' | 'ghost' | 'danger' | 'destructive' | 'link'
