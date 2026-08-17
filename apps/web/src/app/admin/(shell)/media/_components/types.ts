import type { MediaListItem, MediaState, MediaUsage } from '@indus/domain'

/**
 * The shape the client tree receives.
 *
 * Declared here rather than inferred from the Prisma row because everything in
 * it crosses the server/client boundary: `createdAt` is pre-formatted on the
 * server so the dialog cannot disagree with the list about a date, and the
 * uploader is flattened to a name so no staff record is serialised into the
 * page. Both are the kind of thing that only shows up as a hydration mismatch
 * or a data leak, so they are pinned by the type.
 */
export interface MediaDetail extends MediaListItem {
  mimeType: string
  width: number | null
  height: number | null
  createdAtLabel: string
  uploadedByName: string | null
  state: MediaState
  usages: MediaUsage[]
}
