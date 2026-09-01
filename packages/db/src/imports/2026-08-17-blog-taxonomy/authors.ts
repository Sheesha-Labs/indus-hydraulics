/**
 * Blog authors.
 *
 * ONE real author: the founder. Everything published on this site is written
 * or directed by him and he stands behind it as author.
 *
 * The four names previously seeded here — Anjali Krishnan, Ravi Bhatt,
 * Mehul Rana, Sunil Patel — were NOT real people. (The founder role was
 * real; the name was not. The real founder is Krishan Bhatia.) They were placeholder
 * names in the design handoff mockups (design-source/site-longform.jsx),
 * mistaken for existing site copy and seeded to production, where they
 * carried the bylines on 93 published articles and were emitted as
 * `Person` JSON-LD from /blog/author/[slug]. Do not reintroduce them.
 *
 * `bio` and `credentials` feed Person JSON-LD `description` and
 * `hasCredential`. Both are real claims about a real person and must be
 * filled in by him, not guessed. `linkedinUrl` feeds `sameAs`, which is
 * how a search engine connects this author page to his other profiles.
 */

export type BlogAuthorSeed = {
  slug: string
  name: string
  jobTitle: string
  /** Optional: the column is nullable, and seeding 0 would publish a claim. */
  yearsExperience?: number
  position: number
}

const AUTHORS: BlogAuthorSeed[] = [
  // Matches the production row created 2026-09-01, which is linked to the
  // staff_users account and carries all 93 posts. `yearsExperience`, `bio`,
  // `credentials` and `linkedinUrl` are intentionally unset — they publish,
  // and `linkedinUrl` in particular feeds Person `sameAs`.
  { slug: 'ayush-bhatia', name: 'Ayush Bhatia', jobTitle: 'Director', position: 1 },
]

export default AUTHORS
