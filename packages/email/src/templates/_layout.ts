// Shared HTML chrome for all transactional emails. Inline styles only —
// Gmail strips <style> in many contexts. Table layout for Outlook safety.

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
<body style="margin:0;padding:0;background-color:#f5f5f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:#1c1917;">
${preheader ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>` : ''}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f4;padding:32px 16px;">
  <tr>
    <td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background-color:#ffffff;border:1px solid #e7e5e4;">
        <tr>
          <td style="padding:32px 32px 8px 32px;border-bottom:1px solid #e7e5e4;">
            <div style="font-family:Georgia,serif;font-size:28px;font-weight:600;color:#0c4a6e;letter-spacing:-0.01em;">${escapeHtml(input.legalName)}</div>
            ${input.vatTrn ? `<div style="font-size:11px;color:#78716c;letter-spacing:0.05em;margin-top:4px;">TRN ${escapeHtml(input.vatTrn)}</div>` : ''}
          </td>
        </tr>
        <tr>
          <td style="padding:32px;font-size:15px;line-height:1.6;color:#1c1917;">
${input.bodyHtml}
          </td>
        </tr>
        ${
          sig
            ? `<tr>
          <td style="padding:0 32px 24px 32px;font-size:13px;color:#44403c;border-top:1px solid #f5f5f4;padding-top:20px;">
            <div style="margin-bottom:4px;color:#78716c;">Best regards,</div>
            <div>${sig}</div>
          </td>
        </tr>`
            : ''
        }
        <tr>
          <td style="padding:16px 32px;background-color:#fafaf9;border-top:1px solid #e7e5e4;font-size:11px;color:#78716c;line-height:1.5;">
            <strong style="color:#44403c;">${escapeHtml(input.legalName)}</strong>${addrLines ? `<br />${addrLines}` : ''}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}
