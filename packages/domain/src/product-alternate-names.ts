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
export type ThreadStandard =
  | 'metric'
  | 'bsp'
  // BSP taper, kept separate from parallel BSP. Each of these trades has its
  // own name for the taper and buyers use it — "gaz conique", "gas cónica".
  | 'bspt'
  | 'jic'
  | 'npt'
  | 'npsm'
  | 'orfs'
  | 'jis'
  | 'sae'
  | 'unf'
  // A manufacturer port designation, like Storz or Geka. Komatsu everywhere.
  | 'komatsu'
  // SAE J1926 straight-thread O-ring port. A PORT FORM, not a seal — must not
  // be conflated with the `oring` flag, which says the seal carries an O-ring.
  | 'orb'
/** Sealing geometry — the angle is part of the designation, not a dimension. */
export type Seat = 'cone-24' | 'cone-37' | 'cone-45' | 'cone-60' | 'flat' | 'oring-flat' | 'inverted-flare'
/** DIN 2353 tube series. */
export type Series = 'light' | 'heavy'
export type Kind = 'hose-fitting' | 'crimp-fitting' | 'adapter' | 'coupling' | 'nut'

/**
 * What the part physically is, where that is more identifying than its thread.
 *
 * A "Swivel Cap JIC" is a cap; a "Bulkhead Elbow Union Metric" is a bulkhead
 * fitting. Both were declined for having a thread and only one other
 * attribute, when the body type was sitting in the title all along and is
 * exactly what a buyer searches — Verschlusskappe, Schottverschraubung.
 */
export type BodyType =
  | 'tee'
  | 'cross'
  | 'cap'
  | 'plug'
  | 'reducer'
  | 'bulkhead'
  | 'banjo'
  | 'union'
  | 'nipple'
  // DIN 2353 / DIN 3861 vocabulary. German-origin standards, so the German is
  // the catalogue heading rather than a rendering of the English.
  | 'male-stud-connector'
  | 'cutting-ring'
  | 'weld-connector'
  | 'ed-seal'
  | 'bonded-seal'
  // The jam nut on an adjustable stud end. Distinct from KIND.nut, which is
  // the compression nut — substituting one for the other ships a wrong part.
  | 'lock-nut'
  | 'hex-nut'
  | 'wing-nut'
  | 'hose-shank'
  | 'flange'
  | 'swivel-joint'
  | 'nozzle-holder'

/**
 * Coupling systems that are named by their family rather than by a thread.
 *
 * These are self-identifying: "Storz" and "Camlock" are the designations
 * across every catalogue in every language, and a Storz coupling has no
 * thread standard to speak of. Three whole categories were declining at 100%
 * because the model insisted on a thread that does not exist for them.
 */
