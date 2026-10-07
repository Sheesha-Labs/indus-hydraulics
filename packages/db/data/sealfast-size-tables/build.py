"""
Builds size tables for the 88 Sealfast coupling listings.

Inputs, committed beside this script:
  website-families.json  Every item row (item number, size, material, style) on
                         the products.sealfast.com family pages our listings
                         map to, read on 2026-10-06 by scrape_website.py.
  datasheets.json        The dimension tables of the 35 Sealfast datasheets
                         those families link, parsed from the PDF text layer by
                         parse_datasheets.py with hidden text removed (several
                         sheets carry blanked-out duplicate values). The PDFs
                         are Seal Fast Inc.'s and are not committed; the
                         products link them.

Output: payload.json, applied by
src/imports/2026-10-06-sealfast-size-tables/run.ts.

What each listing gets:
  - one size-table row per size Sealfast sells in any of the listing's
    materials, under an Indus part number `<SKU>-<size code>`;
  - dimensions in mm where the listing's datasheet gives them and they pass
    the checks below; the drawing letters are Sealfast's own;
  - a "Sealfast part numbers" table in the description: every size by
    material, with the datasheet's working pressure where it has one.

What is deliberately left out:
  - W. On the couplers it is the width across the cam arms and on Type F the
    overall body width; the size table's W column means a spanner size.
  - Letters the size table does not carry (D5–D9, H1, W1, W2, T1–T3, PCD).
  - Pressures as a size-table column: it stores whole bar, and 25 psi would
    print as 2 bar. They go in the description table in psi and bar.
  - Values that fail a cross-check or that Sealfast's own sheet gets wrong
    (DROP and the automatic checks below). A row loses the bad value, not
    its size or part number.

Run: python3 build.py   (prints every dropped value and anomaly; writes payload.json)
"""
import json, re, sys
from pathlib import Path

HERE = Path(__file__).parent
FAMS = json.load(open(HERE / 'website-families.json'))
SHEETS = json.load(open(HERE / 'datasheets.json'))
ASSET = 'https://products.sealfast.com/Asset/'
CHECKED = '6 October 2026'

# ── Sizes ─────────────────────────────────────────────────────────────────────

CODE = {'1/8': '018', '3/16': '019', '1/4': '025', '5/16': '031', '3/8': '038', '1/2': '050', '5/8': '058', '3/4': '075', '1': '100', '1-1/4': '125', '1-1/2': '150', '2': '200',
        '2-1/2': '250', '3': '300', '4': '400', '5': '500', '6': '600', '8': '800', '10': '1000', '12': '1200'}
BY_CODE = {v: k for k, v in CODE.items()}
SHORT = {'05': '1/2', '07': '3/4', '075': '3/4', '10': '1', '12': '1-1/4', '15': '1-1/2', '20': '2', '25': '2-1/2',
         '30': '3', '40': '4', '50': '5', '60': '6', '80': '8'}


def inches(s):
    a, _, b = s.partition('-')
    whole, frac = (a, b) if b else (('0', a) if '/' in a else (a, '0/1'))
    n, d = frac.split('/')
    return float(whole) + float(n) / float(d)


def parse_size(text):
    """'1 1/4 in', '1/2” x 3/4”', '3“ X 2“', '11/2” NPT' → ['1-1/4'] / ['1/2', '3/4']."""
    if not text:
        return None
    t = text
    for a, b in (('“', '"'), ('”', '"'), ('″', '"'), ('Inch (in)', ''), ('in.', ''), ('NPT', ''), ('NTP', '')):
        t = t.replace(a, b)
    t = re.sub(r'\bin\b', '', t)
    t = re.sub(r'\bX\b', 'x', t)
    out = []
    for p in re.split(r'\s+x\s+', t.strip()):
        p = p.strip(' "')
        if not p:
            continue
        p = re.sub(r'^(\d+)\s+(\d+/\d+)$', r'\1-\2', p)
        p = {'11/2': '1-1/2', '21/2': '2-1/2'}.get(p, p)  # how two sheets print 1-1/2 and 2-1/2
        if p not in CODE:
            return None
        out.append(p)
    if len(out) == 2 and out[0] == out[1]:
        out = out[:1]  # a 3/4 x 3/4 spool is one size
    return out or None


def decode_part(part):
    """Size from a Sealfast part number, for families whose pages print no size: A300SS90, AR 2030SS, DR2015SS."""
    m = re.match(r'^[A-Z]+\s?(\d{3,5})', part)
    if not m:
        return None
    digits = m.group(1)
    if digits in BY_CODE:
        return [BY_CODE[digits]]
    if digits == '05075':
        return ['1/2', '3/4']
    if len(digits) == 4 and digits[:2] in SHORT and digits[2:] in SHORT:
        return [SHORT[digits[:2]], SHORT[digits[2:]]]
    return None


def body(part):
    return 'NAE' if 'NAE' in part else 'PTK' if 'PTK' in part else ''


def size_code(size, bod=''):
    return '-'.join(CODE[s] for s in size) + (f'-{bod}' if bod else '')


def size_label(size, bod=''):
    return ' × '.join(f'{s}"' for s in size) + (f' {bod}' if bod else '')


