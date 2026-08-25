#!/usr/bin/env python3
"""
Build the hammer union payload from the transcribed catalogue tables.

Emits packages/db/data/hammer-unions/listings.json plus a README recording
what was not published and why.
"""
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from hu_sources import (  # noqa: E402
    PSI_TO_BAR, DERIVED_BAR, SIZE_TOKEN, CONFLICTS, UNSOURCED_FIGURES,
    TEST_PSI_STANDARD, TEST_PSI_SOUR,
    FIG50, FIG100_THREADED, FIG200_THREADED, FIG200_BUTTWELD,
    FIG206_THREADED, FIG206_BUTTWELD, FIG207, FIG600_THREADED,
    FIG602_THREADED, FIG602_BUTTWELD, FIG1002_THREADED, FIG1002_BUTTWELD,
    FIG1003_THREADED, FIG1003_BUTTWELD, FIG1004_BUTTWELD,
    FIG1502_THREADED, FIG1502_BUTTWELD, FIG2002_BUTTWELD, FIG2202_BUTTWELD,
    FIG211_SIZES, FIG300_SIZES, FIG400_SIZES, FIG400_REDUCED,
)
from hu_prose import FIG_PROSE, CONSULT_NOTE, SOUR_NOTE  # noqa: E402

# The payload sits beside this script, so the build is reproducible from a
# clone rather than from the worktree it was first written in.
OUT = Path(__file__).parent

CAT_STD = 'hammer-unions-standard-service'
CAT_SOUR = 'hammer-unions-sour-gas-service'
TEMPLATE = 'hammer-union-spec'

SIZE_ORDER = ['1"', '1-1/4"', '1-1/2"', '2"', '2-1/2"', '3"', '4"', '5"', '6"',
              '8"', '10"', '12"']


def bar(psi):
    return PSI_TO_BAR[psi]


def bar_txt(psi):
    return f'{PSI_TO_BAR[psi]:,}'


def psi_txt(psi):
    return f'{psi:,}'


def size_sort(label):
    return SIZE_ORDER.index(label)


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


# ── End-type vocabulary ────────────────────────────────────────────────────
# `portLabel` has to read as a pipe end so the size table heads its column
# "End connection" rather than guessing "Flange size" off a bare inch value.
def port_label(size, end, schedule=None):
    if end == 'threaded':
        return f'{size} LP thread'
    if end == 'socket_weld':
        return f'{size} socket weld'
    return f'{size} butt weld, {schedule}' if schedule else f'{size} butt weld'


def part_no(fig, end_code, svc, size):
    return f'IH-HU-{fig}-{end_code}-{svc}-{SIZE_TOKEN[size]}'


def variant(fig, end_code, svc, size, end, row, psi, schedule=None, pos=0):
    dims = {k: v for k, v in row.items() if k != 'kg'}
    v = {
        'partNumber': part_no(fig, end_code, svc, size),
        'position': pos,
        'hoseDash': None,
        'hoseInch': size,
        'hoseDn': None,
        'portLabel': port_label(size, end, schedule),
        'portDash': None,
        'weightG': int(round(row['kg'] * 1000)) if row.get('kg') is not None else None,
        'pressureBar': bar(psi),
        'dimensions': dims,
        'sourcePart': f'Fig {fig} {size} {end}' + (f' {schedule}' if schedule else ''),
    }
    return v


def build_variants(spec):
    """spec: list of (table, end, end_code, schedule, psi_fn) blocks."""
    out = []
    pos = 0
    for table, end, end_code, schedule, psi_fn in spec:
        for size in sorted(table.keys(), key=size_sort):
            out.append(variant(spec_fig[0], end_code, spec_svc[0], size, end,
                               table[size], psi_fn(size), schedule, pos))
            pos += 1
    return out


# module-level cells so build_variants can see the current figure/service
spec_fig = ['']
spec_svc = ['']


def flat(psi):
    return lambda _size: psi


def banded(bands, default):
    """bands: {size: psi}; anything else takes `default`."""
    return lambda size: bands.get(size, default)


# ── Copy ───────────────────────────────────────────────────────────────────
def compose(fig, svc, ends_txt, variants, psi_summary, extra_sections=None):
    p = FIG_PROSE[fig]
    parts = [f'<p>{esc(p["summary"])}</p>']

    parts.append('<h3>Construction and sealing</h3>\n<ul>')
    for f in p['features']:
        parts.append(f'<li>{esc(f)}</li>')
    if p.get('seal'):
        parts.append(f'<li>Sealing: {esc(p["seal"])}</li>')
    if p.get('material'):
        parts.append(f'<li>Material: {esc(p["material"])}</li>')
    if p.get('seat'):
        parts.append(f'<li>Seat: {esc(p["seat"])}</li>')
    parts.append('</ul>')

    parts.append('<h3>Working pressure</h3>')
    parts.append(f'<p>{esc(psi_summary)}</p>')
    if p.get('caution'):
        parts.append(f'<p><strong>{esc(p["caution"])}</strong></p>')
    if svc == 'sour':
        parts.append(f'<p>{esc(SOUR_NOTE)}</p>')

    for s in (extra_sections or []):
        parts.append(s)

    sizes = sorted({v['hoseInch'] for v in variants}, key=size_sort)
    rng = sizes[0] if len(sizes) == 1 else f'{sizes[0]} to {sizes[-1]}'
    parts.append('<h3>Sizes and part numbers</h3>')
    parts.append(
        f'<p>Published in {esc(rng)} with {esc(ends_txt)}. Every orderable size, its weight, its '
        f'dimensions and its working pressure are in the size table on this page. '
        f'{esc(CONSULT_NOTE)}</p>'
    )
    return '\n'.join(parts)


