'use client'

import { useState } from 'react'
import Image from 'next/image'

type Props = {
  images: Array<{ url: string; alt: string }>
  title: string
}

export default function ProductGallery({ images, title }: Props) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <div className="aspect-square border border-[var(--color-border)] bg-[var(--color-deep)] grid place-items-center relative overflow-hidden">
          <div className="font-mono text-[11px] tracking-[0.08em] text-[var(--color-muted)] text-center">
            <div className="text-4xl mb-3 opacity-20">⚙</div>
            {title}
          </div>
          <div
            className="absolute inset-0 pointer-events-none opacity-[0.04]"
            style={{
              backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
        </div>
      </div>
    )
  }

  const current = images[active]

  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-square border border-[var(--color-border)] bg-[var(--color-elevated)] relative overflow-hidden">
        <Image
          src={current!.url}
          alt={current!.alt}
          fill
          className="object-contain p-8"
          sizes="(max-width: 1280px) 100vw, 50vw"
          priority
        />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`aspect-square border bg-[var(--color-elevated)] relative overflow-hidden transition-colors ${i === active ? 'border-[var(--color-primary)] border-2' : 'border-[var(--color-border)] hover:border-[var(--color-body)]'}`}
              aria-label={`View image ${i + 1}`}
            >
              <Image src={img.url} alt={img.alt} fill className="object-contain p-2" sizes="10vw" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
