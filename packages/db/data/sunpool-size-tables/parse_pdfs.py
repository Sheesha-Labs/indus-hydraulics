# Reads the three Sunpool part-number lists (Storz, KC, UAC) from their PDF
# text layer. Each page is one ruled table: a title row, a header row, size
# rows and a row of ordering notes. A cell's text counts only if ink is
# painted under it, so a value hidden under a blanking rectangle (the
# Sealfast datasheets had those) cannot slip through.
#
#   python3 parse_pdfs.py DIR    # DIR holds storz.pdf, kc.pdf, uac.pdf
import json, os, re, sys
import fitz

HERE = os.path.dirname(os.path.abspath(__file__))
FILES = {
    'storz': 'https://www.sunpool.com.tw/upload/download_files/37f898b2660ef125f0443372b04aab38.pdf',
    'kc': 'https://www.sunpool.com.tw/upload/download_files/4ff3cc3a4e8ef2f9d5c6a01036181774.pdf',
    'uac': 'https://www.sunpool.com.tw/upload/download_files/e966c1d568a7e6653b6cd4c8b9d92991.pdf',
}


def inked(pix, scale, rect):
    x0, y0, x1, y1 = [int(v * scale) for v in rect]
    dark = 0
    for y in range(max(y0, 0), min(y1, pix.height)):
        for x in range(max(x0, 0), min(x1, pix.width)):
            r, g, b = pix.pixel(x, y)[:3]
            if r + g + b < 360: dark += 1
    return dark > 2


def parse(path):
    pages, hidden = [], 0
    for page in fitz.open(path):
        scale = 2
        pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
        words = page.get_text('words')
        visible = {(round(w[0]), round(w[1])) for w in words if inked(pix, scale, w[:4])}
        hidden += len(words) - len(visible)
        tabs = page.find_tables().tables
        if len(tabs) != 1: raise SystemExit(f'{path} p{page.number + 1}: {len(tabs)} tables')
        t = tabs[0]
        rows = []
        for row in t.rows:
            cells = []
            for rect in row.cells:
                if rect is None: cells.append(None); continue
                inside = [w for w in words if w[0] >= rect[0] - 1 and w[2] <= rect[2] + 1 and w[1] >= rect[1] - 1 and w[3] <= rect[3] + 1]
                shown = [w for w in inside if (round(w[0]), round(w[1])) in visible]
                if len(shown) != len(inside):
                    raise SystemExit(f'{path} p{page.number + 1}: hidden text in a cell: {[w[4] for w in inside if w not in shown]}')
                lines = {}
                for w in shown: lines.setdefault((w[5], w[6]), []).append(w[4])
                cells.append('\n'.join(' '.join(v) for _, v in sorted(lines.items())))
            rows.append(cells)
        title = next(c for c in rows[0] if c)
        header = [re.sub(r'\s+', ' ', c or '').strip() for c in rows[1]]
        if header[0] in ('Material Size', 'Size Material'): header[0] = 'Size'
        body = [r for r in rows[2:] if r[1] is not None]
        notes = [r[0] for r in rows[2:] if r[1] is None and r[0]]
        pages.append({'page': page.number + 1, 'title': title.strip(), 'header': header,
                      'rows': [[re.sub(r'\s+', ' ', c).strip() for c in r] for r in body],
                      'notes': notes[0].split('\n') if notes else []})
    return pages, hidden


if __name__ == '__main__':
    d = sys.argv[1]
    out = {}
    for name, url in FILES.items():
        pages, hidden = parse(os.path.join(d, f'{name}.pdf'))
        out[name] = {'url': url, 'pages': pages}
        print(name, len(pages), 'pages', sum(len(p['rows']) for p in pages), 'rows', hidden, 'words outside tables or unpainted')
    json.dump(out, open(os.path.join(HERE, 'pdfs.json'), 'w'), indent=1, ensure_ascii=False)
