/**
 * Round 2, 2026-11-20: sentences that link the Marine and Hoses & Fittings
 * roots, and one correction.
 *
 * Round 1 (./plans.ts) only linked phrases articles already used, and no
 * marine or hydraulic article says "marine equipment" or "hydraulic hoses and
 * fittings" — so those two roots got 0 and 2 links. Each sentence here is
 * appended to the paragraph named by `after`, states only what the catalogue
 * holds, and names no figure.
 *
 * `replace` fixes a sentence that had gone stale: precast-panel-and-beam-rigging
 * said "we do not stock spreader beams", untrue since the spreader beam,
 * lifting beam and frame listings went live on 2026-11-16.
 */
import type { InlinePlan } from '../2026-10-06-blog-inline-links/plans'

export type Replacement = { find: string; html: string }
export type Round2Plan = InlinePlan & { replace?: Replacement[] }

const MARINE = '/c/marine-equipment-uae'
const HOSE_ROOT = '/c/hydraulic-hose-fittings-suppliers-uae'

export const ROUND2_PLANS: Record<string, Round2Plan> = {
  // ── Marine root ──────────────────────────────────────────────────────────
  'types-of-marine-anchors': {
    add: [
      {
        after: 'For a ship anchor, give the type, the mass',
        html: ` Ship and offshore anchors are listed with the chain, shackles and swivels that go with them in our <a href="${MARINE}">anchoring and mooring equipment</a> range.`,
      },
    ],
  },
  'anchor-chain-size-chart': {
    add: [
      {
        after: 'For a ship, the chart is the last step, not the first',
        html: ` The chain, its accessories and the anchors it serves are all in our <a href="${MARINE}">marine equipment</a> range.`,
      },
    ],
  },
  'offshore-mooring-components': {
    add: [
      {
        after: 'Listings: H-link, H-connector',
        html: ` These connectors sit with offshore mooring chain and anchors in our <a href="${MARINE}">anchor chain and mooring equipment</a> range.`,
      },
    ],
  },
  'types-of-mooring-bollards': {
    add: [
      {
        after: "Shipboard fittings follow the vessel's mooring arrangement",
        html: ` Bollards, cleats, fairleads, fenders, buoys, anchors and chain are all under <a href="${MARINE}">marine equipment</a>.`,
      },
    ],
  },
  'anchor-chain-marking-and-certificates': {
    add: [
      {
        after: 'The chain mills we work with hold factory approvals',
        html: ` Certified chain, accessories and anchors are in our <a href="${MARINE}">marine equipment</a> range, quoted from Dubai.`,
      },
    ],
  },
  // ── Hoses & Fittings root ────────────────────────────────────────────────
  'hydraulic-fittings-guide': {
    add: [
      {
        after: 'A fitting order that names the family',
        html: ` Every family on this page — JIC, ORFS, BSP, metric, NPT/NPSM and SAE flange — is listed in our <a href="${HOSE_ROOT}">hydraulic hoses and fittings</a> range.`,
      },
    ],
  },
  'hydraulic-hose-shelf-life-storage': {
    add: [
      {
        after: 'Where the machine cannot wait, hold the assembly',
        html: ` Bulk hose and the fittings to match are both in our <a href="${HOSE_ROOT}">hydraulic hose and fittings</a> range.`,
      },
    ],
  },
  'npt-npsm-and-sae-hose-fittings': {
    add: [
      {
        after: 'For corrosive and washdown duty, our 316L range',
        html: ` Carbon steel hose fittings, the hose itself and the adapters to other thread families are in our <a href="${HOSE_ROOT}">hydraulic hose fittings</a> range.`,
      },
    ],
  },
  'refuse-truck-hydraulic-hose': {
    add: [
      {
        after: 'Which is the argument for planned replacement',
        html: ` The hose and fittings for a set like that are in our <a href="${HOSE_ROOT}">hydraulic hoses and fittings</a> range.`,
      },
    ],
  },
  'buying-fittings-in-south-africa': {
    add: [
      {
        after: 'Domestic supply does not change what is on the machines',
        html: ` That one consolidated list — hose, fittings, adapters and couplers — is what our <a href="${HOSE_ROOT}">hydraulic hoses and fittings</a> range is built to answer.`,
      },
    ],
  },
  // ── Correction ───────────────────────────────────────────────────────────
  'precast-panel-and-beam-rigging': {
    replace: [
      {
        find: 'we do not stock spreader beams, but supply the slings, shackles and links that go with them.',
        html: 'we supply <a href="/c/spreader-beams">spreader beams</a> and <a href="/c/lifting-beams">lifting beams</a>, and the slings, shackles and links that go with them.',
      },
    ],
  },
}
