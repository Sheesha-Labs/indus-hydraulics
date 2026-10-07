# Builds payload.json for the Sunpool size tables from website.json (the
# Sunpool catalogue page behind each listing) and pdfs.json (Sunpool's Storz,
# KC and UAC part-number lists). Prints every value it refuses, and why.
#
#   python3 build.py
#
# Rules, in one place:
#   - A size row exists only where Sunpool names the size: a per-size table or
#     size list on the listing's own page, or the part-number list that page
#     links. A page that gives only a range ("3/4"-4"") gets no rows — which
#     sizes inside a range are actually made is exactly what is not known.
#   - When Sunpool says two things, the narrower one wins. A size the page's
#     own range excludes is dropped, and so is a size only one of page and
#     part-number list carries where both cover the product.
#   - A value Sunpool prints two different ways is not published.
#   - Nothing is corrected. A broken row keeps its size and loses its values.
import json, os, re
from fractions import Fraction

HERE = os.path.dirname(os.path.abspath(__file__))
CHECKED = '7 October 2026'
WEB = json.load(open(os.path.join(HERE, 'website.json')))
PDF = json.load(open(os.path.join(HERE, 'pdfs.json')))
log = []

TOKEN = re.compile(r'(\d+-\d+/\d+|\d+/\d+|\d+(?:\.\d+)?)\s*"')


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def frac(tok):
    """'1-1/4', '3/4', '2.5', '4' (with or without the inch mark) -> Fraction."""
    tok = tok.strip().rstrip('"').strip()
    m = re.fullmatch(r'(\d+)-(\d+)/(\d+)', tok)
    if m: return int(m[1]) + Fraction(int(m[2]), int(m[3]))
    m = re.fullmatch(r'(\d+)/(\d+)', tok)
    if m: return Fraction(int(m[1]), int(m[2]))
    return Fraction(tok).limit_denominator(64)


def label(f):
    w = int(f); r = f - w
    if r == 0: return f'{w}"'
    return f'{r.numerator}/{r.denominator}"' if w == 0 else f'{w}-{r.numerator}/{r.denominator}"'


def code(f):
    return f'{round(float(f) * 100):03d}'


def mm(f):
    v = f * Fraction(254, 10)
    r = Fraction((v * 10 + Fraction(1, 2)).__floor__(), 10)
    return f'{float(r):.1f}'


def clean(s):
    """'32.80' -> '32.8', '100.00' -> '100'; anything else as printed."""
    return fmt(float(s)) if re.fullmatch(r'\d+\.\d+', s.strip()) else s.strip()


def words(n):
    return ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'][n] if n < 10 else str(n)


def plain(text):
    """Sunpool's range wording in our English: 'Casted Aluminum 1" to 6"' -> 'cast aluminium 1"–6"'."""
    t = text.replace('\n', '; ')
    for a, b in (('Casted Aluminum', 'cast aluminium'), ('Forged Aluminum', 'forged aluminium'), ('Brass/Gunmetal', 'brass or gunmetal'), ('Brass', 'brass')):
        t = t.replace(a, b)
    return re.sub(r'"\s*to\s*', '"–', t)


def num(s):
    return float(s) if re.fullmatch(r'\d+(\.\d+)?', s.strip()) else None


def fmt(x):
    return f'{x:g}'


def spans(cell):
    """One (prefix, lo, hi) per line of a range cell: 'Two Lugs: 1/4"-1"' -> ('Two Lugs', 1/4, 1)."""
    out = []
    for line in cell.split('\n'):
        toks = TOKEN.findall(line)
        if not toks: continue
        prefix = re.split(r'\s*\d', line, maxsplit=1)[0].strip(' :')
        out.append((prefix, frac(toks[0]), frac(toks[-1])))
    return out


def within(f, rng):
    return any(lo <= f <= hi for _, lo, hi in rng)


def field(sku, name):
    """A two-column 'Size' / 'Material' / 'Thread' row on the listing's page."""
    for t in WEB[sku]['tables']:
        for row in t:
            if len(row) == 2 and row[0] == name and row[1] != name: return row[1]
    return None


def table(sku, first):
    """The page table whose header row starts with `first`, header dropped."""
    for t in WEB[sku]['tables']:
        if t and t[0][0] == first and len(t[0]) > 2: return t
    return None


def pdf_page(name, title):
    return next(p for p in PDF[name]['pages'] if p['title'].startswith(title))


# Storz size -> inch label and lug distance (KA) as the part-number list prints them.
STORZ = {}
for p in PDF['storz']['pages']:
    for r in p['rows']:
        m = re.fullmatch(r'(.+?")\s*\((\w+)\)', r[0])
        STORZ.setdefault(m[2], {'inch': frac(m[1]), 'ka': int(r[1])})


def storz_n(s):
    return re.match(r'\d+', s)[0]


# ---------------------------------------------------------------- builders

