/**
 * Give every published blog article a hero photograph.
 *
 * All 30 published articles shipped with `heroId = null`. That is not only a
 * bare article page: `BlogPostCard` is shared by the index, the category hubs
 * and the author pages, so a missing hero leaves a grey placeholder in every
 * grid on the blog, and `/blog/[slug]`'s OG image falls back to the site
 * default — every share of every article looked identical.
 *
 * The images are original photographs commissioned per article, generated from
 * a brief written off that article's own argument, at 1536×1024. They carry no
 * text, no lay-line wording and no brand marks, so nothing in them can go stale
 * or contradict the copy. They are stored as JPEG rather than PNG: these are
 * photographs, not renders on white, and PNG cost 2.5 MB each against 430 KB
 * for visually identical JPEG.
 *
 * New bucket. `product-images` holds catalogue renders that the media library
 * and the product importers both reach into; mixing editorial photography in
 * with it makes "delete everything for this SKU" a more dangerous query than it
 * needs to be. `blog-images` is public, same as `product-images`.
 *
 * Guards:
 *   1. Only posts named in `HEROES` are touched, matched on slug.
 *   2. A post that already carries the hero for its slug (matched on
 *      `Media.originalFilename`) is skipped, so a re-run after a partial
 *      failure only finishes the rest.
 *   3. A post that already has some OTHER hero is left alone and reported —
 *      this script adds imagery, it does not overwrite an editor's choice.
 *   4. Upload failures are collected and reported rather than aborting the run.
 *
 * Usage:
 *   pnpm --filter @indus/db exec tsx src/scripts/attach-blog-hero-images.ts \
 *     --dir "/path/to/IndusBlogHeroesJpg" [--dry-run]
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const db = new PrismaClient()

const BUCKET = 'blog-images'
const WEB_ENV = resolve(__dirname, '../../../../apps/web/.env.local')

/**
 * One row per published article, across all three hero sprints — the 30 from
 * PR #271, the 63 commissioned on 2026-08-25 and the 139 generated on 2026-10-08. `alt` describes what is
 * actually in the frame: it is read aloud by a screen reader and indexed as
 * image text, so it is not the article title repeated.
 *
 * Re-running this against a folder holding both sprints' JPEGs is safe and is
 * how the second sprint was attached. Guard 2 skips a post that already
 * carries the hero named for its slug, so the first 30 are no-ops.
 */