def faqs_for(fig, svc, variants, psi_list):
    p = FIG_PROSE[fig]
    sizes = sorted({v['hoseInch'] for v in variants}, key=size_sort)
    out = []
    lo, hi = min(psi_list), max(psi_list)
    if lo == hi:
        wp = (f'Figure {fig} is rated {psi_txt(hi)} psi ({bar(hi)} bar) cold working pressure in '
              f'{"sour gas" if svc == "sour" else "standard"} service.')
    else:
        wp = (f'It varies with size. In {"sour gas" if svc == "sour" else "standard"} service the '
              f'range runs from {psi_txt(hi)} psi ({bar(hi)} bar) down to {psi_txt(lo)} psi '
              f'({bar(lo)} bar) on the largest sizes. The size table on this page states the '
              f'rating for every size — read it before you specify.')
    out.append(dict(question=f'What is the working pressure of a Figure {fig} hammer union?',
                    answer=wp))
    out.append(dict(question=f'What sizes does the Figure {fig} come in?',
                    answer=f'We publish {", ".join(sizes)}. Sizes outside that list are a question '
                           f'for us rather than a no — send the line specification with your '
                           f'enquiry and we will confirm what the mill builds.'))
    if p.get('seal'):
        out.append(dict(question=f'How does a Figure {fig} union seal?',
                        answer=p['seal'] + ' The wing nut is hammer-tightened; the seal is made by '
                                           'the seat, not by the thread.'))
    if svc == 'sour':
        out.append(dict(
            question=f'Is the Figure {fig} suitable for H2S service?',
            answer='This listing is the sour gas service version. It is supplied in H2S trim and, '
                   'where the source publishes a separate H2S rating, it is rated below the '
                   'standard service union of the same figure number. Tell us the certification '
                   'you need on your enquiry.'))
    else:
        out.append(dict(
            question=f'Is there a sour gas version of the Figure {fig}?',
            answer=('Yes — see the sour gas service listing for this figure. It is rated '
                    'separately.') if fig in SOUR_FIGURES else
                   ('Our catalogue sources publish no separate H2S rating for the Figure '
                    f'{fig}. If your line is sour, ask us and we will take it to the mill rather '
                    'than assume a rating.')))
    if p.get('interchange'):
        out.append(dict(question=f'Will a Figure {fig} mate with another maker’s Figure {fig}?',
                        answer=p['interchange'] + ' Hammer union figure numbers are an industry '
                                                  'series, so a union of the same figure and size '
                                                  'from a different maker mates. The pressure '
                                                  'rating stamped on the union is what governs, '
                                                  'not the figure number alone.'))
    out.append(dict(question='What is included in a hammer union?',
                    answer='A hammer union is supplied as a set: a male sub, a female sub and the '
                           'wing nut that draws them together. Tell us if you need subs on their '
                           'own — a worn seal or a damaged seat is usually a sub replacement, not '
                           'a whole union.'))
    return out


SOUR_FIGURES = {'602', '1002', '1003', '1004', '1502', '2202'}


def pressure_line(psi, fig, svc):
    t = (TEST_PSI_SOUR if svc == 'sour' else TEST_PSI_STANDARD).get(int(fig)) if fig.isdigit() else None
    s = f'{psi_txt(psi)} psi ({bar_txt(psi)} bar) cold working pressure'
    if t:
        s += f', tested at {psi_txt(t)} psi'
    if psi in DERIVED_BAR:
        s += '. The bar figure is converted; the source prints psi only'
    return s + '.'


# ── The listings ───────────────────────────────────────────────────────────
# `reuse` names the live SKU this page replaces. Where the new slug differs
# from the live one the importer renames and records a 301 — the page keeps
# its link equity and stops describing a product it is not.
L = []


def listing(fig, svc, ends, title, slug, sku, blocks, ends_txt, psi_summary,
            reuse=None, extra=None, focus=None):
    spec_fig[0], spec_svc[0] = fig, 'SOUR' if svc == 'sour' else 'STD'
    variants = build_variants(blocks)
    psis = sorted({int(round(v['pressureBar'])) for v in variants})
    psi_values = sorted({p for _t, _e, _c, _s, fn in blocks
                         for p in {fn(sz) for sz in _t.keys()}})
    L.append(dict(
        sku=sku, title=title, slug=slug,
        categorySlug=CAT_SOUR if svc == 'sour' else CAT_STD,
        specTemplateSlug=TEMPLATE,
        focusKeyword=focus or f'figure {fig} hammer union',
        imageFromSku=None,
        descriptionShort='', descriptionLong='', seoTitle='', seoDescription='',
        faqs=[], specs=[], variants=variants,
        sourceFamily=FIG_PROSE[fig]['source'],
        _fig=fig, _svc=svc, _ends=ends, _ends_txt=ends_txt,
        _psi_summary=psi_summary, _psi_values=psi_values, _reuse=reuse,
        _extra=extra or [],
    ))


BW_602_SECTION = (
    '<h3>Butt weld types</h3>\n<p>Three butt weld Figure 602 unions are built, for different '
    'applications:</p>\n<ul>' +
    ''.join(f'<li><strong>{esc(n)}</strong> — {esc(d)}</li>'
            for n, d in FIG_PROSE['602']['buttweld_variants']) +
    '</ul>')

