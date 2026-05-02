import type { Metadata } from 'next'
import { db } from '@indus/db'
import RobotsForm from './RobotsForm'

export const metadata: Metadata = { title: 'Robots.txt — Indus Admin' }

export default async function SeoRobotsPage() {
  const seoSetting = await db.seoSetting.findFirst({
    select: {
      defaultMetaTitleTemplate: true,
      defaultMetaDescription: true,
      robotsTxt: true,
    },
  })
  return <RobotsForm seoSetting={seoSetting} />
}
