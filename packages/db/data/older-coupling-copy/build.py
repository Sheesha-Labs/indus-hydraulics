# Builds payload.json: product-specific copy for the 108 coupling listings that
# still carried the May 2026 family template (98 from the Sealfast / Sunpool
# coupling import, plus the 10 Sealfast Bauer listings written the same way).
#
#   python3 build.py
#
# Every line here is either stated by the supplier or describes how the part
# works. Sources per brand:
#   - Sunpool: the product page (../sunpool-size-tables/website.json) and its
#     Storz and KC part-number lists (../sunpool-size-tables/pdfs.json);
#   - Sealfast: the family pages (../sealfast-size-tables/website-families.json)
#     and its datasheets, notably the Bauer flanged drawings (flange ASA Class
#     150, rubber O-ring, working pressures up to 150 psi) and the ring lock
#     drawing (female, locking ring, male, gasket).
# A line a supplier does not support is left out rather than written
# generically. What is deliberately not republished is listed in the README.
import json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
WEB = json.load(open(os.path.join(HERE, '..', 'sunpool-size-tables', 'website.json')))
SF = json.load(open(os.path.join(HERE, '..', 'sealfast-size-tables', 'payload.json')))

HOW_TO_ORDER = ('Specify the size, the body material where more than one is listed, and any thread, tail or gasket '
                'variant on the RFQ. Indus engineering will confirm the manufacturer part number against your application.')