# ── Standard service ───────────────────────────────────────────────────────
listing('50', 'std', 'threaded+socket weld',
        'Figure 50 Hammer Union — Threaded and Socket Weld, 500 psi',
        'hammer-union-set-50-series-npt-npt-500-psi-standard-service',
        'IH-FI-HU-50-NPT-500-STD-INDUS',
        [(FIG50['threaded'], 'threaded', 'THD', None, flat(500)),
         (FIG50['socket_weld'], 'socket_weld', 'SW', None, flat(500))],
        'threaded and socket weld ends',
        pressure_line(500, '50', 'std') + ' The figure number is the rating.',
        reuse='IH-FI-HU-50-NPT-500-STD-INDUS')

listing('100', 'std', 'threaded',
        'Figure 100 Hammer Union — Threaded, 1,000 psi',
        'hammer-union-set-100-series-npt-npt-1-000-psi-standard-service',
        'IH-FI-HU-100-NPT-1K-STD-INDUS',
        [(FIG100_THREADED, 'threaded', 'THD', None, flat(1000))],
        'line pipe threaded ends',
        pressure_line(1000, '100', 'std'),
        reuse='IH-FI-HU-100-NPT-1K-STD-INDUS')

listing('200', 'std', 'threaded',
        'Figure 200 Hammer Union — Threaded Ends, 2,000 psi',
        'hammer-union-set-200-series-npt-npt-2-000-psi-standard-service',
        'IH-FI-HU-200-NPT-2K-STD-INDUS',
        [(FIG200_THREADED, 'threaded', 'THD', None, flat(2000))],
        'line pipe threaded ends',
        pressure_line(2000, '200', 'std'),
        reuse='IH-FI-HU-200-NPT-2K-STD-INDUS')

listing('200', 'std', 'butt weld',
        'Figure 200 Hammer Union — Butt Weld Ends, 2,000 psi',
        'figure-200-hammer-union-butt-weld-ends-2000-psi',
        'IH-FI-HU-200-BW-2K-STD-INDUS',
        [(FIG200_BUTTWELD['Sch 40'], 'butt_weld', 'BW40', 'Sch 40', flat(2000)),
         (FIG200_BUTTWELD['Sch 80'], 'butt_weld', 'BW80', 'Sch 80', flat(2000))],
        'butt weld ends in Sch 40 and Sch 80',
        pressure_line(2000, '200', 'std'))

listing('206', 'std', 'threaded',
        'Figure 206 Hammer Union — Threaded Ends, 2,000 psi',
        'hammer-union-set-206-series-with-o-ring-metal-sub-npt-npt-2-000-psi-standard-service',
        'IH-FI-HU-206-NPT-2K-STD-INDUS',
        [(FIG206_THREADED, 'threaded', 'THD', None, flat(2000))],
        'line pipe threaded ends',
        pressure_line(2000, '206', 'std'),
        reuse='IH-FI-HU-206-NPT-2K-STD-INDUS')

listing('206', 'std', 'butt weld',
        'Figure 206 Hammer Union — Butt Weld Ends, 2,000 psi',
        'figure-206-hammer-union-butt-weld-ends-2000-psi',
        'IH-FI-HU-206-BW-2K-STD-INDUS',
        [(FIG206_BUTTWELD['Sch 40'], 'butt_weld', 'BW40', 'Sch 40', flat(2000)),
         (FIG206_BUTTWELD['Sch 80'], 'butt_weld', 'BW80', 'Sch 80', flat(2000))],
        'butt weld ends in Sch 40 and Sch 80',
        pressure_line(2000, '206', 'std'),
        reuse='IH-FI-HU-206-BW-2K-SOUR-FMC')

listing('207', 'std', 'threaded+butt weld',
        'Figure 207 Hammer Union Blanking Cap — 2,000 psi',
        'hammer-union-set-207-series-with-tappable-end-cap-2-000-psi-standard-service',
        'IH-FI-HU-207-NPT-2K-STD-INDUS',
        [(FIG207['threaded'], 'threaded', 'THD', None, flat(2000)),
         (FIG207['Sch 80'], 'butt_weld', 'BW80', 'Sch 80', flat(2000))],
        'threaded and Sch 80 butt weld ends',
        pressure_line(2000, '207', 'std'),
        reuse='IH-FI-HU-207-NPT-2K-STD-INDUS',
        focus='figure 207 hammer union blanking cap')

listing('211', 'std', 'threaded',
        'Figure 211 Insulated Hammer Union — 2,000 psi',
        'hammer-union-set-211-series-npt-npt-2-000-psi-standard-service',
        'IH-FI-HU-211-NPT-2K-STD-INDUS',
        [({s: dict(kg=None) for s in FIG211_SIZES}, 'threaded', 'THD', None,
          banded(FIG211_SIZES, 2000))],
        'threaded ends',
        pressure_line(2000, '211', 'std'),
        reuse='IH-FI-HU-211-NPT-2K-STD-INDUS',
        focus='figure 211 insulated hammer union')

listing('300', 'std', 'threaded',
        'Figure 300 Hammer Union — Flat-Face O-Ring, 2,000 psi',
        'hammer-union-set-300-series-flat-face-npt-npt-2-000-psi-6-000-psi-in-2-in-standard-service',
        'IH-FI-HU-300-NPT-2K-STD-INDUS',
        [({s: dict(kg=None) for s in FIG300_SIZES}, 'threaded', 'THD', None,
          banded(FIG300_SIZES, 2000))],
        'threaded ends',
        pressure_line(2000, '300', 'std'),
        reuse='IH-FI-HU-300-NPT-2K-STD-INDUS')

