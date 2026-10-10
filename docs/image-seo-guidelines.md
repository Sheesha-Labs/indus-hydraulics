# Image SEO guidelines — must-read before adding any product, blog post, page or image

These rules were established by the image SEO programme of 2026-10-08/09 (PRs #474, #475, plus
database and storage work). Every image that reaches the storefront must follow them, so the
programme never has to be repeated. `CLAUDE.md` §13 points here; read the whole file before
adding or changing an image.

**Owner of the rules:** this document. If a rule here is wrong, fix the rule here — do not
quietly diverge from it.

---

## 0. What Google actually reads, in order of weight

1. **Alt text** — the main signal for what a picture is.
2. **Text around the image, including a visible caption.**
3. **The image sitemap** — tells Google which images belong to which page.
4. **Structured data** (`ImageObject` with `caption`) and `og:image:alt`.
5. **The filename.**

The HTML `title` attribute and EXIF/IPTC metadata carry almost no weight. Do not spend effort
on them.

---

## 1. Alt text

### 1.1 Where alt text lives

| Image | Field | Notes |
|---|---|---|
| Product gallery photo | `ProductImage.alt` | Per listing. Wins over `Media.alt`. |
| Any media asset | `Media.alt` | Shared by every place the file is used. Describe the picture, not one listing. |
| Category card | `Category.image → Media.alt` | |
| Industry hero / case photos | `Industry.hero → Media.alt`, `IndustryCaseStudy.image → Media.alt` | |
| Industry support panel | `Industry.supportBlock.imageAlt` (JSON) | Image is a full URL in `supportBlock.image`. |
| Blog hero | `BlogPost.hero → Media.alt` | |
| Blog inline figure | `Media.alt` of the figure's `imageId` | The block's `caption` is separate (see §2). |
| Homepage hero slide | `HomepageHeroSlide.alt`, then `Media.alt` | |
| CMS section images | the section's own `alt` | `lib/page-content.ts` does not read `Media.alt`. |

### 1.2 The render chain — every product image site must use it

```tsx
alt={img.alt ?? img.media.alt ?? product.title}
```

