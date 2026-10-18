# Redesign brief — Blog article (`/blog/[slug]`)

Live examples (most block types per post):
- https://indushydraulics.com/blog/identify-any-hydraulic-fitting (18 block types)
- https://indushydraulics.com/blog/api-7k-16c-16d-which-standard (17)
- https://indushydraulics.com/blog/bspp-bonded-seal-sizing (17)

## Goal

The article is the page that earns the traffic: 232 posts, about 22 blocks each. Make it easier
to read, scan and act on: quick answer up top, clear wayfinding through long guides, and an
obvious next step (a part, a topic, a quote). **Presentation only: no data, URL, schema or
block-content changes.** Every existing block must still render.

## Files today

| Piece | File |
|---|---|
| Route (header, hero, layout, JSON-LD) | `apps/web/src/app/(storefront)/blog/[slug]/page.tsx` |
| Body renderer | `apps/web/src/components/blog/BlogArticleRenderer.tsx` |
| Blog-only block views | `apps/web/src/components/blog/blocks/*.tsx` |
| Blocks shared with service cases | `apps/web/src/components/services/blocks/*.tsx` |
| Left contents list | `apps/web/src/components/blog/BlogToc.tsx` (+ `services/ReadingProgress.tsx`) |
| Right side panel | `apps/web/src/components/blog/BlogArticleRail.tsx` |
| "More on {topic}" | `apps/web/src/components/blog/RelatedReading.tsx` + `lib/related-reading.ts` |
| Resolver | `apps/web/src/lib/blog-article.ts` → `resolveBlogArticle` |
| Block schema (source of truth for fields) | `packages/domain/src/blog-blocks.ts` |
| Body CSS | `.sc-article-body`, `.ih-rich-text` in `apps/web/src/app/globals.css` |

Shared block views also render on `/services/[slug]` case studies. Restyling them changes
those pages too. That's fine, but check one case study, or give the blog its own variant.

## Data available (do not add fields)

**Post** (`BlogPost`): `title`, `excerpt`, `hero` (Media: `storagePath`, `alt`), `heroCaption`,
`publishedAt`, updated date (`blogPostModifiedAt`, shown only when meaningfully later),
`readingMinutes`, `tags`, `category { slug, name }`, `blogAuthor { slug, name, jobTitle, credentials, linkedinUrl }`,
`reviewedBy` + `reviewedAt` (technical reviewer, with optional author profile), `bodyBlocks`,
legacy `body` HTML.

**Resolved article** (`ResolvedBlogArticle`):
- `blocks`: validated block array (invalid ones dropped and logged)
- `toc`: `{ anchor, title }[]` from `section_head` blocks
- `faqs`: Q&A pairs from `faq_block`
- `productsBySku`: `EmbeddedProduct { sku, slug, title, descriptionShort, brandName, imagePath, imageAlt }`
- `categoriesBySlug`, `articlesBySlug`, `livePageLinks`, `figuresById`: lookups for link and figure blocks

**Page-level**: `contact { whatsappUrl, emailUrl, phone }`; `moreFromTopic` (3 related articles
from the same category, excluding ones already linked in the body).

## Live content shape (2026-10-13)

