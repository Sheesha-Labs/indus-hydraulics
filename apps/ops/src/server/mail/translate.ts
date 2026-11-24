import 'server-only'
import { opsDb } from '@indus/ops-db'
import { structuredCall } from '@indus/ops-ai'
import { dominantScript, splitQuoted, translateSchema, type Script } from '@indus/ops-core'
import { aiLedger } from '../assistant/ai-ledger'
import { assistantTransport } from '../assistant/model'
import { isAssistantPaused } from '../assistant/state'
import { PROMPT_VERSION, SYSTEM_PARTS, translateUser } from '../assistant/prompts/translate-mail.v1'

/**
 * Board 97 state 9: an email mostly in Arabic, Chinese (or another non-Latin script) gets an Original /
 * English toggle. English is made on demand (Haiku, translate-mail@1), once: it is cached in
 * mail_message.summaryEn with the language code, and labelled "Summary in English · translated from Arabic".
 * It is a reading aid only; nothing is filed from it.
 */
export class TranslateError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TranslateError'
  }
}

const CODE: Partial<Record<Script, string>> = {
  arabic: 'ar',
  chinese: 'zh',
  japanese: 'ja',
  cyrillic: 'ru',
}

export const LANGUAGE_NAME: Readonly<Record<string, string>> = {
  ar: 'Arabic',
  zh: 'Chinese',
  ja: 'Japanese',
  ru: 'Russian',
}

export const TRANSLATE_MAX = 6_000

export interface Translation {
  english: string
  language: string
  languageName: string
  cached: boolean
}

export async function translateMessage(messageId: string): Promise<Translation> {
  const m = await opsDb.mailMessage.findUnique({
    where: { id: messageId },
    select: { id: true, subject: true, bodyText: true, summaryEn: true, language: true },
  })
  if (!m) throw new TranslateError('That message is no longer here')
  if (m.summaryEn && m.language) {
    return {
      english: m.summaryEn,
      language: m.language,
      languageName: LANGUAGE_NAME[m.language] ?? m.language,
      cached: true,
    }
  }
  const text = splitQuoted(m.bodyText ?? '').fresh.slice(0, TRANSLATE_MAX)
  const code = CODE[dominantScript(text)]
  if (!code) throw new TranslateError('This email is already in English')
  if (await isAssistantPaused()) throw new TranslateError('The Assistant is paused')

  // No connection is held across the call: the read above has finished, the write below is its own.
  const res = await structuredCall({
    route: 'translate',
    system: SYSTEM_PARTS,
    user: translateUser({ subject: m.subject ?? '', text }),
    zod: translateSchema,
    maxTokens: 3_000,
    promptVersion: PROMPT_VERSION,
    enquiryId: null,
    actionId: null,
    ledger: aiLedger,
    transport: assistantTransport(),
  })
  if (!res.ok) {
    throw new TranslateError(
      res.reason === 'budget'
        ? 'The AI budget for this month is used up'
        : 'Could not translate it now'
    )
  }
  await opsDb.mailMessage.update({
    where: { id: m.id },
    data: { summaryEn: res.value.english, language: code },
  })
  return {
    english: res.value.english,
    language: code,
    languageName: LANGUAGE_NAME[code]!,
    cached: false,
  }
}