# ── families ──────────────────────────────────────────────────────────────
FAMILIES = {
    'storz': {
        'about': ('Storz is a symmetrical hose coupling: every head is identical, with two hooked lugs and a ring, so there is '
                  'no male or female half. Two heads of the same size are pressed face to face and turned until the lugs lock. '
                  'A Storz size is identified by the distance across its lugs, which is why two heads made for nearly the same '
                  'hose bore can be different sizes. Sunpool makes the range in cast aluminium (A356), forged aluminium '
                  '(6061-T6), brass, bronze and stainless steel: long-shank hose couplings, thread adapters, fire department '
                  'connection fittings, safety-latch couplings and adapters, gaskets and clamps.'),
        'selection': ('Match the Storz size, not just the hose bore: check the lug distance or the size marking. Each joint seals '
                      'on the gasket in the face of the heads, so inspect it at every make-up; Sunpool fits a discharge gasket '
                      'as standard and a suction gasket to order. A safety latch stops the heads turning apart where a hose is '
                      'dragged or vibrates. Storz does not connect to cam and groove, Guillemin or threaded fittings without an '
                      'adapter.'),
        'article': ('storz-coupling-sizes', 'Storz coupling sizes and lug distances'),
    },
    'kc': {
        'about': ('KC (king combination) nipples are hose tails: a serrated shank that goes inside the hose, and a threaded, '
                  'grooved or flanged end that connects to pipe or another fitting. The hose is held on the tail by a clamp, '
                  'ferrule or sleeve, and that is what sets how much pressure the joint holds. Sunpool makes standard KC nipples '
                  'from 1/2" to 12" in plated carbon steel, SS304 and SS316; heavy-duty versions with a thicker wall and a '
                  'longer tail for crimping with a ferrule, with or without a welded #150 flange; grooved nipples for rigid '
                  'grooved couplings; and hose menders. The same shelf carries large-bore fittings for agricultural drag hose '
                  'and frac-water lines, a Figure 206 hammer-union hose coupling and suction hose couplings.'),
        'selection': ('The clamp, ferrule or sleeve over the hose usually limits the assembly, not the nipple: rate the joint at '
                      'its weakest part. Sunpool rates its heavy-duty KC nipples and flanges at 300 psi and publishes no rating '
                      'for the rest. Specify the end thread and give the hose outside diameter for the ferrule or sleeve.'),
        'article': ('kc-nipples-and-shank-couplings', 'KC nipples, shank couplings and hose menders'),
    },
    'guillemin': {
        'about': ('Guillemin couplings are symmetrical quarter-turn couplings: every head is identical, so any two heads of the '
                  'same size connect, with no male or female half. The Guillemin system is standardised in France as '
                  'NF E 29-572 and is widely used there on fire, water and industrial transfer hose. Sunpool makes Guillemin '
                  'parts from 3/4" to 4" in aluminium and stainless steel: hose-shank couplings, spiral hose tails, male- and '
                  'female-thread adapters, reducing adapters and dust caps, many with a lock ring that stops the joint turning '
                  'apart.'),
        'selection': ('Guillemin is not interchangeable with Storz, cam and groove or Barcelona couplings, so confirm the pattern '
                      'before ordering. Check the gasket at each make-up and clamp the hose tail for the pressure the hose will '
                      'see. Sunpool does not state which standard its parts are made to or publish a working pressure for them.'),
        'article': ('guillemin-couplings-explained', 'Guillemin couplings explained'),
    },
    'composite': {
        'about': ('Composite hose has no rubber wall to grip, so its fittings engage the hose wire instead: a spiral tail threads '
                  'into the hose along its inner helix, and a ferrule, or a lug nut on a female liner, clamps the outer layers '
                  'onto it. Sunpool designs these fittings for composite hose, and the spiral portion of the tail suits most '
                  'composite hose worldwide. The range covers cam and groove type C and E halves with spiral tails, stainless '
                  'female liners and lug nuts, hex male fittings with BSP or BSPT threads, and a spiral tail with a flange.'),
        'selection': ('Match the fitting to the hose bore and follow the hose maker\'s assembly instructions; the finished '
                      'assembly is rated with the hose. Sunpool publishes no working pressure for the fittings themselves.'),
        'article': ('composite-hose-explained', 'Composite hose explained'),
    },
    'flange': {
        'about': ('Pipe flanges make bolted, removable joints between pipe, hose ends and equipment. Sunpool supplies welding '
                  'neck, slip-on, socket weld, lap joint, threaded, flat and blind flanges to ASME B16.5 in Class 150 and 300, '
                  'and stub ends to MSS SP-43, from 1/2" to 24", in A105 carbon steel and A182 304 and 316 stainless, with '
                  'raised, flat or ring-joint faces.'),
        'selection': ('Match the size, class and facing to the mating flange: a ring-joint face needs a ring-joint flange, and a '
                      'raised face should not be bolted against a flat-faced cast or lined flange. Under ASME B16.5 the rating '
                      'depends on the class, the material and the temperature.'),
        'article': ('flanged-hose-connections', 'Flanged hose connections'),
    },
    'sandblast': {
        'about': ('Sandblast couplings join blast hose to the blast machine and to the nozzle. Hose couplers connect two lengths '
                  'of blast hose, and a nozzle holder carries the blasting nozzle on a threaded end. This shelf carries '
                  'Sealfast\'s aluminium hose ends with crowfoot faces and NPSH-threaded nozzle holders, and Sunpool\'s nylon '
                  'hose couplers, nozzle holders and female thread adapters in 1-1/4" and 1-1/2", in yellow or red.'),
        'selection': ('Blast couplings wear with the hose, so inspect them and their gaskets at every make-up, pin the joint with '
                      'safety clips and fit a whip check across it. Only one part here has a published rating — Sealfast\'s '
                      'aluminium female NPT crowfoot end, at 110 psi — so confirm the rest for your blast pressure.'),
        'article': ('bulk-material-and-sandblast-hose', 'Bulk material and sandblast hose'),
    },
    'crowfoot': {
        'about': ('Crowfoot couplings, also called universal, claw or Chicago couplings, have identical lugged heads that connect '
                  'with a quarter turn on a gasket, so any two heads of the same pattern mate. They are the usual connector on '
                  'compressed-air hose and tools. Sealfast\'s range here covers 316 stainless hose ends and male and female NPT '
                  'ends from 1/2" to 1", a 316 blank end and triple connection, and zinc-plated iron four-lug hose and female '
                  'NPT ends from 1-1/4" to 2".'),
        'selection': ('Pin every joint with a safety clip and fit a whip check across it: a hose that parts under air pressure '
                      'whips violently. Check the gasket at each make-up. Sealfast rates its four-lug hose end and its '
                      'stainless blank and triple ends at 150 psi at 70 °F and publishes no rating for the others.'),
        'article': ('universal-air-couplings-explained', 'Universal air couplings explained'),
    },
    'groundjoint': {
        'about': ('A ground joint coupling seals metal to metal: a hose stem with a ground seat is drawn against a matching spud '
                  'by a wing nut, with no gasket in the joint. That is why it is used on steam, where rubber seals harden and '
                  'fail. Sealfast\'s plated-iron range covers hose stems, NPT male stems, wing nuts, male, female and double '
                  'spuds and complete sets from 1/2" to 4", with zinc-plated iron clamps to hold the hose on the stem.'),
        'selection': ('Keep the seats clean and undamaged, because a scratched seat leaks. Clamp the hose to the stem with a '
                      'clamp sized to the hose outside diameter and re-tighten after the first heat cycle. Sealfast publishes '
                      'no pressure rating for these parts, so confirm one for your steam pressure before ordering.'),
        'article': ('ground-joint-steam-couplings', 'Ground joint steam couplings'),
    },
    'ringlock': {
        'about': ('Ring lock couplings join a male and a female hose shank with a lever-operated locking ring, sealed on a '
                  'gasket: a quick connection for water and slurry lines that are laid and moved often. Sealfast\'s '
                  'zinc-plated steel range covers male and female hose shanks, complete sets and spare locking rings from '
                  '2" to 8".'),
        'selection': ('Ring lock resembles Bauer but is not the same pattern, so confirm a mating half before pairing the two. '
                      'Replace a worn locking ring rather than forcing the lever, and check the gasket at each make-up. '
                      'Sealfast publishes no working pressure for these parts.'),
        'article': ('bauer-couplings-explained', 'Bauer and ring lock couplings explained'),
    },
    'pinlug': {
        'about': ('Pin lug couplings join two hose shanks with a threaded nut that is tightened with a spanner on its pin lugs. '
                  'Sealfast\'s are aluminium shanks with brass nuts and NPSH threads, sold as male, female and complete sets '
                  'from 1-1/2" to 6".'),
        'selection': ('NPSH is a straight thread, so the joint seals on the washer in the female coupling, not on the thread: '
                      'keep the washer in place and replace it when it hardens. Hold each shank on the hose with clamps sized '
                      'for the hose. Sealfast publishes no working pressure for these parts.'),
        'article': ('kc-nipples-and-shank-couplings', 'KC nipples, shank couplings and hose menders'),
    },
    'shank': {
        'about': ('Shank couplings, or hose nipples, have a serrated shank that goes inside the hose and a threaded end; a male '
                  'and a female nipple join to each other, so a hose can be disconnected without unclamping it. Sealfast\'s '
                  'range covers steel long-shank male and female nipples and complete sets from 1/2" to 2", and brass '
                  'short-shank nipples from 3/8" to 1-1/4".'),
        'selection': ('Hold the shank with a clamp sized to the hose outside diameter; the clamp and the hose, not the nipple, '
                      'usually limit the joint. Sealfast publishes no working pressure for these parts.'),
        'article': ('kc-nipples-and-shank-couplings', 'KC nipples, shank couplings and hose menders'),
    },
    'hosenipple': {
        'about': ('A hose nipple joins a hose to a male NPT port: a barbed tail goes inside the hose and is held with a clamp. '
                  'Sealfast\'s zinc-plated steel nipples run from 1/8" NPT × 1/4" hose to 1" NPT × 1" hose.'),
        'selection': ('Size the clamp to the hose outside diameter; the clamp and the hose usually limit the joint. Sealfast '
                      'publishes no working pressure for these parts.'),
        'article': ('kc-nipples-and-shank-couplings', 'KC nipples, shank couplings and hose menders'),
    },
    'mender': {
        'about': ('A hose mender joins two lengths of the same hose, after a cut or a burst, with a barbed tail at each end, '
                  'each held by a clamp. Sealfast\'s brass menders run from 1/8" to 3/4".'),
        'selection': ('A mender restores flow, not the hose\'s original rating: the joint is limited by its clamps, and the hose '
                      'either side is as old as the part that failed. Sealfast publishes no working pressure for menders.'),
        'article': ('kc-nipples-and-shank-couplings', 'KC nipples, shank couplings and hose menders'),
    },
    'bauer': {
        'about': ('Bauer-type couplings are lever-locked quick couplings for water, irrigation and slurry lines. The male half '
                  'has a rounded tip that seats in the female, which carries a rubber O-ring seal, and a lever ring with two '
                  'handles clamps the joint; because the tip seats like a ball in a cup, the joint tolerates some misalignment. '
                  'Sealfast\'s zinc-plated steel range covers male and female halves with hose shanks (2"–12"), male NPT '
                  'threads or ASA Class 150 flanges (2"–8"), complete sets and spare lever rings.'),
        'selection': ('Check a half from another maker against ours before relying on the joint, and keep ring lock halves apart: '
                      'the two patterns look alike. Replace a lever ring that no longer pulls the tip fully home. Sealfast rates '
                      'its flanged Bauer couplings to 150 psi and publishes no rating for the others.'),
        'article': ('bauer-couplings-explained', 'Bauer couplings explained'),
    },
}