def storz_tail(sku, materials, note=''):
    """Storz coupling with a hose tail: the page's lug table, cut to the page's material ranges."""
    rng = spans(field(sku, 'Size'))
    page = pdf_page('storz', 'Storz Coupling with Long Tail')
    pdf_rows = {re.search(r'\((\w+)\)', r[0])[1]: dict(zip(page['header'], r)) for r in page['rows']}
    rows = []
    for size, lug, hose in table(sku, 'Size')[1:]:
        s = STORZ.get(size)
        pdf_inch, web_inch = s['inch'], frac(TOKEN.findall(hose)[-1])
        if not within(pdf_inch, rng):
            log.append(f'range       {sku} Storz {size}: outside the page range {field(sku, "Size")!r} — dropped')
            continue
        inch = pdf_inch if pdf_inch == web_inch else None
        if inch is None:
            log.append(f'conflict    {sku} Storz {size}: hose size {label(web_inch)} on the page, {label(pdf_inch)} in the part-number list — not shown')
        ka = int(lug) if int(lug) == s['ka'] else None
        if ka is None:
            log.append(f'conflict    {sku} Storz {size}: lug distance {lug} mm on the page, {s["ka"]} mm in the part-number list — not shown')
        parts = []
        for mat, (col, lo, hi) in materials.items():
            pn = pdf_rows.get(size, {}).get(col)
            parts.append(esc(pn) if pn and pn != 'N/A' and lo <= pdf_inch <= hi else '—')
        rows.append({
            'code': storz_n(size), 'hoseInch': f'{label(inch)} (Storz {size})' if inch else f'Storz {size}',
            'cells': [label(inch) if inch else '—', esc(size), str(ka) if ka else '—', *parts],
        })
    head = ['Hose size', 'Storz size', 'Lug distance (mm)', *[f'Sunpool part no., {m}' for m in materials]]
    avail = note or join([f'{m.lower()} {label(lo)}–{label(hi)}' for m, (_, lo, hi) in materials.items()])
    intro = (f'Sunpool makes this coupling in {avail}. A Storz size is identified by its lug distance, the measurement across the two lugs,'
             ' which is what tells sizes with the same hose bore apart. Order by the Indus part number in the size table or by the Sunpool part'
             ' number for the material you need.')
    return rows, head, intro, ['page', 'storz']


def storz_thread(sku, end):
    """Storz adapter: one row per Storz size and thread size the page lists, cut to its range."""
    rng = spans(field(sku, 'Size'))
    rows, desc = [], []
    for size, lug, threads in table(sku, 'Size')[1:]:
        s = STORZ.get(size)
        if not within(s['inch'], rng):
            log.append(f'range       {sku} Storz {size}: outside the page range {field(sku, "Size")!r} — dropped')
            continue
        ka = int(lug) if int(lug) == s['ka'] else None
        if ka is None:
            log.append(f'conflict    {sku} Storz {size}: lug distance {lug} mm on the page, {s["ka"]} mm in the part-number list — not shown')
        ts = [frac(t) for t in TOKEN.findall(threads)]
        for t in ts:
            rows.append({'code': f'{storz_n(size)}-{code(t)}', 'portLabel': f'Storz {size}', 'port2Label': f'{label(t)} {end} thread', 'cells': None})
        desc.append([esc(size), str(ka) if ka else '—', ', '.join(label(t) for t in ts)])
    head = ['Storz size', 'Lug distance (mm)', f'{end.capitalize()} thread sizes']
    threads = 'NPT, BSP or NST' if 'NPT, BSP, or NST' in ' '.join(WEB[sku]['bullets']) else 'the thread you specify'
    intro = (f'Each Storz size is made with the {end} thread sizes below, in {threads}. Sunpool makes this adapter in'
             f' {plain(field(sku, "Size"))}. The size table lists every combination under its own Indus part number.')
    return rows, head, intro, ['page'], desc


def storz_lug(sku, pdf_col=None):
    """Three Storz sizes printed as '4"- Lug Distance: 115mm'."""
    page = pdf_page('storz', 'Storz Coupling with Short Tail')
    by_ka = {v['ka']: k for k, v in STORZ.items()}
    pdf_rows = {re.search(r'\((\w+)\)', r[0])[1]: dict(zip(page['header'], r)) for r in page['rows']}
    rows = []
    for size, ka in re.findall(r'(\S+")-?\s*Lug Distance:\s*(\d+)\s*mm', field(sku, 'Size')):
        st = by_ka[int(ka)]
        if STORZ[st]['inch'] != frac(size):
            log.append(f'conflict    {sku} {size}: lug distance {ka} mm is Storz {st}, which the part-number list calls {label(STORZ[st]["inch"])}')
        cells = [label(frac(size)), esc(st), ka]
        if pdf_col:
            pn = pdf_rows[st].get(pdf_col)
            cells.append(esc(pn) if pn and pn != 'N/A' else '—')
        rows.append({'code': storz_n(st), 'hoseInch': f'{label(frac(size))} (Storz {st})', 'cells': cells})
    head = ['Size', 'Storz size', 'Lug distance (mm)'] + (['Sunpool part no.'] if pdf_col else [])
    intro = 'Sunpool makes this part in three Storz sizes, identified by the lug distance across the two lugs.'
    if pdf_col: intro += ' Order by the Indus part number in the size table or by the Sunpool part number.'
    return rows, head, intro, ['page', 'storz'] if pdf_col else ['page']


