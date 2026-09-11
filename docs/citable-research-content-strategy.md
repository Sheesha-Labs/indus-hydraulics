# Citable Research Content Strategy

**Goal:** earn editorial backlinks and answer-engine citations from an audience
that does not buy hydraulic fittings, so that domain-level authority lifts the
1,487 commercial pages that do sell.

**Date:** 2026-09-08 · revised 2026-09-11
**Status:** Programme B approved and elevated to primary; Programme A proposed
**Owner:** Ayush Bhatia, Krishan Bhatia

---

## 1. Verdict on the proposal as stated

The strategic instinct is correct and the specific execution will fail. Both
halves of that sentence matter, so this section takes them in turn before
proposing the fix.

### 1.1 What is right

Building linkable assets that sit outside the commercial catalogue is a real,
durable tactic. Product and category pages almost never earn editorial links —
nobody cites a fittings listing. Reference material does. Separating the
link-earning surface from the converting surface, and letting internal linking
carry authority between them, is the correct shape.

It is also the right moment. The blog already has infrastructure that most
distributors do not: `standard_citation`, `comparison_table` rendered as real
HTML table markup rather than a JPEG, `direct_answer`, `key_takeaways` and
`as_of_stamp` blocks. That set was designed for extraction and citation. It is
currently being spent on 143 articles that average three minutes of reading.
The capability is built and under-used.

### 1.2 What breaks

**Research-paper shape without primary research is not citable.** People cite
primary sources: original measurements, original datasets, original surveys. An
essay synthesising public commentary on reasoning models, however well
footnoted, is an opinion piece wearing a lab coat. The audience being targeted
— robotics engineers, ML researchers, automation press — is specifically the
audience most able to tell the difference, and least forgiving about it. The
`standard_citation` block exists so this site can *be* a source. Formatting
alone does not achieve that.

**Link relevance is weighted, and off-topic links land in the wrong
neighbourhood.** A link from an AI newsletter passes authority into the AI
topical cluster. It does not transfer cleanly to "hydraulic hose fittings
supplier UAE." The well-documented failure mode of off-topic link bait is a
traffic spike, a nice-looking backlink profile, and no movement on commercial
rankings.

**Industrial robotics and AI is the single most saturated content category on
the internet right now.** Winning a link race there means outranking arXiv,
IEEE Spectrum, NVIDIA, DeepMind, every robotics startup's content team and
every venture fund's research arm. A distributor entering that fight from a low
domain rating loses it.

**There is no authority signal to attach the claims to.** The database holds
one `BlogAuthor` row. `BlogAuthor.credentials` feeds `hasCredential` in Person
JSON-LD and is the mechanism by which a byline becomes an expertise signal.
There is no robotics credential on staff, and an unattributed robotics claim
from a fittings distributor reads as marketing.

### 1.3 The reframe

Keep the strategy. Move the topic to where the company holds evidence nobody
else holds.

> **Autonomous industrial systems do not fail at the reasoning layer. They fail
> at the parts layer.**
>
> A rig-inspection robot can already detect a weeping joint and classify it. It
> cannot order the replacement — because industrial part identity is not
> machine-readable. There is no canonical identifier that maps "JIC 37° 1/2 in
> male elbow, carbon steel, 350 bar" across Parker, Gates, Eaton and an
> unbranded import. The pressure rating that decides whether a substitution is
> safe is, in the majority of real catalogues, an unparseable string.

That thesis is adjacent to hydraulics rather than distant from it, so links
land in a neighbourhood that touches the commercial pages. It is genuinely
unsolved, so it is worth citing. It is interesting to roboticists, agent
builders, supply-chain data teams and standards bodies — the diverse audience
originally wanted. And, critically, it can be proved with data already sitting
in this database.

---

## 2. The evidence base — what is actually in the database

Queried live on 2026-09-08. These are the numbers that make the programme
publishable rather than speculative.

### 2.1 Catalogue scale

| Asset | Count |
|---|---:|
| Active products | 1,487 |
| Product specs | 16,114 |
| Product variants | 6,328 |
| Product FAQs | 11,281 |
| Brands | 29 |
| Published blog posts | 143 |
| Blog categories | 14 |
| Blog authors | 1 |

