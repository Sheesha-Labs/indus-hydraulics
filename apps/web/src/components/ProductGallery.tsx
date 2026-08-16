'use client'

import { useState } from 'react'
import Image from 'next/image'

type Props = {
  images: Array<{ url: string; alt: string }>
  title: string
}

const HERO_BOX = 'relative w-full aspect-[4/3] max-h-[min(56vh,480px)] border border-ih-border bg-ih-surface overflow-hidden'

export default function ProductGallery({ images, title }: Props) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className={HERO_BOX + ' bg-ih-surface-2 grid place-items-center'}>
          <div className="font-mono text-[11px] tracking-[0.08em] text-ih-muted text-center">
            <div className="text-4xl mb-3 opacity-20">⚙</div>
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
        <div className="absolute top-4 left-4 bg-ih-navy text-white font-mono text-[10px] tracking-[0.06em] px-2.5 py-1.5 max-w-[60%]">
          <span className="opacity-70">VIEW {String(active + 1).padStart(2, '0')}</span>
          {calloutLabel && (
            <>
              <span className="opacity-40 mx-1.5">·</span>
              <span className="uppercase truncate align-middle inline-block max-w-[200px]">{calloutLabel}</span>
            </>
          )}
        </div>

        {/* Bottom-right index counter — minimal, not a fake scale */}
        {images.length > 1 && (
          <div className="absolute bottom-4 right-4 bg-ih-navy text-white font-mono text-[10px] tracking-[0.06em] px-2.5 py-1.5">
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
              className={`relative aspect-square border bg-ih-surface overflow-hidden transition-colors ${
                i === active
                  ? 'border-ih-ink border-2'
                  : 'border-ih-border hover:border-ih-accent'
              }`}
              aria-label={`View ${i + 1}: ${img.alt || `image ${i + 1}`}`}
              aria-current={i === active ? 'true' : undefined}
            >
              <Image src={img.url} alt={img.alt} fill className="object-contain p-2" sizes="12vw" />
              {img.alt && (
                <span className="absolute bottom-1 left-1 right-1 font-mono text-[9px] tracking-[0.04em] text-ih-muted truncate text-left">
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
      className="absolute inset-0 pointer-events-none opacity-[0.04]"
      style={{
        backgroundImage:
          'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    />
  )
}
