/**
 * Every active listing on the valve shelves this wave links, as of 2026-10-21 (sku, slug, title).
 * Generated from the live catalogue; the importer validates each SKU and the articles build their
 * "what we list" sections from these arrays so no listing is left unlinked.
 */
export type Listing = { sku: string; slug: string; title: string }

export const SHELVES = {
  'butterfly-valves': [
    { sku: 'IH-VAL-BFLY-HDL-10P', slug: 'demco-10-position-locking-handle-for-butterfly-valves-2-12', title: 'DEMCO 10-Position Locking Handle for Butterfly Valves, 2″–12″' },
    { sku: 'IH-VAL-BFLY-HDL-2P', slug: 'demco-2-position-locking-handle-for-butterfly-valves-2-12', title: 'DEMCO 2-Position Locking Handle for Butterfly Valves, 2″–12″' },
    { sku: 'IH-VAL-BFLY-HDL-MEM', slug: 'demco-memory-stop-throttling-handle-for-butterfly-valves-2-12', title: 'DEMCO Memory-Stop Throttling Handle for Butterfly Valves, 2″–12″' },
    { sku: 'IH-VAL-BFLY-DR-DA', slug: 'demco-series-dr-double-acting-pneumatic-actuator-for-butterfly-valves-2-24', title: 'DEMCO Series DR Double-Acting Pneumatic Actuator for Butterfly Valves, 2″–24″' },
    { sku: 'IH-VAL-BFLY-DR-SR', slug: 'demco-series-dr-spring-return-pneumatic-actuator-for-butterfly-valves-2-24', title: 'DEMCO Series DR Spring-Return Pneumatic Actuator for Butterfly Valves, 2″–24″' },
    { sku: 'IH-VAL-BFLY-NEC', slug: 'demco-series-ne-c-general-purpose-butterfly-valve-2-12', title: 'DEMCO Series NE-C General-Purpose Butterfly Valve, 2″–12″' },
    { sku: 'IH-VAL-BFLY-NEC-L-12', slug: 'demco-series-ne-c-lug-butterfly-valve-12-inch-200-psi', title: 'DEMCO Series NE-C Lug Butterfly Valve, 12″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEC-L-16', slug: 'demco-series-ne-c-lug-butterfly-valve-16-inch-200-psi', title: 'DEMCO Series NE-C Lug Butterfly Valve, 16″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEC-L-2', slug: 'demco-series-ne-c-lug-butterfly-valve-2-inch-200-psi', title: 'DEMCO Series NE-C Lug Butterfly Valve, 2″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEC-L-3', slug: 'demco-series-ne-c-lug-butterfly-valve-3-inch-200-psi', title: 'DEMCO Series NE-C Lug Butterfly Valve, 3″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEC-L-4', slug: 'demco-series-ne-c-lug-butterfly-valve-4-inch-200-psi', title: 'DEMCO Series NE-C Lug Butterfly Valve, 4″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEC-L-5', slug: 'demco-series-ne-c-lug-butterfly-valve-5-inch-200-psi', title: 'DEMCO Series NE-C Lug Butterfly Valve, 5″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEC-L-6', slug: 'demco-series-ne-c-lug-butterfly-valve-6-inch-200-psi', title: 'DEMCO Series NE-C Lug Butterfly Valve, 6″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEC-L-8', slug: 'demco-series-ne-c-lug-butterfly-valve-8-inch-200-psi', title: 'DEMCO Series NE-C Lug Butterfly Valve, 8″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEC-W-12', slug: 'demco-series-ne-c-wafer-butterfly-valve-12-inch-200-psi', title: 'DEMCO Series NE-C Wafer Butterfly Valve, 12″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEC-W-2', slug: 'demco-series-ne-c-wafer-butterfly-valve-2-inch-200-psi', title: 'DEMCO Series NE-C Wafer Butterfly Valve, 2″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEC-W-2-5', slug: 'demco-series-ne-c-wafer-butterfly-valve-2-1-2-inch-200-psi', title: 'DEMCO Series NE-C Wafer Butterfly Valve, 2½″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEC-W-3', slug: 'demco-series-ne-c-wafer-butterfly-valve-3-inch-200-psi', title: 'DEMCO Series NE-C Wafer Butterfly Valve, 3″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEC-W-4', slug: 'demco-series-ne-c-wafer-butterfly-valve-4-inch-200-psi', title: 'DEMCO Series NE-C Wafer Butterfly Valve, 4″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEC-W-5', slug: 'demco-series-ne-c-wafer-butterfly-valve-5-inch-200-psi', title: 'DEMCO Series NE-C Wafer Butterfly Valve, 5″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEC-W-6', slug: 'demco-series-ne-c-wafer-butterfly-valve-6-inch-200-psi', title: 'DEMCO Series NE-C Wafer Butterfly Valve, 6″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEC-W-8', slug: 'demco-series-ne-c-wafer-butterfly-valve-8-inch-200-psi', title: 'DEMCO Series NE-C Wafer Butterfly Valve, 8″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NED', slug: 'demco-series-ne-d-lightweight-flange-butterfly-valve-2-12', title: 'DEMCO Series NE-D Short-Neck Notched-Body Butterfly Valve, 2″–12″' },
    { sku: 'IH-VAL-BFLY-NED-W-2', slug: 'demco-series-ne-d-wafer-butterfly-valve-2-inch-200-psi', title: 'DEMCO Series NE-D Wafer Butterfly Valve, 2″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NED-W-4', slug: 'demco-series-ne-d-wafer-butterfly-valve-4-inch-200-psi', title: 'DEMCO Series NE-D Wafer Butterfly Valve, 4″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NED-W-5', slug: 'demco-series-ne-d-wafer-butterfly-valve-5-inch-200-psi', title: 'DEMCO Series NE-D Wafer Butterfly Valve, 5″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NED-W-6', slug: 'demco-series-ne-d-wafer-butterfly-valve-6-inch-200-psi', title: 'DEMCO Series NE-D Wafer Butterfly Valve, 6″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEI-L-2-5', slug: 'demco-series-ne-i-lug-butterfly-valve-2-1-2-inch-200-psi', title: 'DEMCO Series NE-I Lug Butterfly Valve, 2½″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEI-SAN', slug: 'demco-series-ne-i-sanitary-butterfly-valve-fda-2-12', title: 'DEMCO Series NE-I Sanitary Butterfly Valve (FDA), 2″–12″' },
    { sku: 'IH-VAL-BFLY-NEI', slug: 'demco-series-ne-i-short-neck-butterfly-valve-2-12', title: 'DEMCO Series NE-I Short-Neck Butterfly Valve, 2″–12″' },
    { sku: 'IH-VAL-BFLY-NEI-W-12', slug: 'demco-series-ne-i-wafer-butterfly-valve-12-inch-200-psi', title: 'DEMCO Series NE-I Wafer Butterfly Valve, 12″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEI-W-2', slug: 'demco-series-ne-i-wafer-butterfly-valve-2-inch-200-psi', title: 'DEMCO Series NE-I Wafer Butterfly Valve, 2″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEI-W-2-5', slug: 'demco-series-ne-i-wafer-butterfly-valve-2-1-2-inch-200-psi', title: 'DEMCO Series NE-I Wafer Butterfly Valve, 2½″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEI-W-3', slug: 'demco-series-ne-i-wafer-butterfly-valve-3-inch-200-psi', title: 'DEMCO Series NE-I Wafer Butterfly Valve, 3″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEI-W-4', slug: 'demco-series-ne-i-wafer-butterfly-valve-4-inch-200-psi', title: 'DEMCO Series NE-I Wafer Butterfly Valve, 4″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEI-W-5', slug: 'demco-series-ne-i-wafer-butterfly-valve-5-inch-200-psi', title: 'DEMCO Series NE-I Wafer Butterfly Valve, 5″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEI-W-6', slug: 'demco-series-ne-i-wafer-butterfly-valve-6-inch-200-psi', title: 'DEMCO Series NE-I Wafer Butterfly Valve, 6″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEI-W-8', slug: 'demco-series-ne-i-wafer-butterfly-valve-8-inch-200-psi', title: 'DEMCO Series NE-I Wafer Butterfly Valve, 8″, 200 psi' },
    { sku: 'IH-VAL-BFLY-NEIT', slug: 'demco-series-nei-t-teflon-lined-sanitary-butterfly-valve-2-10', title: 'DEMCO Series NEI-T Teflon-Lined Sanitary Butterfly Valve, 2″–10″' },
    { sku: 'IH-VAL-BFLY-NFC', slug: 'demco-series-nf-c-large-bore-butterfly-valve-14-36', title: 'DEMCO Series NF-C Large-Bore Butterfly Valve, 14″–36″' },
    { sku: 'IH-VAL-BFLY-HDL-SQ', slug: 'demco-square-nut-handle-for-butterfly-valves-2-12', title: 'DEMCO Square-Nut Handle for Butterfly Valves, 2″–12″' },
    { sku: 'IH-VAL-BFLY-STMX', slug: 'demco-stem-extension-for-butterfly-valves-2-24', title: 'DEMCO Stem Extension for Butterfly Valves, 2″–24″' },
    { sku: 'IH-VAL-BFLY-WGO', slug: 'demco-worm-gear-operator-for-butterfly-valves-2-36', title: 'DEMCO Worm-Gear Operator for Butterfly Valves, 2″–36″' },
    { sku: 'IH-VAL-BFLY-VIC-700-3', slug: 'victaulic-series-700-grooved-butterfly-valve-3-inch-200-psi', title: 'Victaulic Series 700 Grooved Butterfly Valve, 3″ (88.9 mm), 200 psi' },
    { sku: 'IH-VAL-BFLY-VIC-761-4', slug: 'victaulic-vic-300-masterseal-series-761-butterfly-valve-4-inch-300-psi', title: 'Victaulic Vic-300 MasterSeal Series 761 Butterfly Valve, 4″ (114.3 mm), 300 psi' },
  ],
  'flow-control-valves': [
    { sku: 'IH-ANF-NV-FC', slug: 'anfield-needle-valves-and-flow-control-valves', title: 'Anfield Needle Valves and Flow Control Valves' },
    { sku: 'IH-DFC-DYFB', slug: 'dynamic-fluid-components-dyfb-spool-type-flow-dividers', title: 'Dynamic Fluid Components DYFB Spool-Type Flow Dividers' },
    { sku: 'IH-DFC-FDA', slug: 'dynamic-fluid-components-fda-rotary-gear-flow-dividers', title: 'Dynamic Fluid Components FDA Rotary Gear Flow Dividers' },
    { sku: 'IH-DFC-HPNV', slug: 'dynamic-fluid-components-hpnv-10-000-psi-needle-valves', title: 'Dynamic Fluid Components HPNV 10,000 psi Needle Valves' },
    { sku: 'IH-DFC-JP', slug: 'dynamic-fluid-components-jp-needle-and-flow-control-valves', title: 'Dynamic Fluid Components JP Needle and Flow Control Valves' },
    { sku: 'IH-DFC-PCFC', slug: 'dynamic-fluid-components-pressure-compensated-flow-controls', title: 'Dynamic Fluid Components Pressure-Compensated Flow Controls' },
    { sku: 'IH-PMC-FD', slug: 'permco-fd-flow-dividers', title: 'Permco FD Flow Dividers' },
    { sku: 'IH-PRN-FC', slug: 'prince-rd-flow-control-valves', title: 'Prince RD Flow Control Valves' },
  ],
  'directional-control-valves': [
    { sku: 'IH-BYR-RVC', slug: 'buyers-products-remote-valve-controls-and-shift-cables', title: 'Buyers Products Remote Valve Controls and Shift Cables' },
    { sku: 'IH-CRS-SPOOL', slug: 'cross-monoblock-spool-valves', title: 'Cross Monoblock Spool Valves' },
    { sku: 'IH-CRS-VPARTS', slug: 'cross-valve-detent-kits-handles-and-parts', title: 'Cross Valve Detent Kits, Handles and Parts' },
    { sku: 'IH-DFC-DSV', slug: 'dynamic-fluid-components-dsv-solenoid-selector-valves-and-coils', title: 'Dynamic Fluid Components DSV Solenoid Selector Valves and Coils' },
    { sku: 'IH-EMF-VALVES', slug: 'energy-manufacturing-control-valves-log-splitter-valves-and-parts', title: 'Energy Manufacturing Control Valves, Log Splitter Valves and Parts' },
    { sku: 'IH-HVM-VALVES', slug: 'heavy-motions-directional-control-and-relief-valves', title: 'Heavy Motions Directional Control and Relief Valves' },
    { sku: 'IH-MGH-LSV', slug: 'magister-log-splitter-control-valves', title: 'Magister Log Splitter Control Valves' },
    { sku: 'IH-PRN-DCV', slug: 'prince-control-valves-log-splitter-valves-and-parts', title: 'Prince Control Valves, Log Splitter Valves and Parts' },
  ],
  'check-relief-selector-valves': [
    { sku: 'IH-ANF-NC', slug: 'anfield-in-line-check-valves', title: 'Anfield In-Line Check Valves' },
    { sku: 'IH-CRS-RSV', slug: 'cross-relief-selector-and-sequence-valves', title: 'Cross Relief, Selector and Sequence Valves' },
    { sku: 'IH-DIX-SV', slug: 'dixon-sv-safety-pop-off-valves', title: 'Dixon SV Safety Pop-Off Valves' },
    { sku: 'IH-DFC-CHECK', slug: 'dynamic-fluid-components-hsp-and-vu-in-line-check-valves', title: 'Dynamic Fluid Components HSP and VU In-Line Check Valves' },
  ],
  'valves-manifolds': [
    { sku: 'IH-BG-03-315', slug: 'yuken-bg-pressure-relief-valve', title: 'Yuken BG-03 Pilot Operated Relief Valve, up to 24.5 MPa, 100 L/min' },
    { sku: 'IH-DSG-01-2B2-D24', slug: 'yuken-dsg-01-2b2-valve', title: 'Yuken DSG-01-2B2-D24-50 Solenoid Directional Valve, 4/2 Spring-Offset, 24 V DC' },
    { sku: 'IH-DSG-01-3C4-D24', slug: 'yuken-dsg-01-directional-valve', title: 'Yuken DSG-01-3C4-D24-50 Solenoid Directional Valve, 4/3 Spring-Centred, 24 V DC' },
    { sku: 'IH-MBR-01-30', slug: 'yuken-mbr-01-brake-modular-valve', title: 'Yuken MBR-01 Brake Modular Valve, 01 Series (CETOP 3)' },
  ],
  'oilfield-pressure-relief-valves': [
    { sku: 'IH-OFV-PRV-PILOT-3-300RF-740-SOUR-CAMERON', slug: 'pressure-relief-valve-pilot-operated-3-in-300-rf-740-psi-sour-service', title: 'Pressure Relief Valve, Pilot-Operated, 3 in × 300# RF, 740 psi, Sour Service' },
    { sku: 'IH-OFV-PRV-PILOT-3-600RF-1480-SOUR-FMC', slug: 'pressure-relief-valve-pilot-operated-3-in-600-rf-1-480-psi-sour-service', title: 'Pressure Relief Valve, Pilot-Operated, 3 in × 600# RF, 1,480 psi, Sour Service' },
    { sku: 'IH-OFV-PRV-SPRING-2-150RF-285-STD-INDUS', slug: 'pressure-relief-valve-spring-loaded-2-in-150-rf-285-psi-standard-service', title: 'Pressure Relief Valve, Spring-Loaded, 2 in × 150# RF, 285 psi, Standard Service' },
    { sku: 'IH-OFV-PRV-SPRING-2-1502MF-10K-SOUR-CAMERON', slug: 'pressure-relief-valve-spring-loaded-2-in-1502-m-f-10-000-psi-sour-service', title: 'Pressure Relief Valve, Spring-Loaded, 2 in × 1502 M×F, 10,000 psi, Sour Service' },
    { sku: 'IH-OFV-PRV-SPRING-2-1502MF-15K-SOUR-ANSON', slug: 'pressure-relief-valve-spring-loaded-2-in-1502-m-f-15-000-psi-sour-service', title: 'Pressure Relief Valve, Spring-Loaded, 2 in × 1502 M×F, 15,000 psi, Sour Service' },
    { sku: 'IH-OFV-PRV-SPRING-2-1502MF-15K-STD-SPM', slug: 'pressure-relief-valve-spring-loaded-2-in-1502-m-f-15-000-psi-standard-service', title: 'Pressure Relief Valve, Spring-Loaded, 2 in × 1502 M×F, 15,000 psi, Standard Service' },
    { sku: 'IH-OFV-PRV-SPRING-2-602MF-6K-SOUR-ANSON', slug: 'pressure-relief-valve-spring-loaded-2-in-602-m-f-6-000-psi-sour-service', title: 'Pressure Relief Valve, Spring-Loaded, 2 in × 602 M×F, 6,000 psi, Sour Service' },
    { sku: 'IH-OFV-PRV-SPRING-3-1502MF-15K-STD-WOM', slug: 'pressure-relief-valve-spring-loaded-3-in-1502-m-f-15-000-psi-standard-service', title: 'Pressure Relief Valve, Spring-Loaded, 3 in × 1502 M×F, 15,000 psi, Standard Service' },
    { sku: 'IH-OFV-PRV-SPRING-318-5M-FLG-5K-SOUR-STREAMFLO', slug: 'pressure-relief-valve-spring-loaded-3-1-8-in-5m-flanged-5-000-psi-sour-service', title: 'Pressure Relief Valve, Spring-Loaded, 3-1/8 in × 5M Flanged, 5,000 psi, Sour Service' },
  ],
  'oilfield-instrumentation-valves': [
    { sku: 'IH-OFV-INST-BLEED-12-NPT-10K-SOUR-INDUS', slug: 'bleed-valve-1-2-in-npt-10-000-psi-sour-service-316ss-body', title: 'Bleed Valve, 1/2 in NPT, 10,000 psi, Sour Service, 316SS Body' },
    { sku: 'IH-OFV-INST-DBB-NEEDLE-3HANDLE-CAMERON', slug: 'double-block-and-bleed-dbb-needle-valve-three-handle-1-2-in-npt-10-000-psi-sour-service', title: 'Double Block and Bleed (DBB) Needle Valve, Three Handle, 1/2 in NPT, 10,000 psi, Sour Service' },
    { sku: 'IH-OFV-INST-GAUGE-12-NPT-10K-CAMERON', slug: 'gauge-isolation-valve-single-block-1-2-in-npt-1-2-in-npt-10-000-psi-standard-service', title: 'Gauge Isolation Valve, Single-Block, 1/2 in NPT × 1/2 in NPT, 10,000 psi, Standard Service' },
    { sku: 'IH-OFV-INST-MONOFLANGE-12-NPT-15M-SOUR-CAMERON', slug: 'monoflange-valve-3-valve-manifold-1-2-in-npt-2-1-16-in-15m-flanged-15-000-psi-sour-service', title: 'Monoflange Valve, Double Block and Bleed, 1/2 in NPT × 2-1/16 in 15M Flanged, 15,000 psi, Sour Service' },
    { sku: 'IH-OFV-INST-NEEDLE-12-NPT-10K-SOUR-CAMERON-SS', slug: 'needle-valve-1-2-in-npt-10-000-psi-sour-service-316ss-body-50-250-f', title: 'Needle Valve, 1/2 in NPT, 10,000 psi, Sour Service, 316SS Body, -50/+250°F' },
    { sku: 'IH-OFV-INST-NEEDLE-12-NPT-10K-SOUR-CAMERON-CS', slug: 'needle-valve-1-2-in-npt-10-000-psi-sour-service-carbon-steel-body-50-250-f', title: 'Needle Valve, 1/2 in NPT, 10,000 psi, Sour Service, Carbon Steel Body, -50/+250°F' },
    { sku: 'IH-OFV-INST-NEEDLE-14-NPT-15K-SOUR-FMC', slug: 'needle-valve-1-4-in-npt-15-000-psi-sour-service-316ss-body', title: 'Needle Valve, 1/4 in NPT, 15,000 psi, Sour Service, 316SS Body' },
  ],
  'oilfield-globe-valves': [
    { sku: 'IH-OFE-GLB', slug: 'api-6a-globe-valve-3000-15000-psi', title: 'API 6A Globe Valve, 2-1/16" to 7-1/16", 3,000 to 15,000 psi' },
    { sku: 'IH-OFV-GLOBE-1-1500RF-3705-SOUR-CAMERON', slug: 'globe-valve-1-in-1500-rf-3-705-psi-sour-service', title: 'Globe Valve, 1 in × 1500# RF, 3,705 psi, Sour Service' },
    { sku: 'IH-OFV-GLOBE-2-150RF-285-STD-INDUS', slug: 'globe-valve-2-in-150-rf-285-psi-standard-service', title: 'Globe Valve, 2 in × 150# RF, 285 psi, Standard Service' },
    { sku: 'IH-OFV-GLOBE-2-300RF-740-SOUR-FMC', slug: 'globe-valve-2-in-300-rf-740-psi-sour-service', title: 'Globe Valve, 2 in × 300# RF, 740 psi, Sour Service' },
    { sku: 'IH-OFV-GLOBE-2-900RF-2220-SOUR-WOM', slug: 'globe-valve-2-in-900-rf-2-220-psi-sour-service', title: 'Globe Valve, 2 in × 900# RF, 2,220 psi, Sour Service' },
    { sku: 'IH-OFV-GLOBE-3-600RF-1480-SOUR-CAMERON', slug: 'globe-valve-3-in-600-rf-1-480-psi-sour-service', title: 'Globe Valve, 3 in × 600# RF, 1,480 psi, Sour Service' },
  ],
  'oilfield-valve-accessories': [
    { sku: 'IH-OFV-ACC-MOUNTING-KIT-API6A-FMC', slug: 'actuator-mounting-kit-for-api-6a-5m-10m-15m-valves-iso-5211-adapter', title: 'Actuator Mounting Kit for API 6A 5M / 10M / 15M Valves, ISO 5211 Adapter' },
    { sku: 'IH-OFV-ACC-GEAR-OPERATOR-3IN-WOM', slug: 'gear-operator-3-in-valve-8-1-ratio-worm-gear-manual-handwheel', title: 'Gear Operator, 3 in Valve, 8:1 Ratio Worm-Gear, Manual Handwheel' },
    { sku: 'IH-OFV-ACC-ACTUATOR-HYDRAULIC-DA-CAMERON', slug: 'hydraulic-actuator-double-acting-with-position-indicator-and-limit-switches', title: 'Hydraulic Actuator, Double-Acting, with Position Indicator and Limit Switches' },
    { sku: 'IH-OFV-ACC-LOCK-LOTO-INDUS', slug: 'lockout-tagout-loto-device-padlockable-fits-1-2-in-4-in-quarter-turn-valves', title: 'Lockout / Tagout (LOTO) Device, Padlockable, Fits 1/2 in–4 in Quarter-Turn Valves' },
    { sku: 'IH-OFV-ACC-INDICATOR-POSITION-CAMERON', slug: 'valve-position-indicator-with-4-20-ma-loop-output-and-local-led-display', title: 'Valve Position Indicator with 4-20 mA Loop Output and Local LED Display' },
  ],
  'oilfield-ssv-esd-valves': [
    { sku: 'IH-OFE-HIP', slug: 'hipps-high-integrity-pressure-protection-system', title: 'HIPPS High Integrity Pressure Protection System, SIL 3' },
    { sku: 'IH-OFE-SSV', slug: 'surface-safety-valve-hydraulic-api-6a', title: 'Surface Safety Valve (SSV), Hydraulic, API 6A, 1-13/16" to 7-1/16"' },
    { sku: 'IH-OFV-SSV-3116-15K-FE-FMC', slug: 'surface-safety-valve-hydraulic-sah-3-1-16-in-15m-flanged-each-fe-15-000-psi-api-6a-psl-3-ssv-class-ii-ee-hf', title: 'Surface Safety Valve, Hydraulic SAH, 3-1/16 in × 15M Flanged Each (FE), 15,000 psi, API 6A PSL 3 SSV, EE' },
    { sku: 'IH-OFV-SSV-2116-15K-FE-CAMERON', slug: 'surface-safety-valve-hydraulic-2-1-16-in-15m-flanged-each-fe-15-000-psi-api-6a-psl-3-ssv-class-ii-ee-0-5', title: 'Surface Safety Valve, Hydraulic, 2-1/16 in × 15M Flanged Each (FE), 15,000 psi, API 6A PSL 3 SSV, EE-0.5' },
    { sku: 'IH-OFV-SSV-3116-10K-1502-CAMERON', slug: 'surface-safety-valve-hydraulic-3-1-16-in-10m-flanged-inlet-3-in-1502-f-m-outlet-10-000-psi-api-6a-psl-3-pr1-ee-1-5', title: 'Surface Safety Valve, Hydraulic, 3-1/16 in × 10M Flanged Inlet × 3 in 1502 F×M Outlet, 10,000 psi, API 6A PSL 3 PR2, EE-1.5' },
  ],
  'wt-esd-panel': [
    { sku: 'IH-ESD-1SSV-SS316-3R', slug: 'esd-panel-single-ssv-control-ss316-haskel-maximator-3-remote-stations', title: 'ESD Panel, Single-SSV Control, SS316, Haskel + Maximator, 3 Remote Stations' },
  ],
  'industrial-butterfly-valves': [
    { sku: 'IH-PV-BFC', slug: 'concentric-butterfly-valve-rubber-lined', title: 'Concentric Butterfly Valve, Rubber Lined' },
    { sku: 'IH-PV-BFD', slug: 'double-offset-butterfly-valve-api-609', title: 'Double Offset Butterfly Valve, API 609' },
    { sku: 'IH-PV-BFT', slug: 'triple-offset-butterfly-valve-api-609', title: 'Triple Offset Butterfly Valve, Metal Seated, API 609' },
  ],
  'valve-actuators': [
    { sku: 'IH-OFE-AHC', slug: 'compact-hydraulic-actuator-api-6a', title: 'Compact Hydraulic Actuator for API 6A Gate Valves' },
    { sku: 'IH-OFE-AHD', slug: 'hydraulic-double-acting-actuator-api-6a', title: 'Hydraulic Double-Acting Actuator for API 6A Gate Valves' },
    { sku: 'IH-OFE-AHS', slug: 'hydraulic-single-acting-actuator-api-6a', title: 'Hydraulic Single-Acting Actuator for API 6A Gate Valves' },
    { sku: 'IH-OFE-APD', slug: 'pneumatic-diaphragm-actuator-api-6a', title: 'Pneumatic Diaphragm Actuator for API 6A Gate Valves' },
    { sku: 'IH-OFE-APP', slug: 'pneumatic-piston-actuator-api-6a', title: 'Pneumatic Piston Actuator for API 6A Gate Valves' },
  ],
  'wellhead-control-panels': [
    { sku: 'IH-OFE-HSD', slug: 'hydraulic-emergency-shutdown-system-self-contained', title: 'Self-Contained Hydraulic Emergency Shutdown System' },
    { sku: 'IH-OFE-WHC', slug: 'wellhead-control-panel-whcp', title: 'Wellhead Control Panel (WHCP), Single or Multi-Well' },
  ],
} satisfies Record<string, Listing[]>

export type Shelf = keyof typeof SHELVES

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** An HTML list linking every listing on the given shelves, optionally filtered by title. */
export function stockList(shelves: Shelf[], filter?: (l: Listing) => boolean): string {
  const items = shelves.flatMap((s) => SHELVES[s] as Listing[]).filter((l) => (filter ? filter(l) : true))
  return `<ul>${items.map((l) => `<li><a href="/p/${l.slug}">${esc(l.title)}</a></li>`).join('')}</ul>`
}
