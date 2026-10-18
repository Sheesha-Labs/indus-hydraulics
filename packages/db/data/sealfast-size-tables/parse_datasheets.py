# Parses each Sealfast datasheet's dimension table from the PDF text layer,
# keeping only words that are actually painted on the page: some rows carry
# hidden duplicate values under a blanking rectangle.
import fitz, json, re, glob, sys

def ink(pix, scale, bbox):
    x0, y0, x1, y1 = [int(v * scale) for v in bbox]
    dark = 0
    for y in range(max(y0, 0), min(y1, pix.height)):
        for x in range(max(x0, 0), min(x1, pix.width)):
            r, g, b = pix.pixel(x, y)[:3]
            if r + g + b < 360: dark += 1
    return dark

def parse(path):
    page = fitz.open(path)[0]
    scale = 2
    pix = page.get_pixmap(matrix=fitz.Matrix(scale, scale), alpha=False)
    seen, words = set(), []
    for w in page.get_text('words'):
        k = (w[4], round(w[0]), round(w[1]))
        if k not in seen: seen.add(k); words.append(w)  # some sheets print the table twice, overlaid
    hdr = next((s for s in words if s[4] == 'Size' and any(abs(w[1] - s[1]) < 4 and w[4] in ('PSI', 'D', 'D1') for w in words)), None)
    if not hdr: return None
    hy = hdr[1]
    KNOWN = re.compile(r'^(Size|PSI|PART|#|TYPE|From|To|HOLE|HOLES|PCD|[A-Z]\d?|[A-Z]{1,2}\d)$')
    header = sorted([w for w in words if abs(w[1] - hy) < 4 and w[0] >= hdr[0] - 2 and KNOWN.match(w[4]) and w[4] != 'Working'], key=lambda w: w[0])
    # A sheet that prints its table twice: keep the first copy only.
    dup = [w[0] for w in header if w[4] == 'Size' and w[0] > hdr[0] + 5]
    if dup: header = [w for w in header if w[0] < min(dup)]
    cols = []
    for w in header:
        if w[4] == '#' and cols and cols[-1]['name'] in ('PART', 'HOLE'): cols[-1]['x1'] = w[2]; cols[-1]['name'] += ' #' if cols[-1]['name'] == 'HOLE' else ''; continue
        cols.append({'name': w[4], 'x0': w[0], 'x1': w[2]})
    warn = [w[1] for w in words if re.match(r'(WARNING|Working$|Note:)', w[4]) and w[1] > hy + 5]
    ylim = min(warn) if warn else 9e9
    xmax = cols[-1]['x1'] + 30
    body = [w for w in words if hy + 6 < w[1] < ylim and cols[0]['x0'] - 25 < w[0] < xmax]
    vis = [w for w in body if ink(pix, scale, w[:4]) > 2]
    hidden = len(body) - len(vis)
    # Row anchors: words in the Size column band
    size_x1 = cols[1]['x0'] - 2
    anchors = sorted({round((w[1] + w[3]) / 2) for w in vis if w[2] <= size_x1 + 4 and re.match(r'^[\d/”“"x\-X]+', w[4])})
    merged = []
    for a in anchors:
        if merged and a - merged[-1] < 6: continue
        merged.append(a)
    rows = []
    centers = [((c['x0'] + c['x1']) / 2) for c in cols]
    for a in merged:
        cells = {c['name']: [] for c in cols}
        for w in vis:
            yc = (w[1] + w[3]) / 2
            if abs(yc - a) > 6.5: continue
            xc = (w[0] + w[2]) / 2
            if w[2] <= size_x1 + 4: name = cols[0]['name']
            else: name = cols[min(range(len(cols)), key=lambda i: abs(centers[i] - xc))]['name']
            cells[name].append((w[0], w[4]))
        row = {k: ' '.join(t for _, t in sorted(v)) for k, v in cells.items() if v}
        rows.append(row)
    return {'columns': [c['name'] for c in cols], 'rows': rows, 'hidden_words': hidden}

if __name__ == '__main__':
  out = {}
  for f in sorted(glob.glob('pdf/*.pdf')):
      try: out[f[4:]] = parse(f)
      except Exception as e: out[f[4:]] = {'error': repr(e)}
  json.dump(out, open('sheets.json', 'w'), indent=1, ensure_ascii=False)
  for k, v in out.items():
      if not v: print(f'{k:56} NO TABLE'); continue
      if 'error' in v: print(f'{k:56} ERROR {v["error"]}'); continue
      print(f'{k:56} cols {" ".join(v["columns"]):48} rows {len(v["rows"]):2} hidden {v["hidden_words"]}')