listing('400', 'std', 'threaded',
        'Figure 400 Hammer Union — 4,000 psi, Reduced Above 4 in',
        'hammer-union-set-400-series-npt-npt-4-000-psi-standard-service',
        'IH-FI-HU-400-NPT-4K-STD-INDUS',
        [({s: dict(kg=None) for s in FIG400_SIZES}, 'threaded', 'THD', None,
          banded(FIG400_SIZES, 4000))],
        'threaded ends',
        'Rated 4,000 psi (276 bar) cold working pressure at 2 in, 3 in and 4 in, tested at '
        '6,000 psi. The 5 in, 6 in, 10 in and 12 in sizes are reduced to 500 psi (34 bar) cold '
        'working pressure, tested at 4,000 psi.',
        reuse='IH-FI-HU-400-NPT-4K-STD-INDUS')

listing('600', 'std', 'threaded',
        'Figure 600 Hammer Union — Bronze Seated, Threaded, 6,000 psi',
        'figure-600-hammer-union-bronze-seated-threaded-6000-psi',
        'IH-FI-HU-600-NPT-6K-STD-INDUS',
        [(FIG600_THREADED, 'threaded', 'THD', None, flat(6000))],
        'line pipe threaded ends',
        pressure_line(6000, '600', 'std'),
        reuse='IH-FI-HU-600-BW-6K-STD-INDUS',
        focus='figure 600 bronze seated hammer union')

listing('602', 'std', 'threaded',
        'Figure 602 Hammer Union — Threaded Ends, Standard Service, 6,000 psi',
        'hammer-union-set-602-series-lip-seal-npt-npt-6-000-psi-standard-service',
        'IH-FI-HU-602-NPT-6K-STD-INDUS',
        [(FIG602_THREADED, 'threaded', 'THD', None, flat(6000))],
        'line pipe threaded ends',
        pressure_line(6000, '602', 'std'),
        reuse='IH-FI-HU-602-NPT-6K-STD-INDUS')

listing('602', 'std', 'butt weld',
        'Figure 602 Hammer Union — Butt Weld Ends, Standard Service, 6,000 psi',
        'figure-602-hammer-union-butt-weld-standard-service-6000-psi',
        'IH-FI-HU-602-BW-6K-STD-INDUS',
        [(FIG602_BUTTWELD['Sch 80'], 'butt_weld', 'BW80', 'Sch 80', flat(6000)),
         (FIG602_BUTTWELD['Sch XXS'], 'butt_weld', 'BWXXS', 'Sch XXS', flat(6000))],
        'butt weld ends in Sch 80 and Sch XXS',
        pressure_line(6000, '602', 'std'), extra=[BW_602_SECTION])

listing('1002', 'std', 'threaded',
        'Figure 1002 Hammer Union — Threaded Ends, Standard Service, 10,000 psi',
        'hammer-union-set-1002-series-npt-npt-10-000-psi-standard-service',
        'IH-FI-HU-1002-NPT-10K-STD-INDUS',
        [(FIG1002_THREADED, 'threaded', 'THD', None, flat(10000))],
        'line pipe threaded ends',
        pressure_line(10000, '1002', 'std') +
        ' The 5 in and 6 in sizes are butt weld only and are rated lower — see the butt weld '
        'listing.',
        reuse='IH-FI-HU-1002-NPT-10K-STD-INDUS')

listing('1002', 'std', 'butt weld',
        'Figure 1002 Hammer Union — Butt Weld Ends, Standard Service',
        'figure-1002-hammer-union-butt-weld-standard-service',
        'IH-FI-HU-1002-BW-10K-STD-INDUS',
        [(FIG1002_BUTTWELD, 'butt_weld', 'BWXXS', 'Sch XXS',
          banded({'5"': 7500, '6"': 7500}, 10000))],
        'Sch XXS butt weld ends',
        'Rated 10,000 psi (690 bar) cold working pressure from 1 in to 4 in, tested at 15,000 psi. '
        'The 5 in and 6 in sizes are rated 7,500 psi (517 bar).')

listing('1003', 'std', 'threaded+butt weld',
        'Figure 1003 Misaligning Hammer Union — Standard Service',
        'figure-1003-misaligning-hammer-union-standard-service',
        'IH-FI-HU-1003-TBW-10K-STD-INDUS',
        [(FIG1003_THREADED, 'threaded', 'THD', None, banded({'4"': 7500}, 10000)),
         (FIG1003_BUTTWELD, 'butt_weld', 'BWXXS', 'Sch XXS',
          banded({'4"': 7500, '5"': 7500}, 10000))],
        'line pipe threaded and Sch XXS butt weld ends',
        'Our supplier rates the 2 in and 3 in at 10,000 psi (690 bar) cold working pressure and '
        'the 4 in and 5 in at 7,500 psi (517 bar).',
        reuse='IH-FI-HU-1003-BW-10K-STD-INDUS',
        focus='figure 1003 misaligning hammer union')