export type CouplingFamily =
  | 'storz'
  | 'cam-groove'
  | 'crimp-ferrule'
  | 'hose-clamp'
  | 'air-coupling'
  | 'quick-coupling'
  | 'hammer-union'
  // Eponymous standards. Bauer and Guillemin are named after their originators
  // and carry those names in every catalogue, exactly like Storz.
  | 'bauer'
  | 'guillemin'
  | 'sae-flange'
  | 'geka'
  | 'gost'
  // Large-bore suction / slurry coupling. "KC" is the designation everywhere.
  | 'kc'
  // Shell / clamp hose fitting to EN 14420-5. GA and GI ride as couplingType.
  | 'en14420-5'
  // Tank-truck coupling, DIN 28450 / EN 14420-6. "TW" rides as couplingType.
  | 'tank-truck'
  // Thorburn's proprietary metallic-hose range. Series codes ride as type.
  | 'met-o-seal'

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
   * The second connection, for adapters that join two standards.
   *
   * "Male Connector m ORFS X m Metric Flat" is ORFS at one end and metric at
   * the other. Naming it by either end alone is wrong, which is why 191 of
   * these were declined outright before the model could express them. Now
   * both ends are carried and the name says so.
   */
  endB?: { thread?: ThreadStandard | null; gender?: Gender | null; seat?: Seat | null } | null
  /** What the part is, when that identifies it better than its thread. */
  body?: BodyType | null
  /** Coupling system, for parts named by family rather than by thread. */
  couplingFamily?: CouplingFamily | null
  /**
   * Family-specific designation kept verbatim — a Camlock "Type C", a hammer
   * union "1502". These are international and must never be translated.
   */
  couplingType?: string | null
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
  sae: { de: 'SAE', fr: 'SAE', es: 'SAE', it: 'SAE' },
  unf: { de: 'UNF', fr: 'UNF', es: 'UNF', it: 'UNF' },
  komatsu: { de: 'Komatsu', fr: 'Komatsu', es: 'Komatsu', it: 'Komatsu' },
  // The designation stays; the parenthetical is the name each trade actually
  // uses for the taper, so both searches land. German "R-Gewinde" is ISO 7-1.
  bspt: {
    de: 'BSPT (kegeliges R-Gewinde)',
    fr: 'BSPT (gaz conique)',
    es: 'BSPT (gas cónica)',
    it: 'BSPT (gas conico)',
  },
  // Kept English in all four. The German long form "SAE-Einschraubzapfen mit
  // O-Ring" exists but is not what anyone types.
  orb: {
    de: 'O-Ring Boss (ORB)',
    fr: 'O-Ring Boss (ORB)',
    es: 'O-Ring Boss (ORB)',
    it: 'O-Ring Boss (ORB)',
  },
}

const BODY: Record<BodyType, Record<AlternateNameLang, string>> = {
  tee: { de: 'T-Stück', fr: 'té', es: 'te', it: 'raccordo a T' },
  cross: { de: 'Kreuzstück', fr: 'croix', es: 'cruz', it: 'croce' },
  // German distinguishes the female cap from the male plug, as do the Romance
  // languages; English uses "cap" for both and relies on context.
  cap: { de: 'Verschlusskappe', fr: 'bouchon femelle', es: 'tapón hembra', it: 'cappuccio' },
  plug: { de: 'Verschlussstopfen', fr: 'bouchon mâle', es: 'tapón macho', it: 'tappo' },
  reducer: { de: 'Reduzierung', fr: 'réducteur', es: 'reductor', it: 'riduzione' },
  bulkhead: {
    de: 'Schottverschraubung',
    fr: 'traversée de cloison',
    es: 'pasamuros',
    it: 'passaparatia',
  },
  // "Banjo" is the term in every language; only the German has a native word
  // and both are in use.
  banjo: { de: 'Ringstück (Banjo)', fr: 'banjo', es: 'banjo', it: 'banjo' },
  union: { de: 'Verschraubung', fr: 'union', es: 'unión', it: 'giunto' },
  nipple: { de: 'Nippel', fr: 'mamelon', es: 'niple', it: 'nipplo' },
  // HANSA-FLEX and Parker Ermeto both head this range
  // "Einschraubverschraubung"; the French is Parker Ermeto FR's own term.
  'male-stud-connector': {
    de: 'Einschraubverschraubung',
    fr: 'union simple mâle',
    es: 'racor macho',
    it: 'raccordo maschio',
  },
  // DIN 3861. Italian is "anello tagliente", never "ogiva" — that is the
  // pneumatic olive, a different profile.
  'cutting-ring': {
    de: 'Schneidring',
    fr: 'bague coupante',
    es: 'anillo cortante',
    it: 'anello tagliente',
  },
  'weld-connector': {
    de: 'Anschweißstutzen',
    fr: 'raccord à souder',
    es: 'racor para soldar',
    it: 'raccordo a saldare',
  },
  // DIN 3869. The two letters are the designation in every language.
  'ed-seal': {
    de: 'ED-Dichtring',
    fr: 'joint ED',
    es: 'junta ED',
    it: 'guarnizione ED',
  },
  // German has its own name and it is the one buyers type; the other three
  // keep the English designation, which is what their catalogues print.
  'bonded-seal': {
    de: 'Usit-Ring (Bonded Seal)',
    fr: 'joint Bonded Seal',
    es: 'junta Bonded Seal',
    it: 'guarnizione Bonded Seal',
  },
  'lock-nut': {
    de: 'Kontermutter',
    fr: 'contre-écrou',
    es: 'contratuerca',
    it: 'controdado',
  },
  'hex-nut': {
    de: 'Sechskantmutter',
    fr: 'écrou hexagonal',
    es: 'tuerca hexagonal',
    it: 'dado esagonale',
  },
  'wing-nut': {
    de: 'Flügelmutter',
    fr: 'écrou à oreilles',
    es: 'tuerca de mariposa',
    it: 'dado ad alette',
  },
  // The barbed tail a hose clamps onto. German "Schlauchstutzen" is an
  // accepted synonym.
  'hose-shank': {
    de: 'Schlauchtülle',
    fr: 'douille cannelée',
    es: 'espiga portamanguera',
    it: 'portagomma',
  },
  flange: { de: 'Flansch', fr: 'bride', es: 'brida', it: 'flangia' },
  // A component, not the `swivel` adjective — never compose the two.
  'swivel-joint': {
    de: 'Drehgelenk',
    fr: 'joint tournant',
    es: 'junta giratoria',
    it: 'giunto girevole',
  },
  'nozzle-holder': {
    de: 'Düsenhalter',
    fr: 'porte-buse',
    es: 'portaboquillas',
    it: 'portaugello',
  },
}

