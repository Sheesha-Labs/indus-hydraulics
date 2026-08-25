"""
Hammer union source tables, transcribed from the two licensed catalogues.

SOURCES
  M  = Marlia Ingenieros S.L., "Weco couplings - Hammer lug unions", 20 pp.
       The supplier catalogue. Owns every dimension and weight below.
  S  = SPM Oil & Gas / Kemper, "Oilfield Hammer Unions", 2 pp, (c) 2021.
       A different manufacturer's data sheet. Used ONLY to cross-check
       pressure figures and size availability - facts, not expression. No SPM
       artwork or wording reaches the storefront.

Every number here carries its page. Nothing is inferred from knowledge of the
product; where the two books disagree or one contradicts itself, the conflict
is recorded in CONFLICTS rather than resolved silently.

UNITS
  Weights are the catalogue's kilograms. Dimensions are its millimetres.
  Pressure is stored in bar on the variant rows because that is what the rest
  of the catalogue quotes; psi is carried alongside for the spec fields.
"""

# ── Pressure ladder ────────────────────────────────────────────────────────
# Left column is the catalogue's psi, right is the bar figure IT prints. Where
# only one book states a psi and neither prints a bar (the SPM-only figures),
# the bar is converted at 14.5038 and marked derived.
PSI_TO_BAR = {
    500: 35,      # M p2  "500 psi cold working pressure (35 bar)"
    1000: 69,     # M p3  "1.000 psi cwp (69 bar)"
    2000: 138,    # M p4  "2.000 psi cwp (138 bar)"
    4000: 276,    # derived - S only, no bar printed
    5000: 345,    # M p11 "5.000 psi cwp (345 bar)"
    6000: 414,    # M p8  "6.000 psi (414 bar)"
    7500: 517,    # M p11 "7.500 psi cwp (517 bar)"
    10000: 690,   # M p11 "10.000 psi cwp (690 bar)"
    15000: 1034,  # M p15 "15.000 psi cwp (1.034 bar)"
    20000: 1380,  # M p17 "20.000 psi cwp (1380 bar)"
}
DERIVED_BAR = {4000}

# Nominal sizes: label -> part-number token.
SIZE_TOKEN = {
    '1"': '0100', '1-1/4"': '0125', '1-1/2"': '0150', '2"': '0200',
    '2-1/2"': '0250', '3"': '0300', '4"': '0400', '5"': '0500',
    '6"': '0600', '8"': '0800', '10"': '1000', '12"': '1200',
}

# ── Marlia dimension tables ────────────────────────────────────────────────
# Each row: size -> dict of the letters that row prints. A letter the source
# leaves blank is absent, never zero.
#   A = nut radius (cap radius on Fig 207)
#   B = total length
#   C = dia. body
#   D = cap height (Fig 207 only)
#   weldPrepOd / weldPrepId = Fig 2002 / 2202, headed "Weld Prep O.D. / I.D."

# M p2. Threaded and socket weld share nut radius A.
FIG50 = {
    'threaded':    {'4"': dict(kg=12.4, A=130.3, B=152.4), '5"': dict(kg=9.90, A=130.3, B=142.7)},
    'socket_weld': {'4"': dict(kg=11.7, A=130.3, B=103.1), '5"': dict(kg=9.30, A=130.3, B=103.1)},
}

# M p3
FIG100_THREADED = {
    '2"':     dict(kg=2.2,  A=73.1,  B=82.0,  C=69.8),
    '2-1/2"': dict(kg=4.5,  A=88.9,  B=107.9, C=85.8),
    '3"':     dict(kg=7.5,  A=103.1, B=103.1, C=104.6),
    '4"':     dict(kg=10.4, A=115.8, B=122.6, C=130.0),
    '5"':     dict(kg=14.7, A=146.0, B=152.4, C=162.0),
    '6"':     dict(kg=21.5, A=165.1, B=173.7, C=184.4),
    '8"':     dict(kg=29.9, A=184.1, B=182.6, C=242.8),
}

