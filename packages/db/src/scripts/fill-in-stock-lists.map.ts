/**
 * Which published blog post lists which catalogue shelves, for fill-in-stock-lists.ts.
 *
 * Each entry names one host post — the article written about that product type — and the category shelves whose
 * every active listing it should link. Chosen 2026-10-21 from a linkage audit: these shelves had posts about them
 * that linked only a handful of their products, or none.
 *
 * Add a row when a new shelf gets a host post; the script rebuilds every list from the live catalogue, so new
 * listings on a mapped shelf are picked up on the next run.
 */
export type FillIn = { post: string; shelves: string[] }

export const FILL_INS: FillIn[] = [
  // Lifting & rigging
  { post: 'snatch-block-vs-pulley-block', shelves: ['snatch-blocks-pulleys'] },
  { post: 'lifting-hook-types', shelves: ['lifting-hooks'] },
  { post: 'types-of-lifting-slings', shelves: ['chain-slings', 'synthetic-slings', 'wire-rope-slings'] },
  { post: 'snap-hooks-and-quick-links', shelves: ['snap-hooks-quick-links'] },
  { post: 'hammerlock-vs-clevis-chain-fittings', shelves: ['grade-80-chain-fittings', 'grade-100-chain-fittings', 'forestry-logging-hardware'] },
  { post: 'eye-bolt-types-and-angled-loads', shelves: ['eye-bolts-eye-nuts'] },
  { post: 'master-links-explained', shelves: ['master-links-rings-swivels'] },
  { post: 'types-of-shackles', shelves: ['shackles'] },
  { post: 'types-of-mooring-bollards', shelves: ['bollards-mooring'] },
  { post: 'pad-eye-vs-swivel-lifting-point', shelves: ['lifting-points-pad-eyes'] },
  { post: 'wire-rope-thimble-types', shelves: ['wire-rope-thimbles'] },
  { post: 'chain-grades-explained', shelves: ['commercial-transport-chain', 'din-link-chain', 'mining-conveyor-chain'] },
  { post: 'wire-rope-clips-installation', shelves: ['wire-rope-clips'] },
  { post: 'spelter-sockets-open-vs-closed', shelves: ['wire-rope-sockets-terminals'] },
  { post: 'lever-vs-ratchet-load-binder', shelves: ['load-binders', 'ratchet-straps-tie-downs'] },
  { post: 'wire-rope-eye-terminations', shelves: ['wire-rope-ferrules-sleeves'] },
  { post: 'chain-block-vs-lever-hoist-vs-electric-hoist', shelves: ['chain-blocks-manual-hoists', 'electric-hoists'] },
  { post: 'wire-rope-construction-explained', shelves: ['steel-wire-rope'] },
  { post: 'stainless-steel-lifting-chain', shelves: ['stainless-steel-chain'] },
  { post: 'types-of-marine-fenders', shelves: ['marine-fenders'] },
  { post: 'types-of-marine-anchors', shelves: ['marine-anchors', 'anchor-chain-accessories'] },
  { post: 'fibre-rope-materials-compared', shelves: ['fibre-rope-twine'] },
  { post: 'how-to-choose-and-tension-a-turnbuckle', shelves: ['turnbuckles-rigging-screws'] },
  { post: 'vertical-vs-horizontal-plate-lifting-clamps', shelves: ['lifting-beam-clamps'] },
  { post: 'hydraulic-winch-sizing', shelves: ['hydraulic-winches', 'winches'] },
  { post: 'crane-winch-load-monitoring', shelves: ['gearbox-winch-accessories'] },

  // Hydraulic and industrial hose couplings
  { post: 'hydraulic-quick-couplers-iso-7241', shelves: ['quick-couplers'] },
  { post: 'industrial-hose-couplings-guide', shelves: ['storz-couplings'] },
  { post: 'cam-and-groove-coupling-types', shelves: ['cam-and-groove-couplings', 'specialty-adapters-couplings'] },
  { post: 'bauer-couplings-explained', shelves: ['bauer-type-couplings', 'ring-lock-couplings'] },
  { post: 'dry-disconnect-vs-camlock-couplings', shelves: ['dry-disconnect-couplings'] },
  { post: 'industrial-hose-clamps', shelves: ['hose-clamps-sleeves-ferrules', 'hose-menders'] },
  { post: 'universal-air-couplings-explained', shelves: ['universal-air-couplings', 'crowfoot-couplings', 'industrial-interchange-fittings'] },
  { post: 'kc-nipples-and-shank-couplings', shelves: ['kc-nipple-fittings', 'shank-couplings', 'pin-lug-shank-couplings'] },
  { post: 'en-14420-hose-fittings-explained', shelves: ['en14420-5-fittings'] },
  { post: 'guillemin-couplings-explained', shelves: ['guillemin-couplings'] },
  { post: 'gost-barcelona-and-geka-couplings', shelves: ['barcelona-geka-couplings'] },
  { post: 'ground-joint-steam-couplings', shelves: ['ground-joint-couplings'] },
  { post: 'bulk-material-and-sandblast-hose', shelves: ['sandblast-couplings'] },
  { post: 'flanged-hose-connections', shelves: ['industrial-flanges'] },
  // Added 2026-10-21 (blog linkage wave 4): hose accessory shelves with a host article.
  { post: 'contamination-during-a-hose-change', shelves: ['dust-caps-plugs'] },
  { post: 'tanker-loading-and-vapour-recovery-hose', shelves: ['hose-swivel-joints'] },
  { post: 'compressed-air-hose-selection', shelves: ['air-water-hoses'] },

  // Industrial, metal and oilfield hose
  { post: 'exotic-alloy-metal-hose', shelves: ['metallic-exotic-alloy-hoses'] },
  { post: 'corrugated-stainless-steel-hose', shelves: ['metallic-stainless-corrugated-hoses', 'metallic-hose-couplings'] },
  { post: 'high-pressure-metal-hose', shelves: ['metallic-high-pressure-hoses'] },
  { post: 'pvc-or-rubber-suction-hose', shelves: ['water-suction-delivery-hoses'] },
  { post: 'chemical-transfer-hose-selection', shelves: ['oil-chemical-purpose-hoses'] },
  { post: 'oilfield-hose-guide', shelves: ['low-pressure-oilfield-hoses'] },
  { post: 'api-7k-rotary-vibrator-hose', shelves: ['drilling-hoses'] },

  // Flow iron, wellhead and oilfield valves
  { post: 'ring-joint-gaskets-r-rx-bx', shelves: ['ring-joint-gaskets', 'flow-iron-flanges-api'] },
  // Added 2026-10-21 (blog linkage wave 5): BOP stack shelves.
  { post: 'ram-vs-annular-bop', shelves: ['bop-ram', 'bop-annular', 'bop-ram-blocks', 'bop-spare-parts', 'bop-spools-adapters', 'bop-diverters', 'bop-control-units'] },
  { post: 'api-16c-choke-and-kill-lines', shelves: ['bop-choke-kill'] },
  { post: 'flow-iron-explained', shelves: ['flow-iron-fittings-suppliers-uae', 'flow-iron-flow-line', 'flow-iron-adapters', 'flow-iron-manifolds', 'oilfield-restraint-systems'] },
  { post: 'hammer-union-figure-numbers', shelves: ['hammer-unions-standard-service', 'hammer-unions-sour-gas-service'] },
  { post: 'wellhead-components-explained', shelves: ['wellhead', 'surface-test-trees'] },
  { post: 'api-6a-nameplate-markings', shelves: ['oilfield-gate-valves'] },
  { post: 'mud-gate-valve-repair-kits', shelves: ['gate-valve-repair-kits'] },
  { post: 'oilfield-check-valves-explained', shelves: ['oilfield-check-valves'] },
  { post: 'lubricated-vs-non-lubricated-plug-valves', shelves: ['oilfield-plug-valves'] },
  { post: 'demco-butterfly-valve-part-numbers', shelves: ['oilfield-butterfly-valves'] },
  { post: 'positive-vs-adjustable-chokes', shelves: ['oilfield-choke-valves'] },
  { post: 'ball-valve-pressure-ratings-cwp-wog', shelves: ['industrial-ball-valves', 'hydraulic-ball-valves', 'oilfield-ball-valves'] },

  // Lubricants
  { post: 'grease-selection-base-oil-thickener-nlgi', shelves: ['molykote-grease-suppliers-uae'] },
  { post: 'molykote-lubricant-types-explained', shelves: ['molykote-oils', 'molykote-compounds'] },
  { post: 'anti-seize-and-assembly-pastes', shelves: ['molykote-pastes'] },
  { post: 'anti-friction-coatings-explained', shelves: ['molykote-dispersions', 'molykote-anti-friction-coatings'] },
]