/**
 * Coupling families.
 *
 * Storz and Camlock are already the international designations — a Storz
 * coupling is a Storz coupling in Lisbon and in Hamburg — so the term stays
 * and only the word "coupling" around it changes.
 */
const COUPLING: Record<CouplingFamily, Record<AlternateNameLang, string>> = {
  storz: {
    de: 'Storz-Kupplung',
    fr: 'raccord Storz',
    es: 'acoplamiento Storz',
    it: 'raccordo Storz',
  },
  'cam-groove': {
    de: 'Kamlok-Kupplung',
    fr: 'raccord Camlock',
    es: 'acoplamiento Camlock',
    it: 'raccordo Camlock',
  },
  'crimp-ferrule': {
    de: 'Presshülse',
    fr: 'jupe de sertissage',
    es: 'casquillo de prensado',
    it: 'boccola di pressatura',
  },
  'hose-clamp': {
    de: 'Schlauchschelle',
    fr: 'collier de serrage',
    es: 'abrazadera de manguera',
    it: 'fascetta stringitubo',
  },
  'air-coupling': {
    de: 'Druckluftkupplung',
    fr: 'raccord pneumatique',
    es: 'acoplamiento neumático',
    it: 'innesto pneumatico',
  },
  'quick-coupling': {
    de: 'Schnellkupplung',
    fr: 'raccord rapide',
    es: 'acoplamiento rápido',
    it: 'innesto rapido',
  },
  'hammer-union': {
    de: 'Hammerverschraubung',
    fr: 'union à marteau',
    es: 'unión de martillo',
    it: 'giunto a martello',
  },
  bauer: {
    de: 'Bauer-Kupplung',
    fr: 'raccord Bauer',
    es: 'acoplamiento Bauer',
    it: 'raccordo Bauer',
  },
  guillemin: {
    de: 'Guillemin-Kupplung',
    fr: 'raccord Guillemin',
    es: 'acoplamiento Guillemin',
    it: 'raccordo Guillemin',
  },
  'sae-flange': {
    de: 'SAE-Flansch',
    fr: 'bride SAE',
    es: 'brida SAE',
    it: 'flangia SAE',
  },
  // Geka is a German trade name (Karasto), so German is authoritative. Spanish
  // prints "racor" rather than "acoplamiento" for this one specifically.
  geka: { de: 'Geka-Kupplung', fr: 'raccord Geka', es: 'racor Geka', it: 'raccordo Geka' },
  gost: { de: 'GOST-Kupplung', fr: 'raccord GOST', es: 'acoplamiento GOST', it: 'raccordo GOST' },
  kc: { de: 'KC-Kupplung', fr: 'raccord KC', es: 'acoplamiento KC', it: 'raccordo KC' },
  'en14420-5': {
    de: 'Schalenverschraubung EN 14420-5',
    fr: 'raccord EN 14420-5',
    es: 'racor EN 14420-5',
    it: 'raccordo EN 14420-5',
  },
  'tank-truck': {
    de: 'Tankwagenkupplung',
    fr: 'raccord pour camion-citerne',
    es: 'acoplamiento para camión cisterna',
    it: 'raccordo per autocisterna',
  },
  // Proprietary. Never localised — the name is the product.
  'met-o-seal': {
    de: 'Met-O-Seal',
    fr: 'Met-O-Seal',
    es: 'Met-O-Seal',
    it: 'Met-O-Seal',
  },
}