### 2.2 The finding

The spec corpus is the asset. It is also, measurably, not machine-readable —
and that is the paper.

| Measure | Value |
|---|---:|
| Specs carrying no unit in the `unit` column | 14,419 / 16,114 (**89.5%**) |
| Distinct spec labels | 243 |
| Distinct labels after case/whitespace normalisation | 237 (6 pure duplicates) |
| Distinct units across the whole corpus | 25 |
| Specs not attached to a spec template | 954 |
| Spec groups | 20 |

Narrowing to pressure — the field that decides whether a substitution is safe:

| Measure (1,548 pressure spec rows) | Value |
|---|---:|
| Value is a bare parseable number | 698 (**45.1%**) |
| Unit buried inside the free-text value | 527 (34.0%) |
| Value is a range or contains a slash | 214 (13.8%) |
| Value contains no digit at all | 54 (3.5%) |
| `unit` column is null or empty | 917 (**59.2%**) |

Real values, verbatim from the corpus, with occurrence counts:

- `"15000"` — 88 rows. No unit. 15,000 bar is physically implausible for a
  fitting, so a human infers psi. A machine cannot.
- `"10000"` — 86 rows. Same ambiguity.
- `"0"` — 10 rows. A null encoded as a number, which is the worst possible
  failure: an agent reads zero rated pressure and either rejects a valid part
  or, with a comparison operator the wrong way round, accepts a catastrophic one.
- `"L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)"` —
  40 rows. Two products, two unit systems, one field.
- `"Up to 250 psi (1/2\"–2\"); 150 psi (3\"–4\"); 75 psi (5\"–6\") — derates with size, see datasheet"`
  — 30 rows. An entire derating table serialised into a string.
- `"ANSI Class 150 (285 psi WP) or Class 300 (740 psi WP) per ASME B16.5 ratings"`
  — 9 rows. A pressure rating expressed as a reference to a standard.

Label collisions for near-identical concepts, in the same corpus:

- `Working Pressure` (434) vs `Max Working Pressure` (382)
- `Nominal Size Range` (582) vs `Size Range` (201)
- `Material` (633) vs `Materials Available` (208) vs `Material Class (API 6A)` (208)
- `Working Pressure` appears with three unit conventions: null, `bar`, `psi`

### 2.3 Why auditing our own catalogue is the strongest possible move

The obvious objection is that publishing this looks like admitting the
catalogue is a mess. It is the opposite. A vendor publishing a rigorous,
quantified, self-critical audit of its own data quality is the most credible
thing in this category, because every competitor has the same problem and none
of them will say so. Self-critical primary research is cited. Vendor
thought-leadership is not.

The framing is straightforward and honest: *we tried to make our catalogue
agent-readable, here is exactly what broke, here is the schema we are adopting,
here is the data so you can check us.*

### 2.4 What is not available

Being clear about this prevents planning research that cannot be done.

| Table | Rows | Consequence |
|---|---:|---|
| `supplier_offers` | 0 | No lead-time or pricing research |
| `enquiries` | 1 | No demand-pattern research |
| `gsc_metric_daily` | 0 | GSC not connected; no search-demand research |
| `product_cross_references` | 71 | Too thin for a cross-reference failure study |
| `search_query_logs` | 393 | Directional only, not publishable |
| `not_found_logs` | 18 | Nothing |

The spec corpus carries the programme. Everything else is a later phase, and
two of the gaps (GSC, cross-references) are worth closing precisely because
they unlock a second and third study.

---

## 3. The asset ladder — what actually earns links

Ranked by links earned per hour invested. This is the part most content plans
get wrong: essays are at the bottom.

