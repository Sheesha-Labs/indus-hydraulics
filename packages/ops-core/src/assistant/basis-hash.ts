/**
 * The basis of a proposal (S06-T01, ADR-11): the versions of every record it was built on, e.g.
 * { message: '<id>', thread: '<latest inbound id>' }. A proposal is stale when the same keys, read again, hash
 * differently. Pure: the caller passes the hasher (sha256 on the server).
 */
export type BasisVersions = Readonly<Record<string, string | number>>

/** Canonical JSON: keys sorted, so the same versions always give the same text. */
export function canonicalVersions(versions: BasisVersions): string {
  return JSON.stringify(
    Object.keys(versions)
      .sort()
      .map((k) => [k, versions[k]])
  )
}

export function basisHash(versions: BasisVersions, hash: (text: string) => string): string {
  return hash(canonicalVersions(versions))
}