# ── Website items ─────────────────────────────────────────────────────────────

MATERIAL_ORDER = ['Aluminum', '356-T6 Premium Aluminum', 'Aluminum PTFE', 'Aluminum Viton', 'Brass',
                  '316 Stainless Steel', '304 Stainless Steel', 'Plated Iron', 'Zinc Plated Steel', 'Polypropylene', 'Ny-Glass']


def cell(header, row, name):
    if name not in header:
        return ''
    i = header.index(name)
    if i >= len(row):
        return ''
    v = re.sub(r'^(?:%s)\s+N/A\s*' % re.escape(name), '', row[i])
    v = re.sub(r'\s*/(?:Asset|ImgCustom)/\S+', '', v).strip()
    return '' if v in ('N/A', name + ' N/A') else v


MATERIAL_WORDS = ((r'356-T6', '356-T6 Premium Aluminum'), (r'Aluminum PTFE|PTFE.*Aluminum|Aluminum.*PTFE|FEP', 'Aluminum PTFE'),
                  (r'Viton|FKM', 'Aluminum Viton'), (r'\b304\b', '304 Stainless Steel'), (r'\b316\b|Stainless', '316 Stainless Steel'),
                  (r'Aluminum', 'Aluminum'), (r'Brass', 'Brass'), (r'Polypropylene', 'Polypropylene'), (r'Ny-Glass', 'Ny-Glass'),
                  (r'Iron', 'Plated Iron'), (r'Steel', 'Zinc Plated Steel'))


def material_in(text):
    """The material a Sealfast name states. The page's own Material column is
    wrong on some families (every aluminium, brass and Ny-Glass dust plug says
    316 stainless), so the item name and the family title outrank it."""
    for pat, mat in MATERIAL_WORDS:
        if re.search(pat, text or ''):
            return mat
    return None


SKIP_ITEM = re.compile(r'Gasket|Handle|Safety Clip|O-Ring', re.I)


def items_of(family, keep=None):
    f = FAMS[family]
    h = f['header'] or []
    title = re.sub(r'\s+On Seal Fast.*$', '', f['title'])
    out = []
    for r in f['items']:
        part = re.sub(r'\s*/\S+.*$', '', r[0]).strip()
        part = ' '.join(dict.fromkeys(part.split()))  # single-item pages print the number twice
        name = re.sub(r'^N/A\s*', '', cell(h, r, 'Item Name'))
        if SKIP_ITEM.search(name) and not (keep and keep.search(name)):
            continue
        mat = material_in(name) or material_in(title) or material_in(cell(h, r, 'Material')) or 'Other'
        raw = cell(h, r, 'Size') or cell(h, r, 'Hose Size') or cell(h, r, 'Connection')
        conn = cell(h, r, 'Connection')
        if conn and re.search(r'Female|Male', conn):
            m = re.findall(r'([\d\s/-]+)\s*in\.', conn)
            raw = ' x '.join(x.strip() for x in m) if len(m) == 2 else raw
        named = re.match(r'^(?:Aluminum\s+|Brass\s+|316 Stainless Steel\s+)?([\d\s/xX"-]+?)\s*Inch \(in\)', name)
        size = parse_size(raw) or (parse_size(named.group(1)) if named else None) or decode_part(part)
        out.append({'part': part, 'name': name, 'material': mat, 'size': size, 'raw': raw, 'body': body(part),
                    'pressure': cell(h, r, 'Working Pressure') or cell(h, r, 'Working Pressure at 70 Degree Fahrenheit (ºF) Temperature'),
                    'family': family, 'title': title})
    return out


# ── Listings → families and datasheet ─────────────────────────────────────────

def fams(*prefixes, exclude=()):
    keys = [k for k in FAMS if any(k.startswith(p) for p in prefixes)]
    return [k for k in keys if not any(x in k for x in exclude)]


