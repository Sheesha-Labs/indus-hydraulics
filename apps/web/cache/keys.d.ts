export function cacheNamespace(buildManifest: string | null, fallback: string): string
export function isStale(
  entryLastModified: number,
  tags: readonly string[],
  revalidatedAt: Readonly<Record<string, number | undefined>>,
): boolean
export function tagsFor(
  value: unknown,
  ctxTags: readonly string[] | undefined,
  softTags: readonly string[] | undefined,
): string[]