NPT = 'NPT pipe thread (ASME B1.20.1)'
NPSH = 'NPSH hose thread (ASME B1.20.7)'
DIN_STORZ = 'Made to the DIN Storz pattern (Sunpool does not give the standard number)'
NFPA = 'Conforms to NFPA 1963, per Sunpool'
STORZ_GASKET = 'Discharge gasket in the head as standard; suction gasket to order (Sunpool code S)'

# ── per listing ───────────────────────────────────────────────────────────
# family, what (one clause for the short description), end A, end B, seal, standard
L = {}
def add(sku, family, what, end_a=None, end_b=None, seal=None, standard=None, size=None, pressure=None, material=None):
    L[sku] = {'family': family, 'what': what, 'endA': end_a, 'endB': end_b, 'seal': seal, 'standard': standard,
              'size': size, 'pressure': pressure, 'material': material}

# Storz (Sunpool)
for sku, mat in (('IH-STZ-STORZ-COUPLING-LONG-SHANK', 'aluminium'), ('IH-STZ-STORZ-COUPLING-LONG-SHANK-2', 'brass'),
                 ('IH-STZ-STORZ-COUPLING-LONG-SHANK-3', 'stainless steel')):
    add(sku, 'storz', f'{mat} Storz head with a long hose shank for banding or crimping', 'Storz head',
        'Long hose shank, for banding or crimping', STORZ_GASKET, DIN_STORZ if mat == 'aluminium' else None)
