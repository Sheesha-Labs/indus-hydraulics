/**
 * Every active listing on the hydraulic tools and bolting shelves this wave links, as of 2026-10-21 (sku, slug, title).
 * Generated from the live catalogue; the importer validates each SKU and the articles build their
 * "what we list" sections from these arrays so no listing is left unlinked.
 */
export type Listing = { sku: string; slug: string; title: string }

export const SHELVES = {
  'hydraulic-torque-wrenches': [
    { sku: 'IH-ENE-TW-DSX', slug: 'enerpac-dsx-aluminium-square-drive-hydraulic-torque-wrenches', title: 'Enerpac DSX Aluminium Square Drive Hydraulic Torque Wrenches' },
    { sku: 'IH-ENE-TW-HMT', slug: 'enerpac-hmt-hexagon-hydraulic-torque-wrenches', title: 'Enerpac HMT Hexagon Hydraulic Torque Wrenches' },
    { sku: 'IH-ENE-TW-HSQ', slug: 'enerpac-hsq-square-drive-hydraulic-torque-wrenches', title: 'Enerpac HSQ Square Drive Hydraulic Torque Wrenches' },
    { sku: 'IH-ENE-TW-PTW', slug: 'enerpac-ptw-pneumatic-torque-wrenches', title: 'Enerpac PTW Pneumatic Torque Wrenches' },
    { sku: 'IH-ENE-TW-RSL', slug: 'enerpac-rsl-low-profile-hydraulic-torque-wrenches', title: 'Enerpac RSL Low-Profile Hydraulic Torque Wrenches' },
    { sku: 'IH-ENE-TW-RSQ', slug: 'enerpac-rsq-square-drive-torque-wrenches', title: 'Enerpac RSQ Square Drive Torque Wrenches' },
    { sku: 'IH-ENE-TW-S', slug: 'enerpac-s-series-square-drive-hydraulic-torque-wrenches', title: 'Enerpac S-Series Square Drive Hydraulic Torque Wrenches' },
    { sku: 'IH-ENE-TW-W', slug: 'enerpac-w-series-low-profile-hexagon-torque-wrenches', title: 'Enerpac W-Series Low-Profile Hexagon Torque Wrenches' },
  ],
  'torque-wrench-sockets-accessories': [
    { sku: 'IH-ENE-BSH15', slug: 'enerpac-bsh-impact-sockets-for-1-1-2-in-square-drive', title: 'Enerpac BSH Impact Sockets for 1 1/2" Square Drive' },
    { sku: 'IH-ENE-BSH10', slug: 'enerpac-bsh-impact-sockets-for-1-in-square-drive', title: 'Enerpac BSH Impact Sockets for 1" Square Drive' },
    { sku: 'IH-ENE-BSH25', slug: 'enerpac-bsh-impact-sockets-for-2-1-2-in-square-drive', title: 'Enerpac BSH Impact Sockets for 2 1/2" Square Drive' },
    { sku: 'IH-ENE-BSH75', slug: 'enerpac-bsh-impact-sockets-for-3-4-in-square-drive', title: 'Enerpac BSH Impact Sockets for 3/4" Square Drive' },
    { sku: 'IH-ENE-BUS', slug: 'enerpac-bus-back-up-spanners', title: 'Enerpac BUS Back-Up Spanners' },
    { sku: 'IH-ENE-DDA', slug: 'enerpac-dda-allen-hex-drives-for-dsx-torque-wrenches', title: 'Enerpac DDA Allen (Hex) Drives for DSX Torque Wrenches' },
    { sku: 'IH-ENE-HLP', slug: 'enerpac-hlp-hexagon-cassettes-for-hmt-torque-wrenches', title: 'Enerpac HLP Hexagon Cassettes for HMT Torque Wrenches' },
    { sku: 'IH-ENE-ERA', slug: 'enerpac-reaction-arms-and-extended-drives-for-ptw-and-etw-torque-wrenches', title: 'Enerpac Reaction Arms and Extended Drives for PTW and ETW Torque Wrenches' },
    { sku: 'IH-ENE-ERT', slug: 'enerpac-reaction-arms-and-extended-reaction-tubes-for-rsl-torque-wrenches', title: 'Enerpac Reaction Arms and Extended Reaction Tubes for RSL Torque Wrenches' },
    { sku: 'IH-ENE-SRS', slug: 'enerpac-reaction-arms-and-tube-extensions-for-s-series-x-edition-torque-wrenches', title: 'Enerpac Reaction Arms and Tube Extensions for S-Series X-Edition Torque Wrenches' },
    { sku: 'IH-ENE-WRP', slug: 'enerpac-reaction-paddles-and-arms-for-w-series-hexagon-torque-wrenches', title: 'Enerpac Reaction Paddles and Arms for W-Series Hexagon Torque Wrenches' },
    { sku: 'IH-ENE-STTL', slug: 'enerpac-rsq-torque-wrench-accessories-and-safe-t-torque-locks', title: 'Enerpac RSQ Torque Wrench Accessories and Safe-T Torque Locks' },
    { sku: 'IH-ENE-THQ', slug: 'enerpac-thq-twin-torque-wrench-hoses', title: 'Enerpac THQ Twin Torque Wrench Hoses' },
  ],
  'hydraulic-bolt-tensioners': [
    { sku: 'IH-ENE-EAJ', slug: 'enerpac-eaj-aquajack-subsea-bolt-tensioners-and-seal-kits', title: 'Enerpac EAJ Aquajack Subsea Bolt Tensioners and Seal Kits' },
    { sku: 'IH-ENE-EAJ-QFN', slug: 'enerpac-eaj-tensioner-quick-fastening-nuts', title: 'Enerpac EAJ Tensioner Quick Fastening Nuts' },
  ],
  'nut-splitters-nut-cutters': [
    { sku: 'IH-ENE-NC', slug: 'enerpac-nc-hydraulic-nut-cutters', title: 'Enerpac NC Hydraulic Nut Cutters' },
    { sku: 'IH-ENE-NS', slug: 'enerpac-ns-hydraulic-nut-splitters', title: 'Enerpac NS Hydraulic Nut Splitters' },
  ],
  'flange-spreaders-alignment-tools': [
    { sku: 'IH-ENE-SWI', slug: 'enerpac-equalizer-swi-flange-spreaders', title: 'Enerpac Equalizer SWi Flange Spreaders' },
    { sku: 'IH-ENE-FA', slug: 'enerpac-flange-alignment-tools', title: 'Enerpac Flange Alignment Tools' },
    { sku: 'IH-ENE-MM', slug: 'enerpac-flange-facing-and-portable-milling-machines', title: 'Enerpac Flange Facing and Portable Milling Machines' },
    { sku: 'IH-ENE-MG', slug: 'enerpac-flange-spreaders-and-spread-cylinders', title: 'Enerpac Flange Spreaders and Spread Cylinders' },
    { sku: 'IH-ENE-MITT', slug: 'enerpac-mitt-combination-isolation-and-test-tools', title: 'Enerpac MITT Combination Isolation and Test Tools' },
  ],
  'hydraulic-jacks-skates': [
    { sku: 'IH-ENE-ER', slug: 'enerpac-caterroller-load-skates-turntables-and-leveling-plates', title: 'Enerpac Caterroller Load Skates, Turntables and Leveling Plates' },
    { sku: 'IH-ENE-PRE', slug: 'enerpac-electric-pow-r-riser-lifting-jacks', title: 'Enerpac Electric Pow\'r-Riser Lifting Jacks' },
    { sku: 'IH-ENE-GBJ', slug: 'enerpac-gbj-industrial-bottle-jacks', title: 'Enerpac GBJ Industrial Bottle Jacks' },
    { sku: 'IH-ENE-JH', slug: 'enerpac-jh-aluminium-and-steel-jacks', title: 'Enerpac JH Aluminium and Steel Jacks' },
    { sku: 'IH-ENE-LW', slug: 'enerpac-lw-vertical-lifting-wedges', title: 'Enerpac LW Vertical Lifting Wedges' },
    { sku: 'IH-ENE-PRA', slug: 'enerpac-pneumatic-pow-r-riser-lifting-jacks', title: 'Enerpac Pneumatic Pow\'r-Riser Lifting Jacks' },
    { sku: 'IH-ENE-SOH', slug: 'enerpac-soh-hydraulic-machine-lifts', title: 'Enerpac SOH Hydraulic Machine Lifts' },
    { sku: 'IH-STW-JACKS', slug: 'stillwell-hydraulic-trailer-jacks-and-accessories', title: 'Stillwell Hydraulic Trailer Jacks and Accessories' },
  ],
  'hydraulic-pullers': [
    { sku: 'IH-ENE-LGH', slug: 'enerpac-lgh-hydraulic-lock-grip-pullers', title: 'Enerpac LGH Hydraulic Lock Grip Pullers' },
    { sku: 'IH-ENE-LGHMS', slug: 'enerpac-lghms-hydraulic-lock-grip-master-puller-sets', title: 'Enerpac LGHMS Hydraulic Lock Grip Master Puller Sets' },
    { sku: 'IH-ENE-LGHS', slug: 'enerpac-lghs-hydraulic-lock-grip-puller-sets', title: 'Enerpac LGHS Hydraulic Lock Grip Puller Sets' },
    { sku: 'IH-ENE-LGM', slug: 'enerpac-lgm-mechanical-lock-grip-pullers', title: 'Enerpac LGM Mechanical Lock Grip Pullers' },
    { sku: 'IH-ENE-SG', slug: 'enerpac-sync-grip-pullers-and-master-puller-sets', title: 'Enerpac Sync Grip Pullers and Master Puller Sets' },
  ],
  'hydraulic-presses': [
    { sku: 'IH-ENE-A', slug: 'enerpac-a-series-arbor-c-clamp-and-bench-frame-presses', title: 'Enerpac A-Series Arbor, C-Clamp and Bench Frame Presses' },
    { sku: 'IH-ENE-IP', slug: 'enerpac-ip-h-frame-and-roll-frame-presses', title: 'Enerpac IP H-Frame and Roll Frame Presses' },
    { sku: 'IH-ENE-XLP', slug: 'enerpac-xlp-workshop-hydraulic-presses', title: 'Enerpac XLP Workshop Hydraulic Presses' },
  ],
  'hydraulic-cutters': [
    { sku: 'IH-ENE-EBC', slug: 'enerpac-bar-cutters', title: 'Enerpac Bar Cutters' },
    { sku: 'IH-ENE-ECCE', slug: 'enerpac-chain-wire-and-cable-cutters', title: 'Enerpac Chain, Wire and Cable Cutters' },
    { sku: 'IH-ENE-STC', slug: 'enerpac-cutterheads-and-self-contained-cutter-sets', title: 'Enerpac Cutterheads and Self-Contained Cutter Sets' },
    { sku: 'IH-ENE-EDCH', slug: 'enerpac-edch-decommissioning-cutters', title: 'Enerpac EDCH Decommissioning Cutters' },
  ],
  'cylinder-pump-sets': [
    { sku: 'IH-ENE-MS', slug: 'enerpac-ms-hydraulic-maintenance-and-repair-sets', title: 'Enerpac MS Hydraulic Maintenance and Repair Sets' },
    { sku: 'IH-ENE-STB', slug: 'enerpac-pipe-bender-and-punch-sets', title: 'Enerpac Pipe Bender and Punch Sets' },
    { sku: 'IH-ENE-SCL', slug: 'enerpac-scl-low-height-cylinder-and-pump-sets', title: 'Enerpac SCL Low-Height Cylinder and Pump Sets' },
    { sku: 'IH-ENE-SCR', slug: 'enerpac-scr-cylinder-and-pump-sets', title: 'Enerpac SCR Cylinder and Pump Sets' },
    { sku: 'IH-ENE-SRS-TOOLBOX', slug: 'enerpac-srs-portable-hydraulic-toolboxes', title: 'Enerpac SRS Portable Hydraulic Toolboxes' },
  ],
  'hydraulic-swing-clamps': [
    { sku: 'IH-ENE-SC', slug: 'enerpac-sc-swing-clamps', title: 'Enerpac SC Swing Clamps' },
  ],
  'hydraulic-power-tools': [
    { sku: 'IH-STN-HT', slug: 'stanley-hydraulic-braze-units-pumps-fans-and-other-tools', title: 'Stanley Hydraulic Braze Units, Pumps, Fans and Other Tools' },
    { sku: 'IH-STN-CTT', slug: 'stanley-hydraulic-cutting-trimming-tools', title: 'Stanley Hydraulic Cutting & Trimming Tools' },
    { sku: 'IH-STN-G', slug: 'stanley-hydraulic-grinders', title: 'Stanley Hydraulic Grinders' },
    { sku: 'IH-STN-PT', slug: 'stanley-hydraulic-percussion-tools', title: 'Stanley Hydraulic Percussion Tools' },
    { sku: 'IH-STN-HPU', slug: 'stanley-hydraulic-power-units', title: 'Stanley Hydraulic Power Units' },
    { sku: 'IH-STN-RMT', slug: 'stanley-hydraulic-rail-maintenance-tools', title: 'Stanley Hydraulic Rail Maintenance Tools' },
    { sku: 'IH-STN-SP', slug: 'stanley-hydraulic-submersible-pumps', title: 'Stanley Hydraulic Submersible Pumps' },
    { sku: 'IH-STN-WD', slug: 'stanley-hydraulic-wrenches-drills', title: 'Stanley Hydraulic Wrenches & Drills' },
  ],
  'winches': [
    { sku: 'IH-PRC-WINCH', slug: 'pierce-electric-and-hydraulic-winches-cables-and-parts', title: 'Pierce Electric and Hydraulic Winches, Cables and Parts' },
    { sku: 'IH-PRC-REMOTE', slug: 'pierce-winch-remote-controls', title: 'Pierce Winch Remote Controls' },
  ],
} satisfies Record<string, Listing[]>

export type Shelf = keyof typeof SHELVES

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** An HTML list linking every listing on the given shelves, optionally filtered by title. */
export function stockList(shelves: Shelf[], filter?: (l: Listing) => boolean): string {
  const items = shelves.flatMap((s) => SHELVES[s] as Listing[]).filter((l) => (filter ? filter(l) : true))
  return `<ul>${items.map((l) => `<li><a href="/p/${l.slug}">${esc(l.title)}</a></li>`).join('')}</ul>`
}
