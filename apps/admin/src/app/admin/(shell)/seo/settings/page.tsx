import type { Metadata } from 'next'
import { db } from '@indus/db'
import SeoSettingsForm from './SeoSettingsForm'

export const metadata: Metadata = { title: 'SEO Settings — Indus Admin' }

export default async function SeoSettingsPage() {
  const seoSetting = await db.seoSetting.findFirst()
  return <SeoSettingsForm seoSetting={seoSetting} />
}