for sku, mat, end in (('IH-STZ-STORZ-ADAPTER-FEMALE-THREAD', 'aluminium', 'female'), ('IH-STZ-STORZ-ADAPTER-FEMALE-THREAD-2', 'brass', 'female'),
                      ('IH-STZ-STORZ-ADAPTER-FEMALE-THREAD-3', 'stainless steel', 'female'), ('IH-STZ-STORZ-ADAPTER-MALE-THREAD', 'aluminium', 'male'),
                      ('IH-STZ-STORZ-ADAPTER-MALE-THREAD-2', 'brass', 'male'), ('IH-STZ-STORZ-ADAPTER-MALE-THREAD-3', 'stainless steel', 'male'),
                      ('IH-STZ-STORZ-ADAPTER-X-MALE-THREAD', 'aluminium, brass or gunmetal', 'male')):
    add(sku, 'storz', f'{mat} Storz adapter to a {end} NPT, BSP or NST thread', 'Storz head', f'{end.capitalize()} thread — NPT, BSP or NST',
        'Gasket in the Storz head; suction gasket to order (Sunpool code S)', DIN_STORZ)
for sku, finish in (('IH-STZ-STORZ-ADAPTER-MALE-THREAD-PAINTED', 'painted'), ('IH-STZ-STORZ-ADAPTER-MALE-THREAD-H-ANODIZED', 'hard-anodised')):
    add(sku, 'storz', f'forged aluminium Storz adapter, {finish}, to a male NPT, BSP or BSPT thread', '4", 5" or 6" Storz head',
        'Male thread — NPT, BSP or BSPT', 'NBR gasket', NFPA)
for sku, finish in (('IH-STZ-STORZ-ADAPTER-WITH-SAFETY-LATCH-H-ANODIZ', 'hard-anodised'), ('IH-STZ-STORZ-ADAPTER-WITH-SAFETY-LATCH-PAINTED', 'painted')):
    add(sku, 'storz', f'forged aluminium Storz adapter with a stainless auto-lock latch, {finish}', '4", 5" or 6" Storz head with a stainless safety latch',
        None, 'NBR gasket', NFPA)
add('IH-STZ-STORZ-COUPLING-WITH-SAFETY-LATCH', 'storz', 'forged aluminium Storz coupling with a stainless auto-lock latch and a tail for a 3-segment clamp',
    '4", 5" or 6" Storz head with a stainless safety latch', 'Hose tail for a 3-segment clamp', 'NBR gasket', NFPA)
for sku, finish in (('IH-STZ-STORZ-FDC-UL-LISTED-PAINTED', 'painted'), ('IH-STZ-STORZ-FDC-UL-LISTED-H-ANODIZED', 'hard-anodised')):
    add(sku, 'storz', f'UL-listed forged aluminium Storz fire department connection, {finish}', '4" or 5" Storz head with a stainless self-locking latch',
        '4" or 5" female NPT or BSP thread', 'Metal sealing face with an HNBR gasket (listed by Sunpool as H NBR)', 'UL listed; conforms to NFPA 1963, per Sunpool')
for sku, finish in (('IH-STZ-STORZ-30-DEG-FDC-UL-LISTED-PAINTED', 'painted'), ('IH-STZ-STORZ-30-DEG-FDC-UL-LISTED-H-ANODIZED', 'hard-anodised')):
    add(sku, 'storz', f'UL-listed forged aluminium 30° Storz fire department connection, {finish}', '4" or 5" Storz head with a stainless self-locking latch',
        '4" female NPT thread, on a 30° body', 'Metal sealing face with an HNBR gasket (listed by Sunpool as H NBR)', 'UL listed; conforms to NFPA 1963, per Sunpool')
add('IH-STZ-STORZ-FIRE-DEPARTMENT-CONNECTION-30-ELBO', 'storz', '6061-T6 aluminium Storz fire department connection with a 30° elbow, rated 250 psi',
    '4" or 5" Storz head', '4" female NPT thread, on a 30° elbow', None, NFPA)
add('IH-STZ-STORZ-ADAPTER-X-SWIVEL-FEMALE-THREAD', 'storz', 'forged aluminium Storz adapter to a swivel female thread', '4", 5" or 6" Storz head',
    'Swivel female thread, 4" to 6"', 'NBR gasket', NFPA)
add('IH-STZ-REDUCE-TYPE', 'storz', 'aluminium reducer, 3" × 2" or 3" × 2-1/2"', '3" end', '2" or 2-1/2" end')
add('IH-STZ-3-SEGMENT-CLAMP-FOR-STORZ', 'storz', 'forged aluminium 3-segment clamp for Storz couplings with a safety pin')
add('IH-STZ-ALFOT-FORGED-STORZ-HEAD', 'storz', 'forged aluminium Storz head made by Alfot in Taiwan', 'Storz head')
add('IH-STZ-STORZ-PRESSURE-GASKET-BLACK', 'storz', 'black NBR pressure gasket for Storz heads')
add('IH-STZ-STORZ-SUCTION-GASKET-GRAY', 'storz', 'grey NBR suction gasket for Storz heads')

# KC shelf (Sunpool)
add('IH-KC-KC-NIPPLE-2', 'kc', 'KC (king combination) nipple: serrated hose tail with a male thread', 'Serrated hose tail',
    'Male thread — NPT or BSPT; BSP and unthreaded to order')
