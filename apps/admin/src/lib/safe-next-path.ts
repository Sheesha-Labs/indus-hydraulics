/**
 * Validate a `?next=` redirect target.
 *
 * The proxy attaches `?next=<pathname+search>` whenever it bounces an
 * unauthenticated request, so the user can be returned to where they were
 * headed. Anything echoed back into a redirect is an open-redirect vector, so
 * only same-origin absolute paths are accepted.
 *
 * The `//` rejection is the one that matters: `//evil.example` is a
 * protocol-relative URL. It starts with `/`, so a naive `startsWith('/')`
 * check passes it, and the browser then navigates off-origin. (The same
 * protocol-relative quirk is why the 23 `revalidatePath('//products')` calls
 * elsewhere in this app match no route.)
 */
export function safeNextPath(value: FormDataEntryValue | string | null | undefined): string | null {
  if (typeof value !== 'string') return null
  if (!value.startsWith('/')) return null
  if (value.startsWith('//')) return null
  // Backslashes are normalised to forward slashes by some browsers, so `/\evil`
  // can be read as `//evil`. Reject the whole class.
  if (value.includes('\\')) return null
  return value
}
