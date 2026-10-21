/**
 * Every active listing on the marine and specialty metal hose shelves this wave links, as of 2026-10-21 (sku, slug, title).
 * Generated from the live catalogue; the importer validates each SKU and the articles build their
 * "what we list" sections from these arrays so no listing is left unlinked.
 */
export type Listing = { sku: string; slug: string; title: string }

export const SHELVES = {
  'marine-hoses': [
    { sku: 'IH-MH-FUEL-365', slug: 'barrier-lined-marine-fuel-hose-type-a1-15', title: 'Barrier-Lined Marine Fuel Hose, Type A1-15' },
    { sku: 'IH-MH-BLG-149', slug: 'black-pvc-bilge-and-live-well-hose-hard-pvc-helix', title: 'Black PVC Bilge & Live-Well Hose, Hard PVC Helix' },
    { sku: 'IH-MH-BLG-163', slug: 'clear-pvc-hose-with-steel-wire-helix-fda', title: 'Clear PVC Hose with Steel Wire Helix, FDA' },
    { sku: 'IH-MH-BLG-150', slug: 'clear-pvc-potable-water-tubing-fda', title: 'Clear PVC Water, Drain & Vent Tubing, FDA' },
    { sku: 'IH-MH-BLG-144', slug: 'clear-vinyl-bilge-and-live-well-hose-pvc-helix', title: 'Clear Vinyl Bilge & Live-Well Hose, PVC Helix' },
    { sku: 'IH-MH-FUEL-329', slug: 'corrugated-marine-fuel-fill-hose-type-a2-steel-helix', title: 'Corrugated Marine Fuel Fill Hose, Type A2, Steel Helix' },
    { sku: 'IH-MH-EXHT-252', slug: 'corrugated-marine-wet-exhaust-hose-hard-wall', title: 'Corrugated Marine Wet Exhaust Hose, Hard Wall' },
    { sku: 'IH-MH-BLG-120', slug: 'corrugated-polyethylene-bilge-hose-black-or-white', title: 'Corrugated Polyethylene Bilge Hose, Black or White' },
    { sku: 'IH-MH-EXHT-130', slug: 'epdm-heater-hose-2-ply-polyester', title: 'EPDM Heater Hose, 2-Ply Polyester' },
    { sku: 'IH-MH-BLG-147', slug: 'extra-heavy-duty-clear-bilge-and-live-well-hose', title: 'Extra-Heavy-Duty Clear Bilge & Live-Well Hose' },
    { sku: 'IH-MH-EXHT-134', slug: 'high-temperature-epdm-water-and-air-hose-4-ply', title: 'High-Temperature EPDM Water & Air Hose, 4-Ply' },
    { sku: 'IH-MH-FUEL-305', slug: 'low-permeation-outboard-fuel-hose-type-b1-15', title: 'Low-Permeation Outboard Fuel Hose, Type B1-15' },
    { sku: 'IH-MH-FUEL-327', slug: 'marine-fuel-fill-and-diesel-transfer-hose-type-a2', title: 'Marine Fuel Fill & Diesel Transfer Hose, Type A2' },
    { sku: 'IH-MH-FUEL-328', slug: 'marine-fuel-fill-hose-type-a2-cut-lengths-with-t-bolt-clamps', title: 'Marine Fuel Fill Hose, Type A2, Cut Lengths with T-Bolt Clamps' },
    { sku: 'IH-MH-FUEL-319', slug: 'marine-fuel-hose-type-a1-15-nylon-barrier', title: 'Marine Fuel Hose, Type A1-15, Nylon Barrier' },
    { sku: 'IH-MH-FUEL-317', slug: 'marine-fuel-vent-hose-type-a2-5-8', title: 'Marine Fuel Vent Hose, Type A2, 5/8"' },
    { sku: 'IH-MH-EXHT-250', slug: 'marine-wet-exhaust-and-water-hose-hard-wall-with-steel-helix-sae-j2006-r2', title: 'Marine Wet Exhaust & Water Hose, Hard Wall with Steel Helix (SAE J2006 R2)' },
    { sku: 'IH-MH-EXHT-200', slug: 'marine-wet-exhaust-and-water-hose-soft-wall-sae-j2006-r1', title: 'Marine Wet Exhaust & Water Hose, Soft Wall (SAE J2006 R1)' },
    { sku: 'IH-MH-EXHT-202V', slug: 'silicone-marine-wet-exhaust-and-water-hose-blue', title: 'Silicone Marine Wet Exhaust & Water Hose, Blue' },
    { sku: 'IH-MH-BLG-146', slug: 'white-corrugated-water-fill-hose-fda-vinyl', title: 'White Corrugated Water-Fill Hose, FDA Vinyl' },
  ],
  'metallic-fire-protection-hoses': [
    { sku: 'IH-MH-SENIOR-FLEX-BARTLETT-FIRESAFE', slug: 'senior-flexonics-bartlett-fire-safe-hose-assembly', title: 'Senior Flexonics Bartlett Fire-Safe Hose Assembly' },
    { sku: 'IH-MH-THORBURN-AF-304SS', slug: 'thorburn-af-series-ball-joint-armor-flex-hose-guard-304-ss', title: 'Thorburn AF Series — Ball-Joint Armor-Flex Hose Guard, 304 SS' },
    { sku: 'IH-MH-THORBURN-AF-CS', slug: 'thorburn-af-series-ball-joint-armor-flex-hose-guard-carbon-steel', title: 'Thorburn AF Series — Ball-Joint Armor-Flex Hose Guard, Carbon Steel' },
    { sku: 'IH-MH-THORBURN-FJ72-FIRE-JACKET', slug: 'thorburn-fj72-fry-sil-fire-jacket', title: 'Thorburn FJ72 Fry-Sil Fire Jacket' },
    { sku: 'IH-MH-THORBURN-FJ73-FIRE-TAPE', slug: 'thorburn-fj73-fry-sil-fire-tape', title: 'Thorburn FJ73 Fry-Sil Fire Tape' },
    { sku: 'IH-MH-THORBURN-LS-304SS', slug: 'thorburn-ls-series-lock-section-304-stainless-steel', title: 'Thorburn LS Series — Lock Section, 304 Stainless Steel' },
    { sku: 'IH-MH-THORBURN-LS-CS', slug: 'thorburn-ls-series-lock-section-carbon-steel', title: 'Thorburn LS Series — Lock Section, Carbon Steel' },
    { sku: 'IH-MH-THORBURN-SFM-HDG', slug: 'thorburn-sfm-series-smooth-flex-hot-dip-galvanized-carbon-steel', title: 'Thorburn SFM Series — Smooth-Flex, Hot-Dip Galvanized Carbon Steel' },
    { sku: 'IH-MH-THORBURN-SFM-S4', slug: 'thorburn-sfm-series-smooth-flex-type-304-ss', title: 'Thorburn SFM Series — Smooth-Flex, Type 304 SS' },
    { sku: 'IH-MH-THORBURN-SFM-S6', slug: 'thorburn-sfm-series-smooth-flex-type-316-ss', title: 'Thorburn SFM Series — Smooth-Flex, Type 316 SS' },
  ],
  'metallic-specialty-assemblies': [
    { sku: 'IH-MH-HOSE-MASTER-CGA96-AR', slug: 'hose-master-cga96-industrial-argon-nitrogen-service-hose', title: 'Hose Master CGA96 Industrial Argon / Nitrogen Service Hose' },
    { sku: 'IH-MH-SENIOR-FLEX-CRYO-LNG', slug: 'senior-flexonics-cryogenic-lng-marine-transfer-hose', title: 'Senior Flexonics Cryogenic LNG Marine Transfer Hose' },
    { sku: 'IH-MH-SENIOR-FLEX-TSJ-CHEMICAL', slug: 'senior-flexonics-steam-jacketed-chemical-process-hose', title: 'Senior Flexonics Steam-Jacketed Chemical Process Hose' },
    { sku: 'IH-MH-THORBURN-CGA96-O2', slug: 'thorburn-cga96-industrial-oxygen-service-hose', title: 'Thorburn CGA96 Industrial Oxygen Service Hose' },
    { sku: 'IH-MH-THORBURN-CRYO-CO2-DEWAR', slug: 'thorburn-cryogenic-co-connector-dewar-transfer', title: 'Thorburn Cryogenic CO₂ Connector — Dewar Transfer' },
    { sku: 'IH-MH-THORBURN-CRYO-CO2-PROCESS', slug: 'thorburn-cryogenic-co-connector-process-plant', title: 'Thorburn Cryogenic CO₂ Connector — Process Plant' },
    { sku: 'IH-MH-THORBURN-CRYO-LIN', slug: 'thorburn-cryogenic-liquid-nitrogen-lin-transfer-hose', title: 'Thorburn Cryogenic Liquid Nitrogen (LIN) Transfer Hose' },
    { sku: 'IH-MH-THORBURN-CRYO-LOX', slug: 'thorburn-cryogenic-liquid-oxygen-lox-transfer-hose', title: 'Thorburn Cryogenic Liquid Oxygen (LOX) Transfer Hose' },
    { sku: 'IH-MH-THORBURN-CRYO-LNG-UNLOAD', slug: 'thorburn-cryogenic-lng-unloading-hose', title: 'Thorburn Cryogenic LNG Unloading Hose' },
    { sku: 'IH-MH-THORBURN-M96ZC-RAIL', slug: 'thorburn-m96zc-monel-chlorine-transfer-hose-rail-loading', title: 'Thorburn M96ZC Monel Chlorine Transfer Hose — Rail-Loading' },
    { sku: 'IH-MH-THORBURN-M96ZC-TANKER', slug: 'thorburn-m96zc-monel-chlorine-transfer-hose-tanker-truck', title: 'Thorburn M96ZC Monel Chlorine Transfer Hose — Tanker Truck' },
    { sku: 'IH-MH-THORBURN-SURETEMP-EX-2IN', slug: 'thorburn-sure-temp-hazardous-area-electrically-heated-hose-2-in-ex-rated', title: 'Thorburn Sure-Temp Electrically-Heated Hose, 2 in (FM Class I Div 2 option)' },
    { sku: 'IH-MH-THORBURN-SURETEMP-1IN', slug: 'thorburn-sure-temp-electrically-heated-metallic-hose-1-in', title: 'Thorburn Sure-Temp Electrically-Heated Metallic Hose, 1 in' },
    { sku: 'IH-MH-THORBURN-THERMACOVER-CRYO', slug: 'thorburn-thermacover-cryogenic-insulation-cover', title: 'Thorburn ThermaCover Cryogenic Insulation Cover' },
    { sku: 'IH-MH-THORBURN-THERMACOVER-STD', slug: 'thorburn-thermacover-removable-thermal-insulation-cover', title: 'Thorburn ThermaCover Removable Thermal Insulation Cover' },
    { sku: 'IH-MH-THORBURN-THORLOOP-ULOOP', slug: 'thorburn-thor-loop-series-ul-u-loop-flexible-pipe-loop', title: 'Thorburn Thor-Loop Series UL "U-Loop" Flexible Pipe Loop' },
    { sku: 'IH-MH-THORBURN-THORLOOP-VLOOP', slug: 'thorburn-thor-loop-series-vl-v-loop-flexible-pipe-loop', title: 'Thorburn Thor-Loop Series VL "V-Loop" Flexible Pipe Loop' },
    { sku: 'IH-MH-THORBURN-TSJ-2IN-ASPHALT', slug: 'thorburn-tsj-steam-jacketed-hose-2-in-asphalt-pitch-service', title: 'Thorburn TSJ Steam-Jacketed Hose, 2 in — Asphalt / Pitch Service' },
    { sku: 'IH-MH-THORBURN-TSJ-3IN-MOLTEN', slug: 'thorburn-tsj-steam-jacketed-hose-3-in-molten-service', title: 'Thorburn TSJ Steam-Jacketed Hose, 3 in — Molten Service' },
    { sku: 'IH-MH-WITZENMANN-CRYO-LAR', slug: 'witzenmann-cryogenic-liquid-argon-lar-transfer-hose', title: 'Witzenmann Cryogenic Liquid Argon (LAR) Transfer Hose' },
  ],
} satisfies Record<string, Listing[]>

export type Shelf = keyof typeof SHELVES

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** An HTML list linking every listing on the given shelves, optionally filtered by title. */
export function stockList(shelves: Shelf[], filter?: (l: Listing) => boolean): string {
  const items = shelves.flatMap((s) => SHELVES[s] as Listing[]).filter((l) => (filter ? filter(l) : true))
  return `<ul>${items.map((l) => `<li><a href="/p/${l.slug}">${esc(l.title)}</a></li>`).join('')}</ul>`
}
