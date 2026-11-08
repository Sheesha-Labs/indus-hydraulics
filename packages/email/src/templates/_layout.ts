import { BRAND, BRAND_FONT } from '@indus/domain'

// Shared HTML chrome for all transactional emails.
//
// Inline styles only — Gmail strips <style> in many contexts — and a table
// layout for Outlook, which renders through Word. CLAUDE.md §2.1 bans inline
// style in the app; this package is one of its two named exemptions, because
// here `style` IS the rendering API.
//
// Colours come from BRAND (packages/domain/src/brand-colors.ts) as hex. No
// mail client parses oklch(), and an unparsed colour is not a graceful
// fallback — the declaration is simply dropped and the element inherits
// whatever it inherits. A quote email is not where you want to discover that.

export type LayoutInput = {
  title: string
  preheader?: string
  bodyHtml: string
  legalName: string
  vatTrn?: string | null
  registeredAddressLines?: string[]
  signatureName?: string | null
  signatureTitle?: string | null
  signaturePhone?: string | null
  signatureEmail?: string | null
  /**
   * Legal / list footer, rendered under the registered address. Newsletter
   * mail always sets it (plan §2, Bazar bug 6): why the reader is getting the
   * email, and — once they are subscribed — the unsubscribe link.
   */
  footer?: LegalFooter
}

export type LegalFooter = {
  /** Plain text: why this email was sent. */
  reason: string
  /** Present once there is a subscription to leave. */
  unsubscribeUrl?: string
}

/** The footer as HTML, inside the navy band. */
function renderLegalFooterHtml(footer: LegalFooter): string {
  const link = footer.unsubscribeUrl
    ? ` <a href="${escapeHtml(footer.unsubscribeUrl)}" style="color:${BRAND.white};text-decoration:underline;">Unsubscribe</a>.`
    : ''
  return `<div style="margin-top:12px;padding-top:12px;border-top:1px solid rgba(255,255,255,0.15);">${escapeHtml(footer.reason)}${link}</div>`
}

/**
 * The same legal block as plain text, for the text/plain part: legal name,
 * registered address, the reason and the unsubscribe URL.
 */
export function renderLegalFooterText(input: Pick<LayoutInput, 'legalName' | 'registeredAddressLines' | 'footer'>): string {
  const lines = ['--', input.legalName, ...(input.registeredAddressLines ?? [])]
  if (input.footer) {
    lines.push('', input.footer.reason)
    if (input.footer.unsubscribeUrl) lines.push(`Unsubscribe: ${input.footer.unsubscribeUrl}`)
  }
  return lines.join('\n')
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function renderLayout(input: LayoutInput): string {
  const preheader = input.preheader ? escapeHtml(input.preheader) : ''
  const addrLines = (input.registeredAddressLines ?? []).map(escapeHtml).join('<br />')
  const sig = [input.signatureName, input.signatureTitle, input.signaturePhone, input.signatureEmail]
    .filter((v): v is string => Boolean(v))
    .map(escapeHtml)
    .join(' &middot; ')

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(input.title)}</title>
</head>
<body style="margin:0;padding:0;background-color:${BRAND.bg};font-family:${BRAND_FONT.sans};color:${BRAND.ink};">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${BRAND.bg};padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:${BRAND.surface};border:1px solid ${BRAND.border};border-radius:10px;">
        <tr>
          <td style="padding:28px 32px 20px 32px;border-bottom:1px solid ${BRAND.border};">
            <div style="font-family:${BRAND_FONT.serif};font-size:26px;font-weight:400;color:${BRAND.ink};letter-spacing:-0.01em;">${escapeHtml(input.legalName)}</div>
            ${input.vatTrn ? `<div style="font-family:${BRAND_FONT.mono};font-size:10.5px;color:${BRAND.muted};letter-spacing:0.13em;text-transform:uppercase;margin-top:6px;">TRN ${escapeHtml(input.vatTrn)}</div>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding:32px;font-size:15px;line-height:1.6;color:${BRAND.ink2};">
${input.bodyHtml}
          </td>
        </tr>
        ${
          sig
            ? `<tr>
          <td style="padding:20px 32px 24px 32px;font-size:13px;color:${BRAND.ink2};border-top:1px solid ${BRAND.border};">
            <div style="margin-bottom:4px;color:${BRAND.muted};">Best regards,</div>
            <div>${sig}</div>
          </td>
        </tr>`
            : ''
        }
        <tr>
          <td style="padding:18px 32px;background-color:${BRAND.navy};border-top:1px solid ${BRAND.border};font-size:11px;color:${BRAND.onNavy};line-height:1.6;">
            <strong style="color:${BRAND.white};">${escapeHtml(input.legalName)}</strong>${addrLines ? `<br />${addrLines}` : ''}${input.footer ? renderLegalFooterHtml(input.footer) : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}
