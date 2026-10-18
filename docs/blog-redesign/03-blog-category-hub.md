# Redesign brief — Blog category hub (`/blog/c/[slug]`)

Live examples:
- https://indushydraulics.com/blog/c/industrial-hose (34 articles)
- https://indushydraulics.com/blog/c/fitting-identification (19 articles, 8 body blocks)
- https://indushydraulics.com/blog/c/safety (3 articles)

## Goal

A topic hub is a ranking page and a reader's map of a subject, not just a filtered list. Make it
read like a short guide to the topic that hands the reader to the right article. **Presentation
only: no data, URL or schema changes.**

## Files today

| Piece | File |
|---|---|
| Route | `apps/web/src/app/(storefront)/blog/c/[slug]/page.tsx` |
| Article card | `apps/web/src/components/blog/BlogPostCard.tsx` |
| Hub body renderer (same as articles) | `apps/web/src/components/blog/BlogArticleRenderer.tsx` + `components/blog/blocks/*` |
| Body resolver | `apps/web/src/lib/blog-article.ts` → `resolveBlogArticle(bodyBlocks)` |
| List query | `apps/web/src/lib/blog-posts.ts` → `listBlogPosts({ categoryId })` |
| Category model | `BlogCategory` in `packages/db/prisma/schema.prisma` |
| Block schema | `packages/domain/src/blog-blocks.ts` |

## Data available (do not add fields)

From `BlogCategory`:
- `name`, `description`, `heroCopy` (intro, 130–293 chars live), `bodyBlocks` (block array, optional)
- `imageId` exists but is **null on every hub** — do not design a hub that depends on an image.

From `listBlogPosts({ categoryId })`: **all** articles in the topic (no pagination; 3–35 live),
newest first, each `BlogPostCardData`:
`slug, title, excerpt, publishedAt, readingMinutes, heroPath, heroAlt, categoryName, categorySlug, authorName`.

Also in scope: `contact` (`whatsappUrl`, `emailUrl`, `phone`) for the `cta_block`.

Available but not fetched on this route today: the sibling topic list
(`getBlogTopics()` in `lib/blog-index.ts`, `{ slug, name, count }`). Reusing it for a
"other topics" nav is allowed — it is an existing loader, not new data.

## Live content shape (2026-10-13)

15 hubs. Every hub has `heroCopy`, `description` and a block body (1–8 blocks). Block types
used across hub bodies:

| Block | Uses | What it is |
|---|---|---|
| `category_link` | 16 | Link card to a catalogue category: `label`, `blurb?`, `slug` |
| `direct_answer` | 14 | Question + 1–3 sentence answer |
| `paragraph` | 14 | HTML paragraph |
| `comparison_table` | 14 | `caption?`, `columns[]`, `rows[{cells[], highlight}]` |
| `callout` | 14 | `tone: note / warning / danger`, `title`, `body` |
| `cta_block` | 14 | `heading`, `body`, `quoteLabel?`, `quoteUrl?` + WhatsApp/email |
| `faq_block` | 2 | `heading?`, `items[{question, answer}]` |

Field details for every block type are in `04-blog-article.md`.

## Current layout

1. Breadcrumb Home / Blog / {name}.
2. Header: "Topic" eyebrow, serif H1, `heroCopy ?? description`, "N articles".
3. Hub body blocks (if any), full width.
4. 3-col card grid of every article. Empty state: "No articles in this topic yet."

Pain points: no way to jump to a sibling topic; the body pushes the articles far down; 35
articles in one undifferentiated grid; nothing distinguishes the starter guide from niche
follow-ups; the article count is the only orientation.

## Must keep

- **URL `/blog/c/[slug]`**; links to `/blog/[slug]` and `/blog`.
- **JSON-LD**: `CollectionPage` (respects `jsonLdOverride`) + `BreadcrumbList` Home › Blog › {name}.
- SEO metadata from the route (seoTitle/description, canonical, robots flags).
- Every article in the topic reachable via a real `<a href>` on this page (it is the hub's job).
  Client-side sort/filter is fine; hiding articles behind JS-only "show more" is not — render all
  links in HTML, collapse visually if needed.
- Hub body renders through `BlogArticleRenderer`; a restyle of a block applies to articles too.
  If you want a hub-specific look for a block, pass a variant — don't fork the renderer.
- Card image alt = `heroAlt ?? title`. Server Component; client islands only as leaves.

## Open to change

Header treatment (with no image), placing the body beside or after the article list, a
"start here" slot (e.g. first article in the list, or the oldest), grouping articles visually,
sort control (newest / quickest read), sibling-topic navigation, compact list vs. cards when a
hub has 30+ articles, sticky in-page nav between "Guide" and "Articles".

## Design system

Follow `CLAUDE.md` §2 and §10 and `design_handoff_indus_hydraulics_v2/01-design-language.md`:
tokens from `apps/web/src/app/globals.css` only; radius 4/6/10/16px; Geist / Instrument Serif /
JetBrains Mono (mono for counts, dates, eyebrows — not prose); one primary action per view;
40px hit targets; visible focus; reduced motion; no inline `style=`; light theme only.

## Deliverable

2–3 alternatives. Build as a view component fed by the same category row, `listBlogPosts`
output and resolved hub body. Check with `safety` (3 articles), `fitting-identification`
(19 articles, 8 blocks) and `lifting-rigging` (35 articles, 1 block), at 375px and 1440px.