PORTS = ('type-sa/type-sa--', 'type-dd-1/type-dd--', 'type-da-1/type-da--')  # the "-1/-2/-3" gauge-port versions
LISTINGS = {
    'IH-CGC-STD-A': (fams('type-a/'), '1-Type A-AL_1.pdf'),
    'IH-CGC-STD-B': (fams('type-b/'), '8-Type B-AL_new.pdf'),
    'IH-CGC-STD-C': (fams('type-c/'), '15-Type C-AL-new_1.pdf'),
    'IH-CGC-STD-D': (fams('type-d/', exclude=('kuri',)), '22-Type D-AL-new.pdf'),
    'IH-CGC-STD-E': (fams('type-e/'), '29-Type E-AL-new.pdf'),
    'IH-CGC-STD-F': (fams('type-f/'), '36-Type F-AL-new.pdf'),
    'IH-CGC-STD-DC': (fams('type-dc/'), '43-Type DC-AL.pdf'),
    'IH-CGC-STD-DP': (fams('type-dp/'), '50-Type DP-AL.pdf'),
    'IH-CGC-CT-C': (fams('type-c-1/'), '1_Crimptek-Type C_ALC.pdf'),
    'IH-CGC-CT-E': (fams('type-e-1/'), '4_Crimptek-Type E_ALC.pdf'),
    'IH-CGC-SL-B': (fams('type-b-1/'), 'Specs_Selflocking-TypeB_ALSK.pdf'),
    'IH-CGC-SL-C': (fams('type-c-2/'), None),
    'IH-CGC-SL-D': (fams('type-d-1/'), None),
    'IH-CGC-SL-DA': (fams('type-da/'), None),
    'IH-CGC-SL-DC': (fams('type-dc-1/nless-steel'), None),
    'IH-CGC-SL-DD': (fams('type-dd/'), None),
    'IH-CGC-90-A': (fams('type-a-1/'), None),
    'IH-CGC-90-B': (fams('type-b-2/'), None),
    'IH-CGC-90-C': (fams('type-c-3/'), None),
    'IH-CGC-90-D': (fams('type-d-2/'), None),
    'IH-CGC-90-E': (fams('type-e-2/'), None),
    'IH-CGC-90-F': (fams('type-f-1/'), None),
    'IH-CGC-90-DA': (fams('type-90-da/'), '19_Elbow-TypeDA_AL.pdf'),
    'IH-CGC-90-DD': (fams('type-90-dd/'), '23_Elbow-TypeDD_AL.pdf'),
    'IH-CGC-45-DA': (fams('type-45-da/'), None),
    'IH-SPC-AR': (fams('type-ar/'), '1_Specs-CAT1_CamLock-Specialty_26_AR-AL.pdf'),
    'IH-SPC-AW': (fams('type-aw/'), '1_Specs-CAT1_CamLock-Specialty_1_AW-AL.pdf'),
    'IH-SPC-BLN': (fams('type-bln/'), '1_Specs-CAT1_CamLock-Specialty_30_BLN-AL.pdf'),
    'IH-SPC-BR': (fams('type-br/'), '1_Specs-CAT1_CamLock-Specialty_28_BR-AL.pdf'),
    'IH-SPC-CR': (fams('type-cr/', exclude=('oupler-x-shank',)), 'CamLock-Specialty_Type CR-AL_v2_1.pdf'),
    'IH-SPC-DA-RED': (fams('type-da-1/', exclude=PORTS), '1_Specs-CAT1_CamLock-Specialty_22_DA-AL.pdf'),
    'IH-SPC-DCL': (fams('type-dc-2/brass', 'type-dc-2/316'), '1_Specs-CAT1_CamLock-Specialty_12_DCL-IBR.pdf'),
    'IH-SPC-DD-SPOOL': (fams('type-dd-1/', exclude=PORTS), '1_Specs-CAT1_CamLock-Specialty_18_DD-AL.pdf'),
    'IH-SPC-DR': (fams('type-dr/'), '1_Specs-CAT1_CamLock-Specialty_36_DR-AL.pdf'),
    'IH-SPC-DW': (fams('type-dw/'), '1_Specs-CAT1_CamLock-Specialty_4_DW-SSI.pdf'),
    'IH-SPC-ER': (fams('type-er/'), '1_Specs-CAT1_CamLock-Specialty_38_ER-AL.pdf'),
    'IH-SPC-FA-150': (fams('type-fa/'), '1_Specs-CAT1_CamLock-Specialty_5_FA-AL.pdf'),
    'IH-SPC-FC-150': (fams('type-fc/316'), None),
    'IH-SPC-SA': (fams('type-sa/', exclude=PORTS), '1_Specs-CAT1_CamLock-Specialty_14_SA-AL.pdf'),
    'IH-SPC-TR-BSP': (fams('threaded/316-stainless-male-npt'), '1_Specs-CAT1_CamLock-Specialty_44_302BN_1.pdf'),
    'IH-SPC-TR-NPSM': (fams('threaded/316-stainless-steel-thread'), None),
    'IH-SPC-TR-NPT': (fams('threaded/aluminum-female-npt', 'threaded/brass-male-npt'), '1_Specs-CAT1_CamLock-Specialty_47_6540AL.pdf'),
    'IH-BC-FLANGE-FEMALE': (fams('flanged/zinc-plated-steel-female'), 'Bauer Type_FLF_1.pdf'),
    'IH-BC-FLANGE-MALE': (fams('flanged/zinc-plated-steel-male'), 'Bauer Type_FLM_1.pdf'),
    'IH-BC-FLANGE-SET': (fams('flanged/zinc-plated-steel-flanged-coupling'), 'Bauer Type_FLF.pdf'),
    'IH-BC-FLANGE-MALE-SET': (fams('male-threaded/zinc-flanged-bauer'), None),
    'IH-BC-LEVER-RING': (fams('hose-shank/zinc-plated-steel-lever-rings'), None),
    'IH-BC-MALE-FEMALE': (fams('male-threaded/zinc-plated-steel-male-threaded-female'), None),
    'IH-BC-MALE-MALE': (fams('male-threaded/zinc-plated-steel-male-threaded-male'), None),
    'IH-BC-SHANK-COMPLETE': (fams('hose-shank/zinc-steel-hose-shank-bauer'), None),
    'IH-BC-SHANK-FEMALE': (fams('hose-shank/zinc-plated-steel-hose-shank-bauer-type-female'), None),
    'IH-BC-SHANK-MALE': (fams('hose-shank/zinc-plated-steel-hose-shank-bauer-type-male'), None),
    'IH-RL-HOSE-SHANK-FEMALE': (fams('ring-lock/zinc-plated-steel-hose-shank-female'), None),
    'IH-RL-HOSE-SHANK-FEMALE-X-MALE-COUPLING-COMPLE': (fams('ring-lock/hose-shank-female-x-male'), None),
    'IH-RL-HOSE-SHANK-MALE': (fams('ring-lock/zinc-plated-steel-hose-shank-male'), None),
    'IH-RL-LEVER-RINGS': (fams('ring-lock/zinc-plated-steel-lever-rings'), None),
    'IH-GJ-UNIVERSAL-CLAMPS': (fams('universal-clamps/'), None),
    'IH-GJ-GROUND-JOINT-COMPLETE-SET': (fams('set/plated-iron-ground-joint'), None),
    'IH-GJ-GROUND-JOINT-HOSE-STEM': (fams('hose-stem/'), None),
    'IH-GJ-GROUND-JOINT-WING-NUT': (fams('swivel-nut-/'), None),
    'IH-GJ-GROUND-JOINT-FEMALE-SPUD': (fams('female-spud/'), None),
    'IH-GJ-GROUND-JOINT-NPT-MALE-STEM': (fams('male-stem/'), None),
    'IH-GJ-GROUND-JOINT-MALE-SPUD': (fams('male-spud/'), None),
    'IH-GJ-GROUND-JOINT-DOUBLE-SPUD': (fams('double-spud/'), None),
    'IH-DDC-ADAPTER-PTFE': (fams('male-ptfe-seat/aluminum'), None),
    'IH-DDC-ADAPTER-VITON': (fams('male-viton-seat/aluminum'), None),
    'IH-DDC-COUPLER-PTFE': (fams('ptfe-seat/aluminum'), None),
    'IH-DDC-COUPLER-VITON': (fams('viton-seat/aluminum'), None),
    'IH-PLS-SHANK-COUPLING-COMPLETE-SET-BRASS-NUT': (fams('aluminum-shank/aluminum-shank-coupling-complete'), None),
    'IH-PLS-SHANK-FEMALE-COUPLING-WITH-BRASS-NUT': (fams('aluminum-shank/aluminum-shank-female'), None),
    'IH-PLS-SHANK-MALE': (fams('aluminum-shank/aluminum-shank-male'), None),
    'IH-HN-MALE-NPT-X-HOSE-BARB-HOSE-NIPPLE': (fams('hose-nipples/zinc-plated'), None),
    'IH-SHK-LONG-SHANK-FEMALE-HOSE-NIPPLE': (fams('steel/steel-long-shank-female'), None),
    'IH-SHK-LONG-SHANK-HOSE-NIPPLE-COMPLETE-SET': (fams('steel/steel-long-shank-hose-nipple-complete'), None),
    'IH-SHK-LONG-SHANK-MALE-HOSE-NIPPLE': (fams('steel/steel-long-shank-male'), None),
    'IH-SHK-SHORT-SHANK-FEMALE-HOSE-NIPPLE': (fams('brass-/brass-short-shank-female'), None),
    'IH-SHK-SHORT-SHANK-MALE-HOSE-NIPPLE': (fams('brass-/brass-short-shank-male'), None),
    'IH-MND-HOSE-MENDERS': (fams('brass-mender/'), None),
    'IH-SB-HOSE-END-WITH-CROWFOOT': (fams('hose-end-with-crowfoot/aluminum'), None),
    'IH-SB-NPSH-THREADED-HOSE-END-NOZZLE-HOLDERS': (fams('hose-end-with-nozzle-holder/aluminum'), None),
    'IH-SB-1-1-4-TO-1-1-2-INCH-IN-PIPE-THREAD-SIZE': (fams('female-npt-with-crowfoot/1-1-4-to-1-1-2-inch--in--size-aluminum'), None),
    'IH-CRW-HOSE-END-CROWFOOT': (fams('hose-end-/316'), None),
    'IH-CRW-FEMALE-NPT-HOSE-END-CROWFOOT': (fams('female-npt/316'), None),
    'IH-CRW-MALE-NPT-HOSE-END-CROWFOOT': (fams('male-npt/316'), None),
    'IH-CRW-FOUR-LUG-HOSE-END-CROWFOOT': (fams('four-lug-hose-end/'), None),
    'IH-CRW-FOUR-LUG-FEMALE-NPT-CROWFOOT': (fams('four-lug-female-npt/'), None),
    'IH-CRW-BLANK-END-CROWFOOT': (fams('blank-end/316'), None),
    'IH-CRW-TRIPLE-CONNECTION-CROWFOOT': (fams('triple-connection-/316'), None),
}

