/**
 * Read fitting attributes off a product.
 *
 * Prefers structured specs — `Thread Gender`, `Sealing Form`, `Fitting
 * Configuration` and the `Port A *` family are populated on the fittings and
 * adapters. Falls back to the title, which is regular enough to read reliably
 * ("45° Metric Female 24° O-ring Cone (Light Series) Hose Fitting") and is the
 * only source on rows where specs were never filled in.
 *
 * Both paths are deliberately conservative. An attribute that is not
 * recognised is left null rather than guessed at, and
 * `hasEnoughToName` upstream then declines to name the product at all.
 */
import type {
  FittingAttributes,
  BodyType,
  Configuration,
  CouplingFamily,
  Gender,
  Seat,
  Series,
  ThreadStandard,
  Kind,
} from './product-alternate-names'

export type SpecLike = { label: string; value: string }

function specValue(specs: SpecLike[], label: string): string | null {
  const hit = specs.find((s) => s.label.toLowerCase() === label.toLowerCase())
  return hit ? hit.value : null
}

function readGender(text: string): Gender | null {
  // Order matters: "female" contains "male".
  if (/\bfemale\b/i.test(text)) return 'female'
  if (/\bmale\b/i.test(text)) return 'male'
  return null
}

function readThread(text: string): ThreadStandard | null {
  if (/\bmetric\b/i.test(text)) return 'metric'
  if (/\bbsp[pt]?\b/i.test(text)) return 'bsp'
  if (/\bjic\b/i.test(text)) return 'jic'
  if (/\bnpsm\b/i.test(text)) return 'npsm'
  if (/\bnpt\b/i.test(text)) return 'npt'
  if (/\borfs\b/i.test(text)) return 'orfs'
  if (/\bjis\b/i.test(text)) return 'jis'
  // Last: SAE appears inside several other designations ("SAE Code 61",
  // "SAE J514"), so it must not shadow a more specific standard named
  // alongside it.
  if (/\bsae\b/i.test(text)) return 'sae'
  return null
}

function readSeat(text: string): Seat | null {
  // Before the bare angles: an inverted flare is a distinct seat, and its
  // titles also carry a 45°.
  if (/inverted\s*flare/i.test(text)) return 'inverted-flare'
  if (/24\s*°/.test(text)) return 'cone-24'
  if (/37\s*[°º]/.test(text)) return 'cone-37'
  // Only where the angle describes the seat rather than the bend. A leading
  // "45°" is an elbow; "45° Cone" is a seat.
  if (/45\s*[°º]\s*(cone|flare|seat)/i.test(text)) return 'cone-45'
  if (/60\s*[°º]/.test(text)) return 'cone-60'
  if (/flat\s*(seal|face|seat)/i.test(text)) return 'flat'
  return null
}

function readConfiguration(text: string): Configuration | null {
  if (/\b45\s*[°º]/.test(text) && /elbow|bend/i.test(text)) return 'elbow-45'
  if (/\b90\s*[°º]/.test(text) && /elbow|bend/i.test(text)) return 'elbow-90'
  // Titles frequently lead with a bare angle and no "elbow": "45° Metric
  // Female …" is an elbow. A leading angle is the reliable signal.
  if (/^\s*45\s*[°º]/.test(text)) return 'elbow-45'
  if (/^\s*90\s*[°º]/.test(text)) return 'elbow-90'
  if (/\bstraight\b/i.test(text)) return 'straight'
  return null
}

function readSeries(text: string): Series | null {
  if (/light\s*series|\bseries\s*l\b|\bDKOL\b/i.test(text)) return 'light'
  if (/heavy\s*series|\bseries\s*s\b|\bDKOS\b/i.test(text)) return 'heavy'
  return null
}

function readKind(text: string): Kind | null {
  if (/hose\s*fitting/i.test(text)) return 'hose-fitting'
  if (/\badapter\b/i.test(text)) return 'adapter'
  if (/\bcoupling\b/i.test(text)) return 'coupling'
  if (/\bnut\b/i.test(text)) return 'nut'
  return null
}

function readOring(text: string): boolean {
  return /o-?ring/i.test(text)
}

/** Every thread standard named anywhere in the text, in order of appearance. */
function allThreads(text: string): ThreadStandard[] {
  const found: ThreadStandard[] = []
  const patterns: [ThreadStandard, RegExp][] = [
    ['metric', /\bmetric\b/gi],
    ['bsp', /\bbsp[pt]?\b/gi],
    ['jic', /\bjic\b/gi],
    ['npsm', /\bnpsm\b/gi],
    ['npt', /\bnpt\b/gi],
    ['orfs', /\borfs\b/gi],
    ['jis', /\bjis\b/gi],
    ['sae', /\bsae\b/gi],
  ]
  for (const [std, re] of patterns) if (re.test(text)) found.push(std)
  return found
}

