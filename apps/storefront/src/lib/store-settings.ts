import 'server-only'
import { cache } from 'react'
import { db } from '@indus/db'

export type ResolvedStoreSettings = {
  name: string
  tagline: string | null
  logoUrl: string | null
  certificationLine: string | null
  contactPhone: string | null
  contactEmail: string | null
  contactHours: string | null
  contactLocationLabel: string | null
}

const FALLBACK: ResolvedStoreSettings = {
  name: 'Indus Hydraulics',
  tagline: null,
  logoUrl: null,
  certificationLine: null,
  contactPhone: null,
  contactEmail: null,
  contactHours: null,
  contactLocationLabel: null,
}

export const getStoreSettings = cache(async (): Promise<ResolvedStoreSettings> => {
  const row = await db.storeSettings
    .findFirst({
      select: {
        name: true,
        tagline: true,
        certificationLine: true,
        contactPhone: true,
        contactEmail: true,
        contactHours: true,
        contactLocationLabel: true,
        logoMedia: { select: { storagePath: true } },
      },
    })
    .catch(() => null)
  if (!row) return FALLBACK
  return {
    name: row.name,
    tagline: row.tagline,
    logoUrl: row.logoMedia?.storagePath ?? null,
    certificationLine: row.certificationLine,
    contactPhone: row.contactPhone,
    contactEmail: row.contactEmail,
    contactHours: row.contactHours,
    contactLocationLabel: row.contactLocationLabel,
  }
})
