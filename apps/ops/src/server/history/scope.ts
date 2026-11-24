import 'server-only'
import { enquiryIdForRef, type HistoryScope } from '../../data/history'
import { enquiryRef, recordId } from '../../lib/route-params'

/**
 * Which rows a record's history covers (S06-T06). An enquiry is addressed by its ref and covers its own rows
 * and every row stamped with its id; a supplier or a client is a company row. Null for an unknown type, a
 * malformed id, or an enquiry not in the database.
 */
export async function resolveHistoryScope(
  type: string,
  id: string
): Promise<{ scope: HistoryScope; label: string; file: string } | null> {
  if (type === 'enquiry') {
    const ref = enquiryRef.safeParse(id)
    if (!ref.success) return null
    const enquiryId = await enquiryIdForRef(ref.data)
    return enquiryId
      ? {
          scope: { subjectType: 'enquiry', subjectId: enquiryId, enquiryId },
          label: ref.data,
          file: ref.data,
        }
      : null
  }
  if (type === 'supplier' || type === 'client') {
    if (!recordId.safeParse(id).success) return null
    return {
      scope: { subjectType: 'company', subjectId: id },
      label: `${type} ${id}`,
      file: `${type}-${id}`,
    }
  }
  return null
}