add('IH-KC-KC-NIPPLE', 'kc', 'heavy-duty KC nipple with a thicker wall and a grooved tail for crimping a ferrule, rated 300 psi',
    'Serrated hose tail with a machined groove for crimping a ferrule', 'Male thread — NPT or BSPT; unthreaded to order')
add('IH-KC-KC-X-FIXED-FLANGE', 'kc', 'heavy-duty KC hose tail with a welded #150 fixed flange, rated 300 psi',
    'Hose tail with a machined groove for crimping a ferrule', 'Welded #150 fixed flange')
add('IH-KC-KC-X-TURNBACK-FLANGE', 'kc', 'heavy-duty KC hose tail with a welded disc for a #150 floating flange, rated 300 psi',
    'Thick-walled hose tail', 'Welded disc for a #150 floating flange')
add('IH-KC-GROOVE-KC-NIPPLE', 'kc', 'KC nipple with a grooved end for rigid grooved couplings', 'Serrated hose tail', 'Grooved end for a rigid grooved coupling')
add('IH-KC-HOSE-MENDER', 'kc', 'hose mender with a serrated tail at each end', 'Serrated hose tail', 'Serrated hose tail')
add('IH-KC-206-HOSE-HAMMER-UNION', 'kc', 'forged carbon steel Figure 206 hammer union on a multi-serration hose tail', 'Figure 206 hammer union',
    'Multi-serration hose tail, for interlocking ferrules')
add('IH-KC-FRAC-WATER', 'kc', 'hard-anodised aluminium coupling for frac-water lines in shale oil and gas service')
add('IH-KC-UMBILICAL-SLURRY-COUPLING-SET', 'kc', 'umbilical slurry coupling set for agricultural drag hose, fitted without specialist tools')
add('IH-KC-DRAG-HOSE-FITTING', 'kc', 'hard-anodised aluminium umbilical slurry fitting for agricultural drag hose, held by a hose clamp')
for sku, mat in (('IH-KC-SUCTION-HOSE', 'plated carbon steel'), ('IH-KC-SUCTION-HOSE-2', 'brass'), ('IH-KC-SUCTION-HOSE-3', 'aluminium shank and brass nut')):
    add(sku, 'kc', f'suction hose coupling in {mat}, threaded NPT, BSP or NPSM', 'Hose shank', 'Threaded end — NPT, BSP or NPSM')

# Guillemin (Sunpool)
add('IH-GUI-GUILLEMIN-COUPLING-FEMALE-THREAD', 'guillemin', 'Guillemin coupling with a female thread', 'Guillemin head', 'Female thread')
add('IH-GUI-GUILLEMIN-COUPLING-MALE-THREAD-X-SPIRAL', 'guillemin', 'Guillemin fitting with a male thread and a spiral hose tail', 'Male thread', 'Spiral hose tail')
add('IH-GUI-GUILLEMIN-COUPLING-SHORT-SHANK', 'guillemin', 'Guillemin coupling with a short hose shank and a lock ring', 'Guillemin head with a lock ring', 'Short hose shank')
add('IH-GUI-GUILLEMIN-COUPLING-LONG-HOSE-SHANK', 'guillemin', 'Guillemin coupling with a long hose shank and a lock ring', 'Guillemin head with a lock ring', 'Long hose shank')
add('IH-GUI-GUILLEMIN-COUPLING-SPIRAL-HOSE-TAIL', 'guillemin', 'Guillemin coupling with a spiral hose tail and a lock ring', 'Guillemin head with a lock ring', 'Spiral hose tail, for suction hose with a rigid helix')
add('IH-GUI-GUILLEMIN-ADAPTER-MALE-THREAD', 'guillemin', 'Guillemin adapter to a male thread, with or without a lock ring', 'Guillemin head, with or without a lock ring', 'Male thread')
add('IH-GUI-GUILLEMIN-ADAPTER-FEMALE-THREAD', 'guillemin', 'Guillemin adapter to a female thread, without a lock ring', 'Guillemin head without a lock ring', 'Female thread')
add('IH-GUI-GUILLEMIN-ADAPTER-REDUCING-TYPE', 'guillemin', 'Guillemin reducer joining two Guillemin sizes', 'Larger Guillemin head', 'Smaller Guillemin head',
    material='Not stated by Sunpool for the reducer; its other Guillemin parts are aluminium or stainless steel')
add('IH-GUI-GUILLEMIN-DUST-CAP', 'guillemin', 'Guillemin dust cap with a lock ring', 'Guillemin head with a lock ring')

# Composite fittings (Sunpool)
add('IH-COMP-CAMLOCK-TYPE-C-X-SPIRAL-TAIL-FOR-COMPOST', 'composite', 'cam and groove type C coupler with a spiral tail for composite hose',
    'Cam and groove type C coupler (female, with cam arms in brass, stainless or aluminium)', 'Spiral tail for composite hose', 'NBR, Viton or silicone gasket')
add('IH-COMP-CAMLOCK-TYPE-E-X-SPIRAL-TAIL-FOR-COMPOSI', 'composite', 'cam and groove type E adapter with a spiral tail for composite hose',
    'Cam and groove type E adapter (male)', 'Spiral tail for composite hose')
