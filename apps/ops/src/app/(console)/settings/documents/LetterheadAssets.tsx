'use client'

import { useRouter } from 'next/navigation'
import ImageSlot from '../../../../components/setup/ImageSlot'

interface LetterheadAssetsProps {
  isOwner: boolean
  version: number
  logo: string | null
  stamp: string | null
  signatures: { userId: string; firstName: string; file: string | null }[]
}

const MAX = 5 * 1024 * 1024

/**
 * The letterhead images every document draws (S11-T07): the logo, the stamp and one signature per person,
 * stored in the private ops-company bucket and pointed at by the company.assets setting. Owner only; the Helper
 * sees which are set.
 */
export default function LetterheadAssets(p: LetterheadAssetsProps) {
  const router = useRouter()
  return (
    <section
      aria-labelledby="letterhead-eyebrow"
      className="rounded-io-card border-io-line bg-io-card flex flex-col gap-3 border px-[18px] py-4"
    >
      <h2 id="letterhead-eyebrow" className="io-eyebrow text-io-ink-3 m-0">
        Letterhead images
      </h2>
      {p.isOwner ? (
        <div className="grid grid-cols-3 gap-3">
          <ImageSlot
            label="Logo"
            slot={{ kind: 'logo' }}
            accept={['image/png', 'image/jpeg']}
            emptyText="Drop PNG or JPEG"
            fileName={p.logo}
            assetsVersion={p.version}
            maxBytes={MAX}
            onUploaded={() => router.refresh()}
          />
          <ImageSlot
            label="Stamp"
            slot={{ kind: 'stamp' }}
            accept={['image/png']}
            emptyText="Drop PNG"
            fileName={p.stamp}
            assetsVersion={p.version}
            maxBytes={MAX}
            onUploaded={() => router.refresh()}
          />
          {p.signatures.map((s) => (
            <ImageSlot
              key={s.userId}
              label={`Signature · ${s.firstName}`}
              slot={{ kind: 'signature', userId: s.userId }}
              accept={['image/png']}
              emptyText="Drop PNG"
              fileName={s.file}
              assetsVersion={p.version}
              maxBytes={MAX}
              onUploaded={() => router.refresh()}
            />
          ))}
        </div>
      ) : (
        <ul className="text-io-ink-2 m-0 flex list-none flex-col gap-1 p-0 text-[12.5px]">
          <li>Logo: {p.logo ?? 'not set'}</li>
          <li>Stamp: {p.stamp ?? 'not set'}</li>
          {p.signatures.map((s) => (
            <li key={s.userId}>
              Signature · {s.firstName}: {s.file ?? 'not set'}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