UNIVERSAL = ('IH-CRW-BLANK-END-CROWFOOT', 'IH-CRW-TRIPLE-CONNECTION-CROWFOOT')
# Lever rings are the product on these pages, not an accessory to skip.
KEEP = {'IH-BC-LEVER-RING': re.compile(r'Lever Ring', re.I), 'IH-RL-LEVER-RINGS': re.compile(r'Lever Ring', re.I)}

# ── Datasheets ────────────────────────────────────────────────────────────────

LETTERS = {'A', 'B', 'C', 'D', 'D1', 'D2', 'D3', 'D4', 'E', 'F', 'H', 'L', 'L1', 'L2', 'L3', 'L4', 'L5', 'L6'}
SHEET_MATERIAL = {'AL': 'aluminium', 'ALC': 'aluminium', 'ALSK': 'aluminium', 'IBR': 'brass', 'BR': 'brass', 'SS': '316 stainless steel',
                  'SSI': '316 stainless steel', 'FLF': 'zinc-plated steel', 'FLM': 'zinc-plated steel', '6540AL': 'aluminium', '302BN': '316 stainless steel'}

# Byte sizes of the datasheets as downloaded on 2026-10-06, for the media rows that link them.
DATASHEET_BYTES = {
    '1-Type A-AL_1.pdf': 614447,
    '15-Type C-AL-new_1.pdf': 634878,
    '19_Elbow-TypeDA_AL.pdf': 586357,
    '1_Crimptek-Type C_ALC.pdf': 579515,
    '1_Specs-CAT1_CamLock-Specialty_12_DCL-IBR.pdf': 583453,
    '1_Specs-CAT1_CamLock-Specialty_14_SA-AL.pdf': 587714,
    '1_Specs-CAT1_CamLock-Specialty_18_DD-AL.pdf': 596525,
    '1_Specs-CAT1_CamLock-Specialty_1_AW-AL.pdf': 1065544,
    '1_Specs-CAT1_CamLock-Specialty_22_DA-AL.pdf': 583677,
    '1_Specs-CAT1_CamLock-Specialty_26_AR-AL.pdf': 581384,
    '1_Specs-CAT1_CamLock-Specialty_28_BR-AL.pdf': 582265,
    '1_Specs-CAT1_CamLock-Specialty_30_BLN-AL.pdf': 582566,
    '1_Specs-CAT1_CamLock-Specialty_36_DR-AL.pdf': 590596,
    '1_Specs-CAT1_CamLock-Specialty_38_ER-AL.pdf': 582623,
    '1_Specs-CAT1_CamLock-Specialty_44_302BN_1.pdf': 584425,
    '1_Specs-CAT1_CamLock-Specialty_47_6540AL.pdf': 583988,
    '1_Specs-CAT1_CamLock-Specialty_4_DW-SSI.pdf': 598683,
    '1_Specs-CAT1_CamLock-Specialty_5_FA-AL.pdf': 578115,
    '22-Type D-AL-new.pdf': 631583,
    '23_Elbow-TypeDD_AL.pdf': 580848,
    '29-Type E-AL-new.pdf': 613521,
    '36-Type F-AL-new.pdf': 624938,
    '43-Type DC-AL.pdf': 263586,
    '4_Crimptek-Type E_ALC.pdf': 577119,
    '50-Type DP-AL.pdf': 260945,
    '5_Specs-CAT1_CamLock_RingLock_v2_8.pdf': 950495,
    '8-Type B-AL_new.pdf': 631633,
    'Bauer Type_FLF.pdf': 558874,
    'Bauer Type_FLF_1.pdf': 558874,
    'Bauer Type_FLM_1.pdf': 557601,
    'CamLock-Specialty_Type CR-AL_v2_1.pdf': 599200,
    'Clamps-Two Bolt - Zinc_1.pdf': 623321,
    'Elbow-TypeC - SS.pdf': 561867,
    'Specs-CAT1_CamLock_Elbow-TypeD-316SS.pdf': 8019897,
    'Specs_Selflocking-TypeB_ALSK.pdf': 571860,
}

