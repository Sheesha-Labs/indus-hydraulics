import type { Metadata } from 'next'
import { db } from '@indus/db'
import { ROLES } from '../../../../lib/rbac'
import { requireStaffRole } from '../../../../lib/staff-session'
import SettingsPageClient from '../../../../components/admin/SettingsPageClient'
import AdminPageShell from '../../../../components/admin/AdminPageShell'

export const metadata: Metadata = { title: 'Settings — Indus Admin' }

type Props = { searchParams: Promise<{ tab?: string }> }

export default async function SettingsPage({ searchParams }: Props) {
  await requireStaffRole(ROLES.SETTINGS_WRITE)

  const { tab = 'store' } = await searchParams

  const [storeSettings, emailTemplates] = await Promise.all([
    db.storeSettings.findFirst(),
    db.emailTemplate.findMany({ orderBy: { kind: 'asc' } }),
  ])

  return (
    <AdminPageShell
      title={'Settings'}
      sub={'Store configuration and email templates.'}
    >
      <SettingsPageClient
        activeTab={tab}
        storeSettings={storeSettings}
        emailTemplates={emailTemplates}
      />
    
    </AdminPageShell>
  )
}