| Tier | Asset | Why it earns | Effort |
|---|---|---|---|
| 1 | **Open dataset with a DOI** | Literally citable. Zenodo mints a DOI; Google Dataset Search indexes it; papers reference it in a bibliography permanently | High, one-off |
| 2 | **Benchmark / eval suite** | Benchmarks accumulate citations from everyone who reports a score. Self-reinforcing | High |
| 3 | **Free tool or API** | Engineers link tools they use. Durable, non-decaying | Medium |
| 4 | **Proposed schema or spec** | Becomes a reference point. Attracts both adopters and critics, who both link | Medium |
| 5 | **Original quantified study** | Journalists and analysts cite a number they cannot get elsewhere | Medium |
| 6 | **Synthesis essay** | Earns almost nothing in a saturated category | Low |

The original proposal sits entirely in tier 6. The programme below is built on
tiers 1–5, with essays used only as the readable surface over a dataset.

**Rule for this programme: no article ships without an artefact underneath it.**
A number we measured, a dataset we published, a tool that runs. If a piece has
none of those, it belongs in the existing blog, not here.

---

## 4. Research programmes

Four programmes. Programme A is the spine and must ship first; the others
depend on the credibility it establishes and, in two cases, on data work that
has not started.

### Programme A — Machine-readable industrial parts *(ready now)*

The flagship. Everything needed is in the database today.

**A0. Pillar: `Industrial parts data is not machine-readable, and that is what stops industrial autonomy`**
Long-form, 4,000–5,000 words, the hub every other piece links to. Opens with
the robot that can see the fault and cannot order the part. Carries the
headline statistics from §2.2. Proposes the identity schema. Links to the
dataset, the benchmark and every spoke.
*Artefact: the full audit, published as data.*

**A1. `An audit of 16,114 hydraulic specifications: how much is machine-readable?`**
The primary research paper. Method, corpus description, parseability by field
type, failure taxonomy, reproducible queries. Self-critical throughout — this
is our catalogue, not a competitor's.
*Artefact: `indus-spec-audit-2026` dataset on Zenodo (DOI) + Hugging Face + GitHub.*

**A2. `HydraulicSpec: a JSON schema for machine-readable fluid-power part identity`**
The proposed standard. Canonical field names, required units, thread identity
as a structured object rather than a string, pressure as `{value, unit, basis, derating}`.
Published as a versioned JSON Schema with a validator.
*Artefact: schema repo + online validator.*

**A3. `Can a language model read a spec sheet? A benchmark for industrial part comprehension`**
The highest-ceiling asset. A held-out set of real spec rows with
human-verified ground truth, and tasks: extract working pressure with unit,
identify thread family, judge whether part B can substitute for part A. Report
scores for the current frontier models. Every lab and every team that runs it
afterwards has a reason to cite it.
*Artefact: eval suite on GitHub, leaderboard page on-site.*

**A4. `The unit problem: what "15000" means, and why no machine can tell`**
Short, sharp, highly shareable. Built entirely on the verbatim values in §2.2.
The `"0"` rows are the safety argument and the emotional core of the piece.
*Artefact: the value-format distribution table.*

**A5. `Thread identity across 29 brands: why cross-referencing is not a lookup`**
Why "JIC 37°" is four different things depending on standard, and why
substitution is a constraint-satisfaction problem, not a table join.
*Artefact: thread identity reference table, already partly in `packages/domain/src/thread-reference.ts`.*

**A6. `Safety-critical substitution under uncertain data: a failure-mode analysis`**
What happens when an agent substitutes a part on a bad reading. Injection
injury, stored energy, whip. This is where hydraulics expertise is genuinely
authoritative and the robotics audience is genuinely ignorant — the strongest
credibility position in the whole programme.
*Artefact: failure-mode taxonomy table.*

### Programme B — Industrial robotics and AI *(approved; now the primary programme)*

**Fully specified in [`robotics-ai-research-programme.md`](./robotics-ai-research-programme.md).**

Owner decision of 2026-09-11: proceed with the robotics and AI topic as
originally framed, co-authored by Ayush Bhatia and Krishan Bhatia. The concern
in §1.2 was raised, considered and overruled; that is recorded rather than
re-argued.

The programme is made defensible by one organising constraint — **own the
inspected, not the inspector.** Every piece is authored from the asset owner's
side of the problem: what the robot is being pointed at, what it cannot see,
what would have to be true before it is trusted near a pressure boundary. It
never claims expertise in model internals, and every claim about model
behaviour cites a primary source.

