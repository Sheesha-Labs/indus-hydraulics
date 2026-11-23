// SERVER-ONLY. The second Ops PrismaClient, on the `ops_maint` role (06-map-schema §3.1): DELETE on the mail_*
// tables and stored_file for a mailbox purge (board 90) and, later, retention. Created lazily, ONE connection
// (`connection_limit=1`), and used only by the purge and retention jobs. It never serves a page.
import { PrismaClient } from '#ops-client'

const globalForMaint = globalThis as unknown as { opsMaintDb?: PrismaClient; opsMaintUrl?: string }

/** `connection_limit=1` and `pool_timeout=20` unless the URL already says otherwise. */
export function maintDatasourceUrl(raw: string): string {
  const url = new URL(raw)
  if (!url.searchParams.has('connection_limit')) url.searchParams.set('connection_limit', '1')
  if (!url.searchParams.has('pool_timeout')) url.searchParams.set('pool_timeout', '20')
  return url.toString()
}

/** The ops_maint client for this URL (one per process). */
export function maintDb(rawUrl: string): PrismaClient {
  const url = maintDatasourceUrl(rawUrl)
  if (globalForMaint.opsMaintDb && globalForMaint.opsMaintUrl === url)
    return globalForMaint.opsMaintDb
  const client = new PrismaClient({ log: ['error'], datasourceUrl: url })
  globalForMaint.opsMaintDb = client
  globalForMaint.opsMaintUrl = url
  return client
}
