/**
 * Free mail providers (S05-T03). A sender on one of these says nothing about which company they work for, so
 * linking never infers a company from the domain alone, and phishing checks never treat it as a look-alike.
 */
export const PUBLIC_MAIL_DOMAINS: readonly string[] = [
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'yahoo.com',
  'icloud.com',
  'me.com',
  'proton.me',
  'protonmail.com',
  'aol.com',
  'gmx.com',
  'mail.ru',
  'yandex.ru',
  'qq.com',
  '163.com',
  '126.com',
  'rediffmail.com',
]

const SET = new Set(PUBLIC_MAIL_DOMAINS)

export function isPublicMailDomain(domain: string | null | undefined): boolean {
  return !!domain && SET.has(domain.trim().toLowerCase())
}