/** "with" — needed to join two ends in a readable way. */
const AND: Record<AlternateNameLang, string> = { de: 'auf', fr: 'sur', es: 'a', it: 'a' }

/** "type", for family designations like a Camlock Type B. */
const TYPE_WORD: Record<AlternateNameLang, string> = {
  de: 'Typ',
  fr: 'type',
  es: 'tipo',
  it: 'tipo',
}

/**
 * Body types whose own term already states the gender.
 *
 * French "bouchon femelle" and Spanish "tapón hembra" mean female cap. Adding
 * the gender word as well produced "femelle JIC bouchon femelle", which reads
 * as a mistake rather than a designation.
 */
const GENDERED_BODY: ReadonlySet<BodyType> = new Set<BodyType>(['cap', 'plug'])

/**
 * Bodies that are sized by tube OD rather than by a thread.
 *
 * A cutting ring and a hose shank have no thread of their own — the ring grips
 * a tube, the shank goes inside a hose. Requiring a thread declined them at
 * 100%, and their own names are complete designations: "Schneidring" is a
 * Schneidring.
 */
const THREADLESS_BODY: ReadonlySet<BodyType> = new Set<BodyType>([
  'cutting-ring',
  'hose-shank',
  'wing-nut',
  'hex-nut',
  'lock-nut',
  'bonded-seal',
  'ed-seal',
  'nozzle-holder',
  'swivel-joint',
])

/**
 * Body types whose own term is already the German word for a union.
 *
 * `BODY.union.de` and the generic connector noun are both "Verschraubung", so
 * emitting the body word after a head noun that already carries it produces
 * "Verschraubung Verschraubung". German drops the second.
 */
const DE_UNION_WORD = 'Verschraubung'

const SEAT: Record<Seat, Record<AlternateNameLang, string>> = {
  'cone-24': { de: '24° Konus', fr: 'cône 24°', es: 'cono 24°', it: 'cono 24°' },
  'cone-37': { de: '37° Bördel', fr: 'cône 37°', es: 'cono 37°', it: 'cono 37°' },
  'cone-45': { de: '45° Bördel', fr: 'cône 45°', es: 'cono 45°', it: 'cono 45°' },
  'cone-60': { de: '60° Konus', fr: 'cône 60°', es: 'cono 60°', it: 'cono 60°' },
  'inverted-flare': {
    de: 'Bördel invertiert',
    fr: 'évasement inversé',
    es: 'abocardado invertido',
    it: 'svasatura invertita',
  },
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
    // "raccordo per tubo" is a rigid pipe fitting. The flexible-hose end is
    // "raccordo per tubo flessibile", and the qualifier is the whole
    // distinction — corrected on review of the trade vocabulary.
    it: 'raccordo per tubo flessibile',
  },
  // The crimped hose end, as distinct from the generic hose fitting.
  'crimp-fitting': {
    de: 'Pressarmatur',
    fr: 'embout à sertir',
    es: 'racor de prensar',
    it: 'raccordo a pressare',
  },
  adapter: { de: 'Adapter', fr: 'adaptateur', es: 'adaptador', it: 'adattatore' },
  coupling: {
    de: 'Kupplung',
    fr: 'raccord',
    es: 'acoplamiento',
    // Was "giunto", which is the swivel-JOINT sense — a different component.
    // Italian catalogues print "raccordo" for a coupling.
    it: 'raccordo',
  },
  // The compression / union nut that pulls a cone seat home. NOT a lock nut:
  // BODY['lock-nut'] is the jam nut on an adjustable stud end, a separate
  // sellable part, and substituting one for the other ships the wrong item.
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

