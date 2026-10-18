/**
 * Shelf copy for the hose categories — Pages & Blocks `category/<slug>`.
 *
 * On 2026-10-05 every one of the 90 hose categories carried a ~24-word blurb
 * and nothing else: no buying guidance, no standards, no FAQ — while the 43
 * lifting categories had all three. These are the 22 hose shelves with the most
 * products or the most search demand.
 *
 * Rules the copy follows (the same as the lifting shelves'):
 *   - Standards are only the ones the catalogue's own listings cite, and only
 *     what each standard covers. No pressure figures: those live in the size
 *     tables, per size, and a shelf-wide number would be wrong for most of it.
 *   - Claims about what we do are the ones the site already makes (assemblies
 *     cut, crimped, pressure-tested and tagged in Dubai).
 *   - Bodies stay under the 700-character field limit; paragraphs split on a
 *     blank line, which is how the band renders them.
 */

export type CategoryCopy = {
  guidance?: { heading: string; body: string }
  standards?: { heading: string; body: string }
  service?: { heading: string; body: string }
  faq?: Array<{ q: string; a: string }>
}

export const CATEGORY_COPY: Record<string, CategoryCopy> = {
  'hydraulic-hose-fittings-suppliers-uae': {
    guidance: {
      heading: 'Start from the hose, then the two ends',
      body: 'A hose assembly is three decisions. The hose comes first: its construction standard sets the pressure it carries and the ferrule it takes. Then each end: the thread family and seat of the port it meets, which is a question of identification rather than preference. Adapters cover the case where the two disagree.\n\nThis shelf is grouped the same way — hose by construction, fittings by thread family, adapters by the pair of forms they join. Replacing a failed assembly? Send the layline printing and a photo of each end, and we will name all three parts.',
    },
    standards: {
      heading: 'Built to the standards on the layline and the port',
      body: 'Wire-braid hose is built to EN 853 (1SN, 2SN), compact braid to EN 857 (1SC, 2SC), spiral hose to EN 856 (4SP, 4SH, R12, R13), and SAE J517 covers the 100R series. The ends follow their connection standards: 24° cone ISO 8434-1 (formerly DIN 2353), 37° flare SAE J514 / ISO 8434-2, O-ring face seal SAE J1453 / ISO 8434-3, BSP threads ISO 228-1 and four-bolt flanges SAE J518. An assembly is rated to its lowest-rated component — the hose or either end.',
    },
    faq: [
      {
        q: 'Can you make up an assembly to match one that failed?',
        a: 'Yes. Send the layline printing from the hose, a photo of each end square-on and one straight down the bore, and the length between the sealing faces. From that we identify the hose, both fittings and the ferrule, and make the assembly up to the same specification.',
      },
      {
        q: 'Do you supply hose and fittings separately for crimping on site?',
        a: 'Yes — bulk hose, crimp fittings and ferrules are listed separately. Order the fitting and ferrule for the exact hose construction you are crimping: a ferrule made for one construction will not hold correctly on another.',
      },
      {
        q: 'What decides an assembly’s pressure rating?',
        a: 'Its lowest-rated component. The hose has a working pressure from its construction standard, and each fitting and adapter has its own. A tapered NPT end, for example, can sit well below the rating of the hose it is crimped onto.',
      },
      {
        q: 'Do you ship outside the UAE?',
        a: 'Yes — from Dubai across the GCC and to export markets further afield. Each export market has its own page on this site setting out the lane and the documents involved.',
      },
    ],
  },

  'industrial-hose-suppliers-uae': {
    guidance: {
      heading: 'Choose by the medium, then the coupling',
      body: 'Industrial hose is specified by what flows through it. Water, air, oil and fuel, chemicals, steam, food and abrasive slurry each need a different tube compound and construction, and suction service needs a helix that stops the hose collapsing. Pressure and temperature narrow the choice from there.\n\nThe coupling is the second decision, and often one made in advance — the site already runs cam and groove, Storz, Bauer, Guillemin or steam couplings. Tell us the medium, bore, working pressure, temperature and what each end connects to.',
    },
    standards: {
      heading: 'Coupling standards on this shelf',
      body: 'Cam and groove couplings are made to A-A-59326, which replaced MIL-C-27487, and to EN 14420-7. Safety clamps for steam hose couplings follow EN 14420-3 / DIN 2817, and clamp couplings for steam hose EN 14423. Storz couplings are listed to DIN 14301, including UL-listed fire department connections. Corrugated metal hose assemblies are built to ISO 10380.',
    },
    faq: [
      {
        q: 'What do you need to quote an industrial hose?',
        a: 'The medium (with its concentration and temperature for chemicals), the bore, the working pressure, whether it runs under suction, the length, and the coupling on each end. For chemical service name the chemical — compatibility depends on the tube compound, not on how the hose looks.',
      },
      {
        q: 'Which coupling should a new installation use?',
        a: 'Usually the one already on site, so hoses stay interchangeable. Cam and groove is the general quick connect for low-to-medium-pressure transfer, Storz is common in fire service and dewatering, and steam lines need couplings and safety clamps made for steam.',
      },
      {
        q: 'Is a suction hose different from a delivery hose?',
        a: 'Yes. A suction hose carries a rigid helix of steel wire or plastic so it does not collapse under vacuum; a delivery hose relies on internal pressure to hold its shape and flattens under suction. A suction-and-delivery hose is built to do both.',
      },
    ],
  },

  'hydraulic-adapters': {
    guidance: {
      heading: 'Name both ends before anything else',
      body: 'An adapter is defined by the two connections it joins, and each end has a thread form, a size and a way of sealing — a 60° cone, a 37° flare, a 24° cone, an O-ring face, a bonded seal or a taper thread. Identify both ends of the gap first; the shape (straight, elbow, tee, bulkhead) follows from the space available.\n\nEvery adapter adds a joint, and every joint is a leak path. Where an assembly can carry the correct end directly, that is the better repair. Adapters earn their place where two thread families meet on one machine.',
    },
    standards: {
      heading: 'One standard per connection',
      body: 'Bite-type tube connections are ISO 8434-1 (formerly DIN 2353), 37° flare connections SAE J514 / ISO 8434-2 and O-ring face seal SAE J1453 / ISO 8434-3. Ports follow their own standards: BSP to ISO 228-1 and ISO 1179, metric to ISO 6149 and DIN 3852-2, SAE straight-thread O-ring ports to SAE J1926 / ISO 11926, and four-bolt flanges to SAE J518 / ISO 6162.',
    },
    faq: [
      {
        q: 'How do I tell BSP, JIC, ORFS and metric apart?',
        a: 'By the seat and the thread together. JIC seals on a 37° flare with a UN/UNF thread; ORFS seals on an O-ring in a flat face, also on a UN thread; BSP hydraulic ends usually seal on a 60° cone with a Whitworth-form thread; metric 24° cone ends seal on the cone. Measure the thread diameter and pitch, look at the seat, and send a photo if in doubt.',
      },
      {
        q: 'Is an adapter rated as high as the hose?',
        a: 'Not automatically. Each adapter has its own working pressure by size and form, and a tapered thread end in particular can be rated well below the hose. A circuit is limited by its lowest-rated component.',
      },
      {
        q: 'Do you stock adapters for Japanese machines?',
        a: 'Yes — JIS gas and JIS metric 60° cone adapters for Japanese-built machines, and metric adapters made to Komatsu’s specification.',
      },
    ],
  },

  'hydraulic-fittings': {
    guidance: {
      heading: 'A fitting belongs to the hose as much as to the port',
      body: 'A crimp fitting has two halves: the end that meets the port, identified by thread family and seat, and the tail that goes into the hose, which must match the hose construction. Braided hose (1SN, 2SN, R16, R17) takes one fitting body, spiral hose (4SP, R12) a heavier one, and the ferrule has to suit the hose as well.\n\nChoose the end by identifying the port — thread, size and seat — and the tail by the layline on the hose. Elbows and drop lengths come last, from the routing.',
    },
    standards: {
      heading: 'What the ends are made to',
      body: 'Hose fittings are covered by ISO 12151, a multi-part standard with a part for each connection type. The port ends follow their connection standards — 37° flare SAE J514, O-ring face seal SAE J1453, 24° cone ISO 8434-1, BSP ISO 228-1 and four-bolt flange SAE J518 (Code 61 and Code 62) — and the hoses they suit are built to EN 853 and EN 856.',
    },
    faq: [
      {
        q: 'What is the difference between braided-hose and spiral-hose fittings?',
        a: 'The tail. Spiral hose has four or six wire layers and a thicker wall, so its fittings use a heavier body and usually a skived ferrule that grips the wire directly. The port end can be identical; the hose end is not interchangeable.',
      },
      {
        q: 'Skive or no-skive?',
        a: 'Whichever the hose and fitting series are designed for. Skive ferrules need the outer cover — and sometimes the inner tube — removed so the ferrule grips the wire; no-skive ferrules crimp over the cover. Use the ferrule specified for the construction; the two are designed together.',
      },
      {
        q: 'How do I measure a hose fitting thread?',
        a: 'Measure across the crests of a male thread (or inside a female), measure the pitch — threads per inch, or millimetres between crests — and look at the seat: a 37° flare, a 24° or 60° cone, or a flat face with an O-ring. Diameter, pitch and seat together identify the family. Send them with a photo and we will confirm.',
      },
    ],
  },

  'hydraulic-hoses': {
    guidance: {
      heading: 'Read the layline, then match the construction',
      body: 'Every hydraulic hose carries its identity along its cover: the construction standard, the size and the working pressure. Replace like for like by construction — a 2SN with a 2SN, a 4SH with a 4SH — and the fittings and ferrules that suit it follow.\n\nWhere the layline has worn off, the bore, outside diameter and number of wire layers narrow it down. Pressure decides between braid and spiral: one- and two-braid hose for most mobile and industrial circuits, four- and six-spiral for high-pressure, high-impulse lines, and compact hose where the bend radius is tight.',
    },
    standards: {
      heading: 'EN 853, EN 856, EN 857 and SAE J517',
      body: 'EN 853 covers wire-braided hose (1SN, 2SN), EN 857 compact braided hose (1SC, 2SC) and EN 856 spiral hose (4SP, 4SH, R12, R13). SAE J517 is the American family — the 100R series — which also takes in textile hose (R3, R6), PTFE hose (R14) and higher-pressure spiral constructions such as R15. Each standard sets a hose’s minimum burst pressure at four times its maximum working pressure.',
    },
    service: {
      heading: 'Cut, crimped and tested in Dubai',
      body: 'We cut hose to length, crimp the fittings and ferrules matched to its construction, and pressure-test finished assemblies before they ship, each one tagged with the hose, the fittings and the test date. Bulk hose is also supplied for crimping on site, with the matching fittings and ferrules.',
    },
    faq: [
      {
        q: 'What is the difference between 1SN and 2SN?',
        a: 'One wire braid against two. For the same bore, 2SN carries a higher working pressure and has a larger outside diameter. Both are EN 853 constructions and take braided-hose fittings; confirm the ferrule against the construction you have.',
      },
      {
        q: 'What do R12, R13 and R15 mean?',
        a: 'They are SAE J517 spiral constructions for high-pressure, high-impulse service. R12 and R13 also appear in EN 856, and R15 is the highest-pressure spiral construction in the family. Each has its own fittings and ferrules.',
      },
      {
        q: 'Do you test the assemblies you make?',
        a: 'Yes. Finished assemblies are pressure-tested before despatch and tagged, and a test certificate can be supplied on request.',
      },
    ],
  },

  'metallic-hose-suppliers-uae': {
    guidance: {
      heading: 'Metal hose for what rubber cannot take',
      body: 'Corrugated metal hose is chosen where temperature, permeation, fire or the medium rules out rubber and thermoplastic: steam, hot oil, cryogenic liquids, industrial gases and aggressive chemicals. Annular corrugated hose suits most process duties, and a stainless braid over it carries the pressure.\n\nSpecify the medium, pressure, temperature, bore, length and end connections, and whether the hose moves in service. Movement matters as much as pressure: metal hose lasts when it flexes in one plane and fails early when it is twisted.',
    },
    standards: {
      heading: 'ISO 10380 and the material certificates',
      body: 'Corrugated metal hose and hose assemblies are built to ISO 10380, with EN 10204 material certificates available. Listings offered for sour service state NACE MR0175 / ISO 15156 compliance where it applies.',
    },
    faq: [
      {
        q: 'Why do metal hoses fail early?',
        a: 'Usually from torsion, or from flexing in more than one plane. Install a metal hose without twist, flex it in a single plane and keep it within its minimum bend radius. A hose twisted during installation, or asked to absorb movement in two directions, fatigues far faster than its pressure rating suggests.',
      },
      {
        q: 'Do you supply PTFE hose as well?',
        a: 'Yes — smoothbore and convoluted PTFE hose with stainless or polypropylene braid, for chemical transfer and high temperatures where a metal hose is not needed.',
      },
      {
        q: 'What end connections are available?',
        a: 'Flanges, threaded ends and couplings fitted to suit the line, including ANSI Class 150 flanged assemblies. Tell us the mating connection and we will confirm the build.',
      },
    ],
  },

  'oil-gas-hoses': {
    guidance: {
      heading: 'Rated for the duty, not just the pressure',
      body: 'Oilfield hose is selected by service: rotary and vibrator hose on the drill floor, choke and kill lines and BOP control hose for well control, frac and stimulation hose for well service, and tensioner and compensator hose offshore. Each duty has its own API specification, and the assembly is certified as a whole.\n\nSend the service, working pressure, temperature, fluid (including H2S content), bore, length and end connections. For well-control and sour service the documentation travels with the hose, so ask for it at quotation.',
    },
    standards: {
      heading: 'API 7K, API 16C, API 16D and API 17J',
      body: 'Rotary drilling and vibrator hose is covered by API 7K, choke and kill equipment by API 16C and unbonded flexible pipe by API 17J. BOP control hose is built for API 16D control systems, and fire resistance is tested to ISO 15540. End connections commonly follow API 6A.',
    },
    faq: [
      {
        q: 'What documentation comes with a well-control hose?',
        a: 'The certification its API specification requires, including the hydrostatic test record for the assembly, plus material certificates where the order calls for them. State your operator’s documentation requirements at quotation so they are prepared with the hose rather than after it.',
      },
      {
        q: 'Can these hoses be used in sour service?',
        a: 'Some can. Suitability depends on the construction, the liner and the fluid, so it is confirmed against your H2S partial pressure, temperature and pressure cycle rather than assumed. The drilling range includes a rotary and vibrator hose built for high-temperature sour service.',
      },
      {
        q: 'Which brands are on this shelf?',
        a: 'Continental ContiTech and Manuli oilfield hose.',
      },
    ],
  },

  'braided-hose-crimp-fittings': {
    guidance: {
      heading: 'For one- and two-braid hose',
      body: 'These fittings suit wire-braided hose: EN 853 1SN and 2SN, and SAE 100R1AT, 100R2AT, 100R16 and 100R17. Pick the port end by identifying the thread family and seat — BSP 60° cone, DIN light or heavy 24° cone, JIC 37°, ORFS and the rest — then the size from the hose bore. Elbows come in 45° and 90°.\n\nEach listing carries a full size table and the Parker series it replaces, so a Parker part number crosses straight to ours. Spiral hose (4SP, R12) needs the spiral-hose range instead.',
    },
    standards: {
      heading: 'EN 853 and the connection standards',
      body: 'The tails are made for EN 853 wire-braided hose and its SAE J517 equivalents. The port ends follow their connection standards: 24° cone to ISO 8434-1 (the DIN 2353 light and heavy series), 37° flare to SAE J514, O-ring face seal to SAE J1453 and BSP to ISO 228-1.',
    },
    faq: [
      {
        q: 'Do these fittings need a separate ferrule?',
        a: 'No — they are one-piece crimp fittings with the ferrule attached. Crimp them to the diameter specified for the hose and fitting together, on a crimper with the matching dies.',
      },
      {
        q: 'Which hose constructions do they suit?',
        a: 'EN 853 1SN and 2SN, and SAE 100R1AT, 100R2AT, 100R16 and 100R17. For four- or six-spiral hose use the spiral-hose range: the tails are not interchangeable.',
      },
      {
        q: 'How do I cross a Parker part number?',
        a: 'Each listing names the Parker series it replaces, and its size table gives our part number for every size. Send the Parker number if you have it and we will confirm the match.',
      },
    ],
  },

  'spiral-hose-crimp-fittings': {
    guidance: {
      heading: 'The heavier body for spiral hose',
      body: 'These fittings suit four- and six-spiral hose — EN 856 4SP and SAE 100R12 — where the wall is thicker and the impulse loads higher than braided hose can take. The port ends match the braided range: BSP 60° cone, DIN light and heavy 24° cone, JIC 37°, ORFS and more, straight and in 45° and 90° elbows.\n\nChoose by identifying the port end and reading the hose layline. A braided-hose fitting will not hold on spiral hose: the two ranges share port ends, not tails.',
    },
    standards: {
      heading: 'EN 856 and the connection standards',
      body: 'The tails are made for EN 856 spiral hose and SAE 100R12. The port ends follow their connection standards: 24° cone to ISO 8434-1, 37° flare to SAE J514, O-ring face seal to SAE J1453 and BSP to ISO 228-1.',
    },
    faq: [
      {
        q: 'Can I use these on 4SH or R13 hose?',
        a: 'They are listed for 4SP and R12. 4SH, R13 and R15 are higher-pressure constructions with their own fittings and ferrules — tell us the hose and we will confirm the correct series.',
      },
      {
        q: 'Why are spiral-hose fittings heavier?',
        a: 'Spiral hose carries higher pressures and impulse loads, and its thicker wall and wire layers need a longer, stronger grip. The heavier body and its crimp are designed for that construction.',
      },
      {
        q: 'Are these one-piece fittings?',
        a: 'Yes. Crimp them to the diameter specified for the hose and fitting, with the matching dies.',
      },
    ],
  },

  'quick-couplers': {
    guidance: {
      heading: 'Match the interchange before the size',
      body: 'A quick coupler only connects to its own interchange. ISO 7241 Series A is the agricultural pattern (with ISO 5675 on tractors), Series B the general industrial one, and ISO 16028 the flush-face pattern that keeps dirt out and spills less on disconnection. Hydraulic tools, high-pressure jacks, air lines and test points each have interchanges of their own.\n\nIdentify the half you are mating to, then choose the size from the flow and working pressure. Flush-face couplers suit dirty field work; valved couplers seal both halves when disconnected.',
    },
    standards: {
      heading: 'ISO 7241, ISO 16028 and ISO 5675',
      body: 'ISO 7241 defines Series A and Series B quick-action couplings, ISO 16028 flush-face couplings and ISO 5675 agricultural tractor couplings. The range also covers the HTMA tool interchange (NFPA T3.20.15), MIL-C-4109 industrial air couplers and ARO 210 air couplers.',
    },
    faq: [
      {
        q: 'Will an ISO 7241 Series A coupler connect to Series B?',
        a: 'No. Series A and Series B are different interchanges with different dimensions; a coupler connects only to a mating half of the same series and size.',
      },
      {
        q: 'When should I use a flush-face coupler?',
        a: 'Where dirt and spills matter: construction attachments, mobile machinery and anywhere the coupler is connected in the field. The flat faces wipe clean before connection and trap very little oil when disconnected.',
      },
      {
        q: 'Can a coupler be connected under pressure?',
        a: 'Only one designed for it. Standard couplers should be connected with both sides depressurised; connect-under-pressure designs, such as the farm coupler on this shelf, are made to connect against residual pressure.',
      },
    ],
  },

  'storz-couplings': {
    guidance: {
      heading: 'Symmetrical, so either half connects to either',
      body: 'A Storz coupling has no male or female half: two identical heads lock together with a twist, which is why fire services and dewatering crews use it. Couplings are sized by the head, and heads of the same size connect whatever hose or thread sits behind them.\n\nChoose the head size first, then what goes behind it: a long shank for hose, a male or female thread adapter, a 30° elbow, or a reducer between two head sizes. Aluminium, brass and stainless versions are listed.',
    },
    standards: {
      heading: 'DIN 14301 and UL-listed connections',
      body: 'The couplings are listed to DIN 14301 in sizes from 25 to 150 mm. The fire department connections on this shelf are UL listed, in painted and hard-anodised finishes.',
    },
    faq: [
      {
        q: 'Do Storz couplings need a gasket?',
        a: 'Yes — the seal is a gasket in each head, and suction service uses a different gasket from pressure service. Both are on this shelf. Replace a hardened or cracked gasket rather than forcing the heads tighter.',
      },
      {
        q: 'Can two different Storz sizes connect?',
        a: 'Not directly. A head connects only to a head of the same size; a reducer joins two sizes.',
      },
      {
        q: 'What is an FDC?',
        a: 'A fire department connection — the inlet on a building’s fire-protection system where fire service hose connects. The Storz FDCs here are UL listed.',
      },
    ],
  },

  'cam-and-groove-couplings': {
    guidance: {
      heading: 'Read the type letter',
      body: 'Every cam and groove part is named by a letter. Type A is a male adapter with a female thread, B a female coupler with a male thread, C a female coupler with a hose shank, D a female coupler with a female thread, E a male adapter with a hose shank and F a male adapter with a male thread. DC and DP are the dust cap and plug.\n\nChoose the size from the hose or pipe, the material from the medium, and the type from what each side connects to. Self-locking arms stop the cams opening by accident.',
    },
    standards: {
      heading: 'A-A-59326 and EN 14420-7',
      body: 'Cam and groove couplings are made to A-A-59326, which replaced MIL-C-27487, and to EN 14420-7, formerly DIN 2828. Parts made to the same standard and size interchange between manufacturers; couplings made to different standards may not.',
    },
    faq: [
      {
        q: 'Are cam and groove couplings suitable for high pressure?',
        a: 'They are built for low-to-medium-pressure transfer, and the rating falls as the size rises. Check the working pressure of the size and material you need against the line; for high-pressure hydraulics use threaded or flanged connections instead.',
      },
      {
        q: 'What does self-locking add?',
        a: 'Cam arms that lock closed, so vibration or a snagged handle cannot open them. They suit transfer lines that are dragged or vibrate, and anywhere an uncoupling would spill.',
      },
      {
        q: 'What is CrimpTEK?',
        a: 'A cam and groove coupling with a crimp shank in place of a barbed hose shank. It is crimped onto the hose for retention instead of being clamped.',
      },
    ],
  },

  'crimp-ferrules': {
    guidance: {
      heading: 'One ferrule per hose construction',
      body: 'A ferrule is matched to the hose it crimps onto: the construction (1SN, 2SN, 4SP, 4SH, R12, R13 and the rest), the bore, and whether the hose is skived. Skive ferrules grip the wire once the cover is removed; no-skive ferrules crimp straight over the cover. Choose by the hose layline, then the fitting series it pairs with.\n\nA ferrule from another construction is the most common way a crimp looks right and fails under pressure.',
    },
    standards: {
      heading: 'Qualified as part of the assembly',
      body: 'The ferrules suit hose built to EN 853, EN 856, EN 857 and SAE J517, with fittings to ISO 12151. Assembly performance is proven by impulse testing to ISO 6803 and the test methods of SAE J343 — a crimp is qualified as hose, ferrule and fitting together, never as a ferrule alone.',
    },
    faq: [
      {
        q: 'Skive or no-skive — which do I need?',
        a: 'The one specified for your hose and fitting series. No-skive ferrules are quicker to assemble because the cover stays on; skive ferrules, common on spiral hose, need the cover removed to the marked length. They are not interchangeable.',
      },
      {
        q: 'Do you have ferrules for Chinese-made hose?',
        a: 'Yes — skive ferrules for Chinese one-, two- and three-wire hose, which does not always match the dimensions of EN or SAE constructions.',
      },
      {
        q: 'Is there a ferrule for automotive A/C hose?',
        a: 'Yes — a no-skive ferrule for SAE J2064 automotive air-conditioning hose.',
      },
    ],
  },

  'bsp-hydraulic-adapters-uae': {
    guidance: {
      heading: 'Parallel or taper decides how it seals',
      body: 'BSP comes in two forms. BSPP (parallel) seals on something other than the thread — a 60° cone, a bonded seal or an ED seal against a flat face. BSPT (taper) seals on the thread itself. They share pitch and diameter, so they screw together, but a taper in a parallel port will not seal reliably.\n\nIdentify each end — male or female, parallel or taper, and the seal — and the shape (straight, elbow, tee, cross, bulkhead or plug) follows from the routing.',
    },
    standards: {
      heading: 'ISO 228-1 and ISO 7-1',
      body: 'Parallel BSP threads follow ISO 228-1 and taper threads ISO 7-1. Ports with parallel threads, and the stud ends that fit them, are covered by ISO 1179.',
    },
    faq: [
      {
        q: 'Can I use a BSPT fitting in a BSPP port?',
        a: 'It will engage but it will not seal reliably: a parallel port is sealed by a cone, a bonded seal or an O-ring, not by thread interference. Use a parallel male with the correct seal for the port.',
      },
      {
        q: 'What is a bonded seal?',
        a: 'A steel washer with a moulded rubber lip — often called a Dowty washer — that seals a parallel thread against a flat face.',
      },
      {
        q: 'What is an ED seal?',
        a: 'An elastomer seal carried in the stud end of the adapter, which seals against the port face and removes the need for a separate washer.',
      },
    ],
  },

  'din-2353-bite-type-adapters-uae': {
    guidance: {
      heading: 'Tube OD and series, then the shape',
      body: 'A bite-type fitting grips steel tube with a hardened cutting ring that bites into the tube as the nut is tightened, and seals on a 24° cone. It is sized by tube outside diameter, and each size comes in a light (L) and a heavy (S) series that do not interchange.\n\nMeasure the tube OD, establish the series from the existing nut or the system pressure, then choose the body — straight, elbow, tee, bulkhead, adjustable stud end or plug. Pre-set the ring with the proper tool where you can: a badly set ring is a common cause of a weeping joint.',
    },
    standards: {
      heading: 'ISO 8434-1, formerly DIN 2353',
      body: 'Bite-type 24° cone fittings were standardised as DIN 2353 and are now covered by ISO 8434-1, which defines the light (L) and heavy (S) series. Adjustable stud ends follow the port standards ISO 6149 and DIN 3852.',
    },
    faq: [
      {
        q: 'Can I mix L and S series parts?',
        a: 'No. For the same tube size the two series use different nut threads, and their pressure ratings differ. Identify the series from the existing parts before ordering.',
      },
      {
        q: 'Do I need a new cutting ring when I remake a joint?',
        a: 'A ring that has already bitten can be remade on the same tube end, but it should never be moved to a different tube. When the tube is cut back, fit a new ring.',
      },
      {
        q: 'Do you supply blanking plugs?',
        a: 'Yes — blanking plugs for cones, plugs for ports with ED seals, and plugs with nuts.',
      },
    ],
  },

  'metric-adapters': {
    guidance: {
      heading: 'Metric threads come with different seats',
      body: 'A metric thread alone does not identify a fitting: the same M-size can carry a 24° cone, a 60° cone (JIS), a 74° cone, a flat face or an O-ring. Measure diameter and pitch — M10×1 to M42×2 on this shelf — then look at the seat before choosing.\n\nPort-side ends seal with an O-ring (ISO 6149) or with a seal against the port face (DIN 3852). Japanese-built machines often use JIS metric 60° cone ends, and Komatsu-specification adapters are stocked.',
    },
    standards: {
      heading: 'ISO 6149 and DIN 3852',
      body: 'Metric ports sealed by an O-ring in a truncated housing follow ISO 6149, and ports sealed at the face follow DIN 3852. 24° cone ends are covered by ISO 8434-1.',
    },
    faq: [
      {
        q: 'How do I tell an ISO 6149 port from a DIN 3852 port?',
        a: 'An ISO 6149 port has a raised identification ring on its spot-face and seals on an O-ring in a truncated housing. A DIN 3852 port is a plain spot-face sealed by a bonded or elastomer seal on the stud end.',
      },
      {
        q: 'Are JIS metric and DIN metric ends interchangeable?',
        a: 'No. JIS metric ends seal on a 60° cone and DIN metric ends on a 24° cone; the threads can look alike, but the seats are different.',
      },
      {
        q: 'Do you stock Komatsu adapters?',
        a: 'Yes — metric adapters made to Komatsu’s specification sit on this shelf alongside the standard ranges.',
      },
    ],
  },

  'jic-adapters': {
    guidance: {
      heading: '37° flare on a UN thread',
      body: 'JIC adapters seal metal to metal on a 37° flare — a 74° included angle, which is why the male cone is sometimes listed as 74°. The thread is UN/UNF, sized in sixteenths of an inch by dash number, and JIC is the common line connection on North American machinery.\n\nIdentify the other end — JIC, NPT, BSPT, metric, SAE O-ring boss or flange — then the shape: straight, elbow, tee, swivel or bulkhead. Do not confuse JIC with SAE 45° flare: the threads match on some sizes, the seats do not.',
    },
    standards: {
      heading: 'SAE J514 and ISO 8434-2',
      body: '37° flared connections are defined by SAE J514 and ISO 8434-2. Straight-thread O-ring port ends follow SAE J1926 / ISO 11926.',
    },
    faq: [
      {
        q: 'What does the dash size mean?',
        a: 'The nominal size in sixteenths of an inch: a -08 is 8/16, or 1/2 inch nominal. On a JIC end it identifies the thread — a -08 is 3/4-16 UNF — rather than the bore exactly.',
      },
      {
        q: 'Can I tighten a JIC joint harder to stop a leak?',
        a: 'No. The seal is the flare, and over-tightening damages it. Make the joint up by flats from finger tight, and if a correctly made joint still weeps, inspect the flare for scratches or distortion.',
      },
      {
        q: 'Is JIC the same as SAE 45° flare?',
        a: 'No. They share threads on several sizes, but JIC seals on a 37° flare and SAE 45° on a 45° flare. A joint mixing the two may hold briefly, then leak.',
      },
    ],
  },

  'orfs-adapters': {
    guidance: {
      heading: 'A flat face and an O-ring',
      body: 'ORFS adapters seal on an O-ring held in a groove in the male face, pressed flat against the female. That makes them the connection of choice where vibration and pressure spikes loosen metal-to-metal seats. The thread is UN/UNF, in sizes -04 to -16 on this shelf.\n\nIdentify the other end — ORFS, BSP, metric, SAE O-ring boss or NPT — then the shape. Replace the face O-ring every time the joint is remade: the seal is the O-ring, not the thread.',
    },
    standards: {
      heading: 'SAE J1453 and ISO 8434-3',
      body: 'O-ring face seal connections are defined by SAE J1453 and ISO 8434-3. Port-side O-ring boss ends follow SAE J1926 / ISO 11926.',
    },
    faq: [
      {
        q: 'Does an ORFS joint need sealant or tape?',
        a: 'No — it seals on the face O-ring. Sealant on the thread or the face can stop the O-ring seating, and it contaminates the system.',
      },
      {
        q: 'Which O-ring does an ORFS fitting use?',
        a: 'A face O-ring sized for the fitting’s dash size, usually nitrile for mineral oil. Use the size specified for the fitting: one too thick or too thin will not seal.',
      },
      {
        q: 'Why choose ORFS over JIC?',
        a: 'ORFS tolerates vibration better because the seal is an elastomer rather than a metal seat. JIC is simpler and has no O-ring to replace. Most machines use one or the other; match what is fitted.',
      },
    ],
  },

  'hose-clamps-sleeves-ferrules': {
    guidance: {
      heading: 'Retention matched to the hose and the duty',
      body: 'What holds a coupling on an industrial hose depends on the pressure and the medium. Bolt clamps suit general water and air service, heavier clamps and segment clamps higher-duty lines, and steam hose needs safety clamps made for steam couplings. Crimp sleeves and ferrules give a permanent, even grip where the coupling is crimped rather than clamped.\n\nMatch the clamp to the hose outside diameter and the coupling shank. On steam, use only clamps made for steam couplings.',
    },
    standards: {
      heading: 'EN 14420-3, DIN 2817 and EN 14423',
      body: 'Safety clamps for steam hose couplings are made to EN 14420-3 / DIN 2817, and clamp couplings for steam hose to EN 14423. Sanitary clamps are listed for food and hygienic lines.',
    },
    faq: [
      {
        q: 'Can I use a worm-drive clamp on steam hose?',
        a: 'No. Steam hose needs couplings and safety clamps designed for steam, because the hose and coupling expand in service and a release is dangerous. Use the steam clamps here with steam couplings.',
      },
      {
        q: 'What is a ferrule for KC and camlock?',
        a: 'A sleeve crimped or swaged over the hose on a KC or cam and groove hose shank, giving an even, permanent grip in place of a clamp.',
      },
      {
        q: 'Which clamps suit drag hose?',
        a: 'The drag hose clamps, coupling ring clamps and aluminium sleeves on this shelf are made for the large-bore drag hose used in slurry and irrigation transfer.',
      },
    ],
  },

  'universal-air-couplings': {
    guidance: {
      heading: 'Universal heads, three patterns',
      body: 'Universal (claw or Chicago-style) couplings lock with lugs and a twist, and every head of the same pattern connects to every other, whatever hose size sits behind it. That is why they are standard on compressor and air-tool lines on construction sites.\n\nThe three patterns — American, European and Australian — are made to different dimensions, so match the pattern already in use. Choose hose ends, male or female thread ends, blank ends or three-way heads, and fit a whip check across every connection.',
    },
    faq: [
      {
        q: 'What is a whip check for?',
        a: 'It is a steel cable looped over both sides of a coupling, or over the hose and the tool, so that if the coupling separates under pressure the hose cannot whip. Fit one at every coupling on a compressed-air line.',
      },
      {
        q: 'Do universal couplings need a gasket?',
        a: 'Yes — the seal is a gasket in the head. A worn or missing gasket is the usual cause of a leaking universal coupling, and gaskets are on this shelf.',
      },
      {
        q: 'Will a universal coupling connect to a different hose size?',
        a: 'Yes, within the same pattern: the heads are identical across hose sizes, which is the point of the design. The hose end and its clamp are what change with the bore.',
      },
    ],
  },

  'stainless-steel-hydraulic-fittings': {
    guidance: {
      heading: 'Where carbon steel will not last',
      body: 'SS316L fittings are for washdown, offshore, chemical handling and coastal plant, where plated carbon steel corrodes. The range mirrors the carbon-steel families — BSP, JIC 37°, ORFS, metric, NPT/NPSM and SAE flanges — plus banjos, standpipes and hydrowashing couplings.\n\nMatch materials through the joint: a single stainless fitting in a plated port moves the corrosion to the port rather than ending it. Where the whole system cannot change, decide deliberately which part is the sacrificial one.',
    },
    standards: {
      heading: 'The same connection standards, in 316L',
      body: 'The ends follow the same connection standards as their carbon-steel equivalents: SAE J518 / ISO 6162 for four-bolt flanges (Code 61 and Code 62), SAE J514 for 37° flare, SAE J1453 for O-ring face seal, ISO 8434-1 for 24° cone and ISO 228-1 for BSP.',
    },
    faq: [
      {
        q: 'Is 316L stainless rated as high as carbon steel?',
        a: 'Not always. A stainless fitting can carry a lower working pressure than a carbon-steel part of the same size and form, so check the rating on the listing against the line rather than assuming the carbon-steel figure.',
      },
      {
        q: 'Can stainless fittings be used with carbon-steel adapters?',
        a: 'They will connect, but in a wet or salty environment the joint becomes a galvanic cell and the less noble part corrodes faster. Match materials where the exposure is severe.',
      },
      {
        q: 'Do you supply material certificates?',
        a: 'Ask for EN 10204 material certificates at quotation if your order needs them, and we will confirm what is available for each item.',
      },
    ],
  },

  'well-control-hoses': {
    guidance: {
      heading: 'Certified as an assembly, for the rig it serves',
      body: 'Well-control hose covers choke and kill lines, BOP control hose and subsea conduit — the lines that have to hold when a well does not. Choose by duty first: choke and kill service at the rated working pressure, BOP control hose with fire protection, or flexible lines for subsea LMRP connections. Then the liner, which sets the temperature and fluid range; each listing states its limit.\n\nSend the rig, working pressure, temperature, fluid, bore, length and end connections, with the operator’s documentation requirements.',
    },
    standards: {
      heading: 'API 16C, API 16D, API 17J and ISO 15540',
      body: 'Choke and kill hose assemblies are built to API 16C, BOP control hose for API 16D control systems, and subsea LMRP and conduit hose to API 17J. Fire resistance is tested to ISO 15540, and end connections commonly follow API 6A.',
    },
    faq: [
      {
        q: 'What working pressure are the choke and kill assemblies rated for?',
        a: 'The API 16C choke and kill assemblies on this shelf are rated at 10,000 psi working pressure. Confirm the pressure class your rig needs at quotation.',
      },
      {
        q: 'Is the BOP control hose fire resistant?',
        a: 'Yes — the Fireshield BOP control hose is built for fire resistance, tested to ISO 15540, for API 16D control systems.',
      },
      {
        q: 'Which brands are on this shelf?',
        a: 'Continental ContiTech, including Tauroflon™-lined flexible choke and kill lines and Fireshield BOP control hose.',
      },
    ],
  },
}