const HEROES: readonly { slug: string; alt: string }[] = [
  {
    slug: 'identify-any-hydraulic-fitting',
    alt: 'Technician measuring an unmarked hydraulic fitting with a vernier caliper, a thread pitch gauge and assorted adaptors laid out on the bench beside it',
  },
  {
    slug: 'bspp-vs-bspt',
    alt: 'A parallel-thread fitting with a bonded seal beside a tapered-thread fitting wound with sealing tape, stood side by side in a bench vice',
  },
  {
    slug: 'jic-vs-orfs-vs-npt-vs-bsp',
    alt: 'Four hydraulic hose ends in a row showing a 37-degree cone seat, a flat face with O-ring, a tapered pipe thread and a parallel thread',
  },
  {
    slug: 'why-hydraulic-hoses-fail',
    alt: 'Six failed hydraulic hose sections laid out on a workshop bench showing abrasion, kinking, heat cracking, twist and a pulled-out ferrule',
  },
  {
    slug: 'hydraulic-hose-inspection',
    alt: 'A technician using a torch to inspect the hydraulic hose runs along an excavator boom in a dusty yard at the end of the day',
  },
  {
    slug: 'getting-a-hydraulic-hose-made',
    alt: 'A worn hose assembly being measured across a trade counter, with hose reels and bins of fittings racked on the wall behind',
  },
  {
    slug: 'hose-routing-bend-radius-twist',
    alt: 'A gloved hand easing a hydraulic hose out of a tight bend at a clamp block, beside a second hose routed in a wide sweep',
  },
  {
    slug: 'hydraulic-fluid-injection-injury',
    alt: 'A fine jet of fluid escaping a pinhole in a pressurised hydraulic hose, located safely with a piece of cardboard held well clear',
  },
  {
    slug: 'hose-whip-restraint-and-burst-protection',
    alt: 'Three protected hose lines side by side: a steel whip-check cable across a coupling, a woven burst sleeve, and a spiral abrasion guard',
  },
  {
    slug: 'hose-register-and-replacement-programme',
    alt: 'A maintenance planner recording hose details at a bench of stainless identification tags, with tagged assemblies on a rack behind',
  },
  {
    slug: 'bulk-hose-refit-and-tagging',
    alt: "An entire machine's worth of newly built hose assemblies laid out and tagged on a workshop table while more are crimped behind",
  },
  {
    slug: 'on-site-hydraulic-hose-service-uae',
    alt: 'A mobile hose service van open at a construction site, a technician carrying a freshly built assembly towards a stopped wheel loader',
  },
  {
    slug: 'hose-service-northern-emirates',
    alt: 'A service technician working on the hydraulic lines of a crusher at a dust-covered quarry plant in the Northern Emirates',
  },
  {
    slug: 'rig-site-hose-replacement-abu-dhabi',
    alt: 'Two technicians in flame-resistant coveralls checking a large-bore oilfield hose connection at a land rig in the Abu Dhabi desert',
  },
  {
    slug: 'api-7k-16c-16d-which-standard',
    alt: 'Three oilfield hose assemblies racked side by side in a rig yard — a rotary hose, a flanged armoured line and a slim control hose',
  },
  {
    slug: 'api-16c-choke-and-kill-lines',
    alt: 'An armoured flexible choke line with bolted steel flanges running out from a blowout preventer stack on a drilling rig',
  },
  {
    slug: 'bop-control-hose-fire-resistance',
    alt: 'A bundle of fire-resistant blowout preventer control hoses clamped down rig steel into a hydraulic control manifold of valves and gauges',
  },
  {
    slug: 'api-7k-rotary-vibrator-hose',
    alt: 'A rotary hose hanging in a catenary from the derrick, with a bolted safety clamp and steel safety cable fitted at the coupling',
  },
  {
    slug: 'braid-vs-spiral-hydraulic-hose',
    alt: 'Two hose sections cut back in steps, one showing two crossing wire braid layers and the other four spiral-wound wire layers',
  },
  {
    slug: 'hydraulic-hose-pressure-by-size',
    alt: 'Seven lengths of the same hydraulic hose grade fanned out in ascending bore, cut ends towards the camera, on a workshop bench',
  },
  {
    slug: 'compact-hose-1sc-2sc',
    alt: 'Two hoses of the same bore coiled side by side — standard braid making a wide loop, compact hose a visibly tighter one',
  },
  {
    slug: 'skiving-and-fitting-selection',
    alt: 'A hose end in a skiving machine with the rubber cover peeling away to expose bright steel braid, ferrule and fitting waiting beside it',
  },
  {
    slug: 'industrial-hose-is-not-hydraulic-hose',
    alt: 'A small-bore wire braid hydraulic hose lying beside a large composite suction hose with helix reinforcement and a stainless coupling',
  },
  {
    slug: 'chemical-transfer-hose-selection',
    alt: 'An operator in chemical protective clothing connecting a composite transfer hose to a road tanker manifold on a bunded loading area',
  },
  {
    slug: 'steam-hose-safety',
    alt: 'A steam line connection made with a bolted coupling, faint steam around the lagged pipework and an operator standing clear at the valve',
  },
  {
    slug: 'food-grade-hose-compliance',
    alt: 'An operator in a hairnet and nitrile gloves connecting a food-grade hose with stainless tri-clamp ends to a filling machine',
  },
  {
    slug: 'water-suction-and-dewatering-hose',
    alt: 'A dewatering pump on a construction site with a helix-reinforced suction hose running down into a muddy sump at first light',
  },
  {
    slug: 'excavator-hydraulic-hose-replacement',
    alt: 'A technician kneeling on an excavator track replacing a burst boom hose, oil streaked down the paintwork and a drip tray alongside',
  },
  {
    slug: 'forklift-hydraulic-hose-replacement',
    alt: 'A technician replacing a forklift mast hose with the carriage held on a safety chain, warehouse racking receding behind',
  },
  {
    slug: 'tipper-and-transit-mixer-hose',
    alt: 'A technician working on the hydraulic hose where it crosses from chassis to body on a raised tipper, safety prop fitted, mixer parked behind',
  },
  // ── Second sprint, 2026-08-25. The 63 articles published after PR #271.
  { slug: 'cross-threaded-hydraulic-port', alt: 'A gloved hand backing a steel adapter out of a hydraulic valve manifold, the adapter sitting visibly askew in the port, a second adapter with bruised threads held up beside it' },
  { slug: 'hose-burst-at-the-fitting', alt: 'A failed hydraulic hose split open where it enters its crimped steel ferrule, frayed reinforcement wire fanned out at the break' },
  { slug: 'hose-failure-post-mortem', alt: 'Five cut sections of failed hydraulic hose laid in a row on a workbench beside a steel rule and calipers, each showing a different kind of damage' },
  { slug: 'hydraulic-hose-abrasion-failure', alt: 'A hydraulic hose worn through its cover against a sharp steel edge on a machine frame, silver reinforcement braid showing at the flat' },
  { slug: 'hydraulic-hose-cover-blistering', alt: 'Macro of raised blisters swelling out of a black hydraulic hose cover, one with a pinhole at its crown' },
  { slug: 'hydraulic-hose-cover-cracking', alt: 'A sun-aged hydraulic hose cover crazed with a fine network of cracks, the black surface gone chalky grey' },
  { slug: 'hydraulic-hose-crimp-faults', alt: 'Two crimped hose ends side by side on a steel bench with a vernier caliper set across the flats of one ferrule' },
  { slug: 'hydraulic-hose-installed-with-a-twist', alt: 'A hydraulic hose fitted between two machine ports with its printed line corkscrewing around the cover instead of running straight' },
  { slug: 'hydraulic-hose-kinked', alt: 'A hydraulic hose buckled into a sharp kink immediately where it leaves a straight fitting on a cylinder' },
  { slug: 'hydraulic-hose-tube-swelling', alt: 'A cut length of hydraulic hose held to camera, its inner tube swollen soft and glossy and closing down the bore' },
  { slug: 'hydraulic-hose-wire-corrosion', alt: 'The cut end of a hydraulic hose with a sound outer cover but rust-orange, pitted reinforcement wire inside' },
  { slug: 'new-hydraulic-hose-weeping', alt: 'A technician wiping a freshly fitted hydraulic hose joint dry with a rag, a bead of oil forming at the union nut' },
  { slug: 'split-female-quick-coupler', alt: 'The female half of a hydraulic quick coupler on a bench with a clean lengthwise crack through the body at the locking ball groove' },
  { slug: 'bspp-bonded-seal-sizing', alt: 'Gloved fingers sliding a bonded seal down the parallel male thread of a steel adapter, a tray of assorted bonded seals behind' },
  { slug: 'hydraulic-thread-size-and-pitch-reference', alt: 'A bench identification station with thread pitch gauges fanned open, a vernier caliper and an array of steel hydraulic fittings' },
  { slug: 'photographing-a-hydraulic-fitting', alt: 'A technician photographing a hydraulic fitting with a phone, the fitting standing square-on beside a steel rule under a work lamp' },
  { slug: 'stacking-hydraulic-adapters', alt: 'Three steel adapters threaded end to end out of one port on a hydraulic valve block, a hose hanging from the last at an angle' },
  { slug: 'desalination-and-water-treatment-hose', alt: 'A flexible hose flanged to a manifold inside a desalination plant, rows of white pressure vessels and stainless pipework behind' },
  { slug: 'hydraulic-hose-coastal-corrosion', alt: 'Hydraulic hose fittings at a coastal port pitted with white salt bloom and rust creeping out from under the ferrule' },
  { slug: 'hydraulic-hose-in-uae-heat', alt: 'An excavator boom cylinder and its hydraulic hoses in an open desert yard at midday, heat shimmer distorting the air above the machine' },
  { slug: 'hydraulic-hose-sand-abrasion', alt: 'Hydraulic hoses on a machine arm coated in fine desert sand, one showing a scoured sand-blasted patch' },
  { slug: 'hydraulic-hose-shelf-life-storage', alt: 'Coiled hydraulic hose assemblies hung and stacked on a warehouse stores rack, some coils bright and new, others visibly dusty' },
  { slug: 'hydraulic-hose-uv-and-ozone', alt: 'A sun-bleached hydraulic hose gone chalky grey and finely crazed fitted beside a newer black hose on the same machine' },
  { slug: 'offshore-hydraulic-hose', alt: 'A technician in helmet and lifejacket checking hydraulic hose connections on offshore deck machinery, open grey water beyond the handrail' },
  { slug: 'why-summer-is-harder-on-hydraulic-hose', alt: 'Hydraulic hose assemblies coiled on hot concrete in a machinery yard at the peak of a Gulf summer afternoon' },
  { slug: 'field-re-hosing-kit', alt: 'The open side doors of a mobile hose service van on site, showing bulk hose reels, fitting drawers, a bolted-down crimper and finished assemblies on a rail' },
  { slug: 'how-to-measure-a-hydraulic-hose', alt: 'A hydraulic hose lying straight on a bench with a steel tape stretched from one sealing face to the other' },
  { slug: 'hydraulic-fitting-make-up-torque', alt: 'Two spanners working one hydraulic joint in opposition, one holding the adapter body while the other turns the union nut' },
  { slug: 'hydraulic-quick-couplers-iso-7241', alt: 'Hydraulic quick coupler halves arranged on a steel bench, showing flush flat faces, recessed poppets and a threaded collar side by side' },
  { slug: 'backhoe-hydraulic-hose', alt: 'A backhoe loader on site with hose runs visible along both the front loader arms and the rear excavator boom, a technician crouched at the boom pivot' },
  { slug: 'boom-lift-hydraulic-hose', alt: 'Bundled hydraulic hoses strapped along the raised boom of a self-propelled access platform, seen from below against the sky' },
  { slug: 'concrete-pump-hydraulic-hose', alt: 'The base of a deployed concrete placing boom, dense with high-pressure hydraulic lines and steel pipework under concrete dust' },
  { slug: 'detaching-a-hose-on-a-modern-machine', alt: 'A technician reaching into an opened access compartment on an excavator where hoses run through moulded clamp blocks, removed fasteners laid out on a rag' },
  { slug: 'injection-moulding-hydraulic-hose', alt: 'Hydraulic hoses and steel lines running close past the hot heater bands of a plastic injection moulding machine' },
  { slug: 'log-splitter-and-shop-press-hose', alt: 'A hydraulic workshop press with its ram partway onto a steel workpiece, pump unit, pressure gauge and two hoses in frame' },
  { slug: 'mobile-crane-hydraulic-hose', alt: 'Hydraulic hoses feeding an outrigger leg on an all-terrain mobile crane set up on site' },
  { slug: 'port-equipment-hydraulic-hose', alt: 'A reach stacker working in a container terminal, hydraulic hose runs along the lifting boom, stacked containers and a gantry crane behind' },
  { slug: 'refuse-truck-hydraulic-hose', alt: 'The raised tailgate of a refuse collection truck exposing grimy compaction cylinders, hoses and a hydraulic manifold' },
  { slug: 'removing-a-seized-hydraulic-fitting', alt: 'A technician working two spanners on a corroded hydraulic fitting in a machine manifold, the hex visibly rounding, penetrating fluid to hand' },
  { slug: 'skid-steer-hydraulic-hose', alt: 'The auxiliary quick couplers on a skid steer loader arm with dust caps hanging beside them, a gloved hand wiping a coupler face clean' },
  { slug: 'tractor-hydraulic-hose', alt: 'The rear remote coupler bank of an agricultural tractor, oil-darkened and mismatched, with two implement hoses plugged in and one hanging loose' },
  { slug: 'truck-crane-hydraulic-hose', alt: 'Hydraulic hoses tracking around the articulated joints of a knuckle-boom crane mounted behind a flatbed truck cab' },
  { slug: 'wheel-loader-hydraulic-hose', alt: 'A technician checking the hoses running down a wheel loader lift arm to its lift cylinder, quarry stockpiles behind' },
  { slug: 'contamination-during-a-hose-change', alt: 'Open hydraulic ports on a machine capped with coloured plastic plugs, the removed hose assembly capped at both ends in a clean drain tray' },
  { slug: 'grease-and-zerk-fittings', alt: 'A grease gun coupler pushed onto a small grease nipple on a machine pivot pin, fresh grease just emerging from the joint' },
  { slug: 'mini-excavator-hose-maintenance', alt: 'A technician crouched at the boom-to-arm crossing of a mini excavator, lifting a hose to inspect underneath it' },
  { slug: 'bulk-hose-or-finished-assemblies', alt: 'A warehouse aisle with reels of bulk hydraulic hose racked on one side and finished tagged hose assemblies hanging on the other' },
  { slug: 'how-to-cross-reference-a-hydraulic-hose', alt: 'A staff member at a trade counter comparing a customer’s oil-stained hose assembly against a new one, calipers to hand' },
  { slug: 'hydraulic-hose-assembly-cost', alt: 'An assembly bench from above with a cut hose length, two fittings, two ferrules and a set of crimp dies laid out ready to build' },
  { slug: 'hydraulic-hose-kits-for-a-fleet', alt: 'An open transport case packed with coiled and tagged hydraulic hose assemblies in divided compartments, a gloved hand lifting one out' },
  { slug: 'hydraulic-hose-lead-times', alt: 'A distribution warehouse aisle of pallet racking stacked with hose reels, boxed fittings and shrink-wrapped export pallets' },
  { slug: 'hydraulic-hose-stocking-policy', alt: 'A wall of small parts bins in a stores area densely filled with steel hydraulic fittings sorted by type' },
  { slug: 'should-you-buy-a-hose-crimper', alt: 'A hydraulic hose crimping machine on a bench with its full set of die rings laid out in an arc from largest to smallest' },
  { slug: 'unbranded-hydraulic-fittings', alt: 'Two trays of similar steel hydraulic fittings side by side, one set carrying faint forged markings on the hex flats and the other completely bare' },
  { slug: 'what-to-send-for-a-hose-quote', alt: 'A customer handing a failed hydraulic hose assembly across a trade counter, a phone showing photographs on the counter beside them' },
  { slug: 'trapped-pressure-quick-coupler', alt: 'A hydraulic breaker attachment lying on hot concrete in full sun, its capped coupler halves in the foreground and an operator crouched beside them' },
  { slug: 'en-853-856-857-vs-sae-100r', alt: 'Four hydraulic hose sections stood on end showing different internal constructions in cut face, from single wire braid to multiple spiral layers' },
  { slug: 'how-to-read-a-hose-layline', alt: 'Raking light along the cover of a hydraulic hose, the printed lay-line catching as a raised pale ribbon running away into soft focus' },
  { slug: 'hydraulic-hose-dash-sizes', alt: 'Seven cut hydraulic hose lengths stood on end in a line from smallest bore to largest, every open bore visible' },
  { slug: 'sae-100r-hose-types', alt: 'Hydraulic hose samples fanned out on a bench, each cut back in steps to expose tube, reinforcement and cover' },
  { slug: 'sae-j518-code-61-code-62-flanges', alt: 'Two four-bolt split flange heads of the same bore side by side, one visibly thicker with wider bolt spacing, a steel rule across both' },
  { slug: 'stopping-an-npt-thread-leak', alt: 'Gloved hands applying anaerobic thread sealant to the tapered male thread of a steel hydraulic fitting, a roll of PTFE tape set aside' },
  { slug: 'where-jic-is-the-wrong-choice', alt: 'Two hydraulic fittings upright side by side, one presenting a machined 37 degree cone and the other a flat face with a seated O-ring' },
  // ── Third sprint, 2026-10-08. The 139 articles published without a hero
  // after the second sprint: the 1 Sep batch, the lifting waves and the October
  // waves. Generated with GPT Image 2.5 (one with Nano Banana 2.1) and checked
  // against each article before upload.
  { slug: "hydraulic-hose-assembly-guide", alt: "A technician feeding a hydraulic hose and fitting into a crimping machine, finished hose assemblies hanging on a rack behind" },
  { slug: "braided-vs-spiral-hose-fittings", alt: "Two hydraulic hose assemblies side by side, a thinner hose with a short crimped ferrule and a thicker hose with a longer, heavier ferrule" },
  { slug: "what-to-send-for-a-fittings-quote", alt: "A used hydraulic adapter on a desk beside a caliper and a phone photographing it for a quote request" },
  { slug: "cross-referencing-a-fitting-part-number", alt: "Hands holding a worn hydraulic fitting next to a new replacement of the same shape over an open parts catalogue" },
  { slug: "adapter-kit-for-a-mixed-fleet", alt: "An open compartment case of sorted hydraulic adapters on a workshop bench, mixed machines parked in the yard beyond" },
  { slug: "spares-list-for-a-remote-site", alt: "A shipping container site store at a remote camp, shelves of hydraulic fittings, hoses and seal kits inside" },
  { slug: "inspecting-fittings-on-arrival", alt: "A gloved hand holding a hydraulic adapter up to check its thread beside an open carton of bagged fittings on a loading bay" },
  { slug: "plating-and-corrosion-on-fittings", alt: "A row of hydraulic fittings showing different platings, from bright zinc-nickel to white corrosion and red rust at the hex edges" },
  { slug: "when-stainless-is-worth-it", alt: "A stainless and a plated carbon steel hydraulic adapter side by side on a wet steel plate at a coastal quay" },
  { slug: "air-or-sea-for-a-fittings-order", alt: "A small parcel of hydraulic fittings on an air cargo pallet, a container ship visible through the terminal windows" },
  { slug: "consolidating-fittings-with-a-hose-order", alt: "A worker stretch-wrapping one pallet of hydraulic hose coils and cartons of fittings for a single consignment" },
  { slug: "substituting-a-fitting-safely", alt: "At night by a work lamp, a technician compares two similar hydraulic fittings beside a stopped excavator" },
  { slug: "ss316l-hydraulic-fittings", alt: "Passivated 316L stainless hydraulic fittings — adapters, elbows, tees, a banjo and an SAE flange — laid out on a bench" },
  { slug: "reading-a-weeping-joint", alt: "A gloved hand with a rag beside a hydraulic hose joint on a yellow machine, a drop of oil forming under the swivel nut" },
  { slug: "over-tightened-fitting-diagnosis", alt: "A disassembled hydraulic fitting with a crushed seat and a cracked swivel nut, a torque wrench beside it" },
  { slug: "why-fittings-seize-in-coastal-air", alt: "A hydraulic fitting joint crusted with rust and salt on a port machine, a spanner on the seized nut" },
  { slug: "damaged-port-repair-or-scrap", alt: "A hydraulic valve block with a damaged threaded port under a flashlight, a tap set beside it" },
  { slug: "sealant-on-hydraulic-threads", alt: "A taped tapered-thread fitting beside a cone-seat fitting with shredded PTFE tape caught on its seat" },
  { slug: "galvanic-corrosion-in-fittings", alt: "A bright stainless fitting in a plated steel port with corrosion forming only on the plated metal around it" },
  { slug: "dirt-ingress-in-transit-and-storage", alt: "An uncapped hydraulic adapter with grit in its bore beside a clean capped and bagged fitting on a warehouse shelf" },
  { slug: "copper-mine-hydraulic-fittings", alt: "A giant haul truck in an open-pit copper mine, its hoist cylinder hoses visible, the concentrator in the distance" },
  { slug: "gold-plant-hydraulic-fittings", alt: "Hydraulic lines on a slurry pump inside a gold processing plant, leach tanks behind" },
  { slug: "oilfield-fittings-in-west-africa", alt: "A tropical oilfield yard with flow equipment on one side and crates of plated hydraulic fittings on the other" },
  { slug: "agriculture-and-construction-fittings", alt: "A rural workshop yard with a tractor, backhoe loader and tipper, a mechanic sorting hydraulic fittings at the bench" },
  { slug: "quarry-and-crusher-fittings", alt: "Dust-coated hydraulic hoses and fittings clamped to a jaw crusher frame in a quarry" },
  { slug: "water-well-drilling-rig-fittings", alt: "A truck-mounted water well drilling rig on dry savanna, an open toolbox of hydraulic spares on the deck" },
  { slug: "port-and-terminal-fittings", alt: "A reach stacker working a container terminal at dusk, its hydraulic hoses in close focus" },
  { slug: "sugar-mill-and-agro-processing-fittings", alt: "A cane loader working beside piles of sugar cane at a sugar mill during harvest" },
  { slug: "buying-fittings-in-south-africa", alt: "A customer handing a used hose assembly over a hydraulics trade counter, shelves of hose and fittings behind" },
  { slug: "factory-and-fixed-plant-fittings", alt: "A hydraulic power unit with neat steel tubing and uniform fittings on a clean factory floor" },
  { slug: "saber-certificate-for-hydraulic-hose", alt: "A gloved hand on a shrink-wrapped coil of hydraulic hose on a pallet, a clipboard of certificates and a laptop beside it" },
  { slug: "gulf-conformity-mark-hose-fittings", alt: "A hose sample and fittings on a procurement desk beside a binder of compliance documents, a Gulf city skyline outside" },
  { slug: "certificate-of-origin-gcc-duty", alt: "A customs officer with a clipboard checking an open container of hydraulic hose in a Gulf port" },
  { slug: "hose-assembly-test-certificate", alt: "A hose assembly under proof test inside a steel safety cage, a technician watching the pressure gauge" },
  { slug: "material-test-certificate-en-10204", alt: "Forged fitting blanks and bar stock with a heat tag, a mill test certificate clipped beside them" },
  { slug: "nace-mr0175-hose-documentation", alt: "A heavy oilfield hose assembly with stainless end fittings on a rack, a document wallet tied to it" },
  { slug: "vendor-approval-for-hose-supply", alt: "A delivery truck stopped at a desert oil facility checkpoint, a guard checking papers" },
  { slug: "verifying-a-genuine-hydraulic-hose", alt: "A gloved hand holding a hydraulic hose behind its crimped fitting, the printed layline running along the cover" },
  { slug: "gcc-import-documents-for-hose", alt: "Freight trucks queued at a desert customs checkpoint, one carrying wrapped coils of hydraulic hose" },
  { slug: "oilfield-hose-document-pack", alt: "A rotary drilling hose coiled on a skid with a document wallet of certificates strapped to it, a rig behind" },
  { slug: "cam-and-groove-coupling-types", alt: "Cam and groove couplings on a bench: female couplers with cam arms, male adapters with threaded and hose-shank ends, one coupler on a suction hose" },
  { slug: "storz-coupling-sizes", alt: "Aluminium Storz couplings of several sizes on a fire station bench, one on a red fire hose" },
  { slug: "bauer-couplings-explained", alt: "A galvanised Bauer lever coupling joining two irrigation pipes on a farm field" },
  { slug: "guillemin-couplings-explained", alt: "Two symmetrical Guillemin couplings being joined by hand on an industrial water hose" },
  { slug: "gost-barcelona-and-geka-couplings", alt: "A GOST, a Barcelona and a Geka coupling side by side on a bench, three symmetrical patterns that fit only themselves" },
  { slug: "universal-air-couplings-explained", alt: "Two universal claw air couplings locked together with a safety whip check on a compressor hose" },
  { slug: "kc-nipples-and-shank-couplings", alt: "Galvanised KC nipples, a pin-lug shank coupling and a hose mender laid out on a bench, one clamped into a rubber hose" },
  { slug: "ground-joint-steam-couplings", alt: "A steam hose with a ground joint coupling and bolted clamp in a plant room, insulated steam pipework behind" },
  { slug: "en-14420-hose-fittings-explained", alt: "A stainless hose tail held in an industrial hose with a bolted two-piece safety clamp, other fitting ends nearby" },
  { slug: "industrial-hose-clamps", alt: "Industrial hose clamps on a bench: a safety clamp, an interlocking clamp, a spiral wire clamp and a sanitary clamp" },
  { slug: "flanged-hose-connections", alt: "A large-bore hose with a steel flanged end bolted to a pipe spool on a refinery rack" },
  { slug: "oil-suction-and-discharge-hose", alt: "A heavy oil suction and discharge hose connected to a pump skid at a tank farm" },
  { slug: "tanker-loading-and-vapour-recovery-hose", alt: "Liquid and vapour recovery hoses connected to a fuel tanker's bottom-loading valves at a gantry" },
  { slug: "compressed-air-hose-selection", alt: "A red air hose running from a towable compressor to a jackhammer on a construction site" },
  { slug: "uhmwpe-chemical-hose", alt: "A chemical transfer hose with a white UHMWPE lining visible at its end, coupled to a chemical tote" },
  { slug: "composite-hose-explained", alt: "A cut composite hose with an outer wire helix over a fabric cover and layers of film inside, a composite hose fitting beside it" },
  { slug: "pvc-or-rubber-suction-hose", alt: "A clear PVC suction hose and a black rubber suction hose side by side on a dewatering pump in strong sun" },
  { slug: "bulk-material-and-sandblast-hose", alt: "A sandblast hose and nozzle holder in the foreground as an operator blasts a steel structure" },
  { slug: "food-hose-materials-compared", alt: "Food-grade hoses of different materials with sanitary fittings on a stainless table in a dairy plant" },
  { slug: "industrial-hose-safety-factors", alt: "An industrial hose split open under burst test inside a protective chamber" },
  { slug: "reading-an-industrial-hose-layline", alt: "A fingertip on the printed layline running along a coiled black industrial hose on a warehouse shelf" },
  { slug: "corrugated-stainless-steel-hose", alt: "A stainless metal hose with its braid peeled back to show the corrugated core, a braided hose with a flange beside it" },
  { slug: "exotic-alloy-metal-hose", alt: "Corrugated metal hose sections in stainless, nickel alloy and bronze laid out with welded end fittings" },
  { slug: "high-pressure-metal-hose", alt: "A double-braided high-pressure metal hose with heavy forged end fittings installed on a test rig" },
  { slug: "ptfe-hose-explained", alt: "A smoothbore and a convoluted PTFE hose cut open on a bench, each with stainless braid and a crimped fitting" },
  { slug: "cryogenic-transfer-hose", alt: "A frosted stainless cryogenic hose connected to a liquid nitrogen tank, vapour rolling off it" },
  { slug: "industrial-hose-guide", alt: "Tall racks of industrial hose reels and coils in many colours in a hose warehouse" },
  { slug: "industrial-hose-couplings-guide", alt: "A grid of industrial hose couplings — cam and groove, Storz, claw, Bauer, ground joint, tails and flanges" },
  { slug: "metal-hose-guide", alt: "Braided stainless metal hoses installed on refinery pipework, one linking a pump to a pipeline" },
  { slug: "working-load-limit-vs-breaking-strength", alt: "A chain sling stretched in a horizontal tensile test bed in a lifting gear workshop" },
  { slug: "types-of-shackles", alt: "Four galvanised shackles in a row on a workbench: bow and D shapes, screw-pin and bolt-type with nut and cotter pin, a wire rope sling behind" },
  { slug: "chain-grades-explained", alt: "Lengths of red, blue, gold and galvanised chain laid side by side on a workshop floor" },
  { slug: "wire-rope-construction-explained", alt: "Cut wire rope ends with strands fanned open, one with a steel strand core and one with a fibre core" },
  { slug: "sling-angle-chart", alt: "A crane lifting a steel beam on a two-leg chain sling, the legs spread at a wide angle" },
  { slug: "wire-rope-clips-installation", alt: "A wire rope eye around a thimble, the tail turned back and held to the main rope by three U-bolt clips, a ring spanner on one nut" },
  { slug: "lifting-equipment-inspection-uae", alt: "An inspector measuring a chain sling hook with a caliper in a lifting gear store" },
  { slug: "eye-bolt-types-and-angled-loads", alt: "A plain, a shoulder and a collar eye bolt in a steel block, a sling pulling on one at an angle" },
  { slug: "turnbuckle-types", alt: "Galvanised turnbuckles with hook, eye and jaw ends, open and closed bodies, laid side by side" },
  { slug: "sling-colour-code-chart", alt: "Polyester slings hanging on a rack in violet, green, yellow, grey, red, brown, blue and orange" },
  { slug: "types-of-lifting-slings", alt: "A chain sling, a wire rope sling, a webbing sling and a round sling laid out in a row on a yard floor" },
  { slug: "snatch-block-vs-pulley-block", alt: "A snatch block with its side plate open beside a closed pulley block on a timber deck" },
  { slug: "chain-block-vs-lever-hoist-vs-electric-hoist", alt: "A chain block, a lever hoist and an electric chain hoist hanging side by side from a workshop gantry" },
  { slug: "master-links-explained", alt: "A master link assembly with sub-links gathering chain sling legs on a steel deck, a crane hook behind" },
  { slug: "lifting-hook-types", alt: "Forged lifting hooks on a bench — eye, clevis and swivel hooks with latches, and a grab hook gripping a chain link" },
  { slug: "pad-eye-vs-swivel-lifting-point", alt: "A weld-on pad eye, a bolt-on swivel lifting point and an eye bolt fitted to a steel fabrication" },
  { slug: "wire-rope-thimble-types", alt: "A standard, an extra-heavy and a solid thimble laid out, one fitted in a wire rope eye" },
  { slug: "wire-rope-eye-terminations", alt: "A ferrule-secured eye, a Flemish eye and a hand-spliced eye in wire rope side by side" },
  { slug: "spelter-sockets-open-vs-closed", alt: "An open and a closed spelter socket fitted to thick wire ropes on a timber deck" },
  { slug: "stainless-vs-galvanized-rigging-gulf", alt: "Stainless and corroding galvanised shackles and turnbuckles on a Gulf marina pontoon" },
  { slug: "ratchet-strap-vs-chain-and-binder", alt: "A load on a flatbed secured with a ratchet strap on one side and a chain and binder on the other" },
  { slug: "lever-vs-ratchet-load-binder", alt: "A lever binder and a ratchet binder tensioning chains on a flatbed trailer" },
  { slug: "din-link-chain-standards", alt: "Galvanised short-link and long-link chains hanging in a chain store, a bucket elevator conveyor behind" },
  { slug: "lifting-gear-rejection-criteria", alt: "A quarantine bin of rejected lifting gear: a kinked wire sling, an opened hook, worn chain and a cut webbing sling" },
  { slug: "lifting-gear-test-certificate", alt: "A new shackle and chain sling on a desk beside a printed test certificate" },
  { slug: "crosby-pattern-numbers-explained", alt: "Shackles, a swivel hook, a wire rope clip and a master link laid out on a timber bench" },
  { slug: "precast-concrete-lifting-clutch", alt: "A ring clutch locked onto a cast-in anchor at the top of a precast concrete panel being lifted" },
  { slug: "types-of-marine-fenders", alt: "Black rubber cone and cylindrical fenders lining a port quay beside a ship's hull" },
  { slug: "types-of-marine-anchors", alt: "A black stockless anchor with hinged flukes, a Danforth anchor and a claw anchor on gravel in a marine yard, anchor chain behind" },
  { slug: "anchor-chain-grades-u1-u2-u3", alt: "Heavy stud link anchor chain on a ship's foredeck, each link with a stud across its middle, the windlass behind" },
  { slug: "types-of-mooring-bollards", alt: "Mooring ropes on a T-head bollard and double bitts on a quay beside a moored ship" },
  { slug: "fibre-rope-materials-compared", alt: "Coils of polypropylene, nylon, polyester and HMPE fibre rope side by side on a dock" },
  { slug: "snap-hooks-and-quick-links", alt: "Snap hooks and screw-gate quick links laid on a wooden bench, a short chain on one link" },
  { slug: "chain-sling-codes-explained", alt: "Single-leg, two-leg and four-leg chain slings hanging from master links on a rack" },
  { slug: "vertical-vs-horizontal-plate-lifting-clamps", alt: "A vertical plate clamp lifting a plate upright, a pair of horizontal clamps on a flat plate nearby" },
  { slug: "storing-fittings-and-seals-on-site", alt: "Steel shelves of bins with hydraulic fittings and bagged seal kits in a workshop store" },
  { slug: "reusing-fittings-in-a-rebuild", alt: "A tray of rebuild parts under a bench lamp, good fittings sorted from damaged ones" },
  { slug: "crimping-on-site-or-adapting", alt: "A technician using a portable crimper on a van tailgate beside a broken-down wheel loader" },
  { slug: "molykote-lubricant-types-explained", alt: "Unbranded lubricant containers — grease, paste, aerosol, oil and dispersion — beside a bearing and gear" },
  { slug: "anti-seize-and-assembly-pastes", alt: "A brush applying copper anti-seize paste to a large bolt thread, open tins beside it" },
  { slug: "anti-friction-coatings-explained", alt: "A technician spraying a dry-film coating onto machine parts in a spray booth, a curing oven beside it" },
  { slug: "grease-selection-base-oil-thickener-nlgi", alt: "Grease samples of varying consistency and colour spread on a white tile with a spatula and grease gun" },
  { slug: "hammer-union-figure-numbers", alt: "A red three-lug hammer union joining two pup joints on timber dunnage at a desert well site, a pump unit behind" },
  { slug: "ring-joint-gaskets-r-rx-bx", alt: "Three metal ring joint gaskets on a bench with oval, octagonal and BX profiles, beside a flange face with a ring groove" },
  { slug: "flow-iron-explained", alt: "A treating line of pup joints, swivels and tees joined by hammer unions running to a wellhead" },
  { slug: "api-6a-nameplate-markings", alt: "A riveted nameplate on a wellhead gate valve" },
  { slug: "wellhead-components-explained", alt: "A wellhead and christmas tree with master and wing valves in a desert oilfield" },
  { slug: "mud-gate-valve-repair-kits", alt: "A disassembled mud gate valve with gate, seats and seals laid out beside the body" },
  { slug: "lubricated-vs-non-lubricated-plug-valves", alt: "Two plug valves with quarter-turn handles on a treating line skid" },
  { slug: "oilfield-check-valves-explained", alt: "Cutaway dart and swing check valves with a drill pipe float valve on a bench" },
  { slug: "positive-vs-adjustable-chokes", alt: "A choke manifold with positive and adjustable chokes and gauges on a well test site" },
  { slug: "ram-vs-annular-bop", alt: "A BOP stack under a rig floor, the annular preventer above the ram preventers" },
  { slug: "demco-butterfly-valve-part-numbers", alt: "Lug butterfly valves with hand levers on a pallet, one disc open to show the seat" },
  { slug: "ball-valve-pressure-ratings-cwp-wog", alt: "A small threaded brass ball valve beside three larger steel ball valves with flanged and threaded ends on a workshop bench" },
  { slug: "oilfield-hose-guide", alt: "A rotary drilling hose looping from the standpipe to the top drive on a land rig" },
  { slug: "well-service-and-stimulation-hose", alt: "High-pressure hoses connecting frac pump trucks to a manifold trailer at a well pad" },
  { slug: "riser-tensioner-and-compensator-hose", alt: "Riser tensioner cylinders with looping hydraulic hoses around a floating rig's moonpool" },
  { slug: "hydraulic-hose-guide", alt: "Cut hydraulic hose samples standing on a bench — braid, spiral, compact, thermoplastic and PTFE" },
  { slug: "fittings-on-a-chinese-excavator", alt: "A technician loosening a cone hydraulic fitting at an excavator's open valve bank" },
  { slug: "fittings-on-a-used-japanese-machine", alt: "A gloved hand on a hose fitting at a used excavator's main valve" },
  { slug: "tractor-hydraulic-fittings", alt: "Hydraulic quick couplers and hoses at the rear of a tractor connected to an implement" },
  { slug: "fittings-on-american-machines", alt: "Hose fittings and a split flange at the articulation joint of a large wheel loader" },
  { slug: "fittings-on-european-machines", alt: "Metric compression fittings on rigid steel tubes at a compact loader's valve" },
  { slug: "korean-excavator-hydraulic-fittings", alt: "Hoses and fittings at an excavator's boom cylinder on a construction site" },
  { slug: "bsp-or-metric-fittings", alt: "A BSP and a metric hydraulic adapter side by side with a thread pitch gauge across them" },
  { slug: "measuring-a-fitting-without-gauges", alt: "A mechanic measuring a fitting's thread with a caliper beside a known bolt on a tailgate" },
  { slug: "building-a-thread-reference-board", alt: "A technician comparing a fitting to a wall board of mounted sample hydraulic fittings" },
  { slug: "bridging-two-thread-standards", alt: "One adapter joining two thread standards, a discarded stack of three adapters on the bench beside it" },
  { slug: "hydraulic-fittings-guide", alt: "A flat-lay of many hydraulic fittings and adapters across thread families" },
  { slug: "npt-npsm-and-sae-hose-fittings", alt: "NPT, NPSM swivel, 37-degree flare and O-ring boss hose fittings side by side on a bench" },
] as const

