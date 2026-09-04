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

  // Batch 3, commissioned 2026-09-01 — the diagnostic macros, the field and
  // counter scenes, and the two bench comparisons.
  'buying-fittings-in-south-africa': '42fa9284-4eff-4c91-bbe7-c8fbbc52bd72',
  'crimping-on-site-or-adapting': '2d40295e-e29f-436b-9c6c-4d09b78b88e2',
  'damaged-port-repair-or-scrap': '0aed40dd-6f5f-4dde-bf99-e940bbca81fb',
  'fittings-on-a-used-japanese-machine': '55f54795-f861-4745-ba87-cf2bfeaf9924',
  'galvanic-corrosion-in-fittings': 'b5c9419a-2883-4b45-bad4-d9e3a2734b17',
  'inspecting-fittings-on-arrival': '1d99b483-f94f-4abe-b4d6-9e920336e54e',
  'measuring-a-fitting-without-gauges': '49cd8049-8538-47eb-a27b-7884f199b81e',
  'over-tightened-fitting-diagnosis': '8be154df-f2ab-42b8-bc6d-ee97583e111e',
  'reusing-fittings-in-a-rebuild': 'b4882b6b-9ccc-41c8-96bb-b102119d1a5b',
  'sealant-on-hydraulic-threads': '740a25fc-51a9-4297-8aec-cd383fa901c5',

  // Batch 4, commissioned 2026-09-04 — the GCC compliance cluster. A different
  // visual problem from the machinery batches: the text ban means a document
  // has to read as a document by its sleeve, stack and handling, never by
  // anything written on it, so most of these argue through objects instead.
  'certificate-of-origin-gcc-duty': '0ef0ea32-3166-41e0-a4d9-8b261a7e2aef',
  'gcc-import-documents-for-hose': '56f32b8f-f251-4ca0-b466-b2fbb078c89b',
  'gulf-conformity-mark-hose-fittings': '7bfbdc00-cae6-40c6-a7db-086894c7e261',
  'hose-assembly-test-certificate': '3d6ced8e-85c6-410b-bbe5-ec9cf0392fd4',
  'material-test-certificate-en-10204': '5153afce-b2bb-434a-88f3-026258c2e66d',
  'nace-mr0175-hose-documentation': '36915499-5b40-4d80-ab81-880b750ae0dd',
  'oilfield-hose-document-pack': '3748641d-0af4-49bb-88f0-82f641f3696f',
  'saber-certificate-for-hydraulic-hose': 'f86fb3b9-c776-41a9-b0dc-21589f7ef544',
  'vendor-approval-for-hose-supply': '6a778da9-bb44-4847-86ca-93736e58621c',
  'verifying-a-genuine-hydraulic-hose': '63b41d2a-fea8-4d39-9412-0edcbc000427',
}
