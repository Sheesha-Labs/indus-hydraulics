/** Pure helpers of the push route (no imports: the route's module graph stays database-free). */
export const PUSH_ISSUERS = ['https://accounts.google.com', 'accounts.google.com']

export type PushNotice = { emailAddress: string; historyId: string; messageId: string }

/** `{ message: { data: base64(JSON { emailAddress, historyId }), messageId } }`, or null when malformed. */
export function parsePushBody(raw: string): PushNotice | null {
  try {
    const body = JSON.parse(raw) as {
      message?: { data?: unknown; messageId?: unknown; message_id?: unknown }
    }
    const m = body.message
    const messageId =
      typeof m?.messageId === 'string'
        ? m.messageId
        : typeof m?.message_id === 'string'
          ? m.message_id
          : null
    if (!m || typeof m.data !== 'string' || !messageId) return null
    const data = JSON.parse(Buffer.from(m.data, 'base64').toString('utf8')) as {
      emailAddress?: unknown
      historyId?: unknown
    }
    const emailAddress =
      typeof data.emailAddress === 'string' ? data.emailAddress.trim().toLowerCase() : ''
    const historyId =
      typeof data.historyId === 'number' || typeof data.historyId === 'string'
        ? String(data.historyId)
        : ''
    if (!emailAddress.includes('@') || !/^\d+$/.test(historyId)) return null
    return { emailAddress, historyId, messageId }
  } catch {
    return null
  }
}