# M p4. The 8" row prints C = 142,8 mm, which is smaller than the 5" body
# (162,0) and half the 8" body on the Fig 100 page (242,8). A body diameter
# cannot shrink as the line grows, so C is dropped on that row alone rather
# than published or repaired. See CONFLICTS.
FIG200_THREADED = {
    '1"':     dict(kg=0.8,  A=50.8,  B=62.9,  C=40.3),
    '1-1/4"': dict(kg=1.0,  A=57.1,  B=70.6,  C=50.8),
    '1-1/2"': dict(kg=1.2,  A=61.9,  B=73.6,  C=57.9),
    '2"':     dict(kg=2.2,  A=73.1,  B=81.0,  C=69.8),
    '2-1/2"': dict(kg=3.8,  A=88.9,  B=104.6, C=84.0),
    '3"':     dict(kg=6.7,  A=98.5,  B=116.5, C=103.8),
    '4"':     dict(kg=8.2,  A=114.3, B=125.4, C=130.0),
    '5"':     dict(kg=14.7, A=146.0, B=152.4, C=162.0),
    '6"':     dict(kg=21.5, A=165.1, B=173.7, C=187.4),
    '8"':     dict(kg=30.0, A=184.1, B=182.6),
}

# M p5. Two schedules, one nut radius.
FIG200_BUTTWELD = {
    'Sch 40': {
        '2"': dict(kg=2.5,  A=73.1,  B=80.0),
        '3"': dict(kg=5.7,  A=98.5,  B=101.6),
        '4"': dict(kg=6.7,  A=114.3, B=122.4),
        '5"': dict(kg=14.8, A=146.0, B=152.4),
        '6"': dict(kg=21.7, A=165.1, B=147.8),
        '8"': dict(kg=31.1, A=184.1, B=175.5),
    },
    'Sch 80': {
        '2"': dict(kg=2.6,  A=73.1,  B=82.5),
        '3"': dict(kg=5.6,  A=98.5,  B=105.1),
        '4"': dict(kg=7.3,  A=114.3, B=126.4),
        '5"': dict(kg=17.0, A=146.0, B=156.7),
        '6"': dict(kg=23.3, A=165.1, B=153.9),
        '8"': dict(kg=33.9, A=184.1, B=182.6),
    },
}

# M p6: "All dimensions and weights are the same as for the Figure 200 range
# of unions." Stated, not assumed - the 206 page prints no table of its own.
FIG206_THREADED = FIG200_THREADED
FIG206_BUTTWELD = FIG200_BUTTWELD

# M p7. Blanking cap. Its BW weight column is headed "Peso" - the Spanish word
# left untranslated in an English book. Same column, same meaning.
FIG207 = {
    'threaded': {
        '3"': dict(kg=4.5,  A=73.1,  B=93.7,  C=103.8, D=60.4),
        '4"': dict(kg=9.3,  A=92.9,  B=109.4, C=130.0, D=66.8),
        '6"': dict(kg=20.3, A=127.0, B=142.2, C=187.4, D=81.0),
    },
    'Sch 80': {
        '3"': dict(kg=4.0,  A=73.1,  B=90.4),
        '4"': dict(kg=9.9,  A=92.9,  B=110.4),
        '6"': dict(kg=21.0, A=127.0, B=133.3),
    },
}

# M p8. Bronze seated.
FIG600_THREADED = {
    '1"': dict(kg=1.7,  A=57.1,  B=90.4,  C=44.4),
    '2"': dict(kg=6.6,  A=88.9,  B=162.8, C=76.2),
    '3"': dict(kg=13.1, A=114.3, B=222.2, C=105.6),
    '4"': dict(kg=18.1, A=125.4, B=255.5, C=133.3),
}