add('IH-COMP-COMPOSITE-HOSE-FEMALE-LINER', 'composite', 'stainless female liner for composite hose, taking a lug nut', 'Spiral tail for composite hose',
    'Female liner for the lug nut (sold separately)')
add('IH-COMP-HEX-MALE-COMPOSITE-HOSE-FITTING', 'composite', 'stainless hex male composite hose fitting with a BSP or BSPT thread', 'Spiral tail for composite hose',
    'Hex male thread — BSP or BSPT')
add('IH-COMP-LUG-NUT-FOR-FEMALE-LINER', 'composite', 'stainless lug nut for the composite hose female liner', 'Fits the composite hose female liner', 'BSP thread')
add('IH-COMP-SPIRAL-HOSE-TAIL-X-FLANGE', 'composite', 'stainless spiral tail for composite hose with a flange', 'Spiral tail for composite hose', 'Flange')

# Flanges (Sunpool)
B165 = 'ASME B16.5, Class 150 and 300 (Sunpool lists it as ASTM/ANSI B16.5)'
FACES = 'Flange face — raised (RF), flat (FF) or ring-joint (RTJ)'
add('IH-FLG-WELDING-NECK-FLANGE', 'flange', 'ASME B16.5 Class 150 / 300 welding neck flange', 'Tapered neck, butt-welded to the pipe', FACES, None, B165)
add('IH-FLG-SLIP-ON-FLANGE', 'flange', 'ASME B16.5 Class 150 / 300 slip-on flange', 'Slip-on bore, fillet-welded to the pipe', FACES, None, B165)
add('IH-FLG-SOCKET-WELD-FLANGE', 'flange', 'ASME B16.5 Class 150 / 300 socket weld flange', 'Socket for a socket-welded pipe', FACES, None, B165)
add('IH-FLG-LAP-JOINT-FLANGE', 'flange', 'ASME B16.5 Class 150 / 300 lap joint flange', 'Loose flange over a lap-joint stub end', 'Flat face (FF)', None, B165)
add('IH-FLG-THREADED-FLANGE', 'flange', 'ASME B16.5 Class 150 / 300 threaded flange', 'Threaded bore for the pipe', FACES, None, B165)
add('IH-FLG-FLAT-FLANGE', 'flange', 'ASME B16.5 Class 150 / 300 flat (plate) flange', 'Plate flange', 'Flange face — raised (RF) or flat (FF)', None, B165)
add('IH-FLG-BLIND-FLANGE', 'flange', 'ASME B16.5 Class 150 / 300 blind flange', 'Blind — closes the line', FACES, None, B165)
add('IH-FLG-STUB-END-FLANGE', 'flange', 'MSS SP-43 stub end for a lap joint flange', 'Butt-weld end', 'Lap for a lap joint flange', None, 'MSS SP-43, type A, B or C')
add('IH-FLG-DOCK-FLANGE-X-MALE-THREAD', 'flange', 'gunmetal dock flange with a male thread', 'Flange', 'Male thread')

# Sandblast (Sunpool nylon, Sealfast aluminium)
add('IH-SB-HOSE-COUPLER', 'sandblast', 'nylon sandblast hose coupler, yellow or red')
add('IH-SB-NOZZLE-HOLDER', 'sandblast', 'nylon sandblast nozzle holder, yellow or red')
add('IH-SB-FEMALE-THREAD-ADAPTER', 'sandblast', 'nylon sandblast female thread adapter, yellow or red', 'Female thread')
add('IH-SB-HOSE-END-WITH-CROWFOOT', 'sandblast', 'aluminium sandblast hose end with a crowfoot face', 'Hose end', 'Crowfoot (claw) face')
add('IH-SB-NPSH-THREADED-HOSE-END-NOZZLE-HOLDERS', 'sandblast', 'aluminium sandblast hose end with an NPSH-threaded nozzle holder', 'Hose end',
    'NPSH-threaded nozzle holder', None, NPSH)
add('IH-SB-1-1-4-TO-1-1-2-INCH-IN-PIPE-THREAD-SIZE', 'sandblast', 'aluminium female NPT sandblast end with a crowfoot face, rated 110 psi',
    'Female NPT pipe thread', 'Crowfoot (claw) face', None, NPT)

# Crowfoot (Sealfast)
add('IH-CRW-HOSE-END-CROWFOOT', 'crowfoot', '316 stainless crowfoot coupling with a hose end', 'Hose shank', 'Crowfoot head')
add('IH-CRW-FEMALE-NPT-HOSE-END-CROWFOOT', 'crowfoot', '316 stainless crowfoot coupling with a female NPT end', 'Female NPT thread', 'Crowfoot head', None, NPT)
add('IH-CRW-MALE-NPT-HOSE-END-CROWFOOT', 'crowfoot', '316 stainless crowfoot coupling with a male NPT end', 'Male NPT thread', 'Crowfoot head', None, NPT)
add('IH-CRW-BLANK-END-CROWFOOT', 'crowfoot', '316 stainless crowfoot blank end, rated 150 psi at 70 °F', 'Crowfoot head', 'Blank — closes the line',
    size='One universal head (Sealfast lists no size)')
