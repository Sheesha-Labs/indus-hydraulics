import { mediaUrl } from '../../../../lib/media'
import { signedUrlFor } from '../../../../lib/supabase'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { db } from '@indus/db'
import { verifyPreviewToken } from '@indus/domain'
import { getTranslations } from 'next-intl/server'
import { safeAuth } from '../../../../lib/auth'
import ProductGallery from '../../../../components/ProductGallery'
import AddToQuoteButton from '../../../../components/AddToQuoteButton'
import ProductTabs from '../../../../components/ProductTabs'
import ProductStickyBar from '../../../../components/ProductStickyBar'

type Props = {
  params: Promise<{ locale: string; sku: string }>
  searchParams: Promise<{ preview?: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { sku } = await params
  const product = await db.product.findUnique({
    where: { sku: decodeURIComponent(sku) },
    include: { brand: true },
  })
  if (!product) return {}
  return {
    title: product.seoTitle ?? `${product.title}`,
    description: product.seoDescription ?? product.descriptionShort ?? undefined,
  }
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { locale, sku } = await params
  const sp = (await searchParams) ?? {}
  await getTranslations({ locale, namespace: 'product' })
  const session = await safeAuth()
  const isSignedIn = !!session

  const decodedSku = decodeURIComponent(sku)
  let isPreview = false
  if (sp.preview) {
    try {
      isPreview = verifyPreviewToken(sp.preview, decodedSku).valid
    } catch {
      isPreview = false
    }
  }

  const product = await db.product.findUnique({
    where: { sku: decodedSku },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { position: 'asc' }, include: { media: true } },
      specs: { orderBy: { position: 'asc' } },
      documents: { orderBy: { position: 'asc' }, include: { media: true } },
      crossReferences: { take: 12 },
      questions: {
        where: { isPublished: true },
        orderBy: { createdAt: 'desc' },
        take: 50,
      },
      supersededBy: { select: { sku: true, title: true, slug: true } },
      specTemplate: {
        include: { fields: { orderBy: { position: 'asc' } } },
      },
    },
  })

  if (!product) notFound()
  if (product.status === 'draft' && !isPreview) notFound()

  const specGroups = product.specs.reduce<Record<string, typeof product.specs>>((acc, spec) => {
    const g = spec.group ?? 'General'
    if (!acc[g]) acc[g] = []
    acc[g].push(spec)
    return acc
  }, {})

  const quickSpecs = product.specs.filter((s) => s.isFilterable).slice(0, 6)

  // Template-driven key features. For every template field flagged
  // isKeyFeature with a value entered on the product, produce a bullet.
  // descriptionShort renders as its own paragraph elsewhere — it is no
  // longer used as a fallback bullet source.
  const specByFieldId = new Map(product.specs.filter((s) => s.templateFieldId).map((s) => [s.templateFieldId!, s]))
  const keyFeatures = (product.specTemplate?.fields ?? [])
    .filter((f) => f.isKeyFeature)
    .map((f) => {
      const spec = specByFieldId.get(f.id)
      if (!spec || !spec.value) return null
      // For boolean fields, only render bullets for affirmative values.
      if (f.dataType === 'boolean' && spec.value.toLowerCase() !== 'yes') return null
      const valuePart =
        f.dataType === 'boolean' ? f.label : f.unit ? `${spec.value} ${f.unit}` : spec.value
      const text = f.dataType === 'boolean' ? valuePart : `${f.label}: ${valuePart}`
      return { id: f.id, text }
    })
    .filter((x): x is { id: string; text: string } => x !== null)

  const related = product.categoryId
    ? await db.product.findMany({
        where: { categoryId: product.categoryId, status: 'active', sku: { not: product.sku } },
        take: 4,
        include: {
          brand: { select: { name: true } },
          images: { take: 1, orderBy: { position: 'asc' }, include: { media: true } },
        },
      })
    : []

  const firstDatasheet = product.documents.find((d) => !d.isGated || isSignedIn)
  let datasheetUrl: string | undefined
  if (firstDatasheet) {
    const path = firstDatasheet.media.storagePath
    datasheetUrl = path.startsWith('product-documents/') ? await signedUrlFor(path) : mediaUrl(path)
  }

  const tabSpecGroups = Object.fromEntries(
    Object.entries(specGroups).map(([g, specs]) =>
      [g, specs.map((s) => ({ id: s.id, label: s.label, value: s.value, unit: s.unit, group: s.group, isFilterable: s.isFilterable }))]
    )
  )

  // Resolve each doc to a download URL. Public bucket → mediaUrl gives the
  // direct public URL. Private bucket → mint a short-lived signed URL when
  // the user is signed in (or the doc isn't gated).
  const tabDocuments = await Promise.all(
    product.documents.map(async (d) => {
      const isPrivateBucket = d.media.storagePath.startsWith('product-documents/')
      const canAccess = !d.isGated || isSignedIn
      let url = ''
      if (canAccess) {
        url = isPrivateBucket ? await signedUrlFor(d.media.storagePath) : mediaUrl(d.media.storagePath)
      }
      return {
        id: d.id,
        title: d.title,
        kind: d.kind,
        language: d.language,
        isGated: d.isGated,
        mediaUrl: url,
      }
    }),
  )

  const tabCrossRefs = product.crossReferences.map((r) => ({
    id: r.id,
    competitorBrand: r.competitorBrand,
    competitorMpn: r.competitorMpn,
    compatibility: r.compatibility,
  }))

  return (
    <>
      {isPreview && (
        <div className="bg-[oklch(0.95_0.08_85)] border-b border-[oklch(0.75_0.12_85)] py-2.5 px-8 text-center font-mono text-[12px] text-[oklch(0.4_0.12_70)] tracking-[0.04em]">
          PREVIEW MODE · {product.status.toUpperCase()} · not visible to public
        </div>
      )}
      <div className="max-w-[1360px] mx-auto px-8">
        {/* Breadcrumbs */}
        <nav className="py-4 border-b border-[var(--color-border-2)] font-mono text-[12px] text-[var(--color-muted)] flex gap-2 items-center flex-wrap">
          <Link href={`/${locale}`} className="hover:text-[var(--color-primary)]">Home</Link>
          {product.category && (
            <>
              <span className="opacity-40">/</span>
              <Link href={`/${locale}/c/${product.category.slug}`} className="hover:text-[var(--color-primary)]">
                {product.category.name}
              </Link>
            </>
          )}
          <span className="opacity-40">/</span>
          <span className="text-[var(--color-primary)]">{product.sku}</span>
        </nav>

        {product.status === 'discontinued' && (
          <div className="py-3 px-4 bg-[oklch(0.97_0.02_25)] border border-[oklch(0.75_0.1_25)] text-[14px] text-[oklch(0.5_0.12_25)] font-medium mt-4">
            This product has been discontinued.
            {product.supersededBy && (
              <>
                {' · '}
                <Link href={`/${locale}/p/${product.supersededBy.sku}`} className="underline">
                  See replacement: {product.supersededBy.sku}
                </Link>
              </>
            )}
          </div>
        )}

        {/* PDP grid */}
        <div className="grid gap-14 py-10 pb-16" style={{ gridTemplateColumns: '1.1fr 1fr' }}>
          {/* Gallery */}
          <ProductGallery
            images={product.images.map((img) => ({
              url: mediaUrl(img.media.storagePath),
              alt: img.alt ?? img.media.alt ?? product.title,
            }))}
            title={product.title}
          />

          {/* Info column */}
          <div className="flex flex-col">
            {/* Eyebrow */}
            <div className="flex gap-3 items-center font-mono text-[11px] text-[var(--color-muted)] mb-3 tracking-[0.06em]">
              {product.brand && (
                <Link
                  href={`/${locale}/brands/${product.brand.slug}`}
                  className="bg-[var(--color-primary)] text-[var(--color-elevated)] px-2 py-1 hover:bg-[var(--color-body)] transition-colors"
                >
                  {product.brand.name.toUpperCase()}
                </Link>
              )}
              {product.category && (
                <span>{product.category.name.toUpperCase()}</span>
              )}
              {product.countryOfOrigin && (
                <span>· MADE IN {product.countryOfOrigin.toUpperCase()}</span>
              )}
            </div>

            <h1 className="text-[clamp(28px,3vw,38px)] font-semibold tracking-[-0.02em] leading-[1.1] mb-3">
              {product.title}
            </h1>

            {/* SKU / MPN / stock row */}
            <div className="flex gap-4 items-center flex-wrap pb-4 mb-4 border-b border-[var(--color-border-2)] font-mono text-[13px] text-[var(--color-muted)]">
              <span>SKU: <b className="text-[var(--color-primary)] font-medium">{product.sku}</b></span>
              {product.mpn && (
                <span>MFR P/N: <b className="text-[var(--color-primary)] font-medium">{product.mpn}</b></span>
              )}
              <StockPill stockQty={product.stockQty} warehouse={product.stockWarehouse} leadTimeDays={product.leadTimeDays} />
            </div>

            {/* Short description — prose blurb above the bullet list. */}
            {product.descriptionShort && (
              <p className="text-[15px] text-[var(--color-body)] leading-[1.55] mb-5 whitespace-pre-line">
                {product.descriptionShort}
              </p>
            )}

            {/* Key features — template-driven bullets. Empty when no template
                fields are flagged as Key feature, or no values have been entered. */}
            {keyFeatures.length > 0 && (
              <div className="pb-6">
                <h3 className="font-mono text-[11px] tracking-[0.14em] uppercase text-[var(--color-muted)] mb-3.5">Key features</h3>
                <ul className="flex flex-col gap-2.5">
                  {keyFeatures.map((feat) => (
                    <li
                      key={feat.id}
                      className="grid gap-2.5 text-[14px] leading-[1.5] text-[var(--color-body)]"
                      style={{ gridTemplateColumns: '16px 1fr' }}
                    >
                      <span className="text-[var(--color-accent)] font-semibold">✓</span>
                      <span>{feat.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Quick spec table */}
            {quickSpecs.length > 0 && (
              <div className="border border-[var(--color-border)] bg-[var(--color-elevated)] mb-6">
                <dl className="grid grid-cols-2">
                  {quickSpecs.map((spec, i) => (
                    <div
                      key={spec.id}
                      className={`flex flex-col px-4 py-3 border-[var(--color-border-2)] ${i % 2 === 0 ? 'border-r' : ''} ${i < quickSpecs.length - 2 ? 'border-b' : ''}`}
                    >
                      <dt className="font-mono text-[10px] tracking-[0.08em] text-[var(--color-caption)] uppercase">{spec.label}</dt>
                      <dd className="font-mono text-[14px] font-medium text-[var(--color-primary)] mt-1">
                        {spec.value}{spec.unit ? ` ${spec.unit}` : ''}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* CTA stack */}
            <div className="flex flex-col gap-2.5 pt-2 mb-4">
              <a
                href={`https://wa.me/912240000000?text=Enquiry on ${product.sku}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-12 flex items-center justify-center gap-2 text-[14px] font-medium text-white transition-opacity hover:opacity-90"
                style={{ background: '#16a34a' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-1 1.1-.2.2-.4.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.8-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.5.1-.1.3-.3.4-.5.1-.2.2-.3.2-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4zM12 2C6.5 2 2 6.5 2 12c0 1.7.4 3.3 1.2 4.7L2 22l5.4-1.4c1.4.8 2.9 1.2 4.6 1.2 5.5 0 10-4.5 10-10S17.5 2 12 2z" />
                </svg>
                Enquire on WhatsApp
              </a>
              <div className="grid grid-cols-2 gap-2">
                <AddToQuoteButton sku={product.sku} title={product.title} locale={locale} />
                <a
                  href={`mailto:enquiries@indushydraulics.com?subject=Quotation for ${product.sku}`}
                  className="h-12 flex items-center justify-center border border-[var(--color-border)] text-[13px] font-medium text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors"
                >
                  Email for Quotation
                </a>
              </div>
            </div>

            {/* Datasheet card */}
            {product.documents[0] && (
              <div className="flex gap-3 items-center p-4 border border-[var(--color-border)] bg-[var(--color-elevated)] mt-1 mb-6">
                <div className="w-9 h-11 bg-[var(--color-surface)] border border-[var(--color-border)] grid place-items-center font-mono text-[9px] font-semibold text-[var(--color-accent)] shrink-0">
                  {product.documents[0].kind.toUpperCase().slice(0, 4)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium truncate">{product.documents[0].title}</div>
                  <div className="font-mono text-[11px] text-[var(--color-muted)] mt-0.5">
                    {product.documents[0].kind} · {product.documents[0].language.toUpperCase()}
                  </div>
                </div>
                {product.documents[0].isGated && !isSignedIn ? (
                  <Link href={`/${locale}/sign-in`} className="shrink-0 font-mono text-[11px] text-[var(--color-accent)] hover:underline">
                    Sign in →
                  </Link>
                ) : (
                  <a
                    href={mediaUrl(product.documents[0].media.storagePath)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 h-8 px-3 flex items-center border border-[var(--color-border)] font-mono text-[11px] text-[var(--color-body)] hover:bg-[var(--color-deep)] transition-colors"
                  >
                    ↓ Download
                  </a>
                )}
              </div>
            )}

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-0 pt-5 border-t border-[var(--color-border-2)]">
              {[
                { title: 'Same-day dispatch', sub: 'Order before 14:00 IST · Mumbai & Houston' },
                { title: `${product.warrantyMonths ?? 24}-month warranty`, sub: 'Manufacturer-backed · genuine parts only' },
                { title: 'Engineering support', sub: 'Free application help · same-day response' },
              ].map((trust, i) => (
                <div key={trust.title} className={`px-4 ${i > 0 ? 'border-l border-[var(--color-border-2)]' : 'pl-0'} ${i === 2 ? 'pr-0' : ''}`}>
                  <div className="text-[13px] font-semibold mb-0.5">{trust.title}</div>
                  <div className="font-mono text-[11px] text-[var(--color-muted)] leading-[1.4]">{trust.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <ProductTabs
          locale={locale}
          sku={product.sku}
          productId={product.id}
          descriptionShort={product.descriptionShort}
          descriptionLong={product.descriptionLong}
          specGroups={tabSpecGroups}
          documents={tabDocuments}
          crossReferences={tabCrossRefs}
          questions={product.questions.map((q) => ({
            id: q.id,
            askerName: q.askerName,
            question: q.question,
            answer: q.answer,
            answeredAt: q.answeredAt?.toISOString() ?? null,
            createdAt: q.createdAt.toISOString(),
          }))}
          isSignedIn={isSignedIn}
          leadTimeDays={product.leadTimeDays}
          warrantyMonths={product.warrantyMonths}
          countryOfOrigin={product.countryOfOrigin}
          hsCode={product.hsCode}
          weightKg={product.weightKg ? Number(product.weightKg) : null}
        />

        {/* Related products */}
        {related.length > 0 && (
          <section className="border-t border-[var(--color-border)] pt-8 pb-20">
            <div className="mb-6">
              <div className="font-mono text-[11px] tracking-[0.16em] text-[var(--color-muted)] uppercase mb-2">RELATED · OFTEN PAIRED WITH</div>
              <h2 className="text-[28px] font-semibold tracking-[-0.02em]">Engineers viewing this also looked at</h2>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/${locale}/p/${rel.sku}`}
                  className="group border border-[var(--color-border)] bg-[var(--color-elevated)] overflow-hidden flex flex-col hover:border-[var(--color-body)] transition-colors"
                >
                  <div className="aspect-square border-b border-[var(--color-border-2)] bg-[var(--color-deep)] relative">
                    {rel.images[0] ? (
                      <Image
                        src={mediaUrl(rel.images[0]!.media.storagePath)}
                        alt={rel.title}
                        fill
                        className="object-contain p-4"
                        sizes="25vw"
                      />
                    ) : (
                      <div className="absolute inset-0 grid place-items-center font-mono text-[10px] text-[var(--color-muted)]">
                        {rel.sku}
                      </div>
                    )}
                  </div>
                  <div className="p-4 pb-5">
                    <div className="font-mono text-[11px] text-[var(--color-caption)] mb-1.5">{rel.sku}</div>
                    <h4 className="text-[14px] font-medium leading-[1.3] mb-2 group-hover:text-[var(--color-accent)] transition-colors">
                      {rel.title}
                    </h4>
                    {rel.brand && (
                      <div className="font-mono text-[11px] text-[var(--color-muted)]">{rel.brand.name}</div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Sticky enquiry bar */}
      <ProductStickyBar
        locale={locale}
        title={product.title}
        sku={product.sku}
        datasheetUrl={datasheetUrl}
      />
    </>
  )
}

// ── Stock pill — green when stocked, amber for build-to-order, grey when neither ─────────────
function StockPill({
  stockQty,
  warehouse,
  leadTimeDays,
}: {
  stockQty: number
  warehouse: string | null
  leadTimeDays: number | null
}) {
  if (stockQty > 0) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[11px] font-medium tracking-[0.04em]"
        style={{ background: 'oklch(0.95 0.05 150)', color: 'oklch(0.45 0.12 150)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.55 0.15 150)' }} />
        In stock · {stockQty} unit{stockQty === 1 ? '' : 's'}
        {warehouse ? ` · ${warehouse}` : ''}
      </span>
    )
  }
  if (leadTimeDays !== null && leadTimeDays > 0) {
    return (
      <span
        className="inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[11px] font-medium tracking-[0.04em]"
        style={{ background: 'oklch(0.95 0.05 80)', color: 'oklch(0.45 0.13 70)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'oklch(0.6 0.15 70)' }} />
        Lead time · {leadTimeDays} day{leadTimeDays === 1 ? '' : 's'}
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[11px] font-medium tracking-[0.04em]"
      style={{ background: 'var(--color-deep)', color: 'var(--color-muted)' }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--color-muted)' }} />
      Contact for availability
    </span>
  )
}
