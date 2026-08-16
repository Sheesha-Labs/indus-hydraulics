import Image from 'next/image'
import { mediaUrl } from '../../lib/media'

type Props = {
  storagePath: string | null | undefined
  alt: string
  /** Plain-text label drawn in the placeholder when storagePath is missing. */
  placeholderLabel?: string | null
  /** Tailwind class for the wrapper div (e.g. aspect ratio + position). */
  className?: string
  /** next/image sizes attribute (only used when image present). */
  sizes?: string
  /** Whether the image should fill the container. Default true. */
  fill?: boolean
  /** Mark as priority load — for above-the-fold heroes. */
  priority?: boolean
}

/**
 * Renders an image when a storagePath exists, otherwise renders a placeholder
 * box with diagonal hatching and an optional centred label. Used everywhere a
 * /services case might not yet have an uploaded photo.
 */
export default function PlaceholderImage({
  storagePath,
  alt,
  placeholderLabel,
  className = '',
  sizes = '100vw',
  fill = true,
  priority = false,
}: Props) {
  if (storagePath) {
    return (
      <div className={`relative overflow-hidden bg-ih-surface-2 ${className}`}>
        <Image
          src={mediaUrl(storagePath)}
          alt={alt}
          fill={fill}
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      </div>
    )
  }
  return (
    <div
      className={`relative grid place-items-center bg-ih-surface-2 [background-image:repeating-linear-gradient(-45deg,transparent_0,transparent_9px,oklch(0_0_0/0.05)_9px,oklch(0_0_0/0.05)_10px)] ${className}`}
      role="img"
      aria-label={alt}
    >
      {placeholderLabel ? (
        <span className="mono whitespace-pre-line px-4 text-center text-[11px] tracking-[0.06em] text-ih-muted">
          {placeholderLabel}
        </span>
      ) : null}
    </div>
  )
}