# Values Sealfast's own sheets get wrong, found by the checks below or by
# reading the sheet against its sibling sheets. Keyed by Sealfast part number.
DROP = {
    '22-Type D-AL-new.pdf': {
        'D1000IAL': (['D1', 'D2'], 'D1 and D2 are transposed (D2 > D1), unlike every other size and Type DC'),
        'D1200IAL': (['D1', 'D2'], 'D1 and D2 are transposed (D2 > D1), unlike every other size and Type DC'),
    },
    '15-Type C-AL-new_1.pdf': {'C1000IAL': (['D1'], 'printed 12.158 in; Types D and DC give 13.268 in for the 10" head')},
    '29-Type E-AL-new.pdf': {'E1200IAL': (['D3'], 'shank printed 10.131 in; Type C\'s 12" shank is 12.131 in')},
    '50-Type DP-AL.pdf': {
        'DP125IAL': (['D1'], 'printed 2.791 in; the 1-1/4" adapter is 1.791 in (Type A, and D3 on this row)'),
        'DP500IAL': (['D2'], 'D2 printed above D1'), 'DP600IAL': (['D2'], 'D2 printed equal to D1'),
        'DP800IALNAE': (['D2'], 'D2 printed equal to D1'), 'DP800IALPTK': (['D2'], 'D2 printed equal to D1'),
    },
    '1_Specs-CAT1_CamLock-Specialty_30_BLN-AL.pdf': {'BLN800ALNAE': (['D1', 'D2', 'H'], 'the 3" row\'s values repeated on the 8" NAE row')},
    '1_Specs-CAT1_CamLock-Specialty_38_ER-AL.pdf': {'ER2030AL': (['D1'], 'printed 3.484 in; the 2" adapter is 2.484 in on every other ER row')},
    '1_Specs-CAT1_CamLock-Specialty_4_DW-SSI.pdf': {'DW 600SSI': (['D1', 'D2', 'D3', 'D4', 'H'], 'the 6" row carries 1" values')},
    '1_Specs-CAT1_CamLock-Specialty_18_DD-AL.pdf': {'DD5040AL': (['D1', 'D2', 'D3', 'D4', 'H'], 'the 5" x 4" row carries the 2" row\'s values')},
}
# Sheets too damaged to publish dimensions from: values blanked out, rows
# repeated or out of step with their sizes. Rows still get part numbers.
NO_DIMS = {
    '1_Specs-CAT1_CamLock-Specialty_14_SA-AL.pdf': 'most cells blanked; the rest are rounded to 0.1 in and inconsistent',
    '1_Specs-CAT1_CamLock-Specialty_26_AR-AL.pdf': 'rows repeat and columns change meaning between rows',
    '1_Specs-CAT1_CamLock-Specialty_12_DCL-IBR.pdf': 'the 4" row carries 2" values and the part numbers are out of step with the sizes',
    '1_Specs-CAT1_CamLock-Specialty_36_DR-AL.pdf': 'columns misaligned in the text layer',
    '23_Elbow-TypeDD_AL.pdf': 'every row carries a Type DA part number',
    '1_Specs-CAT1_CamLock-Specialty_44_302BN_1.pdf': 'the sheet is for Female NPSM x Male NPT, not the BSP listing it is attached to',
    '1_Specs-CAT1_CamLock-Specialty_47_6540AL.pdf': 'columns misaligned in the text layer',
    '1_Specs-CAT1_CamLock-Specialty_1_AW-AL.pdf': 'D1 is the same 0.394 in on every size; the columns do not read as diameters',
}
# A typo Sealfast prints, corrected because its own size column and part
# number say otherwise.
PORT_FIX = {('22-Type D-AL-new.pdf', 'D250IAL'): ('2-1/4" NPT', '2-1/2" NPT')}

