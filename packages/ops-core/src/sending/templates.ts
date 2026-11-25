/**
 * Email templates (S08-T04/T07): wording lives in `ops.email_template` rows (signed off by the Owner); code only
 * fills `{variable}` placeholders. A placeholder with no value is reported, never left in the email.
 */
export function fillTemplate(
  template: string,
  values: Readonly<Record<string, string | number | null | undefined>>
): { text: string; missing: string[] } {
  const missing: string[] = []
  const text = template.replace(/\{([a-z_]+)\}/g, (m, key: string) => {
    const v = values[key]
    if (v === null || v === undefined || v === '') {
      missing.push(key)
      return m
    }
    return String(v)
  })
  return { text, missing: [...new Set(missing)] }
}

/** "Dear Mr Haddad," from the contact's own salutation, else their name, else "Dear Sir/Madam,". */
export function salutation(
  contact: { salutation?: string | null; firstName?: string | null; name?: string | null } | null
): string {
  const s = contact?.salutation?.trim()
  if (s) return /,$/.test(s) ? s : `${/^dear\b/i.test(s) ? s : `Dear ${s}`},`
  const n = contact?.firstName?.trim() || contact?.name?.trim()
  return n ? `Dear ${n},` : 'Dear Sir/Madam,'
}
