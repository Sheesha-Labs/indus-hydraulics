'use client'

import { useState } from 'react'
import Image from 'next/image'

type Props = {
  images: Array<{ url: string; alt: string }>
  title: string
  /**
   * The nearest category's studio shot (already a URL), shown muted and tagged
   * when the product has no photograph of its own — see lib/category-fallback.
   */
  fallback?: { url: string; categoryName: string } | null
}

const HERO_BOX =
  'relative w-full aspect-[4/3] max-h-[min(56vh,480px)] border border-ih-border bg-ih-surface overflow-hidden'

export default function ProductGallery({ images, title, fallback }: Props) {
  const [active, setActive] = useState(0)

  if (images.length === 0 && fallback) {
    return (
      <div className="flex flex-col gap-3">
        <div className={HERO_BOX}>
          {/* Decorative: it pictures the range, not this part, so it carries no alt. */}
          <Image
            src={fallback.url}
            alt=""
            fill
            className="object-cover opacity-45 grayscale-[35%]"
            sizes="(max-width: 1280px) 100vw, 50vw"
            priority
          />
          <GridOverlay />
          <span className="border-ih-border bg-ih-surface text-ih-muted absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] truncate rounded-[3px] border px-2 py-1 font-mono text-[10.5px] tracking-[0.08em] uppercase">
            Category image · {fallback.categoryName}
          </span>
        </div>
      </div>
    )
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className={HERO_BOX + ' bg-ih-surface-2 grid place-items-center'}>
          <div className="text-ih-muted text-center font-mono text-[11px] tracking-[0.08em]">
            <div className="mb-3 text-4xl opacity-20">⚙</div>
            {title}
          </div>
          <GridOverlay />
        </div>
      </div>
    )
  }

  const current = images[active]!
  const calloutLabel = current.alt?.trim() || title

  return (
    <div className="flex flex-col gap-3">
      <div className={HERO_BOX}>
        <Image
          src={current.url}
          alt={current.alt}
          fill
          className="object-contain p-6"
          sizes="(max-width: 1280px) 100vw, 50vw"
          priority
        />
        <GridOverlay />

        {/* Top-left view callout (matches design's "VIEW 01 · 3/4 PERSPECTIVE") */}
        <div className="bg-ih-navy absolute top-4 left-4 max-w-[60%] px-2.5 py-1.5 font-mono text-[10px] tracking-[0.06em] text-white">
          <span className="opacity-70">VIEW {String(active + 1).padStart(2, '0')}</span>
          {calloutLabel && (
            <>
              <span className="mx-1.5 opacity-40">·</span>
              <span className="inline-block max-w-[200px] truncate align-middle uppercase">
                {calloutLabel}
              </span>
            </>
          )}
        </div>

        {/* Bottom-right index counter — minimal, not a fake scale */}
        {images.length > 1 && (
          <div className="bg-ih-navy absolute right-4 bottom-4 px-2.5 py-1.5 font-mono text-[10px] tracking-[0.06em] text-white">
            {active + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip — always 4 columns to match the design grid */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.slice(0, 8).map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              className={`bg-ih-surface relative aspect-square overflow-hidden border transition-colors ${
                i === active ? 'border-ih-ink border-2' : 'border-ih-border hover:border-ih-accent'
              }`}
              aria-label={`View ${i + 1}: ${img.alt || `image ${i + 1}`}`}
              aria-current={i === active ? 'true' : undefined}
            >
              <Image src={img.url} alt={img.alt} fill className="object-contain p-2" sizes="12vw" />
              {img.alt && (
                <span className="text-ih-muted absolute right-1 bottom-1 left-1 truncate text-left font-mono text-[9px] tracking-[0.04em]">
                  {img.alt}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function GridOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 opacity-[0.04]"
      style={{
        backgroundImage:
          'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    />
  )
}