listing('1004', 'std', 'butt weld',
        'Figure 1004 Hammer Union — Butt Weld, Standard Service, 10,000 psi',
        'hammer-union-set-1004-series-butt-weld-schedule-xxh-10-000-psi-standard-service',
        'IH-FI-HU-1004-BW-10K-STD-INDUS',
        [(FIG1004_BUTTWELD, 'butt_weld', 'BW', None, flat(10000))],
        'butt weld ends',
        pressure_line(10000, '1004', 'std'),
        reuse='IH-FI-HU-1004-BW-10K-STD-INDUS')

listing('1502', 'std', 'threaded',
        'Figure 1502 Hammer Union — Threaded Ends, Standard Service, 15,000 psi',
        'hammer-union-set-1502-series-field-replaceable-lip-seal-npt-npt-15-000-psi-standard-service',
        'IH-FI-HU-1502-NPT-15K-STD-INDUS',
        [(FIG1502_THREADED, 'threaded', 'THD', None, flat(15000))],
        'line pipe threaded ends',
        pressure_line(15000, '1502', 'std') +
        ' The 4 in, 5 in and 6 in sizes are butt weld only — see the butt weld listing.',
        reuse='IH-FI-HU-1502-NPT-15K-STD-INDUS')

listing('1502', 'std', 'butt weld',
        'Figure 1502 Hammer Union — Butt Weld Ends, Standard Service, 15,000 psi',
        'hammer-union-set-1502-series-butt-weld-butt-weld-15-000-psi-standard-service',
        'IH-FI-HU-1502-BW-15K-STD-INDUS',
        [(FIG1502_BUTTWELD, 'butt_weld', 'BWXXS', 'Sch XXS', flat(15000))],
        'Sch XXS butt weld ends',
        pressure_line(15000, '1502', 'std'),
        reuse='IH-FI-HU-1502-BW-15K-STD-FMC')

listing('2002', 'std', 'butt weld',
        'Figure 2002 Hammer Union — Butt Weld, Standard Service, 20,000 psi',
        'figure-2002-hammer-union-butt-weld-standard-service-20000-psi',
        'IH-FI-HU-2002-BW-20K-STD-INDUS',
        [(FIG2002_BUTTWELD, 'butt_weld', 'BW', None, flat(20000))],
        'butt weld ends',
        pressure_line(20000, '2002', 'std'))

# ── Sour gas service ───────────────────────────────────────────────────────
listing('602', 'sour', 'threaded',
        'Figure 602 Hammer Union — Threaded Ends, Sour Gas Service, 6,000 psi',
        'figure-602-hammer-union-threaded-sour-gas-service-6000-psi',
        'IH-FI-HU-602-NPT-6K-SOUR-INDUS',
        [(FIG602_THREADED, 'threaded', 'THD', None, flat(6000))],
        'line pipe threaded ends',
        pressure_line(6000, '602', 'sour') +
        ' Figure 602 is the one figure in this range whose published H2S rating matches its '
        'standard service rating.')

listing('602', 'sour', 'butt weld',
        'Figure 602 Hammer Union — Butt Weld Ends, Sour Gas Service, 6,000 psi',
        'figure-602-hammer-union-butt-weld-sour-gas-service-6000-psi',
        'IH-FI-HU-602-BW-6K-SOUR-INDUS',
        [(FIG602_BUTTWELD['Sch 80'], 'butt_weld', 'BW80', 'Sch 80', flat(6000)),
         (FIG602_BUTTWELD['Sch XXS'], 'butt_weld', 'BWXXS', 'Sch XXS', flat(6000))],
        'butt weld ends in Sch 80 and Sch XXS',
        pressure_line(6000, '602', 'sour'), extra=[BW_602_SECTION])

listing('1002', 'sour', 'threaded',
        'Figure 1002 Hammer Union — Threaded Ends, Sour Gas Service, 7,500 psi',
        'figure-1002-hammer-union-threaded-sour-gas-service-7500-psi',
        'IH-FI-HU-1002-NPT-7K5-SOUR-INDUS',
        [(FIG1002_THREADED, 'threaded', 'THD', None, flat(7500))],
        'line pipe threaded ends',
        pressure_line(7500, '1002', 'sour') +
        ' That is 2,500 psi below the standard service rating for the same union.')

listing('1002', 'sour', 'butt weld',
        'Figure 1002 Hammer Union — Butt Weld Ends, Sour Gas Service',
        'figure-1002-hammer-union-butt-weld-sour-gas-service',
        'IH-FI-HU-1002-BW-7K5-SOUR-INDUS',
        [(FIG1002_BUTTWELD, 'butt_weld', 'BWXXS', 'Sch XXS',
          banded({'5"': 5000, '6"': 5000}, 7500))],
        'Sch XXS butt weld ends',
        'Rated 7,500 psi (517 bar) cold working pressure from 1 in to 4 in, tested at 12,000 psi. '
        'The 5 in and 6 in sizes are rated 5,000 psi (345 bar).')

listing('1003', 'sour', 'threaded+butt weld',
        'Figure 1003 Misaligning Hammer Union — Sour Gas Service',
        'figure-1003-misaligning-hammer-union-sour-gas-service',
        'IH-FI-HU-1003-TBW-7K5-SOUR-INDUS',
        [(FIG1003_THREADED, 'threaded', 'THD', None, banded({'4"': 5000}, 7500)),
         (FIG1003_BUTTWELD, 'butt_weld', 'BWXXS', 'Sch XXS',
          banded({'4"': 5000, '5"': 5000}, 7500))],
        'line pipe threaded and Sch XXS butt weld ends',
        'Rated 7,500 psi (517 bar) cold working pressure at 2 in and 3 in and 5,000 psi (345 bar) '
        'at 4 in and 5 in.',
        focus='figure 1003 sour gas hammer union')

