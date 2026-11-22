import type { Route } from 'next'

/**
 * Links that change table state (05-map-frontend §7.4): filter chips, sort headers, pagination
 * and row selection are links built with `hrefWith`, so they work without JS, open in new tabs
 * and survive reloads.
 *
 *   hrefWith('/enquiries', searchParams, { stage: 'quoted', cursor: undefined })
 *   → '/enquiries?stage=quoted&sort=deadline'
 *
 * - Keys already in `current` keep their position; a patched key is replaced in place.
 * - New keys are appended in the patch's order.
 * - `undefined`, `null` and `''` remove a key (reset `cursor` whenever a filter or sort changes).
 * - An array patches a multi-valued key; unpatched multi-valued keys keep every value.
 *
 * `current` is what a page has: Next's `searchParams` object (awaited), `URLSearchParams`, or
 * the client's `ReadonlyURLSearchParams`. The pathname is type-checked as a route (typedRoutes).
 */

export type SearchParamsLike =
  | Pick<URLSearchParams, 'forEach'>
  | Readonly<Record<string, string | readonly string[] | undefined>>

export type ParamValue = string | number | boolean | null | undefined
export type ParamPatch = Readonly<Record<string, ParamValue | readonly ParamValue[]>>

function entriesOf(current: SearchParamsLike): Array<[string, string]> {
  const out: Array<[string, string]> = []
  if (typeof (current as Pick<URLSearchParams, 'forEach'>).forEach === 'function') {
    ;(current as Pick<URLSearchParams, 'forEach'>).forEach((value, key) => out.push([key, value]))
    return out
  }
  for (const [key, value] of Object.entries(current as Record<string, unknown>)) {
    if (value === undefined) continue
    for (const v of Array.isArray(value) ? value : [value]) out.push([key, String(v)])
  }
  return out
}

function valuesOf(value: ParamValue | readonly ParamValue[]): string[] {
  const list = Array.isArray(value) ? value : [value]
  return list
    .filter((v): v is string | number | boolean => v !== undefined && v !== null && v !== '')
    .map(String)
}

/** The query string (no leading "?") for `current` with `patch` applied. */
export function queryWith(current: SearchParamsLike, patch: ParamPatch): string {
  const out = new URLSearchParams()
  const written = new Set<string>()
  for (const [key, value] of entriesOf(current)) {
    if (Object.hasOwn(patch, key)) {
      if (written.has(key)) continue
      written.add(key)
      for (const v of valuesOf(patch[key])) out.append(key, v)
    } else if (value !== '') {
      out.append(key, value)
    }
  }
  for (const key of Object.keys(patch)) {
    if (written.has(key)) continue
    for (const v of valuesOf(patch[key])) out.append(key, v)
  }
  return out.toString()
}

/** `pathname` with the current search params patched. */
export function hrefWith<T extends string>(
  pathname: Route<T>,
  current: SearchParamsLike,
  patch: ParamPatch = {}
): Route<T> {
  const query = queryWith(current, patch)
  return (query ? `${pathname}?${query}` : pathname) as Route<T>
}
