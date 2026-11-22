// The token-usage resolver: shared by token-usage.test.ts (which scans the source) and the kit
// component tests (which check the classes a part actually renders). Not a test itself.
import {
  IO_COLORS,
  IO_RADII,
  IO_SHADOWS,
  IO_SIZES,
  IO_TEXT_ROLES,
  IO_VARS,
  IO_Z,
} from '../tokens.generated'

/**
 * Tailwind's defaults are wiped, so an io- class that names no token compiles to nothing and
 * renders a wrong colour silently. This turns "nothing" into a failure (C35).
 */
const colors = new Set<string>(IO_COLORS)
const families: { re: RegExp; ok: (key: string) => boolean }[] = [
  { re: /^text$/, ok: (k) => colors.has(k) || (IO_TEXT_ROLES as readonly string[]).includes(k) },
  { re: /^shadow$/, ok: (k) => (IO_SHADOWS as readonly string[]).includes(k) || colors.has(k) },
  {
    re: /^(bg|border(-[xytrblse])?|ring(-offset)?|fill|stroke|outline|divide|from|to|via|decoration|caret|accent|placeholder)$/,
    ok: (k) => colors.has(k),
  },
  {
    re: /^rounded(-(t|b|l|r|s|e|tl|tr|bl|br|ss|se|es|ee))?$/,
    ok: (k) => (IO_RADII as readonly string[]).includes(k),
  },
  {
    re: /^(w|h|size|min-w|max-w|min-h|max-h|p[xytrblse]?|m[xytrblse]?|gap(-[xy])?|inset(-[xy])?|top|left|right|bottom|start|end|space-[xy]|basis|translate-[xy]|scroll-[mp][xytrbl]?)$/,
    ok: (k) => (IO_SIZES as readonly string[]).includes(k),
  },
  { re: /^z$/, ok: (k) => (IO_Z as readonly string[]).includes(k) },
]
const vars = new Set<string>(IO_VARS)

/** Wiped Tailwind namespaces: these names compile to nothing in Ops. */
const PALETTE =
  /^(bg|text|border(-[xytrblse])?|ring|fill|stroke|outline|divide|from|to|via|decoration|caret|accent|shadow|placeholder)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|black)(-\d{2,3})?$/
const DEFAULT_RADIUS =
  /^rounded(-(t|b|l|r|s|e|tl|tr|bl|br|ss|se|es|ee))?-(xs|sm|md|lg|xl|2xl|3xl|4xl)$/
const DEFAULT_SHADOW = /^shadow-(2xs|xs|sm|md|lg|xl|2xl|inner)$/

/** The utility part of a class token: variants, `!` and an opacity modifier removed. */
function utilityOf(token: string): string {
  let depth = 0
  let last = 0
  for (let i = 0; i < token.length; i++) {
    const c = token[i]
    if (c === '[') depth++
    else if (c === ']') depth--
    else if (c === ':' && depth === 0) last = i + 1
  }
  return token
    .slice(last)
    .replace(/^!/, '')
    .replace(/^-/, '')
    .replace(/\/\d+$/, '')
}

export function problemsIn(text: string): { index: number; message: string }[] {
  const out: { index: number; message: string }[] = []
  // A class token; bracketed arbitrary values may contain parentheses: w-[var(--io-row)].
  for (const m of text.matchAll(/(?:[^\s'"`{}()[\],;<>=]|\[[^\]\s'"`]*\])+/g)) {
    const token = m[0]
    if (token.startsWith('--') || token.startsWith('var(')) continue
    const util = utilityOf(token)
    if (PALETTE.test(util) || DEFAULT_RADIUS.test(util) || DEFAULT_SHADOW.test(util)) {
      out.push({
        index: m.index,
        message: `${util}: Tailwind default, wiped in Ops — use an io- token`,
      })
      continue
    }
    const named = /^([a-z]+(?:-[a-z]+)*?)-(io-[a-z0-9-]+)$/.exec(util)
    if (named) {
      const [, prefix, key] = named
      const family = families.find((f) => f.re.test(prefix!))
      if (family && !family.ok(key!))
        out.push({ index: m.index, message: `${util}: no ${prefix} token ${key}` })
    }
    for (const arb of util.matchAll(/\[([^\]]*)\]/g)) {
      for (const v of arb[1]!.matchAll(/var\((--[\w-]+)/g)) {
        if (v[1]!.startsWith('--io-') && !vars.has(v[1]!))
          out.push({ index: m.index, message: `${util}: ${v[1]} is not a token` })
      }
    }
  }
  return out
}
