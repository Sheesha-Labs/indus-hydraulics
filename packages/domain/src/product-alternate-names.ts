/**
 * Trade names for a fitting in the languages buyers actually use.
 *
 * A German engineer looking for the part we title "45° Metric Female 24°
 * O-ring Cone (Light Series) Hose Fitting" searches for a DKO-L Bogen. That
 * is not a translation of our title — it is the designation the part carries
 * in its own market, and someone who knows it will not find us by any amount
 * of English.
 *
 * Two rules shape everything here, and both exist because the failure mode is
 * worse than the gap:
 *
 *   1. **Compose, never translate.** Every name is assembled from a fixed
 *      vocabulary of trade terms against attributes we hold. Nothing is
 *      passed through a translator, because "cône 24°" is a technical
 *      designation and a plausible-looking wrong one sends a specifying
 *      engineer the wrong part.
 *   2. **Emit nothing rather than guess.** If the attributes do not resolve
 *      confidently, the product gets no alternate names at all. A missing
 *      name costs a search impression; a wrong one costs an order and the
 *      credibility to win the next.
 *
 * Word order is per-language, not substitution. German leads with the DIN
 * designation and puts the gender term after the bend; Romance languages lead
 * with gender. Substituting word-for-word into an English skeleton produces
 * something no native speaker in the trade would type.
 *
 * The vocabulary below is the whole reviewable surface. Correcting a term
 * here corrects it everywhere.
 */

export const ALTERNATE_NAME_LANGS = ['de', 'fr', 'es', 'it'] as const
export type AlternateNameLang = (typeof ALTERNATE_NAME_LANGS)[number]

export type AlternateName = { lang: AlternateNameLang; name: string }

/** Bend of the body. */
export type Configuration = 'straight' | 'elbow-45' | 'elbow-90'
export type Gender = 'male' | 'female'
/** Thread standard. Most are international designations left as-is. */
export type ThreadStandard = 'metric' | 'bsp' | 'jic' | 'npt' | 'npsm' | 'orfs' | 'jis'
/** Sealing geometry — the angle is part of the designation, not a dimension. */
export type Seat = 'cone-24' | 'cone-37' | 'cone-60' | 'flat' | 'oring-flat'
/** DIN 2353 tube series. */
export type Series = 'light' | 'heavy'
export type Kind = 'hose-fitting' | 'adapter' | 'coupling' | 'nut'

export type FittingAttributes = {
  configuration?: Configuration | null
  gender?: Gender | null
  thread?: ThreadStandard | null
  seat?: Seat | null
  series?: Series | null
  kind?: Kind | null
  /** True when the seal carries an O-ring, which several languages name explicitly. */
  oring?: boolean
  /**
   * True when the product connects two different thread standards.
   *
   * A great many adapters do — "Male Connector m ORFS X m Metric Flat" is
   * ORFS at one end and metric at the other. This type holds a single thread,
   * so such a product cannot be named correctly and is declined rather than
   * named by whichever end happened to parse first.
   */
  twoEnded?: boolean
}

// ── Vocabulary ──────────────────────────────────────────────────────────────
// One row per concept, four trade terms. This is the file to correct.

const GENDER: Record<Gender, Record<AlternateNameLang, string>> = {
  // German uses the thread itself — outside thread / inside thread — rather
  // than a gendered adjective.
  male: { de: 'Außengewinde', fr: 'mâle', es: 'macho', it: 'maschio' },
  female: { de: 'Innengewinde', fr: 'femelle', es: 'hembra', it: 'femmina' },
}

