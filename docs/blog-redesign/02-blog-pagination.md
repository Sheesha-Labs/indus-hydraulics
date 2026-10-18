# Redesign brief — Blog archive pages (`/blog/page/[n]`)

Live: https://indushydraulics.com/blog/page/2

## Goal

Pages 2–20 of the blog. Today they are the `/blog` front page with a different slice of
articles. Redesign them so a reader who goes deeper can still find their way — and so older
articles stay one crawlable hop from the index. **Presentation only: no data, URL or schema changes.**

## Files today

| Piece | File |
|---|---|
| Route | `apps/web/src/app/(storefront)/blog/page/[n]/page.tsx` |
| View (same as `/blog`) | `apps/web/src/components/blog/BlogIndexView.tsx` |
| Article card | `apps/web/src/components/blog/BlogPostCard.tsx` |
| Data loader | `apps/web/src/lib/blog-index.ts` → `getBlogIndexPage(n)` |
| Editable copy | Pages & Blocks doc `blog` (`packages/domain/src/page-sections/pages/blog.ts`) — same doc as `/blog` |

## Data available (do not add fields)

`getBlogIndexPage(n)` returns:

- `posts` — 12 articles for slice `n`, newest first, each `BlogPostCardData`:
  `slug, title, excerpt, publishedAt, readingMinutes, heroPath, heroAlt, categoryName, categorySlug, authorName`
- `topics` — `{ slug, name, count }` for every published topic with articles
- `totalPosts` (232 today), `totalPages` (20 today)

Copy: same `blog` Pages & Blocks doc as page 1 (`hero`, `topics`, `articles`, `newsletter_card`,
`topics_card`, `help_card`). The route passes the identical document on purpose — wording must
not drift between page 1 and page N.

## Current layout

Identical to `/blog`: full hero (eyebrow, H1, standfirst, "232 articles · Page 2 of 20"), topic
chips, lead card + 2-col grid, sidebar, "← Newer · Page 2 of 20 · Older →".

Pain points: the full marketing hero repeats on every page; a "lead" card on page 7 is just
whatever happens to be newest in that slice; prev/next only, so page 15 is 14 clicks away; no
indication of the date range a page covers.

## Rules this route enforces (keep them)

- Page 1 lives at `/blog`. `/blog/page/1` and non-numeric `n` → 404. Beyond `totalPages` → 404.
- "Newer" from page 2 links to `/blog`, not `/blog/page/1`.
- Each page is **indexable and self-canonical** (metadata in the route). Do not noindex.
- `rel="prev"` / `rel="next"` on the links (harmless, already there).
- JSON-LD: `BreadcrumbList` Home › Blog › Page N.
- `generateStaticParams` returns pages 2–3 only; others render on first hit and cache. Do not
  grow this list (build minutes).

## Must keep

- Real `<a href>` links to articles, topics and other pages. If you add numbered pagination
  (recommended — it shortens crawl depth), every number is a link. No infinite scroll or
  "load more" that replaces the links.
- Card image alt = `heroAlt ?? title`.
- Server Component.

## Open to change

- Whether pages 2+ get a compact header (e.g. "Blog · Page 7 of 20" + topic chips) instead of
  the full hero. Allowed — the view can branch on `page > 1`, as long as copy still comes from
  the same `blog` doc.
- Uniform grid instead of a lead card on archive pages.
- Numbered / windowed pagination (1 … 6 7 8 … 20), jump-to-page, "showing articles 73–84 of 232",
  a date-range label derived from the first/last `publishedAt` in the slice.
- Topic shortcuts so a deep reader can switch to a topic hub instead of paging.

## Design system

Follow `CLAUDE.md` §2 and §10 and `design_handoff_indus_hydraulics_v2/01-design-language.md`:
tokens from `apps/web/src/app/globals.css` only; radius 4/6/10/16px; Geist / Instrument Serif /
JetBrains Mono (mono for page numbers, dates, counts — not prose); 40px hit targets (pagination
numbers included); visible focus; reduced motion; no inline `style=`; light theme only.

## Deliverable

2–3 alternatives, designed together with the `/blog` index brief (`01-blog-index.md`) since
both render through one view. Build as view components fed by the same `getBlogIndexPage(n)`
output. Check page 2, a middle page and the last page (which may hold fewer than 12 cards),
at 375px and 1440px.
