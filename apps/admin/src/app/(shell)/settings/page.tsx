import type { Metadata } from 'next'
import { db } from '@indus/db'
import { ROLES } from '../../../lib/rbac'
import { requireStaffRole } from '../../../lib/staff-session'
import SettingsPageClient from '../../../components/SettingsPageClient'

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
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-[24px] font-semibold tracking-tight">Settings</h1>
        <p className="text-[13px] text-[var(--color-muted)] mt-1">Store configuration and email templates.</p>
      </div>

      <SettingsPageClient
        activeTab={tab}
        storeSettings={storeSettings}
        emailTemplates={emailTemplates}
      />
    </div>
  )
}