const THREAD: Record<ThreadStandard, Record<AlternateNameLang, string>> = {
  metric: { de: 'metrisch', fr: 'métrique', es: 'métrica', it: 'metrica' },
  // The rest are international designations. Translating them would be wrong:
  // a BSP thread is called BSP in every catalogue in every language.
  bsp: { de: 'BSP', fr: 'BSP', es: 'BSP', it: 'BSP' },
  jic: { de: 'JIC', fr: 'JIC', es: 'JIC', it: 'JIC' },
  npt: { de: 'NPT', fr: 'NPT', es: 'NPT', it: 'NPT' },
  npsm: { de: 'NPSM', fr: 'NPSM', es: 'NPSM', it: 'NPSM' },
  orfs: { de: 'ORFS', fr: 'ORFS', es: 'ORFS', it: 'ORFS' },
  jis: { de: 'JIS', fr: 'JIS', es: 'JIS', it: 'JIS' },
}

const SEAT: Record<Seat, Record<AlternateNameLang, string>> = {
  'cone-24': { de: '24° Konus', fr: 'cône 24°', es: 'cono 24°', it: 'cono 24°' },
  'cone-37': { de: '37° Bördel', fr: 'cône 37°', es: 'cono 37°', it: 'cono 37°' },
  'cone-60': { de: '60° Konus', fr: 'cône 60°', es: 'cono 60°', it: 'cono 60°' },
  flat: { de: 'flachdichtend', fr: 'siège plat', es: 'asiento plano', it: 'sede piana' },
  'oring-flat': {
    de: 'O-Ring flachdichtend',
    fr: 'joint torique plat',
    es: 'junta tórica plana',
    it: 'O-ring piano',
  },
}

const CONFIGURATION: Record<Configuration, Record<AlternateNameLang, string>> = {
  straight: { de: 'gerade', fr: 'droit', es: 'recto', it: 'diritto' },
  'elbow-45': { de: '45° Bogen', fr: 'coude 45°', es: 'codo 45°', it: 'gomito 45°' },
  'elbow-90': { de: '90° Bogen', fr: 'coude 90°', es: 'codo 90°', it: 'gomito 90°' },
}

const SERIES: Record<Series, Record<AlternateNameLang, string>> = {
  light: { de: 'Leichte Reihe (L)', fr: 'série L', es: 'serie L', it: 'serie L' },
  heavy: { de: 'Schwere Reihe (S)', fr: 'série S', es: 'serie S', it: 'serie S' },
}

const KIND: Record<Kind, Record<AlternateNameLang, string>> = {
  'hose-fitting': {
    de: 'Schlaucharmatur',
    fr: 'embout de flexible',
    es: 'racor de manguera',
    it: 'raccordo per tubo',
  },
  adapter: { de: 'Adapter', fr: 'adaptateur', es: 'adaptador', it: 'adattatore' },
  coupling: { de: 'Kupplung', fr: 'raccord', es: 'acoplamiento', it: 'giunto' },
  nut: { de: 'Überwurfmutter', fr: 'écrou tournant', es: 'tuerca giratoria', it: 'dado girevole' },
}

const ORING: Record<AlternateNameLang, string> = {
  de: 'mit O-Ring',
  fr: 'avec joint torique',
  es: 'con junta tórica',
  it: 'con O-ring',
}

/**
 * DIN 2353 sealing-cone designations.
 *
 * These are the names the parts are actually ordered by across the German,
 * Italian and Eastern European trade — DKO for a 24° sealing cone, suffixed
 * L or S for the tube series. Emitting them is most of the value of this
 * whole exercise, because they are what a buyer types.
 */
function dinDesignation(attrs: FittingAttributes): string | null {
  if (attrs.seat !== 'cone-24' || !attrs.oring) return null
  if (attrs.series === 'light') return 'DKO-L'
  if (attrs.series === 'heavy') return 'DKO-S'
  return 'DKO'
}

function join(parts: (string | null | undefined)[]): string {
  return parts.filter((p): p is string => !!p && p.length > 0).join(' ').replace(/\s+/g, ' ').trim()
}

// ── Per-language composition ────────────────────────────────────────────────
// Word order differs by language. These are not one function with a lookup.