/**
 * Prisma reads `packages/db/.env` on its own, but the Supabase storage
 * credentials only live in the web app's env file. Load them here so the
 * script runs with a plain `pnpm --filter @indus/db exec tsx …` and no shell
 * setup. Anything already exported wins.
 */
function loadWebEnv() {
  if (!existsSync(WEB_ENV)) return
  for (const line of readFileSync(WEB_ENV, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (!m) continue
    const key = m[1]!
    if (process.env[key]) continue
    process.env[key] = m[2]!.trim().replace(/^["'](.*)["']$/, '$1')
  }
}

function supabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required')
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

/**
 * Reads width/height out of the JPEG frame header — avoids an image dependency,
 * same reasoning as `pngSize` in the hose render script. Walks the marker chain
 * to the first SOF segment; every SOFn but the reserved DHT/JPG/DAC markers
 * carries the dimensions in the same place.
 */
function jpegSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 4 || buf.readUInt16BE(0) !== 0xffd8) return null
  let off = 2
  while (off + 9 < buf.length) {
    if (buf[off] !== 0xff) return null
    const marker = buf[off + 1]!
    // Standalone markers carry no length field.
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      off += 2
      continue
    }
    const len = buf.readUInt16BE(off + 2)
    const isSof =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc
    if (isSof) return { height: buf.readUInt16BE(off + 5), width: buf.readUInt16BE(off + 7) }
    off += 2 + len
  }
  return null
}