def storz_pairs(sku, kind):
    """Lists such as '4" Storz x 4" F NPT' or '4" X 4.5"'."""
    cell = field(sku, 'Size')
    lugs = {label(frac(s)): ka for s, ka in re.findall(r'(\S+")-?\s*Lug Distance:\s*(\d+)\s*mm', cell)}
    rows, seen = [], set()
    for line in cell.split('\n'):
        if 'Lug Distance' in line: continue
        if kind == 'swivel':
            m = re.fullmatch(r'(\S+")\s*X\s*(\S+")', line.strip())
            a, b, thread = frac(m[1]), frac(m[2]), None
        else:
            m = re.fullmatch(r'(\S+")\s*Storz\s*[xX]\s*(?:30° Elbow\s*)?(\S+")\s*(?:F|Female)\s*(NPT|BSP)(?:\s*30 degree)?', line.strip())
            a, b, thread = frac(m[1]), frac(m[2]), m[3]
        key = (a, b, thread)
        if key in seen:
            log.append(f'duplicate   {sku} {line!r}: same Storz size, thread and end as an earlier line — one row')
            continue
        seen.add(key)
        end2 = f'{label(b)} female swivel thread' if kind == 'swivel' else f'{label(b)} female {thread}'
        rows.append({'code': f'{code(a)}-{code(b)}' + (f'-{thread}' if thread else ''), 'portLabel': f'{label(a)} Storz', 'port2Label': end2,
                     'cells': [f'{label(a)} Storz', esc(end2), lugs.get(label(a), '—')]})
    head = ['Storz end', 'Other end', 'Lug distance of the Storz end (mm)']
    intro = 'Sunpool lists this part in the combinations below.'
    if not lugs:
        head, rows = head[:2], [{**r, 'cells': r['cells'][:2]} for r in rows]
    return rows, head, intro, ['page']


def kc(sku, title, dims):
    """KC nipples, flanges and menders: the part-number list, cut to the page's sizes."""
    page = pdf_page('kc', title)
    pdf_rows = [dict(zip(page['header'], r)) for r in page['rows']]
    page_sizes, dim = None, {}
    if dims:
        t = table(sku, 'Size')
        for size, od, wall in t[1:]:
            f = frac(size)
            dim[f] = (od, wall)
        page_sizes = set(dim)
    rng = spans(field(sku, 'Size')) if field(sku, 'Size') else None
    rows = []
    for r in pdf_rows:
        f = frac(r['Size'])
        if page_sizes is not None and f not in page_sizes:
            log.append(f'one source  {sku} {label(f)}: in the part-number list but not in the page’s size table — dropped')
            continue
        if rng and not within(f, rng):
            log.append(f'range       {sku} {label(f)}: outside the page range — dropped')
            continue
        cells = [label(f)]
        if dims:
            od, wall = dim[f]
            cells += [clean(od), wall.replace('-', '–')]
        cells += [esc(r[c]) for c in ('CS Plated', 'SS304', 'SS316')]
        rows.append({'code': code(f), 'hoseInch': label(f), 'cells': cells})
    for f in sorted(page_sizes or []):
        if f not in {frac(r['Size']) for r in pdf_rows}:
            log.append(f'one source  {sku} {label(f)}: in the page’s size table but not in the part-number list — dropped')
    head = ['Size'] + (['O.D. (mm)', 'Wall thickness (mm)'] if dims else []) + ['Sunpool part no., carbon steel (plated)', 'SS304', 'SS316']
    intro = 'Order by the Indus part number in the size table or by the Sunpool part number for the material you need.'
    if 'NPT' in page['title']:
        intro += ' Sunpool part numbers ending -N are NPT; Sunpool changes the ending to -P for BSP, -T for BSPT and -NT for an unthreaded nipple.'
    if dims:
        intro += ' O.D. and wall thickness are Sunpool’s, for the nipple body.'
    return rows, head, intro, ['page', 'kc']


def uac(sku, pattern, end):
    page = pdf_page('uac', f'{pattern} Type')
    rng = spans(field(sku, 'Size'))
    lugs = {p: n for p, n in (('Two Lugs', 2), ('Four Lugs', 4))}
    rows = []
    for r in page['rows']:
        row = dict(zip(page['header'], r))
        f = frac(row['Size'])
        hit = [p for p, lo, hi in rng if lo <= f <= hi]
        if not hit:
            log.append(f'range       {sku} {label(f)}: in the part-number list ({row[end]}) but outside the page range {field(sku, "Size")!r} — dropped')
            continue
        n = sorted({lugs.get(p.split(' (')[0]) for p in hit} - {None})
        rows.append({'code': code(f), 'hoseInch': label(f), 'cells': [label(f), ' or '.join(map(str, n)) or '—', esc(row[end])]})
    head = ['Size', 'Lugs', 'Sunpool part no., carbon steel']
    finish = re.search(r'(White|Yellow) Zinc', page['title'])[0].lower()
    intro = f'Sunpool part numbers are for carbon steel with a {finish} finish.'
    if end != 'Hose End':
        thread = page['title'].rsplit(', ', 1)[-1]
        others = ' or '.join(f'-{c} for {t}' for c, t in (('N', 'NPT'), ('P', 'BSP'), ('T', 'BSPT')) if t != thread)
        intro += f' They end -{"N" if thread == "NPT" else "T"} for {thread}; Sunpool changes the ending to {others}.'
    intro += ' For 316 stainless steel, Sunpool replaces CS with S6.'
    return rows, head, intro, ['page', 'uac']


