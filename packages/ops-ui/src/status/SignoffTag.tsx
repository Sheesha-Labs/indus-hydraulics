import { cn } from '../lib/cn'
import Tag from './Tag'

export interface SignoffTagProps {
  className?: string
}

/**
 * ADR-28: the small tag beside a seeded default the Owner has not confirmed yet. A `level` Tag
 * reading "Default · awaiting sign-off"; screen readers also hear why it is there. Render it only
 * for a value whose `signoffStatus` is `awaiting` (apps/ops `SettingField` does that).
 */
export default function SignoffTag({ className }: SignoffTagProps) {
  return (
    <span data-part="signoff-tag" className={cn('inline-flex', className)}>
      <Tag kind="level">
        Default · awaiting sign-off
        <span className="sr-only">. This value has not been confirmed by the Owner yet.</span>
      </Tag>
    </span>
  )
}