This applies to the PDP gallery, `ProductCard`, and every product tile on brand, industry,
search, compare, quote, related-product and replacement pages (all fixed in #474). A new
component that renders a product image **must** use the same chain. Never `alt={product.title}`
on its own: it ignores the alt text that was written.

The PDP gallery's fallback numbers extra views (`"<title> — view 2"`) so a gallery is never five
identical alts.

### 1.3 Empty alt is only for decorative images

`alt=""` is correct **only** when the picture adds nothing the surrounding text does not
already say: the category fallback tile ("Category image · …" label), nav promo images under a
heading, the video poster behind a labelled play button, the compare-tray thumbnail. A content
image — a product, an industry hero, a case photo, a blog hero — **never** gets `alt=""`. The
industry hero shipped with `alt=""` until #474; do not reintroduce that.

### 1.4 How to write alt text

Pattern: **what it is + the key spec or standard + which view / what is visible.**

- ✅ `45° elbow metric female swivel hose fitting, 60° cone seat, zinc-plated steel with crimp hose tail`
- ✅ `Demco DM 7500 3-inch gate, rear view showing the T-slot`
- ✅ `Cross-section diagrams of 6x19 steel wire rope with FC, IWS and IWR cores`
- ❌ `Double Bolt Clamp` (the title copied — 72% of product photos were like this before the programme)
- ❌ `hydraulic fitting hydraulic adapter UAE supplier best price` (keyword stuffing)

Rules:

1. **Describe what the photo shows.** Look at the picture before writing. Finish and colour
   ("yellow zinc-plated", "polished stainless") only when visible.
2. **≤ 125 characters.** Front-load the important words.
3. **Unique within a gallery and across listings.** Each view says which view it is
   ("front view", "with handle and notch plate", "in sealed packaging", "beside its dimension
   drawing"). Two listings that share one photo still get different alts, built from each
   listing's own spec.
4. **Dimension drawings** say so: `… — dimension drawing` or `Dimension drawing of …`.
5. **A photo that does not match the listing is described honestly**, e.g.
   `(four-leg sling shown for type SOO)`, `(flanged valve shown, 4 in × 1502 listing)`. Then fix
   the photo (§3) — the honest alt is a stopgap, not the fix.
6. **No competitor part numbers or brand claims** that are not ours to make, even when stamped
   on the part in the photo.
7. **No unverifiable technical claims** (pressure ratings, standards) that the listing itself
   does not state.

---

## 2. Captions

### 2.1 `Media.caption` is internal — never render it

`Media.caption` holds provenance notes written by the import scripts, e.g.
`"Source: OFS Energy catalogue export, 2026-09-23"` or
`"… used as the maker's authorised representative"`. Rendering it would publish those notes.
**No storefront component may read `Media.caption`.** Keep writing provenance there — it is the
audit trail for image permissions — but never display it.

### 2.2 Reader-facing captions

| Where | Field | Rendered as |
|---|---|---|
| Blog hero | `BlogPost.heroCaption` (migration `202610082313`) | `<figcaption>` under the hero; also the hero `ImageObject.caption` in BlogPosting JSON-LD |
| Blog inline figure | figure block `caption` (+ optional `captionPrefix`) | `<figcaption>` |
| Service case hero | `ServiceCase.heroImageCaption` / `heroImageCredit` | `CaseHero` caption |

Caption rules:

1. **One sentence, ≤ 300 characters** (the editor caps it).
2. **Say why the picture is here; the alt says what is in it.** A caption that repeats the alt
   is read twice by a screen reader and adds nothing for Google.
   - Alt: `Raking light along the cover of a hydraulic hose, the printed lay-line catching…`
   - Caption: `The layline printed on a hose cover identifies the maker, grade and size.`
3. Plain claims grounded in the article itself. No new facts in a caption.
4. **Every new blog post gets a hero caption** (admin → Blog → post → "Hero caption").

Product galleries deliberately have no separate caption: the gallery already shows the alt as a
visible "VIEW 01 · …" label.

---

## 3. Getting the right photo on the listing

Alt text cannot rescue a wrong photo. Before writing alt text for a batch, **look at every
distinct photo against its listing** — the fastest way is a labelled contact sheet of thumbnails
with the listing titles beside them.

Common mismatches found in 2026-10: wrong bend angle (90° photo on a 45° listing), wrong end
types (female photo on a male × male adapter), pneumatic push-in parts on hydraulic listings,
multi-leg sling photos on single-leg listings, whole manifolds on single-fitting listings, one
photo reused across a whole family regardless of geometry.

Fix in this order:

1. **Reuse a correct photo already in our library** — another listing often shows exactly the
   right shape. Repoint `ProductImage.mediaId`. Zero risk.
2. **Maker or supplier photo**, within our permissions: authorised-representative makers
   (Cameron, Stream-Flo, Anson/NOV, WOM, TechnipFMC, SPM) and Chinese manufacturers' own sites
   (not marketplaces), with no visible third-party brand marks.
   **Hydraulics Direct** has been an Indus principal since 2026-10-09: its own part-specific
   studio photos (`<part>_Rectangle…`, `…_TopView…`) and dimension drawings may be used on the
   unbranded listings built from its catalogue. Do not use its CGI renders with a large TITAN
   logo (they also show a carbon-steel finish on stainless listings) or its generic `<code>-2`
   stock shots without checking the geometry — many show a different part.
3. **Edit one of our own photos** with Higgsfield (GPT Image 2) into the listed geometry. Review
   every result against the listing — AI gets angles and end types wrong about a quarter of the
   time. Record it in `Media.caption` as an AI-generated representative image.

**Never use a competitor's or distributor's product photo** (Parker, Eaton/Danfoss, Gates
distributors, etc.) as a generation input or as a listing image. A picture
derived from it is a derivative of their copyright.

Remove a photo outright only when no correct replacement can be found; the category image then
shows instead.

---

## 4. Files: format, size, dimensions, names, storage

### 4.1 Format and size

| Rule | Value |
|---|---|
| Photos (no transparency) | **JPEG**, quality ≈ 84, progressive |
| Transparency actually used | PNG (optimised). An opaque PNG photo is a JPEG in disguise — convert it. |
| Longest edge | ≤ 2000 px (the layout caps at 1440 px; 2000 covers 2× on most slots) |
| Target size | < 400 KB per image; most product photos land at 80–150 KB |
| SVG | Never as a product/content image (not re-served by `/media`, can carry script) |

Next's image optimiser resizes for visitors, but Google Images, the image sitemap and the JSON-LD
point at the **original** file, so the original's weight matters. In 2026-10, 274 originals were
re-encoded from 261 MB to 52 MB with no visible loss.

### 4.2 Record the dimensions

Every image `Media` row must have `width` and `height`. Upload paths and import scripts must set
them (the oilfield image runner reads them from the JPEG SOF marker). 367 rows were missing them
before 2026-10-09; the count is now zero — keep it there.

### 4.3 Filenames

The storage key is the public image URL. Name it from the alt text:

```
products/<SKU>/<descriptive-slug-from-alt>.jpg
```

- lowercase ASCII, hyphens, ≤ ~60 characters, cut at a word boundary, no trailing stopwords
- `°` → `deg`, `×` → `x`, fractions spelled out
- ❌ `HP040.png`, ❌ `1781390361107-lubricants-840x525.png`, ❌ UUIDs, ❌ `IMG_2041.jpg`
- ✅ `90-deg-elbow-npt-female-x-npsm-female-swivel-zinc-plated.png`

445 code-named files were renamed on 2026-10-09.

### 4.4 Never overwrite or delete a live storage object

To replace or rename a file: **upload / copy to a new key, then repoint `Media.storagePath`.** Leave
the old object in place. Old URLs that Google, caches or other rows still hold keep resolving,
and the change is reversible by pointing back. Back up originals locally before any bulk change.

### 4.5 Crawlable buckets

Supabase Storage answers every public object with `x-robots-tag: none`. Images therefore reach
crawlers through the same-origin `/media/<bucket>/<key>` route (`lib/crawlable-media.ts`).

- Allowed buckets: `product-images`, `blog-images`, `service-images`, `industry-images`
  (`CRAWLABLE_MEDIA_BUCKETS`).
- **A new public image bucket must be added to `CRAWLABLE_MEDIA_BUCKETS`**, or its images are
  invisible to Google Images.
- Upper-case extensions are not re-served (the proxy matcher is case-sensitive). Use lowercase.

---

## 5. Markup: structured data, Open Graph, sitemap

### 5.1 URLs in markup

JSON-LD, `og:image` and the image sitemap use **`crawlableImageUrl(storagePath)`** (same-origin
`/media/…`). On-page `<Image>` keeps `mediaUrl(storagePath)`. Never put a raw Supabase URL into
structured data, Open Graph or the sitemap.

### 5.2 Structured data (`packages/domain/src/seo/jsonld.ts`)

| Page | Builder | Image input |
|---|---|---|
| Product | `buildProductLd` | `images: [{ url, caption }]` — caption = the alt the gallery renders |
| Blog post / service case | `buildArticleLd` | `imageUrl` + `imageCaption` (hero caption, else alt) |
| Industry (DB pages) | `buildServiceLd` | `images: [{ url, caption }]` for hero, case photos, support panel |
| Collection | `buildCollectionLd` | `primaryImage` (only if the page shows its own image) |

A new page type that shows photographs must pass them, with captions, to its JSON-LD builder.

### 5.3 Open Graph

`pageMetadata({ ogImagePath, ogImageAlt })` sets `og:image:alt` and `twitter:image:alt`. Pass the
alt of the image actually used for sharing. It is never applied to the site default card.

### 5.4 Image sitemap (`apps/web/src/lib/sitemap-sections.ts`)

Sections that emit `<image:image>`: products (gallery order, max 10), blog posts (hero, then
inline figures resolved from `bodyBlocks` `imageId`s), industries (hero, case photos, support
panel), brands (case-study photos), services (hero). Use the `crawlableImages()` helper.

- A **new page type with images** must add an `images` array to its sitemap section.
- List only images that are actually on that page. Category shelves deliberately list none —
  their tiles belong to the product entries.

---

## 6. Checklists

### New product (admin or import script)

- [ ] Photo checked against the listing (geometry, end types, angle, material) — §3
- [ ] Photo source within permissions; no third-party brand marks — §3
- [ ] JPEG ≤ 400 KB, ≤ 2000 px, `width`/`height` recorded — §4.1–4.2
- [ ] Storage key is a descriptive slug in `products/<SKU>/` — §4.3
- [ ] `ProductImage.alt` written to the pattern, unique per view and per listing — §1.4
- [ ] Provenance in `Media.caption` (never displayed) — §2.1

**Import scripts:** `packages/db/src/imports/2026-10-08-oilfield-valve-images/run.ts` sets
`alt = product title` and names files from that alt. That is a placeholder — **run an alt-text
pass after every import** (or give the payload a per-image `alt`), or the new images join the
"alt = title" problem the programme cleaned up.

### New blog post

- [ ] Hero image chosen; its `Media.alt` describes the picture — §1.4
- [ ] **Hero caption** filled in the editor — §2.2
- [ ] Each inline figure has a `caption` and its media has its own `alt` (different text)
- [ ] Hero and figures follow file rules — §4
- [ ] (Automatic) hero + figures appear in the blog image sitemap; BlogPosting JSON-LD carries
      the caption

### New industry page (DB)

- [ ] Hero `Media.alt`, each case-study photo `Media.alt`, `supportBlock.imageAlt` written
- [ ] Images in `industry-images` (crawlable) — §4.5
- [ ] (Automatic) Service JSON-LD with captioned images; industry image sitemap entries

### New category

- [ ] Card image with descriptive `Media.alt` (≤ 125 chars — some category alts ran to 160+)

### New CMS page / section image

- [ ] The section's own `alt` field filled (CMS images ignore `Media.alt`)

### New page type or component in code

- [ ] Product images use the alt chain in §1.2; content images never `alt=""`
- [ ] Photographs passed to the JSON-LD builder with captions — §5.2
- [ ] `pageMetadata` given `ogImageAlt` — §5.3
- [ ] Sitemap section emits `images` via `crawlableImages()` — §5.4
- [ ] Never renders `Media.caption` — §2.1

---

## 7. Auditing (read-only SQL)

```sql
-- Product photos whose alt is just the listing title
select count(*) from product_images pi join products p on p.id = pi."productId"
where p.status = 'active' and lower(trim(pi.alt)) = lower(trim(p.title));

-- Images with no recorded dimensions
select count(*) from media where "deletedAt" is null and "mimeType" like 'image/%'
  and (width is null or height is null);

-- Images over 400 KB
select count(*) from media where "deletedAt" is null and "mimeType" like 'image/%'
  and bytes > 400 * 1024;

-- Blog posts with a hero but no caption
select count(*) from blog_posts where "isPublished" and "heroId" is not null
  and coalesce("heroCaption", '') = '';
```

Baseline on 2026-10-09: alt = title 1 (of ~2,800 product photos); missing dimensions 0; over
400 KB 11 (re-encoding saved < 25%); published posts without hero caption 0. A rise in any of
these means a new upload skipped this document.

---

## 8. Deploy and cache notes

- Alt text, captions, `Media` repoints and file renames are **database / storage changes — no
  deploy**. They go live as pages revalidate: product and category pages within 24 h
  (`revalidate = 86400`), blog posts within 1 h.
- Code changes to rendering, JSON-LD or the sitemap need a deploy — batch them (see
  `CLAUDE.md` working agreements).
- After a batch that changes many image URLs, resubmit `sitemap.xml` in Search Console and track
  Performance → Search type: Image.
