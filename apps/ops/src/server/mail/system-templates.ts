/**
 * Copy of the system emails S03 sends. AWAITING SIGN-OFF: plain and short until email templates move
 * to the database in S19 (`email_template` rows with signoffStatus). Escapes everything it inserts.
 */
export type RenderedEmail = { subject: string; html: string; text: string }

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function page(paragraphs: string[], link?: { href: string; label: string }): string {
  const body = paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join('')
  const button = link
    ? `<p><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></p>`
    : ''
  return `<!doctype html><html><body>${body}${button}<p>Indus Operations</p></body></html>`
}

export function passwordResetEmail(input: { link: string; minutes: number }): RenderedEmail {
  const lines = [
    'Someone asked to reset the password for your Indus Operations account.',
    `This link works for ${input.minutes} minutes and only once. You will also need your authenticator code.`,
    'If it was not you, ignore this email: your password stays as it is.',
  ]
  return {
    subject: 'Reset your Indus Operations password',
    html: page(lines, { href: input.link, label: 'Choose a new password' }),
    text: [...lines.slice(0, 1), input.link, ...lines.slice(1), 'Indus Operations'].join('\n\n'),
  }
}

/** Forgot-password for an account with no password: the board's message, by email (decision). */
export function googleOnlyEmail(input: { signInUrl: string }): RenderedEmail {
  const lines = [
    'Someone asked to reset the password for your Indus Operations account.',
    'This account signs in with Google. Use Continue with Google.',
  ]
  return {
    subject: 'Signing in to Indus Operations',
    html: page(lines, { href: input.signInUrl, label: 'Go to sign-in' }),
    text: [...lines, input.signInUrl, 'Indus Operations'].join('\n\n'),
  }
}
