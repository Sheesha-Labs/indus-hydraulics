import type { SanitizedHtml } from '../mail/types'

// NEUTRAL email bodies for the Mail kit tests, the /_kit specimen and visual baselines. The repository is
// public: invented senders on example domains only, no real mailbox, person, company or email content
// (CLAUDE.md §12).

/**
 * TEST-ONLY: brands a literal as sanitized. Production code never calls this; the S05 server sanitizer is the
 * only producer of SanitizedHtml. It lives in __fixtures__ so the kit's own source exports no constructor.
 */
export function fixtureHtml(html: string): SanitizedHtml {
  return html as SanitizedHtml
}

/** A supplier's reply with a quoted line, as the kit's Message part shows it. */
export const MAIL_BODY_SUPPLIER_REPLY = fixtureHtml(
  '<p>Dear Helper,</p>' +
    '<p>Please find our offer attached for 3 of the 4 lines. Line 2 is not in our range.</p>' +
    '<p>Prices EUR, EXW origin, 5 weeks from order.</p>' +
    '<blockquote><p>On 20 Nov, purchase@ wrote: Please quote for the attached RFQ IH-RFQ-2611-P01…</p></blockquote>'
)

/** A longer body for the 360px reading frame and its Expand toggle. */
export const MAIL_BODY_LONG = fixtureHtml(
  '<p>Dear Owner,</p>' +
    '<p>Thank you for the quotation. Our engineering team has reviewed lines 1 to 3 and has two questions before we can place the order.</p>' +
    '<ul><li>Line 1: please confirm the end connections are flanged, class 300.</li>' +
    '<li>Line 3: is a test certificate to EN 10204 3.1 included in the price?</li></ul>' +
    '<p>We would also like to know whether partial delivery is possible for line 2.</p>' +
    '<p>Please reply by Thursday so we can close this before month end.</p>' +
    '<p>Best regards,<br>Sam Sample<br>Sample Client LLC</p>' +
    '<blockquote><p>On 18 Nov, sales@ wrote: Please find our quotation INDUS/Q10001-R2 attached.</p></blockquote>'
)

/**
 * Hostile input the sandbox must hold: a script, an inline handler, a javascript: link and a remote tracking
 * image. Sanitization (S05) would strip all four; the frame must contain them even if it did not.
 */
export const MAIL_BODY_HOSTILE = fixtureHtml(
  '<p>Quarterly statement attached.</p>' +
    '<script>window.parent.document.title = "owned"</script>' +
    '<img src="https://tracker.example/pixel.gif" alt="remote image (blocked)" onerror="window.parent.alert(1)">' +
    '<p><a href="javascript:alert(1)">View statement</a></p>'
)

/** The hostile sample followed by the long body: one frame for the kit page (reading height and Expand). */
export const MAIL_BODY_HOSTILE_LONG = fixtureHtml(MAIL_BODY_HOSTILE + MAIL_BODY_LONG)