def size_list(sku, cell=None):
    """A plain list of sizes: '4", 5", 6", 8", & 10"' or '1-1/4" & 1-1/2"'."""
    cell = cell or field(sku, 'Size')
    rows = [{'code': code(frac(t)), 'hoseInch': label(frac(t)), 'cells': None} for t in TOKEN.findall(cell)]
    sizes = join([r['hoseInch'] for r in rows])
    return rows, None, f'Sunpool lists this part in one size, {sizes}.' if len(rows) == 1 else f'Sunpool lists this part in {sizes}.', ['page']


def reducers(sku, cell, limit):
    lo, hi = limit
    rows = []
    for a, b in re.findall(r'(\S+")\s*\*\s*(\S+")', cell):
        fa, fb = frac(a), frac(b)
        if not (lo <= fa <= hi and lo <= fb <= hi):
            log.append(f'range       {sku} {label(fa)} × {label(fb)}: outside the page range {label(lo)}–{label(hi)} — dropped')
            continue
        rows.append({'code': f'{code(fa)}-{code(fb)}', 'hoseInch': f'{label(fa)} × {label(fb)}', 'cells': None})
    return rows, None, f'Sunpool lists {words(len(rows))} reducing combinations, all in the size table.', ['page']


def join(xs):
    return xs[0] if len(xs) == 1 else ', '.join(xs[:-1]) + ' and ' + xs[-1]


def ferrule_kc(sku):
    rows = []
    for size, fid, wall, length in table(sku, 'Hose Size')[1:]:
        f = frac(size)
        rows.append({'code': code(f), 'hoseInch': label(f), 'cells': [label(f), clean(fid), clean(wall), clean(length)]})
    head = ['Hose size', 'Ferrule I.D. (mm)', 'Wall thickness (mm)', 'Length (mm)']
    return rows, head, 'Dimensions are Sunpool’s. Each nominal size is also made in other bores for other hose outside diameters — tell us the hose O.D.', ['page']


def ferrule_hd(sku):
    rows, count = [], {}
    t = table(sku, 'Size')[1:]
    for size, od, fid, length in t:
        f = frac(size)
        count[f] = count.get(f, 0) + 1
    seen = {}
    for size, od, fid, length in t:
        f = frac(size)
        seen[f] = seen.get(f, 0) + 1
        suffix = chr(64 + seen[f]) if count[f] > 1 else ''
        wall = (float(od) - float(fid)) / 2
        cells = [label(f), clean(od), clean(fid), clean(length)]
        if not 2 <= wall <= 10:
            log.append(f'bad row     {sku} {label(f)}: O.D. {od} mm and I.D. {fid} mm give a {wall:g} mm wall — row kept, values not shown')
            cells = [label(f), '—', '—', '—']
        rows.append({'code': code(f) + suffix, 'hoseInch': label(f), 'cells': cells})
    head = ['Size', 'O.D. (mm)', 'I.D. (mm)', 'Length (mm)']
    intro = ('Sunpool makes several ferrules at most sizes, one per hose outside diameter, so each has its own Indus part number:'
             ' pick the one whose I.D. clears your hose O.D. Dimensions are Sunpool’s.')
    return rows, head, intro, ['page']


def sleeve_kc(sku):
    rows = []
    t = next(t for t in WEB[sku]['tables'] if t[0] == ['Size', 'ID (mm)'])
    for size, ids in t[1:]:
        f = frac(size)
        vals = [frac(x) for x in TOKEN.findall(ids)]
        if '~' in ids and len(vals) == 2:
            shown = f'{label(vals[0])}–{label(vals[1])} ({mm(vals[0])}–{mm(vals[1])} mm)'
        else:
            shown = ', '.join(f'{label(v)} ({mm(v)} mm)' for v in vals)
        rows.append({'code': code(f), 'hoseInch': label(f), 'cells': [label(f), shown]})
    log.append(f'header      {sku}: the page heads the I.D. column "ID (mm)" but prints inches in 64ths — shown as inches, with millimetres')
    head = ['Size', 'Sleeve I.D. range']
    intro = 'Each size is made in several bores across the range shown, for different hose outside diameters — tell us the hose O.D.'
    return rows, head, intro, ['page']


