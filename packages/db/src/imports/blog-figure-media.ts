/**
 * Commissioned photographs attached to reserved figure slots, by article slug.
 *
 * WHY THIS FILE EXISTS
 *
 * `BLOG_FIGURES` supports two kinds of slot. One borrows another article's hero
 * (`from`), which resolves at import time from the live posts. The other is a
 * reserved slot with no `from`, written with a null id and rendering as nothing
 * until a photograph exists for it.
 *
 * When a photograph IS commissioned for a reserved slot, its Media id has to
 * live somewhere the importer can see, or the next re-run of that wave writes
 * the null back and the picture silently disappears from the article. That is
 * this file: slug → Media id, written by
 * `scripts/attach-blog-figure-images.ts` and read by `withFigures`.
 *
 * The ids are opaque uuids rather than storage paths on purpose.
 * `collectMediaIdsFromBlocks` indexes ids, and that index is what stops the
 * media library offering to trash a photograph an article is using. A storage
 * URL here would render identically and leave every one of these pictures
 * looking unused.
 */
export const BLOG_FIGURE_MEDIA: Record<string, string> = {
  // Batch 1, commissioned 2026-09-01 — five sectors, five treatments.
  'copper-mine-hydraulic-fittings': '3cc5da64-a6d8-4780-a68d-8b20d5dc712e',
  'fittings-on-a-chinese-excavator': 'a6b3ef27-1631-4abc-bfe7-c53fa0347a6b',
  'oilfield-fittings-in-west-africa': '60b7ea75-3cab-4519-b59b-8989a5a2ccdb',
  'port-and-terminal-fittings': 'c93f2346-0236-4cdd-897e-36e8dc1a176a',
  'water-well-drilling-rig-fittings': 'ee86adab-4b75-4200-982b-53fc774b6bbd',

  // Batch 2, commissioned 2026-09-01 — failure diagnosis, agriculture,
  // quarrying, processing, storage and the coastal macro.
  'agriculture-and-construction-fittings': '78fa68f0-caee-4c28-a9da-8122d84f1c89',
  'building-a-thread-reference-board': 'e901c065-79f1-4446-b2cb-e025b46fb1bb',
  'dirt-ingress-in-transit-and-storage': '56e3ae9e-4a4f-43e6-af94-f5718586a413',
  'gold-plant-hydraulic-fittings': 'fe270b01-aa22-415b-82c5-ccb56ce1867c',
  'quarry-and-crusher-fittings': '7f0c180e-3c54-451f-aae1-db2b9605ba9d',
  'reading-a-weeping-joint': '2afd002b-8f9e-436e-bd66-ddab7b14b028',
  'storing-fittings-and-seals-on-site': 'cc5b6030-fcbe-484c-a9e5-a186bda0f1c0',
  'sugar-mill-and-agro-processing-fittings': '364dacdf-21d7-4819-9fc0-6b93fde4c4d2',
  'tractor-hydraulic-fittings': '8f052e24-a644-4b9b-a04d-5d9ede1bc0f0',
  'why-fittings-seize-in-coastal-air': 'cbe225e0-4de0-414e-b73e-d1683b6b1870',
}