# Interface references: every coupler head and every adapter of a size share
# these diameters, whatever the body. Type C and Type A define them.
def ref_table(sheet, cols):
    out = {}
    for r in SHEETS[sheet]['rows']:
        s = parse_size(r.get('Size'))
        if s and len(s) == 1 and all(c in r for c in cols) and not body(r.get('PART', '')):
            out[s[0]] = tuple(float(r[c]) for c in cols)
    return out


COUPLER = {k: v for k, v in ref_table('15-Type C-AL-new_1.pdf', ('D1', 'D2')).items() if k != '10'}
ADAPTER = ref_table('1-Type A-AL_1.pdf', ('D',))
# sheet → [(columns, reference, which end of a reducer)]
CHECKS = {
    '8-Type B-AL_new.pdf': [(('D1', 'D2'), COUPLER, 0)], '22-Type D-AL-new.pdf': [(('D1', 'D2'), COUPLER, 0)],
    '43-Type DC-AL.pdf': [(('D1', 'D2'), COUPLER, 0)], '1_Crimptek-Type C_ALC.pdf': [(('D1', 'D2'), COUPLER, 0)],
    'Specs_Selflocking-TypeB_ALSK.pdf': [(('D1', 'D2'), COUPLER, 0)], '19_Elbow-TypeDA_AL.pdf': [(('D1', 'D2'), COUPLER, 0)],
    '1_Specs-CAT1_CamLock-Specialty_28_BR-AL.pdf': [(('D1', 'D2'), COUPLER, 0)],
    '1_Specs-CAT1_CamLock-Specialty_30_BLN-AL.pdf': [(('D1', 'D2'), COUPLER, 0)],
    'CamLock-Specialty_Type CR-AL_v2_1.pdf': [(('D1', 'D2'), COUPLER, 0)],
    '1_Specs-CAT1_CamLock-Specialty_22_DA-AL.pdf': [(('D1', 'D2'), COUPLER, 0), (('D3',), ADAPTER, 1)],
    '1_Specs-CAT1_CamLock-Specialty_18_DD-AL.pdf': [(('D1', 'D2'), COUPLER, 0)],
    '1_Specs-CAT1_CamLock-Specialty_4_DW-SSI.pdf': [(('D2',), {k: (v[1],) for k, v in COUPLER.items()}, 0)],
    '29-Type E-AL-new.pdf': [(('D1',), ADAPTER, 0)], '36-Type F-AL-new.pdf': [(('D2',), ADAPTER, 0)],
    '50-Type DP-AL.pdf': [(('D1',), ADAPTER, 0)], '1_Specs-CAT1_CamLock-Specialty_38_ER-AL.pdf': [(('D1',), ADAPTER, 0)],
    '1_Specs-CAT1_CamLock-Specialty_5_FA-AL.pdf': [(('D1',), ADAPTER, 0)],
}
TOLERANCE = 0.02

