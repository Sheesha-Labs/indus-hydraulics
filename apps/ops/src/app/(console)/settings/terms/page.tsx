import { isTermsCategory, TERMS_CATEGORIES, type TermsCategory } from '@indus/ops-core'
import { requireOpsUser } from '../../../../lib/access'
import { signInFor } from '../../../../lib/page-access'
import { getTermsLibrary } from '../../../../server/terms/clauses'
import { openImports } from '../../../../server/terms/import'
import { clientChoices } from '../../../../server/terms/presets'
import TermsLibrary from './TermsLibrary'

/**
 * Settings › Offer terms (board 39, S11-T06): the clause library by category, the presets clients get, the
 * variables, and "Import from offer". Everyone signed in may read it; only the Owner changes it.
 */
export default async function SettingsTermsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; preset?: string }>
}) {
  const user = await requireOpsUser().catch(signInFor(`/settings/terms`))
  const sp = await searchParams
  const category: TermsCategory =
    sp.category && isTermsCategory(sp.category) ? sp.category : TERMS_CATEGORIES[0]
  const isOwner = user.role === 'owner'
  const [lib, imports, clients] = await Promise.all([
    getTermsLibrary(),
    openImports(),
    isOwner ? clientChoices() : Promise.resolve([]),
  ])
  const preset = lib.presets.find((p) => p.id === sp.preset) ?? null
  return (
    <TermsLibrary
      category={category}
      counts={lib.counts}
      clauses={lib.clauses.filter((c) => c.category === category)}
      allClauses={lib.clauses.map((c) => ({ id: c.id, code: c.code, title: c.title }))}
      presets={lib.presets}
      selectedPresetId={preset?.id ?? null}
      imports={imports}
      clients={clients}
      isOwner={isOwner}
    />
  )
}
