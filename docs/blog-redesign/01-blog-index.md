# Redesign brief — Blog index (`/blog`)

Live: https://indushydraulics.com/blog

## Goal

A more modern, navigable blog front page. Readers arrive looking for a specific problem
(a fitting thread, a hose failure, a standard) — the page should get them to the right
topic or article in one or two clicks. **Presentation only: no data, URL or schema changes.**

## Files today

| Piece | File |
|---|---|
| Route | `apps/web/src/app/(storefront)/blog/page.tsx` |
| View (shared with `/blog/page/[n]`) | `apps/web/src/components/blog/BlogIndexView.tsx` |
| Article card (shared with hubs and author pages) | `apps/web/src/components/blog/BlogPostCard.tsx` |
| Data loader | `apps/web/src/lib/blog-index.ts` → `getBlogIndexPage(page)` |
| List query | `apps/web/src/lib/blog-posts.ts` → `listBlogPosts`, `countBlogPosts` |
| Editable copy | `packages/domain/src/page-sections/pages/blog.ts` (Pages & Blocks doc `blog`) |
| Newsletter form | `apps/web/src/components/HomeNewsletterForm.tsx` |

## Data available (do not add fields)

`getBlogIndexPage(1)` returns:

- `posts` — 12 newest published articles (`BLOG_PAGE_SIZE = 12`), each a `BlogPostCardData`:
  `slug, title, excerpt, publishedAt, readingMinutes, heroPath, heroAlt, categoryName, categorySlug, authorName`
- `topics` — published categories with ≥1 article: `{ slug, name, count }`, in admin order
- `totalPosts`, `totalPages`

Editable copy from Pages & Blocks (`content.values(key)`), all optional strings:

| Section key | Fields | Notes |
|---|---|---|
| `hero` | `eyebrow`, `heading`, `body` | Locked section (always shown) |
| `topics` | `all_label` | Can be toggled off (`content.isOn('topics')`) |
| `articles` | `empty_message` | |
| `newsletter_card` | `eyebrow`, `heading`, `body` | Sidebar |
| `topics_card` | `heading` | Sidebar, lists `topics` |
| `help_card` | `heading`, `body`, `cta_label`, `cta_href` | Sidebar |

The three sidebar cards render in the editor's order (`content.order`). If you drop or merge a
section in the new design, say so — the admin editor still shows it, so it needs to keep
meaning something or be removed from `blog.ts` deliberately.

## Live content shape (2026-10-13)

- **232** published articles, all with a hero image, hero caption, category and author.
- Titles 29–101 chars (median 70). Excerpts 127–363 chars (median 189) — design for the long ones.
- **15** topics, 3–35 articles each: Industrial hose (34), Lifting & rigging (35), Failure analysis (22),
  Oilfield & pressure control (20), Thread & fitting identification (19), Machine down (17), …
- **1** published author. Reading time is set on every post.
- Hero images are photos, mostly 16:9-ish crops; the card currently shows 4:3.

## Current layout

1. Hero: eyebrow, serif H1, standfirst, "232 articles · Page 1 of 20".
2. Horizontally scrolling topic chips (All + 15 topics) linking to `/blog/c/[slug]`.
3. Two columns: lead card (newest post) over a 2-col card grid | 300px sidebar
   (newsletter, browse by topic, ask an engineer).
4. Pagination: "← Newer · Page 1 of 20 · Older →".

Pain points worth solving: newest-first is the only way in; topics are a flat chip row with no
sense of what each covers; no search; the lead card is just a bigger card; 20 pages of
chronology bury good evergreen guides.

## Must keep

- **URL `/blog`**, and topic links to `/blog/c/[slug]`, article links to `/blog/[slug]`, page links
  to `/blog/page/[n]` (page 1 is `/blog`; `/blog/page/1` 404s on purpose).
- **Real `<a href>` links** for every topic, article and page link — crawlers follow them. No
  JS-only navigation or "load more" that replaces pagination links.
- **JSON-LD**: `CollectionPage` + `BreadcrumbList` (already in `page.tsx`).
- RSS alternate in metadata; the page title/description in `page.tsx`.
- Card image alt = `heroAlt ?? title`. Never render `Media.caption`.
- Server Component. Any client island (e.g. a filter) must be a small `'use client'` leaf.

## Open to change

Layout, hierarchy, card design, how topics are presented (grid of topic tiles, mega-list,
grouped sections), featured/lead treatment, sidebar vs. no sidebar, adding a client-side
filter or a link to `/search`, per-topic "latest 3" rows — anything that uses only the data above.
If a design needs data the loader does not return (e.g. topic images, "most read"), flag it
as a follow-up rather than inventing it.

## Design system

Follow `CLAUDE.md` §2 and §10 and `design_handoff_indus_hydraulics_v2/01-design-language.md`:
colour only from tokens in `apps/web/src/app/globals.css`; radius ladder 4/6/10/16px;
Geist (sans), Instrument Serif (display), JetBrains Mono (data/labels only — dates, counts,
eyebrows; never prose); one primary action per view; 40px minimum hit target; visible focus
rings; honour `prefers-reduced-motion`; no inline `style=`; light theme only.

## Deliverable

2–3 alternative directions for this page. Build them as new view components fed by the
**same** `getBlogIndexPage` + `getMasterPageContent('blog')` output — no loader, schema or
content changes. Check each at 375px and 1440px, with 12 cards and with 0 cards (empty state).
