/**
 * Long-tail FAQs for 195 hose, lifting and marine categories, 2026-11-20.
 *
 * Each question is built from a real search phrase in the 2026-11-20 keyword
 * map (Google autocomplete, UAE locale with research modifiers — "what are X
 * used for", "X types", "X size chart", "X vs Y" — plus Search Console), or,
 * for shelves with no autocomplete demand, a question a buyer of that range
 * asks. Answers come from the category's own catalogue data only and were
 * script-checked: no number or standard not already in that data, no
 * stock/approval/superlative claims, no near-duplicate of an existing
 * question, at most 8 FAQs per category. Approved by the founder from the
 * review workbook.
 *
 * `existingSha256` hashes the category's FAQ list as it was when these were
 * drafted; the runner appends only if it still matches.
 */
export type CategoryFaqs = { slug: string; existingSha256: string; faqs: Array<{ q: string; a: string }> }

export const CATEGORY_FAQS: CategoryFaqs[] = [
  {
    slug: "abrasive-hoses",
    existingSha256: '409ebab5956e04960c0697c45f954629c7874192522d7c35fd2bf863f58cc9df',
    faqs: [
      { q: "What is a bulk material hose used for?", a: "It carries sand, cement, dry powders, slurry and grain, where wear on the tube decides the service life. Indus supplies a 10 bar bulk material suction and delivery hose and a PREMFLEX MDSE chemical and abrasion PVC hose, both heavy-duty with a helical wire." },
      { q: "What sizes are the abrasive and bulk material hoses?", a: "The 10 bar bulk material suction and delivery hose is listed from 76 mm to 102 mm, and the PREMFLEX PVC hose from 38 mm to 152 mm. Both have a helical wire. Send the material and size for a quote." },
    ],
  },
  {
    slug: "adapter-o-rings",
    existingSha256: '03cd595d16cb36dfe4a26a9488b1a62a0b5f59e47110c8434b91a744f7515985',
    faqs: [
      { q: "What sizes do ORB O-rings come in?", a: "The O-rings for ORB male ports run from 1/8\" to 2\", and those for ORFS face seals from 1/4\" to 1-1/2\". Both are available in Buna-N (NBR) and Viton (FKM). The size table on this page lists them." },
      { q: "What is in the hydraulic O-ring assortment kit?", a: "The kit has 288 pieces in 24 O-ring sizes, supplied in a steel case. It is listed alongside the Buna-N (NBR) and Viton (FKM) replacement O-rings for ORB male ports and ORFS face seals." },
    ],
  },
  {
    slug: "air-water-hoses",
    existingSha256: '0659ab43d963b5adbae4668dd30820ecd3759052cc8e61bcc59f7473571f3566',
    faqs: [
      { q: "What types of air and water hose are there?", a: "The range includes the Indus A-series at 20 bar working pressure with EPDM or SBR rubber tube and cover and textile reinforcement. Anti-static, multi-utility and high-temperature variants are listed, along with pressure wash, push-lock and coiled air types. Supplied from Dubai." },
      { q: "Which specification applies to air and water hoses?", a: "BS 5118/2 and ISO 2398 are the standards quoted for the range. The Indus A-series is 20 bar working pressure with EPDM or SBR rubber tube and cover. Send your hose size and duty for a quote." },
      { q: "What sizes do pressure wash and push-lock hoses come in?", a: "The pressure wash hose is listed from 1/4\" to 3/8\" and the push-lock hose from 1/4\" to 3/4\". Both are rated for -40 °F to 212 °F (-40 °C to 100 °C). Send the size and duty for a quote." },
    ],
  },
  {
    slug: "alloy-lifting-chain",
    existingSha256: 'c26ae8744ec0ac45706f0b870d0ca37cf3586dae5fe3681c5d7852371148a12c',
    faqs: [
      { q: "What is the capacity of Grade 80 lifting chain?", a: "Grade 80 alloy lifting chain is listed from 6 mm (1/4″) to 26 mm (1″), with working load limits from 1,150 to 20,000 kg. Grade 80 hoist chain to EN 818-7 is listed from 140 to 12,500 kg. The working load limit for each size is on this page." },
      { q: "What is the capacity of Grade 100 lifting chain?", a: "Grade 100 alloy lifting chain is listed from 6 mm to 26 mm, with working load limits from 1.4 to 26.5 t. Break forces run from 57 to 1,062 kN across those sizes. The working load limit for each size is listed on this page." },
    ],
  },
  {
    slug: "anchor-chain",
    existingSha256: '53d3de30b7b3868169c992aedd429f1c64655abfe6a297b009d97af9680271da',
    faqs: [
      { q: "What sizes does anchor chain come in?", a: "Stud link anchor chain is listed from 1/2\" (12.5 mm) to 6-3/8\" (162 mm), and studless from 1/2\" (12.5 mm) to 3-9/16\" (90 mm). The size table on this page gives the proof and breaking load and weight per shot for each size." },
      { q: "What types of anchor chain are there?", a: "There are two types: stud link and studless anchor chain cable, both in Grades U1, U2 and U3 to IACS UR W18. Both are low carbon alloy steel, hot-dip galvanized with a black bitumen coating. Send your vessel's chain size and length for a quote." },
    ],
  },
  {
    slug: "anchor-chain-accessories",
    existingSha256: 'd14cc15657f98e245297bd54825d198ffd315b1265f1781bb03bbdda0f726bdb',
    faqs: [
      { q: "What are the parts of anchor chain?", a: "Indus supplies Kenter and D-type joining shackles, end and enlarged links, anchor shackles, in-line swivels and swivel forerunners, with lead plugs for shackle pins. IACS UR W18 and ISO 1704 are referenced." },
      { q: "What sizes do anchor chain shackles come in?", a: "Kenter and D-type joining shackles to ISO 1704 are listed from 11 mm to 162 mm. In-line mooring swivels are listed from 70–76 mm to 95–102 mm chain. The size table on this page lists each part." },
    ],
  },
  {
    slug: "anchor-chain-fittings",
    existingSha256: '53d3de30b7b3868169c992aedd429f1c64655abfe6a297b009d97af9680271da',
    faqs: [
      { q: "What are the parts of an anchor chain and mooring line?", a: "The range covers stud link and studless anchor chain, offshore mooring chain, and the joining shackles, Kenter shackles, swivels, links and connectors that make up a cable or mooring line. IACS UR W18 and API Spec 2F are referenced." },
      { q: "What sizes do anchor chain shackles and fittings come in?", a: "Joining shackles (D type) and Kenter shackles run from 11 mm to 162 mm to ISO 1704. Lead plugs for the shackle pins cover 12.5 mm chain up to 130-137 mm chain. Send the chain size for a quote." },
    ],
  },
  {
    slug: "anchor-handling-chasers",
    existingSha256: '049e641623367da80f1bebea2722f2f6215a63f861e36b8d251e479bfeea1ee4',
    faqs: [
      { q: "What are anchor handling tools used for?", a: "They are the hardware used to recover anchors and mooring lines. Indus supplies chain chasers, J-chasers, four-prong grapnels, anchor line hooks and chain link hooks from Dubai to marine buyers across the UAE and GCC. Send the chain size and vessel type for a quote." },
      { q: "What anchor handling equipment does Indus supply?", a: "The range covers chain chasers, J-chasers, J-lock chasers, permanent chasers, four-prong grapnels, anchor line hooks, chain link hooks and a swivel shackle for chasers. J-chasers are listed from 110 t to 250 t SWL and four-prong grapnels from 130 t to 250 t WLL. Send the chain size and vessel type for a quote." },
    ],
  },
  {
    slug: "anticorrosive-safety-coatings",
    existingSha256: '0cd7caf4b28a229a8c62c0329ddc45e729dd0488ec1e706f404a4db5c297ad8e',
    faqs: [
      { q: "What is a marine anticorrosive coating?", a: "It is a flexible, one-component coating that protects steel, rubber and stainless on deck without cracking. The transparent version is a plastic-like clear coating with rust inhibitors and UV stabilisers. Indus supplies the range from Dubai, UAE." },
      { q: "What can the transparent anticorrosive coating be used on?", a: "It is listed for steel, stainless steel, copper, aluminium, brass, light alloys and wood. Typical uses include handrails, couplings, pipes and fittings, door hardware, signs, portholes, ventilators, instruments and engine parts. It comes in a 1 kg metal tin." },
      { q: "How is the anticorrosive coating applied and thinned?", a: "It is applied by brush, roller or spray and dries flexible and non-cracking. Thin it and clean up with Ferryl 404 Dilution & Cleaning Liquid, a solvent cleaner and thinner." },
    ],
  },
  {
    slug: "aquaculture-mooring",
    existingSha256: '9d6044f1b32e1885793d2a66850aef784fe81a22180251207eb7877b42c680a3',
    faqs: [
      { q: "What is aquaculture mooring equipment?", a: "It is the mooring gear for fish-farm mooring systems, and Indus supplies it from Dubai, UAE. The range covers anchors, anchor fences, anchor pockets, weights and weak links. Send your site layout or component list for a quote." },
    ],
  },
  {
    slug: "barcelona-geka-couplings",
    existingSha256: 'f63bc8ce43d731d817a999bf55e3f3957e68740fe1c3275fb1c5f0a3032b3ded',
    faqs: [
      { q: "How do Geka couplings work?", a: "Geka couplings are German pattern claw couplings that seal on an NBR gasket. The range here is brass, with Geka couplings in female thread, male thread and hose shank forms, plus a Geka cap. Send the size and thread for a quote." },
      { q: "What sizes are Geka and Barcelona couplings?", a: "The brass Geka couplings and cap are listed from 1/4\" to 1\". The Barcelona (Spanish pattern) female thread coupling is aluminium and listed from 3/4\" to 4\". All seal on NBR gaskets. The size table on this page lists them." },
      { q: "What is the difference between Barcelona and Geka couplings?", a: "Barcelona is the Spanish pattern and is supplied here in aluminium, while Geka is the German pattern and is supplied in brass. Both seal on NBR gaskets. There are five listings in total, covering couplings, adapters and caps." },
    ],
  },
  {
    slug: "bauer-type-couplings",
    existingSha256: '80aee591c489e367b223831993f0a4bc8b852c23a3f1c20f7da19c9be38feee9',
    faqs: [
      { q: "What is a Bauer type coupling used for?", a: "Bauer type couplings are quick-connect lever-ring couplings used for agriculture, water transfer, irrigation and dewatering. Indus supplies them from Dubai in zinc-plated steel, in sizes 2\" to 6\" and rated up to 16 bar working pressure. They are compatible with other Bauer-pattern couplings." },
      { q: "Which Bauer type fittings does Indus list?", a: "Increasers, reducers and flange ends are listed, along with hose shank and flanged complete sets and quick connect by MNPT ends. The flanged sets use ASA (ASME) Class 150 flanges, and the parts are zinc-plated carbon steel. Send your hose size and end connection for a quote." },
    ],
  },
  {
    slug: "beam-trolleys",
    existingSha256: '29acde378035ca5f08e418a67c508b73e30c1dcb017b6502d3c0118828d506e7',
    faqs: [
      { q: "What beam trolley sizes and capacities are available?", a: "Push and geared beam trolleys are listed from 0.5 t up to 20 t, with ranges of 0.5 to 5 t, 0.5 to 10 t and 0.5 to 20 t. Each is offered as Type B, Type C or Type F. They run a hoist along an I-beam, and the size table on this page lists each model." },
    ],
  },
  {
    slug: "below-the-hook-attachments",
    existingSha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    faqs: [
      { q: "What are lifting attachments used for?", a: "Lifting attachments connect the crane hook to loads that have no lifting points of their own, or whose lifting points are in awkward places. The range includes offset and cantilever attachments, scissor grabs, bolt-on lifting tools, C-hooks and forklift attachments." },
      { q: "Which standard do the lifting attachments follow?", a: "The attachments are listed to EN 13155, with ASME B30.20 / BTH-1 or DNV offshore design available on request. Forklift lifting attachments are rated with the truck, with an ISO 3691 capacity check." },
      { q: "How are the lifting attachments supplied?", a: "The offset, scissor, bolt-on and C-hook attachments are made to order, built to the load from an approved general arrangement drawing. The listings state load testing before dispatch, with a declaration of conformity and test certificate. Send the load and how it must be handled." },
    ],
  },
  {
    slug: "below-the-hook-lifting",
    existingSha256: '6ca8a11a3b1e9e8faffe9ca11233b559d4bbbdd39a329d82242bdf222d52b11a',
    faqs: [
      { q: "What are below-the-hook lifting devices?", a: "They are everything that hangs between the crane hook and the load. This covers spreader beams and frames with published load charts, and lifting beams, frames and attachments engineered for one load." },
      { q: "What below-the-hook lifting equipment do you supply?", a: "The range covers lifting beams, container lifting frames, lifting attachments and tools, spreader frames and H-frames, spreader beams, and gantries and handling equipment. Modular spreader beams are listed at 24 t, 34 t and 50 t WLL to EN 13155." },
    ],
  },
  {
    slug: "bollards-mooring",
    existingSha256: 'fb0485195027c0c1d99abe6ccac7df9350f690820b1603d54b203cb064c6daef',
    faqs: [
      { q: "What types of marine bollard are there?", a: "The range includes double and cross bollards to GB/T 554, ISO 13795, JIS F 2001, DIN 82607 and CB/T standards. It also lists single bitt, twin horn, stag horn, curved and inclined bollards, and T, J, K, R-head and CVI dock bollards. Stainless cleats, chocks and fairleads are listed too." },
      { q: "What are marine bollards made from?", a: "The listed bollards are made from steel plate, cast steel, casting steel or cast iron, depending on the type. Stainless steel cross bollards (4\" to 8\") and stainless cleats in AISI 316 are also listed. The size table on this page shows each listing." },
    ],
  },
  {
    slug: "braided-hose-crimp-fittings",
    existingSha256: '776835f1d51745f0f041e1c1096cbf3d00f6bb0fb3a5e66822aae7d01a43768e',
    faqs: [
      { q: "What types of braided hose crimp fitting are there?", a: "The range has BSP 60° cone, DIN 24° cone, JIC 37°, ORFS, SAE 45° flare, NPT and flange ends. They come straight and in 45° and 90° elbows. They are one-piece hose ends with the ferrule attached, crimped onto one- or two-wire-braid hydraulic hose." },
      { q: "Which standards do braided hose crimp fittings follow?", a: "Listings quote standards such as SAE J1453 / ISO 8434-3 for ORFS, SAE J512 for SAE 45° flare, ISO 12151-2 for DIN 24° cone and ISO 12151-6 for BSP ends. The fittings suit EN 853 1SN and 2SN and SAE 100R1AT and 100R2AT hose." },
    ],
  },
  {
    slug: "brass-air-brake-fittings",
    existingSha256: 'b5a0b3318e41e19ba7bad9a7e47e6c6589b98558b606824cac3ade3491401a2b',
    faqs: [
      { q: "What sizes do the brass air brake fittings cover?", a: "The listed fittings suit tube from 1/4\" to 3/4\", for example 3/8\" to 5/8\" on the 90° union elbow and 1/4\" to 3/4\" on the bulkhead union. They are made in CA360 brass for copper and nylon brake tubing. The size table on this page lists each fitting." },
      { q: "How does a compression air brake fitting hold nylon tubing?", a: "The nut squeezes a brass sleeve onto the tube, and a brass tube insert supports the bore. The range includes unions, 90° elbows, bulkhead unions, tube inserts, tube nuts and sleeves for copper and nylon tubing. Send your tube size and fitting type for a quote." },
    ],
  },
  {
    slug: "brass-bsp-metric-adapters",
    existingSha256: 'd02c0840f9fe14403bb76c0335b4c147f53bf43f5c1ac331f37b72abd3c3da28',
    faqs: [
      { q: "What is the difference between BSPP and BSPT brass adapters?", a: "BSPP is a parallel thread and seals on a bonded seal, washer or cone seat rather than on the thread, to ISO 228-1. BSPT is a taper thread that seals on the thread flanks, to ISO 7-1. The range lists both, so confirm which thread your port uses before ordering." },
      { q: "What sizes do brass BSPP adapters come in?", a: "The BSPP straight adapters run from 1/8\" to 1-1/2\" (G1/8-28 to G1-1/2-11), and some listings extend to 2\". BSPT elbows, tees and plugs are listed from 1/8\" to 3/4\" or 1\" (R1/8-28 to R1-11). The size table on this page shows each listing." },
    ],
  },
  {
    slug: "brass-compression-fittings",
    existingSha256: 'b5a0b3318e41e19ba7bad9a7e47e6c6589b98558b606824cac3ade3491401a2b',
    faqs: [
      { q: "How do brass compression fittings work?", a: "They are flareless fittings: the nut squeezes a brass sleeve onto the tube, so the tube needs no flare. The range covers nuts, long nuts, sleeves, unions and 90° elbows, with SAE J512 and ASME B1.20.3 references." },
      { q: "What types of brass compression fittings are there?", a: "The range covers compression nuts, long nuts, sleeves, straight unions and 90° elbow unions. Nuts and sleeves are listed for 1/8\" to 7/8\" tube and long nuts for 3/16\" to 3/4\" tube, all in brass to SAE J512." },
    ],
  },
  {
    slug: "brass-dot-push-in-air-brake-fittings",
    existingSha256: '93bc2ac7dd45c402032e110433ae02feecc389613c4948275cff1bdd3a66b1f6',
    faqs: [
      { q: "How does a DOT push-in air brake fitting work?", a: "The tube is pushed in, held by a gripping collet and sealed by an O-ring. These brass fittings suit SAE J844 nylon tubing in sizes 1/4\" to 1/2\". The range includes unions, bulkhead unions, 90° elbows, tees and NPTF female connectors." },
      { q: "What types of brass push-in air brake fitting are available?", a: "The range has brass push-in unions, bulkhead unions, 90° union elbows and union tees, plus connectors and 90° elbows with an NPTF female thread. Tube sizes run from 1/4\" to 1/2\"." },
    ],
  },
  {
    slug: "brass-hose-barbs",
    existingSha256: '8ce154b581434fe987d2e73853c84d9665805cdeefed74577780c0cd0cf35d51',
    faqs: [
      { q: "What is a hose barb fitting?", a: "A hose barb fitting is a hose end that a hose is clamped onto, here in brass for low-pressure hose. The range includes barb menders in 90° elbow and tee form, and barbs ending in JIC 37°, NPSM or dual-seat (SAE 45° / JIC 37°) female swivels." },
      { q: "What sizes do brass hose barb fittings come in?", a: "Barb sizes run from 3/16\" to 1\", paired with threads such as NPTF 1/8\" to 1\", NPSM 1/8\" to 3/4\" and JIC 37° 3/8\" to 3/4\". Menders join 1/4\" to 1/2\" or 3/16\" to 3/4\" barbs. The size table on this page lists them." },
      { q: "What types of brass hose barb are there?", a: "Types include straight barbs to NPTF, NPSM, JIC 37° and SAE 45° flare threads, 45° and 90° elbows, a tee, and barb menders in 90° elbow and tee form. Send your hose size and thread and Indus will quote." },
    ],
  },
  {
    slug: "brass-inverted-flare-fittings",
    existingSha256: 'b5a0b3318e41e19ba7bad9a7e47e6c6589b98558b606824cac3ade3491401a2b',
    faqs: [
      { q: "What does an inverted flare fitting look like?", a: "A double-flared tube end is clamped inside the port by a male tube nut, so the seal sits inside and the threads are shielded. Indus supplies brass inverted flare tube nuts, unions, 90° elbow unions, tees and NPTF female elbows, to SAE J512 and ASME B1.20.3." },
      { q: "What sizes do brass inverted flare fittings come in?", a: "Tube nuts run from 3/16\" to 1/2\" and straight unions from 1/8\" to 5/8\". They are CA360 brass for brake, fuel and other small-bore tube lines. Send the tube size and thread for a quote." },
    ],
  },
  {
    slug: "brass-nptf-pipe-fittings",
    existingSha256: 'b5a0b3318e41e19ba7bad9a7e47e6c6589b98558b606824cac3ade3491401a2b',
    faqs: [
      { q: "What is an NPTF fitting?", a: "NPTF is a Dryseal taper pipe thread, cut so the crests and roots close up as the joint is tightened, so it seals on the thread. Indus supplies brass NPTF fittings from Dubai for air, water, fuel and low-pressure oil lines, with threads to ASME B1.20.1 and B1.20.3." },
      { q: "What brass NPT pipe fittings are listed?", a: "The range includes 45° and 90° street elbows, NPSM locknuts and garden hose by NPTF adapters. The NPSM locknuts run from 1/8\" to 1/2\". Send the thread and size for a quote." },
    ],
  },
  {
    slug: "brass-push-lock-hose-barbs",
    existingSha256: 'b5a0b3318e41e19ba7bad9a7e47e6c6589b98558b606824cac3ade3491401a2b',
    faqs: [
      { q: "What types of brass push-lock hose barb fitting are there?", a: "The range includes swivel hose barb adapters and push-lock barbs with NPTF male and female, NPSM, JIC 37° and SAE 45° flare ends. They are push-on barbs for push-lock hose, fitted without clamps or ferrules." },
      { q: "What sizes do brass push-lock hose barbs come in?", a: "Push-lock barbs are listed from 1/4\" to 3/4\", with NPTF threads from 1/4\" to 3/4\" and SAE 45° flare ends from 1/4\" to 3/4\". Plain tube shank barbs start at 3/16\". The size table on this page shows each listing." },
      { q: "What is the specification of brass push-lock hose barbs?", a: "The barbs are CA360 brass (C36000 free-machining brass). Threads are listed to ASME B1.20.1 and B1.20.3 for NPTF, SAE J512 for 45° flare and ISO 228-1 for parallel threads. The hose is pushed over the barbs and held without a clamp or ferrule." },
    ],
  },
  {
    slug: "brass-sae-45-flare-fittings",
    existingSha256: 'b5a0b3318e41e19ba7bad9a7e47e6c6589b98558b606824cac3ade3491401a2b',
    faqs: [
      { q: "What sizes do brass SAE 45° flare fittings come in?", a: "The 45° flare ends run from 3/16\" to 3/4\", and the NPTF threads from 1/8\" to 3/4\". The 14 listings are CA360 brass and cover caps, connectors and 45° and 90° elbows to SAE J512. Send the thread and tube size for a quote." },
      { q: "What are brass SAE 45° flare fittings used for?", a: "They are used on low and medium pressure tube lines. The 45° flare on the male seats metal to metal in the 45° cone of the female. Indus supplies them from Dubai to SAE J512; send the thread and tube size for a quote." },
    ],
  },
  {
    slug: "breakaway-couplings",
    existingSha256: '116119a4e354b89ee79b443b7d414d532afb5254f4a36a22ac8cf06c56e2322c',
    faqs: [
      { q: "What is the difference between cable-release and breaking-bolt breakaway couplings?", a: "The cable-release type (SBC-C) parts when a release cable is pulled, and is listed from DN 50 to DN 150. The breaking-bolt type is listed from DN 25 to DN 300. Choose by how the line is installed and what its piping can take." },
      { q: "How does a safety breakaway coupling work?", a: "It is installed as the weakest link in a transfer line, so it separates before the hose, loading arm or manifold is damaged. The valves in both halves close as it parts, so only the volume between them is lost. Seals, connections and working pressure are confirmed with the quotation." },
    ],
  },
  {
    slug: "bsp-hose-fittings",
    existingSha256: 'c2cdb205f66bcaba1fa0bed98296dd7ab3d176f08bad089bb3f4e5497dea7373',
    faqs: [
      { q: "What types of BSP hose fitting are there?", a: "The range covers BSP parallel and tapered threads, 60° cone seats, banjo bolts and eyes, flat-face seats and multiseal ends, in straight, 45° and 90° configurations. Parallel threads follow ISO 228-1 and taper (R) threads follow ISO 7-1." },
      { q: "What sizes are covered by BSP hose fittings?", a: "The listed 60° cone BSPP female swivel fittings run from G1/4 to G2 in common sizes, with dash sizes -03 to -32. The size table on this page lists each fitting's thread and hose size." },
    ],
  },
  {
    slug: "bsp-hydraulic-adapters-uae",
    existingSha256: '2bf809c3328eadc3c33a85568e59f2fc91eee9d357e7d5c8c42397f9f5158ce8',
    faqs: [
      { q: "What sizes are in the BSP hydraulic fitting size chart?", a: "BSPP parallel threads run from G1/8 to G2 and BSPT taper threads from Rc1/8 to Rc1-1/4. Pressure is up to 400 bar at smaller sizes and derates with size. Send the thread and size for a quote." },
      { q: "What is in the BSP hydraulic fittings catalogue?", a: "The 119 listings include connectors, unions, 45° and 90° elbows, tees, crosses, bulkheads, plugs, caps and butt-weld ends, plus BSP to metric, JIC, NPT and JIS gas. They are supplied from Dubai with BSPP or BSPT threads." },
    ],
  },
  {
    slug: "bw-series-crimp-fittings",
    existingSha256: '8ce154b581434fe987d2e73853c84d9665805cdeefed74577780c0cd0cf35d51',
    faqs: [
      { q: "What types of BW series crimp fittings are there?", a: "The 13 listings include the Caterpillar flange fitting in straight, 45° and 90° forms, SAE Code 61 flange fittings with 22° and 30° bends, and a hose mender. They are carbon steel." },
      { q: "What sizes do BW series crimp fittings come in?", a: "Caterpillar flange fittings are listed from 3/4\" to 1-1/2\" for -12 to -24 hose. SAE Code 61 flange fittings run from 3/4\" to 2\" for -12 to -32 hose, and the hose mender from 1/4\" to 1/2\" hose ID." },
    ],
  },
  {
    slug: "cable-socks",
    existingSha256: '423fe7ba77ad57e8fb93f5214318a8ae4358468649564f3946d4797bf13cd846',
    faqs: [
      { q: "What sizes do cable socks come in?", a: "Single-eye, double-eye and side-pull cable socks are listed from 6-10 mm to 120-150 mm with loads of 250 to 6,000 kg. The high-voltage cable sock runs from 25-70 mm to 500-630 mm at 3,000 to 6,500 kg. The size table on this page lists each sock." },
      { q: "What types of cable sock are there?", a: "The range has single-eye, double-eye, side-pull and high-voltage cable socks. They are pulling grips for drawing cable and hose. Send your cable or hose size for a quote from Dubai." },
    ],
  },
  {
    slug: "cam-and-groove-couplings",
    existingSha256: '0d208149e62aab294d90c49705800247da6832f287fa8930135d33fe92f2ebce',
    faqs: [
      { q: "How do cam and groove couplings work?", a: "A grooved male adapter is locked into a female coupler by two cam arms. They are used for liquid and dry-bulk transfer at low to medium pressure. Indus supplies them from Dubai across the UAE." },
      { q: "What types of cam and groove coupling are there?", a: "They come in Types A to F, DA and DD, with dust caps, plugs, self-locking and crimp-shank versions, and 45° and 90° elbows. Listings quote A-A-59326 and EN 14420-7. Sizes in the range include 1\", 1-1/2\", 2\", 2-1/2\", 3\", 4\" and 6\"." },
    ],
  },
  {
    slug: "chain-blocks-manual-hoists",
    existingSha256: '1d0333c239ce46906d2b5fcf78bba50ca04d6853a272e8a591a1a9c38919481e',
    faqs: [
      { q: "What capacity range do chain blocks and lever hoists cover?", a: "Manual chain blocks are listed from 0.25 to 10 t WLL, lever hoists from 0.5 to 9 t WLL (Type VA 0.5 to 6 t, Type D 0.8 to 9 t, Type VL 0.5 to 9 t) and trolley chain hoists from 0.5 to 5 t. Wire rope pullers cover 0.8 to 3.2 t." },
      { q: "What types of manual chain block and hoist are available?", a: "The range has manual chain blocks (Type ORM), hand chain hoists, lever hoists (Types VA, D and VL), close headroom trolley chain hoists and wire rope pullers. They lift, pull and position loads by hand." },
    ],
  },
  {
    slug: "chain-slings",
    existingSha256: 'a74b9d808d6830f09e09db1d7a429e0de553c64088172a3c5e3d53fbfd992008',
    faqs: [
      { q: "What is the capacity range of chain slings?", a: "Four-leg Grade 80 chain slings are listed from 1.05 to 164.8 t on 4 mm to 50 mm chain, with legs up to 45° from vertical. Single-leg slings are listed from 0.5 to 78.5 t. The size table on this page shows each listing." },
      { q: "What types of chain sling are there?", a: "Indus supplies Grade 80 and Grade 100 chain slings in single-, two-, three- and four-leg make-ups. End fittings are sling, grab, foundry or self-locking hooks or oblong links, and each is made up to the reach you need." },
    ],
  },
  {
    slug: "commercial-transport-chain",
    existingSha256: 'c26ae8744ec0ac45706f0b870d0ca37cf3586dae5fe3681c5d7852371148a12c',
    faqs: [
      { q: "What sizes and working loads does grade 43 high test chain come in?", a: "Grade 43 high test chain is listed in inch sizes from 1/4\" to 5/8\", with working load limits from 1,180 to 6,200 kg. Each size and rating is shown in the size table on this page. Indus supplies it from Dubai alongside Grade 30 and Grade 70 chain." },
      { q: "What sizes does grade 70 transport chain come in?", a: "Grade 70 chain to AS/NZS 4344 is listed from 6 mm to 13 mm in alloy steel, rated 44.1 to 176 kN, with a yellow or white zinc chromate finish. Grade 70 trailer safety chain to NZS 5467 is listed in 8 mm and 10 mm, 5 to 7 t. The size table on this page lists each one." },
    ],
  },
  {
    slug: "composite-hose-fittings",
    existingSha256: 'c944e8f58825e3e3651ea5c362febb05c2c047349a0859940ddc251339972e1b',
    faqs: [
      { q: "What are composite hose fittings made from?", a: "The fittings are made in aluminium, gunmetal, SS316 and SS304 in sizes 1\" to 4\". Camlock types use NBR, Viton or silicone gaskets. They suit multi-ply oil tanker, vapour recovery and chemical hoses to EN 13765:2015 Type 3." },
      { q: "What is composite hose and what fittings go with it?", a: "Composite hose is a multi-ply hose used for oil tanker, vapour recovery and chemical transfer. The fittings here are SS hex male, female liner with lug nut, Camlock Type C and E with spiral tail, and spiral tail × flange." },
    ],
  },
  {
    slug: "composite-hoses",
    existingSha256: 'f3f217e7db096221ba33e32f44611d3e2fdaf001887f4cfe3b817f18cd0df212',
    faqs: [
      { q: "What are the specifications of the composite hoses?", a: "The chemical composite hose is listed at 25 mm to 100 mm, 20 bar and -30°C to +80°C. The oil and PTFE chemical hoses are 20 bar and the vapour recovery hose 14 bar. They are multi-ply with internal and external wire helix, to EN 13765:2015 Type 3." },
      { q: "What types of composite hose are available?", a: "The range has oil (A901GG), vapour recovery (A901AG), chemical (A906PG) and PTFE chemical (A911SG) composite hoses. All are multi-ply hoses with polypropylene and polyester layers." },
    ],
  },
  {
    slug: "container-lifting-frames",
    existingSha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    faqs: [
      { q: "What sizes of container lifting frame can be supplied?", a: "Frames are made to order for 20 ft and 40 ft ISO containers, lifting by the top corner castings. They are built in structural steel, painted to your specification, with galvanizing available for outdoor use on request. Send your container size and load for a quote." },
      { q: "What standard do container lifting frames follow?", a: "They are designed to EN 13155, with ASME B30.20 / BTH-1 or DNV offshore design available on request. Each frame is made to order from a general arrangement drawing, so your load and container size set the design." },
    ],
  },
  {
    slug: "crimp-ferrules",
    existingSha256: '4f27da549de2edbd18dfb8b9af23ed9556c97309638850d51a44871dace154d3',
    faqs: [
      { q: "What is a crimp ferrule?", a: "A crimp ferrule is a steel sleeve pressed over a hose end to lock it onto the fitting stem. Indus supplies the range from Dubai in zinc-plated carbon steel for SAE, EN and DIN hose grades. Send the hose type and size for a quote." },
      { q: "What sizes do crimp ferrules come in?", a: "No-skive ferrules for 1SN and 2SN hose run from DN6 to DN51 (1/4\" to 2\"), and double-skive ferrules for R13 hose from DN10 to DN51 (3/8\" to 2\"). They are zinc-plated carbon steel. Send the hose type and size for a quote." },
      { q: "Which hose types do the crimp ferrules fit?", a: "They come for SAE, EN and DIN hose grades, including 1SN and 2SN, R5, R13 and automotive A/C hose. Constructions are no-skive, skive, double-skive and interlock. Send the hose specification for a quote." },
    ],
  },
  {
    slug: "crowfoot-couplings",
    existingSha256: '2cf9c2e66bfeeac27c1eb7fc7e204819d3dfc958425ddcea7a479298734056b6',
    faqs: [
      { q: "What are crowfoot couplings?", a: "Crowfoot couplings, also called Chicago or universal couplings, lock two hose ends together with a quarter turn of the lugs. The range is 316 stainless steel, plus zinc-plated iron four-lug versions for air, water and steam service." },
      { q: "What types of crowfoot coupling are there?", a: "The 316 stainless steel range comes as hose end, female NPT, male NPT, triple connection and blank end types. The NPT threads are to ASME B1.20.1. Zinc-plated iron four-lug versions are also listed for air, water and steam service." },
      { q: "What sizes do crowfoot hose couplings come in?", a: "The 316 stainless steel hose end, female NPT and male NPT crowfoot couplings are listed in 1/2\", 3/4\" and 1\". The blank end coupling has one universal head and no size listed." },
    ],
  },
  {
    slug: "din-2353-bite-type-adapters-uae",
    existingSha256: '57d139f8f2c156217c7ce5168ea6e3fc23cfefd598383c7cea58bfef54afed56',
    faqs: [
      { q: "What types of hydraulic adapter are in the DIN 2353 bite type range?", a: "The range includes unions, elbows, tees, crosses, bulkheads, adjustable stud ends, banjos, nuts, cutting rings and blanking plugs. They are 24° cone tube fittings to DIN 2353 / ISO 8434-1, with BSPP, BSPT, NPT and metric ends. Send a list or drawing for a quote." },
      { q: "What sizes are in the DIN 2353 hydraulic adapter size chart?", a: "The light series runs from L6 to L42 and the heavy series from S6 to S38, with metric 24° cone threads from M10×1 to M42×2. The listings give L-series pressure up to 250 bar (3625 psi) and S-series up to 400 bar (5800 psi). Send your tube size and series for a quote." },
    ],
  },
  {
    slug: "din-hose-fittings",
    existingSha256: '0c174f13f785058ef74b535c8ab43b2fc14db54556a8e439d66f9ad39c1717ea',
    faqs: [
      { q: "What types of DIN hose fittings are there?", a: "They are 24° cone hydraulic hose fittings: standpipes and female-swivel 24° cone ends with O-ring, in light and heavy series. They come in straight, 45° and 90° configurations. Indus supplies them from Dubai, UAE." },
      { q: "Which standards apply to DIN hose fittings?", a: "The listings reference DIN 2353, ISO 8434-1 and ISO 12151-2, with DIN 3861 for heavy series and DIN 3865 for 24° O-ring cone ends. The heavy series is listed from DN6 to DN38." },
    ],
  },
  {
    slug: "din-link-chain",
    existingSha256: 'cc0fbba72e3ca35e046591da209b261156a58b8071dbe005f2acde2043c94d21',
    faqs: [
      { q: "What are the dimensions of DIN 766 chain?", a: "DIN 766 short link chain is listed from 2 mm to 32 mm, with 1.25 to 500 kN. DIN 766 calibrated chain is listed from 5 mm to 13 mm in mild steel, zinc plated or with an electrophoretic coating. The size table on this page shows each listing." },
      { q: "What is the difference between DIN 763 and DIN 764 chain?", a: "DIN 763 is a long link chain listed from 2 mm to 32 mm, with 25 to 8,000 kg WLL. DIN 764 is a medium link chain listed from 4 mm to 33 mm, with 7 to 500 kN. Indus also lists DIN 5685 short and long link chain from 2 mm to 13 mm." },
    ],
  },
  {
    slug: "drilling-hoses",
    existingSha256: '00734295c40e9acba21cb1c9245dce3d36369d71d4739e876eec13e4e8fdbcbc',
    faqs: [
      { q: "What types of drilling hose are there?", a: "The range covers rotary and vibrator hose in mud-bonded, mud-crimped, cement-bonded and swaged-coupling forms, a high-temperature and sour-service version, and a mud booster hose. They are listed to API Specification 7K or API 7K-equivalent for mud booster service." },
      { q: "What working pressure are rotary and vibrator drilling hoses rated to?", a: "The API 7K rotary and vibrator hoses are listed at 5000 psi working pressure and 12500 psi minimum burst pressure, in 2\" to 5\" sizes. The mud booster hose is listed at 3000 psi working and 7500 psi burst, in 3\" to 5\". Temperature is -30°C to +82°C, or up to +121°C on the high-temperature version." },
      { q: "Is there a sour service drilling hose?", a: "Yes, a rotary and vibrator hose is listed for high temperature and sour service to API 7K and NACE MR-0175. It uses HNBR or sour-service-rated synthetic rubber, is rated 5000 psi working pressure and runs from -30°C to +121°C. Sizes are 2\" to 5\"." },
    ],
  },
  {
    slug: "dry-disconnect-couplings",
    existingSha256: '1664814e509570fbe977198a3b069e10cc7f32aadd16573484f72c03d51e278b',
    faqs: [
      { q: "What is a dry disconnect coupling?", a: "A dry disconnect coupling has a valve in both halves, so the line closes before it comes apart and nothing spills. Indus supplies them to UAE and GCC buyers in fuel, chemical, LPG and aviation-fuel types from 1\" to 8\". Tell us the product and connection standard for a quote." },
      { q: "How does a dry break coupling work?", a: "A dry break (dry disconnect) coupling has a valve in each half, so the line closes before the halves come apart and nothing spills. The range includes tank units, hose units and caps. Tell us the product being transferred and the connection standard for a quote." },
      { q: "What types of dry disconnect coupling are available?", a: "They come in fuel, chemical, LPG and aviation-fuel types from 1\" to 8\", with tank units, hose units and caps. Listings include Bayloc and bayonet-style couplers with female NPT ends, and a 2-1/2\" aviation coupling with a bayonet interface to ISO 45 / STANAG 3105. Tell us the product and connection standard for a quote." },
    ],
  },
  {
    slug: "electric-hoists",
    existingSha256: 'a8fc862aaf8bcb3d4a18dfe66424c58181f0408a649f6e2c54a708e10058ca6a',
    faqs: [
      { q: "What types of electric hoist are there?", a: "The range has Type A (0.5 to 3 t), Type B (0.25 to 2 t), HHBB and VKL (0.5 to 5 t) electric chain hoists. It also has 220 V mini wire rope hoists, low-headroom and foot-mounted wire rope hoists, and MD1 two-speed wire rope hoists from 0.5 to 16 t WLL." },
      { q: "What is the difference between an electric chain hoist and a wire rope hoist?", a: "In this range, the electric chain hoists cover 0.25 to 5 t WLL, while the MD1 two-speed electric wire rope hoists go up to 16 t WLL. The wire rope hoists also come in low-headroom and foot-mounted forms with 2/1 reeving. Send your load and lift height for a quote." },
      { q: "What is the specification of an electric chain hoist?", a: "The 0.5 to 5 t electric chain hoists are listed with a steel body, alloy load chain and forged hook, painted. Capacities run from 0.25 t to 5 t WLL across Types A, B, HHBB and VKL. Send your load, lift height and power supply for a quote." },
    ],
  },
  {
    slug: "en14420-5-fittings",
    existingSha256: 'c69cb7719ae40662dab329c016f2ac8f2501b3a935a6deca6fa5a95d1919cf27',
    faqs: [
      { q: "What types of EN 14420-5 hose fitting are there?", a: "There are GA male-thread and GI female-thread fittings, each with a serrated or smooth tail, in stainless steel or brass. They are threaded hose fittings made for assembly with EN 14420-3 / DIN 2817 safety clamps." },
      { q: "What sizes and materials do EN 14420-5 fittings come in?", a: "They are listed from 1/2\" to 4\" in brass, or in SS304 or SS316 stainless steel. Some listings state a PTFE or PU gasket. The size table on this page shows each listing, and you can send a list for a quote." },
    ],
  },
  {
    slug: "eye-bolts-eye-nuts",
    existingSha256: '8d64285a2033302d72f2d182826a7c297eb36588a74e2ad4a4fb032b6e55f8c7',
    faqs: [
      { q: "What is an eye nut?", a: "An eye nut is a threaded fitting with a forged or formed eye that screws onto a load to give a lifting or fixing point. The range includes DIN 582 eye nuts (M8 to M64), JIS B 1169 eye nuts and US type eye nuts from 1/4\" to 2\"." },
      { q: "What sizes do eye bolts come in?", a: "The DIN 580 eye bolt runs from M8 to M100×6 (140 to 40,000 kg WLL), the BS 4278 collared eyebolt from M6 to M64 (0.1 to 20 t) and the JIS B 1168 eye bolt from M8 to M64 (80 to 9,000 kg). The size table on this page lists them." },
    ],
  },
  {
    slug: "ferrules",
    existingSha256: '01f6f392f9433fe094e8741072d7048d7ba6410dd5940d01f5d71bf70e75ed95',
    faqs: [
      { q: "What are ferrules used for on hydraulic hose?", a: "Ferrules are the crimped sleeves used with hose ends on hydraulic hose, and we supply them from Dubai to hose assemblers across the UAE and GCC. The Manuli range covers wire braid, wire spiral, textile braid and compact hoses. Match the series to your hose and fitting before ordering." },
      { q: "What are the types of hydraulic hose ferrules?", a: "The two constructions are skive and no-skive. A no-skive ferrule is crimped straight over the hose cover with no skiving step, while with a skive ferrule the cover is skived back so the ferrule closes directly onto the wire reinforcement. The Manuli range is listed by part-reference series." },
      { q: "Is there a ferrule size chart for hydraulic hose?", a: "Yes, the size table on this page lists each series. The range runs from DN5 to DN102 (3/16\" to 4\"), with no-skive series M03400 and M03450 covering wire braid hoses from -3 to -64. Skive series such as M00110, M00120 and M00130 cover DN5 to DN51 (3/16\" to 2\")." },
    ],
  },
  {
    slug: "fibre-rope-twine",
    existingSha256: '501eb201cf03a55171678f77eea84ae0ec00971423d8cd95115a6d6ed07b9da8',
    faqs: [
      { q: "What materials is fibre rope made from?", a: "Fibre rope and twine are supplied in polypropylene, polyethylene, polyester, nylon and HMPE. Constructions include twisted, braided and double braid rope, danline rope and steel-core combination rope." },
      { q: "What is the difference between polypropylene rope and polyester rope?", a: "Polypropylene is listed at a density of 0.91 and floats, while polyester is listed at 1.38 and sinks. Polypropylene shows a heat figure of about 165 °C and polyester about 260 °C. Send the diameter and length you need for a quote." },
      { q: "What sizes does polypropylene rope come in?", a: "Polypropylene danline and multifilament rope are listed from 4 mm to 60 mm, and polypropylene twisted rope from 4 mm to 30 mm. Load ratings are given on request and confirmed on quotation." },
    ],
  },
  {
    slug: "flareless-bite-type-tube-fittings",
    existingSha256: '515acc0cf29ed901d7d1fe79eb3ba02fd3db4a5cc485de19cdd8d078808ac32f',
    faqs: [
      { q: "What are flareless bite-type tube fittings?", a: "The sleeve bites into plain tube as the nut is tightened, so the tube needs no flare. The 30 listings are for inch outside-diameter hydraulic tube, in zinc-plated steel to SAE J514." },
      { q: "What types of flareless tube fittings are there?", a: "The range includes unions, tees, crosses, reducers and bulkhead unions. Tees are listed for 1/8\" to 1\" tube, crosses for 1/4\" to 1/2\", and reducers for 3/8\" to 1-1/4\"." },
    ],
  },
  {
    slug: "food-beverage-hoses",
    existingSha256: 'd20770022512e4a8b550b94aa0837cf92b3c3edbc3eeb8eacf49539f7fd1665e',
    faqs: [
      { q: "What food and beverage hoses do you supply?", a: "The range includes San-Hygienic food and brew suction and delivery hose (10 bar), silicone suction and delivery hose, and PVC food and bulk and non-toxic suction and delivery hose. Series include SANB, SANF, SANSIL, DELIKATESSE and PREMVIN. They are CIP/SIP cleaning compatible." },
      { q: "What sizes and pressure do SANF food hoses come in?", a: "The SANF food hose is listed from 19 mm to 102 mm at 10 bar, with a temperature range from -20°C to +90°C and an additional temperature allowance for CIP. It has a white NBR tube, synthetic plies and twin carbon steel helices." },
    ],
  },
  {
    slug: "forestry-logging-hardware",
    existingSha256: 'fa921cd25f18cdaa38a78068307e229de3a6368845bac582da7feb5ccd0908f6',
    faqs: [
      { q: "What types of forestry and logging hardware are there?", a: "The range covers Grade 80 choker hooks, sliders and gliders, forest hooks and skidding tongs, used for skidding and yarding logs. Items include the Grade 80 clevis forest hook, the sliding choker hook for wire rope slings, the chain rope connector and a heavy duty logging choker hook." },
      { q: "What WLL do forest hooks and choker hooks have?", a: "The Grade 80 clevis forest hook is listed from 1.12 to 5.3 t WLL to EN 1677. The sliding choker hook for wire rope slings runs from 1.6 to 5 t WLL, and the choker glider with keyhole is listed at 2 t WLL. The size table on this page shows each listing." },
      { q: "What are forestry hooks made from?", a: "The hooks in this range are alloy steel, powder coated, and are Grade 80 where listed. Send your list, drawing or photo and Indus will quote from Dubai." },
    ],
  },
  {
    slug: "gantries-handling-equipment",
    existingSha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    faqs: [
      { q: "What types of handling equipment are there?", a: "Indus supplies lifting gantries, jib cranes and davits, plus stillages, racks and handling equipment to EN 13155. They are made to order for a site, a load or a workshop." },
      { q: "What lifting capacity do gantries come in?", a: "Gantries, jib cranes and davits are made to order to the span, reach and height you need, so capacity follows the design. Steel structures are to EN 1993 and load tested before handover. Stillages are listed from 50 kg to 50 t and above." },
    ],
  },
  {
    slug: "gost-couplings",
    existingSha256: '7e42c09be912e59db7cf41350c7d81246d89e393b25ec6b55fd9aa5879f2fbe0',
    faqs: [
      { q: "What is a GOST coupling?", a: "A GOST coupling is a hose coupling to the Russian and CIS pattern. The range here is cast aluminium with NBR gaskets, listed in 2\", 2.5\" and 3\" (and 6\" for one listing). Indus supplies them from Dubai for buyers across the UAE and GCC." },
      { q: "What GOST fittings can I buy besides couplings?", a: "Besides couplings, the range includes GOST adapters with a female thread, GOST adapters with a male thread and Russian GOST caps. All are cast aluminium with NBR gaskets. Send the size and thread you need and Indus will quote." },
    ],
  },
  {
    slug: "grade-100-chain-fittings",
    existingSha256: 'c2ff2c6d57810098de7e58e52059c691d6ec17b753259b3b6842c6318b1dd577',
    faqs: [
      { q: "What is Grade 100 chain and its fittings?", a: "Grade 100 chain fittings are forged alloy-steel hooks, links and connectors rated to match Grade 100 chain. That chain carries about 25% more than Grade 80 chain of the same size. The range covers clevis, eye and swivel sling hooks, OBK, LBK and GBK self-locking hooks, grab and foundry hooks, master links and connectors." },
      { q: "What Grade 100 chain connectors and links are available?", a: "The Grade 100 chain connector, European type, is listed at 1.4 to 39.3 t WLL. Omega links to EN 1677 run from 1.4 to 10 t WLL, and forged alloy master links from 1.4 to 81.5 t WLL." },
    ],
  },
  {
    slug: "grade-80-chain-fittings",
    existingSha256: 'd30f09ec7d31774c0621ae6a1e70fdb554b32e92740b3efb87a646584b1558a7',
    faqs: [
      { q: "What are Grade 80 chain fittings?", a: "Grade 80 chain fittings are forged alloy-steel hooks, master links and connectors rated to match Grade 80 chain of the same size. They are used to build chain slings and other lifting assemblies. Indus supplies them from Dubai." },
      { q: "What Grade 80 chain connectors are available?", a: "The range includes Grade 80 connecting links from 7 mm to 32 mm (3,500 to 72,300 lbs), plus Italian, European, US and metric connecting links. Master links, master link assemblies, clevis reeving links and welded master links are also listed." },
    ],
  },
  {
    slug: "ground-joint-couplings",
    existingSha256: '8d5a5a382a5e69c1e328d342961f219b8215eed79be6ccef8e5fe4f943e2fdc3',
    faqs: [
      { q: "What sizes do ground joint couplings come in?", a: "The plated iron ground joint complete set and female spud are listed from 1/2\" to 4\" (1/2\", 3/4\", 1\", 1-1/4\", 1-1/2\", 2\", 2-1/2\", 3\" and 4\"), and the double spud from 3/4\" to 2\". They have NPT pipe threads and a metal-to-metal ground seat with no gasket." },
      { q: "What parts make up a ground joint coupling set?", a: "A complete set has a hose stem and a wing nut with the female, male or double spud. The range also includes universal clamps. The metal-to-metal seal suits high-pressure steam and air service up to 600 psi." },
    ],
  },
  {
    slug: "guillemin-couplings",
    existingSha256: '90379435f88993d260e1a3c9b00a72f7b283c85e2599088cf463ad64d65769ae',
    faqs: [
      { q: "What is a Guillemin coupling?", a: "A Guillemin coupling is a French and European fire-service quick-connect coupling, made to NF E 29-572. Indus supplies the range from Dubai in brass or aluminium from 25 to 150 mm. Send the hose size and thread for a quote." },
      { q: "What types of Guillemin coupling are available for industrial hose?", a: "The range covers female and male thread adapters, hose tails, short and long shanks, spiral tails, reducing adapters and dust caps. They are brass or aluminium, from 25 to 150 mm. Send the hose size and thread type for a quote." },
    ],
  },
  {
    slug: "hoists-blocks-clamps",
    existingSha256: 'fa67ce15a8d23db562d38d2e49570a3c6ba29b5d9215574bc26190489fe4b2bd',
    faqs: [
      { q: "What capacity range do chain blocks and hoists cover?", a: "Manual chain blocks are listed from 0.25 to 10 t WLL and lever hoists from 0.5 to 9 t WLL. Close headroom trolley chain hoists run 0.5 to 5 t and wire rope pullers 0.8 to 3.2 t. Electric hoists and trolleys are also in the range." },
      { q: "What types of hoist, block and clamp do you supply?", a: "The range includes VL, ORM and E type manual chain blocks, VA lever hoists, MD1 and 2/1-reeved electric wire rope hoists, push and geared trolleys, snatch and pulley blocks, and CDH, PDQ and TMS plate clamps." },
    ],
  },
  {
    slug: "hose-clamps-sleeves-ferrules",
    existingSha256: '6207e7ec04136ad4453a31d6029604d96855efe43ea9266ac68142016e1d3300',
    faqs: [
      { q: "What are hose clamps, sleeves and ferrules used for?", a: "They are hose retention hardware, and the range includes crimp sleeves and ferrules, bolt and interlocking clamps, sanitary tri-clamps and segment clamps. Safety clamps follow EN 14420-3 / DIN 2817. Spiral hose guards and wraps are listed for abrasion protection; send your hose size for a quote." },
      { q: "What hose sleeves and guards are available?", a: "Options include woven nylon sleeve from 0.71\" to 3.66\" inside diameter, flat steel spiral guards, plastic spiral wrap from 1/2\" to 1-1/2\" inside diameter and split polypropylene sleeve. They protect hose against abrasion. Send the hose outside diameter for a quote." },
    ],
  },
  {
    slug: "hose-menders",
    existingSha256: '3cc0202c483279f6a6628b6f7297a7f16c2155149244a3ab8aea5c5ff88418ff',
    faqs: [
      { q: "What is a hose mender and how is it used?", a: "A hose mender is an in-line barbed splice fitting that repairs a damaged section of hose. Indus supplies brass menders from 1/4\" to 1\" in boss and king patterns. Send the hose inside diameter and the number of clamps you want for a quote." },
      { q: "What are hose menders made of?", a: "The range is brass, in sizes 1/4\" to 1\", and includes boss and king patterns. Boss menders have collars that engage the gripping fingers of boss clamps. Send the hose inside diameter for a quote." },
    ],
  },
  {
    slug: "hose-swivel-joints",
    existingSha256: '78ba260626d19e18c4aa81ac7448d2eeb994a1bc1a3c02cd10a09bd879d647a3',
    faqs: [
      { q: "How does a hose swivel joint work?", a: "A hose swivel joint lets a hose rotate where it meets its coupling, nozzle or fixed connection. It keeps the hose from twisting as couplings are turned and arms move, which lengthens hose life. Indus supplies MannTek single and double ball race joints from Dubai." },
      { q: "What types of swivel joint are available?", a: "MannTek single ball race joints are standard duty, from 1\" to 4\", and double ball race joints are heavy duty for heavy side loads, from 1\" to 10\". Materials are stainless steel 1.4404 (AISI 316L) or aluminium. Connections are thread or flange, specified per order." },
    ],
  },
  {
    slug: "hydraulic-adapters",
    existingSha256: 'ce20af7beb1ea214983659a30bf6963549610dd07597dcf385635ec18920d54b',
    faqs: [
      { q: "What types of hydraulic adapter are there?", a: "Adapters come in BSP, metric, JIS, NPT, JIC 37°, ORFS, ORB, DIN 2353 and SAE flange forms, in carbon steel and stainless. Shapes include straight connectors, 45° and 90° elbows, adjustable stud ends, run and branch tees, crosses, bulkheads, swivels and plugs." },
      { q: "What sizes do hydraulic adapters come in?", a: "Sizes depend on the thread form. For example, DIN 2353 24° cone adapters run from M8×1.0 (4 mm tube) to M52×2.0 (42 mm tube). The size table on each sub-range page lists the sizes, and you can send a list, drawing or photo for a quote." },
    ],
  },
  {
    slug: "hydraulic-fittings",
    existingSha256: 'b3e0fbe1bdceff6b02a63517484cd3ffcfd93040dea8821910109f8a8087ced4',
    faqs: [
      { q: "What types of hydraulic fittings are there?", a: "Hydraulic fittings are the end connections crimped onto hydraulic hose. Indus lists BSP 60° cone and flat seat, DIN 24° cone, JIC 37°, ORFS, NPT, SAE 45° flare and Code 61 and 62 flange ends, plus Komatsu, Toyota and JIS forms. They suit braided 1SN and 2SN and spiral 4SP and R12 hose." },
      { q: "What specifications apply to hydraulic fittings?", a: "Standards listed include ASME B1.20.1, ASME B1.20.3, ASME B1.20.7, BS 5200 and ISO 12151-6. Indus lists 693 hydraulic fitting listings from Dubai. Send the thread, size and hose type for a quote." },
    ],
  },
  {
    slug: "hydraulic-hose-assemblies",
    existingSha256: 'ba3734477edfb61c6ddb9b5a1ab21cda23c15b3e384c77fae2d62a28d5162577',
    faqs: [
      { q: "What hydraulic hose sizes do these assemblies come in?", a: "These 2-wire braided assemblies are built on hose from 1/4\" to 1\" ID, depending on the end fittings. The manufacturer rates the hose at 6,525 psi for 1/4\" down to 3,270 psi for 1\", and the assembly is limited by its ends. The size table on this page lists each assembly." },
      { q: "What hydraulic hose end fittings are available on these assemblies?", a: "The listed assemblies have JIC 37° female swivel, NPT male, NPT male swivel and ORFS female swivel ends, and JIC swivel ends are also made as 90° elbows. Ends are carbon-steel crimped onto 2-wire steel braid hose. Send your required end types and length for a quote from Dubai." },
    ],
  },
  {
    slug: "hydraulic-hoses",
    existingSha256: '4e04d26859fd60f4c4f9c74b0b97cc2dbc0ab4d4e1ade9d5373b2a9618d633ce',
    faqs: [
      { q: "What types of hydraulic hose do you supply?", a: "The range covers single-wire, two-wire, compact, four-spiral, six-spiral and PTFE hydraulic hoses to SAE J517 and EN standards. Hose is available cut to length and as crimped assemblies. Indus supplies it from Dubai, so send your hose type and size for a quote." },
      { q: "What do hydraulic hose specifications cover?", a: "Each listing gives the hose construction (for example one or two steel wire braids), the standard it follows, such as SAE J517 or EN, and the fluids it suits, such as petroleum-base hydraulic fluids. Send your fluid, pressure and size and we will match a hose." },
    ],
  },
  {
    slug: "hydraulic-sae-flanges",
    existingSha256: '5215753ad4e5cf8d055500fe0e8c9cd6b40e1107b3b7076ee136795a2969f478',
    faqs: [
      { q: "What are the dimensions and sizes of hydraulic SAE flanges?", a: "The flanges are listed from 1/2\" to 5\" to SAE J518, with BSPP threaded backs from G1/2 to G2. Code 61 is rated up to 210 bar (3000 psi) and Code 62 up to 415 bar (6000 psi). The size table on this page lists each flange." },
      { q: "What are SAE hydraulic flanges?", a: "SAE hydraulic flanges make a four-bolt connection to SAE J518, in Code 61 for 210 bar and Code 62 for 415 bar. The range includes BSP or NPT threaded backs, weld-in and weld-on types, blind flanges, split flange kits, and O-rings and bolt sets." },
    ],
  },
  {
    slug: "industrial-flanges",
    existingSha256: '0ca9764c2cb086ec1317ef273d6795d944e07a45170ead2e65d494b36928a579',
    faqs: [
      { q: "What types of industrial flange do you supply?", a: "The range covers welding neck, slip on, socket weld, lap joint, threaded, flat, blind and stub end flanges, plus a gunmetal dock flange × male thread. They are made to ASME B16.5 Class 150 and 300 and MSS SP-43." },
      { q: "What sizes and pressure classes do the industrial flanges come in?", a: "Sizes run from 1/2\" to 24\" in Class 150 and Class 300, with raised, flat or ring-joint faces. At ambient temperature Class 150 is 285 psi in A105 carbon steel and 275 psi in 304 or 316 stainless; Class 300 is 740 and 720 psi. Ratings fall as temperature rises." },
    ],
  },
  {
    slug: "industrial-steam-hoses",
    existingSha256: '9ec27eeb8d63d1de394410038912abe2c83865a584d1e35921235c2ba49a573b',
    faqs: [
      { q: "What types of industrial steam hose are there?", a: "There are three types in this range: a red 18 bar hose (A230), a black 10 bar hose (A235BK) and a 7 bar steam, hot water and food hose (A235BU). All three have an EPDM tube and cover and are listed to BS 5342 and EN ISO 6134. Send your steam pressure and hose size for a quote." },
      { q: "What temperature range do the steam hoses cover?", a: "The red 18 bar hose is listed from -40°C to +210°C, with intermittent use to 232°C. The black 10 bar hose is listed from -20°C to +170°C. The 7 bar steam, hot water and food hose is listed to +170°C for steam and +95°C for hot water." },
      { q: "What bore sizes do the industrial steam hoses come in?", a: "The red 18 bar hose is listed from 13 mm to 51 mm. The black 10 bar and the 7 bar steam, hot water and food hoses are listed from 13 mm to 25 mm. The size table on this page shows the full listings, and you can send a list for a quote." },
    ],
  },
  {
    slug: "jacketed-fire-hoses",
    existingSha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    faqs: [
      { q: "What are fire hoses used for?", a: "Jacketed fire hose is woven-jacket hose for fire brigades, industrial fire teams, forestry crews and building fire cabinets. Indus supplies it from Dubai across the UAE, with couplings fitted to your pattern." },
      { q: "What types of fire hose are there?", a: "Fire hose is double jacket or single jacket. Double jacket suits high-pressure attack and supply lines that are dragged hard, and single jacket suits light hose-station and reel duty. Liners are EPDM, natural rubber or polyurethane." },
    ],
  },
  {
    slug: "japanese-hose-fittings",
    existingSha256: '7e5cbe000d7d860c1b34ba7b0d11c534d83e7c4c244c77a85a3d282df9c57b90',
    faqs: [
      { q: "What types of Japanese hose fitting do you supply?", a: "The range covers Toyota and Komatsu female hose fittings (JIS metric) in straight, 45° and 90° forms, plus JIS flange fittings. They have a 30° flare seat and JIS metric threads, for service of Japanese construction, mining and material-handling equipment." },
      { q: "What sizes do the Japanese hose fittings come in?", a: "Toyota female swivel fittings are listed from M14 to M30, the OEM size range, and JIS flange fittings in -08 to -12. Threads follow JIS B 8363 (analogous) and JIS B2291. The size table on this page lists each fitting." },
    ],
  },
  {
    slug: "jic-37-hose-fittings",
    existingSha256: '629c2c93d75d4e263dde54d1873b9cdd540d61e603cd1dcd6c4ad803c2ee8ed1',
    faqs: [
      { q: "What is a JIC 37 hose fitting?", a: "A JIC 37 fitting uses a 37° flare that seals metal to metal, defined by SAE J514 and ISO 8434-2. The range comes as female swivel and male ends in straight, 45° and 90° configurations." },
      { q: "What types of JIC 37 hose fittings are available?", a: "Besides straight, 45° and 90° forms, the range includes long-drop, compact, slip-on nut and double-hex variants. Dixon and Parker lines are in the range. Indus supplies them from Dubai, UAE." },
    ],
  },
  {
    slug: "jic-adapters",
    existingSha256: '99f2d70a65b19ef8a12ebe20a0dfb4139af7b4f0afbae90bf87497d8ad4b7f90',
    faqs: [
      { q: "What types of JIC adapter are there?", a: "JIC adapters are 37° flare fittings with UN/UNF threads. The range covers JIC to JIC, NPT, BSP, BSPT, metric and SAE O-ring boss, as straight connectors, swivels, 45° and 90° elbows, tees, crosses, bulkheads, plugs and caps." },
      { q: "What sizes do JIC adapters come in?", a: "Threads start at 7/16-20, with dash sizes -04 to -24 on the 45° elbows and -04 to -20 on the bulkheads. Some are manufacturer-stated up to 345 bar (5,004 psi). The size table on this page lists each adapter." },
    ],
  },
  {
    slug: "jis-30-adapters",
    existingSha256: 'e2630c08e11c8993ff18727ecf666385ceff5b71ba09b394a43d965cbb6d10a9',
    faqs: [
      { q: "What types of JIS 30° adapter are there?", a: "The range includes JIS 30° male × JIS 30° female swivel run tees, JIS 30° male × ORB male adapters and adjustable 90° elbows, and ORFS male × JIS 30° male or female adapters. They are zinc-plated carbon steel for joining Japanese-built machinery to JIC, ORFS, ORB and BSP lines." },
      { q: "What sizes do JIS 30° adapters come in?", a: "The JIS 30° flare ends are listed from 1/4\" to 3/4\" (G1/4-19 to G3/4-14). The ORB ends run from 1/4\" to 3/8\" (7/16-20 to 9/16-18) and ORFS ends from 1/4\" to 3/4\". The size table on this page lists each adapter." },
      { q: "How does a JIS 30° flare adapter seal?", a: "The male 30° flare seals metal to metal in the female 30° seat, and the thread is BSP parallel. Send a thread sample or part number and Indus will quote from Dubai." },
    ],
  },
  {
    slug: "kc-nipple-fittings",
    existingSha256: '5730d79fc07983720d23d0ae19648b6834e8acde80f4cabd0743a0406947ad58',
    faqs: [
      { q: "What types of hose fittings are in the KC nipple range?", a: "The range includes turn-back and fixed flange, groove KC, hose mender, umbilical slurry, drag hose, frac water, 206 hammer union and suction hose couplings. They are carbon steel, brass and aluminium combination nipples and heavy-duty hose fittings. Send the hose size and thread for a quote." },
      { q: "What sizes do KC nipple hose fittings come in?", a: "The suction hose coupling is listed from 1-1/2\" to 6\" with NPT, BSP or NPSM threaded ends, and the 206 hammer union coupling is listed in 4\". Materials include carbon steel, brass and aluminium. Send the hose size and thread for a quote." },
    ],
  },
  {
    slug: "lay-flat-hose-couplings",
    existingSha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    faqs: [
      { q: "What is a lay flat hose and what couplings fit it?", a: "Lay flat hose is collapsible hose used for fire fighting, dewatering and water transfer. Couplings include large-bore forged-shank types with a re-attachable bolted clamp, in grooved, Storz, flanged or male by female form, plus high-pressure, slurry and expansion ring types." },
      { q: "What sizes do lay flat hose couplings come in?", a: "Expansion ring couplings are listed from DN25 to DN65 (1\" to 2-1/2\"), with NST, NPSH and BAT threads. The male by female large-bore couplings run from DN100 to DN300 (4\" to 12\")." },
    ],
  },
  {
    slug: "lay-flat-hose-reels-winders",
    existingSha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    faqs: [
      { q: "What types of lay flat hose reel and winder are there?", a: "The range includes a tractor-mounted lay flat hose reel and hose mover on a 3-point hitch, a portable motorised winder for 6\" to 12\" hose, a well riser hose winding trailer and a large-bore riser hose winding system. They run out and recover lay flat hose without a large crew." },
      { q: "What hose sizes do the lay flat hose winders handle?", a: "The portable motorised winder takes DN150 to DN300 (6\" to 12\") hose, up to 40 m per coil. The riser trailers are listed for 8\" × 150 m and 2\" × 300 m, and the tractor-mounted reel holds 2,000 ft of 6\" hose. Power, size and weight are confirmed with the quotation." },
    ],
  },
  {
    slug: "lay-flat-hoses",
    existingSha256: '063c33b6fc52a3e04cff680f5e4ac935711869e66b78cd89251ecf833055d081',
    faqs: [
      { q: "What types of lay flat hose are there?", a: "Indus supplies TPU, NBR and PVC lay flat hose from 1\" to 16\". Uses include mine dewatering, frac water, borehole risers, fuel, drinking water, concrete and slurry. Single- and double-jacket fire hose and rigid-helix suction hose are also supplied." },
      { q: "What is the pressure rating of lay flat hose?", a: "The rating depends on the hose type and size. In the listings it is given on request and confirmed with the quotation. Send your application, size and length and Indus will quote from Dubai." },
      { q: "What lengths does lay flat hose come in?", a: "Lay flat hose rolls flat on a reel and runs out in lengths up to 400 m, then recovers for the next job. Sizes run from 1\" to 16\". Hose reels and winding equipment are also listed." },
    ],
  },
  {
    slug: "lifting-beam-clamps",
    existingSha256: 'df82a27f89149dde87f462baaba0f4c9718eeb6e2ddd5673354b471e0b03b6e7',
    faqs: [
      { q: "What types of lifting clamps and beam clamps are there?", a: "The range covers horizontal and universal plate lifting clamps, double plate clamps, clamps for steel sections and adjustable lifting beam clamps. Working load limits are stated per model." },
      { q: "What is the capacity range of the lifting clamps?", a: "Examples: the QS type double plate clamp is listed from 1 to 8 t, the LC type from 1 to 3 t and the TMS type with locking device from 1 to 10 t WLL. THK / THKS clamps run from 0.5 to 10 t per pair. Send your load and section for a quote." },
    ],
  },
  {
    slug: "lifting-beams",
    existingSha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    faqs: [
      { q: "What is a lifting beam?", a: "A lifting beam is a below-the-hook device that suits low headroom, loads with several lifting points and loads that must be reached or balanced. Indus supplies fixed, plate and counterweight beams and pod, module and cradle lifting systems from Dubai, listed to EN 13155. Send the load and hook height for a quote." },
      { q: "What types of lifting beams are there?", a: "The range includes fixed, plate, counterweight, semi-spreader and precast concrete lifting beams, plus pod, module and cradle lifting systems, all listed to EN 13155. They are made to order from an approved general arrangement drawing and built to the load. Send the load and hook height for a quote." },
    ],
  },
  {
    slug: "lifting-chain-fittings",
    existingSha256: 'ca47e79eeeed5881ba32d3d235e156baffefa809de322fb45901a31969fcae5f',
    faqs: [
      { q: "What types of lifting chain do you supply?", a: "The range covers Grade 80 and Grade 100 alloy lifting chain and fittings, EN 818-7 hoist chain, stainless chain, DIN 763, 764 and 766 link chain and DIN 22252 mining chain. Grade 30, 43 and 70 chain is listed in inch and AS/NZS 4344 sizes." },
      { q: "Which chain grades do you supply?", a: "Grade 80 and Grade 100 alloy lifting chain, plus Grade 30, 43 and 70 chain in inch and AS/NZS 4344 sizes. Matching Grade 80 and Grade 100 chain fittings are listed separately." },
    ],
  },
  {
    slug: "lifting-hooks",
    existingSha256: '7ca20811ef101a21c3c61a3fbbb87613d1f89f1f6d30074915e04c1941a677ec',
    faqs: [
      { q: "What types of lifting hooks are there?", a: "The range includes 319 shank, 320 eye and 322 swivel hoist hooks, grab hooks, slip hooks, Grade 80 container hooks, DIN 689 eye hooks, stainless hooks and Grade 70 hooks to AS/NZS 4344. Indus supplies 45 ranges from Dubai under IH-LR part numbers." },
      { q: "What capacities do lifting hooks come in?", a: "Swivel hoist hooks to the 322 pattern run from 3/4 t to 22 t, with alloy from 1 to 22 t and carbon from 0.75 to 15 t. A 5/16\" T hook is listed at 18,800 lbs in alloy and 15,600 lbs in carbon. Send the load and hook type for a quote." },
    ],
  },
  {
    slug: "lifting-points-pad-eyes",
    existingSha256: 'b6cddf36d10b0a33dfd6f63717c8c5f6a62adcf421db7a5f744cdc724765beca',
    faqs: [
      { q: "What is a pad eye?", a: "A pad eye is an anchorage fixed to a load or structure, bolted, threaded or welded, that gives a sling a rated point to attach to. The range includes stainless diamond pad eyes (5 to 12 mm) and oblong pad eyes (5 to 9 mm), plus eye plates." },
      { q: "What types of lifting points do you supply?", a: "The range covers Grade 80 and Grade 100 swivel lifting points, hoist rings and eye nuts, DIN 580 eye bolts, bolt-on and weld-on points, weld-on D rings, stainless pad eyes and eye plates, and deck eye plates and lashing D rings." },
    ],
  },
  {
    slug: "lifting-slings",
    existingSha256: '318712b8b822616b24e979a7d116a3162e359bd07e32a375cf8a6775395cd418',
    faqs: [
      { q: "What are the types of lifting slings?", a: "The range covers Grade 80 and Grade 100 chain slings of one to four legs, wire rope slings, polyester round slings, flat webbing slings and cable socks. Part numbers are IH-LR." },
      { q: "What is a lifting sling?", a: "A lifting sling is the flexible link between a crane hook and the load. It comes in chain, wire rope or synthetic, and each is rated for the way it is hitched. Indus supplies them from Dubai, UAE." },
    ],
  },
  {
    slug: "lightweight-lay-flat-hoses",
    existingSha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    faqs: [
      { q: "What is PVC lay flat hose used for?", a: "PVC lay flat hose is the light, economical choice for clean water at low pressure, such as irrigation, site and trash pump discharge and temporary transfer. It is a woven polyester hose that collapses flat when empty. Pressure rating is confirmed with the quotation." },
      { q: "When should I use NBR or TPU instead of PVC lay flat hose?", a: "Step up to NBR or TPU lay flat hose for oily water, abrasive ground or higher pressure. PVC is intended for clean water at low pressure. Send your fluid, pressure and size for a recommendation and quote." },
      { q: "What is the pressure rating of PVC lay flat hose?", a: "The listing shows the rating as confirmed with the quotation rather than a fixed figure. PVC lay flat hose is the choice for clean water at low pressure, and higher pressure duties call for NBR or TPU lay flat hose instead." },
    ],
  },
  {
    slug: "lng-cryogenic-couplings",
    existingSha256: 'f555470d18c2ef0799ebce54215111d19f706b21b323bb040575d9f2947ba205',
    faqs: [
      { q: "What types of cryogenic coupling are there?", a: "The range includes dry cryogenic couplings (DCC) as hose and tank units from 1\" to 8\", and CBC breakaway couplings from DN 25 to DN 200. A cable-release CBC-C type covers DN 50 to DN 150. They are used for LNG bunkering, truck loading and liquid-gas transfer at -196 °C." },
      { q: "What is a dry cryogenic coupling?", a: "A dry cryogenic coupling closes valves in both halves on disconnect, so the transfer line is shut when it comes apart. It is used for LNG bunkering, truck loading and liquid-gas transfer at -196 °C. Indus supplies it from Dubai to UAE and GCC buyers." },
    ],
  },
  {
    slug: "load-binders",
    existingSha256: '5edc121e52cb4916099483515c4ed49daa0d994612a22d9f0d9f99126d10c8b8',
    faqs: [
      { q: "What is a load binder?", a: "A load binder tensions chain tie-downs. The range covers ratchet and lever binders and claw binders for Grade 70, Grade 80 and Grade 100 chain, with lashing and winch hooks." },
      { q: "What types of load binders are there?", a: "Types are ratchet, lever and claw binders. Examples: the ratchet binder to AS/NZS 4344 fits 6 mm to 13 mm chain, and the chain tension lever fits 9 mm to 13 mm chain." },
      { q: "What capacities do load binders have?", a: "The chain tension lever is listed at 10,000 to 20,000 kg and the claw load binder at 2,600 to 9,200 lbs WLL. The ratchet binder is listed at 46 to 176 kN. Send the chain size and WLL for a quote." },
    ],
  },
  {
    slug: "load-securing-rope-marine",
    existingSha256: '3cb3b485bc0333c9a723d6d8c8920bac54addd2706338eac7ce05e8b9721c36c',
    faqs: [
      { q: "What are the types of load binders?", a: "The range covers claw, ratchet, lever and Grade 100 binders, with lashing and winch hooks. Load binders are one part of load securing equipment, which holds a load in place rather than lifting it." },
      { q: "What widths do ratchet straps come in?", a: "Ratchet straps come in 2″, 3″ and 4″ widths. Lashing references include EN 12195-2 and EN 12195-3. Ratchet straps are part of the load securing range, which also has claw, ratchet, lever and Grade 100 binders. Indus supplies it from Dubai, UAE." },
    ],
  },
  {
    slug: "low-pressure-oilfield-hoses",
    existingSha256: 'd3a86797bdd08ee53be7ea35aae165430567d2e5d3fddf69eb9f010adef9e43e',
    faqs: [
      { q: "What are low pressure oilfield hoses used for?", a: "They are utility hoses for drilling rig water, fuel, mud, bulk material and potable water transfer. Discharge and suction/discharge variants are listed in 300 and 400 psi, with fire-resistant cover options. Indus supplies them from Dubai, UAE." },
      { q: "Which standards apply to low pressure oilfield hoses?", a: "The listings reference API Spec 16D and the ISO 15540 fire test for fire-resistant hoses, and API Spec 7K for low-pressure service. Bulk-material and similar hoses refer to the maker's series specification." },
    ],
  },
  {
    slug: "marine-anchors",
    existingSha256: 'b5f5ed1f21d042850b9b198aa7de690bc985f41f38041d18b16610a394b24684',
    faqs: [
      { q: "What types of marine anchor do you supply?", a: "Ship anchors include Hall, Baldt, Pool, Admiralty, Danforth and high holding power (HHP) types. Small-boat anchors include Bruce, plough, delta and grapnel types. They are available galvanized and stainless." },
      { q: "What weights do ship and boat anchors come in?", a: "The AC-14 high holding power anchor is listed from 30 kg to 36,000 kg, the Admiralty anchor from 50 kg to 10,000 kg and the delta HHP anchor from 300 kg to 20,000 kg. Small galvanized anchors run from 2 kg to 20 kg, and the plough anchor from 5 kg to 16 kg." },
    ],
  },
  {
    slug: "marine-equipment-uae",
    existingSha256: 'd6901c17fe4bbf85b2502226ae0fc9a50dfb91e2106db51e344b776200be791a',
    faqs: [
      { q: "What types of marine anchor do you supply?", a: "Ship anchors include Hall, Baldt, Pool, Admiralty, Danforth and HHP types. Small-boat anchors include Bruce, plough, delta and grapnel, galvanized and stainless." },
      { q: "How is marine anchor chain sized?", a: "Anchor chain and mooring chain are sized by chain diameter and grade. The range also covers the fittings, anchors and deck gear that go with them. Send your chain size and grade for a quote." },
      { q: "What does the marine equipment range cover?", a: "It covers mooring and deck equipment, anchors, anchor chain and fittings, and ship maintenance chemicals such as rust remover and penetrating oil. Indus supplies it from Dubai, UAE." },
    ],
  },
  {
    slug: "marine-fenders",
    existingSha256: '0793a067d7940c115622cd14d46e2cf369138d222180abecbb060c790f468cd8',
    faqs: [
      { q: "What is a marine fender?", a: "A marine fender absorbs the energy of a vessel berthing against a quay, jetty or another ship. Indus supplies the range from Dubai, UAE, for berths, jetties and tugs." },
      { q: "What types of marine fenders are there?", a: "The range covers rubber arch, D, square, cylindrical, cone, cell, leg and wing fenders. Pneumatic and foam fenders and dock bumpers are also listed. Indus supplies them from Dubai, UAE." },
    ],
  },
  {
    slug: "marine-hoses",
    existingSha256: 'c37335c9ffe3a161463059efe1cdf66645b4fa9353fb1a9f4f34d47cbd5b9c5f',
    faqs: [
      { q: "What is a marine hose?", a: "A marine hose carries engine exhaust, cooling water, fuel, bilge or fresh water on boats and in boat plant. The range includes barrier-lined marine fuel hose, PVC bilge and live-well hose, and clear PVC hose with steel wire helix." },
      { q: "Which standards apply to marine fuel hose?", a: "Standards quoted by the manufacturers include ABYC H-24, SAE J1527, ISO 8469 and SAE J2006. The marine fuel hoses are listed from 1/4\" to 3/4\" ID, from -20°F to 212°F (-28°C to 100°C). Check the listing for the one you need." },
    ],
  },
  {
    slug: "marine-maintenance-chemicals",
    existingSha256: 'ec9e15a6d653bb7e5567eea50db7acca0f923224cd3836614a7cb9164c2b09f6',
    faqs: [
      { q: "What types of marine cleaning chemicals are there?", a: "The range includes rust remover, penetrating oil, oil and grease remover and electrical equipment cleaner for shipboard maintenance. They are used across the whole ship, from engine room to cabins. Indus supplies them from Dubai, UAE." },
      { q: "What pack sizes does the Ferryl Ferrycid rust remover come in?", a: "It comes in a 25 L plastic drum, a 10 L plastic drum and a 1 L plastic bottle. The product is water-dilutable, mixed with water according to how severe the rust is. Send your requirement for a quote." },
    ],
  },
  {
    slug: "master-links-rings-swivels",
    existingSha256: '0f782aa305ff7ce2b4bd0c87e2404446454a593ad16407774a458c211169a540',
    faqs: [
      { q: "What types of master link and ring are there?", a: "The range includes weldless alloy master links, stainless steel drop forged master links, Grade 80 weldless forged rings, weldless pear links and welded steel rings. Swivels to G-401 and G-402 patterns and clevis links are also listed." },
      { q: "What sizes of master link and ring are available?", a: "The stainless steel drop forged master link runs from 3/8\" to 1-1/4\" (1,500 to 11,800 lbs). The Grade 80 weldless forged ring is listed at 1,100 to 35,000 lbs WLL, and the welded steel ring from 12 mm to 38 mm. The size table on this page lists each listing." },
    ],
  },
  {
    slug: "metallic-exotic-alloy-hoses",
    existingSha256: 'eb99a36a2a4d326da735e61b49cf8d8f9a6f00801ef0b8afbb545a6bcac541b8',
    faqs: [
      { q: "What is a metallic exotic alloy hose assembly made from?", a: "These are annular corrugated metal hoses in Hastelloy C276, Inconel 625, Monel 400 and bronze, supplied from Dubai. Unbraided and braided constructions are listed, chosen for severe corrosion, high temperature, sea-water and dry-chlorine service. Send the fluid and size for a quote." },
      { q: "What specifications apply to metallic exotic alloy hoses?", a: "Chlorine Institute Pamphlet 6 and NACE MR0175 are referenced for the range, and ASME B31.3 is listed for the bronze and Hastelloy constructions. Sizes run from DN 6 (1/4\") up to DN 250 (10\") depending on the alloy and construction. Send the fluid and pressure for a quote." },
    ],
  },
  {
    slug: "metallic-fire-protection-hoses",
    existingSha256: 'b4f2d8be6956f0c6662df38182377573043c9aab5375b857c1fb19c037e2128d',
    faqs: [
      { q: "What types of fire protection are in the metallic hose range?", a: "The range covers Lock-Section interlocking cores, Armor-Flex ball-joint hose guards, Smooth-Flex non-corrugated alternatives, Fire Jackets and Fire Tape (Fry-Sil). They suit fire-survivability requirements under insulation regulations. Indus supplies them from Dubai, UAE." },
      { q: "What hose sizes do the fire protection products fit?", a: "Armor-Flex ball-joint hose guards and Fire Jackets fit host hoses from DN 25 (1\") to DN 200 (8\"). Fire Tape fits any host hose or pipe up to DN 200 (8\"). Lock Section cores are listed from DN 25 (1\") to DN 200 (8\")." },
    ],
  },
  {
    slug: "metallic-high-pressure-hoses",
    existingSha256: 'de8540e6f04902f9aba8f05d02af9e716f0757a2abe41bc6d52294251c70e10f',
    faqs: [
      { q: "What are the specifications of the high-pressure metallic hoses?", a: "They are fully compressed annular and helical designs in double braid, in Type 321, 316L or 304 stainless steel, from DN 6 (1/4\") to DN 150 (6\"). The range is rated up to 6,000 psi (414 bar) and suits steam, hydraulics and high-pressure cryogenic loading. The size table on this page lists each hose." },
      { q: "What metallic hose assembly designs are available?", a: "The range includes annular corrugated hoses and helical corrugated hoses, including a closed-pitch omega annular design in Type 321 stainless and ultra-high-pressure helical hose in Type 316L and 321. Nuclear CRN-rated variants are also listed. Send your size, pressure and media for a quote." },
    ],
  },
  {
    slug: "metallic-hose-couplings",
    existingSha256: 'a74b824483393557e43964cb18808cb2fa719e8a28c8f1e8cda951e8a4858f5b',
    faqs: [
      { q: "What types of metal hose couplings are there?", a: "The range covers O-seal pipe unions in small bore (1/2 in to 2 in) and large bore (2-1/2 in to 6 in), swivel joints, Met-O-Seal tanker truck loading couplings and sight-flow indicators. Indus supplies them from Dubai, UAE." },
      { q: "What is the function of metal hose couplings?", a: "They are the end connections and quick-couplings for metallic-hose lines. They are made for lines where pressure, cryogenic or sour service rules out standard fittings." },
    ],
  },
  {
    slug: "metallic-hose-suppliers-uae",
    existingSha256: '331c3cebf1385745c0bade6513b28386e1f4a71581066659903d85bbfb510200',
    faqs: [
      { q: "What is a metallic hose assembly?", a: "It is corrugated metal tubing, usually stainless steel or a nickel alloy, with a wire braid that carries the pressure. It is used where heat, cold, fire or aggressive chemicals rule out rubber. Indus supplies metallic hoses from Dubai." },
      { q: "What materials and types of metallic hose do you supply?", a: "The range includes annular and helical stainless, Inconel 625, Hastelloy C276, Monel 400 and bronze hose. Cryogenic, steam-jacketed and heated assemblies are also listed. Listings show Type 316L stainless cores with Type 304 braid." },
    ],
  },
  {
    slug: "metallic-specialty-assemblies",
    existingSha256: '5a0664aa64009d8d6ba06abe2a49f32d44150700a2e38559a100621e565fe715',
    faqs: [
      { q: "What is a metallic hose assembly for special service?", a: "It is an engineered metallic hose assembly for special service, supplied from Dubai, UAE. The range covers cryogenic (LIN, LOX, LAR, LNG), steam-jacketed double-containment, electrically heated, oxygen lance, industrial gas (CGA96/UL96), Monel chlorine transfer and flexible pipe loops." },
      { q: "What specifications apply to metallic specialty hose assemblies?", a: "The cryogenic CO₂ process assembly lists ASME B31.3 and ASME Section VIII Div 1, and the industrial gas hose is to CGA96/UL96. Constructions are annular corrugated, in 316L stainless steel with single or double braid. Send your service and size for a quote." },
    ],
  },
  {
    slug: "metallic-stainless-corrugated-hoses",
    existingSha256: '01a2736394d6cb51eed945c79311b9b233564195f052e72221fbe1fa0602fb49',
    faqs: [
      { q: "What is corrugated stainless steel hose?", a: "It is a flexible metal hose with an annular or helical corrugated core, normally covered by one or more wire braids for pressure. Indus supplies it from Dubai, UAE, with Type 316L and Type 321 stainless cores listed." },
      { q: "What sizes does corrugated stainless steel hose come in?", a: "Listed sizes run from DN 6 (1/4\") to DN 350 (14\"), depending on the series. Helical hose such as the S65 is listed from DN 25 (1\") to DN 250 (10\"). The size table on this page lists each hose." },
    ],
  },
  {
    slug: "metric-adapters",
    existingSha256: 'a6bc5943232102d906ffcd4023e16d03636efea637d0403b8d88f1760436fc5c',
    faqs: [
      { q: "What sizes of metric hydraulic adapter do you supply?", a: "Metric adapters run from M10×1 to M42×2. Examples include metric 24° cone ends at M12×1.5 to M24×1.5 and plugs at M14×1.5 to M33×1.5. The size table on this page lists each adapter." },
      { q: "What end types do metric hydraulic adapters have?", a: "Ends include ISO 6149 O-ring studs, flat-seal and bonded-seal studs, 74° cone and JIS 60° cone ends, Komatsu-specification connectors and butt-weld ends. They come as connectors, elbows, tees, crosses, bulkheads, plugs and caps." },
    ],
  },
  {
    slug: "metric-hose-fittings",
    existingSha256: '74dda8fbcf350bb6e90cf02f7ae68e13a1ded62b9ab842e576f39335ba388ac7',
    faqs: [
      { q: "What types of metric hose fittings are there?", a: "The range is metric-thread hydraulic hose fittings: banjo bolts, banjo eyes, and 60° cone male, female and female-swivel ends. The cone ends come in straight, 45° and 90° configurations. Threads are to ISO 261, with ISO 12151-2 matching ports and ISO 6149-1 metric ports." },
      { q: "What sizes do metric hydraulic hose fittings come in?", a: "Listed metric threads on the 60° cone ends run from M10×1 to M52×2, for hose sizes -03 to -24. The size table on this page lists each fitting. Threads are to ISO 261, in coarse and fine pitch." },
      { q: "Which standards apply to metric hose fittings?", a: "Threads are to ISO 261, in coarse and fine pitch. The listings reference ISO 12151-2 and BS 5200 for matching ports, and ISO 6149-1 with bonded-seal washers per DIN 7603 for metric ports. Fittings are supplied from Dubai, UAE." },
    ],
  },
  {
    slug: "mining-conveyor-chain",
    existingSha256: '2776ea1f4b75b006b4a27705b18ef7071728f5ca2d4c1aaed923629bbb197bef',
    faqs: [
      { q: "What types of conveyor chain are in the mining range?", a: "The range covers DIN 22252 round link and DIN 22255 flat link mining chain, wear-resistant conveyor chain, block connecting links to DIN 22258-1, DIN 20637 monorail chain and chain wheels for bucket elevators. Indus supplies them from Dubai." },
      { q: "What sizes does conveyor chain come in?", a: "Wear-resistant round link chain to DIN 22252 dimensions runs from 14 × 50 mm to 42 × 146 mm, and block connecting links to DIN 22258-1 from 22 × 86 mm to 38 × 137 mm. Toothed chain wheels for DIN 764 chain cover 10 × 35 mm to 18 × 63 mm chain." },
    ],
  },
  {
    slug: "mooring-buoys",
    existingSha256: '260b714211a336dc3060b39fa3adc6ebfb94796c0187ca966eb15ccfc80b691a',
    faqs: [
      { q: "What are the types of mooring buoys?", a: "The range covers foam-filled surface mooring buoys, chain-through buoys, cylindrical chain support buoys, and subsea and modular subsea support buoys rated by depth. Buoy marking lights, including solar LED and GPS tracking versions, and buoy support chain are also listed. Indus supplies them from Dubai, UAE." },
      { q: "What sizes do mooring buoys come in?", a: "Buoys are sized by buoyancy. Chain-through buoys are listed from 1,500 kg to 4,500 kg buoyancy and cylindrical chain support buoys from 1,000 kg to 3,900 kg. Modular subsea support buoys run from a 2,900 kg module to a 21,500 kg module at a 2000 m depth rating." },
    ],
  },
  {
    slug: "mooring-connectors",
    existingSha256: '4fdb1f257a55ff471ed25e1ecaad28d7f87e327c15af6dd04c1485a44f499a41',
    faqs: [
      { q: "What connectors make up an anchor chain or mooring line?", a: "The range covers H-links, installation links, pear links, triangle and quad plates, rings, A-342 pattern master links, sockets, thimbles, fairlead shackles and weak links. They join chain, wire and fibre rope in a mooring line. Indus supplies them from Dubai." },
      { q: "What sizes do mooring connectors come in?", a: "A-342 pattern master links run from 19 mm to 50 mm, weak links from 12 mm to 28 mm and triangle plates from 9.5 t to 200 t WLL. T-mooring links are listed from 30 t to 60 t SWL. Send the line details for a quote." },
    ],
  },
  {
    slug: "mooring-deck-equipment",
    existingSha256: '2356310c3ed273d5f5ff3603f689851a9e0d247c0ba58ecd2c61635e374b6773',
    faqs: [
      { q: "What is mooring equipment?", a: "Mooring and deck equipment includes bollards, chocks, fairleads, rollers, chain stoppers, towing and quick-release hooks, fenders, mooring buoys and aquaculture mooring gear. Indus supplies it from Dubai, UAE." },
      { q: "Which standards apply to mooring and deck equipment?", a: "Bulwark and deck mooring chocks are listed to DIN 81915 and ISO 13729, and chain stoppers include the OCIMF tongue type and JIS F 2031. Other standards referenced include DIN 81860 and DIN 81902." },
    ],
  },
  {
    slug: "nbr-lay-flat-hoses",
    existingSha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    faqs: [
      { q: "What is the pressure rating of NBR lay flat hose?", a: "The standard NBR ribbed-cover discharge hose is rated 10 bar (150 psi) in every size from 1-1/2\" to 12\", with a temperature range of -20 °C to +80 °C. Fire hose and heavy-duty sizes are confirmed with the quotation." },
      { q: "What types of NBR lay flat hose are available?", a: "The range has heavy-duty NBR lay flat hose, NBR lay flat discharge hose with a ribbed cover, and NBR lay flat fire hose in red or yellow. All have a woven polyester jacket and collapse flat when empty." },
      { q: "When should I choose NBR lay flat hose over PVC?", a: "Choose NBR where oil, fuel residue or abrasion would shorten the life of PVC lay flat hose. It is used for dewatering, pump discharge and fire water. PVC remains the lighter option for clean water at low pressure." },
    ],
  },
  {
    slug: "npt-adapters",
    existingSha256: '0009cc139d7cd8868c4741522ba6006454c2442cc16f30bf75d30693889ed5d6',
    faqs: [
      { q: "What types of NPT adapter are available?", a: "The range includes NPTF tees, male × female NPT 90° elbows, NPTF female × NPSM female swivel 45° and 90° elbows, and hollow hex and square head pipe plugs. They are made to ASME B1.20.1." },
      { q: "What sizes do NPT adapters come in?", a: "NPTF (Dryseal) adapters such as the tee run from 1/8\" to 2\" (1/8-27 to 2-11.5). The size table on this page lists each adapter's thread and size, and Indus supplies the range from Dubai." },
      { q: "Can NPT and BSPT threads be mixed?", a: "No. NPT has a 60° thread angle and is not interchangeable with 55° BSPT. In hydraulic service the taper is sealed with PTFE tape or an anaerobic sealant." },
    ],
  },
  {
    slug: "npt-npsm-sae-hose-fittings",
    existingSha256: 'f45bc6b5b3a26afbfacdf1d7cfa8b017a341099f544fa5f4963bef120e5a6643',
    faqs: [
      { q: "What types of hose fitting are in the NPT, NPSM and SAE range?", a: "The range covers NPT taper, NPSM parallel, SAE inverted flare and SAE 45° flare hose ends. SAE J1926 O-ring boss ends come in straight, 45° and 90° configurations. Swivel nut types such as female NPTF x female NPSM elbows are also listed." },
      { q: "What are the sizes of SAE flare hose fittings?", a: "The SAE 45° flare listings run from UN/UNF 7/16-20 to 1-1/16-14 (-04 to -12), to SAE J512. The inverted flare listings run from 3/8-24 to 5/8-18 (-03 to -10). The size table on this page lists each fitting." },
      { q: "Which standards apply to these hose fittings?", a: "Pipe threads are listed to ASME B1.20.1, 45° flare ends to SAE J512, and O-ring boss ends to SAE J1926 and ISO 11926. Some listings also cite SAE J514. The listed fittings are carbon steel with zinc plating, with stainless on request for some." },
    ],
  },
  {
    slug: "offshore-anchors",
    existingSha256: '99ee552dd85fc5aba86ce97b7445c02fd472cfebc48b51ee4be787e1fcf418d9',
    faqs: [
      { q: "What are the types of offshore anchors?", a: "The 20 listings cover drag-embedment and other types, including Delta, Byers, Gruson, Stevpris, Stevin, LWT, Moorfast, Mushroom and Trust anchors. Dimension tables are given where the design publishes them." },
      { q: "What weights do offshore anchors come in?", a: "Listed ranges include Superior Delta from 1,000 to 40,000 kg, LWT from 454 to 27,216 kg and Mushroom from 50 to 5,000 kg. Offdrill II runs from 240 to 29,000 kg. Send your vessel or mooring requirement for a quote." },
    ],
  },
  {
    slug: "offshore-mooring-chain",
    existingSha256: '35eb483a2be6abc441a5224d0910040485e19818797f651c0e3301b3f8780357',
    faqs: [
      { q: "What sizes does offshore mooring chain come in?", a: "Stud link offshore mooring chain is listed from 1-7/16″ (36 mm) to 205 mm. The rule proof and breaking load are listed for each diameter, and the size table on this page lists them." },
      { q: "What grades of offshore mooring chain are available?", a: "Stud link and studless chain is listed in grades ORQ, R3, R3S, R4, R4S and R5, to IACS UR W22 and API Spec 2F. Chain tails, five-link adaptors and chafe chain are also available." },
    ],
  },
  {
    slug: "oil-chemical-purpose-hoses",
    existingSha256: '5ef85cb05b6b1acfb8cbf53cf1f2da61ecb6f18cb503ef03c9b757bade35e3d1',
    faqs: [
      { q: "What temperature range do multi-purpose oil hoses cover?", a: "The A110 multi-purpose mineral oil hose (10 bar) is listed from -40°C to +100°C. The A125 multi-purpose mineral oil and air hose (20 bar) is listed from -40°C to +80°C. Both have an NBR tube with textile reinforcement." },
      { q: "Which hose is used for oil, mud and sea water?", a: "The A400EU oil, mud and sea water suction and delivery hose is rated at 20 bar and listed from 76 mm to 203 mm. It has an NBR tube suitable for 50% aromatic hydrocarbons, with steel helix and antistatic wires, and covers -30°C to +90°C." },
      { q: "What sizes do oil suction and delivery hoses come in?", a: "The A430 oil suction and delivery hose is rated at 10 bar and listed from 25 mm to 152 mm. The A460 is rated at 20 bar and listed from 51 mm to 152 mm. Both have twin steel helix and anti-static wires. Send your size and pressure for a quote." },
    ],
  },
  {
    slug: "orb-adapters",
    existingSha256: '4fe89252498e9b11c9898678ad4d8329b05ef1ab172938e80215ae45c56e3020',
    faqs: [
      { q: "What is an ORB adapter?", a: "An ORB adapter is an SAE O-ring boss fitting for the straight-thread ports on pumps, valves and cylinders. Indus supplies 40 listings in zinc-plated carbon steel, made to SAE J1926 and ISO 11926. Send the port thread and tube size for a quote." },
      { q: "What types of ORB hydraulic adapter are listed?", a: "The listings cover tube adapters, ORB-to-JIC style connections and external hex plugs in zinc-plated carbon steel. Straight, 45° and 90° elbow forms are listed, and some adapters have a swivel end. Threads follow SAE J1926 and ISO 11926." },
    ],
  },
  {
    slug: "orfs-adapters",
    existingSha256: '658d8901da1a2b9162e521087670d6c5f8fcb02fdafae8e591eb7b6be6ef9b0e',
    faqs: [
      { q: "What types of ORFS adapter are there?", a: "ORFS adapters are O-ring face seal fittings in straight, swivel, elbow, tee, bulkhead, plug and cap forms. They connect ORFS to ORFS, BSP, NPT, metric, metric flat-seal and SAE O-ring boss ends. Indus supplies them from Dubai." },
      { q: "What sizes do ORFS adapters come in?", a: "ORFS adapters come in sizes -04 to -16, with ORFS threads from 9/16-18 to 1-7/16-12 UN/UNF. Listings state up to 415 bar (6000 psi) for several forms. The size table on this page lists each adapter." },
    ],
  },
  {
    slug: "orfs-hose-fittings",
    existingSha256: 'fef07f8577cfdc1b225abaf1017819474de96ce963d3ba30d237efdf280025ea',
    faqs: [
      { q: "What is an ORFS hose fitting?", a: "An ORFS (O-ring face seal) hose fitting uses an O-ring in the face of the fitting to give a leak-free joint under high vibration. The range follows SAE J1453 / ISO 8434-3 and is supplied from Dubai across the UAE." },
      { q: "What types of ORFS hose fitting are available?", a: "The range includes ORS female swivels, flat face male elbows and flat face male x female swivel nut elbows, in straight, 45° and 90° forms. Flat face male x male NPTF 90° elbows are also listed. Send your list for a quote." },
      { q: "Which standard do ORFS hose fittings follow?", a: "They follow SAE J1453 and ISO 8434-3, the O-ring face seal standards. The ORS crimp fittings in the listings are carbon steel. Indus supplies the range from Dubai across the UAE, so send your list or drawing for a quote." },
    ],
  },
  {
    slug: "pin-lug-shank-couplings",
    existingSha256: '59279b1cee1d70dd0c5963c4153616d698ad5e4d50f59e84a601b21f3a8b2519',
    faqs: [
      { q: "What types of pin lug shank coupling are available?", a: "The range has an aluminium male shank coupling, an aluminium shank female coupling with a brass nut, and a complete set with a brass nut. The female nut has pin lugs, so it is tightened by hand or wrench." },
      { q: "What thread do the pin lug shank couplings use?", a: "They use NPSH hose thread to ASME B1.20.7. The male half has an NPSH thread on a hose shank and the female half has a brass NPSH nut with pin lugs. Send your hose size for a quote." },
    ],
  },
  {
    slug: "pressure-washer-waterjet-fittings",
    existingSha256: '2ace869b019aa502e80f329aae4de49d1ef087da367fd8ce6242a470126aa323',
    faqs: [
      { q: "What hose fittings are available for pressure washers and waterjet lines?", a: "The range covers a Kärcher-pattern bayonet gun insert for DN6 to DN8 (1/4\" to 5/16\") hose and a female hose fitting for DN6 to DN10 (1/4\" to 3/8\") hose. The female fitting is M22 × 1.5, with 3/8\" BSP female also available. They are carbon steel, with stainless on request." },
    ],
  },
  {
    slug: "ptfe-hoses",
    existingSha256: '0fac5bb8bd5f6766e2d96064b776d84fc812a32dc2e9bdfa0d485c55cc0791ef',
    faqs: [
      { q: "What is a PTFE hose used for?", a: "PTFE hose is used for chemical, pharmaceutical, food and high-purity service. The range covers smoothbore and convoluted tubes with stainless steel or polypropylene braid and anti-static options, for -73°C to +260°C. Send the fluid and pressure for a quote." },
      { q: "What size range does PTFE hose come in?", a: "The convoluted PTFE hose with stainless steel braid is listed from DN 10 (3/8\") to DN 75 (3\"). End fittings can be sanitary tri-clamp, NPT, JIC or flanged, per order. Send the fluid and pressure for a quote." },
    ],
  },
  {
    slug: "push-to-connect-pneumatic-fittings",
    existingSha256: '233f440ba4f6b0339dbdfaca1cbe2f61b13ab2088cfb062e59af86e28c3fbc3f',
    faqs: [
      { q: "What is a push to connect fitting?", a: "It is a one-touch push-in fitting for inch outside-diameter air tube, from 5/32\" to 1/2\". Indus supplies 44 listings from Dubai, including male connectors with NPT threads, Y connectors, reducing unions and plugs. Send the tube size and thread for a quote." },
      { q: "How do push to connect fittings work?", a: "The tube pushes into the fitting, where an internal O-ring seals on the tube outside diameter, and a POM release collet releases it. The bodies are plastic with a nickel-plated brass threaded end. They are for compressed air only." },
      { q: "What sizes are in the push to connect fittings size chart?", a: "They fit 5/32\" to 1/2\" outside-diameter tube, with NPT threads from 1/4\" to 1/2\". They are rated 0 to 150 psi (0 to 9.9 bar) and vacuum to -29.5 inHg, at 32 °F to 140 °F (0 °C to 60 °C). Send the tube size and thread for a quote." },
    ],
  },
  {
    slug: "quick-couplers",
    existingSha256: '21f8318486f6bf0abb60e6d625d3a560e94e4c4d8ccc09c421b91edc47c8bb1e',
    faqs: [
      { q: "What types of hydraulic quick coupler are there?", a: "The shelf covers ISO 7241 Series A and B, ISO 16028 flush face, ISO 5675 tractor, HTMA tool, 10,000 psi jack and water-blast, thread-to-connect, ARO 210 and MIL-C-4109 air, SAE J1502 test-point, refrigerant and oil-sampling couplers, plus a pressure gauge test kit." },
      { q: "How do hydraulic quick couplers work?", a: "A quick coupler is a two-part connector that joins and separates a fluid line by hand. Where the coupler is valved, such as a self-sealing poppet type, each half seals on disconnection. Send your thread, size and pressure for a quote." },
    ],
  },
  {
    slug: "r14-ptfe-hose-ends",
    existingSha256: '8ce154b581434fe987d2e73853c84d9665805cdeefed74577780c0cd0cf35d51',
    faqs: [
      { q: "What types of R14 PTFE hose end are available?", a: "The range includes R14 PTFE hose ends with JIC 37° female swivel (straight, 45° and 90°), NPTF male and ORFS female swivel ends in steel. A stainless steel 316L end with BSPP female swivel is also listed. They are for SAE 100R14 smooth-bore PTFE hose." },
      { q: "What hose sizes do the R14 PTFE hose ends fit?", a: "The listed JIC straight ends run from -3 (1/8\" ID) to -12 (5/8\" ID) hose, NPTF male ends from -4 (3/16\" ID) to -8 (13/32\" ID) and ORFS from -4 to -12. The stainless BSPP end fits -16 (7/8\" ID) hose. The size table on this page lists each end." },
    ],
  },
  {
    slug: "r5-textile-hose-ends",
    existingSha256: '8ce154b581434fe987d2e73853c84d9665805cdeefed74577780c0cd0cf35d51',
    faqs: [
      { q: "What types of R5 hydraulic hose fittings are there?", a: "R5 hose ends are made for SAE 100R5 textile-cover hose. The range has inverted flare male swivel and JIC 37° female swivel connections, each in straight, 45° and 90° forms. They are carbon steel, trivalent zinc plated." },
      { q: "Is there a size chart for R5 textile hose ends?", a: "Yes, the size table on this page lists them. Inverted flare ends run from 5/16\" to 1/2\" for -5 to -7 hose, and JIC 37° female swivel ends from 1/4\" (7/16-20) to 1-1/4\" (1-5/8-12) for -3 to -18 hose." },
    ],
  },
  {
    slug: "ratchet-straps-tie-downs",
    existingSha256: 'fe319ec0910b8cba0d4339c36e2c2b51d7481fe49dc51bd2a18caf38d0316519',
    faqs: [
      { q: "What sizes do ratchet straps come in?", a: "Ratchet straps are listed in widths of 1\" (25 mm), 2\" (50 mm), 3\" (75 mm) and 4\" (100 mm). The 2\" strap is listed at 3,333 lbs WLL to EN 12195-2 and the 4\" strap at 5,400 lbs WLL. The size table on this page shows each listing." },
      { q: "What types of ratchet strap are there?", a: "They are polyester load-securing straps for transport. End fittings include flat hooks, double J hooks, wire hooks, chain extensions and D rings, and endless straps are also listed. Send your load and strap width for a quote." },
      { q: "Which standard do ratchet straps follow?", a: "EN 12195-2 is the standard shown on the range. The straps are polyester, and the 2\" listing is stated at 3,333 lbs WLL to that standard. Indus supplies them from Dubai across the UAE." },
    ],
  },
  {
    slug: "reusable-hose-ends",
    existingSha256: '8ce154b581434fe987d2e73853c84d9665805cdeefed74577780c0cd0cf35d51',
    faqs: [
      { q: "Which reusable hydraulic hose repair fittings are available?", a: "The range includes reusable female JIC swivel and male NPT fittings, NPSM and NPTF female ends and reusable female swivel stems. They are field-attachable ends for SAE 100R1, R2AT and R5 hose." },
      { q: "What are reusable hose ends?", a: "Reusable hose ends are field-attachable fittings for SAE 100R1, R2AT and R5 hose. The listings give each end's thread, such as JIC 37° female swivel or male NPT. Send your hose type and thread for a quote." },
    ],
  },
  {
    slug: "rigging-hardware",
    existingSha256: '3a3db3090a84b3e6ecec5c88d8106f337953232268f6d8570c1fc77f6c998dee',
    faqs: [
      { q: "What are the types of rigging hardware?", a: "The range covers G-209, G-213 and G-2130 pattern shackles, 320 and 331 pattern hooks, DIN 580 and JIS B 1168 eye bolts, master links, swivels and turnbuckles. Snap hooks, quick links, lifting points and pad eyes are also listed." },
      { q: "What is rigging hardware used for?", a: "Rigging hardware is the forged, cast and stainless fittings that join slings, chain and wire rope to a hook, a load or an anchor point. Indus supplies it from Dubai, UAE." },
    ],
  },
  {
    slug: "rigging-pins",
    existingSha256: 'df8e7c77450be7a2d8556698f9e29f82fe5465f704e01721acf664b633e74225',
    faqs: [
      { q: "What are lynch pins used for?", a: "Lynch pins retain clevis pins, bolts and hitch pins. Rigging pins are supplied from Dubai, UAE in zinc-plated and stainless steel, and the range also includes R-clips, bent hitch pins, coil tension snap pins and wire lock pins." },
      { q: "What sizes do lynch pins come in?", a: "Lynch pins are listed from 4.4 to 10.4 mm in electro-galvanised carbon steel. Bent hitch pins are listed from 3/8 to 3/4″. The size table on this page lists each pin." },
      { q: "What types of rigging pins are there?", a: "The range covers lynch pins, R-clips, bent hitch pins, coil tension snap pins, wire lock pins, and hitch pins with lynch pin and chain. They come in zinc-plated and stainless steel." },
    ],
  },
  {
    slug: "ring-lock-couplings",
    existingSha256: 'dc13f853cbb8ed0fb1074cf8c191f3cf59107ee793f5b0e34e5486fb7baace16',
    faqs: [
      { q: "What are ring lock fittings?", a: "Ring lock fittings are zinc-plated steel hose shank couplings with a lever-ring lock. They suit low-to-medium pressure water transfer, irrigation and dewatering. Indus supplies them from Dubai across the UAE." },
      { q: "What types of ring lock coupling are available?", a: "The range has hose shank female couplings, hose shank male couplings, a female × male complete set with ring lock, and spare lever rings. Listed sizes run from 2\" upwards, with 3\", 4\", 6\" and 8\" shown. Send your size for a quote." },
    ],
  },
  {
    slug: "sae-flange-adapters",
    existingSha256: 'b354f31fa32380080c18894d05a049dbfea5d1e9920a1fb4a9ef60840d19a44e',
    faqs: [
      { q: "What is an SAE flange adapter?", a: "An SAE flange adapter is a 4-bolt flange-on-fitting adapter made to SAE J518 and ISO 6162. The range includes JIC by flange and weld-tube by flange variants, plus elbow patterns, in Code 61 (L-series, 210 bar) and Code 62 (S-series, 415 bar). Indus supplies them from Dubai." },
      { q: "What are the dimensions of SAE flange adapters?", a: "The Code 61 (L-series) flange heads in the range run from 1/2\" to 2\", with JIC 37° ends from 7/16-20 to 1-7/8-12 UN/UNF. L-series is rated up to 210 bar (3000 psi) and S-series up to 415 bar (6000 psi). The size table on this page lists each size." },
      { q: "What are SAE flange adapters made from?", a: "The listed SAE flange adapters are carbon steel, with stainless steel available on request. The finish is zinc-plated and Cr3+ passivated, and the listing states it is RoHS-compliant. Send a list, drawing or photo for a quote." },
    ],
  },
  {
    slug: "sae-flange-fittings",
    existingSha256: '21b845838744a068ebff5ed23ef48c4104890aa7a18eb0086fc5b574488a6451',
    faqs: [
      { q: "What are the SAE flange fitting sizes?", a: "Code 62 runs from 1/2\" to 2\" at up to 415 bar (6000 psi), and Code 61 from 1/2\" to 5\" at up to 210 bar (3000 psi). Both are four-bolt flanges to SAE J518. Send the flange size and code for a quote." },
      { q: "What types of SAE flange fittings are listed?", a: "The range covers 4-bolt split clamps and flange-on-fitting hose ends, including long drop and 90° types. Examples include Supercat Code 62 long drop and 90° fittings and Code 61 hose fittings. Supplied from Dubai." },
      { q: "What standard do SAE flange fittings follow?", a: "They follow SAE J518, with Code 61 matching ISO 6162-1 and Code 62 matching ISO 6162-2. Code 61 is the standard 210 bar duty and Code 62 the high-pressure 415 bar duty. Send the size and code for a quote." },
    ],
  },
  {
    slug: "sandblast-couplings",
    existingSha256: 'a5f32afaf0ab65fcc3dede049cb92f37b1723294414371003cd4804499a4643a',
    faqs: [
      { q: "What types of sandblast hose couplings are there?", a: "The range covers aluminium NPSH-threaded hose ends with crowfoot, plus nylon couplers, nozzle holders and female adapters. They join blasting hose to the pot, nozzle holder or next length in compressed-air and grit service." },
      { q: "What sizes and threads do sandblast couplings use?", a: "Hose ends and nozzle holders are listed in 3/4\", 1\", 1-1/4\" and 1-1/2\". Nozzle holders use NPSH hose thread (ASME B1.20.7), and the crowfoot hose ends use NPT pipe thread (ASME B1.20.1) in 1-1/4\" and 1-1/2\"." },
    ],
  },
  {
    slug: "shackles",
    existingSha256: '44ace1148982eab2610aaeaea1fd38d4bdb1bdcb004c5b114eae9f1ade91a2bf',
    faqs: [
      { q: "What types of shackle are there?", a: "Shackles are U-shaped connectors closed by a removable pin. The range includes screw-pin, round-pin and bolt-type anchor and chain shackles in G-209 to G-2150 patterns, Grade 8 alloy, AS 2741 Grade S, BS 3032, DIN 82101 and European types, plus stainless and snap shackles." },
      { q: "What sizes and WLL do shackles come in?", a: "For example, the G-2130 bolt-type anchor shackle runs from 3/16\" to 4\" and 0.333 to 150 t WLL. The Grade 8 alloy screw pin shackle runs from 5/16\" to 2\" and 1.2 to 55 t, and the AS 2741 Grade S from 5 mm to 63 mm and 0.33 to 55 t. The size table on this page lists them all." },
    ],
  },
  {
    slug: "shank-couplings",
    existingSha256: 'f6bb4b4a3ff3cbbff9a0dee8d3904600247237ce97d7896bb83318b00e48cf5a',
    faqs: [
      { q: "What are the types of industrial hose fittings in the shank coupling range?", a: "The range covers steel long-shank and brass short-shank hose nipples in female and male variants, plus a long-shank complete set. Shank couplings are the hose-end fittings that a hose is clamped onto, so they suit industrial transfer hoses with hose-band clamping. NPT pipe thread (ASME B1.20.1) is in the range." },
    ],
  },
  {
    slug: "ship-maintenance-chemicals",
    existingSha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    faqs: [
      { q: "What ship maintenance chemicals does Indus supply?", a: "The range includes anticorrosive and safety coatings, rust remover, penetrating oil, oil and grease remover and electrical equipment cleaner. They are the coatings, rust treatments and cleaners a ship gets through between dry-dockings, supplied from Dubai, UAE." },
      { q: "What is Ferryl Ferrycid rust remover used on?", a: "It is used on iron, steel, painted surfaces, wood, ceramic, plastic, vinyl and glass, for heavy rust and scale, limescale and cement and wooden decks. It is water-dilutable and leaves a thin protective layer. Heavy rust ends as a white powder that brushes or rinses off." },
      { q: "How is Ferryl Ferrycid rust remover applied?", a: "It can be applied by brush, rag, mop, spray, pouring, pressure washer or submersion, then rinsed with fresh water. It is diluted with water according to how severe the rust is. It comes in 25 L and 10 L drums and a 1 L bottle." },
    ],
  },
  {
    slug: "ship-offshore-anchors",
    existingSha256: '08c9396251a97f89da5f032a15ba9c8ed3bee8de5ee6a99de955bbd63e8ca34e',
    faqs: [
      { q: "What types of offshore anchor are there?", a: "The range includes drag-embedment anchors (300 kg to 18,000 kg) and other offshore anchors such as Stevpris, Stevin, Stevshark, Moorfast, LWT and Offdrill II patterns. Ship anchors include stockless, high holding power and stock types. Chasers and hooks for handling them are also listed." },
      { q: "What sizes do ship anchors come in?", a: "Delta anchors run from 1,000 kg to 40,000 kg. Spek stockless anchors are listed from 2,460 kg to 20,000 kg, AC-14 high holding power anchors from 30 kg to 36,000 kg and JIS stock anchors from 100 kg to 46,000 kg. The size table on this page lists each pattern." },
    ],
  },
  {
    slug: "snap-hooks-quick-links",
    existingSha256: 'f349a79275f8c68539526e0f0272c521e2f3c207cbada6731aaa7f7b64d323d4',
    faqs: [
      { q: "What types of snap hooks are there in this range?", a: "The range covers zinc-plated and stainless snap hooks, DIN 5299 carbine hooks with and without screw nut and eyelet, swivel eye bolt snaps, trigger and boat snaps and S hooks. Quick links, the screw-closed alternative, come in oval, pear, delta, long and wide-jaw forms. Indus supplies the range from Dubai, so send your list or a photo for a quote." },
      { q: "Is there a snap hook size chart, and what sizes do the hooks cover?", a: "The size table on this page lists each snap hook. Zinc-plated snap hooks with eyelet run from 4 × 40 mm to 14 × 180 mm at 200 to 1,600 lbs WLL, and with screw lock from 5 × 50 mm to 14 × 180 mm at 220 to 1,600 lbs WLL. The stainless snap hook is listed at 80 to 900 lbs WLL." },
    ],
  },
  {
    slug: "snatch-blocks-pulleys",
    existingSha256: '77b3b3a31ced51457f487188385972da6c29f8bf417815bd15dd9153df8f6a85',
    faqs: [
      { q: "What types of snatch block are there?", a: "The range includes light snatch blocks to the 404, 408, 409, 418 and 419 patterns, champion and super-champion blocks, heavy duty snatch blocks and metric snatch blocks with swivel hook from 0.5 to 5 t. Steel, malleable-iron, wooden and stainless pulley blocks are also listed." },
      { q: "What WLL do snatch blocks have?", a: "For example, the light double snatch blocks (408 and 409 patterns) are listed from 4 to 15 t on 4-1/2\" to 18\" sheaves. The 419 light snatch block runs 2 to 15 t, and heavy duty snatch blocks 2 to 15 t. The size table on this page lists each listing." },
    ],
  },
  {
    slug: "specialty-adapters-couplings",
    existingSha256: 'f58bbd2e8a7d42e68e6a9a9e601a9c908c3bdb5698e60d377fdf6061fff24d7b',
    faqs: [
      { q: "What are specialty cam and groove adapters?", a: "They are adapters that go beyond the standard Type A-F and DA-DD cam and groove range. The range includes socket-weld (AW, DW), ANSI Class 150 flanged (FA, FC), lockable dust caps (DCL), spool adapters, reducing variants and stainless steel NPSM, BSP and NPT thread reducers." },
      { q: "What pressure are the flanged cam and groove adapters rated to?", a: "The ANSI Class 150 flanged Type FC and FA are listed up to 250 psi for 1/2\" to 2\", 150 psi for 3\" to 4\" and 75 psi for 5\" to 6\". The rating derates with size, so check the datasheet. The standard seal is Buna-N (nitrile)." },
      { q: "Which standards do the specialty cam and groove adapters follow?", a: "The listings quote A-A-59326 (US, formerly MIL-C-27487) and EN 14420-7 (Europe), with ANSI B16.5 for the flanged variants. Thread reducers are listed to ASME B1.20.1 for NPT and ASTM A276 for 316 stainless steel." },
    ],
  },
  {
    slug: "spiral-hose-crimp-fittings",
    existingSha256: '2fc10b90d635f6916dce1b5e8c667f313783d0f4b1cd555a52713716ba45621e',
    faqs: [
      { q: "What types of hydraulic fittings fit spiral hose?", a: "These are one-piece hose ends on a heavier body. Ends include BSP 60° cone, DIN 24° cone, JIC 37°, ORFS, SAE 45° flare, NPT, JIS, Komatsu and SAE Code 61 and 62 flange heads. They come straight and in 45° and 90° elbows." },
      { q: "Which hose do spiral hose crimp fittings suit?", a: "They suit four-spiral-wire hydraulic hose, EN 856 4SP and SAE 100R12. Listings reference BS 5200, ISO 12151-6, DIN 2353, ISO 12151-2 and JIS B8363. Indus supplies them from Dubai, UAE." },
    ],
  },
  {
    slug: "spreader-beams",
    existingSha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    faqs: [
      { q: "What are spreader beams used for?", a: "Spreader beams take the load at two end points. Indus supplies them from Dubai across the UAE and GCC, from bolt-together modular systems to fixed and custom beams built for one load, with reference to EN 13155. Send the load and span for a quote." },
      { q: "What types of spreader beam are there?", a: "Modular spreader beams are listed at 24 t, 34 t and 50 t, with spans of 1-8 m, 1-10 m and 1-13 m respectively. Fixed and custom spreader beams are made to order for a single load. Send the load and span for a quote." },
      { q: "What is the specification for spreader beams?", a: "Spreader beams are listed with reference to EN 13155, with ASME B30.20 / BTH-1 or DNV offshore design on request. Fixed beams are made to order from an approved general arrangement drawing and load tested before dispatch, with a declaration of conformity. Send the load and span for a quote." },
    ],
  },
  {
    slug: "spreader-frames-h-frames",
    existingSha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    faqs: [
      { q: "What are spreader frames and H-frames used for?", a: "They carry loads that are lifted at four or more points. Indus supplies modular spreader frames from 10 t to 90 t, plus H-frames and lifting frames, to UAE and GCC buyers, listed to EN 13155. Send the load and lift points for a quote." },
      { q: "What sizes do modular spreader frames come in?", a: "Modular spreader frames run from 10 t to 90 t, with frame sizes from up to 4.5 × 4.5 m at 10 t to 14 × 14 m at 90 t. The WLL per corner is a quarter of the frame WLL. They use steel corner units with bolt-in modular struts and grade 8.8 bolts." },
    ],
  },
  {
    slug: "ss316l-banjos",
    existingSha256: 'dda23ec9270ab55f342c8d2340f69423c9c9deb80ee30f63d76445df97a26576',
    faqs: [
      { q: "What thread sizes do the SS316L banjo fittings come in?", a: "Metric banjos run from M10×1 to M22×1.5 and BSPP banjos from G1/8 to G3/4. They are DIN 7642 banjos in passivated 316L stainless steel, with bonded-seal washers on the bolt." },
      { q: "What is a banjo fitting made of?", a: "A banjo fitting is a hollow bolt and a banjo eye, sealed with bonded-seal washers. Here they are 316L stainless steel in metric and BSPP (ISO 228-1) thread variants. Send your thread and size for a quote." },
    ],
  },
  {
    slug: "ss316l-bsp-fittings",
    existingSha256: '9dd95f276195a50bf645e060413703b69921bdc0414c0058b40baa3c0cc0407f',
    faqs: [
      { q: "What is the difference between BSPP and BSPT in SS316L BSP fittings?", a: "BSPP is the parallel thread to ISO 228-1 and BSPT is the taper thread to ISO 7-1. These 316L stainless steel fittings are listed in BSPP from G1/8 to G2. Send the thread and size for a quote." },
      { q: "What sealing types do SS316L BSP fittings come with?", a: "The range includes 60° cone, flat-face and O-ring sealing variants. Examples include BSP male flat seat, BSP male parallel 60° cone and BSP swivel female 60° cone ends. The parts are 316L stainless steel, supplied from Dubai." },
    ],
  },
  {
    slug: "ss316l-double-hexagonal-fittings",
    existingSha256: '0620fb3ec125c15a54cb9f17f67ee4b1abefcfbac46d4612b85fd085289be258',
    faqs: [
      { q: "What are SS316L double hexagonal fittings made from?", a: "They are 316L stainless steel, passivated with no plating, and sized to the host port. The extended hex body gives higher wrenching torque and suits tight spaces. Indus supplies them from Dubai across the UAE." },
      { q: "Which standards apply to SS316L double hexagonal fittings?", a: "They follow ISO 228, SAE J514 and ISO 8434. The BSP versions are 60° cone seat parallel thread from G1/8 to G2, and the JIC version has a 37° cone seat. Send the thread and size for a quote." },
    ],
  },
  {
    slug: "ss316l-hydrowashing-couplings",
    existingSha256: '2e409635057df9e2d6d72eacf7617f5d1eaf11dbd7c1bdfd7dcf7c941cf158ed',
    faqs: [
      { q: "What are SS316L hydrowashing couplings used for?", a: "They connect high-pressure hydrowashing machines to their hose, and Indus supplies them from Dubai as hexagonal nuts and standpipes. The parts are 316L stainless steel and sized to the machine hose. Send the machine model or a sample for a quote." },
      { q: "Which standard do SS316L hydrowashing couplings follow?", a: "They are listed to the washer manufacturer's own specification rather than a general standard. The parts are passivated 316L stainless steel with no plating, and they are sized to the host equipment. Send the machine model or a sample so the right size can be quoted." },
    ],
  },
  {
    slug: "ss316l-jic-37-fittings",
    existingSha256: '1d84f0dd255c7c2e35868e8ed0fc8b73aa5b85eec16e4a3a7d59c873fa077be3',
    faqs: [
      { q: "What sizes do the SS316L JIC 37° fittings come in?", a: "They run from -04 to -32 (1/4\" to 2\") in dash size, with UN/UNF threads from 7/16-20 to 1-7/8-12. They are 316 stainless steel with a 37° metal-to-metal cone seat, made to SAE J514 and ISO 8434-2. The size table on this page lists each fitting." },
      { q: "What shapes of stainless JIC 37° fitting are available?", a: "The range includes male JIC 37° (also with an O-ring) and JIC 37° female swivel fittings, in straight, 45° and 90° configurations, with a compact 90° elbow also listed. All are passivated 316 stainless with no plating." },
    ],
  },
  {
    slug: "ss316l-metric-fittings",
    existingSha256: 'b019b31e42c976d0873b14813ed38cc011f4a1267f1117f5387b6328befac6a6',
    faqs: [
      { q: "What sizes do SS316L metric 24° cone fittings cover?", a: "The listings run from M10×1 to M42×2 with a 24° cone, in male stud and female swivel forms, straight and 45° elbow. Female swivels are listed with an O-ring. The size table on this page lists the sizes." },
      { q: "Which standards do SS316L metric fittings follow?", a: "The listings quote ISO 8434-1 and DIN 2353 for the 24° cone, with ISO 6149-1 and DIN 3852-2 for the stud ends. Send a list, drawing or photo and Indus will quote from Dubai." },
      { q: "What stainless steel grade are SS316L metric fittings?", a: "The listings are 316 or 316L austenitic stainless steel, described as marine grade, with 316L being the low-carbon version. They are passivated, with no plating. They are supplied from Dubai across the UAE." },
    ],
  },
  {
    slug: "ss316l-npt-npsm-fittings",
    existingSha256: '2374c99ede05fb2e2245aa88b684275f2710fddd3d68f0f4c22dc5dc89515975',
    faqs: [
      { q: "What is the difference between NPT and NPSM on these fittings?", a: "NPT is a taper thread that is self-sealing on engagement, used here on the male ends. NPSM is a straight (parallel) pipe thread, used here on the female swivel, which has a 60° cone seat. Threads are to ASME B1.20.1 (NPT) and ANSI/ASME B1.20.1 (NPSM)." },
      { q: "What sizes and shapes do SS316L NPT NPSM fittings come in?", a: "They are listed from 1/8\" to 2\" in straight, 45° and 90° configurations, with male NPT taper ends and female NPSM swivels. The material is 316 or 316L stainless steel, passivated with no plating. The size table on this page lists them." },
    ],
  },
  {
    slug: "ss316l-orfs-fittings",
    existingSha256: '5b9727b7623a82e75f9bda21254aec5d1030339fbd87993a28af2e0af6de2e73',
    faqs: [
      { q: "What are SS316L ORFS fittings?", a: "They are face O-ring hose fittings made in 316L stainless steel to SAE J1453 and ISO 8434-3. The range covers male, female swivel and double-hex ends in straight, 45° and 90° configurations. Indus supplies them from Dubai; send the size and hose type for a quote." },
      { q: "What sizes do SS316L ORFS fittings come in?", a: "The listings run from -04 to -16 dash size, with UN/UNF threads from 9/16-18 to 1-7/16-12. They are passivated 316L stainless steel with no plating. Send the size and hose type for a quote." },
    ],
  },
  {
    slug: "ss316l-sae-fittings",
    existingSha256: 'c76f4ab3fb5cabe1f492b7e17ac60f57bde11cb541beda3a33bf1a1a471f6521',
    faqs: [
      { q: "What standard do SS316L SAE flange fittings follow?", a: "They are four-bolt flange-on-fitting hose ends to SAE J518 and ISO 6162, in 316L stainless steel. Code 61 is rated 3000 psi and Code 62 6000 psi. Indus supplies them from Dubai across the UAE." },
      { q: "What sizes and shapes do SS316L SAE flange fittings come in?", a: "They come in straight, 45° and 90° configurations, and the listings show sizes from 1/2\" to 2\". Code 61 is up to 210 bar (3000 psi). Send the flange size and code for a quote." },
    ],
  },
  {
    slug: "ss316l-sae-flanges-for-hoses",
    existingSha256: 'ff7d8eef5456ba85b58940c8dd39c7da84e31c63bf1e8c50e70beaa6e0a338ba',
    faqs: [
      { q: "What is included in the SS316L SAE flange range?", a: "The range covers counter-flanges, single flanges, split flanges and matching O-ring seal sets for 3000 to 6000 psi flange joints. They are 316L stainless steel to SAE J518, with ISO 6162 also listed. Send your size and pressure class for a quote." },
      { q: "What sizes and pressure ratings do SS316L SAE flanges cover?", a: "The listings run from 1/2\" to 2\", with L-series at 210 bar (3000 psi) and S-series at 415 bar (6000 psi). They are four-bolt flanges to SAE J518. Send your size and pressure class for a quote." },
    ],
  },
  {
    slug: "ss316l-standpipes",
    existingSha256: '3b5964a13c79f1fe045313f3c4e02589bcc949612d7a64d8b53b4392569e5642',
    faqs: [
      { q: "What types of SS316L standpipe are available?", a: "The range covers DIN 2353 metric standpipes, gas tube standpipes, double-crimp standpipes and welding standpipes, in straight and 90° configurations. They are 316L stainless steel for hose assemblies." },
      { q: "What tube sizes do the SS316L standpipes fit?", a: "The double-crimp and gas tube standpipes are listed for tube OD 6 to 42 mm in light and heavy series, with a 24° cone (DIN 2353) male end. They are passivated 316L stainless steel, to DIN 2353 and ISO 8434-1." },
    ],
  },
  {
    slug: "stainless-crimp-hose-fittings",
    existingSha256: '8ce154b581434fe987d2e73853c84d9665805cdeefed74577780c0cd0cf35d51',
    faqs: [
      { q: "What sizes do stainless steel crimp hose fittings come in?", a: "They suit hose from 1/4\" ID (-4) to 1\" ID (-16). Ends are listed as NPT from 1/4\" to 1\", ORB from 1/4\" (7/16-20) to 1\" (1-5/16-12), and tube stub from 1/4\" to 1\". The size table on this page lists each fitting." },
      { q: "When should I use stainless steel crimp hose fittings?", a: "Use them where corrosion or washdown rules out carbon steel. They are 316 stainless steel hose ends crimped onto braided hose, in 43 Series and THY Series forms with NPT male swivel, ORB male and tube stub ends, plus elbows." },
    ],
  },
  {
    slug: "stainless-hose-barbs-push-on-fittings",
    existingSha256: '8ce154b581434fe987d2e73853c84d9665805cdeefed74577780c0cd0cf35d51',
    faqs: [
      { q: "What types of stainless steel hose barbs are listed?", a: "The 12 listings include hose barb by NPT male, 90° elbow versions, and hose barb by JIC 37° female swivel or male ends, with BSPP push-on versions. They are 316 stainless steel. Send the hose bore and thread type for a quote." },
      { q: "What sizes do the stainless steel hose barbs cover?", a: "Hose barb by NPT male runs from 1/8\" to 3\", and JIC 37° versions from 1/4\" to 2\". BSPP push-on versions run from 1/4\" to 1\" hose ID. Send the hose bore and thread type for a quote." },
    ],
  },
  {
    slug: "stainless-steel-150-threaded-pipe-fittings",
    existingSha256: '311de7dad336c37b40df5dd53b10f865bbe34e57156280da9d4e0323f27db26e',
    faqs: [
      { q: "What types of stainless steel 150 threaded pipe fittings are there?", a: "They are Class 150 cast threaded fittings in 304 and 316 with NPT threads. The range includes reducing couplings, square head plugs, tees, 90° and 45° elbows, unions and half couplings." },
      { q: "What sizes do stainless steel 150 threaded fittings come in?", a: "Tees, elbows, unions and square head plugs are listed from 1/8\" to 4\", and reducing couplings from 1/4\" to 4\". NPT threads are to ASME B1.20.1. The size table on this page lists each fitting." },
    ],
  },
  {
    slug: "stainless-steel-3000-forged-threaded-fittings",
    existingSha256: '311de7dad336c37b40df5dd53b10f865bbe34e57156280da9d4e0323f27db26e',
    faqs: [
      { q: "What are stainless steel 3000 forged threaded fittings?", a: "They are Class 3000 forged fittings in 304 and 316, to ASME B16.11 and ASTM A182, with NPT threads to ASME B1.20.1. The range includes full couplings, 45° and 90° elbows and street elbows." },
      { q: "What sizes do stainless steel 3000 forged fittings come in?", a: "Full couplings are listed from 1/8\" to 4\", 45° and 90° elbows from 1/8\" to 3\", street elbows from 1/8\" to 2\" and caps from 1/8\" to 2-1/2\". The size table on this page lists each fitting." },
    ],
  },
  {
    slug: "stainless-steel-bsp-metric-adapters",
    existingSha256: '9437472b6c3e4624de11fbc83bd47bd0a826c91bbe6f42b30806523b9492b7d7',
    faqs: [
      { q: "What are the dimensions of stainless steel BSP adapters?", a: "BSPP bonded seals, plugs, caps and nipples run from 1/8\" to 2\" (G1/8-28 to G2-11), and straight adapters from 1/8\" to 1-1/2\". BSPT taper adapters are listed from 1/4\" to 3/4\" (R1/4-19 to R3/4-14), and metric bonded seals from M6 to M33. The size table on this page shows each listing." },
      { q: "What is the difference between BSPP and BSPT stainless adapters?", a: "BSPP is a parallel thread to ISO 228-1 and is sealed by a bonded seal, O-ring or cone seat. BSPT is a taper thread to ISO 7-1 that seals on the thread flanks. Check which thread your port uses before ordering." },
    ],
  },
  {
    slug: "stainless-steel-butt-weld-fittings",
    existingSha256: '311de7dad336c37b40df5dd53b10f865bbe34e57156280da9d4e0323f27db26e',
    faqs: [
      { q: "What are the dimensions of stainless steel butt weld fittings?", a: "Dimensions are to ASME B16.9 in Sch 10 and Sch 40. The 45° and 90° long-radius elbows are listed from 1/2\" to 12\" NPS, and 90° short-radius elbows from 1\" to 12\" in Sch 10 and 1\" to 8\" in Sch 40. The size table on this page lists each fitting." },
      { q: "Which standards cover stainless steel butt weld fittings?", a: "Dimensions are to ASME B16.9, and material and dimensional data reference ASTM A403/A960 and MSS SP-43. The fittings are wrought 304 and 316 stainless steel with bevelled ends, in Sch 10 and Sch 40, supplied from Dubai, UAE." },
    ],
  },
  {
    slug: "stainless-steel-chain",
    existingSha256: 'fe626a4b02ee3f7376980594609d0ba4cb00d1d84a10a81106248fa0e68080c0',
    faqs: [
      { q: "What types of stainless steel chain do you supply?", a: "The range covers DIN 764 medium link chain (4 to 20 mm), DIN 763 long link chain (15 to 3,750 kg), DIN 766 short link chain (2 to 32 mm) and Grade 60 stainless lifting chain (0.2 to 15 t WLL). Stainless hammerlocks and connecting links are also listed." },
      { q: "What sizes does stainless steel chain come in?", a: "Grade 60 stainless chain runs from 3 mm to 26 mm, DIN 764 from 4 mm to 20 mm and DIN 766 from 2 mm to 32 mm. DIN 763 is listed from 15 kg to 3,750 kg. The size table on this page lists each chain." },
    ],
  },
  {
    slug: "stainless-steel-din-2353-fittings",
    existingSha256: '5b7e5c7c1bc90a89381488509bb4a99d28c88494eecf7631b0f0bed9ddc827e5',
    faqs: [
      { q: "What sizes do the stainless DIN 2353 fittings come in?", a: "They are metric 24° cone bite-type fittings for tube from 4 mm to 42 mm, for example M8×1.0 for 4 mm tube and M52×2.0 for 38 mm tube. Light and heavy series are listed. The size table on this page lists each fitting." },
      { q: "What types of stainless DIN 2353 fitting are available?", a: "The range includes union tees, female swivel 90° elbows and NPT male 90° elbows, in extra-light, light and heavy series. A cutting ring and nut bite into the tube. They are made to DIN 2353 and ISO 8434-1." },
    ],
  },
  {
    slug: "stainless-steel-flanges",
    existingSha256: '05a6d24f3e021ee0b339660dffc84978ae6a7666fc1738e454b252c50b1b0f06',
    faqs: [
      { q: "What types of stainless steel flange do you supply?", a: "The range covers weld neck, slip-on, socket weld, lap joint and threaded (NPT female) flanges to ASME B16.5, all with raised faces and in 304 stainless steel. Matching MSS SP-43 Type A and Type C stub ends are listed for lap joints." },
      { q: "What are Type A and Type C stub ends?", a: "Both are 304 stainless MSS SP-43 stub ends with a butt-weld end and a lap end, used with lap joint flanges. Type A is listed from 1/2\" to 12\" NPS in Sch 10 and Sch 40, and Type C from 1/2\" to 8\" NPS in Sch 10." },
      { q: "What sizes and classes do the stainless steel flanges come in?", a: "Weld neck flanges run 1/2\" to 10\" NPS in Class 150 and 300, lap joint flanges 3/4\" to 12\" in Class 300, socket weld 1/2\" to 3\" in Class 300 and slip-on 1\" to 6\" in Class 300. The size table on this page lists each flange." },
    ],
  },
  {
    slug: "stainless-steel-hydraulic-fittings",
    existingSha256: '520baea485732f4e1283717e7901f852c826cc292360c6d412fd17dc01e0c893',
    faqs: [
      { q: "What types of stainless steel hydraulic fitting are there?", a: "The range is SS316L hose ends, adapters and flanges: BSP 60° cone and flat seat, metric 24° cone, JIC 37°, ORFS, NPT and NPSM forms, double-hex swivels, SAE Code 61 and 62 flanges, banjos, standpipes and hydrowashing couplings." },
      { q: "What is the specification of stainless steel hydraulic fittings?", a: "They are machined from SS316L and passivated, with no plating. Standards quoted include ISO 228-1 and ISO 7-1 for BSP, DIN 2353 and ISO 8434-1 for metric 24° cone, ASME B1.20.1 for NPT, and SAE J518 and ISO 6162 for flanges." },
    ],
  },
  {
    slug: "stainless-steel-jic-adapters",
    existingSha256: '5d58cc29286f3e380fb9eb956a3c12389fda554048eb7966ed82df21890f32ef',
    faqs: [
      { q: "What types of stainless steel JIC fittings are listed?", a: "Listings include JIC 37° male by NPT female connectors, 90° elbows, branch tees, run tees and bulkhead connectors, plus JIC male by NPT male 45° elbows. They are 316L stainless steel with threads to SAE J514 and ISO 8434-2. Send the size and thread for a quote." },
    ],
  },
  {
    slug: "stainless-steel-npt-pipe-adapters",
    existingSha256: 'b4d50a336f30a7de900b5049adcb29e385952f183bcd8b1dfafdc3572741d4d2',
    faqs: [
      { q: "What is NPSM pipe thread on stainless steel adapters?", a: "NPSM is a straight pipe thread. On the female NPSM swivel adapters here it sits on a swivel nut that seals on a 30° seat, not on the thread. NPT, by contrast, is a taper thread that seals on the thread flanks with sealant or tape." },
      { q: "What sizes do stainless steel NPT adapters come in?", a: "Straight NPT adapters are listed from 1/8\" to 2\" (1/8-27 to 2-11.5), plugs from 1/8\" to 3\", and reducer bushings from 1/4\" to 2\". They are 316L stainless steel, with thread data to ASME B1.20.1." },
    ],
  },
  {
    slug: "stainless-steel-orb-adapters",
    existingSha256: '8682c598e4b812d62bc1e9f7c8de3a906d1ffb5547e14a983c7963abe56cad5a',
    faqs: [
      { q: "What sizes do stainless steel ORB adapters come in?", a: "They run from 1/4\" to 2\" (7/16-20 to 2-1/2-12) in 316L stainless steel. Unions, adjustable elbows and branch tees are listed to SAE J1926 and ISO 11926. The size table on this page shows each listing." },
      { q: "How does a stainless steel ORB adapter seal?", a: "An SAE O-ring boss (ORB) adapter fits a straight-thread port, and the O-ring under the hex seals the port. They suit ports on pumps, valves and manifolds. Listings are to SAE J1926 and ISO 11926." },
      { q: "What pressure are stainless steel ORB adapters rated to?", a: "The listings state up to 5,000 psi, falling with size (SAE J514, manufacturer). Check the rating for your size in the table on this page before ordering." },
    ],
  },
  {
    slug: "stainless-steel-orfs-adapters",
    existingSha256: '8682c598e4b812d62bc1e9f7c8de3a906d1ffb5547e14a983c7963abe56cad5a',
    faqs: [
      { q: "What types of stainless steel ORFS adapter are there?", a: "Listed types include braze sleeves, bulkhead locknuts, female plugs, male bulkhead unions (straight and 45° elbow), female swivel × male reducers and other swivel ends. All are stainless steel O-ring face seal adapters." },
      { q: "What sizes do stainless steel ORFS adapters come in?", a: "Braze sleeves run from 1/4\" to 1\" (9/16-18 to 1-7/16-12), and bulkhead locknuts, plugs and bulkhead unions from 1/4\" to 1-1/2\" (9/16-18 to 2-12). Straight reducers are listed from 3/8\" to 1\". The size table on this page lists each listing." },
      { q: "How does an ORFS adapter seal?", a: "An ORFS (O-ring face seal) adapter has a flat face sealed by an O-ring in a groove on the male face. It is used for high-pressure, high-vibration lines that must not weep. Data in the listings is to SAE J1453 and ISO 8434-3." },
    ],
  },
  {
    slug: "stainless-steel-pipe-fittings",
    existingSha256: '311de7dad336c37b40df5dd53b10f865bbe34e57156280da9d4e0323f27db26e',
    faqs: [
      { q: "What types of stainless steel pipe fittings are there?", a: "The range runs through butt-weld fittings, flanges and stub ends, sanitary fittings and tubing, weld outlets, pipe nipples, and 150# threaded and 3000# forged threaded fittings. They are 304 and 316 stainless steel, supplied from Dubai." },
      { q: "What sizes do stainless steel pipe fittings come in?", a: "Every listing has a size table. For example, 304 forged 3000# NPT full couplings run from 1/8\" to 4\", 45° and 90° elbows from 1/8\" to 3\", and 90° street elbows from 1/8\" to 2\"." },
      { q: "Which standards apply to stainless steel pipe fittings?", a: "Standards listed include ASME B1.20.1, ASME B16.5 and ASME B16.11, with ASTM A182 for forged fittings. Sanitary tubing lists ASTM A269/A270 and 3-A as the manufacturer states. Send your size and class for a quote." },
    ],
  },
  {
    slug: "stainless-steel-pipe-nipples",
    existingSha256: '311de7dad336c37b40df5dd53b10f865bbe34e57156280da9d4e0323f27db26e',
    faqs: [
      { q: "What sizes do stainless steel pipe nipples come in?", a: "Sch 40 welded nipples run from 1/8\" to 6\" in 304 and 316. Sch 80 seamless run from 1/8\" to 4\" in 304 and 1/8\" to 6\" in 316. Hex nipples are listed 1/8\" to 2\" in 316. The size table on this page lists them." },
      { q: "What types of stainless steel pipe nipple are there?", a: "The range covers Sch 40 welded and Sch 80 seamless pipe nipples, hex nipples and reducing hex nipples. All are NPT male × male with threads to ASME B1.20.1, in 304 and 316 stainless steel." },
    ],
  },
  {
    slug: "stainless-steel-sae-flange-adapters",
    existingSha256: '8682c598e4b812d62bc1e9f7c8de3a906d1ffb5547e14a983c7963abe56cad5a',
    faqs: [
      { q: "What types of stainless steel SAE flange adapters are there?", a: "The range covers SAE four-bolt flange heads and split flanges for Code 61 and Code 62. It includes JIC 37° male by flange head adapters in straight, 45° and 90° forms. They are 316L stainless steel, supplied from Dubai, UAE." },
      { q: "Is there a size chart for stainless steel SAE flange adapters?", a: "Yes, the size table on this page lists them. JIC 37° male by Code 61 flange head adapters are listed from 1/2\" to 2\" (3/4-16 to 2-1/2-12), and Code 62 adapters from 3/4\" to 2\" (1-1/16-12 to 2-1/2-12)." },
    ],
  },
  {
    slug: "stainless-steel-sanitary-fittings",
    existingSha256: '311de7dad336c37b40df5dd53b10f865bbe34e57156280da9d4e0323f27db26e',
    faqs: [
      { q: "What types of stainless steel sanitary fittings are there?", a: "The range covers clamp and weld fittings in 304 and 316 for food, beverage and pharmaceutical lines. Examples are tank weld ferrules, 45° and 90° elbows, concentric and eccentric reducers, reducing tees, a clamp-end check valve, bevel-seat hex nuts, tube hangers and tube plate flanges, plus tubing." },
      { q: "What sizes do the stainless steel sanitary fittings come in?", a: "Sizes are given by tube O.D. Examples: clamp-end 90° elbows 1/2\" to 6\", weld-end reducers 3/4\" to 6\", tube plate flanges 1\" to 12\" and sanitary tubing 1/2\" to 6\". The size table on this page lists each fitting." },
      { q: "What connection ends do the sanitary stainless fittings have?", a: "The listings include clamp × clamp, weld × weld, clamp × weld, bevel-seat and clamp × hose ends. An example of the last is the Tygon hose adapter, clamp end, in 1\" to 2\" tube O.D. Send a list or drawing for a quote." },
    ],
  },
  {
    slug: "stainless-steel-weld-outlets",
    existingSha256: '311de7dad336c37b40df5dd53b10f865bbe34e57156280da9d4e0323f27db26e',
    faqs: [
      { q: "What types of stainless steel weld outlet are there?", a: "The range includes forged 3000# butt-weld outlets (Sch 40 and Sch 80), socket-weld outlets and threaded outlets, plus weld-on tube × NPT male adapters. There are also 45° swivel elbows and straight swivel adapters with a weld end and JIC or ORFS swivel." },
      { q: "What sizes do stainless steel weld outlets come in?", a: "The Class 3000 forged outlets run from 1/4\" to 3\" (Sch 80 butt-weld from 1/4\" to 2\"). The weld-on tube × NPT male adapters run from 1/4\" to 2\" tube O.D. Both 304 and 316 are listed. The size table on this page shows each listing." },
      { q: "Which standards apply to stainless steel weld outlets?", a: "The forged outlets are listed to MSS SP-97 and ASTM A182. NPT threads are to ASME B1.20.1, and the JIC swivel adapters cite SAE J514. Send a list or drawing for a quote." },
    ],
  },
  {
    slug: "steel-hose-barb-adapters",
    existingSha256: 'dbfc67ec40de0b77bc06deaa2399019ae2b9a626241bc6ceb93cea723851ce33',
    faqs: [
      { q: "What types of steel hose barb fitting are listed?", a: "The range includes barb menders and tees, barbs to ORB male and NPTF male in 45° and 90° elbow forms, hose ferrules and flat face connectors. They are beaded barb adapters in zinc-plated steel for push-on hose on low-pressure lines. Supplied from Dubai." },
      { q: "What sizes are the steel hose barb fittings?", a: "The beaded hose barbs run from 1/4\" to 2\", with ORB threads from 7/16-20 to 2-1/2-12. They are forged carbon steel, trivalent zinc plated. Send the hose bore and thread for a quote." },
    ],
  },
  {
    slug: "steel-weld-on-adapters",
    existingSha256: '78c20fe287bc5e6e0a0ba5b59bbaeaa234ce21c2648928cc5c125ff04d6c951f',
    faqs: [
      { q: "What is a weld on adapter?", a: "A weld on adapter is a weld-to-thread fitting that puts a threaded end on tube or metal hose. Indus supplies weld-on tube by JIC 37° female swivel, JIC 37° male, NPT female and NPT male, to SAE J514 and ASME B1.20.1." },
      { q: "What sizes are steel weld-on adapters?", a: "The weld end fits 1/4\" to 2\" tube outside diameter, with JIC 37° or NPT ends in matching sizes. They are forged carbon steel, trivalent zinc plated. Send the tube size and thread for a quote." },
    ],
  },
  {
    slug: "steel-wire-rope",
    existingSha256: '09b0e2c2511b3607d104669afab03ce69d449bde88250ff0382fe552a205f2c7',
    faqs: [
      { q: "What types of steel wire rope do you supply?", a: "The range covers steel wire rope in 6x7, 6x19, 6x19S/W and 6x37 constructions, galvanized or bright, with fibre or steel core. Stainless steel wire rope in 6x7+IWS and 6x19, aircraft cable and 1x7 and 1x19 wire strand are also listed." },
      { q: "What sizes does steel wire rope come in?", a: "Stainless 6x7+IWS rope runs from 0.45 to 8 mm, stainless 6x19 from 6.00 to 32.00 mm and 8x19S rope from 8 to 22 mm. Aircraft cable is 1.58 to 5.40 mm and stainless strand 0.15 to 6 mm. The size table on this page lists each rope." },
    ],
  },
  {
    slug: "storz-couplings",
    existingSha256: 'ae44e18951aad32c5817cd11481d21435e01a6809eaff240ab3acf85a85a5c69',
    faqs: [
      { q: "What is a Storz coupling?", a: "A Storz coupling is a symmetrical quick-connect hose coupling in which two identical heads lock together with a twist. It is used on fire-service, dewatering and water-transfer hose, and Indus supplies the range from Dubai, UAE. Send the hose size for a quote." },
      { q: "What sizes do Storz couplings come in?", a: "The range runs from 25 to 150 mm, covering long-shank hose couplings, thread and swivel adapters, safety-latch couplings, reducers, UL-listed fire department connections, gaskets and clamps. Send the size and thread for a quote." },
    ],
  },
  {
    slug: "suction-hoses",
    existingSha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    faqs: [
      { q: "What sizes do suction hoses come in?", a: "The EPDM/PE suction hose with rigid helix is listed from 1\" to 6\". It is green with a black rigid polyethylene helix and holds open under vacuum. The size table on this page shows each listing, and you can send the pump and flow details for a quote." },
      { q: "What is the difference between a suction hose and a delivery hose?", a: "Lay flat hose collapses under vacuum, so pumps draw through a rigid-helix suction hose instead. This EPDM/PE suction hose holds open at up to 0.95 bar vacuum and can double as a discharge hose. Indus supplies it from Dubai." },
      { q: "What is the suction hose with rigid helix made from?", a: "It is an EPDM/PE compound hose with a rigid polyethylene helix that holds the round shape under vacuum. The listed pressure is 1.4 to 3.0 bar at 40 °C, depending on size. Weight runs from 0.46 to 4.00 kg/m." },
    ],
  },
  {
    slug: "synthetic-slings",
    existingSha256: '7c845e9cb94fd20457b9b5808a9ba395e22e0cd35a025a64a27141c90f705895',
    faqs: [
      { q: "Are round slings and webbing slings colour-coded?", a: "Yes. The polyester round slings and flat webbing slings are colour-coded by capacity to EN 1492. The range also includes braided rope heavy-lift slings and the Grade 80 hooks, rings and connectors made for them." },
      { q: "What capacities do polyester webbing slings come in?", a: "The polyester webbing slings are listed to EN 1492-1 from 1,000 kg to 12,000 kg, and the flat webbing slings from 1 to 12 t. The size table on this page shows each listing. Send your load and sling type for a quote." },
      { q: "What types of synthetic sling are there?", a: "The range has polyester round slings, polyester flat webbing slings and braided rope heavy-lift slings with a jacket (72 mm to 288 mm). Grade 80 fittings for web slings include clevis belt hooks, elephant feet, twist hooks, triangle and D rings and webbing connectors." },
    ],
  },
  {
    slug: "tensioner-compensator-hoses",
    existingSha256: 'b3dba4e62edf5de27049e41c0180c5dcac95e176ede52c7ed1092510e2a07af1',
    faqs: [
      { q: "What is a riser tensioner or compensator hose?", a: "It is a hose assembly for offshore drilling motion compensation, including riser tensioner, drill string compensator and hydraulic tensioner hoses. They use fatigue-rated steel-cable reinforcement for multi-million-cycle service. Send your assembly details or drawing for a quote." },
      { q: "What pressure and size do tensioner and compensator hoses come in?", a: "The listings show 5000 psi WP and 12500 psi MBP, in sizes from 1\" to 4\", for -30°C to +82°C. They have multiple high-tensile steel cable plies and flanged ends, with API Spec 7K as a cross-reference." },
    ],
  },
  {
    slug: "thermoplastic-hoses",
    existingSha256: 'c9a5bd666ec1a3fbd0443a30e1e453cc42bc0b2c21b8805647b935519291415e',
    faqs: [
      { q: "What is thermoplastic hose?", a: "Thermoplastic hose uses a fibre-braid reinforcement and a polyurethane cover in place of rubber. That gives a lighter hose with a tighter bend radius and good flex life. The range includes SAE 100R18 hose and Parker 510C, 518C and 520N series." },
      { q: "What temperature range do thermoplastic hoses cover?", a: "The SAE 100R18 thermoplastic hoses are listed from −67 °F to 212 °F (−55 °C to 100 °C). Non-conductive hose is listed from 1/4\" to 1/2\" and the low-friction black cover hose from 3/16\" to 5/8\"." },
    ],
  },
  {
    slug: "thy-series-crimp-fittings",
    existingSha256: '8ce154b581434fe987d2e73853c84d9665805cdeefed74577780c0cd0cf35d51',
    faqs: [
      { q: "What types of THY Series crimp hose fitting are there?", a: "The range includes a hose mender, weld fittings, flareless compression male (SAE J514), NPSM female swivel, NPTF female and NPTF male swivel 90° ends. They are for braided, pressure-wash and thermoplastic hose." },
      { q: "What sizes do THY Series crimp hose fittings cover?", a: "Hose sizes run from 3/16\" ID (-3) to 1-1/4\" ID (-20). Threaded ends range from 1/8\" NPTF to 1\" NPTF and 1/4\" NPSM to 1-1/4\" NPSM, and flareless tube ends from 1/4\" to 1\". Fittings are carbon steel, trivalent zinc plated." },
    ],
  },
  {
    slug: "towing-mooring-fittings",
    existingSha256: '3bc5707de4320ca874a69688975c27f3c39f2c2469b5dab16bdb0c3dc9640c7f',
    faqs: [
      { q: "What types of deck fittings do you supply?", a: "The range covers mooring chocks, fairleads, guide and pedestal rollers, chain stoppers, cable lifters, towing brackets, pelican hooks, quick-release hooks and chafe chain. They follow ISO, DIN, JIS and OCIMF standards." },
      { q: "What sizes do mooring chocks, chain stoppers and cable lifters come in?", a: "ISO 13729 bulwark chocks run from 250 × 200 × 214 to 500 × 400 × 525B, and cable lifters take 1/2\" (12.5 mm) to 3\" (76 mm) chain. The OCIMF bow chain stopper suits 76 to 78 mm chain. The size table on this page lists each item." },
    ],
  },
  {
    slug: "tpu-lay-flat-hoses",
    existingSha256: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
    faqs: [
      { q: "What is a TPU lay flat hose?", a: "A lay flat hose collapses flat when empty. In TPU hose the tube, jacket and cover are extruded through a circular-woven polyester jacket in one pass, so they cannot separate. It carries the highest pressures in the lay flat range and runs to 400 m per length." },
      { q: "What are TPU lay flat hoses used for?", a: "Applications include dewatering and water transfer, well riser, oil and fuel transfer, concrete placement, compressed air, drinking water and slurry drag. Choose the hose by the service it will do. Send your application for a quote from Dubai." },
      { q: "What sizes and temperature range do TPU lay flat hoses cover?", a: "Sizes depend on the type, for example fuel transfer from 2\" to 12\", well riser from 1-1/4\" to 12\" and discharge from 1-1/2\" to 16\". The listed temperature range is -50 °C to +80 °C. The size table on this page shows each listing." },
    ],
  },
  {
    slug: "turnbuckles-rigging-screws",
    existingSha256: 'aaf000561f3e0be019a7fc510c41a61e85ac98dd82400a7a97041a00b8b574fd',
    faqs: [
      { q: "What is a rigging screw?", a: "Rigging screws and turnbuckles are adjustable fittings, supplied here as drop-forged US turnbuckles, DIN 1478 and DIN 1480 types, JIS and Italian-pattern turnbuckles, commercial turnbuckles and jaw-and-jaw rigging screws. They come in steel and stainless, and WLL is listed per size." },
      { q: "What sizes do turnbuckles come in?", a: "For example, the DIN 1478 turnbuckle is listed at 75 to 16,500 kg, the Italian type from M5 to M52 (50 to 19,800 kg) and the stainless rigging screw from M4 to M36. Drop-forged turnbuckles run from 1/4\" × 4\" to 2-3/4\" × 24\". The size table on this page lists them." },
      { q: "What end types do turnbuckles have?", a: "Listings include eye and eye, hook and eye, eye and hook, jaw and jaw, and swage and fork ends, depending on the turnbuckle or rigging screw type. Send your end type, size and load for a quote from Dubai." },
    ],
  },
  {
    slug: "universal-air-couplings",
    existingSha256: 'e86991ced75dd59a75cb0a03406683d4e1752881add2cf56046fb73a0d743f1d',
    faqs: [
      { q: "What are universal air hose couplings?", a: "They are also called Chicago or claw couplings, and join compressed air hoses with a two- or four-lug lock. Indus supplies them from Dubai across the UAE. Send the lug pattern and hose size for a quote." },
      { q: "What types of universal air coupling are available?", a: "Listings cover American, European and Australian patterns, with safety whip check cables and gaskets. Examples include Hansen universal quick coupler bodies and Aeroquip universals. Send the lug pattern and hose size for a quote." },
    ],
  },
  {
    slug: "water-suction-delivery-hoses",
    existingSha256: '8c2f134e78bfea0d3b2d666c5f79a2a4a7ff586b8782088cf81d8cede3ad8b6a',
    faqs: [
      { q: "What types of water suction and delivery hose are there?", a: "The range is helical wire-reinforced hose for water transfer, dewatering, irrigation and tanker service. It includes A210, A216, DELVAC and IRRIBULK PVC variants, plus clear PVC discharge hose with a rigid white PVC helix from 3/4\" to 8\"." },
      { q: "What are water suction and delivery hoses used for?", a: "They are used for water transfer, dewatering, irrigation and tanker service, at 10 to 16 bar working pressure. The range includes A210, A216, DELVAC and IRRIBULK PVC variants. Indus supplies them from Dubai, UAE." },
    ],
  },
  {
    slug: "well-control-hoses",
    existingSha256: '4e368a73fb89f5a22ed271fade3547458fa408b8d2b12da726874488770a7cbe',
    faqs: [
      { q: "What types of well control hose are there?", a: "The range covers API 16C choke and kill assemblies rated 10000 psi WP and flexible choke and kill lines with PA or Tauroflon liners. It also includes subsea LMRP hoses to API 17J and fire-resistant BOP control hoses to API 16D. Supplied from Dubai to the UAE and GCC." },
      { q: "What are well control hoses used for?", a: "They carry choke and kill and BOP control duties on drilling rigs. Indus supplies them from Dubai to the UAE and GCC, including API 16C choke and kill assemblies and fire-resistant BOP control hoses. Send your assembly details for a quote." },
    ],
  },
  {
    slug: "well-service-hoses",
    existingSha256: '0f61a39bbb0386474f01d1f736981f5930dba82e5b1c400ab3ca8b7bf9a7cf8c',
    faqs: [
      { q: "What pressures are well service hoses rated for?", a: "Listed working pressures run from 5000 psi for well-test flare line hose (2\" to 6\") to 15000 psi for frac hose (3\" to 5\") and for acidizing and stimulation hose (2\" to 3\"). Another listing is 10000 psi working pressure with 15000 psi minimum burst pressure, 2\" to 4\". The working pressure of each hose is on the listing." },
      { q: "Which API and NACE references apply to well service hoses?", a: "The listings reference API Spec 7K, API 16C and API 17J, and NACE MR-0175 for acidizing and sour-service hoses. The reference is stated against each hose, so check the listing for the one you need. Indus supplies them from Dubai, UAE." },
    ],
  },
  {
    slug: "wire-rope-clips",
    existingSha256: '2c51726712fd5d277e36c338c6d56e3dc4e39eb22e535ed448c725bdcb9cac3f',
    faqs: [
      { q: "What types of wire rope clip are there?", a: "The range covers drop-forged and malleable clips in US type, fist grip, DIN 1142 and DIN 741 patterns, plus Type A and a stainless Simplex clip. Finishes are galvanized, zinc-plated, yellow chromated and stainless." },
      { q: "What sizes do wire rope clips come in?", a: "DIN 741 clips (malleable zinc-plated and stainless) run from 3 mm to 40 mm, US-type malleable clips from 1/16\" to 1-1/8\", and Type A yellow chromated clips from 6 mm to 32 mm. The stainless Simplex clip is M4 to M8. The size table on this page lists each one." },
    ],
  },
  {
    slug: "wire-rope-ferrules-sleeves",
    existingSha256: '2c51726712fd5d277e36c338c6d56e3dc4e39eb22e535ed448c725bdcb9cac3f',
    faqs: [
      { q: "What are the types of wire rope ferrules and sleeves?", a: "The range covers aluminium ferrules to EN 13411-3 (DIN 3093) and JIS, Form C tapered ferrules, and oval and hourglass sleeves. Stop buttons come in aluminium, copper and steel, and S-505 Flemish eye sleeves are also listed." },
      { q: "What sizes do wire rope ferrules come in?", a: "Aluminium ferrules to EN 13411-3 / DIN 3093 are listed from 1 mm to 60 mm, Form C tapered from 8 mm to 52 mm, and JIS type from 6 mm to 32 mm. Copper ferrules run from 1 mm to 18 mm. The size table on this page lists each one." },
      { q: "How are wire rope ferrules and sleeves used?", a: "Wire rope ferrules are pressed sleeves that close a rope end into a loop or fix a stop on the rope. Choose the ferrule by standard, rope size and material from the listings. Send your rope size and fitting for a quote from Dubai, UAE." },
    ],
  },
  {
    slug: "wire-rope-fittings",
    existingSha256: '3f71f2297742d3cba43d7094cd6b37fb8f47e86009f50a1ada5423576c14d36e',
    faqs: [
      { q: "What types of wire rope fitting are there?", a: "Wire rope fittings are the clips, thimbles, ferrules, sleeves, sockets and terminals that form and protect an eye or end on steel wire rope. The range includes DIN 741, DIN 1142, US and JIS clips, EN 13411-3 aluminium and stainless ferrules, BS 464, DIN 6899 and US-pattern thimbles and G-416 pattern spelter sockets." },
      { q: "What sizes of wire rope thimble are available?", a: "DIN 3091 solid thimbles run from 8 to 80 mm, BS 464 from 1/4\" to 2\", DIN 6899 A from 2.5 to 16 mm and DIN 6899 B from 2.5 to 32 mm. Stainless extra heavy thimbles run from 3/16\" to 1\". The size table on this page lists each one." },
    ],
  },
  {
    slug: "wire-rope-slings",
    existingSha256: '41d25473de23d25fcec1d7406f8359ab68867d648f46a26d4b7db3166a09ac7d',
    faqs: [
      { q: "What types of wire rope sling are available?", a: "The range covers single-leg slings with end fittings (6 to 70 mm, EN 13414), two-leg and four-leg slings, endless slings (10 to 240 mm), Flemish eye slings, and swaged (ferrule-secured) and hand-spliced soft eye slings. Each type has its own listing and size table on this page." },
      { q: "What is the wire rope sling capacity range and where is the size chart?", a: "The size table on this page lists each sling. Swaged soft eye slings are listed from 0.25 to 116.7 t WLL, hand-spliced soft eye slings from 0.24 to 81.7 t WLL and Flemish eye slings from 1.2 to 123 t WLL. Soft eye slings cover rope diameters from 5 mm to 110 mm." },
    ],
  },
  {
    slug: "wire-rope-sockets-terminals",
    existingSha256: 'e93b698f288e4ff7b0194cc53c2ba0cf578f12ea0aa2b90f2bbfdacaf5ebe3af',
    faqs: [
      { q: "What types of wire rope end fittings are there?", a: "The range covers open and closed spelter sockets and stainless swage and swageless terminals in eye, jaw, fork, stud and toggle forms. They suit wire rope, balustrade cable and standing rigging. Send the rope diameter for a quote." },
      { q: "What rope sizes do the stainless wire rope terminals fit?", a: "The swageless fork terminals fit 3 mm to 16 mm, and the European-type swage toggle terminals fit 3 mm to 10 mm. US-type thin-wall swage toggle terminals cover 1/8\" to 1/4\". They are polished type 316 stainless steel, with some in type 304." },
    ],
  },
  {
    slug: "wire-rope-thimbles",
    existingSha256: '7613afc7507f83f4d58b6862fb2e835ec5963fc811a597b3afa464979acb5c15',
    faqs: [
      { q: "How does a wire rope thimble work?", a: "A wire rope thimble is a grooved steel insert fitted inside a rope eye. It keeps the eye's shape and stops wear where the rope meets a shackle, hook or pin." },
      { q: "What sizes do wire rope thimbles come in?", a: "BS 464 thimbles are listed from 1/4″ to 2″, DIN 6899 A from 2.5 to 16 mm and DIN 6899 B from 2.5 to 32 mm. Solid DIN 3091 thimbles run from 8 to 80 mm. The size table on this page lists each one." },
    ],
  },
]
