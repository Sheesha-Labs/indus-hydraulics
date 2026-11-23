import type { $Enums } from '@indus/ops-db'

/**
 * Notifications nobody can switch off (architecture §4.11, 08-map §8, board 181): a stored "off" preference is
 * ignored for these. The constraint `notification_preference_locked_not_off` (S00) also refuses saving one.
 */
export const LOCKED_EVENTS: readonly $Enums.NotificationEvent[] = [
  'mailbox_disconnected',
  'assistant_paused',
  'bank_detail_change',
]

export function isLockedEvent(event: string): boolean {
  return (LOCKED_EVENTS as readonly string[]).includes(event)
}
