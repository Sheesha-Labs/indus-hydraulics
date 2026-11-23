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

/**
 * The Helper invitation (S03-T03): who invited them, the link (stored redacted), when it expires, and
 * that Google or a password + authenticator both work.
 */
export function inviteEmail(input: {
  inviterName: string
  link: string
  expires: string
}): RenderedEmail {
  const lines = [
    `${input.inviterName} invited you to Indus Operations as Helper.`,
    `Open the link to join with your Google account, or set a password and an authenticator app. It works once, until ${input.expires}.`,
    'If you were not expecting this, ignore this email.',
  ]
  return {
    subject: `${input.inviterName} invited you to Indus Operations`,
    html: page(lines, { href: input.link, label: 'Join Indus Operations' }),
    text: [lines[0], input.link, ...lines.slice(1), 'Indus Operations'].join('\n\n'),
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

/**
 * New-device notice (S03-T02): the plan's sentence with the device, the city when known and the time in
 * GST, and a link to Devices.
 */
export function newDeviceEmail(input: {
  device: string
  city: string | null
  when: string
  devicesUrl: string
}): RenderedEmail {
  const where = [input.device, input.city, input.when].filter(Boolean).join(', ')
  const lines = [
    `New sign-in to Indus Operations: ${where}.`,
    "If this wasn't you, sign out that device in Settings › Team › Devices and change your password.",
  ]
  return {
    subject: 'New sign-in to Indus Operations',
    html: page(lines, { href: input.devicesUrl, label: 'Open Devices' }),
    text: [...lines, input.devicesUrl, 'Indus Operations'].join('\n\n'),
  }
}
