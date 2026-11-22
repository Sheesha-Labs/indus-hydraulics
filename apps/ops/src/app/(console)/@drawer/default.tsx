/**
 * The `@drawer` slot when no drawer route matches (05 §6.3). It MUST return null, and so must
 * `[...catchAll]/page.tsx` beside it: on a hard navigation (reload, new tab) Next renders a slot's
 * default.tsx for the URL, and without one the whole page 404s; on a soft navigation an unmatched slot keeps
 * whatever it showed last, so without the catch-all the Why? drawer would stay open over the next page.
 */
export default function DrawerDefault() {
  return null
}
