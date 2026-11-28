import 'server-only'
import type { Letterhead } from '@indus/ops-core'
import { opsDb } from '@indus/ops-db'
import type { PdfAssets, PdfImage } from '@indus/ops-pdf'
import { getSetting } from '../settings/get'
import { isOpsBucket } from '../storage/buckets'
import { getStorage } from '../storage/storage'

/**
 * The letterhead every document is drawn on (S11-T04): Settings › Company (legal name, TRN, address, phone),
 * the mailbox the document goes out from (purchase@ for supplier documents, sales@ for client ones), the bank
 * block confirmed for client documents (S11-T07) and the logo, stamp and signature images from ops-company.
 * Everything comes from the database: the repository is public.
 */
export async function loadLetterhead(i: {
  role: 'client' | 'supplier'
  currency?: string | null
  signerId?: string | null
}): Promise<{ letterhead: Letterhead; assets: PdfAssets }> {
  const [profile, files, mailbox, banks] = await Promise.all([
    getSetting('company.profile'),
    getSetting('company.assets'),
    opsDb.mailbox.findFirst({
      where: { role: i.role },
      orderBy: { createdAt: 'asc' },
      select: { address: true },
    }),
    i.role === 'client' ? bankLines(i.currency ?? null) : Promise.resolve([]),
  ])
  const signatureId = i.signerId ? (files.signatures[i.signerId] ?? null) : null
  const [logo, stamp, signature] = await Promise.all([
    image(files.logoFileId),
    image(files.stampFileId),
    image(signatureId),
  ])
  return {
    letterhead: {
      legalName: profile.legalName,
      addressLines: profile.addressLines,
      trn: profile.trn,
      phone: profile.phone,
      mailbox: mailbox?.address ?? '',
      logo: files.logoFileId
        ? { src: `/api/files/${files.logoFileId}?inline=1`, width: 150, height: 60 }
        : { src: '', width: 150, height: 60 },
      bank: { lines: banks },
    },
    assets: {
      ...(logo ? { logo } : {}),
      ...(stamp ? { stamp } : {}),
      ...(signature ? { signature } : {}),
    },
  }
}

/**
 * The bank lines printed on client documents (S11-T07): only a block the Owner has confirmed, printed exactly
 * as confirmed (its printLines, read from his own Zoho estimate). The confirmed account for the document's
 * currency first (its default first), else the confirmed AED one. Empty when none is confirmed; the document
 * then says "Bank details to follow" and cannot be approved (clientDocumentApprovalGate).
 */
export async function bankLines(currency: string | null): Promise<string[]> {
  const rows = await opsDb.ownBankAccount.findMany({
    where: { showOnDocuments: true, archivedAt: null, confirmedAt: { not: null } },
    orderBy: [{ isDefaultForCcy: 'desc' }, { bankName: 'asc' }],
    select: { currency: true, printLines: true },
  })
  const pick =
    rows.find((r) => currency && r.currency === currency) ?? rows.find((r) => r.currency === 'AED')
  return pick?.printLines ?? []
}

async function image(fileId: string | null): Promise<PdfImage | null> {
  if (!fileId) return null
  const row = await opsDb.storedFile.findUnique({
    where: { id: fileId },
    select: { bucket: true, path: true, mimeType: true, purgedAt: true },
  })
  if (!row || row.purgedAt || !isOpsBucket(row.bucket)) return null
  const format = row.mimeType === 'image/png' ? 'png' : row.mimeType === 'image/jpeg' ? 'jpg' : null
  if (!format) return null
  const stream = await getStorage().openRead(row.bucket, row.path)
  if (!stream) return null
  return { data: new Uint8Array(await new Response(stream).arrayBuffer()), format }
}