add('IH-CRW-TRIPLE-CONNECTION-CROWFOOT', 'crowfoot', '316 stainless crowfoot triple connection, rated 150 psi at 70 °F', 'Crowfoot head', 'Triple (three-way) connection',
    size='One universal head (Sealfast lists no size)')
add('IH-CRW-FOUR-LUG-HOSE-END-CROWFOOT', 'crowfoot', 'zinc-plated iron four-lug crowfoot hose end, rated 150 psi at 70 °F', 'Hose shank', 'Four-lug crowfoot head')
add('IH-CRW-FOUR-LUG-FEMALE-NPT-CROWFOOT', 'crowfoot', 'zinc-plated iron four-lug crowfoot coupling with a female NPT end', 'Female NPT thread', 'Four-lug crowfoot head', None, NPT)

# Ground joint (Sealfast)
GJ_SEAL = 'Metal-to-metal ground seat, no gasket'
add('IH-GJ-GROUND-JOINT-HOSE-STEM', 'groundjoint', 'plated iron ground joint hose stem', 'Hose shank', 'Ground seat, mating with a spud', GJ_SEAL)
add('IH-GJ-GROUND-JOINT-NPT-MALE-STEM', 'groundjoint', 'plated iron ground joint stem with a male NPT thread', 'Male NPT thread', 'Ground seat, mating with a spud', GJ_SEAL, NPT)
add('IH-GJ-GROUND-JOINT-WING-NUT', 'groundjoint', 'plated iron ground joint wing nut, drawing the stem onto the spud', None, None, GJ_SEAL)
add('IH-GJ-GROUND-JOINT-FEMALE-SPUD', 'groundjoint', 'plated iron ground joint female spud', 'Female pipe thread', 'Spud face for the stem and wing nut', GJ_SEAL)
add('IH-GJ-GROUND-JOINT-MALE-SPUD', 'groundjoint', 'plated iron ground joint male spud', 'Male pipe thread', 'Spud face for the stem and wing nut', GJ_SEAL)
add('IH-GJ-GROUND-JOINT-DOUBLE-SPUD', 'groundjoint', 'plated iron ground joint double spud', None, None, GJ_SEAL)
add('IH-GJ-GROUND-JOINT-COMPLETE-SET', 'groundjoint', 'plated iron ground joint complete set: stem, wing nut and spud', 'Hose stem', 'Spud', GJ_SEAL)
add('IH-GJ-UNIVERSAL-CLAMPS', 'groundjoint', 'zinc-plated iron universal hose clamp, sized by hose outside diameter',
    size='16 clamping ranges from 11/16"–7/8" to 4-7/8"–5-5/16" hose outside diameter')

# Ring lock (Sealfast)
RL_SEAL = 'Gasket, as on Sealfast\'s drawing'
add('IH-RL-HOSE-SHANK-FEMALE', 'ringlock', 'zinc-plated steel ring lock female coupling with a hose shank', 'Ring lock female', 'Hose shank', RL_SEAL)
add('IH-RL-HOSE-SHANK-MALE', 'ringlock', 'zinc-plated steel ring lock male coupling with a hose shank', 'Ring lock male', 'Hose shank', RL_SEAL)
add('IH-RL-HOSE-SHANK-FEMALE-X-MALE-COUPLING-COMPLE', 'ringlock', 'zinc-plated steel ring lock set: female, locking ring, male and gasket',
    'Ring lock female with a hose shank', 'Ring lock male with a hose shank', RL_SEAL)
add('IH-RL-LEVER-RINGS', 'ringlock', 'zinc-plated steel spare locking ring for ring lock couplings')

# Pin lug (Sealfast)
add('IH-PLS-SHANK-COUPLING-COMPLETE-SET-BRASS-NUT', 'pinlug', 'aluminium pin lug coupling set: male shank and female shank with a brass NPSH nut',
    'Male NPSH thread on a hose shank', 'Female brass NPSH nut with pin lugs, on a hose shank', None, NPSH)
add('IH-PLS-SHANK-FEMALE-COUPLING-WITH-BRASS-NUT', 'pinlug', 'aluminium pin lug female coupling with a brass NPSH nut', 'Hose shank',
    'Female brass NPSH nut with pin lugs', None, NPSH)
add('IH-PLS-SHANK-MALE', 'pinlug', 'aluminium pin lug male coupling with an NPSH thread', 'Hose shank', 'Male NPSH thread', None, NPSH)

