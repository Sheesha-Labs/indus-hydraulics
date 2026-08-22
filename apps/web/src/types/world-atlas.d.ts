/**
 * `world-atlas` ships TopoJSON, not types.
 *
 * The declaration is deliberately `unknown` rather than a structural type.
 * `countries-50m.json` is ~700 KB, and with `resolveJsonModule` alone
 * TypeScript infers a literal type for every ring of every polygon — the
 * typecheck goes from seconds to minutes and the language server stops
 * responding in this file. `unknown` costs one cast at the single call site in
 * `lib/market-geometry.ts` and nothing else.
 */
declare module 'world-atlas/countries-50m.json' {
  const topology: unknown
  export default topology
}