# M p9
FIG602_THREADED = {
    '1"':     dict(kg=1.8,  A=57.1,  B=89.4,  C=44.4),
    '1-1/2"': dict(kg=4.0,  A=76.2,  B=123.9, C=65.0),
    '2"':     dict(kg=6.1,  A=88.9,  B=133.3, C=77.7),
    '3"':     dict(kg=9.7,  A=114.3, B=157.2, C=106.6),
    '4"':     dict(kg=15.4, A=125.4, B=208.0, C=134.6),
}

# M p10
FIG602_BUTTWELD = {
    'Sch 80': {
        '1"': dict(kg=1.3,  A=57.1,  B=82.5),
        '2"': dict(kg=5.7,  A=88.9,  B=118.8),
        '3"': dict(kg=10.0, A=114.3, B=124.4),
        '4"': dict(kg=13.2, A=125.4, B=133.8),
    },
    'Sch XXS': {
        '1"': dict(kg=1.8,  A=57.1,  B=89.6),
        '2"': dict(kg=6.6,  A=88.9,  B=127.5),
        '3"': dict(kg=11.0, A=114.3, B=135.8),
        '4"': dict(kg=15.2, A=125.4, B=147.0),
    },
}

# M p11. 5" and 6" carry a nut radius but no threaded weight, length or body
# diameter - the page says those two sizes are butt weld only, so the blanks
# are the book agreeing with its own prose.
FIG1002_THREADED = {
    '1"': dict(kg=1.8,  A=57.15, B=89.41, C=44.45),
    '2"': dict(kg=6.1,  A=88.90, B=133.4, C=77.72),
    '3"': dict(kg=9.8,  A=114.3, B=157.2, C=106.7),
    '4"': dict(kg=15.5, A=125.5, B=208.0, C=134.6),
}
FIG1002_BUTTWELD = {  # Sch XXS
    '1"': dict(kg=1.8,  A=57.15, B=89.66),
    '2"': dict(kg=6.6,  A=88.90, B=127.5),
    '3"': dict(kg=11.1, A=114.3, B=135.9),
    '4"': dict(kg=15.3, A=125.5, B=147.1),
    '5"': dict(kg=27.0, A=152.4, B=157.2),
    '6"': dict(kg=39.0, A=184.2, B=166.4),
}

# M p13. Misaligning.
FIG1003_THREADED = {
    '2"': dict(kg=5.60, A=88.90, B=120.1, C=76.20),
    '3"': dict(kg=19.5, A=124.0, B=231.6, C=113.0),
    '4"': dict(kg=35.6, A=152.4, B=279.4, C=139.7),
}
FIG1003_BUTTWELD = {  # Sch XXS
    '2"': dict(kg=6.00, A=88.90, B=120.1),
    '3"': dict(kg=20.1, A=124.0, B=231.6),
    '4"': dict(kg=36.9, A=152.4, B=279.4),
    '5"': dict(kg=36.4, A=152.4, B=278.1),
}

# M p14. The page's prose introduces Fig 1004 as butt weld ("has introduced
# two new sizes of Butt Weld Unions ... referred to as Fig. 1004"); its table
# is headed "Threaded". Founder decision 2026-08-25: publish butt weld, the
# prose. See CONFLICTS.
FIG1004_BUTTWELD = {
    '5"': dict(kg=38.60, A=152.4, B=209.6),
    '6"': dict(kg=63.60, A=184.2, B=238.3),
}

# M p15. 4", 5" and 6" are butt weld only; their threaded cells are blank.
FIG1502_THREADED = {
    '1"':     dict(kg=3.8,  A=68.58, B=110.7, C=55.12),
    '1-1/2"': dict(kg=7.5,  A=92.20, B=136.7, C=75.44),
    '2"':     dict(kg=8.4,  A=95.25, B=178.8, C=81.79),
    '3"':     dict(kg=14.1, A=116.1, B=193.8, C=114.3),
}
FIG1502_BUTTWELD = {  # Sch XXS
    '1"':     dict(kg=3.7,  A=68.58, B=110.7),
    '1-1/2"': dict(kg=7.5,  A=92.20, B=136.9),
    '2"':     dict(kg=9.5,  A=95.25, B=156.7),
    '3"':     dict(kg=13.0, A=116.1, B=133.4),
    '4"':     dict(kg=34.0, A=152.4, B=215.9),
    '5"':     dict(kg=43.0, A=165.1, B=228.6),
    '6"':     dict(kg=65.8, A=184.2, B=247.7),
}

