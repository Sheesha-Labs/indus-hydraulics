'use client'

import { useState, useTransition } from 'react'
import { asLogoStyle, type LogoStyle } from '../../../../lib/brand-identity'
import { saveBrandIdentity } from './actions'
import {
  FaviconField,
  FooterLogoField,
  LogoField,
  SearchLogoField,
  type BrandImageOption,
} from './BrandImageFields'

export type BrandIdentityInitial = {
  logoMediaId: string | null
  logoStyle: string
  footerLogoMediaId: string | null
  faviconMediaId: string | null
  searchLogoMediaId: string | null
}

/**
 * Brand & identity — the four brand images, on one form and one save.
 *
 * State lives here rather than in each picker because the search-logo field
 * previews the *resolved* mark, which depends on the favicon and header logo
 * chosen in the sibling fields. Reading that from a shared parent is what lets
 * the SERP rehearsal update as soon as the favicon changes, instead of lying
 * until the page is reloaded.
 */
export default function BrandIdentityForm({
  initial,
  brandName,
  tagline,
  options,
}: {
  initial: BrandIdentityInitial
  /** Store name, drawn in the tab and search rehearsals. */
  brandName: string
  tagline: string | null
  /** Media library rows the pickers can choose from. */
  options: BrandImageOption[]
}) {
  const [logo, setLogo] = useState(initial.logoMediaId ?? '')
  const [logoStyle, setLogoStyle] = useState<LogoStyle>(asLogoStyle(initial.logoStyle))
  const [footerLogo, setFooterLogo] = useState(initial.footerLogoMediaId ?? '')
  const [favicon, setFavicon] = useState(initial.faviconMediaId ?? '')
  const [searchLogo, setSearchLogo] = useState(initial.searchLogoMediaId ?? '')

  const [isPending, startTransition] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const urlOf = (id: string) => options.find((o) => o.id === id)?.url ?? null

  function handleSubmit(formData: FormData) {
    setError(null)
    startTransition(async () => {
      const res = await saveBrandIdentity(formData)
      if (!res.success) {
        setError(res.message)
        return
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <form action={handleSubmit} className="max-w-[720px] space-y-4">
      <p className="text-[13px] leading-[1.6] text-ih-muted">
        The marks that stand for Indus Hydraulics on the storefront. Each surface takes its own file
        because each one wants a different one — the footer is dark, a tab strip is 16px wide, and a
        search result is a small circular chip.
      </p>

      <LogoField
        value={logo}
        style={logoStyle}
        options={options}
        onChange={setLogo}
        onStyleChange={setLogoStyle}
      />
      {/* Emitted outside the picker: the placement toggle is a button group,
          not an input, so its value needs its own hidden field. */}
      <input type="hidden" name="logoStyle" value={logoStyle} />

      <FooterLogoField value={footerLogo} options={options} onChange={setFooterLogo} />

      <FaviconField
        value={favicon}
        brandName={brandName}
        options={options}
        onChange={setFavicon}
      />

      <SearchLogoField
        value={searchLogo}
        brandName={brandName}
        tagline={tagline}
        // The same chain the server resolves — favicon, then header logo — so
        // the rehearsal shows what a crawler would actually get today.
        fallbackUrl={urlOf(favicon) ?? urlOf(logo)}
        options={options}
        onChange={setSearchLogo}
      />

      {error && (
        <p className="text-[12px] text-ih-danger" role="alert">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3 pt-1">
        <button
          type="submit"
          disabled={isPending}
          className="h-9 px-5 bg-ih-accent text-ih-accent-fg text-[13px] font-medium hover:bg-ih-accent-hover disabled:opacity-50"
        >
          {isPending ? 'Saving…' : 'Save brand & identity'}
        </button>
        {saved && <span className="text-[12px] text-ih-success">Saved.</span>}
      </div>
    </form>
  )
}