listing('1004', 'sour', 'butt weld',
        'Figure 1004 Hammer Union — Butt Weld, Sour Gas Service, 7,500 psi',
        'figure-1004-hammer-union-butt-weld-sour-gas-service-7500-psi',
        'IH-FI-HU-1004-BW-7K5-SOUR-INDUS',
        [(FIG1004_BUTTWELD, 'butt_weld', 'BW', None, flat(7500))],
        'butt weld ends',
        pressure_line(7500, '1004', 'sour'))

listing('1502', 'sour', 'threaded',
        'Figure 1502 Hammer Union — Threaded Ends, Sour Gas Service, 10,000 psi',
        'figure-1502-hammer-union-threaded-sour-gas-service-10000-psi',
        'IH-FI-HU-1502-NPT-10K-SOUR-INDUS',
        [(FIG1502_THREADED, 'threaded', 'THD', None, flat(10000))],
        'line pipe threaded ends',
        pressure_line(10000, '1502', 'sour') +
        ' That is 5,000 psi below the standard service rating for the same union.')

listing('1502', 'sour', 'butt weld',
        'Figure 1502 Hammer Union — Butt Weld Ends, Sour Gas Service, 10,000 psi',
        'figure-1502-hammer-union-butt-weld-sour-gas-service-10000-psi',
        'IH-FI-HU-1502-BW-10K-SOUR-INDUS',
        [(FIG1502_BUTTWELD, 'butt_weld', 'BWXXS', 'Sch XXS', flat(10000))],
        'Sch XXS butt weld ends',
        pressure_line(10000, '1502', 'sour'))

listing('2202', 'sour', 'butt weld',
        'Figure 2202 Hammer Union — Butt Weld, Sour Gas Service, 15,000 psi',
        'hammer-union-set-2202-series-butt-weld-schedule-xxh-15-000-psi-sour-service-nace-mr0175',
        'IH-FI-HU-2202-BW-15K-SOUR-INDUS',
        [(FIG2202_BUTTWELD, 'butt_weld', 'BW', None, flat(15000))],
        'butt weld ends',
        pressure_line(15000, '2202', 'sour'),
        reuse='IH-FI-HU-2202-BW-15K-SOUR-INDUS')


# ── Spec template ──────────────────────────────────────────────────────────
TEMPLATE_DEF = dict(
    slug=TEMPLATE, name='Hammer Union', position=21,
    description='Wing-union (hammer lug) connections. Keyed on the figure number, because that '
                'is the industry series a buyer arrives holding, and on the service class, '
                'because the same figure is rated differently in sour gas.',
    fields=[
        dict(key='figure_number', label='Figure Number', dataType='select', group='Identification',
             isKeyFeature=True, isQuickSpec=True, isRequired=True,
             options=['50', '100', '200', '206', '207', '211', '300', '400', '600', '602',
                      '1002', '1003', '1004', '1502', '2002', '2202']),
        dict(key='union_type', label='Union Type', dataType='select', group='Identification',
             isKeyFeature=True, isQuickSpec=False, isRequired=True,
             options=['Union', 'Blanking cap', 'Misaligning union', 'Insulated union']),
        dict(key='end_connection', label='End Connection', dataType='select',
             group='Identification', isKeyFeature=True, isQuickSpec=True, isRequired=True,
             options=['Threaded (line pipe)', 'Butt weld', 'Socket weld',
                      'Threaded and butt weld', 'Threaded and socket weld']),
        dict(key='weld_schedule', label='Weld Schedule', dataType='text',
             group='Identification', isKeyFeature=False, isQuickSpec=True, isRequired=False),
        dict(key='service_class', label='Service Class', dataType='select', group='Performance',
             isKeyFeature=True, isQuickSpec=True, isRequired=True,
             options=['Standard service', 'Sour gas service']),
        dict(key='working_pressure_psi', label='Working Pressure', unit='psi', dataType='number',
             group='Performance', isKeyFeature=True, isQuickSpec=True, isRequired=True,
             helpText='Highest cold working pressure in this listing. Where the rating falls '
                      'with size, "Pressure by size" and the size table carry the rest.'),
        dict(key='working_pressure_bar', label='Working Pressure', unit='bar', dataType='number',
             group='Performance', isKeyFeature=False, isQuickSpec=True, isRequired=False),
        dict(key='pressure_by_size', label='Pressure by Size', dataType='text',
             group='Performance', isKeyFeature=True, isQuickSpec=True, isRequired=False,
             helpText='Present only where the source rates some sizes below the headline '
                      'figure. Absent means one rating covers every size in the table.'),
        dict(key='test_pressure_psi', label='Test Pressure', unit='psi', dataType='number',
             group='Performance', isKeyFeature=False, isQuickSpec=False, isRequired=False),
        dict(key='nominal_size_range', label='Nominal Size Range', dataType='text',
             group='Dimensions', isKeyFeature=True, isQuickSpec=True, isRequired=True),
        dict(key='misalignment_allowance', label='Misalignment Allowance', dataType='text',
             group='Dimensions', isKeyFeature=False, isQuickSpec=False, isRequired=False),
        dict(key='seal_arrangement', label='Seal Arrangement', dataType='text', group='Sealing',
             isKeyFeature=True, isQuickSpec=False, isRequired=False),
        dict(key='seat_material', label='Seat Material', dataType='text', group='Sealing',
             isKeyFeature=False, isQuickSpec=False, isRequired=False),
        dict(key='body_material', label='Body Material', dataType='text', group='Construction',
             isKeyFeature=False, isQuickSpec=False, isRequired=False),
        dict(key='corrosion_standard', label='Corrosion Standard', dataType='text',
             group='Compliance', isKeyFeature=False, isQuickSpec=False, isRequired=False),
    ],
)
for i, f in enumerate(TEMPLATE_DEF['fields']):
    f['position'] = i
    f.setdefault('unit', None)
    f.setdefault('options', None)
    f.setdefault('helpText', None)