# M p17 / p18. The 2002 and 2202 pages print identical dimension tables; they
# differ in pressure, service and anti-extrusion ring material only.
FIG2002_BUTTWELD = {
    '2"': dict(kg=10.43, A=95.25, B=188.0, weldPrepOd=63.50, weldPrepId=31.75),
    '3"': dict(kg=21.77, A=124.0, B=242.8, weldPrepOd=104.8, weldPrepId=52.32),
    '4"': dict(kg=34.47, A=152.4, B=215.9, weldPrepOd=139.7, weldPrepId=76.20),
    '5"': dict(kg=49.90, A=165.1, B=273.1, weldPrepOd=155.4, weldPrepId=101.6),
    '6"': dict(kg=77.11, A=184.2, B=330.2, weldPrepOd=196.9, weldPrepId=127.0),
}
FIG2202_BUTTWELD = FIG2002_BUTTWELD

# ── SPM-only figures ───────────────────────────────────────────────────────
# S p1-2. Marlia's book does not carry these three at all, so they get a size
# and a pressure and no dimensions - there is no drawing to read them off.
# Fig 400's large sizes are the reason this section exists: the SPM matrix
# marks 5", 6", 10" and 12" with *** and its note gives them CWP 500 psi,
# against 4,000 psi for the rest of the range.
FIG211_SIZES = {'2"': 2000, '3"': 2000}
FIG300_SIZES = {'1"': 2000, '2"': 2000}
FIG400_SIZES = {
    '2"': 4000, '3"': 4000, '4"': 4000,
    '5"': 500, '6"': 500, '10"': 500, '12"': 500,
}
FIG400_REDUCED = {'5"', '6"', '10"', '12"'}

# S p2 specification matrix. Test pressures, and the H2S column where the
# sheet publishes one. A figure absent from a column has no published rating
# in that service, which is not the same as being unavailable.
TEST_PSI_STANDARD = {
    100: 1500, 200: 3000, 206: 3000, 207: 3000, 211: 3000, 300: 3000,
    400: 6000, 600: 9000, 602: 9000, 1002: 15000, 1003: 12000, 1502: 22500,
}
TEST_PSI_SOUR = {602: 9000, 1002: 12000, 1003: 7500, 1502: 15000}
CWP_PSI_SOUR_SPM = {602: 6000, 1002: 7500, 1003: 5000, 1502: 10000}

