// AUTO-GENERATED from the live primary_megamenu tree (2026-06-13).
// Canonical 6-section "Products" megamenu used by seedNavigationMenus().
// Regenerate from the live DB if the information architecture changes
// (see packages/db/scripts/consolidate-megamenu.mjs in the consolidation PR).
//
// linkType is inferred at seed time: `category` (slug resolved to id) when
// `category` is set, else `custom_url` when `url` is set, else a plain header.

export type MegamenuSeedNode = {
  label: string
  category?: string
  url?: string
  children?: MegamenuSeedNode[]
}

export const MEGAMENU_TREE: MegamenuSeedNode[] = [
  {
    label: 'Hydraulic Components & Power Units',
    url: '/c',
    children: [
      {
        label: 'Hydraulic Pumps',
        category: 'hydraulic-pumps',
        children: [
          {
            label: 'Gear Pumps',
            url: '/c/hydraulic-pumps?sub=gear',
            children: [
              {
                label: 'External Gear',
                url: '/c/hydraulic-pumps?sub=gear&type=External%20Gear',
              },
              {
                label: 'Internal Gear',
                url: '/c/hydraulic-pumps?sub=gear&type=Internal%20Gear',
              },
              {
                label: 'Gerotor',
                url: '/c/hydraulic-pumps?sub=gear&type=Gerotor',
              },
              {
                label: 'Twin-Flow',
                url: '/c/hydraulic-pumps?sub=gear&type=Twin-Flow',
              },
            ],
          },
          {
            label: 'Vane Pumps',
            url: '/c/hydraulic-pumps?sub=vane',
            children: [
              {
                label: 'Fixed Displacement',
                url: '/c/hydraulic-pumps?sub=vane&type=Fixed%20Displacement',
              },
              {
                label: 'Variable Displacement',
                url: '/c/hydraulic-pumps?sub=vane&type=Variable%20Displacement',
              },
              {
                label: 'Cartridge Type',
                url: '/c/hydraulic-pumps?sub=vane&type=Cartridge%20Type',
              },
            ],
          },
          {
            label: 'Piston Pumps',
            url: '/c/hydraulic-pumps?sub=piston',
            children: [
              {
                label: 'Axial Piston',
                url: '/c/hydraulic-pumps?sub=piston&type=Axial%20Piston',
              },
              {
                label: 'Radial Piston',
                url: '/c/hydraulic-pumps?sub=piston&type=Radial%20Piston',
              },
              {
                label: 'Bent Axis',
                url: '/c/hydraulic-pumps?sub=piston&type=Bent%20Axis',
              },
              {
                label: 'Swashplate Variable',
                url: '/c/hydraulic-pumps?sub=piston&type=Swashplate%20Variable',
              },
            ],
          },
          {
            label: 'Hand & Foot Pumps',
            url: '/c/hydraulic-pumps?sub=hand',
            children: [
              {
                label: 'Single-Acting',
                url: '/c/hydraulic-pumps?sub=hand&type=Single-Acting',
              },
              {
                label: 'Double-Acting',
                url: '/c/hydraulic-pumps?sub=hand&type=Double-Acting',
              },
              {
                label: 'Air-Driven',
                url: '/c/hydraulic-pumps?sub=hand&type=Air-Driven',
              },
            ],
          },
          {
            label: 'Power Packs',
            url: '/c/hydraulic-pumps?sub=power',
            children: [
              {
                label: 'Mini Power Packs',
                url: '/c/hydraulic-pumps?sub=power&type=Mini%20Power%20Packs',
              },
              {
                label: 'AC Power Units',
                url: '/c/hydraulic-pumps?sub=power&type=AC%20Power%20Units',
              },
              {
                label: 'DC Power Units',
                url: '/c/hydraulic-pumps?sub=power&type=DC%20Power%20Units',
              },
              {
                label: '3-Phase',
                url: '/c/hydraulic-pumps?sub=power&type=3-Phase',
              },
            ],
          },
        ],
      },
      {
        label: 'Hydraulic Cylinders',
        category: 'cylinders',
        children: [
          {
            label: 'Tie-Rod Cylinders',
            url: '/c/hydraulic-cylinders?sub=tie-rod',
            children: [
              {
                label: 'NFPA Standard',
                url: '/c/hydraulic-cylinders?sub=tie-rod&type=NFPA%20Standard',
              },
              {
                label: 'ISO 6020',
                url: '/c/hydraulic-cylinders?sub=tie-rod&type=ISO%206020',
              },
              {
                label: 'ISO 6022',
                url: '/c/hydraulic-cylinders?sub=tie-rod&type=ISO%206022',
              },
              {
                label: 'Mill-Type',
                url: '/c/hydraulic-cylinders?sub=tie-rod&type=Mill-Type',
              },
            ],
          },
          {
            label: 'Welded Cylinders',
            url: '/c/hydraulic-cylinders?sub=welded',
            children: [
              {
                label: 'Cross-Tube Mount',
                url: '/c/hydraulic-cylinders?sub=welded&type=Cross-Tube%20Mount',
              },
              {
                label: 'Clevis Mount',
                url: '/c/hydraulic-cylinders?sub=welded&type=Clevis%20Mount',
              },
              {
                label: 'Trunnion Mount',
                url: '/c/hydraulic-cylinders?sub=welded&type=Trunnion%20Mount',
              },
            ],
          },
          {
            label: 'Telescopic Cylinders',
            url: '/c/hydraulic-cylinders?sub=telescopic',
            children: [
              {
                label: 'Single-Acting',
                url: '/c/hydraulic-cylinders?sub=telescopic&type=Single-Acting',
              },
              {
                label: 'Double-Acting',
                url: '/c/hydraulic-cylinders?sub=telescopic&type=Double-Acting',
              },
              {
                label: 'Tipper Trailer',
                url: '/c/hydraulic-cylinders?sub=telescopic&type=Tipper%20Trailer',
              },
            ],
          },
          {
            label: 'Compact & Block',
            url: '/c/hydraulic-cylinders?sub=compact',
            children: [
              {
                label: 'Block Cylinders',
                url: '/c/hydraulic-cylinders?sub=compact&type=Block%20Cylinders',
              },
              {
                label: 'Pancake',
                url: '/c/hydraulic-cylinders?sub=compact&type=Pancake',
              },
              {
                label: 'Hollow Plunger',
                url: '/c/hydraulic-cylinders?sub=compact&type=Hollow%20Plunger',
              },
            ],
          },
          {
            label: 'Custom Builds',
            url: '/c/hydraulic-cylinders?sub=custom',
            children: [
              {
                label: 'Made-to-Order',
                url: '/c/hydraulic-cylinders?sub=custom&type=Made-to-Order',
              },
              {
                label: 'Repair & Reseal',
                url: '/c/hydraulic-cylinders?sub=custom&type=Repair%20%26%20Reseal',
              },
              {
                label: 'Plating Service',
                url: '/c/hydraulic-cylinders?sub=custom&type=Plating%20Service',
              },
            ],
          },
        ],
      },
      {
        label: 'Valves & Manifolds',
        category: 'valves-manifolds',
        children: [
          {
            label: 'Directional Control',
            url: '/c/valves-manifolds?sub=directional',
            children: [
              {
                label: 'Solenoid Operated',
                url: '/c/valves-manifolds?sub=directional&type=Solenoid%20Operated',
              },
              {
                label: 'Manual Lever',
                url: '/c/valves-manifolds?sub=directional&type=Manual%20Lever',
              },
              {
                label: 'Pilot Operated',
                url: '/c/valves-manifolds?sub=directional&type=Pilot%20Operated',
              },
              {
                label: 'Cetop 3 / NG6',
                url: '/c/valves-manifolds?sub=directional&type=Cetop%203%20%2F%20NG6',
              },
              {
                label: 'Cetop 5 / NG10',
                url: '/c/valves-manifolds?sub=directional&type=Cetop%205%20%2F%20NG10',
              },
            ],
          },
          {
            label: 'Pressure Control',
            url: '/c/valves-manifolds?sub=pressure',
            children: [
              {
                label: 'Relief',
                url: '/c/valves-manifolds?sub=pressure&type=Relief',
              },
              {
                label: 'Reducing',
                url: '/c/valves-manifolds?sub=pressure&type=Reducing',
              },
              {
                label: 'Sequence',
                url: '/c/valves-manifolds?sub=pressure&type=Sequence',
              },
              {
                label: 'Counterbalance',
                url: '/c/valves-manifolds?sub=pressure&type=Counterbalance',
              },
            ],
          },
          {
            label: 'Flow Control',
            url: '/c/valves-manifolds?sub=flow',
            children: [
              {
                label: 'Throttle',
                url: '/c/valves-manifolds?sub=flow&type=Throttle',
              },
              {
                label: 'Pressure Compensated',
                url: '/c/valves-manifolds?sub=flow&type=Pressure%20Compensated',
              },
              {
                label: 'Proportional',
                url: '/c/valves-manifolds?sub=flow&type=Proportional',
              },
            ],
          },
          {
            label: 'Check & Logic',
            url: '/c/valves-manifolds?sub=check',
            children: [
              {
                label: 'Inline Check',
                url: '/c/valves-manifolds?sub=check&type=Inline%20Check',
              },
              {
                label: 'Pilot Check',
                url: '/c/valves-manifolds?sub=check&type=Pilot%20Check',
              },
              {
                label: 'Logic Elements',
                url: '/c/valves-manifolds?sub=check&type=Logic%20Elements',
              },
            ],
          },
          {
            label: 'Manifolds',
            url: '/c/valves-manifolds?sub=manifolds',
            children: [
              {
                label: 'Standard Bar',
                url: '/c/valves-manifolds?sub=manifolds&type=Standard%20Bar',
              },
              {
                label: 'Custom Block',
                url: '/c/valves-manifolds?sub=manifolds&type=Custom%20Block',
              },
              {
                label: 'Subplates',
                url: '/c/valves-manifolds?sub=manifolds&type=Subplates',
              },
            ],
          },
          {
            label: 'Butterfly Valves',
            category: 'butterfly-valves',
          },
        ],
      },
      {
        label: 'Seals & Components',
        category: 'seals-accessories',
        children: [
          {
            label: 'Rod Seals',
            url: '/c/seals-components?sub=rod-seals',
            children: [
              {
                label: 'U-Cup',
                url: '/c/seals-components?sub=rod-seals&type=U-Cup',
              },
              {
                label: 'Step Seal',
                url: '/c/seals-components?sub=rod-seals&type=Step%20Seal',
              },
              {
                label: 'Stepped Cap',
                url: '/c/seals-components?sub=rod-seals&type=Stepped%20Cap',
              },
              {
                label: 'Buffer Seal',
                url: '/c/seals-components?sub=rod-seals&type=Buffer%20Seal',
              },
            ],
          },
          {
            label: 'Piston Seals',
            url: '/c/seals-components?sub=piston-seals',
            children: [
              {
                label: 'Twin-Lip',
                url: '/c/seals-components?sub=piston-seals&type=Twin-Lip',
              },
              {
                label: 'Glyd Ring',
                url: '/c/seals-components?sub=piston-seals&type=Glyd%20Ring',
              },
              {
                label: 'Compact',
                url: '/c/seals-components?sub=piston-seals&type=Compact',
              },
            ],
          },
          {
            label: 'Wipers & Scrapers',
            url: '/c/seals-components?sub=wipers',
            children: [
              {
                label: 'Single-Lip',
                url: '/c/seals-components?sub=wipers&type=Single-Lip',
              },
              {
                label: 'Double-Lip',
                url: '/c/seals-components?sub=wipers&type=Double-Lip',
              },
              {
                label: 'Metallic',
                url: '/c/seals-components?sub=wipers&type=Metallic',
              },
            ],
          },
          {
            label: 'O-Rings & Back-up',
            url: '/c/seals-components?sub=orings',
            children: [
              {
                label: 'NBR',
                url: '/c/seals-components?sub=orings&type=NBR',
              },
              {
                label: 'FKM (Viton)',
                url: '/c/seals-components?sub=orings&type=FKM%20(Viton)',
              },
              {
                label: 'EPDM',
                url: '/c/seals-components?sub=orings&type=EPDM',
              },
              {
                label: 'PTFE Back-up',
                url: '/c/seals-components?sub=orings&type=PTFE%20Back-up',
              },
            ],
          },
        ],
      },
      {
        label: 'Accessories & Instrumentation',
        url: '/c/accessories-instrumentation',
        children: [
          {
            label: 'Filters',
            url: '/c/accessories-instrumentation?sub=filters',
            children: [
              {
                label: 'Suction',
                url: '/c/accessories-instrumentation?sub=filters&type=Suction',
              },
              {
                label: 'Pressure-Line',
                url: '/c/accessories-instrumentation?sub=filters&type=Pressure-Line',
              },
              {
                label: 'Return-Line',
                url: '/c/accessories-instrumentation?sub=filters&type=Return-Line',
              },
              {
                label: 'Tank Breather',
                url: '/c/accessories-instrumentation?sub=filters&type=Tank%20Breather',
              },
            ],
          },
          {
            label: 'Gauges & Sensors',
            url: '/c/accessories-instrumentation?sub=gauges',
            children: [
              {
                label: 'Bourdon Gauge',
                url: '/c/accessories-instrumentation?sub=gauges&type=Bourdon%20Gauge',
              },
              {
                label: 'Glycerin-Filled',
                url: '/c/accessories-instrumentation?sub=gauges&type=Glycerin-Filled',
              },
              {
                label: 'Digital',
                url: '/c/accessories-instrumentation?sub=gauges&type=Digital',
              },
              {
                label: 'Pressure Transducer',
                url: '/c/accessories-instrumentation?sub=gauges&type=Pressure%20Transducer',
              },
            ],
          },
          {
            label: 'Accumulators',
            url: '/c/accessories-instrumentation?sub=accumulators',
            children: [
              {
                label: 'Bladder',
                url: '/c/accessories-instrumentation?sub=accumulators&type=Bladder',
              },
              {
                label: 'Diaphragm',
                url: '/c/accessories-instrumentation?sub=accumulators&type=Diaphragm',
              },
              {
                label: 'Piston',
                url: '/c/accessories-instrumentation?sub=accumulators&type=Piston',
              },
            ],
          },
          {
            label: 'Coolers',
            url: '/c/accessories-instrumentation?sub=coolers',
            children: [
              {
                label: 'Air-Oil',
                url: '/c/accessories-instrumentation?sub=coolers&type=Air-Oil',
              },
              {
                label: 'Water-Oil',
                url: '/c/accessories-instrumentation?sub=coolers&type=Water-Oil',
              },
              {
                label: 'With Bypass',
                url: '/c/accessories-instrumentation?sub=coolers&type=With%20Bypass',
              },
            ],
          },
          {
            label: 'Reservoirs',
            url: '/c/accessories-instrumentation?sub=reservoirs',
            children: [
              {
                label: 'Steel Tanks',
                url: '/c/accessories-instrumentation?sub=reservoirs&type=Steel%20Tanks',
              },
              {
                label: 'Aluminum',
                url: '/c/accessories-instrumentation?sub=reservoirs&type=Aluminum',
              },
              {
                label: 'Custom Fab',
                url: '/c/accessories-instrumentation?sub=reservoirs&type=Custom%20Fab',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    label: 'Hose, Tube, Fittings & Adapters',
    category: 'hoses-fittings',
    children: [
      {
        label: 'Hydraulic Hose',
        url: '/c/hoses-fittings?sub=hose',
        children: [
          {
            label: 'Hydraulic Hoses',
            category: 'hydraulic-hoses',
          },
          {
            label: 'Thermoplastic Hoses',
            category: 'thermoplastic-hoses',
          },
        ],
      },
      {
        label: 'Hose Fittings',
        url: '/c/hoses-fittings?sub=fittings',
        children: [
          {
            label: 'Crimp Ferrules',
            category: 'crimp-ferrules',
          },
          {
            label: 'Metric Hose Fittings',
            category: 'metric-hose-fittings',
          },
          {
            label: 'DIN Hose Fittings',
            category: 'din-hose-fittings',
          },
          {
            label: 'BSP Hose Fittings',
            category: 'bsp-hose-fittings',
          },
          {
            label: 'JIC 37° Hose Fittings',
            category: 'jic-37-hose-fittings',
          },
          {
            label: 'Japanese Hose Fittings',
            category: 'japanese-hose-fittings',
          },
          {
            label: 'ORFS Hose Fittings',
            category: 'orfs-hose-fittings',
          },
          {
            label: 'NPT / NPSM / SAE Hose Fittings',
            category: 'npt-npsm-sae-hose-fittings',
          },
          {
            label: 'SAE Flange Fittings',
            category: 'sae-flange-fittings',
          },
        ],
      },
      {
        label: 'Adapters',
        url: '/c/hoses-fittings?sub=adapters',
        children: [
          {
            label: 'DIN 2353 Bite Type Adapters',
            category: 'din-2353-bite-type-adapters',
          },
          {
            label: 'BSP Adapters',
            category: 'bsp-adapters',
          },
          {
            label: 'JIC Adapters',
            category: 'jic-adapters',
          },
          {
            label: 'ORFS Adapters',
            category: 'orfs-adapters',
          },
          {
            label: 'Metric Adapters',
            category: 'metric-adapters',
          },
          {
            label: 'NPT Adapters',
            category: 'npt-adapters',
          },
          {
            label: 'SAE Flange Adapters',
            category: 'sae-flange-adapters',
          },
          {
            label: 'Hydraulic SAE Flanges',
            category: 'hydraulic-sae-flanges',
          },
        ],
      },
      {
        label: 'Quick Couplers',
        url: '/c/hoses-fittings?sub=couplers',
        children: [
          {
            label: 'Quick Couplers',
            category: 'quick-couplers',
          },
        ],
      },
      {
        label: 'SS316L Fittings',
        url: '/c/hoses-fittings?sub=ss316l-fittings',
        children: [
          {
            label: 'SS316L BSP Fittings',
            category: 'ss316l-bsp-fittings',
          },
          {
            label: 'SS316L SAE Fittings',
            category: 'ss316l-sae-fittings',
          },
          {
            label: 'SS316L Banjos',
            category: 'ss316l-banjos',
          },
          {
            label: 'SS316L JIC 37° Fittings',
            category: 'ss316l-jic-37-fittings',
          },
          {
            label: 'SS316L Metric Fittings',
            category: 'ss316l-metric-fittings',
          },
          {
            label: 'SS316L Standpipes',
            category: 'ss316l-standpipes',
          },
          {
            label: 'SS316L ORFS Fittings',
            category: 'ss316l-orfs-fittings',
          },
          {
            label: 'SS316L NPT / NPSM Fittings',
            category: 'ss316l-npt-npsm-fittings',
          },
          {
            label: 'SS316L Double Hexagonal',
            category: 'ss316l-double-hexagonal-fittings',
          },
          {
            label: 'SS316L Hydrowashing Couplings',
            category: 'ss316l-hydrowashing-couplings',
          },
          {
            label: 'SS316L SAE Flanges for Hoses',
            category: 'ss316l-sae-flanges-for-hoses',
          },
        ],
      },
    ],
  },
  {
    label: 'Industrial & Oilfield Hoses',
    category: 'industrial-hoses',
    children: [
      {
        label: 'Hoses by Service',
        url: '/c/industrial-hoses?sub=hoses-by-service',
        children: [
          {
            label: 'Air & Water',
            category: 'air-water-hoses',
          },
          {
            label: 'Water Suction & Delivery',
            category: 'water-suction-delivery-hoses',
          },
          {
            label: 'Food & Beverage',
            category: 'food-beverage-hoses',
          },
          {
            label: 'Oil, Chemical & General Purpose',
            category: 'oil-chemical-purpose-hoses',
          },
          {
            label: 'Composite Hoses',
            category: 'composite-hoses',
          },
          {
            label: 'Industrial Steam',
            category: 'industrial-steam-hoses',
          },
          {
            label: 'Abrasive & Bulk Material',
            category: 'abrasive-hoses',
          },
          {
            label: 'Specialist & Custom-Built',
            category: 'specialist-hoses',
          },
        ],
      },
      {
        label: 'Couplings',
        url: '/c/industrial-hoses?sub=couplings',
        children: [
          {
            label: 'Cam & Groove Couplings',
            category: 'cam-and-groove-couplings',
          },
          {
            label: 'Specialty Adapters & Couplings',
            category: 'specialty-adapters-couplings',
          },
          {
            label: 'Bauer Type Couplings',
            category: 'bauer-type-couplings',
          },
          {
            label: 'Dry Disconnect Couplings',
            category: 'dry-disconnect-couplings',
          },
        ],
      },
      {
        label: 'Specialty Couplings & Flanges',
        url: '/c/industrial-hoses?sub=specialty-couplings-flanges',
        children: [
          {
            label: 'Sandblast Couplings',
            category: 'sandblast-couplings',
          },
          {
            label: 'Crowfoot Couplings',
            category: 'crowfoot-couplings',
          },
          {
            label: 'Ground Joint Couplings',
            category: 'ground-joint-couplings',
          },
          {
            label: 'Ring Lock Couplings',
            category: 'ring-lock-couplings',
          },
          {
            label: 'Pin Lug Shank Couplings',
            category: 'pin-lug-shank-couplings',
          },
          {
            label: 'Shank Couplings',
            category: 'shank-couplings',
          },
          {
            label: 'Hose Menders',
            category: 'hose-menders',
          },
          {
            label: 'Hose Nipples',
            category: 'hose-nipples',
          },
          {
            label: 'Guillemin Couplings',
            category: 'guillemin-couplings',
          },
          {
            label: 'Composite Hose Fittings',
            category: 'composite-hose-fittings',
          },
          {
            label: 'KC Nipple & Hose Fittings',
            category: 'kc-nipple-fittings',
          },
          {
            label: 'Storz Couplings & Adapters',
            category: 'storz-couplings',
          },
          {
            label: 'Industrial Flanges',
            category: 'industrial-flanges',
          },
        ],
      },
      {
        label: 'Clamps, Air & Regional Couplings',
        children: [
          {
            label: 'Universal Air Hose Couplings',
            category: 'universal-air-couplings',
          },
          {
            label: 'Clamps, Sleeves & Ferrules',
            category: 'hose-clamps-sleeves-ferrules',
          },
          {
            label: 'Russian GOST Couplings',
            category: 'gost-couplings',
          },
          {
            label: 'Barcelona & Geka Couplings',
            category: 'barcelona-geka-couplings',
          },
          {
            label: 'EN 14420-5 Fittings',
            category: 'en14420-5-fittings',
          },
        ],
      },
      {
        label: 'Metallic Hoses',
        url: '/c/industrial-hoses?sub=metallic-hoses',
        children: [
          {
            label: 'Stainless Corrugated',
            category: 'metallic-stainless-corrugated-hoses',
          },
          {
            label: 'Exotic Alloys (Hastelloy / Inconel / Monel / Bronze)',
            category: 'metallic-exotic-alloy-hoses',
          },
          {
            label: 'High-Pressure Metallic',
            category: 'metallic-high-pressure-hoses',
          },
          {
            label: 'Fire Protection & Specialty Cores',
            category: 'metallic-fire-protection-hoses',
          },
          {
            label: 'Specialty Hose Assemblies',
            category: 'metallic-specialty-assemblies',
          },
          {
            label: 'PTFE Hoses',
            category: 'ptfe-hoses',
          },
          {
            label: 'Metallic Hose Couplings',
            category: 'metallic-hose-couplings',
          },
        ],
      },
      {
        label: 'Oil & Gas / Drilling Hoses',
        category: 'oil-gas-hoses',
        children: [
          {
            label: 'Drilling Hoses',
            category: 'drilling-hoses',
          },
          {
            label: 'Well Control Hoses (API 16C)',
            category: 'well-control-hoses',
          },
          {
            label: 'Well Service & Intervention',
            category: 'well-service-hoses',
          },
          {
            label: 'Tensioner & Compensator',
            category: 'tensioner-compensator-hoses',
          },
          {
            label: 'Low-Pressure Oilfield',
            category: 'low-pressure-oilfield-hoses',
          },
        ],
      },
    ],
  },
  {
    label: 'Oilfield Valves, Flow Iron & Pressure Control',
    url: '/c',
    children: [
      {
        label: 'Oilfield Valves',
        category: 'oilfield-valves',
        children: [
          {
            label: 'Ball Valves',
            category: 'oilfield-ball-valves',
          },
          {
            label: 'Gate Valves',
            category: 'oilfield-gate-valves',
          },
          {
            label: 'Plug Valves',
            category: 'oilfield-plug-valves',
          },
          {
            label: 'Check Valves',
            category: 'oilfield-check-valves',
          },
          {
            label: 'SSV & ESD Valves',
            category: 'oilfield-ssv-esd-valves',
          },
          {
            label: 'Choke Valves',
            category: 'oilfield-choke-valves',
          },
          {
            label: 'Globe Valves',
            category: 'oilfield-globe-valves',
          },
          {
            label: 'Pressure Relief Valves',
            category: 'oilfield-pressure-relief-valves',
          },
          {
            label: 'Butterfly Valves',
            category: 'oilfield-butterfly-valves',
          },
          {
            label: 'Instrumentation Valves',
            category: 'oilfield-instrumentation-valves',
          },
          {
            label: 'Valve Accessories',
            category: 'oilfield-valve-accessories',
          },
        ],
      },
      {
        label: 'Flow Iron & Wellhead',
        category: 'flow-iron-wellhead',
        children: [
          {
            label: 'Adapters',
            category: 'flow-iron-adapters',
          },
          {
            label: 'Fittings',
            category: 'flow-iron-fittings',
          },
          {
            label: 'API Flanges',
            category: 'flow-iron-flanges-api',
          },
          {
            label: 'Flow Line',
            category: 'flow-iron-flow-line',
          },
          {
            label: 'Manifolds',
            category: 'flow-iron-manifolds',
          },
          {
            label: 'Wellhead',
            category: 'wellhead',
          },
          {
            label: 'Surface Test Trees',
            category: 'surface-test-trees',
          },
        ],
      },
      {
        label: 'Blowout Preventers (BOP)',
        category: 'blowout-preventers',
        children: [
          {
            label: 'Annular BOPs',
            category: 'bop-annular',
          },
          {
            label: 'Ram BOPs',
            category: 'bop-ram',
          },
          {
            label: 'Ram Blocks & Assemblies',
            category: 'bop-ram-blocks',
          },
          {
            label: 'Diverter Systems',
            category: 'bop-diverters',
          },
          {
            label: 'Spools, DSAs & Adapter Flanges',
            category: 'bop-spools-adapters',
          },
          {
            label: 'Control Units & Accumulators',
            category: 'bop-control-units',
          },
          {
            label: 'Choke & Kill Manifolds & Valves',
            category: 'bop-choke-kill',
          },
          {
            label: 'Spare Parts & Elastomers',
            category: 'bop-spare-parts',
          },
        ],
      },
    ],
  },
  {
    label: 'Well Services & Surface Equipment',
    url: '/c',
    children: [
      {
        label: 'Cementing',
        category: 'cementing-equipment',
        children: [
          {
            label: 'Cementing Units',
            category: 'cementing-units',
          },
          {
            label: 'Batch Mixers (Cement)',
            category: 'cementing-batch-mixer',
          },
          {
            label: 'On-The-Fly Mixers',
            category: 'cementing-on-the-fly-mixer',
          },
          {
            label: 'Cement Silos',
            category: 'cementing-silos',
          },
          {
            label: 'Cutting Bottles',
            category: 'cementing-cutting-bottle',
          },
          {
            label: 'Dust Collectors',
            category: 'cementing-dust-collector',
          },
          {
            label: 'Rock Catchers',
            category: 'cementing-rock-catcher',
          },
        ],
      },
      {
        label: 'Stimulation',
        category: 'stimulation-equipment',
        children: [
          {
            label: 'Nitrogen (N₂) Pumping Units',
            category: 'stimulation-nitrogen-unit',
          },
          {
            label: 'Transfer Pumps (Stimulation)',
            category: 'stimulation-transfer-pump',
          },
          {
            label: 'Acid Tanks',
            category: 'stimulation-acid-tanks',
          },
          {
            label: 'Stimulation Batch Mixers',
            category: 'stimulation-batch-mixers',
          },
          {
            label: 'Stimulation Pumping Units',
            category: 'stimulation-pumping-units',
          },
        ],
      },
      {
        label: 'Fracturing',
        category: 'fracturing-equipment',
        children: [
          {
            label: 'Frac Pumpers',
            category: 'frac-pumpers',
          },
          {
            label: 'Frac Transfer Pumps',
            category: 'frac-transfer-pumps',
          },
          {
            label: 'Frac Manifolds / Missiles',
            category: 'frac-manifold',
          },
          {
            label: 'Frac Sand Silos / Sand Chief',
            category: 'frac-sand-silos',
          },
          {
            label: 'Frac Blenders (MFR Series)',
            category: 'frac-blender',
          },
          {
            label: 'Frac Hydration Units',
            category: 'frac-hydration-unit',
          },
          {
            label: 'Frac LAS (Liquid Additive System)',
            category: 'frac-las',
          },
          {
            label: 'Frac Data Vans',
            category: 'frac-data-van',
          },
          {
            label: 'Frac Tanks',
            category: 'frac-tanks',
          },
        ],
      },
      {
        label: 'Well Testing',
        category: 'well-testing-equipment',
        children: [
          {
            label: '3-Phase Separators',
            category: 'wt-3-phase-separator',
          },
          {
            label: 'MPFM Systems',
            category: 'wt-mpfm-system',
          },
          {
            label: 'Surge Tanks',
            category: 'wt-surge-tank',
          },
          {
            label: 'Knock Out Drums',
            category: 'wt-knock-out-drum',
          },
          {
            label: 'Flare Stacks',
            category: 'wt-flare-stack',
          },
          {
            label: 'Transfer Pumps (Well Testing)',
            category: 'wt-transfer-pump',
          },
          {
            label: 'Backside Flush / Test Pumps',
            category: 'wt-flush-test-pump',
          },
          {
            label: 'Sand Filters',
            category: 'wt-sand-filter',
          },
          {
            label: 'ESD Panels',
            category: 'wt-esd-panel',
          },
          {
            label: 'Data Headers',
            category: 'wt-data-header',
          },
          {
            label: 'Piping Packages (Well Testing + EPF)',
            category: 'wt-piping-packages',
          },
        ],
      },
      {
        label: 'Drilling & Workover',
        category: 'drilling-workover-systems',
        children: [
          {
            label: 'Mud Pump Packages',
            category: 'dw-mud-pump-package',
          },
          {
            label: 'Mud Manifolds',
            category: 'dw-mud-manifolds',
          },
          {
            label: 'Mud Degassers',
            category: 'dw-mud-degasser',
          },
          {
            label: 'Mud Tanks',
            category: 'dw-mud-tanks',
          },
          {
            label: 'Workover Tanks',
            category: 'dw-workover-tanks',
          },
          {
            label: 'Liquid Mud Plants (LMP)',
            category: 'dw-liquid-mud-plant',
          },
          {
            label: 'Mobile Labs & Workshops',
            category: 'dw-mobile-labs-workshops',
          },
        ],
      },
    ],
  },
  {
    label: 'Instrumentation, Lubricants & Consumables',
    url: '/c',
    children: [
      {
        label: 'Lubricants (Molykote)',
        category: 'lubricants',
        children: [
          {
            label: 'Greases',
            category: 'molykote-greases',
          },
          {
            label: 'Pastes',
            category: 'molykote-pastes',
          },
          {
            label: 'Compounds',
            category: 'molykote-compounds',
          },
          {
            label: 'Anti-Friction Coatings',
            category: 'molykote-anti-friction-coatings',
          },
          {
            label: 'Oils & Fluids',
            category: 'molykote-oils',
          },
          {
            label: 'Dispersions',
            category: 'molykote-dispersions',
          },
        ],
      },
      {
        label: 'Instrumentation & Controls',
        category: 'instrumentation-controls',
        children: [
          {
            label: 'Data Acquisition Systems',
            category: 'ic-data-acquisition',
          },
          {
            label: 'Magnetic Flowmeters',
            category: 'ic-magnetic-flowmeters',
          },
          {
            label: 'Turbine Flowmeters',
            category: 'ic-turbine-flowmeters',
          },
          {
            label: 'Coriolis Mass Flowmeters (NRD)',
            category: 'ic-coriolis-nrd',
          },
          {
            label: 'Analogic Pressure Sensors',
            category: 'ic-analogic-pressure-sensors',
          },
          {
            label: 'Electronic Pressure Sensors',
            category: 'ic-electronic-pressure-sensors',
          },
          {
            label: 'Proximity Sensors',
            category: 'ic-proximity-sensors',
          },
          {
            label: 'HP Pressure Gauges',
            category: 'ic-pressure-gauges',
          },
          {
            label: 'Thermometers & Thermowells',
            category: 'ic-thermometers-thermowells',
          },
          {
            label: 'AC/DC Converters',
            category: 'ic-acdc-converters',
          },
          {
            label: 'VFD Systems',
            category: 'ic-vfd-systems',
          },
          {
            label: 'Explosion-Proof Electrical Panels',
            category: 'ic-electrical-panels',
          },
        ],
      },
    ],
  },
]
