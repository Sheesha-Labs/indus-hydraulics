/**
 * Document expiry reminders (S10-T08, C18): 60, 30 and 7 days before a supplier's or Indus's own document expires.
 * Pure. Each threshold fires once per document (remindersSentDays); a document first seen late gets only the
 * smallest threshold already due (at 20 days left: the 30-day reminder once, later the 7-day one). Archived
 * documents and documents with a newer valid one of the same kind are skipped. On a day that is not a working day
 * nothing is due: the reminder goes the next working day, never earlier than due.
 */

export interface ExpiringDocument {
  id: string
  companyId: string | null
  kind: string
  expiresAt: Date | null
  archivedAt: Date | null
  remindersSentDays: readonly number[]
  createdAt: Date
}

export interface DueReminder {
  documentId: string
  companyId: string | null
  threshold: number
  daysLeft: number
  owner: 'supplier' | 'indus'
}

const dayNumber = (d: Date) =>
  Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86_400_000)

export function daysLeft(expiresAt: Date, today: Date): number {
  return dayNumber(expiresAt) - dayNumber(today)
}

/** Superseded: a newer live document of the same kind for the same company expires later or never. */
function superseded(d: ExpiringDocument, all: readonly ExpiringDocument[]): boolean {
  return all.some(
    (o) =>
      o.id !== d.id &&
      o.companyId === d.companyId &&
      o.kind === d.kind &&
      !o.archivedAt &&
      o.createdAt > d.createdAt &&
      (o.expiresAt === null || (d.expiresAt !== null && o.expiresAt > d.expiresAt))
  )
}

export function dueReminders(
  documents: readonly ExpiringDocument[],
  today: Date,
  opts: { thresholds: readonly number[]; isWorkingDay: (d: Date) => boolean }
): DueReminder[] {
  if (!opts.isWorkingDay(today)) return []
  const thresholds = [...opts.thresholds].sort((a, b) => b - a)
  const out: DueReminder[] = []
  for (const d of documents) {
    if (!d.expiresAt || d.archivedAt || superseded(d, documents)) continue
    const left = daysLeft(d.expiresAt, today)
    if (left < 0) continue
    // The smallest threshold that is due (left ≤ threshold) and not yet sent.
    const due = thresholds.filter((t) => left <= t)
    const smallest = due[due.length - 1]
    if (smallest === undefined || d.remindersSentDays.includes(smallest)) continue
    // A larger threshold already sent never repeats; a smaller one not yet due waits.
    out.push({
      documentId: d.id,
      companyId: d.companyId,
      threshold: smallest,
      daysLeft: left,
      owner: d.companyId ? 'supplier' : 'indus',
    })
  }
  return out
}

/** Documents that have expired and are not yet marked so (status 'expired' once). */
export function newlyExpired(
  documents: ReadonlyArray<ExpiringDocument & { status: string }>,
  today: Date
): string[] {
  return documents
    .filter(
      (d) =>
        d.expiresAt && !d.archivedAt && d.status !== 'expired' && daysLeft(d.expiresAt, today) < 0
    )
    .map((d) => d.id)
}