log = []


def sheet_rows(sheet):
    """Rows of a datasheet keyed by size code, with mm dimensions and a port label."""
    if not sheet or sheet in NO_DIMS:
        return {}, None
    data = SHEETS.get(sheet)
    if not data:
        raise SystemExit(f'unknown datasheet {sheet}')
    out, psi = {}, {}
    # A column that prints a thread on most rows is a thread column; a number in it is a shifted row.
    threads = {c for c in data['columns'] if sum(bool(re.search(r'N[PT]{2}', r.get(c, ''))) for r in data['rows']) * 2 > len(data['rows'])}
    for r in data['rows']:
        part = r.get('PART', '').strip()
        size = parse_size(r.get('Size', ''))
        if not size or not part:
            continue
        drop, why = DROP.get(sheet, {}).get(part, ([], ''))
        dims, port = {}, None
        for col, val in r.items():
            if re.search(r'N[PT]{2}', val or ''):
                port = re.sub(r'\s+', ' ', val.replace('“', '"').replace('”', '"').replace('NTP', 'NPT')).strip()
                port = re.sub(r'^(\d+)(\d/\d)"', lambda m: f'{m.group(1)}-{m.group(2)}"' if m.group(1) in ('1', '2') and m.group(2) == '1/2' else m.group(0), port)
                fix = PORT_FIX.get((sheet, part))
                if fix and port == fix[0]:
                    log.append(f'port fixed  {sheet} {part}: {fix[0]} -> {fix[1]}')
                    port = fix[1]
                continue
            if col not in LETTERS or not re.fullmatch(r'\d+(\.\d+)?', val or ''):
                continue
            if col in threads:
                log.append(f'shifted     {sheet} {part} {col}={val}: a number in the thread column — row dropped')
                dims, drop = {}, list(LETTERS)
                break
            if col in drop:
                log.append(f'dropped     {sheet} {part} {col}={val}: {why}')
                continue
            dims[col] = float(val)
        for cols, ref, end in CHECKS.get(sheet, []):
            if size == ['1/2', '3/4']:
                end = 1
            if end >= len(size) or size[end] not in ref:
                continue
            want = ref[size[end]]
            bad = [(c, dims[c], w) for c, w in zip(cols, want) if c in dims and abs(dims[c] - w) / w > TOLERANCE]
            if bad:
                # A row that fails the interface check is usually a copied row, so none of it is trusted.
                log.append(f'cross-check {sheet} {part} ' + ', '.join(f'{c}={v} vs {w}' for c, v, w in bad) + f' for {size[end]}" — row dropped')
                dims = {}
                break
        key = size_code(size, body(part))
        out[key] = {'dims': {k: round(v * 25.4, 1) for k, v in dims.items()}, 'port': port, 'part': part}
        if r.get('PSI', '').isdigit():
            psi[key] = int(r['PSI'])
    return out, psi


# ── Build ─────────────────────────────────────────────────────────────────────

def bar(psi):
    return f'{psi * 0.0689476:.1f}'.rstrip('0').rstrip('.')


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def table_html(sku, rows, materials, psi, sheet, dims_material, has_dims, bodies):
    head = ['Size'] + (['Working pressure'] if psi else []) + materials
    lines = []
    for code, r in rows:
        cells = [esc(r['label'])]
        if psi:
            p = psi.get(code)
            cells.append('Not for pressure' if p == 0 else f'{p} psi ({bar(p)} bar)' if p else '—')
        for m in materials:
            parts = r['parts'].get(m, [])
            cells.append(esc(' / '.join(parts)) if parts else '—')
        lines.append('<tr>' + ''.join(f'<td>{c}</td>' for c in cells) + '</tr>')
    intro = 'Order by the Sealfast part number for the material you need, or by the Indus part number in the size table.'
    if has_dims:
        intro += (f' Dimensions in the size table are Sealfast’s, for the {dims_material} body, converted to millimetres and lettered as on the'
                  ' Sealfast datasheet linked on this page. Other materials share the coupling interface but can differ in body length and'
                  ' diameter — ask for the drawing of the material you are ordering.')
    if bodies:
        intro += ' The NAE and PTK 8″ bodies do not interchange.'
    pressure = ''
    if psi:
        pressure = f' Working pressures are for the {dims_material} body and fall with size.'
    src = f'Part numbers from Seal Fast, Inc.’s catalogue at products.sealfast.com{", with dimensions and pressures from its datasheet" if sheet and (has_dims or psi) else ""}, checked {CHECKED}.'
    return ('<!-- sealfast-sizes:start -->'
            '<h3>Sealfast part numbers</h3>'
            f'<p>{esc(intro)}{esc(pressure)}</p>'
            '<div class="ih-table-scroll"><table><thead><tr>' + ''.join(f'<th>{esc(h)}</th>' for h in head) + '</tr></thead>'
            '<tbody>' + ''.join(lines) + '</tbody></table></div>'
            f'<p class="source-note">{esc(src)}</p>'
            '<!-- sealfast-sizes:end -->')