- 232 posts, **all** block-based (0 legacy `body`-only, but keep the fallback). 6–38 blocks, avg 22.5.
- Every post has a hero image + caption, category and author. **1** published author.
  **0** posts have a reviewer yet (supported; design the line, don't make it prominent).
- Titles 29–101 chars. Excerpts 127–363 chars.
- ~4 `section_head`s per post on average, so the contents list is short.

## Block inventory

Ranked by live use. **Design every block in the top two groups.** The rest need a
reasonable style but are rare or unused in posts today.

**In every or nearly every post**

| Block | Posts / uses | Fields |
|---|---|---|
| `lead` | 232 / 232 | `html`: opening paragraph |
| `direct_answer` | 232 / 232 | `question`, `answer` (≤600): the quick answer box |
| `section_head` | 232 / 896 | `number` ("01"), `title`, `anchor` (kebab-case, the jump-link target) |
| `paragraph` | 227 / 894 | `html` (≤4000; links, `<strong>`, `<em>`, lists) |
| `faq_block` | 232 / 232 | `heading?`, `items[{question, answer}]` (2–6 items live) |
| `category_link` | 232 / 427 | `slug`, `label`, `blurb?`: link card into the catalogue |
| `related_articles` | 232 / 232 | `heading?`, `slugs[]` (1–6): article cards |
| `cta_block` | 232 / 232 | `heading`, `body`, `quoteLabel?`, `quoteUrl?` + WhatsApp/email/phone |
| `callout` | 229 / 308 | `tone` note (103) / warning (153) / danger (52), `title`, `body` |
| `comparison_table` | 228 / 353 | `caption?`, `columns[]` (2–7), `rows[{cells[], highlight}]` (2–21 rows) |
| `key_takeaways` | 211 / 211 | `heading?`, `items[]` (2–6) |
| `market_reach` | 197 / 197 | `heading`, `body`, `groups[{region, markets[{slug, name}]}]`, `footnote?` |
| `product_embed` | 188 / 208 | `heading?`, `skus[]` (1–8), `note?`: product cards |
| `as_of_stamp` | 183 / 183 | `verifiedOn` (date), `note?`: "verified on" stamp |

**In some posts**

| Block | Posts / uses | Fields |
|---|---|---|
| `figure` | 143 / 143 | `imageId`, `caption`, `captionPrefix?`, `aspectRatio` (all 16/9 live) |
| `decision_tree` | 84 / 84 | `heading`, `intro?`, `branches[{condition, outcome, detail?, sku?}]` (2–12) |
| `page_link` | 66 / 74 | `kind` market / service / industry, `slug`, `label`, `blurb?` |
| `prose` | 20 / 29 | `html` (≤20,000; long-form rich text with h3, lists, tables) |
| `standard_citation` | 19 / 33 | `standard`, `publisher`, `title`, `clause?`, `edition?`, `summary`, `url?` |
| `sop_block` | 10 / 10 | `header`, `completion`, `phases[{name, rows[{task, detail, who, tool, done}]}]` |
| `diagram` | 1 / 1 | `svg` (inline SVG), `caption`, `captionPrefix?`, `alt` |

**Unused in posts today** (supported by the schema; shared ones appear on service cases):
`video` (YouTube; `title`, `description?`, `uploadDate`, `duration?`, `caption?`), `references`
(`entries[{id, text, url?}]`), `download_block` (`items[{label, url, size, format?}]`),
`problem_solution`, `pull_quote`, `approach_grid`, `spec_table`, `result_box`, `team_list`.

## Current layout

1. Breadcrumb Home / Blog / {topic}.
2. Header (max 780px): topic tag, serif H1, excerpt, byline row (author · job title · date ·
   updated · N min read), optional "Technically reviewed by…".
3. Hero image 16:7 with caption.
4. Three columns at `lg`: 220px sticky contents list (numbered, with reading progress) |
   article body | 300px sticky panel ("Parts in this article" from every `product_embed`, then
   a "Need these specified?" quote card). Stacks on mobile with the contents list on top.
5. "More on {topic}": 3 cards.
6. "← Back to Blog".

Pain points: three columns squeeze the body on laptops; on mobile the contents list and the parts
panel stack as blocks above and below the article; the quick answer, takeaways and FAQ get
similar visual weight to everything else; every post ends with the same pile of link blocks
(category links, related, market reach, CTA); long comparison tables are hard to read on phones.

## Must keep

- **URL `/blog/[slug]`.** Breadcrumb and topic links to `/blog/c/[slug]`, author to `/blog/author/[slug]`.
- **Section anchors**: each `section_head` renders `id={anchor}`. Other posts link to
  `/blog/x#anchor`, and about 730 in-text links point into these pages. Never change or drop them.
- **JSON-LD** (all built in `page.tsx`): `BlogPosting` (author, reviewer, dates, image +
  caption), `BreadcrumbList`, `FAQPage` (from `faq_block`; the visible FAQ must stay in the
  HTML, not lazy-loaded), `VideoObject` per video.
- Visible dates and byline match the markup (same `modifiedAt` source).
- Hero image `alt = hero.alt ?? title`, `priority` loading. Show `heroCaption` (it says *why* the
  picture is there). **Never render `Media.caption`**: it holds internal provenance notes.
- Every `product_embed`, `category_link`, `related_articles`, `page_link` and `market_reach`
  link stays a real `<a href>`. These blocks carry the internal-link structure.
- Legacy fallback: if `blocks` is empty, render `post.body` HTML in `.ih-rich-text`.
- Grid items keep `min-w-0`, and the outer grid keeps `grid-cols-1` on mobile. Without these,
  wide tables or contents entries make the page scroll sideways.
- One `<main>` only (the storefront layout provides it; the article uses a `div`).
- Server Component. Client islands (contents highlight, FAQ accordion, table scroll) stay small leaves.

## Open to change

Column structure (e.g. contents as a top bar or floating pill, parts panel moved inline or to the
foot, two columns instead of three), header and hero composition, reading width and type scale,
a "quick answer" zone that groups `direct_answer` + `key_takeaways` + `as_of_stamp`, visual
treatment of every block, collapsing the end-of-article link blocks into a cleaner "next steps"
footer (a presentation choice: render them in a different place or arrangement, but keep every
link), mobile table patterns (sticky first column, cards per row), active-section highlighting in
the contents list, share/copy-link affordances.

If a design needs data that doesn't exist (author photo on the post, "most read", related products
beyond `product_embed`), flag it as a follow-up instead of faking it.

## Design system

Follow `CLAUDE.md` §2, §10 and §13, plus `design_handoff_indus_hydraulics_v2/01-design-language.md`:
colour only from tokens in `apps/web/src/app/globals.css`; radius 4/6/10/16px; Geist (sans),
Instrument Serif (display/H1), JetBrains Mono for data only (SKUs, dates, table headers,
eyebrows, section numbers; never prose, and a number inside a sentence is not mono); one primary
action per view (the quote CTA); 40px hit targets; visible focus rings; honour
`prefers-reduced-motion`; colour never the only signal (callout tones need an icon or label); no
inline `style=`; light theme only. The FAQ accordion, if any, is hand-rolled and owns its
keyboard and ARIA behaviour (no Radix overlay primitives are installed).

## Deliverable

2–3 alternative directions. Build them as new layout and block-view components fed by the
**same** `resolveBlogArticle` output and post row. No resolver, schema or content changes.
Include a block-library page or story that renders every block type with realistic content,
so nothing is left unstyled. Check the three example posts at 375px, 1024px and 1440px.
