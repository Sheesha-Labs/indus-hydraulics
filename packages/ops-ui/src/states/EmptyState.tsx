import type { ReactNode } from 'react'
import { EMPTY_COPY, type EmptyList } from './empty-copy'
import StateBox, { StateActionLink, type HeadingLevel } from './StateBox'

export interface EmptyStateProps {
  /** Preset mark, title, text and buttons from EMPTY_COPY (the kit's ten lists). */
  list?: EmptyList
  /** Overrides the preset's two-letter code. */
  mark?: string
  title?: string
  text?: ReactNode
  /** Replaces the preset's buttons. */
  actions?: ReactNode
  foot?: ReactNode
  align?: 'left' | 'center'
  bare?: boolean
  headingLevel?: HeadingLevel
  className?: string
}

/**
 * States kit Empty: every list says what fills it and how. Pass `list` for the preset, or your own mark,
 * title, text and actions. Shared.
 */
export default function EmptyState({
  list,
  mark,
  title,
  text,
  actions,
  foot,
  align,
  bare,
  headingLevel,
  className,
}: EmptyStateProps) {
  const preset = list ? EMPTY_COPY[list] : undefined
  const presetActions =
    preset && preset.actions.length > 0
      ? preset.actions.map((a) => <StateActionLink key={a.label} {...a} />)
      : null
  return (
    <StateBox
      tone="empty"
      mark={mark ?? preset?.mark ?? '—'}
      title={title ?? preset?.title ?? 'Nothing here yet'}
      text={text ?? preset?.text}
      actions={actions ?? presetActions}
      foot={foot}
      {...(align ? { align } : {})}
      {...(bare === undefined ? {} : { bare })}
      {...(headingLevel ? { headingLevel } : {})}
      {...(className ? { className } : {})}
    />
  )
}