/**
 * Coupling family from the category slug.
 *
 * More reliable than the title, because a Guillemin coupling filed under
 * `guillemin-couplings` may not repeat the word in its own title. Category is
 * checked first for that reason.
 */
/**
 * Parts that sit in a coupling category without being a coupling.
 *
 * A category is a shelf, not a description. `sae-flange-fittings` holds the
 * flanges and also the bolt kits, seals and clamp halves that go with them,
 * and calling a bag of bolts an "SAE-Flansch" is precisely the wrong-part
 * failure this module exists to avoid. Caught in review: the category rule
 * named "Set of Bolts and Spring Washers" as a flange in all four languages.
 */
function isAccessory(title: string): boolean {
  return /\b(bolt|washer|screw|nut kit|seal kit|gasket|o-?ring kit|repair kit|spare part|accessor)/i.test(
    title,
  )
}

function familyFromCategory(slug: string | null | undefined): CouplingFamily | null {
  if (!slug) return null
  if (/storz/.test(slug)) return 'storz'
  if (/cam-and-groove|camlock/.test(slug)) return 'cam-groove'
  if (/bauer/.test(slug)) return 'bauer'
  if (/guillemin/.test(slug)) return 'guillemin'
  if (/sae-flange/.test(slug)) return 'sae-flange'
  if (/ferrule/.test(slug)) return 'crimp-ferrule'
  if (/clamp/.test(slug)) return 'hose-clamp'
  if (/air-coupling/.test(slug)) return 'air-coupling'
  if (/quick-coupl/.test(slug)) return 'quick-coupling'
  if (/flow-iron/.test(slug)) return 'hammer-union'
  return null
}

/**
 * Coupling family from the title, where the category did not settle it.
 *
 * A Storz coupling has no thread standard at all, and insisting on one is why
 * three whole categories declined at 100%.
 */
function readCouplingFamily(text: string): CouplingFamily | null {
  if (/\bstorz\b/i.test(text)) return 'storz'
  if (/\bbauer\b/i.test(text)) return 'bauer'
  if (/\bguillemin\b/i.test(text)) return 'guillemin'
  if (/sae\s*(code\s*6[12]\s*)?flange|\bcode\s*6[12]\b/i.test(text)) return 'sae-flange'
  if (/cam[\s-]*(and|&)?[\s-]*groove|camlock|\bcam\s*lock\b/i.test(text)) return 'cam-groove'
  if (/\bferrule\b/i.test(text)) return 'crimp-ferrule'
  if (/\b(clamp|clip)\b/i.test(text)) return 'hose-clamp'
  if (/\b\d{3,4}\s*series\b/i.test(text) || /hammer\s*union/i.test(text)) return 'hammer-union'
  if (/air\s*coupl|pneumatic\s*coupl/i.test(text)) return 'air-coupling'
  if (/quick\s*(release\s*)?coupl|quick\s*connect/i.test(text)) return 'quick-coupling'
  return null
}

/**
 * The family-specific designation, kept verbatim.
 *
 * Camlock types are single letters (A–F, DA, DC); hammer unions are numbered
 * series (1502, 602). Both are international and translating either would
 * invent a designation nobody uses.
 */
function readCouplingType(text: string, family: CouplingFamily | null): string | null {
  if (family === 'cam-groove') {
    const m = text.match(/\btype\s+([A-F]{1,2})\b/i)
    return m ? m[1]!.toUpperCase() : null
  }
  if (family === 'hammer-union') {
    const m = text.match(/\b(\d{3,4})\s*series\b/i)
    return m ? m[1]! : null
  }
  if (family === 'storz') {
    // Storz sizes are letter codes — A, B, C, D, F — and identify the coupling.
    const m = text.match(/\bstorz\s+([A-F])\b/i)
    return m ? m[1]!.toUpperCase() : null
  }
  return null
}

/** What the part physically is, where the title names it. */
function readBody(text: string): BodyType | null {
  if (/\bbulkhead\b/i.test(text)) return 'bulkhead'
  if (/\bbanjo\b/i.test(text)) return 'banjo'
  if (/\bcross\b/i.test(text)) return 'cross'
  if (/\btee\b|\bbranch\s*tee\b|\brun\s*tee\b/i.test(text)) return 'tee'
  if (/\breducer\b|\breducing\b|\bincreaser\b/i.test(text)) return 'reducer'
  if (/\bblanking\s*plug\b|\bplug\b/i.test(text)) return 'plug'
  if (/\bcap\b/i.test(text)) return 'cap'
  if (/\bnipple\b/i.test(text)) return 'nipple'
  if (/\bunion\b/i.test(text)) return 'union'
  return null
}

/**
 * True when the product joins two different thread standards.
 *
 * Three signals, any of which is enough:
 *   - an explicit "X" or "×" between two ends, the convention in these titles
 *     ("Male Connector m ORFS X m Metric Flat");
 *   - two different standards named in the title;
 *   - the title and the specs disagreeing about which standard applies, which
 *     happens when the spec describes the stud end and the title the port end.
 */