def interlocking(sku):
    rows = []
    for typ, size, rng in table(sku, 'Type')[1:]:
        f = frac(size)
        toks = TOKEN.findall(rng)
        vals = [frac(x) for x in toks]
        ok = len(vals) == 2 and all(re.fullmatch(r'(\d+-)?\d+/(2|4|8|16|32|64)|\d+', x) for x in toks) and vals[0] < vals[1]
        if not ok:
            log.append(f'bad value   {sku} {typ}: range {rng!r} is not a valid low–high range — not shown')
        rows.append({'code': typ, 'hoseInch': label(f), 'cells': [esc(typ), label(f), f'{label(vals[0])}–{label(vals[1])}' if ok else '—']})
    head = ['Sunpool type', 'Hose size', 'Clamping range (hose O.D.)']
    assert WEB[sku]['bullets'] == ['CD to A10 are applied to air hose.', 'B4 to BU49 are applied to steam hose.'], WEB[sku]['bullets']
    intro = ('Each Sunpool type is listed with the hose size it is for and the range of hose outside diameters it closes on.'
             ' Types CD to A10 are for air hose; B4 to BU49 are for steam hose.')
    return rows, head, intro, ['page']


def grid_sizes(sku):
    t = next(t for t in WEB[sku]['tables'] if t and t[0][0] == 'Size' and all(c == 'Size' for c in t[0]))
    cols = len(t[0])
    out = []
    for c in range(cols):
        for r in t[1:]:
            v = r[c].strip() if c < len(r) else ''
            if v and v != '-': out.append(v)
    return out


def clamp_ranges(sku, unit='mm'):
    rows, seen = [], set()
    for v in grid_sizes(sku):
        if v in seen:
            log.append(f'duplicate   {sku} {v}: listed twice — one row')
            continue
        seen.add(v)
        lo, hi = v.split('-')
        rows.append({'code': f'{lo}-{hi}', 'hoseInch': f'{lo}–{hi} mm', 'cells': None})
    return rows, None, f'Sunpool sizes this clamp by the hose outside diameter it closes on, in millimetres: {len(rows)} sizes from {rows[0]["hoseInch"]} to {rows[-1]["hoseInch"]}.', ['page']


def clamp_bore(sku):
    rows = []
    for v in grid_sizes(sku):
        a, b = v.split('*')
        rows.append({'code': f'{a}X{b}', 'hoseInch': f'{a} × {b} mm', 'cells': None})
    return rows, None, 'Sunpool lists these sizes for the clamp, written as hose bore × wall thickness in millimetres.', ['page']


def no_rows(sku, head, cells, intro, sources):
    return [], head, intro, sources, cells


# ---------------------------------------------------------------- listings

AL_TAIL = {'Cast aluminium': ('Casted AL', Fraction(1), Fraction(6)), 'Forged aluminium': ('Forged AL', Fraction(2), Fraction(6))}