# ── Recorded conflicts ─────────────────────────────────────────────────────
# Each of these is a place the sources disagree or contradict themselves. They
# are listed so the payload README can carry them and so nobody "tidies" one
# away later without knowing it was a decision.
CONFLICTS = [
    dict(
        id='fig1003-sour-psi-vs-bar',
        where='M p13, Fig 1003 sour gas service, 4" and 5"',
        problem='Prints "7.500 psi cwp (345 bar)". 345 bar is 5,000 psi, not 7,500 - the two '
                'halves of the same sentence disagree by 50%.',
        resolution='Published as 5,000 psi / 345 bar. The bar figure is corroborated by S p2, '
                   'which rates Fig 1003 H2S at CWP 5,000 psi / test 7,500 psi, and by the '
                   'S p2 note for sour-prepped 5" Fig 1003 B/W. The psi is the typo.',
        severity='safety',
    ),
    dict(
        id='fig1003-standard-cwp',
        where='M p13 vs S p2, Fig 1003 standard service',
        problem='M rates 2" and 3" at 10,000 psi and 4"/5" at 7,500 psi. S rates the whole '
                'figure at 7,500 psi standard. Same figure number, different manufacturers.',
        resolution="Published at M's per-size figures, because M is the supplier whose product "
                   'this is and its table is size-specific. Every Fig 1003 page carries a note '
                   'that other manufacturers publish the figure at a lower rating and that the '
                   'stamp on the union governs. FOUNDER REVIEW.',
        severity='safety',
    ),
    dict(
        id='fig400-reduced-sizes',
        where='S p2, Fig 400 at 5", 6", 10", 12"',
        problem='The matrix marks these four sizes *** and the note reduces them to CWP 500 psi '
                '/ test 4,000 psi, against 4,000 / 6,000 for 2"-4".',
        resolution='Published per size. This corrects a live page that advertised 12" Figure 400 '
                   'at 4,000 psi - an eightfold overstatement of a pressure rating.',
        severity='safety',
    ),
    dict(
        id='fig1004-end-type',
        where='M p14, Fig 1004',
        problem='The prose introduces Fig 1004 as butt weld twice and gives the reason (the 5" '
                'and 6" Fig 1002 O-ring unions must be made up perfectly square, so 1004 uses '
                'lip seals). The table above it is headed "Threaded".',
        resolution='Published butt weld. Founder decision, 2026-08-25. The header reads as a '
                   'copy of the Fig 1002 table on the facing page.',
        severity='spec',
    ),
    dict(
        id='fig200-8in-body-diameter',
        where='M p4, Fig 200 threaded, 8"',
        problem='Prints dia. body C = 142,8 mm. The 5" body on the same table is 162,0 and the '
                '8" body on the Fig 100 table is 242,8. A body cannot shrink as the line grows.',
        resolution='C dropped on that row only. The other three figures on the row are published. '
                   'Repairing it to 242,8 would be a guess.',
        severity='dimension',
    ),
    dict(
        id='fig50-weight-inversion',
        where='M p2, Fig 50',
        problem='The 4" union weighs 12,4 kg and the 5" weighs 9,90 kg, threaded; 11,7 and 9,30 '
                'socket weld. Both sizes invert.',
        resolution='Published as printed. Weight is not a pressure figure and the catalogue\'s own '
                   'standing note - "Where dimensions and weight are critical, please consult us" '
                   '- is carried on every page. Flagged to the supplier.',
        severity='weight',
    ),
    dict(
        id='fig100-material',
        where='M p3 vs S p1, Fig 100',
        problem='M: "manufactured from steel, not cast iron". S: "Tough, impact resistant ductile '
                'iron". The two manufacturers build the same figure differently.',
        resolution="M's wording is published, because M supplies ours. S is not quoted.",
        severity='spec',
    ),
    dict(
        id='fig200-10in',
        where='M p4 vs S p2, Fig 200 and 206',
        problem='S lists a 10" size; M\'s dimension table stops at 8".',
        resolution='Size table covers 1"-8", the sizes M gives dimensions for. The page does not '
                   'claim 10" and does not deny it.',
        severity='coverage',
    ),
    dict(
        id='fig600-sizes',
        where='M p8 vs S p2, Fig 600',
        problem='M tabulates 1", 2", 3", 4". S marks 1", 1.25", 1.5", 2", 4".',
        resolution="M's four sizes are published, with M's dimensions. Neither book covers the "
                   'union of the two.',
        severity='coverage',
    ),
]

# Figures our catalogue lists that NEITHER book covers. Their existing pages
# carry unsourced specifications, so they are set to draft rather than left
# live or quietly rewritten from knowledge.
UNSOURCED_FIGURES = {
    '40':  'IH-FI-HU-40-NPT-400-STD-INDUS',
    '201': 'IH-FI-HU-201-NPT-2K-STD-INDUS',
    '301': 'IH-FI-HU-301-NPT-3K-STD-INDUS',
    'AG':  'IH-FI-HU-AG-NPT-6K-STD-INDUS',
}
