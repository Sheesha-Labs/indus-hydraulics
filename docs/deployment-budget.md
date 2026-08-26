# Deployment budget

## The problem this documents

Vercel bills build execution, and a deployment costs more than its build
minutes: **every production deployment starts with an empty ISR cache**. Only
the pages named by `generateStaticParams` are warm. Everything else is rendered
again on its next request — a function invocation, an Observability event, and
the bytes to ship the HTML from the function to the edge.

Measured on 2026-08-26:

| | |
|---|---|
| Deployments in the previous 2 days | **100** (the CLI's page limit — the real number is at least that) |
| Typical build | 3–4 minutes |
| Implied build time | ~200 minutes/day |
| Commits to `main` in 45 days | 268 |
| Indexable URLs | 2,070 |
| Pages prerendered per build | ~282 |
| **URLs left cold by each production deploy** | **~1,790** |

The site's human traffic is low. That does not make deployments cheap — it
makes them the *dominant* cost, because the crawlers keep coming and every
deploy makes them pay full price again.

## What this repo does about it

### 1. Preview builds are opt-in

`apps/web/vercel.json` points at `apps/web/vercel-ignore-build.sh`, which
applies two rules:

1. **Previews are opt-in** — a preview branch builds only when the commit
   message contains `[preview]`.
2. **Documentation-only commits skip production too** — if a commit changes
   nothing outside `docs/` and `*.md`, there is nothing to ship.

The second rule is deliberately narrow. A wrong answer there ships nothing, and
"nothing shipped" stays invisible until someone goes looking for a change that
never arrived. Test-only commits could safely join the list; they are left out
until someone wants them.

Measured over the 30 days to 2026-08-26: **547 deployments and 2,449 build
minutes against 257 commits** — a preview build per push plus a production build
per merge.

To get a preview URL for a PR — worth it for anything visual — put the marker
in the commit message:

    git commit -m "feat(ui): restyle the shelf header [preview]"

A skipped build reports as a passing check, so nothing blocks the merge.

### 2. Outdated deployments should auto-cancel

Only 10 of those 547 deployments were cancelled. Push three times to an open PR
and all three preview builds run to completion, though only the last matters.

This one is a dashboard toggle, not a repo setting — it is not exposed on the
project API object:

**Vercel → Project → Settings → Git → "Automatically cancel outdated
deployments"**

### 3. Prerender lists stay short

See the note on `/p/[slug]`. Long lists warm more pages per deploy but cost
build minutes on every build, and builds outnumber cache lifetimes here. #412
has the arithmetic: prerendering all 194 shelves took the build from 5 minutes
to 16, against ~7.6 MB of cold renders it would have saved per deploy. Build
minutes won.

### 4. Merges are batched

Every merge to `main` is a production deploy and a cache wipe. Merging five
finished PRs together costs one wipe instead of five, so approved work is held
and landed as a batch — end of a session, or when the batch is coherent.

Exceptions that ship immediately: production is broken, a security fix, or the
change is explicitly wanted now.

### 5. Content belongs in the database, not in a commit

This is the lever with no downside. A blog post, a product, a category
description or a page section added through `/admin` is **zero deployments** —
the admin action calls `revalidatePath`/`revalidateTag` and the change is live.
The same content added as a seed file or a constant in `packages/domain` costs
a build, a deploy, and a cold cache for 1,790 URLs.

Only genuinely new *code* — a template, a route, a component — needs a deploy.

See `content-in-code-audit.md` for what is already DB-backed (most of it) and
what still costs a deploy.

## Can the cold cache be avoided instead?

No. Vercel's ISR documentation is explicit:

> each new deployment uses its own ISR cache and does not reuse the cache from
> a previous deployment

There is no setting that shares a cache across deployments, and no cache
handler to swap — Vercel manages ISR itself. Prerendering more pages moves the
cost from cold renders to build minutes, and #412 measured that trade going the
wrong way. **Deploying less often is the only lever**, which is what the two
rules above are.

## Before adding a deploy-triggering change

Ask whether the thing being added is content or code. If it is content and a
DB-backed home for it exists, use that home.
