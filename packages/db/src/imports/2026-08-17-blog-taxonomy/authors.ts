/**
 * Blog authors.
 *
 * Seeded from the team already published on the company page
 * (/hydraulic-components-supplier-uae) — name, role and years of
 * experience are existing site copy, not new claims.
 *
 * `bio` and `credentials` are deliberately LEFT NULL. Those fields feed
 * Person JSON-LD `description` and `hasCredential`, which is precisely the
 * kind of thing that must not be invented: writing "BEng Mechanical · IWCF
 * Level 4" for a real, named colleague would be fabricating a qualification
 * and publishing it as structured data. The author pages render fine without
 * them and improve the moment someone who knows fills them in.
 *
 * `staffUserId` is left unset here too — matching by name would be a guess.
 * It can be linked from the admin once the profiles exist.
 */

export type BlogAuthorSeed = {
  slug: string
  name: string
  jobTitle: string
  yearsExperience: number
  position: number
}

const AUTHORS: BlogAuthorSeed[] = [
  { slug: 'anjali-krishnan', name: 'Anjali Krishnan', jobTitle: 'Technical Director', yearsExperience: 10, position: 1 },
  { slug: 'ravi-bhatt', name: 'Ravi Bhatt', jobTitle: 'Founder & CEO', yearsExperience: 23, position: 2 },
  { slug: 'mehul-rana', name: 'Mehul Rana', jobTitle: 'Operations Lead', yearsExperience: 8, position: 3 },
  { slug: 'sunil-patel', name: 'Sunil Patel', jobTitle: 'Head of Sales', yearsExperience: 12, position: 4 },
]

export default AUTHORS