# Shank couplings, hose nipple, mender (Sealfast)
add('IH-SHK-LONG-SHANK-FEMALE-HOSE-NIPPLE', 'shank', 'steel long-shank female hose nipple', 'Long hose shank', 'Female threaded end')
add('IH-SHK-LONG-SHANK-MALE-HOSE-NIPPLE', 'shank', 'steel long-shank male hose nipple', 'Long hose shank', 'Male threaded end')
add('IH-SHK-LONG-SHANK-HOSE-NIPPLE-COMPLETE-SET', 'shank', 'steel long-shank hose nipple set, male and female', 'Male long-shank nipple', 'Female long-shank nipple')
add('IH-SHK-SHORT-SHANK-FEMALE-HOSE-NIPPLE', 'shank', 'brass short-shank female hose nipple', 'Short hose shank', 'Female threaded end')
add('IH-SHK-SHORT-SHANK-MALE-HOSE-NIPPLE', 'shank', 'brass short-shank male hose nipple', 'Short hose shank', 'Male threaded end')
add('IH-HN-MALE-NPT-X-HOSE-BARB-HOSE-NIPPLE', 'hosenipple', 'zinc-plated steel male NPT × hose barb nipple', 'Male NPT thread', 'Hose barb', None, NPT)
add('IH-MND-HOSE-MENDERS', 'mender', 'brass hose mender with a barb at each end', 'Hose barb', 'Hose barb')

# Bauer (Sealfast)
BAUER_150 = 'Up to 150 psi, per Sealfast\'s datasheet'
O_RING = 'Rubber O-ring in the female, as on Sealfast\'s drawing'
MATE_O_RING = 'Seals on the rubber O-ring in the mating female'
add('IH-BC-FLANGE-FEMALE', 'bauer', 'zinc-plated steel Bauer-type female with an ASA Class 150 flange, rated 150 psi', 'Bauer-type female', 'ASA (ASME) Class 150 flange',
    O_RING, pressure=BAUER_150)
add('IH-BC-FLANGE-MALE', 'bauer', 'zinc-plated steel Bauer-type male with an ASA Class 150 flange, rated 150 psi', 'Bauer-type male', 'ASA (ASME) Class 150 flange',
    MATE_O_RING, pressure=BAUER_150)
add('IH-BC-FLANGE-SET', 'bauer', 'zinc-plated steel Bauer-type male and female, both with ASA Class 150 flanges, rated 150 psi',
    'Bauer-type male with an ASA (ASME) Class 150 flange', 'Bauer-type female with an ASA (ASME) Class 150 flange', O_RING, pressure=BAUER_150)
add('IH-BC-FLANGE-MALE-SET', 'bauer', 'zinc-plated steel Bauer-type male and female set, the male with a male NPT thread',
    'Bauer-type male with a male NPT thread', 'Bauer-type female', O_RING)
add('IH-BC-MALE-FEMALE', 'bauer', 'zinc-plated steel Bauer-type female with a male NPT thread', 'Bauer-type female', 'Male NPT thread', O_RING, NPT)
add('IH-BC-MALE-MALE', 'bauer', 'zinc-plated steel Bauer-type male with a male NPT thread', 'Bauer-type male', 'Male NPT thread', MATE_O_RING, NPT)
add('IH-BC-SHANK-COMPLETE', 'bauer', 'zinc-plated steel Bauer-type male and female set, both with hose shanks', 'Bauer-type male with a hose shank',
    'Bauer-type female with a hose shank', O_RING)
add('IH-BC-SHANK-FEMALE', 'bauer', 'zinc-plated steel Bauer-type female with a hose shank', 'Bauer-type female', 'Hose shank', O_RING)
add('IH-BC-SHANK-MALE', 'bauer', 'zinc-plated steel Bauer-type male with a hose shank', 'Bauer-type male', 'Hose shank', MATE_O_RING)
add('IH-BC-LEVER-RING', 'bauer', 'zinc-plated steel spare lever ring for Bauer-type couplings')

# Sealfast size lines come from the size table rows built from Sealfast's site.
def join(xs):
    return xs[0] if len(xs) == 1 else ', '.join(xs[:-1]) + ' and ' + xs[-1]

for sku, v in L.items():
    if sku.startswith(('IH-BC-', 'IH-CRW-', 'IH-GJ-', 'IH-RL-', 'IH-PLS-', 'IH-SHK-', 'IH-HN-', 'IH-MND-')) or (sku.startswith('IH-SB-') and sku in SF):
        if v['size'] is None:
            rows = [r['hoseInch'] for r in SF[sku]['variants']]
            if not rows: raise SystemExit(f'{sku}: no Sealfast size rows and no size line')
            v['size'] = join(rows)

# Manufacturer notes: Sunpool's own bullets, minus downloads and one source slip.
SLIPS = ('Download:', 'EN 14420-6 / DIN 28450')
for sku, v in L.items():
    bullets = WEB.get(sku, {}).get('bullets', [])
    v['notes'] = [b for b in bullets if not any(s in b for s in SLIPS)]

missing = [s for s in L if L[s]['family'] not in FAMILIES]
assert not missing, missing
assert len(L) == 108, len(L)
out = {'families': FAMILIES, 'howToOrder': HOW_TO_ORDER, 'listings': L}
json.dump(out, open(os.path.join(HERE, 'payload.json'), 'w'), indent=1, ensure_ascii=False)
print(len(L), 'listings;', sum(1 for v in L.values() if v['size']), 'size lines from Sealfast;',
      sum(1 for v in L.values() if v['seal']), 'seal lines;', sum(1 for v in L.values() if v['standard']), 'standard lines;',
      sum(1 for v in L.values() if v['endA']), 'with ends')