END_LABEL = {
    'threaded': 'Threaded (line pipe)',
    'butt weld': 'Butt weld',
    'threaded+butt weld': 'Threaded and butt weld',
    'threaded+socket weld': 'Threaded and socket weld',
}
UNION_TYPE = {'207': 'Blanking cap', '1003': 'Misaligning union', '211': 'Insulated union'}


def spec(group, label, value, template_key, pos, unit=None, filt=False):
    # A spec value is a table cell, not a sentence. The prose it is lifted from
    # ends in a full stop; a one-clause cell should not.
    v = str(value)
    if v.endswith('.') and v.count('.') == 1 and ' ' in v:
        v = v[:-1]
    return dict(group=group, label=label, value=v, unit=unit, position=pos,
                isFilterable=filt, templateKey=template_key)


def finish(e):
    fig, svc, ends = e['_fig'], e['_svc'], e['_ends']
    p = FIG_PROSE[fig]
    variants, psis = e['variants'], e['_psi_values']
    sizes = sorted({v['hoseInch'] for v in variants}, key=size_sort)
    top = max(psis)
    scheds = sorted({m.group(0) for v in variants
                     for m in [re.search(r'Sch [\w]+', v['portLabel'] or '')] if m})

    e['descriptionLong'] = compose(fig, svc, e['_ends_txt'], variants, e['_psi_summary'],
                                   e['_extra'])
    e['faqs'] = faqs_for(fig, svc, variants, psis)

    svc_label = 'Sour gas service' if svc == 'sour' else 'Standard service'
    size_range = sizes[0] if len(sizes) == 1 else f'{sizes[0]} to {sizes[-1]}'

    rows = [
        ('Identification', 'Figure Number', fig, 'figure_number', None, True),
        ('Identification', 'Union Type', UNION_TYPE.get(fig, 'Union'), 'union_type', None, True),
        ('Identification', 'End Connection', END_LABEL[ends], 'end_connection', None, True),
    ]
    if scheds:
        rows.append(('Identification', 'Weld Schedule', ', '.join(scheds), 'weld_schedule',
                     None, False))
    rows += [
        ('Performance', 'Service Class', svc_label, 'service_class', None, True),
        ('Performance', 'Working Pressure', top, 'working_pressure_psi', 'psi', True),
        ('Performance', 'Working Pressure', bar(top), 'working_pressure_bar', 'bar', False),
    ]
    if len(psis) > 1:
        by = []
        for psi in sorted(psis, reverse=True):
            at = sorted({v['hoseInch'] for v in variants if v['pressureBar'] == bar(psi)},
                        key=size_sort)
            by.append(f'{", ".join(at)} — {psi_txt(psi)} psi ({bar_txt(psi)} bar)')
        rows.append(('Performance', 'Pressure by Size', '; '.join(by), 'pressure_by_size',
                     None, False))
    test = (TEST_PSI_SOUR if svc == 'sour' else TEST_PSI_STANDARD).get(int(fig)) if fig.isdigit() else None
    if test:
        rows.append(('Performance', 'Test Pressure', test, 'test_pressure_psi', 'psi', False))
    rows.append(('Dimensions', 'Nominal Size Range', size_range, 'nominal_size_range', None, True))
    if fig == '1003':
        rows.append(('Dimensions', 'Misalignment Allowance',
                     'Up to 7.5° off the centre line, 15° included. The 2 in size is 3.5° off '
                     'the centre line, 7° included.', 'misalignment_allowance', None, False))
    if p.get('seal'):
        rows.append(('Sealing', 'Seal Arrangement', p['seal'], 'seal_arrangement', None, False))
    if p.get('seat'):
        rows.append(('Sealing', 'Seat Material', p['seat'], 'seat_material', None, False))
    if p.get('material'):
        rows.append(('Construction', 'Body Material', p['material'], 'body_material', None, False))
    if fig == '2202':
        rows.append(('Compliance', 'Corrosion Standard',
                     'Examined against the current requirements of NACE (National Association of '
                     'Corrosion Engineers).', 'corrosion_standard', None, False))

    e['specs'] = [spec(g, l, v, k, n, unit=u, filt=f)
                  for n, (g, l, v, k, u, f) in enumerate(rows)]

    qualifier = '' if len(psis) == 1 else ', falling with size'
    short = (f'Figure {fig} hammer union, {svc_label.lower()}, {e["_ends_txt"]}. '
             f'{size_range}, rated {psi_txt(top)} psi ({psi_txt(bar(top))} bar){qualifier}. '
             f'Full size table with weights and dimensions on this page.')
    e['descriptionShort'] = short[:300]

    suffixed = f'{e["title"]} | Hammer Union Supplier UAE'
    e['seoTitle'] = suffixed if len(suffixed) <= 70 else e['title']
    e['seoDescription'] = (
        f'Figure {fig} hammer union in {svc_label.lower()}, {size_range}, {psi_txt(top)} psi. '
        f'Weights, dimensions and part numbers for every size. Priced on RFQ from Dubai.')[:170]

    # `replaces` survives the purge below: it is what tells the importer which
    # live listing this page rewrites, and whether the slug moved.
    e['replaces'] = e['_reuse']
    for k in list(e):
        if k.startswith('_'):
            del e[k]
    return e