async function main() {
  loadWebEnv()
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  // `pnpm exec` rewrites `--dir="x y"` into two argv entries, so accept both
  // `--dir=<path>` and `--dir <path>`.
  const eq = args.find((a) => a.startsWith('--dir='))?.slice('--dir='.length)
  const at = args.indexOf('--dir')
  const dirArg = eq ?? (at >= 0 ? args[at + 1] : undefined)
  if (!dirArg) throw new Error('--dir=<folder with the JPEG files> is required')
  const dir = resolve(dirArg)
  if (!existsSync(dir)) throw new Error(`Image folder not found: ${dir}`)

  const onDisk = new Set(readdirSync(dir))
  const sb = supabase()

  let attached = 0
  let alreadyPresent = 0
  const problems: string[] = []

  for (const hero of HEROES) {
    const file = `${hero.slug}.jpg`
    if (!onDisk.has(file)) {
      problems.push(`${hero.slug}: ${file} missing from ${dir}`)
      continue
    }

    const post = await db.blogPost.findFirst({
      where: { slug: hero.slug, deletedAt: null },
      select: {
        id: true,
        slug: true,
        title: true,
        heroId: true,
        hero: { select: { originalFilename: true } },
      },
    })
    if (!post) {
      problems.push(`${hero.slug}: no live blog post with that slug`)
      continue
    }

    if (post.hero?.originalFilename === file) {
      alreadyPresent++
      continue
    }
    if (post.heroId) {
      problems.push(
        `${hero.slug}: already has a different hero (${post.hero?.originalFilename ?? post.heroId}) — left alone`
      )
      continue
    }

    const buf = readFileSync(join(dir, file))
    const size = jpegSize(buf)
    const objectPath = `heroes/${hero.slug}.jpg`
    const publicUrl = sb.storage.from(BUCKET).getPublicUrl(objectPath).data.publicUrl

    if (dryRun) {
      console.log(`[dry-run] attach ${file} (${size?.width}×${size?.height}) -> ${post.title}`)
      attached++
      continue
    }

    const { error } = await sb.storage.from(BUCKET).upload(objectPath, buf, {
      cacheControl: '31536000',
      upsert: true,
      contentType: 'image/jpeg',
    })
    if (error) {
      problems.push(`${hero.slug}: upload failed — ${error.message}`)
      continue
    }

    // `DATABASE_URL` ships a small connection limit, so a single-connection run
    // can outrun the default 2s transaction acquire window.
    await db.$transaction(
      async (tx) => {
        const media = await tx.media.create({
          data: {
            kind: 'image',
            mimeType: 'image/jpeg',
            originalFilename: file,
            storagePath: publicUrl,
            bytes: buf.byteLength,
            width: size?.width ?? null,
            height: size?.height ?? null,
            alt: hero.alt,
          },
          select: { id: true },
        })
        await tx.blogPost.update({ where: { id: post.id }, data: { heroId: media.id } })
      },
      { maxWait: 15_000, timeout: 30_000 }
    )

    attached++
    console.log(`attached ${file} -> ${post.title}`)
  }

  console.log(
    `\n${dryRun ? '[dry-run] ' : ''}attached ${attached}, already present ${alreadyPresent}, problems ${problems.length}`
  )
  for (const p of problems) console.log(`  ! ${p}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => db.$disconnect())