/** One end of an adapter, in the given language. */
function endPhrase(
  lang: AlternateNameLang,
  end: {
    thread?: ThreadStandard | null | undefined
    gender?: Gender | null | undefined
    seat?: Seat | null | undefined
  },
): string {
  return join([
    end.thread ? THREAD[end.thread][lang] : null,
    end.gender ? GENDER[end.gender][lang] : null,
    end.seat ? SEAT[end.seat][lang] : null,
  ])
}

/**
 * Adapters joining two standards, named as both ends.
 *
 * "ORFS Außengewinde auf metrisch Innengewinde" says what the part does. The
 * previous model could only say one of those two things, which is why it said
 * nothing at all.
 */
function composeTwoEnded(lang: AlternateNameLang, a: FittingAttributes): string {
  const first = endPhrase(lang, { thread: a.thread, gender: a.gender, seat: a.seat })
  const second = endPhrase(lang, a.endB ?? {})
  if (!first || !second) return ''
  return join([
    a.body ? BODY[a.body][lang] : a.kind ? KIND[a.kind][lang] : KIND.adapter[lang],
    a.configuration && a.configuration !== 'straight' ? CONFIGURATION[a.configuration][lang] : null,
    first,
    AND[lang],
    second,
  ])
}

/** Parts named by coupling family — Storz, Camlock, ferrules, clamps. */
function composeCoupling(lang: AlternateNameLang, a: FittingAttributes): string {
  // The designation itself is international — a Camlock B is a B everywhere —
  // but the word in front of it is not, so only the letter is stored.
  const type = a.couplingType ? `${TYPE_WORD[lang]} ${a.couplingType}` : null
  return join([
    a.couplingFamily ? COUPLING[a.couplingFamily][lang] : null,
    type,
    // The body must survive. Without it a "Geka Cap" was named
    // "Geka-Kupplung" — a cap described as a coupling, which is the
    // wrong-component failure, not a stylistic one.
    a.body ? BODY[a.body][lang] : null,
    a.gender && !(a.body && GENDERED_BODY.has(a.body)) ? GENDER[a.gender][lang] : null,
    a.thread ? THREAD[a.thread][lang] : null,
  ])
}

function composeDe(a: FittingAttributes): string {
  if (a.couplingFamily) return composeCoupling('de', a)
  if (a.endB) return composeTwoEnded('de', a)
  // German leads with the DIN designation where one applies, then the bend,
  // then the thread, then the seal.
  return join([
    dinDesignation(a),
    a.configuration ? CONFIGURATION[a.configuration].de : null,
    a.thread === 'metric' ? THREAD.metric.de : a.thread ? THREAD[a.thread].de : null,
    a.gender && !(a.body && GENDERED_BODY.has(a.body)) ? GENDER[a.gender].de : null,
    a.oring ? ORING.de : null,
    a.seat ? SEAT[a.seat].de : null,
    // Guard C4: BODY.union.de and the generic connector noun are the same
    // German word, so never print it twice.
    a.body
      ? (a.kind && KIND[a.kind].de === BODY[a.body].de ? null : BODY[a.body].de)
      : a.kind
        ? KIND[a.kind].de
        : null,
  ])
}