for e in L:
    finish(e)

# ── Categories, renames, retirements, drafts ───────────────────────────────
CATEGORIES = [
    dict(slug='hammer-union-suppliers-uae', name='Hammer Unions',
         parentSlug='flow-iron-wellhead-equipment-uae', position=5,
         shortDescription='Wing-union (hammer lug) connections for flow iron, choke and kill '
                          'lines, cementing and well test spreads — Figure 50 through Figure '
                          '2202, in standard and sour gas service.',
         seoTitle='Hammer Unions — Figure 100 to 1502 Wing Unions',
         seoDescription='Hammer lug unions from Figure 50 to Figure 2202, threaded and butt weld, '
                        'standard and sour gas service. Sizes, weights and pressure ratings for '
                        'every union. Supplied from Dubai.',
         focusKeyword='hammer union'),
    dict(slug=CAT_STD, name='Standard Service Hammer Unions',
         parentSlug='hammer-union-suppliers-uae', position=0,
         shortDescription='Hammer unions in standard service trim, for clean and sweet service '
                          'within the working-pressure envelope printed for each figure.',
         seoTitle='Standard Service Hammer Unions — Figure 50 to 2002',
         seoDescription='Standard service hammer lug unions, Figure 50 through Figure 2002, '
                        'threaded and butt weld. Working pressure, test pressure, sizes and '
                        'weights for every figure.',
         focusKeyword='standard service hammer union'),
    dict(slug=CAT_SOUR, name='Sour Gas Service Hammer Unions',
         parentSlug='hammer-union-suppliers-uae', position=1,
         shortDescription='Hammer unions in H2S trim. Where the source publishes a separate sour '
                          'rating it is below the standard service rating for the same figure '
                          'number — every listing states both.',
         seoTitle='Sour Gas Service Hammer Unions — H2S Trim',
         seoDescription='Sour gas service hammer lug unions in H2S trim — Figure 602, 1002, 1003, '
                        '1004, 1502 and 2202. Published H2S working pressures, sizes and weights.',
         focusKeyword='sour gas hammer union'),
]

RETIREMENTS = [
    dict(sku='IH-FI-HU-602-NPT-6K-STD-ANSON',
         intoSku='IH-FI-HU-602-NPT-6K-STD-INDUS',
         reason='Duplicate. Two live listings described the same 6,000 psi threaded Figure 602 '
                'in standard service; this one also carried a competitor name in its SKU.'),
    dict(sku='IH-FI-HU-1502-NPT-15K-STD-FMC',
         intoSku='IH-FI-HU-1502-NPT-15K-STD-INDUS',
         reason='Duplicate. Same 15,000 psi threaded Figure 1502 in standard service as the '
                'surviving listing, with a competitor name in its SKU.'),
]

DRAFTS = [
    dict(sku=sku, figure=fig,
         reason='Neither licensed catalogue covers Figure %s. The live page carried a working '
                'pressure, a size list, a material grade and a temperature range that no source '
                'states. Set to draft rather than rewritten from memory.' % fig)
    for fig, sku in UNSOURCED_FIGURES.items()
]

payload = dict(
    source='Marlia Ingenieros S.L. "Weco couplings - Hammer lug unions" (20 pp) for every '
           'dimension and weight; SPM Oil & Gas / Kemper "Oilfield Hammer Unions" (2 pp, 2021) '
           'for pressure and size cross-checks only.',
    categories=CATEGORIES,
    specTemplate=TEMPLATE_DEF,
    products=L,
    retirements=RETIREMENTS,
    drafts=DRAFTS,
)

seen = {}
for e in L:
    for v in e['variants']:
        if v['partNumber'] in seen:
            raise SystemExit(f'duplicate part number {v["partNumber"]}: '
                             f'{seen[v["partNumber"]]} and {e["sku"]}')
        seen[v['partNumber']] = e['sku']
slugs = [e['slug'] for e in L]
assert len(set(slugs)) == len(slugs), 'duplicate slug'
skus = [e['sku'] for e in L]
assert len(set(skus)) == len(skus), 'duplicate sku'
for e in L:
    assert 'indus hydraulics' not in e['seoTitle'].lower(), e['sku']

OUT.mkdir(parents=True, exist_ok=True)
(OUT / 'listings.json').write_text(json.dumps(payload, indent=2, ensure_ascii=False) + '\n')

n_var = sum(len(e['variants']) for e in L)
print(f'{len(L)} listings, {n_var} variants, {len(CATEGORIES)} categories, '
      f'{len(RETIREMENTS)} retirements, {len(DRAFTS)} drafts')
renamed = [(e['replaces'], e['sku']) for e in L if e['replaces'] and e['replaces'] != e['sku']]
print(f'{sum(1 for e in L if e["replaces"])} rewritten in place, '
      f'{sum(1 for e in L if not e["replaces"])} new, {len(renamed)} re-SKUd')
for old, new in renamed:
    print('  ', old, '->', new)
print('written to', OUT / 'listings.json')
