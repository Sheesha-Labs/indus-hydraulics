/**
 * Shelf copy, second batch — the remaining hose shelves with two or more
 * products (60 of the 68 left after the first 22).
 *
 * Not written: the seven single-product Manuli ferrule-series shelves and the
 * one-product Hose Nipples shelf. Copy on a one-product shelf restates its one
 * product page; those shelves are candidates for merging, not for words.
 *
 * Same rules as the first batch (see category-copy.ts): standards only where
 * the shelf's own listings cite them, and only what each standard covers; no
 * shelf-wide pressure figures; claims about our work limited to what the site
 * already says. Small shelves get a short guidance band and two FAQs rather
 * than padding.
 */
import type { CategoryCopy } from './category-copy'

export const CATEGORY_COPY_BATCH_2: Record<string, CategoryCopy> = {
  // ── Hydraulic fittings, adapters and flanges ──────────────────────────────

  ferrules: {
    guidance: {
      heading: 'Manuli ferrules, by part-reference series',
      body: 'These are Manuli hose ferrules, listed by the series reference printed in Manuli’s own catalogue — skive and no-skive, for wire-braid, wire-spiral, textile-braid and compact hose from DN5 to DN102. Each series suits particular Manuli hose constructions and fittings, and each listing gives the outside diameter and length for every reference.\n\nIf you are crimping Manuli hose, start from the hose and the fitting series and pick the ferrule they call for; the reference on an existing ferrule identifies it directly.',
    },
    faq: [
      {
        q: 'Can I use these ferrules on another make of hose?',
        a: 'Only where the hose and fitting system call for that ferrule. Ferrules are designed with a hose construction and a fitting series, and dimensions differ between makers. For other hose, use the ferrule specified for it — the general crimp-ferrule shelf lists them by construction.',
      },
      {
        q: 'How do I identify a Manuli ferrule?',
        a: 'By its part reference — the M-number in Manuli’s catalogue, such as M00310. Send the reference, or the hose layline and the fitting, and we will confirm the series and size.',
      },
    ],
  },

  'hydraulic-sae-flanges': {
    guidance: {
      heading: 'Flanges for SAE four-bolt connections',
      body: 'These flanges join pipe to an SAE four-bolt port: threaded (BSP or NPT), socket-weld and butt-weld backs, double flanges and blind flanges, with the O-rings and bolt sets that complete the joint. Code 61 and Code 62 are different patterns — Code 62 flanges are heavier, with different bolt spacing — so they do not interchange at the same nominal size.\n\nChoose the code from the port or the system pressure, the size from the pipe, and the back from how the pipe is joined.',
    },
    standards: {
      heading: 'SAE J518 four-bolt flanges',
      body: 'The flanges follow SAE J518 for Code 61 and Code 62 four-bolt connections; the international equivalents are ISO 6162-1 and ISO 6162-2. Bolts are specified by grade under SAE J429.',
    },
    faq: [
      {
        q: 'How do I tell a Code 61 flange from a Code 62?',
        a: 'Measure the bolt spacing and the flange thickness against the port. At the same nominal size, Code 62 uses wider bolt spacing and a thicker flange than Code 61. The port on the pump or valve decides which you need.',
      },
      {
        q: 'Does the O-ring need replacing when the flange is remade?',
        a: 'Yes. The joint seals on the O-ring in the flange face; fit a new one each time and tighten the bolts evenly in a cross pattern so the flange seats square.',
      },
    ],
  },

  'thermoplastic-hoses': {
    guidance: {
      heading: 'Lighter than rubber, with a tighter bend',
      body: 'SAE 100R7 and 100R8 are thermoplastic hoses with fibre-braid reinforcement and a polyurethane cover. They weigh less than rubber hose of the same bore, bend tighter and resist abrasion, which suits lightweight mobile equipment and routing in confined spaces. R8 carries a higher working pressure than R7.\n\nCrimp them with the ferrule made for R7/R8 thermoplastic hose — a rubber-hose ferrule does not suit the construction.',
    },
    faq: [
      {
        q: 'Can thermoplastic hose replace rubber hose?',
        a: 'Where the pressure, temperature and fluid suit it, yes — and it is lighter and bends tighter. Check the working pressure and temperature range on the listing against the circuit before substituting.',
      },
      {
        q: 'Which ferrule do R7 and R8 take?',
        a: 'A no-skive ferrule made for R7/R8 thermoplastic hose, listed on the crimp-ferrule shelf. Fittings and ferrules for rubber hose are not designed for this construction.',
      },
    ],
  },

  'bsp-hose-fittings': {
    guidance: {
      heading: 'Seat first: cone, flat face or multiseal',
      body: 'BSP hose fittings share a thread and differ in how they seal. The 60° cone is the common hydraulic form; flat-seat and multiseal females seal on a face; banjo bolts and eyes take bonded washers; and BSPT males seal on the taper thread itself. Identify the seat on the port before choosing — two ends with the same thread can still refuse to seal together.\n\nThen choose the shape (straight, 45°, 90°, compact elbow, double hex or bulkhead) from the routing, and the tail from the hose construction.',
    },
    standards: {
      heading: 'BS 5200, ISO 12151-6 and ISO 228',
      body: 'BSP 60° cone hose fittings follow BS 5200 and ISO 12151-6, on parallel threads to ISO 228-1. Taper male ends use the BSP taper thread (BS 21, now ISO 7-1), which seals on the thread.',
    },
    faq: [
      {
        q: 'What is a multiseal fitting?',
        a: 'A BSP female with a seal that works on either a 60° cone or a flat-faced male, which makes it useful where you cannot be sure which seat the port has.',
      },
      {
        q: 'Do banjo fittings need washers?',
        a: 'Yes — a banjo seals with a bonded washer each side of the eye. Fit new washers whenever the banjo is remade.',
      },
      {
        q: 'Is BSP the same as NPT?',
        a: 'No. BSP uses a 55° Whitworth thread form and NPT a 60° form, and the pitches differ in most sizes. They can start together and then cross-thread; they never seal reliably.',
      },
    ],
  },

  'din-hose-fittings': {
    guidance: {
      heading: 'Light or heavy series, then the cone',
      body: 'DIN hose fittings are the metric 24° cone family, in a light (L) and a heavy (S) series that do not interchange at the same size. The female swivel seals on the 24° cone — metal to metal, or with an O-ring in the cone — and the standpipe versions take a cutting ring and nut to join steel tube.\n\nIdentify the series from the existing nut and the system pressure, then the size from the tube or hose. The cutting rings and retaining nuts for the standpipe ends are on this shelf.',
    },
    standards: {
      heading: 'ISO 8434-1, DIN 3865 and ISO 12151-2',
      body: '24° cone connections follow ISO 8434-1 (formerly DIN 2353), with the O-ring cone form to DIN 3865. Cutting rings follow DIN 3861 and nuts DIN 3870. Hose fittings for these connections are covered by ISO 12151.',
    },
    faq: [
      {
        q: 'O-ring cone or plain cone — which do I need?',
        a: 'Either seals on a 24° cone male. The O-ring cone adds an elastomer seal and tolerates small seat damage better; the plain cone is metal to metal. Match what the system uses, or choose the O-ring form for vibration.',
      },
      {
        q: 'Do I need a new cutting ring on a standpipe?',
        a: 'Yes, on a new tube end. A ring that has bitten can be remade on the same tube, but never moved to another.',
      },
    ],
  },

  'japanese-hose-fittings': {
    guidance: {
      heading: 'For Toyota, Komatsu and other Japanese machines',
      body: 'Japanese machinery uses its own fitting families: JIS metric threads with a 30° flare seat on Komatsu and Toyota ends, JIS gas (BSP-thread) 60° cone ends, and JIS flanges. They look close to metric and BSP fittings, and swapping them is how a joint leaks after a repair.\n\nIdentify the machine maker and the seat — a 30° flare, a 60° cone or a flange face — then measure the thread. The listings give the size range for each form.',
    },
    faq: [
      {
        q: 'Are Komatsu fittings the same as DIN metric?',
        a: 'No. Komatsu ends use JIS metric threads with a 30° flare seat, where DIN metric fittings seal on a 24° cone. The threads can measure alike, but the seats will not seal together.',
      },
      {
        q: 'What is a JIS gas fitting?',
        a: 'A Japanese fitting on a BSP-pattern thread with a 60° cone seat. It mates with JIS gas ports and is not interchangeable with every BSP fitting, so match the seat as well as the thread.',
      },
    ],
  },

  'jic-37-hose-fittings': {
    guidance: {
      heading: '37° flare hose ends, in every routing',
      body: 'JIC hose fittings seal metal to metal on a 37° flare, on UN/UNF threads. The female swivel is the common end; males mate with JIC female ports and adapters. Choose the shape from the routing: straight, 45°, 90°, compact and long-drop elbows, slip-on nut and double-hex versions.\n\nMeasure the thread to identify the dash size, check the seat is a 37° flare and not a 45° SAE flare, and match the tail to the hose construction.',
    },
    standards: {
      heading: 'SAE J514 and ISO 8434-2',
      body: '37° flared connections follow SAE J514 and ISO 8434-2. The hose fittings that carry them are covered by ISO 12151.',
    },
    faq: [
      {
        q: 'When do I need a long-drop or compact elbow?',
        a: 'A long-drop elbow carries the hose further from the port, clearing a nearby obstruction; a compact elbow turns tighter where space is short. Both seal the same way.',
      },
      {
        q: 'How tight should a JIC joint be?',
        a: 'Tight by flats from finger tight, not by feel. Over-tightening damages the flare and causes the leak it was meant to stop.',
      },
    ],
  },

  'metric-hose-fittings': {
    guidance: {
      heading: 'Metric threads, several seats',
      body: 'This shelf covers the metric hose ends outside the DIN 24° family: 60° and 74° cone seats, flat-seat and multiseal females, banjo bolts and eyes, and a waterwash insert. The same M-thread appears with different seats, so measure the thread and look at the seat before ordering.\n\nThe 74° male cone is a 37° flare on a metric thread. Banjos seal with a bonded washer each side of the eye. For 24° cone DIN ends, use the DIN hose-fitting shelf.',
    },
    faq: [
      {
        q: 'How is this different from the DIN hose-fitting shelf?',
        a: 'DIN fittings seal on a 24° cone in light and heavy series. These metric ends seal on 60° or 74° cones, flat faces or multiseals, and include banjos — different seats on similar threads.',
      },
      {
        q: 'What is a 74° cone?',
        a: 'A 37° flare described by its included angle. A metric 74° cone mates with a 37° flare female on the same metric thread.',
      },
    ],
  },

  'npt-adapters': {
    guidance: {
      heading: 'A taper thread that seals on the thread',
      body: 'NPT seals by the taper of the thread itself, which is why it needs PTFE tape or an anaerobic sealant, started back from the first thread so nothing enters the system. NPSM is the straight-thread companion: an NPSM female swivel seals on a cone seat, not on the thread. The thread form is 60°, so NPT does not interchange with 55° BSPT.\n\nIdentify male or female, NPT or NPSM, and the size; then the shape — elbow, tee, cross, connector, cap or plug.',
    },
    standards: {
      heading: 'ASME B1.20.1',
      body: 'NPT taper and NPSM straight pipe threads are both defined in ASME B1.20.1.',
    },
    faq: [
      {
        q: 'Why does an NPT joint limit an assembly’s pressure?',
        a: 'A taper thread is rated below many hose and fitting forms, and the rating falls as the size rises. A hose assembly with an NPT end is rated no higher than that end.',
      },
      {
        q: 'Can NPT be re-tightened to stop a leak?',
        a: 'A little, but a taper that has been over-tightened or remade several times can split a female port. If a correctly sealed joint still leaks, remake it with fresh sealant rather than adding torque.',
      },
    ],
  },

  'npt-npsm-sae-hose-fittings': {
    guidance: {
      heading: 'Pipe threads and SAE flares on one shelf',
      body: 'These hose ends cover the North American pipe-thread and flare families: NPT taper males, NPSM straight-thread swivels, SAE 45° flare and inverted flare ends, and SAE O-ring boss males. Each seals differently — taper thread, cone seat, 45° flare or O-ring — so identify the port before choosing.\n\nThe SAE 45° flare is easy to confuse with the 37° JIC flare: the threads match on several sizes, the seats do not.',
    },
    standards: {
      heading: 'SAE J512 and SAE J1926',
      body: 'SAE 45° flare and inverted flare connections follow SAE J512. O-ring boss ports follow SAE J1926 / ISO 11926.',
    },
    faq: [
      {
        q: 'Where are SAE 45° flare fittings used?',
        a: 'On refrigeration, fuel and lower-pressure hydraulic lines, mostly on North American equipment. For most hydraulic service the 37° JIC flare is the common form.',
      },
      {
        q: 'What is an inverted flare?',
        a: 'A flare formed inside the female port, sealed by a male nut that seats against it — common on brake and fuel lines.',
      },
    ],
  },

  'orfs-hose-fittings': {
    guidance: {
      heading: 'Face-seal hose ends for vibration',
      body: 'ORFS hose fittings seal on an O-ring held in the male face, on UN/UNF threads. The face seal tolerates vibration and pressure spikes that loosen metal-to-metal seats, which is why it is common on construction and mining machinery.\n\nChoose straight, 45° or 90° female swivels or a male, size by the thread, and the tail by the hose. Replace the face O-ring every time the joint is remade.',
    },
    standards: {
      heading: 'SAE J1453 and ISO 8434-3',
      body: 'O-ring face seal connections follow SAE J1453 and ISO 8434-3. The hose fittings that carry them are covered by ISO 12151.',
    },
    faq: [
      {
        q: 'Does the ORFS female carry the O-ring?',
        a: 'No — the O-ring sits in a groove in the male face. Check it is present and undamaged before making the joint up.',
      },
      {
        q: 'Can ORFS replace JIC?',
        a: 'Only by changing both halves of the joint. The threads and seals differ; an adapter can bridge the two where a port cannot change.',
      },
    ],
  },

  'pressure-washer-waterjet-fittings': {
    guidance: {
      heading: 'For pressure washers and waterjet lines',
      body: 'These fittings suit cold- and hot-water pressure washers and low-volume waterjet lines: a female swivel hose fitting in M22 × 1.5 (3/8" BSP available), and a gun insert for the Kärcher bayonet pattern. The seat — an internal cone or an O-ring — depends on the variant, so match it to the machine.',
    },
    faq: [
      {
        q: 'Will these fit my pressure washer?',
        a: 'Check the thread or bayonet on the machine and gun. M22 × 1.5 is the common female thread; the gun insert suits the Kärcher bayonet pattern. Send a photo of the connection if unsure.',
      },
      {
        q: 'Are they for hot water?',
        a: 'Yes — they are listed for cold and hot water pressure washers. Check the hose itself is rated for the temperature.',
      },
    ],
  },

  'sae-flange-adapters': {
    guidance: {
      heading: 'From a flange port to tube or a thread',
      body: 'SAE flange adapters connect a four-bolt flange port to something else: a JIC male, a metric bite-type tube end, or a weld tube. They come straight and in 45° and 90° elbows, for Code 61 (L-series) and Code 62 (S-series) flanges, which do not interchange.\n\nIdentify the flange code and size from the port, then the connection on the other end. Bolts, O-rings and clamps complete the joint.',
    },
    standards: {
      heading: 'SAE J518 and ISO 6162',
      body: 'The flange end follows SAE J518, with ISO 6162-1 (Code 61) and ISO 6162-2 (Code 62) as the international equivalents. JIC ends follow SAE J514 / ISO 8434-2 and bite-type ends ISO 8434-1.',
    },
    faq: [
      {
        q: 'What is the difference between L-series and S-series?',
        a: 'L-series is the Code 61 pattern and S-series the Code 62 pattern. Code 62 is the heavier, higher-pressure pattern, with different bolt spacing at the same nominal size.',
      },
      {
        q: 'Are weld flange connectors supplied ready to weld?',
        a: 'They are supplied with a weld-tube end for welding to pipe on site; welding and any post-weld treatment are done to your site procedure.',
      },
    ],
  },

  'sae-flange-fittings': {
    guidance: {
      heading: 'Four-bolt flange hose ends',
      body: 'Flange hose fittings carry the hose straight onto an SAE four-bolt port: Code 61 and Code 62 in straight, 45°, 90° and long-drop forms, plus one-piece Code 62 flange-on-fitting ends. Split flange clamps, sold as a pair with bolts, hold the fitting to the port.\n\nMatch the code and size to the port, the tail to the hose construction, and use new O-rings each time the joint is made.',
    },
    standards: {
      heading: 'SAE J518, ISO 6162-1 and ISO 6162-2',
      body: 'Four-bolt flange connections follow SAE J518, with ISO 6162-1 (Code 61) and ISO 6162-2 (Code 62). Bolts are specified by grade under SAE J429.',
    },
    faq: [
      {
        q: 'What is a flange-on-fitting?',
        a: 'A hose fitting with the flange formed on it in one piece, so no separate split clamps are needed. It suits high-pressure Code 62 ports where space for clamps is tight.',
      },
      {
        q: 'Do split flange clamps come with bolts?',
        a: 'Yes — the split flange clamps on this shelf are supplied as a pair with bolts, for Code 61 and Code 62.',
      },
    ],
  },

  // ── Stainless steel (SS316L) ──────────────────────────────────────────────

  'ss316l-banjos': {
    guidance: {
      heading: 'Stainless banjos, BSP and metric',
      body: 'SS316L banjo fittings — a hollow bolt through a banjo eye — in BSP parallel and metric threads, for compact connections on washdown, marine and chemical-duty equipment. They seal with a bonded washer each side of the eye.',
    },
    standards: {
      heading: 'DIN 7642',
      body: 'Banjo fittings follow DIN 7642, on parallel threads to ISO 228-1 for the BSP version.',
    },
    faq: [
      {
        q: 'Do stainless banjos need stainless washers?',
        a: 'Use bonded washers suited to the fluid and the environment, and fit new ones each time the banjo is remade.',
      },
      {
        q: 'Why choose a banjo?',
        a: 'Where a hose must turn tight against a port in very little space — the banjo eye lets the line leave at right angles to the bolt.',
      },
    ],
  },

  'ss316l-bsp-fittings': {
    guidance: {
      heading: 'BSP hose ends in 316L',
      body: 'Stainless BSP hose fittings for corrosive, washdown and marine service: 60° cone, flat-seat and O-ring females in straight, 45° and 90° forms, flat-seat and 60° cone males, and a BSPT taper male. Identify the seat on the port before choosing — cone, flat face and taper do not seal on each other.',
    },
    standards: {
      heading: 'ISO 228-1',
      body: 'Parallel BSP threads follow ISO 228-1; the taper male uses the BSP taper thread of ISO 7-1, which seals on the thread.',
    },
    faq: [
      {
        q: 'Is a stainless fitting rated like the carbon-steel version?',
        a: 'Not always — check the working pressure on the listing against the line rather than assuming the carbon-steel figure.',
      },
      {
        q: 'Should the port be stainless too?',
        a: 'On a wet or salty site, yes where possible: stainless against plated steel forms a galvanic cell that corrodes the port.',
      },
    ],
  },

  'ss316l-double-hexagonal-fittings': {
    guidance: {
      heading: 'An extra hex for tight spaces',
      body: 'Double-hexagonal stainless hose fittings — BSP 60° cone, JIC 37° and NPSM 60° cone female swivels — carry a second hex on the body, so the fitting can be held while the nut is turned. That keeps the hose from twisting during make-up and helps where a spanner has little room.',
    },
    faq: [
      {
        q: 'Why does the second hex matter?',
        a: 'Holding the body while tightening the nut stops the hose twisting, which shortens its life. It also gives a second spanner position in tight spaces.',
      },
      {
        q: 'Which thread forms are available?',
        a: 'BSP 60° cone, JIC 37° and NPSM 60° cone female swivels, all in 316L.',
      },
    ],
  },

  'ss316l-hydrowashing-couplings': {
    guidance: {
      heading: 'For high-pressure hydrowashing machines',
      body: 'Stainless hexagonal nuts and standpipes for the hose connections on high-pressure hydrowashing machines, sized to the machine hose. Match the thread and standpipe size to the existing machine connection.',
    },
    faq: [
      {
        q: 'How do I pick the right size?',
        a: 'From the machine hose and its existing connection. Send the hose size and a photo of the fitting and we will confirm.',
      },
      {
        q: 'Why stainless?',
        a: 'Hydrowashing keeps the connection wet with water and detergent, where plated carbon steel corrodes quickly.',
      },
    ],
  },

  'ss316l-jic-37-fittings': {
    guidance: {
      heading: 'JIC 37° in 316L',
      body: 'Stainless JIC hose fittings: female swivels in straight, 45° and compact 90° forms, and males with or without an O-ring. They seal on a 37° flare like the carbon-steel range, for washdown, offshore and chemical-duty lines.',
    },
    standards: {
      heading: 'SAE J514 and ISO 8434-2',
      body: '37° flared connections follow SAE J514 and ISO 8434-2.',
    },
    faq: [
      {
        q: 'Can I mix stainless and carbon-steel JIC parts?',
        a: 'They will connect, but on a wet or salty site the joint becomes a galvanic cell. Match materials where the exposure is severe.',
      },
      {
        q: 'Do stainless flares need special care?',
        a: 'Stainless can gall under load. Make the joint up by flats from finger tight, and do not over-tighten.',
      },
    ],
  },

  'ss316l-metric-fittings': {
    guidance: {
      heading: 'Metric 24° cone in 316L',
      body: 'Stainless metric hose fittings on the 24° cone: a male stud and female swivels with an O-ring, straight and 45°. They suit corrosive and washdown service on equipment built to metric DIN ports.',
    },
    standards: {
      heading: 'ISO 6149-1 and DIN 3852-2',
      body: 'Metric ports with an O-ring follow ISO 6149-1, and ports sealed at the face DIN 3852-2.',
    },
    faq: [
      {
        q: 'Light or heavy series?',
        a: 'Check the listing’s size table against your existing nut and tube; the 24° cone series do not interchange.',
      },
      {
        q: 'Why the O-ring in the cone?',
        a: 'It adds an elastomer seal to the 24° cone, which holds better under vibration and small seat damage.',
      },
    ],
  },

  'ss316l-npt-npsm-fittings': {
    guidance: {
      heading: 'NPT and NPSM in 316L',
      body: 'Stainless pipe-thread hose fittings: a straight NPT taper male and NPSM 60° cone female swivels in straight, 45° and 90° forms. NPT seals on the taper thread with a sealant; NPSM swivels seal on the cone seat, not the thread.',
    },
    faq: [
      {
        q: 'Do I need sealant on NPSM?',
        a: 'No — NPSM seals on the cone seat. Sealant belongs only on the NPT taper thread, started back from the leading thread.',
      },
      {
        q: 'Will stainless NPT gall?',
        a: 'It can. Use a sealant or anti-seize suited to stainless, and do not over-tighten the taper.',
      },
    ],
  },

  'ss316l-orfs-fittings': {
    guidance: {
      heading: 'ORFS in 316L',
      body: 'Stainless ORFS hose fittings: female swivels straight, 45° and 90°, a double-hex female and a male. They seal on a face O-ring like the carbon-steel range, for vibration-prone lines in corrosive or washdown environments.',
    },
    standards: {
      heading: 'SAE J1453 and ISO 8434-3',
      body: 'O-ring face seal connections follow SAE J1453 and ISO 8434-3.',
    },
    faq: [
      {
        q: 'Which O-ring material?',
        a: 'One compatible with the fluid and temperature — nitrile for mineral oil, with other compounds for other fluids. Replace it at every remake.',
      },
      {
        q: 'Why a double-hex female?',
        a: 'The second hex lets you hold the fitting while turning the nut, so the hose does not twist.',
      },
    ],
  },

  'ss316l-sae-fittings': {
    guidance: {
      heading: 'Four-bolt flange hose ends in 316L',
      body: 'Stainless SAE flange hose fittings for Code 61 and Code 62 four-bolt ports, straight and in 45° and 90° elbows. Use them where the line is stainless end to end — offshore, chemical and washdown — with clamps and bolts suited to the environment.',
    },
    standards: {
      heading: 'SAE J518 and ISO 6162',
      body: 'Four-bolt flange connections follow SAE J518, with ISO 6162 as the international equivalent. Bolts are specified by grade under SAE J429.',
    },
    faq: [
      {
        q: 'Code 61 or Code 62?',
        a: 'The port decides: Code 62 is the heavier, higher-pressure pattern with different bolt spacing at the same nominal size.',
      },
      {
        q: 'What clamps and bolts should I use?',
        a: 'Stainless clamps and bolts of a grade suited to the pressure and the environment — stainless flanges are on the next shelf.',
      },
    ],
  },

  'ss316l-sae-flanges-for-hoses': {
    guidance: {
      heading: 'Stainless flange components',
      body: 'SS316L components for SAE four-bolt hose connections: counter-flanges, flanges, split flanges and the seal sets for 3,000 and 6,000 psi flanges. They complete a stainless flange joint where plated parts would corrode.',
    },
    standards: {
      heading: 'SAE J518 and ISO 6162',
      body: 'The components follow SAE J518 four-bolt connections, with ISO 6162 as the international equivalent.',
    },
    faq: [
      {
        q: 'What is a counter-flange?',
        a: 'The mating flange that bolts against the port or another flange, closing the joint around the seal.',
      },
      {
        q: 'Which seals do I need?',
        a: 'The seal set for the flange pattern and size — Code 61 or Code 62 — in a compound suited to the fluid.',
      },
    ],
  },

  'ss316l-standpipes': {
    guidance: {
      heading: 'Stainless standpipes for hose assemblies',
      body: 'SS316L standpipes join a hose assembly to tube or a weld: metric standpipes for 24° cone (DIN 2353) fittings, straight and 90°, gas-tube standpipes, double-crimp standpipes and welding standpipes. Choose by what the standpipe connects to and the tube size.',
    },
    standards: {
      heading: 'ISO 8434-1',
      body: 'Metric standpipes for 24° cone fittings follow ISO 8434-1, formerly DIN 2353.',
    },
    faq: [
      {
        q: 'What is a standpipe?',
        a: 'A tube-ended fitting that takes a cutting ring and nut, or a weld, instead of a threaded end — the link between a hose and rigid tube.',
      },
      {
        q: 'Do standpipes need a new cutting ring?',
        a: 'Yes, when made into a new 24° cone fitting body; a ring is never moved to a different tube.',
      },
    ],
  },

  // ── Industrial hoses ─────────────────────────────────────────────────────

  'abrasive-hoses': {
    guidance: {
      heading: 'For sand, cement, powders and slurry',
      body: 'Bulk-material hose moves abrasive solids — sand, cement, dry powders, grain and slurry — with a thick, wear-resistant tube and a helical wire that keeps it open under suction. The rubber suction-and-delivery hose suits heavy abrasion; the PVC version handles chemicals and abrasion together.\n\nTell us the material, its particle size, whether it runs dry or as a slurry, the bore, and the pressure or suction.',
    },
    faq: [
      {
        q: 'Why does abrasive hose wear on the bends?',
        a: 'Particles hit the outside of every bend. Keep bend radii generous, avoid kinks, and rotate the hose periodically to spread the wear.',
      },
      {
        q: 'Can the same hose do suction and delivery?',
        a: 'Yes — both hoses on this shelf are suction-and-delivery constructions with a helical wire.',
      },
    ],
  },

  'air-water-hoses': {
    guidance: {
      heading: 'Air and water, and the variants that matter',
      body: 'General air and water hose with textile reinforcement and EPDM or SBR rubber. The variants are what to choose between: anti-static for spark-free areas such as offshore installations, mandrel-built for consistent dimensions and coupling grip, multi-utility hose for mixed service, and a high-temperature air hose for hot compressor discharge.\n\nMatch the bore to the coupling, and check the working pressure on the listing against the compressor.',
    },
    standards: {
      heading: 'BS 5118 and ISO 2398',
      body: 'Compressed-air hose is built to ISO 2398 and BS 5118, which specify textile-reinforced rubber hose for compressed air.',
    },
    faq: [
      {
        q: 'When do I need anti-static hose?',
        a: 'Wherever a static discharge could ignite a flammable atmosphere — offshore, in refineries and around fuels and powders.',
      },
      {
        q: 'Can air hose carry water?',
        a: 'The air and water hoses here are made for both. For hot compressor air, use the high-temperature air hose.',
      },
    ],
  },

  'barcelona-geka-couplings': {
    guidance: {
      heading: 'Two European patterns',
      body: 'Barcelona couplings are the Spanish pattern, in aluminium; Geka couplings are a German claw pattern, in brass. Each connects only to its own pattern. The shelf carries couplings with threads and hose shanks, plus Geka caps, all sealing on NBR gaskets, in sizes from 3/4" to 4".',
    },
    faq: [
      {
        q: 'Do Barcelona and Geka couplings connect to each other?',
        a: 'No — they are different patterns. Use an adapter, or match the pattern already in use on site.',
      },
      {
        q: 'What seals the joint?',
        a: 'An NBR gasket in the coupling. Replace a hardened or cracked gasket rather than forcing the joint.',
      },
    ],
  },

  'bauer-type-couplings': {
    guidance: {
      heading: 'Lever-ring couplings for water and slurry',
      body: 'Bauer-type couplings lock with a lever ring, connect quickly by hand and tolerate some angle between the two halves, which suits irrigation, dewatering, slurry and water transfer. The shelf carries male and female ends with hose shanks, threads and bolted flanges, complete sets and spare lever rings, in zinc-plated steel from 2" to 6".\n\nMatch the size and the end connection, and keep the gasket in good order: it is the seal.',
    },
    standards: {
      heading: 'DIN 2501 flanged ends',
      body: 'The flanged versions carry DIN 2501 PN 10 flanges for bolting to pumps, tanks and pipework.',
    },
    faq: [
      {
        q: 'Are these compatible with other Bauer-pattern couplings?',
        a: 'They are made to the Bauer pattern for that purpose; confirm the size and check fit against your existing couplings before a full changeover.',
      },
      {
        q: 'Can I buy just the lever rings?',
        a: 'Yes — lever rings are listed on their own.',
      },
    ],
  },

  'composite-hose-fittings': {
    guidance: {
      heading: 'Fittings for multi-ply composite hose',
      body: 'Composite hose needs fittings made for its construction: a spiral tail that follows the internal wire helix, held by a female liner and lug nut or by a hex male. This shelf carries those parts in 316 stainless steel, with camlock Type C and Type E and flanged ends for connecting to tankers and pipework.',
    },
    standards: {
      heading: 'EN 13765',
      body: 'The fittings are for composite hose built to EN 13765, the standard for thermoplastic multi-layer hose for hydrocarbons, solvents and chemicals.',
    },
    faq: [
      {
        q: 'Can I fit a standard hose shank to composite hose?',
        a: 'No. Composite hose needs a spiral tail matched to its wire helix; a plain shank will not seal or hold.',
      },
      {
        q: 'Which end connections are available?',
        a: 'Camlock Type C and Type E, a hex male thread, and a flange, all on spiral tails.',
      },
    ],
  },

  'composite-hoses': {
    guidance: {
      heading: 'Multi-ply hose for oil, chemicals and vapour',
      body: 'Composite hose is built from layers of polypropylene and polyester films and fabrics between an internal and an external wire helix. It is light, flexible and chemically resistant, which makes it a standard choice for road tanker loading and petrochemical transfer. The shelf covers oil, chemical, PTFE-lined chemical and vapour-recovery hose.\n\nChoose by the product transferred — for chemicals, name it — then the bore and length, and fit it with composite hose fittings.',
    },
    standards: {
      heading: 'EN 13765',
      body: 'Composite hoses are built to EN 13765, which covers thermoplastic multi-layer hose for hydrocarbons, solvents and chemicals.',
    },
    faq: [
      {
        q: 'When is the PTFE-lined version needed?',
        a: 'For chemicals the standard films do not resist. The PTFE liner widens chemical compatibility; name the chemical and we will confirm.',
      },
      {
        q: 'What is a vapour recovery hose for?',
        a: 'Returning displaced vapour to the tank or the recovery system during loading, so it is not vented.',
      },
    ],
  },

  'crowfoot-couplings': {
    guidance: {
      heading: 'Chicago-style claw couplings',
      body: 'Crowfoot couplings connect with lugs and a quarter turn, and identical heads mate with each other. This shelf carries 316 stainless hose ends, female and male NPT ends, triple-connection and blank ends, plus zinc-plated iron four-lug versions, for air and water service on construction, mining and maintenance sites.\n\nFit a safety clip or whip check on compressed-air lines.',
    },
    faq: [
      {
        q: 'What is the difference between two-lug and four-lug heads?',
        a: 'Four-lug heads spread the load over more lugs. Match the head type already in use so the couplings connect.',
      },
      {
        q: 'Why stainless?',
        a: 'For wet, corrosive or washdown environments where iron couplings corrode.',
      },
    ],
  },

  'dry-disconnect-couplings': {
    guidance: {
      heading: 'No spill on disconnection',
      body: 'Dry-disconnect couplings close a valve in both halves before they separate, so nothing escapes when the line is broken. They are used for fuels, solvents, acids and aggressive chemicals. The shelf carries aluminium couplers and adapters with 316 stainless valves and female NPT ends, with Viton or PTFE seals.\n\nChoose the seal by the fluid — PTFE for aggressive chemicals, acids and solvents.',
    },
    faq: [
      {
        q: 'Viton or PTFE seals?',
        a: 'By the fluid. PTFE resists the widest range of aggressive chemicals, acids and solvents; Viton suits fuels and many oils. Name the fluid and we will confirm.',
      },
      {
        q: 'Do dry disconnects connect to cam and groove?',
        a: 'No — they are their own interchange. Use the matching coupler and adapter.',
      },
    ],
  },

  'en14420-5-fittings': {
    guidance: {
      heading: 'Threaded hose fittings for safety clamps',
      body: 'EN 14420-5 fittings are threaded hose tails made to be held by a bolted safety clamp: GA with a male thread, GI with a female thread, with a serrated or smooth tail, in brass or stainless steel from 1/2" to 4". They are common on steam and industrial hose where a clamped, standardised end is required.\n\nChoose the thread end, the material and the tail, and pair it with the matching safety clamp.',
    },
    standards: {
      heading: 'EN 14420-5 with EN 14420-3 / DIN 2817 clamps',
      body: 'The fittings follow EN 14420-5 for threaded hose-fitting connections and are assembled with safety clamps to EN 14420-3 / DIN 2817.',
    },
    faq: [
      {
        q: 'Serrated or smooth tail?',
        a: 'A serrated tail grips the hose bore harder; a smooth tail is gentler on the tube. The hose maker’s recommendation decides.',
      },
      {
        q: 'What is the difference between GA and GI?',
        a: 'GA carries a male thread and GI a female thread.',
      },
    ],
  },

  'food-beverage-hoses': {
    guidance: {
      heading: 'Hygienic hose for food and drink',
      body: 'Food hose has a tube made for food contact and smooth enough to clean. This shelf covers hygienic suction-and-delivery hose for food and brewing, food-grade PVC for liquids and solids, non-toxic PVC, and silicone hose for higher temperatures. They are compatible with CIP and SIP cleaning.\n\nChoose by the product, the temperature and the cleaning regime, and use hygienic couplings to match.',
    },
    faq: [
      {
        q: 'Are these hoses food-grade?',
        a: 'Yes — they are made from food-grade materials under FDA and EU requirements; each listing gives the detail.',
      },
      {
        q: 'When is silicone hose the better choice?',
        a: 'For higher temperatures and where a very inert, clean tube is needed.',
      },
    ],
  },

  'gost-couplings': {
    guidance: {
      heading: 'Couplings to the Russian / CIS pattern',
      body: 'GOST couplings are the pattern used in Russia and across the CIS, cast in aluminium with NBR gaskets. The shelf carries couplings, thread adapters (male and female) and caps in 2", 2.5" and 3" — for equipment and hose lines working to the CIS pattern.',
    },
    faq: [
      {
        q: 'Do GOST couplings connect to Storz?',
        a: 'No — they are a different pattern. Use an adapter, or match the pattern already in use.',
      },
      {
        q: 'Which sizes are available?',
        a: '2", 2.5" and 3".',
      },
    ],
  },

  'ground-joint-couplings': {
    guidance: {
      heading: 'Metal-to-metal couplings for steam and air',
      body: 'Ground joint couplings seal metal to metal on a ground seat, held together by a wing nut, which suits steam and high-pressure air where a gasket would fail. The shelf carries complete sets, hose stems, NPT male stems, wing nuts, male, female and double spuds, and the universal clamps that hold the stem in the hose.\n\nUse clamps suited to the hose, and inspect the seats when the joint is opened.',
    },
    faq: [
      {
        q: 'Why use a ground joint on steam?',
        a: 'The metal-to-metal seat has no gasket to harden or blow out at steam temperatures.',
      },
      {
        q: 'What holds the stem in the hose?',
        a: 'A clamp over the hose on the stem — the universal clamps on this shelf.',
      },
    ],
  },

  'guillemin-couplings': {
    guidance: {
      heading: 'The French symmetrical coupling',
      body: 'Guillemin couplings are symmetrical — identical halves lock together with a turn — and are the standard fire-service coupling in France. The shelf carries couplings with threads, short and long hose shanks and spiral tails, adapters, a reducer and a dust cap, in brass or aluminium from 25 to 150 mm.',
    },
    standards: {
      heading: 'NF E 29-572',
      body: 'Guillemin couplings follow the French standard NF E 29-572.',
    },
    faq: [
      {
        q: 'Do Guillemin couplings connect to Storz?',
        a: 'No — both are symmetrical, but they are different patterns. An adapter joins them.',
      },
      {
        q: 'Brass or aluminium?',
        a: 'Aluminium is lighter to handle; brass is heavier and more durable in harsh service.',
      },
    ],
  },

  'hose-menders': {
    guidance: {
      heading: 'Splice a damaged hose',
      body: 'Brass hose menders and double connectors join two hose ends, or repair a damaged section, with barbed tails held by clamps — sizes from 1/4" to 1". They suit water, air and low-pressure service; replace the hose rather than mend it on high-pressure or critical lines.',
    },
    faq: [
      {
        q: 'Can I use a mender on hydraulic hose?',
        a: 'No. Menders are for low-pressure hose; a damaged hydraulic hose needs a new assembly.',
      },
      {
        q: 'What holds the mender in place?',
        a: 'A clamp over the hose on each barbed tail.',
      },
    ],
  },

  'industrial-flanges': {
    guidance: {
      heading: 'Pipe flanges by type and class',
      body: 'Industrial pipe flanges in Class 150 and 300: welding neck, slip-on, socket weld, lap joint (with MSS SP-43 stub ends), threaded, flat and blind, plus a gunmetal dock flange with a male thread. Choose the type from how the flange joins the pipe, then the class from the pressure, and the material from the medium — carbon steel, 304/316 stainless or gunmetal.',
    },
    standards: {
      heading: 'ASME B16.5 and MSS SP-43',
      body: 'Flanges follow ASME B16.5 in Classes 150 and 300, and stub ends MSS SP-43.',
    },
    faq: [
      {
        q: 'Do Class 150 and Class 300 flanges bolt together?',
        a: 'No — they have different bolt circles and thicknesses at the same size.',
      },
      {
        q: 'When is a lap-joint flange used?',
        a: 'With a stub end, where the flange must rotate to align bolt holes or be made from a cheaper material than the wetted stub.',
      },
    ],
  },

  'industrial-steam-hoses': {
    guidance: {
      heading: 'Saturated steam, with couplings to match',
      body: 'Steam hose has an EPDM tube and cover over steel-wire reinforcement, made for saturated steam. The shelf covers a high-pressure red steam hose, a black steam hose and a steam, hot water and food hose. Fit steam hose only with steam couplings and safety clamps, and never exceed the working pressure on the listing.',
    },
    standards: {
      heading: 'ISO 6134 and BS 5342',
      body: 'Steam hoses are built to ISO 6134, the specification for rubber hose for saturated steam, which replaced BS 5342.',
    },
    faq: [
      {
        q: 'What couplings should steam hose use?',
        a: 'Couplings and safety clamps designed for steam — ground joint couplings, or EN 14420-5 fittings with EN 14420-3 / DIN 2817 safety clamps.',
      },
      {
        q: 'Why does steam hose fail early?',
        a: 'Often from popcorning — water absorbed into the tube flashing to steam — or from use with superheated steam. Drain and store it correctly.',
      },
    ],
  },

  'kc-nipple-fittings': {
    guidance: {
      heading: 'Combination nipples and heavy-duty hose ends',
      body: 'KC nipples carry a hose shank on one end and a thread or flange on the other, held in the hose by bolt or interlocking clamps. The shelf also covers heavy-duty hose fittings: turn-back and fixed flange KC ends, groove KC, drag hose and frac water couplings, umbilical slurry sets, 206 hammer unions and suction hose couplings in carbon steel, brass and aluminium.',
    },
    faq: [
      {
        q: 'What clamps do KC nipples take?',
        a: 'Bolt clamps or interlocking clamps sized to the hose outside diameter.',
      },
      {
        q: 'What is a 206 hammer union?',
        a: 'A threaded union with a wing nut hammered tight, used on frac water and other high-flow temporary lines.',
      },
    ],
  },

  'oil-chemical-purpose-hoses': {
    guidance: {
      heading: 'Match the tube to the fluid',
      body: 'This shelf covers fuel, mineral oil, sea water and chemical hose. The tube decides suitability: oil-resistant tubes for oils and fuels, and UHMWPE for chemicals, where it resists a very wide range. There are suction-and-delivery and delivery-only constructions, a tanker reeling hose and a non-conductive multi-purpose hose.\n\nFor chemicals, name the chemical, its concentration and temperature. For fuels, use electrically conductive hose.',
    },
    standards: {
      heading: 'EN 1761 and EN 12115',
      body: 'Fuel delivery hose is built to EN 1761, and chemical hose to EN 12115, the standard for rubber and thermoplastic hose for liquid or gaseous chemicals.',
    },
    faq: [
      {
        q: 'Why must fuel hose be conductive?',
        a: 'Fuel flowing through a hose generates static. A conductive hose carries it away so it cannot discharge as a spark.',
      },
      {
        q: 'What is UHMWPE hose good for?',
        a: 'Chemical transfer: an ultra-high-molecular-weight polyethylene tube resists a very wide range of acids, alkalis and solvents.',
      },
    ],
  },

  'pin-lug-shank-couplings': {
    guidance: {
      heading: 'Shank couplings with a brass nut',
      body: 'Aluminium shank couplings with a brass nut, in the pin-lug pattern tightened with a spanner wrench — female, male and complete sets from 1/2" to 3". They suit water service, with the shank held in the hose by a clamp.',
    },
    faq: [
      {
        q: 'What is a pin-lug coupling?',
        a: 'A coupling whose nut carries pins or lugs for a spanner wrench, so it can be tightened without a large hex.',
      },
      {
        q: 'Are they for water only?',
        a: 'They are listed for industrial water service.',
      },
    ],
  },

  'ring-lock-couplings': {
    guidance: {
      heading: 'Lever-ring couplings for water transfer',
      body: 'Ring-lock couplings lock with a lever ring for quick connection on water transfer, irrigation and dewatering lines. The shelf carries hose-shank female and male couplings, complete sets and spare lever rings, in zinc-plated steel from 2" to 6".',
    },
    faq: [
      {
        q: 'Are ring-lock and Bauer-type couplings the same?',
        a: 'Both lock with a lever ring, but check the pattern against your existing couplings before mixing them.',
      },
      {
        q: 'Can I buy spare lever rings?',
        a: 'Yes — lever rings are listed on their own.',
      },
    ],
  },

  'sandblast-couplings': {
    guidance: {
      heading: 'Couplings for grit blasting',
      body: 'Sandblast couplings join blast hose and hold the nozzle. The shelf carries aluminium hose ends with crowfoot (claw) couplers and NPSH-threaded nozzle holders, and nylon couplers, nozzle holders and adapters, for shipyards, foundries and surface preparation.\n\nFit safety pins or clips to every coupling, and match the coupling to the hose outside diameter.',
    },
    faq: [
      {
        q: 'Why do blast couplings need safety pins?',
        a: 'A blast line under pressure that separates throws abrasive and whips; pins or clips keep the coupling locked.',
      },
      {
        q: 'Nylon or aluminium?',
        a: 'Nylon is lighter and resists wear; aluminium is stronger in heavy use.',
      },
    ],
  },

  'shank-couplings': {
    guidance: {
      heading: 'Hose nipples for clamped ends',
      body: 'Shank couplings are hose nipples clamped into industrial transfer hose: steel long-shank nipples, male, female and complete sets, and brass short-shank male and female nipples. A long shank gives more grip in the hose; a short shank suits lighter service.',
    },
    faq: [
      {
        q: 'Long or short shank?',
        a: 'A long shank grips more hose and suits higher pressure and heavier hose; a short shank suits lighter-duty lines.',
      },
      {
        q: 'What holds the shank in the hose?',
        a: 'A hose clamp or band over the shank.',
      },
    ],
  },

  'specialty-adapters-couplings': {
    guidance: {
      heading: 'Cam and groove beyond the standard letters',
      body: 'This shelf carries the cam and groove parts outside the standard Type A–F range: socket-weld ends, ANSI Class 150 flanged adapters and couplers, lockable dust caps, spool adapters, reducing couplings and adapters, and stainless thread reducers. They connect cam and groove lines to flanged pipework, welded pipe and other sizes.',
    },
    standards: {
      heading: 'A-A-59326, EN 14420-7 and ANSI Class 150',
      body: 'The cam and groove ends follow A-A-59326 and EN 14420-7, and the flanged versions carry ANSI Class 150 raised-face flanges.',
    },
    faq: [
      {
        q: 'What is a lockable dust cap for?',
        a: 'Securing a tank or line connection with a padlock, so it cannot be opened without authority.',
      },
      {
        q: 'Can a reducing coupling change size and type at once?',
        a: 'Yes — the reducing types join two sizes and different ends, such as a female coupler to a smaller male thread.',
      },
    ],
  },

  'water-suction-delivery-hoses': {
    guidance: {
      heading: 'Water hose that holds under suction',
      body: 'Suction-and-delivery water hose carries a helical wire so it stays open under pump suction, for dewatering, irrigation, tanker and water-utility work. The shelf covers rubber hose and clear and medium-duty PVC hose.\n\nChoose the bore from the pump, the construction from the duty, and the couplings from what is already on site.',
    },
    faq: [
      {
        q: 'Will a delivery hose work on suction?',
        a: 'No — without a helix it flattens under vacuum. Use a suction-and-delivery hose on the pump inlet.',
      },
      {
        q: 'Why clear PVC?',
        a: 'To see the flow — useful for spotting blockages and checking the line is full.',
      },
    ],
  },

  // ── Metallic hoses ───────────────────────────────────────────────────────

  'metallic-exotic-alloy-hoses': {
    guidance: {
      heading: 'When stainless steel is not enough',
      body: 'Exotic-alloy hose is used where the medium attacks stainless steel. Hastelloy C276 resists severe corrosion, Inconel 625 high temperatures, Monel 400 is the established choice for dry chlorine, and bronze suits sea water. Each comes unbraided, single- or double-braided, and in cost-saving versions with a 304 stainless braid over the alloy core.\n\nTell us the medium, concentration, temperature and pressure, and whether the hose moves in service.',
    },
    standards: {
      heading: 'ISO 10380',
      body: 'The hoses are corrugated metal hose built to ISO 10380. Chlorine-transfer use follows the Chlorine Institute’s guidance for dry chlorine.',
    },
    faq: [
      {
        q: 'Is a stainless braid over an alloy core a compromise?',
        a: 'Only on the outside. The wetted core is the alloy; the 304 braid saves cost where the outer environment does not need the alloy.',
      },
      {
        q: 'Which alloy for chlorine?',
        a: 'Monel 400 is the established material for dry chlorine transfer. Wet chlorine is a different problem — tell us the moisture content.',
      },
    ],
  },

  'metallic-fire-protection-hoses': {
    guidance: {
      heading: 'Protection, guards and special cores',
      body: 'This shelf covers what goes around and inside a metal hose: Lock-Section interlocking cores, Armor-Flex ball-joint hose guards, Smooth-Flex non-corrugated hose, fire jackets and fire tape, and a fire-safe certified assembly for hydrocarbon installations. Guards protect against abrasion and crushing; jackets and tape add fire resistance.',
    },
    faq: [
      {
        q: 'What does a hose guard do?',
        a: 'It protects the hose from abrasion, crushing and over-bending, and limits the damage if the hose fails.',
      },
      {
        q: 'What is a fire jacket?',
        a: 'A silicone-coated sleeve that slows heat reaching the hose in a fire, buying time to isolate the line.',
      },
    ],
  },

  'metallic-high-pressure-hoses': {
    guidance: {
      heading: 'Metal hose for high pressure',
      body: 'High-pressure metal hose uses fully compressed or closed-pitch corrugations with heavy braid to carry pressures that standard corrugated hose cannot. The shelf covers annular and helical designs in 316L and 321 stainless for steam, hydraulics and high-pressure cryogenic loading.\n\nSpecify the pressure, temperature, medium, bore, length and movement; high-pressure metal hose is stiffer and needs a larger bend radius.',
    },
    standards: {
      heading: 'ISO 10380',
      body: 'The hoses are built to ISO 10380. Listings offered for sour service state NACE MR0175 / ISO 15156 compliance where it applies.',
    },
    faq: [
      {
        q: 'Why is high-pressure metal hose stiffer?',
        a: 'Compressed corrugations and heavier braid carry more pressure but flex less, so they need a larger bend radius.',
      },
      {
        q: '316L or 321 stainless?',
        a: '316L for general corrosion resistance; 321 for higher temperatures. The medium and temperature decide.',
      },
    ],
  },

  'metallic-hose-couplings': {
    guidance: {
      heading: 'Couplings for metal-hose service',
      body: 'These couplings are made for the conditions metal hose works in: Met-O-Seal tanker loading couplings, non-valved cryogenic couplings for liquid and vapour lines, a dry-break coupling, O-seal pipe unions, swivel joints and a sight-flow indicator. Choose by the service — loading, cryogenic, dry-break or a permanent union — then the size and pressure.',
    },
    faq: [
      {
        q: 'What is a dry-break coupling?',
        a: 'A coupling that closes both halves before separation, so the line disconnects without spilling.',
      },
      {
        q: 'What does a sight-flow indicator show?',
        a: 'Whether product is flowing, and its condition, through a window in the line.',
      },
    ],
  },

  'metallic-specialty-assemblies': {
    guidance: {
      heading: 'Engineered for one service',
      body: 'Specialty assemblies are built for a single duty: cryogenic transfer of liquid nitrogen, oxygen, argon, CO₂ and LNG; steam-jacketed and electrically heated hose that keeps product fluid; Monel chlorine transfer; industrial gas hose with CGA connections; flexible pipe loops; and insulation covers. Each is specified from the medium, temperature, pressure and connections.',
    },
    standards: {
      heading: 'ISO 10380 and UL 536',
      body: 'Assemblies are built to ISO 10380 corrugated-hose requirements, and flexible metal hose for fuel and gas service is listed to UL 536 where stated. EN 10204 material certificates are available.',
    },
    faq: [
      {
        q: 'Why must oxygen hose be specified separately?',
        a: 'Oxygen service needs cleaned components and compatible materials, because contamination can ignite in oxygen. Use hose made and cleaned for oxygen.',
      },
      {
        q: 'What is a flexible pipe loop for?',
        a: 'Absorbing thermal expansion and movement in pipework without stressing the connections.',
      },
    ],
  },

  'metallic-stainless-corrugated-hoses': {
    guidance: {
      heading: 'Stainless corrugated hose',
      body: 'Stainless corrugated metal hose in 304, 316L and 321, annular and helical, unbraided or with single, double or triple braid, from DN 6 to DN 350. The braid carries the pressure: more braid layers, higher pressure. 316L suits general corrosion, 321 higher temperatures.\n\nInstall without twist, flex it in one plane, and keep within the minimum bend radius.',
    },
    standards: {
      heading: 'ISO 10380',
      body: 'The hoses are built to ISO 10380, the standard for corrugated metal hose and hose assemblies.',
    },
    faq: [
      {
        q: 'Annular or helical corrugations?',
        a: 'Annular is the common choice for most process duties. Helical corrugations drain and clean more easily.',
      },
      {
        q: 'Why do metal hoses fail early?',
        a: 'Mostly from twist and multi-plane flexing. Install without torsion and flex in a single plane.',
      },
    ],
  },

  'ptfe-hoses': {
    guidance: {
      heading: 'PTFE for chemicals and high purity',
      body: 'PTFE hose resists almost every chemical and is clean enough for pharmaceutical and food service. Smoothbore PTFE flows and cleans best; convoluted PTFE bends tighter. Braids in stainless steel or polypropylene carry the pressure, and anti-static versions are available for flammable media.\n\nCheck the working pressure and temperature on the listing against the duty.',
    },
    faq: [
      {
        q: 'Smoothbore or convoluted?',
        a: 'Smoothbore for flow and cleanability; convoluted where the hose must bend tighter.',
      },
      {
        q: 'When is anti-static PTFE needed?',
        a: 'For flammable or non-conductive fluids, where flow can build static on the PTFE tube.',
      },
    ],
  },

  // ── Oil and gas ──────────────────────────────────────────────────────────

  'drilling-hoses': {
    guidance: {
      heading: 'Rotary, vibrator and mud hose',
      body: 'Drilling hose carries mud from the pumps to the drill string. The shelf covers rotary and vibrator hose with bonded, crimped and swaged couplings, cement-resistant versions, a high-temperature sour-service version, and mud booster hose for deep and horizontal wells.\n\nChoose by duty, working pressure, temperature and fluid, and state whether the hose sees cement or sour fluids.',
    },
    standards: {
      heading: 'API 7K',
      body: 'Rotary and vibrator drilling hose is covered by API Specification 7K, and end connections commonly follow API 6A.',
    },
    faq: [
      {
        q: 'Bonded, crimped or swaged coupling?',
        a: 'All three secure the coupling for API 7K service; the choice depends on the hose construction and the rig’s requirements.',
      },
      {
        q: 'Why a separate cement hose?',
        a: 'Cement slurry is abrasive and sets if left in the line; cement-resistant liners and couplings are made for it.',
      },
    ],
  },

  'low-pressure-oilfield-hoses': {
    guidance: {
      heading: 'Utility hose for the rig',
      body: 'Low-pressure oilfield hose moves drill water, fuel, mud and oil, bulk material and potable water around the rig. Discharge (D) hose works under pressure only; suction-and-discharge (SD) hose holds open under suction too. Fire-resistant Megashield and Flameshield covers suit offshore service, and QC47 couplings connect quickly.\n\nChoose by the medium, whether it runs under suction, and the fire requirements.',
    },
    standards: {
      heading: 'NSF 61 and API 6A',
      body: 'Potable water hose is certified to NSF/ANSI 61, and end connections commonly follow API 6A. Fire-resistant versions state their fire testing on the listing.',
    },
    faq: [
      {
        q: 'D or SD?',
        a: 'D is discharge only; SD is suction and discharge, with reinforcement that stops it collapsing under suction.',
      },
      {
        q: 'Is the potable water hose certified?',
        a: 'Yes — it is certified to NSF/ANSI 61 for drinking water.',
      },
    ],
  },

  'tensioner-compensator-hoses': {
    guidance: {
      heading: 'Hose for motion compensation offshore',
      body: 'Riser tensioner, drill string compensator and hydraulic tensioner hose flexes with every wave as the rig heaves. It is built with fatigue-rated steel-cable reinforcement for millions of cycles. Specify by the system, the working pressure and the cycle life the operator requires.',
    },
    faq: [
      {
        q: 'Why is cycle life the key figure?',
        a: 'Compensation hose flexes continuously, so fatigue, not burst pressure, is what ends its life.',
      },
      {
        q: 'Who makes these hoses?',
        a: 'Continental ContiTech.',
      },
    ],
  },

  'well-service-hoses': {
    guidance: {
      heading: 'Frac, stimulation, test and flare',
      body: 'Well-service hose covers the temporary lines of a well intervention: frac hose assemblies, offshore and onshore stimulation and acidizing hose, well-test production hose, and burner and flare-boom hose. Liners decide suitability — fluoropolymer for acid, abrasion-resistant rubber for proppant, heat-resistant liners for flowback.\n\nSpecify the duty, fluid, pressure and temperature, and the operator’s documentation.',
    },
    standards: {
      heading: 'API specifications by duty',
      body: 'Each listing states the API specification it is built to — API 16C, API 7K or API 17J by service — with end connections commonly to API 6A.',
    },
    faq: [
      {
        q: 'Why does acidizing hose need a special liner?',
        a: 'Acids attack standard rubber liners; a fluoropolymer liner resists them.',
      },
      {
        q: 'What does flare-boom hose carry?',
        a: 'Hot produced fluids from a well test to the burner on the flare boom.',
      },
    ],
  },
}

/**
 * Two category blurbs that state something wrong. Each fix only applies while
 * the stored text still contains the phrase being corrected.
 */
export const SHORT_DESCRIPTION_FIXES: Record<string, { contains: string; replaceWith: string }> = {
  // ISO 7-1 is the BSP taper thread standard, not NPT.
  'npt-adapters': {
    contains: 'ISO 7-1',
    replaceWith:
      'NPT taper adapters to ASME B1.20.1 — 60° thread angle, not interchangeable with 55° BSPT. Seal the taper with PTFE tape or an anaerobic sealant in hydraulic service.',
  },
  // "KC" is a combination nipple, not a Korean or Asian pattern.
  'kc-nipple-fittings': {
    contains: 'Korean',
    replaceWith:
      'KC combination nipples and heavy-duty hose fittings — turn-back and fixed flange, KC nipple, groove KC, hose mender, umbilical slurry, drag hose, frac water, 206 hammer union and suction hose couplings in carbon steel, brass and aluminium.',
  },
}