function composeDe(a: FittingAttributes): string {
  // German leads with the DIN designation where one applies, then the bend,
  // then the thread, then the seal.
  return join([
    dinDesignation(a),
    a.configuration ? CONFIGURATION[a.configuration].de : null,
    a.thread === 'metric' ? THREAD.metric.de : a.thread ? THREAD[a.thread].de : null,
    a.gender ? GENDER[a.gender].de : null,
    a.oring ? ORING.de : null,
    a.seat ? SEAT[a.seat].de : null,
    a.kind ? KIND[a.kind].de : null,
  ])
}

function composeFr(a: FittingAttributes): string {
  // French leads with gender, then bend, then thread, then seal, with the
  // series appended after a dash.
  const head = join([
    a.gender ? GENDER[a.gender].fr : null,
    a.configuration && a.configuration !== 'straight' ? CONFIGURATION[a.configuration].fr : null,
    a.thread ? THREAD[a.thread].fr : null,
    a.seat ? SEAT[a.seat].fr : null,
    a.oring ? ORING.fr : null,
    a.kind ? KIND[a.kind].fr : null,
  ])
  return a.series ? `${head} – ${SERIES[a.series].fr}` : head
}

function composeEs(a: FittingAttributes): string {
  const head = join([
    a.gender ? GENDER[a.gender].es : null,
    a.thread ? THREAD[a.thread].es : null,
    a.configuration && a.configuration !== 'straight' ? CONFIGURATION[a.configuration].es : null,
    a.oring ? ORING.es : null,
    a.seat ? SEAT[a.seat].es : null,
    a.kind ? KIND[a.kind].es : null,
  ])
  return a.series ? `${head} – ${SERIES[a.series].es}` : head
}

function composeIt(a: FittingAttributes): string {
  const head = join([
    a.gender ? GENDER[a.gender].it : null,
    a.configuration && a.configuration !== 'straight' ? CONFIGURATION[a.configuration].it : null,
    a.thread ? THREAD[a.thread].it : null,
    a.seat ? SEAT[a.seat].it : null,
    dinDesignation(a)?.replace('-', ''),
    a.oring ? ORING.it : null,
    a.kind ? KIND[a.kind].it : null,
  ])
  return a.series && !dinDesignation(a) ? `${head} – ${SERIES[a.series].it}` : head
}

/**
 * Minimum information for a name to be worth publishing.
 *
 * A name carrying only "female" or only "metric" is not a trade designation,
 * it is a fragment, and it would compete for searches it cannot satisfy.
 * Requiring a thread standard plus one more identifying attribute is the
 * line between a name and a word.
 */
export function hasEnoughToName(a: FittingAttributes): boolean {
  if (!a.thread) return false
  // A product with two different threads is an adapter between them, and this
  // model holds one thread. Naming it by either end is wrong — "macho ORFS"
  // for a part that is ORFS one end and BSP the other sends a buyer the wrong
  // component. Decline and leave it to the English title.
  if (a.twoEnded) return false
  // `straight` is the default body and identifies nothing. Counting it lets
  // "mâle BSP" through, which is a pair of words rather than a designation
  // anyone searches for.
  const identifying = [
    a.gender,
    a.seat,
    a.configuration && a.configuration !== 'straight' ? a.configuration : null,
    a.series,
  ].filter(Boolean).length
  return identifying >= 2
}

/**
 * Alternate trade names for a fitting, or an empty array when the attributes
 * are too thin to name it confidently.
 */
export function buildAlternateNames(attrs: FittingAttributes): AlternateName[] {
  if (!hasEnoughToName(attrs)) return []
  const composed: Record<AlternateNameLang, string> = {
    de: composeDe(attrs),
    fr: composeFr(attrs),
    es: composeEs(attrs),
    it: composeIt(attrs),
  }
  return ALTERNATE_NAME_LANGS.map((lang) => ({ lang, name: composed[lang] })).filter(
    (n) => n.name.length > 0,
  )
}

/** Flat list for the FTS alias blob and for `Product.alternateName` in JSON-LD. */
export function alternateNameStrings(names: AlternateName[]): string[] {
  return names.map((n) => n.name)
}
