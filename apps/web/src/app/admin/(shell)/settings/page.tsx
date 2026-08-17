import type { Metadata } from 'next'
import { db } from '@indus/db'
import { ROLES } from '../../../../lib/rbac'
import { requireStaffRole } from '../../../../lib/staff-session'
import { mediaUrl } from '../../../../lib/media'
import SettingsPageClient from '../../../../components/admin/SettingsPageClient'
import AdminPageShell from '../../../../components/admin/AdminPageShell'

export const metadata: Metadata = { title: 'Settings — Indus Admin' }

type Props = { searchParams: Promise<{ tab?: string }> }

export default async function SettingsPage({ searchParams }: Props) {
  await requireStaffRole(ROLES.SETTINGS_WRITE)

  const { tab = 'store' } = await searchParams

  const [storeSettings, emailTemplates, media] = await Promise.all([
    db.storeSettings.findFirst(),
    db.emailTemplate.findMany({ orderBy: { kind: 'asc' } }),
    /*
     * Candidates for the brand pickers. Images only, newest first, capped —
     * the library is ~360 rows and every one of them would be a <option> in
     * four selects. Anything a picker uploads is prepended client-side, so a
     * just-uploaded file is selectable even when the cap would have hidden it.
     */
    db.media.findMany({
      where: { kind: 'image' },
      orderBy: { createdAt: 'desc' },
      take: 100,
      select: { id: true, originalFilename: true, storagePath: true },
    }),
  ])

  /*
   * The currently-selected images may be older than the 100 the query above
   * takes. Fetched separately and merged, because a picker whose own value is
   * missing from its options renders as "none" and a save would silently clear
   * a logo the operator never touched.
   */
  const selectedIds = [
    storeSettings?.logoMediaId,
    storeSettings?.footerLogoMediaId,
    storeSettings?.faviconMediaId,
    storeSettings?.searchLogoMediaId,
  ].filter((id): id is string => typeof id === 'string')

  const missingIds = selectedIds.filter((id) => !media.some((m) => m.id === id))
  const selectedMedia = missingIds.length
    ? await db.media.findMany({
        where: { id: { in: missingIds } },
        select: { id: true, originalFilename: true, storagePath: true },
      })
    : []

  const mediaOptions = [...selectedMedia, ...media].map((m) => ({
    id: m.id,
    filename: m.originalFilename,
    url: mediaUrl(m.storagePath),
  }))

  return (
    <AdminPageShell title={'Settings'} sub={'Store configuration, brand identity and email templates.'}>
      <SettingsPageClient
        activeTab={tab}
        storeSettings={storeSettings}
        emailTemplates={emailTemplates}
        brandIdentity={
          storeSettings
            ? {
                logoMediaId: storeSettings.logoMediaId,
                logoStyle: storeSettings.logoStyle,
                footerLogoMediaId: storeSettings.footerLogoMediaId,
                faviconMediaId: storeSettings.faviconMediaId,
                searchLogoMediaId: storeSettings.searchLogoMediaId,
              }
            : null
        }
        mediaOptions={mediaOptions}
      />
    </AdminPageShell>
  )
}
