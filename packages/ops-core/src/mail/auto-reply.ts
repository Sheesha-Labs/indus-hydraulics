import { header, type HeaderMap } from './headers'

/**
 * Auto-replies and out-of-office notices (S05-T03, 08-map-integrations §1.11, board 96). An auto-reply is
 * never a reply, a quote or a regret. Signals, strongest first:
 *
 *   Auto-Submitted: auto-replied | auto-generated (anything but "no")
 *   X-Autoreply / X-Autorespond present
 *   Precedence: auto_reply | bulk | junk
 *   X-MS-Exchange-Inbox-Rules-Loop present
 *   a subject in one of twelve languages ("Out of Office", "Automatic reply", "Abwesenheitsnotiz" …)
 *
 * It returns the SENTENCES that may hold a return date or an alternate contact, for the model to read
 * (ooo_facts). It never parses a date itself.
 */
export type AutoReplyKind = 'out_of_office' | 'auto_ack' | 'other'

export interface AutoReplyInput {
  headers: HeaderMap
  subject: string | null
  bodyText: string | null
}

export interface AutoReplyResult {
  isAutoReply: boolean
  kind: AutoReplyKind | null
  signals: string[]
  returnDateText?: string
  alternateContactText?: string
}

/** Out of office, in English, Arabic, French, German, Spanish, Italian, Portuguese, Dutch, Chinese, Japanese,
 * Turkish and Russian. */
const OOO_SUBJECT = new RegExp(
  [
    'out of (the )?office',
    '\\booo\\b',
    'on (annual |sick )?leave',
    'away from (the )?office',
    'abwesenheit',
    'nicht im büro',
    'absence du bureau',
    '(je suis |actuellement )?absent(e)? du bureau',
    'fuera de la oficina',
    'ausente',
    'fuori ufficio',
    'fora do escritório',
    'ausência',
    'afwezig',
    'niet op kantoor',
    '不在办公室',
    '休假',
    '不在',
    '外出',
    'ofis dışında',
    'izindeyim',
    'нет в офисе',
    'в отпуске',
    'خارج المكتب',
    'في إجازة',
  ].join('|'),
  'i'
)

const AUTO_SUBJECT = new RegExp(
  [
    'automatic reply',
    'auto(matic)?[ -]?reply',
    'autoreply',
    'auto[ -]?response',
    'automatische antwort',
    'abwesenheitsnotiz',
    'réponse automatique',
    'respuesta automática',
    'respuesta automatica',
    'risposta automatica',
    'resposta automática',
    'automatisch antwoord',
    '自动回复',
    '自動応答',
    '自動返信',
    'otomatik yanıt',
    'otomatik cevap',
    'автоответ',
    'автоматический ответ',
    'رد تلقائي',
    'الرد التلقائي',
  ].join('|'),
  'i'
)

const ACK_SUBJECT =
  /(we have received|we've received|thank you for (your )?(email|message|contacting)|ticket (#|no\.?|number)|case (#|number)|request received)/i

const RETURN_SENTENCE =
  /(return|back in the office|back on|will be back|until|reachable again|zurück|retour|de retour|regreso|volveré|rientro|tornerò|retorno|terug|返回|回来|戻り|döneceğim|вернусь|سأعود|حتى)/i

const ALTERNATE_SENTENCE =
  /(contact|reach|urgent|in my absence|please (email|write to|call)|vertretung|wenden sie sich|contacter|contactez|contacte con|contattare|contatar|neem contact|联系|連絡|ulaşabilirsiniz|обращайтесь|التواصل|للتواصل)/i

function sentences(text: string): string[] {
  return text
    .replace(/\r/g, '')
    .split(/(?<=[.!?。！？])\s+|\n+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 3 && s.length <= 400)
}

export function detectAutoReply(input: AutoReplyInput): AutoReplyResult {
  const signals: string[] = []
  const auto = header(input.headers, 'auto-submitted')
  if (auto && auto.trim().toLowerCase() !== 'no')
    signals.push(`Auto-Submitted: ${auto.trim().toLowerCase()}`)
  if (header(input.headers, 'x-autoreply') !== null) signals.push('X-Autoreply')
  if (header(input.headers, 'x-autorespond') !== null) signals.push('X-Autorespond')
  const precedence = header(input.headers, 'precedence')?.trim().toLowerCase()
  if (precedence && ['auto_reply', 'bulk', 'junk'].includes(precedence))
    signals.push(`Precedence: ${precedence}`)
  if (header(input.headers, 'x-ms-exchange-inbox-rules-loop') !== null)
    signals.push('X-MS-Exchange-Inbox-Rules-Loop')

  const subject = input.subject ?? ''
  const ooo = OOO_SUBJECT.test(subject)
  const autoSubject = AUTO_SUBJECT.test(subject)
  if (ooo) signals.push('Out-of-office subject')
  else if (autoSubject) signals.push('Automatic-reply subject')

  // Precedence: bulk alone is a newsletter signal, not an auto-reply: it needs a second signal.
  const strong = signals.filter((s) => s !== 'Precedence: bulk')
  const isAutoReply = strong.length > 0
  if (!isAutoReply) return { isAutoReply: false, kind: null, signals }

  const body = input.bodyText ?? ''
  const bodyOoo = OOO_SUBJECT.test(body.slice(0, 2_000))
  const kind: AutoReplyKind =
    ooo || bodyOoo
      ? 'out_of_office'
      : ACK_SUBJECT.test(subject) || ACK_SUBJECT.test(body.slice(0, 600))
        ? 'auto_ack'
        : 'other'

  const result: AutoReplyResult = { isAutoReply: true, kind, signals }
  if (kind === 'out_of_office') {
    const s = sentences(body)
    const ret = s.find(
      (x) =>
        RETURN_SENTENCE.test(x) &&
        /\d|monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|next week/i.test(x)
    )
    const alt = s.find((x) => ALTERNATE_SENTENCE.test(x) && /@|\+?\d[\d\s-]{6,}/.test(x))
    if (ret) result.returnDateText = ret
    if (alt) result.alternateContactText = alt
  }
  return result
}
