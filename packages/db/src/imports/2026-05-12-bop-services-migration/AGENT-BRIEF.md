# Agent brief — write ONE service-offering page (BOP migration wave)

You are writing **ONE** TypeScript file for the Indus Hydraulics `/services`
section. This batch migrates the old BOP service products (which are being
decommissioned) into proper `ServiceCase` rows.

These are **service-offering pages**, not jobs. Voice: "what we offer + how
we deliver", not "what we did on day 7 of bay 4". Same template + same 7
sections — but adapted content, slightly shorter than the launch case
studies (~1,200-1,500 words across the body, vs ~2,000 for launch cases).

## Output

Save the file at the path given in your dispatch prompt. Template:

```ts
/**
 * Case NN — <Title>
 * 2026-05-12 (BOP services migration wave)
 *
 * <2-3 sentence description>
 */
import {
  type ServiceCaseSeed,
  COMMON_CTA_PHONE,
  COMMON_CTA_TITLE,
  COMMON_CTA_BODY,
  approachGrid,
  figure,
  lead,
  para,
  problemSolution,
  pullQuote,
  resultBox,
  sectionHead,
  sopBlock,
  specTable,
  teamList,
} from '../../2026-05-11-service-cases-launch/shared'

const CASE: ServiceCaseSeed = { ...all fields... }
export default CASE
```

Note the import path: `../../2026-05-11-service-cases-launch/shared` — we
reuse the existing shared helpers from PR #130. Do NOT duplicate them.

## Required reading

1. `/Users/ayushkbhatia/indus-hydraulics-code/indus-hydraulics-bop-decom/packages/db/src/imports/2026-05-11-service-cases-launch/shared.ts` — the `ServiceCaseSeed` type + helper signatures
2. `/Users/ayushkbhatia/indus-hydraulics-code/indus-hydraulics-bop-decom/packages/db/src/imports/2026-05-11-service-cases-launch/AGENT-BRIEF.md` — full structure spec (read the "Body sequence", "Meta strip", "UAE-only context", "Voice & substance" sections)
3. (Optional, voice reference) `/Users/ayushkbhatia/indus-hydraulics-code/indus-hydraulics-bop-decom/packages/db/src/imports/2026-05-11-service-cases-launch/cases/case-03-bop-13-58-10k-cameron-u-recert.ts` — gold-standard BOP recert case study; mirror its structural conventions but adapt to your service-offering scope

## What's different vs the launch cases

| Aspect | Launch cases (1-10) | THIS batch (service offerings, 11-20) |
|---|---|---|
| Voice | "What we did on a specific job" | "What we offer / how a typical engagement runs" |
| Word count | ~2,000 across body | ~1,200-1,500 across body |
| `/01 problem` | A specific operator's specific problem | The class of problem operators come to us with |
| `/02 solution` | What we did, with timeline | The standard scope we deliver, with deliverables |
| `/03 approach` | 4 phases of THIS job | 4 phases of EVERY engagement of this type |
| `/04 SOP` | Real SOP that ran on this job (32/32 rows) | Real SOP — the standard procedure we follow on every engagement (15-20 rows is fine, less than launch) |
| `/05 findings` | Before/after spec table for THIS asset | "Typical findings" table — what we usually find on an asset of this class (8-10 rows, mark 3 critical) |
| `/06 outcome` | Specific outcome of THIS job | What you can expect from a typical engagement |
| `/07 team` | Named team that ran this job | Capabilities + role profile of the crew that runs this work |
| `caseDateLabel` | "MAR 2026 · BAY 2 / ON-SITE" | "ROLLING SCHEDULE · JEBEL ALI" or "DAY-RATE · GCC-WIDE" or similar |
| `metaCells` accent | TAT (e.g. "19 days") | Often the recurrence cycle, or pressure class, or coverage |
| `savingsAmount` | Sometimes (specific job savings) | Almost always omit — service-offerings don't have a specific savings number |

The 7-section structure is preserved so the template renders consistently.

## Per-case parameters (provided in your dispatch)

- `slug`
- `caseNumber` (use 11-20)
- `category` (most are `bop_pressure_control`; some `field_service` or `ct_wireline`)
- `topicLabel`
- `cardTagLabel` (mono caps)
- `cardTagStyle` (`'oil'` for BOP/oilfield work, `'standard'` otherwise)
- `cardDurationLabel` (e.g. "ROLLING" / "DAY-RATE" / "5-WEEK CYCLE" / "PER-WELL")
- The scope to write about (1-2 paragraphs of context)

## UAE-only context (NON-NEGOTIABLE — same as launch cases)

ADNOC / ADNOC Drilling / ADNOC Offshore (Lower Zakum, Hail & Ghasha), Saudi
Aramco (Ghawar, Khurais, Khuff, Jafurah), KOC, PDO (Khazzan, Yibal), QatarEnergy.
All workshops at Jebel Ali / JAFZA. NACE MR0175 / ISO 15156 sour-service
default. HNBR / FKM / AFLAS elastomers. B7M / L7M bolting. 316 SS fittings.
API standards namedrop: 16A / 16C / 16D / 6A / STD 53 / 7K / 17D / 20E.
Engineer placeholder bylines (any combination of):
- Khalid Al Marzouqi · Field Lead · Jebel Ali
- Yusuf Al Hashimi · Workshop Manager · Jebel Ali
- Aisha Al Suwaidi · QA Lead · Jebel Ali
- Omar Al Maktoum · Lead Technician · Jebel Ali
- Hassan Al Awadi · Field Crew Supervisor · Jebel Ali
- Fatima Al Mansoori · Engineering Authority · Jebel Ali

NO references to Mumbai, Pune, Houston, India.

## Output checklist

- [ ] File compiles: imports from `../../2026-05-11-service-cases-launch/shared`
- [ ] All 7 body sections present in order with the right anchor strings (`problem`, `solution`, `approach`, `sop`, `technicals`, `outcome`, `team`)
- [ ] `metaCells` has exactly 5 cells
- [ ] `bodyBlocks` includes at least one `figure` and one `pullQuote`
- [ ] `sopBlock` has 3-4 phases × 4-5 rows (~15-20 total — shorter than launch)
- [ ] `specTable` ("typical findings" style) has 8-10 rows with 3 highlighted
- [ ] `resultBox` has 4 cells with first styled `'accent'`
- [ ] `teamList` describes the role profile (4-6 placeholder names + scope)
- [ ] All card display fields set (`cardOneLiner`, 3 outcome pills, `cardDurationLabel`)
- [ ] All UAE-only — no Mumbai/Pune/Houston references anywhere
- [ ] `slug` matches the dispatch
- [ ] `isFeatured: false` (none of these are featured)
- [ ] **Apostrophes inside single-quoted strings**: use `\'` (escaped) or switch to double quotes. Do NOT use SQL-style `''`. This is the most common compile failure — escape carefully.
- [ ] **`asFoundStyle`** in `specTable` rows must be `'bad' | 'num' | 'plain'` (NOT `'good'`). For "good news" rows where the as-found is also good, use `'num'`. Only the `afterStyle` slot accepts `'good'`.

When done, save the file and stop. The orchestrator handles validate + import.