Six clusters, 35 subtopics, 15 to ship: the cognition layer, model × robot
interconnectedness, rig inspection as a domain, what no camera can see,
certification and liability, and closing the loop to procurement.

Two dependencies carry over from §1.2 and are now blocking rather than
advisory: real credentials for both authors (§5.2 and the child document's §1),
and the sourcing discipline in the child document's §12.

Programme B is sequenced to open on hydraulics — failure modes invisible to
vision — before it makes any claim about models. That ordering is what buys the
right to make the later claims.

### Programme C — Digital thread and standards *(needs research, no new data)*

**C1. `A survey of part-identity standards in fluid power: ISO 8434, SAE J514, DIN 2353, and the gaps between them`**
**C2. `Why ECLASS and UNSPSC do not solve part substitution`**
**C3. `Asset Administration Shell for a hydraulic fitting: a worked example`** —
Industry 4.0 audience, directly adjacent, real citation potential from the
German industrial-data community.

### Programme D — Supply chain under autonomy *(blocked, needs data)*

Requires `supplier_offers` and `enquiries` to have real volume. Revisit when
they do. Listed so it is not forgotten, not scheduled.

---

## 5. Publishing architecture

### 5.1 What already works

The block system covers most of this. `comparison_table` rendering real HTML
table markup rather than an image is the single most valuable existing decision
for citability — answer engines cannot cite a JPEG, and most competitor spec
charts are trapped in PDFs. `standard_citation`, `direct_answer`,
`key_takeaways`, `as_of_stamp`, `figure` (with `captionPrefix` for "FIG. 01")
and `BlogToc` all carry over unchanged.

### 5.2 What needs building

One batched PR, not five. Per the deployment-cost rule, these land together.

| Need | Why | Where |
|---|---|---|
| `Dataset` JSON-LD builder | Google Dataset Search is a real discovery channel for citable data and we emit no `Dataset` type today | `packages/domain/src/seo/jsonld.ts` |
| `ScholarlyArticle` variant of `buildArticleLd` | Signals research content; supports `citation`, `about`, `isBasedOn` | same |
| `references` block | `standard_citation` cites standards, not literature. A numbered reference list with DOIs is the visual and structural marker of a citable paper | `packages/domain/src/blog-blocks.ts` |
| `dataset_release` block | Renders DOI, licence, format, download and citation-snippet box. The "how to cite this" box is what converts a reader into a citation | same |
| `abstract` block | Structured abstract, distinct from `key_takeaways`, extractable | same |
| Long-form template check | Every existing post is ~3 min. Verify the renderer, TOC and reading-time estimate hold at 25 minutes | `apps/web/src/components/blog/` |
| `research` blog category | 15th category, its own hub at `/blog/c/research` | CMS, no deploy |
| 2–3 credentialed `BlogAuthor` rows | `credentials` feeds `hasCredential` Person JSON-LD. One author row cannot carry a research programme | CMS, no deploy |

### 5.3 Content goes in the database

Per the working agreements: articles are authored through the admin CMS, which
revalidates and costs no deployment. Only the block schema and JSON-LD builders
above are code. The 143 existing posts already live in the database — keep it
that way.

The one exception worth considering is the dataset itself, which should live in
a public GitHub repository rather than in this repo or this database, so that
it can be forked, versioned, and cited independently of the website.

---

## 6. Distribution

Publishing is not the work. Nothing in §4 earns a link by existing.

**Deposit first, announce second.** Zenodo DOI and Hugging Face dataset card
before the article goes live, so the article can cite its own artefact and the
artefact links back.

**Seed where the audience already is:** Hacker News (A4 and A3 are the two with
front-page shape), the robotics and MLOps subreddits, Hugging Face datasets
feed, LinkedIn industrial-data and Industry 4.0 groups, the Asset
Administration Shell / IDTA community for C3.

**Direct outreach, individually written, no templates:** authors of recent
papers on robotic manipulation in industrial settings whose limitations section
mentions part identification; maintainers of open industrial-data schemas;
journalists at The Robot Report, IEEE Spectrum, Automation World; standards
committee members at ISO TC 131 and SAE.

**Answer engines:** the `direct_answer` and `comparison_table` blocks are
already the right shape. A benchmark with a numbered leaderboard is
disproportionately likely to be quoted by a model answering "how well do LLMs
read technical specifications."

**Internal linking is where the commercial lift actually happens.** Authority
arriving on A1 does nothing for `/c/hydraulic-hose-fittings-suppliers-uae`
unless there is a path. Every research article carries `category_link`,
`product_embed` and `page_link` blocks into the catalogue — the blocks exist
for exactly this. Build the path deliberately rather than hoping.

---

## 7. Measurement

Vanity metrics for this programme are traffic and impressions. Ignore both.

**Leading (weeks 1–8):** referring domains to research URLs; dataset downloads
and Hugging Face likes; GitHub stars and forks on the schema and benchmark;
citations of the DOI.

**Lagging (months 3–12):** referring domains to *commercial* pages — the whole
thesis; ranking movement on the top 20 commercial keywords; answer-engine
citation rate; RFQs attributable to a research-page entry point.

**The kill criterion, stated in advance:** if after 6 months and 6 published
research assets the programme has produced fewer than 15 referring domains
*and* no measurable movement on commercial rankings, the thesis is wrong and
the budget returns to the existing bottom-of-funnel blog, which is already
working. Write this down now, while it is cheap to be honest about.

---

## 8. Sequencing

Deliberately slow. Six pieces of real research beat sixty essays, and the whole
strategy dies if the first piece is not excellent.

| Phase | Work | Output |
|---|---|---|
| 0 | Engineering PR (§5.2). Recruit/credential authors. Create `research` category | Infrastructure |
| 1 | A1 audit + dataset deposit. **This ships first and alone** | Paper + DOI |
| 2 | A0 pillar + A4 unit problem | Hub + shareable spoke |
| 3 | A2 schema + validator | Spec + tool |
| 4 | A3 benchmark | Highest-ceiling asset |
| 5 | A5, A6 | Depth |
| 6 | Review against §7 kill criterion before funding C | Decision |

Phase 1 in isolation is the real test. If the audit paper earns nothing, phases
2–6 will not either, and that is worth learning for the cost of one article.

**Programme B runs on its own track** (see its §10) and does not wait on
Programme A. The two meet at A2 and B-cluster 6, where machine-readable part
identity is the shared dependency — the schema work should be done once and
used by both.

---

## 9. Risks

| Risk | Mitigation |
|---|---|
| Reads as vendor marketing | Self-critical audit of our own data; publish the dataset so claims are checkable; no product mention above the fold |
| Publishing our data quality invites criticism | It is the credibility mechanism, not a cost. Pair every finding with the remediation we are shipping |
| Robotics audience dismisses a distributor | Never claim robotics expertise. Claim parts expertise and address roboticists as the people who need it. Programme B opens on hydraulic failure modes before it makes any claim about models — see its §10 |
| Links land off-topic and do not lift commercial pages | Topic chosen for adjacency, not distance; internal linking built deliberately (§6); §7 measures the commercial half specifically |
| Effort displaces the blog that already works | 143 posts continue. This is additive and slow by design |
| Competitors copy the schema | Good. An adopted schema with our name on it is the outcome, not the risk |

---

## 10. Open questions for the owner

1. ~~Is there budget for a credentialed co-author, or does Programme B get cut?~~
   **Resolved 2026-09-11:** Programme B proceeds, co-authored by Ayush Bhatia
   and Krishan Bhatia. Real credentials for both are still outstanding and
   block first publication.
2. Who owns the dataset repository long-term? An abandoned dataset is worse
   than none.
3. Is the company willing to publish an honest audit of its own catalogue
   quality? Everything here depends on yes.
4. Should the spec remediation (fixing the 89.5%) ship before or alongside the
   paper? Alongside is the stronger story: *here is what broke, here is the fix,
   here is the schema.*