LISTINGS = {
    'IH-STZ-STORZ-COUPLING-LONG-SHANK': lambda s: storz_tail(s, AL_TAIL),
    'IH-STZ-STORZ-COUPLING-LONG-SHANK-2': lambda s: storz_tail(s, {'Brass': ('Brass', Fraction(3, 2), Fraction(5))}),
    'IH-STZ-STORZ-COUPLING-LONG-SHANK-3': lambda s: storz_tail(s, {'316 stainless steel': ('SS316', Fraction(3, 2), Fraction(5))},
                                                               '304 or 316 stainless steel, 1-1/2"–5"; its part-number list gives the 316 version'),
    'IH-STZ-STORZ-ADAPTER-FEMALE-THREAD': lambda s: storz_thread(s, 'female'),
    'IH-STZ-STORZ-ADAPTER-FEMALE-THREAD-2': lambda s: storz_thread(s, 'female'),
    'IH-STZ-STORZ-ADAPTER-FEMALE-THREAD-3': lambda s: storz_thread(s, 'female'),
    'IH-STZ-STORZ-ADAPTER-MALE-THREAD': lambda s: storz_thread(s, 'male'),
    'IH-STZ-STORZ-ADAPTER-MALE-THREAD-2': lambda s: storz_thread(s, 'male'),
    'IH-STZ-STORZ-ADAPTER-MALE-THREAD-3': lambda s: storz_thread(s, 'male'),
    'IH-STZ-STORZ-ADAPTER-X-MALE-THREAD': lambda s: storz_thread(s, 'male'),
    'IH-STZ-STORZ-COUPLING-WITH-SAFETY-LATCH': lambda s: storz_lug(s, 'Forged AL + Clamp & SS Latch'),
    'IH-STZ-STORZ-ADAPTER-WITH-SAFETY-LATCH-H-ANODIZ': storz_lug,
    'IH-STZ-STORZ-ADAPTER-WITH-SAFETY-LATCH-PAINTED': storz_lug,
    'IH-STZ-STORZ-ADAPTER-MALE-THREAD-PAINTED': storz_lug,
    'IH-STZ-STORZ-ADAPTER-MALE-THREAD-H-ANODIZED': storz_lug,
    'IH-STZ-STORZ-FDC-UL-LISTED-PAINTED': lambda s: storz_pairs(s, 'fdc'),
    'IH-STZ-STORZ-FDC-UL-LISTED-H-ANODIZED': lambda s: storz_pairs(s, 'fdc'),
    'IH-STZ-STORZ-30-DEG-FDC-UL-LISTED-PAINTED': lambda s: storz_pairs(s, 'fdc'),
    'IH-STZ-STORZ-30-DEG-FDC-UL-LISTED-H-ANODIZED': lambda s: storz_pairs(s, 'fdc'),
    'IH-STZ-STORZ-FIRE-DEPARTMENT-CONNECTION-30-ELBO': lambda s: storz_pairs(s, 'fdc'),
    'IH-STZ-STORZ-ADAPTER-X-SWIVEL-FEMALE-THREAD': lambda s: storz_pairs(s, 'swivel'),
    'IH-STZ-REDUCE-TYPE': lambda s: reducers(s, field(s, 'Size'), (Fraction(0), Fraction(99))),
    'IH-KC-KC-NIPPLE-2': lambda s: kc(s, 'KC Nipple, NPT', False),
    'IH-KC-KC-NIPPLE': lambda s: kc(s, 'KC Nipple For Crimping With Ferrule', True),
    'IH-KC-KC-X-TURNBACK-FLANGE': lambda s: kc(s, 'Turnback Flange KC', True),
    'IH-KC-KC-X-FIXED-FLANGE': lambda s: kc(s, '#150 Fixed Flange KC', True),
    'IH-KC-HOSE-MENDER': lambda s: kc(s, 'Hose Mender', False),
    'IH-KC-UMBILICAL-SLURRY-COUPLING-SET': size_list,
    'IH-KC-DRAG-HOSE-FITTING': size_list,
    'IH-KC-FRAC-WATER': size_list,
    'IH-KC-206-HOSE-HAMMER-UNION': lambda s: size_list(s, next(b for b in WEB[s]['bullets'] if b.startswith('Size:'))),
    'IH-CLP-SLEEVE-KC-CAMLOCK': sleeve_kc,
    'IH-CLP-FERRULE-KC-CAMLOCK': ferrule_kc,
    'IH-CLP-FERRULE-HD': ferrule_hd,
    'IH-CLP-SLEEVE-ALU': size_list,
    'IH-CLP-INTERLOCKING': interlocking,
    'IH-CLP-SINGLE-BOLT': clamp_ranges,
    'IH-CLP-DOUBLE-BOLT-SUPER': clamp_ranges,
    'IH-CLP-SAFETY-14420-3': clamp_bore,
    'IH-CLP-EN-14423': clamp_bore,
    'IH-CLP-DRAG-RING': size_list,
    'IH-CLP-DRAG-HOSE': size_list,
    'IH-CLP-SEGMENT-3-FRAC': size_list,
    'IH-UAC-US-HOSE': lambda s: uac(s, 'US', 'Hose End'),
    'IH-UAC-US-FEMALE': lambda s: uac(s, 'US', 'Female Thread'),
    'IH-UAC-US-MALE': lambda s: uac(s, 'US', 'Male Thread'),
    'IH-UAC-EU-HOSE': lambda s: uac(s, 'EU', 'Hose End'),
    'IH-UAC-EU-FEMALE': lambda s: uac(s, 'EU', 'Female Thread'),
    'IH-UAC-EU-MALE': lambda s: uac(s, 'EU', 'Male Thread'),
    'IH-UAC-AU-HOSE': lambda s: uac(s, 'AU', 'Hose End'),
    'IH-UAC-AU-FEMALE': lambda s: uac(s, 'AU', 'Female Thread'),
    'IH-UAC-AU-MALE': lambda s: uac(s, 'AU', 'Male Thread'),
    'IH-GST-COUPLING': size_list,
    'IH-GST-ADAPTER-FEMALE': size_list,
    'IH-GST-ADAPTER-MALE': size_list,
    'IH-GST-CAP': size_list,
    'IH-GUI-GUILLEMIN-ADAPTER-REDUCING-TYPE': lambda s: reducers(s, field(s, 'Material'), (frac(TOKEN.findall(field(s, 'Size'))[0]), frac(TOKEN.findall(field(s, 'Size'))[-1]))),
    'IH-COMP-SPIRAL-HOSE-TAIL-X-FLANGE': size_list,
    'IH-SB-HOSE-COUPLER': size_list,
    'IH-SB-NOZZLE-HOLDER': size_list,
    'IH-SB-FEMALE-THREAD-ADAPTER': size_list,
}


def whip(sku, end):
    page = pdf_page('uac', 'Safety Whip')
    cells = []
    for r in page['rows']:
        row = dict(zip(page['header'], r))
        m = re.fullmatch(r'(\S+")\s*\*\s*(\S+")\s*Length', row['Size'])
        cells.append([label(frac(m[1])), label(frac(m[2])), esc(row[f'CS {end}']), esc(row[f'SS304 {end}'])])
    head = ['Cable diameter', 'Length', 'Sunpool part no., carbon steel', 'SS304']
    return no_rows(sku, head, cells, 'Sunpool makes this whip check in the cable sizes and lengths below.', ['page', 'uac'])


