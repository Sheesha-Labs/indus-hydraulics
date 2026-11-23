import { cn } from '@indus/ops-ui/lib/cn'

export interface CompanyLogoProps {
  /** company.assets.logoFileId; null until Setup 1 has a logo. */
  fileId: string | null
  /** 'white' on the navy welcome panel (the board whitens the logo), 'accent' on white. */
  tone?: 'accent' | 'white'
  /** The board's heights: 36 on the welcome panel, 28 in the setup rail, 30 in the preview. */
  className?: string
  /** The name read aloud for the logo. */
  label?: string
}

/**
 * The company logo from Storage (`/api/files/<id>`, a 60-second signed redirect), or a neutral wordmark
 * in its footprint until one is uploaded. Nothing from the handoff is copied, so the repository never
 * holds the real logo.
 */
export default function CompanyLogo({
  fileId,
  tone = 'accent',
  className = 'h-7',
  label = 'Company logo',
}: CompanyLogoProps) {
  if (fileId) {
    return (
      // eslint-disable-next-line nextjs/no-img-element -- a signed Storage redirect, drawn at a fixed height
      <img
        src={`/api/files/${fileId}`}
        alt={label}
        className={cn(
          'block w-auto max-w-none flex-none self-start',
          tone === 'white' && 'brightness-0 invert',
          className
        )}
      />
    )
  }
  return (
    <span
      role="img"
      aria-label={label}
      className={cn(
        'flex flex-none items-center self-start text-[22px] leading-none font-semibold tracking-[-0.04em]',
        tone === 'white' ? 'text-white' : 'text-io-accent',
        className
      )}
    >
      indus
    </span>
  )
}
