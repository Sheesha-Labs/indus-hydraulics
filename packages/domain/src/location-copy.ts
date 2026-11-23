import type { ServiceArea } from './service-areas'

/**
 * Built-in copy for the service-area template — what a `/locations/<slug>`
 * band renders before anyone has written that band in Pages & Blocks.
 *
 * Kept here, not in the component, so `service-areas.test.ts` can hold it to
 * the same two rules as the area records: no premises outside Dubai, and no
 * response or arrival time anywhere.
 */

export type LocationCard = { name: string; desc: string; cta?: string; href?: string }

/** Built-in "three ways to get an assembly made", worded for this area. */
export function locationBuiltInOptions(area: ServiceArea): LocationCard[] {
  if (area.slug === 'dubai') {
    return [
      {
        name: 'Bring it to the hose bay',
        desc: 'Drop the failed assembly at the Al Qusais hose bay. We match the hose and both fittings, build the replacement to the crimp specification and hand it back to you.',
      },
      {
        name: 'We build it at the machine',
        desc: 'When the machine cannot move, the assembly is made on site from stock on the van. The bore, the hose construction and both fitting types decide whether that works first time.',
      },
      {
        name: 'Built in the bay, delivered',
        desc: 'Long lengths, unusual fittings and assemblies that need paperwork are built in the bay and delivered to site for fitting.',
      },
    ]
  }
  return [
    {
      name: 'We build it at the machine',
      desc: `In ${area.name} the assembly is usually made on site, at the machine, from stock on the van. Knowing the bore, the hose construction and both fitting types before we set off is what makes it a single visit.`,
    },
    {
      name: 'Built in Dubai, delivered and fitted',
      desc: 'Long lengths, special fittings and assemblies that need paperwork are built in the Al Qusais hose bay and brought to site to fit.',
    },
    {
      name: 'Send the old assembly to the bay',
      desc: 'If the failed assembly can travel and the machine can wait, sending it to Dubai gets an exact match built from the original.',
    },
  ]
}

/** Services every area gets, plus the certified oilfield work where it applies. */
export function locationBuiltInServices(area: ServiceArea): LocationCard[] {
  const rows: LocationCard[] = [
    {
      name: 'Hose assembly at the machine',
      desc: 'Cut, skived where the hose needs it, crimped and fitted on site — with the routing and clamping checked so the new assembly does not fail where the old one did.',
      cta: 'How on-site service works',
      href: '/blog/on-site-hydraulic-hose-service-uae',
    },
    {
      name: 'Replacement assemblies made to order',
      desc: 'Built in the Dubai bay from a sample, a part number or a measured length, for when the machine can wait or the assembly needs more than the van carries.',
      cta: 'Hydraulic hose assemblies',
      href: '/c/hydraulic-hose-assemblies',
    },
    {
      name: 'Whole-machine refit and tagging',
      desc: 'Every hose on a machine replaced in one planned stop and tagged, so the next failure is a part number rather than a measurement.',
      cta: 'Bulk refit and tagging',
      href: '/blog/bulk-hose-refit-and-tagging',
    },
  ]
  if (area.industries.includes('oil-gas') && area.slug === 'habshan') {
    rows.push({
      name: 'Certified oilfield hose assemblies',
      desc: 'Rotary, vibrator, cementing and choke-and-kill assemblies to API 7K, 16C and 16D, pre-staged ahead of planned work because the permit, not the hose, sets the timeline here.',
      cta: 'Oil and gas hoses',
      href: '/c/oil-gas-hoses',
    })
  }
  return rows
}

export const LOCATION_BUILT_IN_PREPARE: readonly string[] = [
  'The bore, and the hose grade if the layline is still legible',
  'Both fitting types, and the angle between them',
  'The overall length, end to end',
  'Whether the site needs a permit, a gate pass or an induction',
]