DESCRIPTION_ONLY = {
    'IH-UAC-WHIP-HOSE-HOSE': lambda s: whip(s, 'Hose to Hose'),
    'IH-UAC-WHIP-HOSE-TOOL': lambda s: whip(s, 'Hose to Tool'),
    'IH-CLP-DOUBLE-BOLT': lambda s: no_rows(s, None, None, f'Sunpool lists this clamp in {len(grid_sizes(s))} sizes: {join(grid_sizes(s))}.', ['page']),
}

# The older listings (Storz, KC, Guillemin, composite, sandblast) carry a
# generic, family-wide "Size range" that contradicts Sunpool. Each one is
# replaced by what Sunpool states for that product, in the description and in
# the "What sizes are available?" FAQ.
SIZE_RANGE = {
    'IH-STZ-3-SEGMENT-CLAMP-FOR-STORZ': '3"–6"',
    'IH-STZ-ALFOT-FORGED-STORZ-HEAD': '3"–6"',
    'IH-STZ-REDUCE-TYPE': '3" × 2" and 3" × 2-1/2"',
    'IH-STZ-STORZ-30-DEG-FDC-UL-LISTED-H-ANODIZED': '4" or 5" Storz × 4" female NPT',
    'IH-STZ-STORZ-30-DEG-FDC-UL-LISTED-PAINTED': '4" or 5" Storz × 4" female NPT',
    'IH-STZ-STORZ-ADAPTER-FEMALE-THREAD': '1"–6"',
    'IH-STZ-STORZ-ADAPTER-FEMALE-THREAD-2': '1-1/2"–6"',
    'IH-STZ-STORZ-ADAPTER-FEMALE-THREAD-3': '1-1/2"–5"',
    'IH-STZ-STORZ-ADAPTER-MALE-THREAD': '1"–6"',
    'IH-STZ-STORZ-ADAPTER-MALE-THREAD-2': '1"–6"',
    'IH-STZ-STORZ-ADAPTER-MALE-THREAD-3': '1-1/2"–5"',
    'IH-STZ-STORZ-ADAPTER-MALE-THREAD-H-ANODIZED': '4", 5" and 6"',
    'IH-STZ-STORZ-ADAPTER-MALE-THREAD-PAINTED': '4", 5" and 6"',
    'IH-STZ-STORZ-ADAPTER-WITH-SAFETY-LATCH-H-ANODIZ': '4", 5" and 6"',
    'IH-STZ-STORZ-ADAPTER-WITH-SAFETY-LATCH-PAINTED': '4", 5" and 6"',
    'IH-STZ-STORZ-ADAPTER-X-MALE-THREAD': 'Cast and forged aluminium 1"–6"; brass and gunmetal 1-1/2"–4"',
    'IH-STZ-STORZ-ADAPTER-X-SWIVEL-FEMALE-THREAD': '4", 5" and 6" Storz × 4"–6" female thread',
    'IH-STZ-STORZ-COUPLING-LONG-SHANK': 'Cast aluminium 1"–6"; forged aluminium 2"–6"',
    'IH-STZ-STORZ-COUPLING-LONG-SHANK-2': '1-1/2"–5"',
    'IH-STZ-STORZ-COUPLING-LONG-SHANK-3': '1-1/2"–5"',
    'IH-STZ-STORZ-COUPLING-WITH-SAFETY-LATCH': '4", 5" and 6"',
    'IH-STZ-STORZ-FDC-UL-LISTED-H-ANODIZED': '4" or 5" Storz × 4" female NPT or BSP; 5" Storz × 5" female BSP',
    'IH-STZ-STORZ-FDC-UL-LISTED-PAINTED': '4" or 5" Storz × 4" female NPT or BSP; 5" Storz × 5" female BSP',
    'IH-STZ-STORZ-FIRE-DEPARTMENT-CONNECTION-30-ELBO': '4" or 5" Storz × 4" female NPT',
    'IH-STZ-STORZ-PRESSURE-GASKET-BLACK': '1"–12"',
    'IH-STZ-STORZ-SUCTION-GASKET-GRAY': '1"–12"',
    'IH-KC-206-HOSE-HAMMER-UNION': '4"',
    'IH-KC-DRAG-HOSE-FITTING': '4", 5", 6", 8" and 10"',
    'IH-KC-FRAC-WATER': '8", 10", 12", 14" and 16"',
    'IH-KC-GROOVE-KC-NIPPLE': '1/2"–12"',
    'IH-KC-HOSE-MENDER': '1/2"–12"',
    'IH-KC-KC-NIPPLE': '2"–12"',
    'IH-KC-KC-NIPPLE-2': '1/2"–12"',
    'IH-KC-KC-X-FIXED-FLANGE': '2"–12"',
    'IH-KC-KC-X-TURNBACK-FLANGE': '2"–12"',
    'IH-KC-SUCTION-HOSE': '1-1/2"–4"',
    'IH-KC-SUCTION-HOSE-2': '1-1/2"–4"',
    'IH-KC-SUCTION-HOSE-3': '1-1/2"–6"',
    'IH-KC-UMBILICAL-SLURRY-COUPLING-SET': '4", 5", 6", 8" and 10"',
    **{sku: '3/4"–4"' for sku in WEB if sku.startswith('IH-GUI-')},
    **{sku: '1"–4"' for sku in WEB if sku.startswith('IH-COMP-') and sku != 'IH-COMP-SPIRAL-HOSE-TAIL-X-FLANGE'},
    'IH-COMP-SPIRAL-HOSE-TAIL-X-FLANGE': '2"',
    'IH-SB-FEMALE-THREAD-ADAPTER': '1-1/4" and 1-1/2"',
    'IH-SB-HOSE-COUPLER': '1-1/4" and 1-1/2"',
    'IH-SB-NOZZLE-HOLDER': '1-1/4" and 1-1/2"',
}