function composeFr(a: FittingAttributes): string {
  if (a.couplingFamily) return composeCoupling('fr', a)
  if (a.endB) return composeTwoEnded('fr', a)
  // French leads with gender, then bend, then thread, then seal, with the
  // series appended after a dash.
  const head = join([
    a.gender && !(a.body && GENDERED_BODY.has(a.body)) ? GENDER[a.gender].fr : null,
    a.configuration && a.configuration !== 'straight' ? CONFIGURATION[a.configuration].fr : null,
    a.thread ? THREAD[a.thread].fr : null,
    a.seat ? SEAT[a.seat].fr : null,
    a.oring ? ORING.fr : null,
    a.body ? BODY[a.body].fr : a.kind ? KIND[a.kind].fr : null,
  ])
  return a.series ? `${head} – ${SERIES[a.series].fr}` : head
}

function composeEs(a: FittingAttributes): string {
  if (a.couplingFamily) return composeCoupling('es', a)
  if (a.endB) return composeTwoEnded('es', a)
  const head = join([
    a.gender && !(a.body && GENDERED_BODY.has(a.body)) ? GENDER[a.gender].es : null,
    a.thread ? THREAD[a.thread].es : null,
    a.configuration && a.configuration !== 'straight' ? CONFIGURATION[a.configuration].es : null,
    a.oring ? ORING.es : null,
    a.seat ? SEAT[a.seat].es : null,
    a.body ? BODY[a.body].es : a.kind ? KIND[a.kind].es : null,
  ])
  return a.series ? `${head} – ${SERIES[a.series].es}` : head
}

function composeIt(a: FittingAttributes): string {
  if (a.couplingFamily) return composeCoupling('it', a)
  if (a.endB) return composeTwoEnded('it', a)
  const head = join([
    a.gender && !(a.body && GENDERED_BODY.has(a.body)) ? GENDER[a.gender].it : null,
    a.configuration && a.configuration !== 'straight' ? CONFIGURATION[a.configuration].it : null,
    a.thread ? THREAD[a.thread].it : null,
    a.seat ? SEAT[a.seat].it : null,
    dinDesignation(a)?.replace('-', ''),
    a.oring ? ORING.it : null,
    a.body ? BODY[a.body].it : a.kind ? KIND[a.kind].it : null,
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
  // A coupling family is self-identifying. "Storz-Kupplung" and "Kamlok-
  // Kupplung Typ C" are complete designations that carry no thread at all,
  // and insisting on one declined three whole categories at 100%.
  if (a.couplingFamily) return true

  // A two-ended adapter is named by both ends, and needs both to say anything
  // true. One end alone was the bug that labelled an ORFS part as BSP.
  if (a.endB) return !!a.thread && !!a.endB.thread

  // Some bodies are sized by tube OD and have no thread at all. Their own name
  // is the designation, so they qualify without one.
  if (a.body && THREADLESS_BODY.has(a.body)) return true

  if (!a.thread) return false

  // A body type identifies a part better than its thread does — a
  // Verschlusskappe is a cap whatever it screws onto — so thread plus body is
  // enough on its own.
  if (a.body) return true

  // `straight` is the default body and identifies nothing. Counting it lets
  // "mâle BSP" through, which is a pair of words rather than a designation
  // anyone searches for.
  const identifying = [
    a.gender,
    a.seat,
    a.configuration && a.configuration !== 'straight' ? a.configuration : null,
    a.series,
    // The head noun counts. "ORFS Außengewinde Pressarmatur" is a designation
    // a buyer types; "ORFS Außengewinde" alone is a pair of words. Excluding
    // it declined every crimp fitting whose only other attribute was gender.
    a.kind,
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
