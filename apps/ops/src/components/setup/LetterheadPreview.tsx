import { letterheadRows, type CompanyProfile } from '../../lib/company-profile'
import CompanyLogo from './CompanyLogo'

export interface LetterheadPreviewProps {
  profile: CompanyProfile
  logoFileId: string | null
  /** The Owner, who signs quotations: name and signature image (if uploaded). */
  signatory: { name: string; signatureFileId: string | null } | null
}

/** Eight rules stand in for the document body between the header and the footer (board 79). */
const BODY_RULES = [0, 1, 2, 3, 4, 5, 6, 7]

/**
 * The "Live preview · quotation header and footer" card of board 79: the letterhead as the document
 * prints it (logo at the left; legal name, TRN, address and phone at the right; a rule), a ruled body,
 * and the footer (bank details at the left, "For <legal name>", the signature and the signatory's name at
 * the right). Fed from the form's draft, so it follows every keystroke. Bank lines are never shown here:
 * they are confirmed in Settings › Bank accounts (open item 1, S11).
 *
 * (decision) Its own compact card, not DocumentPage at scale m: the board draws a 420-wide header and
 * footer only, and DocumentPage is a whole 476 × 674 A4 page with no separable header or footer block.
 */
export default function LetterheadPreview({
  profile,
  logoFileId,
  signatory,
}: LetterheadPreviewProps) {
  const legal = profile.legalName.trim()
  const rows = letterheadRows(profile.addressLines, profile.phone)
  return (
    <div
      data-letterhead-preview=""
      className="bg-io-card shadow-io-e-mail rounded-io-paper flex flex-col gap-3 px-6 py-[22px] text-[10.5px]"
    >
      <div className="flex items-start justify-between gap-4">
        <CompanyLogo fileId={logoFileId} className="h-[30px]" />
        <div className="text-io-ink-2 flex min-w-0 flex-col items-end text-right leading-[1.5]">
          <b
            className={
              legal
                ? 'text-io-ink text-[12px] font-semibold'
                : 'text-io-ink-3 text-[12px] font-normal'
            }
          >
            {legal || 'Legal name'}
          </b>
          <span>{profile.trn ? `TRN ${profile.trn}` : 'TRN'}</span>
          {rows.map((row) => (
            <span key={row}>{row}</span>
          ))}
        </div>
      </div>
      <div aria-hidden="true" className="bg-io-ink h-px" />
      <div aria-hidden="true" className="flex flex-col">
        {BODY_RULES.map((i) => (
          <div key={i} className="border-io-paper h-[15px] border-b" />
        ))}
      </div>
      <div className="border-io-line text-io-ink-2 grid grid-cols-2 gap-3.5 border-t pt-2.5 leading-[1.5]">
        <div className="flex flex-col">
          <b className="text-io-ink font-semibold">Bank details</b>
          <span>Bank details · confirmed later</span>
        </div>
        <div className="flex flex-col items-end text-right">
          <b className="text-io-ink font-semibold">For {legal || 'the company'}</b>
          {signatory?.signatureFileId ? (
            // eslint-disable-next-line nextjs/no-img-element -- a signed Storage redirect, drawn at a fixed height
            <img
              src={`/api/files/${signatory.signatureFileId}`}
              alt={`Signature of ${signatory.name}`}
              className="my-0.5 block h-7 w-auto max-w-none"
            />
          ) : (
            <span aria-hidden="true" className="h-7" />
          )}
          {signatory ? <span>{signatory.name}</span> : null}
        </div>
      </div>
    </div>
  )
}