# Family paragraphs (and the FAQ that repeats them) state a size span that is
# wrong for the family: Storz 25 is 1", not 1-1/2"; KC runs 1/2"-16"; Sunpool's
# Guillemin is 3/4"-4". The sentence is dropped — each listing states its own.
EDITS = {
    'IH-STZ-': [('Sizes Storz 25–150 (1-1/2"–6"). ', '')],
    'IH-KC-': [('Sizes 1"–6". ', '')],
    'IH-GUI-': [('; sizes 25–150 mm', '')],
}

GENERIC_RANGE = '1", 1-1/2", 2", 2-1/2", 3", 4", 5", 6"'
SPECS = {
    'IH-KC-KC-NIPPLE': [('Size Range', GENERIC_RANGE, '2"–12"')],
    'IH-KC-KC-X-FIXED-FLANGE': [('Size Range', GENERIC_RANGE, '2"–12"')],
    'IH-KC-KC-X-TURNBACK-FLANGE': [('Size Range', GENERIC_RANGE, '2"–12"')],
    'IH-KC-206-HOSE-HAMMER-UNION': [('Size Range', GENERIC_RANGE, '4"')],
}

SOURCE_NAMES = {'storz': 'Storz', 'kc': 'KC', 'uac': 'universal coupling'}


def block(sku, head, cells, intro, sources):
    files = [s for s in sources if s != 'page']
    parts = join(['Sizes'] + (['dimensions'] if head and any('(mm)' in h or 'I.D.' in h for h in head) else []) + (['part numbers'] if files else []))
    src = f'{parts} from Sunpool’s catalogue page for this part' + (f' and its {SOURCE_NAMES[files[0]]} part-number list' if files else '') + f', checked {CHECKED}.'
    html = '<!-- sunpool-sizes:start --><h3>Sunpool sizes</h3>'
    html += f'<p>{esc(intro)}</p>'
    if head and cells:
        html += ('<div class="ih-table-scroll"><table><thead><tr>' + ''.join(f'<th>{esc(h)}</th>' for h in head) + '</tr></thead><tbody>'
                 + ''.join('<tr>' + ''.join(f'<td>{c}</td>' for c in row) + '</tr>' for row in cells) + '</tbody></table></div>')
    html += f'<p class="source-note">{esc(src)}</p><!-- sunpool-sizes:end -->'
    return html


def build():
    payload = {}
    for sku in sorted(WEB):
        entry = {'variants': [], 'tableHtml': None, 'sizeRange': SIZE_RANGE.get(sku), 'edits': [], 'specs': [],
                 'alignToSpecs': sku in SIZE_RANGE, 'source': WEB[sku]['url']}
        for prefix, edits in EDITS.items():
            if sku.startswith(prefix): entry['edits'] += [{'find': f, 'replace': r} for f, r in edits]
        entry['specs'] = [{'label': l, 'from': a, 'to': b} for l, a, b in SPECS.get(sku, [])]
        if sku in LISTINGS:
            out = LISTINGS[sku](sku)
            rows, head, intro, sources = out[:4]
            cells = out[4] if len(out) > 4 else [r['cells'] for r in rows if r.get('cells')]
            entry['variants'] = [{
                'partNumber': f'{sku}-{r["code"]}', 'position': i, 'hoseInch': r.get('hoseInch'),
                'portLabel': r.get('portLabel'), 'port2Label': r.get('port2Label'),
            } for i, r in enumerate(rows)]
            entry['tableHtml'] = block(sku, head, cells, intro, sources)
        elif sku in DESCRIPTION_ONLY:
            _, head, intro, sources, cells = DESCRIPTION_ONLY[sku](sku)
            entry['tableHtml'] = block(sku, head, cells, intro, sources)
        if entry['variants'] or entry['tableHtml'] or entry['sizeRange'] or entry['edits'] or entry['specs']:
            payload[sku] = entry
    return payload


if __name__ == '__main__':
    payload = build()
    json.dump(payload, open(os.path.join(HERE, 'payload.json'), 'w'), indent=1, ensure_ascii=False)
    for line in log: print(line)
    rows = sum(len(v['variants']) for v in payload.values())
    print(f'\n{len(payload)} listings; {sum(1 for v in payload.values() if v["variants"])} with size rows ({rows} rows); '
          f'{sum(1 for v in payload.values() if v["tableHtml"])} description tables; {sum(1 for v in payload.values() if v["sizeRange"])} size ranges corrected')
