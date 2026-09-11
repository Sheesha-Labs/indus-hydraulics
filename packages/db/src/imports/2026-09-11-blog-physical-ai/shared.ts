export type { BlogArticleSeed } from '../2026-08-17-blog-articles/shared'

/**
 * Physical AI — the first research wave.
 *
 * Three long-form articles, and the `physical-ai` category they live in. This
 * wave differs from every previous one in three ways that are worth stating
 * before anyone reads the seeds and wonders.
 *
 * IT IS LONG-FORM, AND THAT IS DELIBERATE
 *
 * Every one of the 143 articles published before this wave runs to roughly
 * three minutes. These run to fifteen or more. They are not bottom-of-funnel
 * buying guides and they are not trying to be: the programme they belong to
 * (`docs/citable-research-content-strategy.md`) exists to earn citations from
 * an audience that does not buy fittings, on the theory that domain authority
 * earned there lifts the pages that do sell. A three-minute answer does not get
 * cited by anyone.
 *
 * THE PROSE LIVES IN `docs/articles/`, NOT HERE
 *
 * Each seed is generated from the HTML in `docs/articles/`. That file is the
 * editable source — it renders standalone, it is what the authors review, and
 * it holds the figures. Hand-editing the generated seed instead means the two
 * disagree and the HTML is the one a person will open.
 *
 * IT IMPORTS AS DRAFT
 *
 * The articles are content-complete and blocked on something the import cannot
 * supply: neither named author has real credentials recorded. `BlogAuthor.
 * credentials` feeds `hasCredential` in Person JSON-LD, which is the mechanism
 * that turns a byline into an expertise signal, and it is most of the reason
 * author pages were built. Publishing safety-adjacent technical argument under
 * a byline with no verifiable standing spends exactly the credibility the
 * programme exists to earn. So the author rows are created with names and
 * nothing invented, and the wave lands as draft. See `run.ts`.
 *
 * CO-AUTHORSHIP IS NOT REPRESENTABLE
 *
 * All three articles are bylined to two people in the source HTML.
 * `BlogPost.blogAuthorId` is singular, so each seed names a primary author and
 * the second name survives only in the prose. Representing co-authorship
 * properly is a schema change (a join table, as `BlogPostProduct` is) and it is
 * not in scope for importing three articles — but it is the reason the bylines
 * on the site will not match the bylines on the documents.
 *
 * SOURCING
 *
 * Every claim about model capability cites a primary source; every standard is
 * cited by designation and edition. The reference lists are canonical
 * literature that has been checked, not recent preprints that have not: an
 * unverified citation inside an article arguing for rigour is the one flaw that
 * would discredit the whole programme. Figures that are schematics rather than
 * measurements say so in their own captions and again in the closing note.
 */