def build():
    payload, problems = {}, []
    for sku, (families, sheet) in LISTINGS.items():
        if not families:
            problems.append(f'{sku}: no Sealfast family matched')
            continue
        items = [it for f in families for it in items_of(f, KEEP.get(sku))]
        sized = [it for it in items if it['size']]
        for it in items:
            if not it['size'] and sku != 'IH-GJ-UNIVERSAL-CLAMPS' and sku not in UNIVERSAL:
                log.append(f'no size     {sku} {it["part"]} ({it["raw"] or it["name"][:60]})')
        rows = {}
        if sku == 'IH-GJ-UNIVERSAL-CLAMPS':
            # Clamps are sold by the hose outside diameter they close on.
            for it in items:
                rng = re.sub(r'\s*in$', '"', it['raw'].replace(' to ', '"–'))
                code = it['part'].upper()
                rows[code] = {'label': rng, 'parts': {it['material']: [it['part']]}, 'order': len(rows), 'hoseInch': None}
        else:
            for it in sized:
                code = size_code(it['size'], it['body'])
                r = rows.setdefault(code, {'label': size_label(it['size'], it['body']), 'parts': {}, 'order': (inches(it['size'][0]), inches(it['size'][-1]), it['body']),
                                           'hoseInch': size_label(it['size'], it['body'])})
                r['parts'].setdefault(it['material'], [])
                if it['part'] not in r['parts'][it['material']]:
                    r['parts'][it['material']].append(it['part'])
        for it in items:
            if not it['size'] and sku in UNIVERSAL:
                rows[it['part']] = {'label': 'Universal head', 'parts': {it['material']: [it['part']]}, 'order': (0, 0, ''), 'hoseInch': None}
        ordered = sorted(rows.items(), key=lambda kv: kv[1]['order'])
        dims_rows, psi = sheet_rows(sheet)
        sheet_mat = SHEET_MATERIAL.get(re.sub(r'(_\d+|_new|-new|_v\d.*)$', '', (sheet or '').rsplit('.', 1)[0]).split('-')[-1].split('_')[-1].replace('Type ', ''), 'aluminium')
        materials = [m for m in MATERIAL_ORDER if any(m in r['parts'] for _, r in ordered)] + \
                    sorted({m for _, r in ordered for m in r['parts'] if m not in MATERIAL_ORDER})
        web_psi = {size_code(it['size'], it['body']): int(re.sub(r'\D', '', it['pressure'])) for it in sized if re.search(r'\d', it['pressure'] or '')}
        psi = psi or web_psi
        variants, has_dims = [], False
        for pos, (code, r) in enumerate(ordered):
            d = dims_rows.get(code, {}) if dims_rows else {}
            v = {'partNumber': f'{sku}-{code}', 'position': pos, 'hoseInch': r['hoseInch'], 'portLabel': d.get('port'), 'dimensions': d.get('dims') or None}
            has_dims = has_dims or bool(v['dimensions'])
            variants.append(v)
        unmatched = [k for k in (dims_rows or {}) if k not in rows]
        for k in unmatched:
            log.append(f'sheet only  {sku} {sheet}: {k} ({dims_rows[k]["part"]}) is on the datasheet but not on the website — not added')
        bodies = any(r['label'].endswith(('NAE', 'PTK')) for _, r in ordered)
        payload[sku] = {
            'variants': [v for v in variants if v['hoseInch']] if sku not in UNIVERSAL else [],
            'tableHtml': table_html(sku, ordered, materials, psi, sheet, sheet_mat, has_dims, bodies),
            'datasheet': {'file': sheet, 'url': ASSET + sheet.replace(' ', '%20'), 'bytes': DATASHEET_BYTES[sheet], 'title': f'Technical Data Sheet — {SHEETS_TITLE.get(sheet) or titles(families)[0]}'} if sheet and (has_dims or psi) else None,
            'families': families,
        }
    return payload, problems


def titles(families):
    return [re.sub(r'\s+On Seal Fast.*$', '', FAMS[f]['title']) for f in families]


SHEETS_TITLE = {}
for sku, (families, sheet) in LISTINGS.items():
    if sheet:
        for f in families:
            if any(a.endswith(sheet.replace(' ', '%20')) or a.endswith(sheet) for a in FAMS[f].get('assets', [])):
                SHEETS_TITLE[sheet] = re.sub(r'\s+On Seal Fast.*$', '', FAMS[f]['title'])
                break

if __name__ == '__main__':
    payload, problems = build()
    for line in log:
        print(line)
    for p in problems:
        print('PROBLEM', p)
    total = sum(len(v['variants']) for v in payload.values())
    with_dims = sum(1 for v in payload.values() for x in v['variants'] if x['dimensions'])
    print(f'\n{len(payload)} listings, {total} size rows, {with_dims} with dimensions, '
          f'{sum(1 for v in payload.values() if v["datasheet"])} with a datasheet')
    json.dump(payload, open(HERE / 'payload.json', 'w'), indent=1, ensure_ascii=False)
    sys.exit(1 if problems else 0)