function readTwoEnded(title: string, threadSpec: string | null): boolean {
  if (/\s[x×]\s/i.test(title)) return true
  const inTitle = allThreads(title)
  if (inTitle.length > 1) return true
  const inSpec = threadSpec ? allThreads(threadSpec) : []
  if (inSpec.length > 1) return true
  if (inTitle.length === 1 && inSpec.length === 1 && inTitle[0] !== inSpec[0]) return true
  return false
}

/**
 * Split a two-ended title into its halves so each end can be read separately.
 *
 * The convention in these titles is an X between the ends —
 * "Camlock Type C X Spiral Tail", "Female Coupler × Male NPT". Where there is
 * no separator but two standards are named, the text is split at the second
 * standard so each half describes one end.
 */
function splitEnds(title: string): [string, string] | null {
  const sep = title.split(/\s[x×]\s/i)
  if (sep.length === 2) return [sep[0]!, sep[1]!]

  const threads = allThreads(title)
  if (threads.length !== 2) return null
  // Find where the second standard is mentioned and cut there.
  const patterns: Record<ThreadStandard, RegExp> = {
    metric: /\bmetric\b/i,
    bsp: /\bbsp[pt]?\b/i,
    jic: /\bjic\b/i,
    npsm: /\bnpsm\b/i,
    npt: /\bnpt\b/i,
    orfs: /\borfs\b/i,
    jis: /\bjis\b/i,
    sae: /\bsae\b/i,
  }
  const idx = title.search(patterns[threads[1]!])
  if (idx <= 0) return null
  return [title.slice(0, idx), title.slice(idx)]
}

/**
 * Attributes for a product, from its specs where present and its title
 * otherwise. Spec values win — they were entered deliberately, whereas the
 * title is prose that happens to be regular.
 */
export function readFittingAttributes(input: {
  title: string
  specs?: SpecLike[]
  /**
   * Category slug, used to classify coupling families.
   *
   * More reliable than the title: a Guillemin coupling filed under
   * `guillemin-couplings` need not repeat the word in its own name.
   */
  categorySlug?: string | null
}): FittingAttributes {
  const specs = input.specs ?? []
  const title = input.title

  const genderSpec = specValue(specs, 'Thread Gender') ?? specValue(specs, 'Port A Gender')
  const threadSpec = specValue(specs, 'Thread Form') ?? specValue(specs, 'Port A Thread')
  const sealSpec = specValue(specs, 'Sealing Form') ?? specValue(specs, 'Port A Sealing')
  const configSpec = specValue(specs, 'Fitting Configuration') ?? specValue(specs, 'Body Configuration')

  // `Fitting Configuration` carries values like "90-elbow" and "straight".
  const configFromSpec = configSpec
    ? /45/.test(configSpec)
      ? ('elbow-45' as const)
      : /90/.test(configSpec)
        ? ('elbow-90' as const)
        : /straight/i.test(configSpec)
          ? ('straight' as const)
          : null
    : null

  // The category rule is deliberately subordinate to the accessory check: a
  // bolt kit on the flange shelf is not a flange.
  const couplingFamily = isAccessory(title)
    ? null
    : (familyFromCategory(input.categorySlug) ?? readCouplingFamily(title))
  const body = readBody(title)
  const configuration = configFromSpec ?? readConfiguration(title)

  // A coupling family names the part on its own; reading a thread off the
  // title as well would attach a standard the coupling does not have.
  if (couplingFamily) {
    return {
      couplingFamily,
      couplingType: readCouplingType(title, couplingFamily),
      gender: readGender(title),
      // Only where the title states one explicitly — many couplings have a
      // threaded end, and where they do it belongs in the name.
      thread: readThread(title),
      configuration,
    }
  }

  const twoEnded = readTwoEnded(title, threadSpec)
  if (twoEnded) {
    const halves = splitEnds(title)
    if (halves) {
      const [a, b] = halves
      return {
        thread: readThread(a) ?? readThread(title),
        gender: readGender(a),
        seat: readSeat(a),
        endB: { thread: readThread(b), gender: readGender(b), seat: readSeat(b) },
        configuration,
        body,
        kind: readKind(title),
      }
    }
    // Two standards are present but the title cannot be split cleanly, so
    // neither end can be described. Declining is still the right answer.
    return { thread: null, endB: null }
  }

  return {
    gender: (genderSpec ? readGender(genderSpec) : null) ?? readGender(title),
    thread: (threadSpec ? readThread(threadSpec) : null) ?? readThread(title),
    seat: (sealSpec ? readSeat(sealSpec) : null) ?? readSeat(title),
    configuration,
    series: readSeries(title),
    kind: readKind(title),
    body,
    oring: readOring(sealSpec ?? '') || readOring(title),
  }
}
