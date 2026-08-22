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
import type { FittingAttributes, Configuration, Gender, Seat, Series, ThreadStandard, Kind } from './product-alternate-names'

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
  return null
}

function readSeat(text: string): Seat | null {
  if (/24\s*°/.test(text)) return 'cone-24'
  if (/37\s*[°º]/.test(text)) return 'cone-37'
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
  ]
  for (const [std, re] of patterns) if (re.test(text)) found.push(std)
  return found
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
 * Attributes for a product, from its specs where present and its title
 * otherwise. Spec values win — they were entered deliberately, whereas the
 * title is prose that happens to be regular.
 */
export function readFittingAttributes(input: {
  title: string
  specs?: SpecLike[]
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

  return {
    gender: (genderSpec ? readGender(genderSpec) : null) ?? readGender(title),
    thread: (threadSpec ? readThread(threadSpec) : null) ?? readThread(title),
    seat: (sealSpec ? readSeat(sealSpec) : null) ?? readSeat(title),
    configuration: configFromSpec ?? readConfiguration(title),
    series: readSeries(title),
    kind: readKind(title),
    oring: readOring(sealSpec ?? '') || readOring(title),
    twoEnded: readTwoEnded(title, threadSpec),
  }
}
