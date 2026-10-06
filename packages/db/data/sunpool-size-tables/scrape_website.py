# Reads the Sunpool catalogue page behind each Sunpool listing (HTML only) and
# records what the page itself states: title, bullets, tables and the files it
# links. The listing -> page map is the one the industrial couplings import
# used, ../industrial-coupling-map.csv.
#
#   python3 scrape_website.py [--cache=DIR]
#
# With --cache, a page already saved there as <SKU>.html is read instead of
# fetched, and fetched pages are saved there.
import csv, html, json, os, re, sys, time, urllib.request
from html.parser import HTMLParser

HERE = os.path.dirname(os.path.abspath(__file__))
CACHE = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--cache=')), None)


class Block(HTMLParser):
    """Bullets, tables (cell line breaks kept) and links of one text block."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.bullets, self.tables, self.links = [], [], []
        self.depth, self.rows, self.row, self.cell, self.span, self.li, self.a = 0, None, None, None, None, None, None

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'table':
            self.depth += 1
            if self.depth == 1: self.rows = []
        elif tag == 'tr' and self.rows is not None: self.row = []
        elif tag in ('td', 'th') and self.row is not None:
            self.cell = []
            self.span = (int(a.get('colspan') or 1), int(a.get('rowspan') or 1))
        elif tag == 'br':
            if self.cell is not None: self.cell.append('\n')
            if self.li is not None: self.li.append(' ')
        elif tag == 'li' and self.rows is None: self.li = []
        elif tag == 'a' and a.get('href'): self.a = [a['href'], []]

    def handle_endtag(self, tag):
        if tag == 'table':
            if self.depth == 1 and self.rows is not None:
                self.tables.append(grid(self.rows)); self.rows = None
            self.depth -= 1
        elif tag == 'tr' and self.row is not None and self.rows is not None:
            self.rows.append(self.row); self.row = None
        elif tag in ('td', 'th') and self.cell is not None and self.row is not None:
            text = '\n'.join(re.sub(r'[ \t\r\f\v\xa0]+', ' ', l).strip() for l in ''.join(self.cell).split('\n'))
            self.row.append((re.sub(r'\n+', '\n', text).strip('\n'), *self.span)); self.cell = None
        elif tag == 'li' and self.li is not None:
            t = re.sub(r'\s+', ' ', ''.join(self.li)).strip()
            if t: self.bullets.append(t)
            self.li = None
        elif tag == 'a' and self.a is not None:
            self.links.append({'href': self.a[0], 'text': re.sub(r'\s+', ' ', ''.join(self.a[1])).strip()}); self.a = None

    def handle_data(self, d):
        if self.cell is not None: self.cell.append(d)
        if self.li is not None: self.li.append(d)
        if self.a is not None: self.a[1].append(d)


def grid(rows):
    """Expand colspan / rowspan into a rectangular list of rows."""
    out, pending = [], {}
    for r, row in enumerate(rows):
        line, c, it = [], 0, iter(row)
        while True:
            while (r, c) in pending: line.append(pending.pop((r, c))); c += 1
            cell = next(it, None)
            if cell is None: break
            text, cs, rs = cell
            for _ in range(cs):
                line.append(text)
                for j in range(1, rs): pending[(r + j, c)] = text
                c += 1
        while (r, c) in pending: line.append(pending.pop((r, c))); c += 1
        out.append(line)
    return out


def page(sku, url):
    path = os.path.join(CACHE, f'{sku}.html') if CACHE else None
    if path and os.path.exists(path):
        return open(path, encoding='utf-8', errors='replace').read()
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    body = urllib.request.urlopen(req, timeout=30).read().decode('utf-8', 'replace')
    if path: open(path, 'w', encoding='utf-8').write(body)
    time.sleep(0.4)
    return body


def text(pattern, body):
    m = re.search(pattern, body, re.S)
    return html.unescape(re.sub(r'<[^>]+>', '', m.group(1))).strip() if m else None


out = {}
for r in csv.DictReader(open(os.path.join(HERE, '..', 'industrial-coupling-map.csv'))):
    if 'sunpool' not in (r['link'] or '') or r['action'] == 'skip-duplicate': continue
    body = page(r['sku'], r['link'])
    a = body.find('<div class="textEditor">')
    b = body.find('</li><!--intro end-->', a)
    p = Block()
    p.feed(body[a:b] if a >= 0 else '')
    out[r['sku']] = {
        'url': r['link'],
        'title': text(r'<h3 class="articleTitle">(.*?)</h3>', body),
        'subtitle': text(r'<p class="txtExp OpenSans">(.*?)</p>', body),
        'bullets': p.bullets,
        'tables': p.tables,
        'files': [l for l in p.links if re.search(r'\.(pdf|xlsx?)$', l['href'], re.I)],
    }
json.dump(out, open(os.path.join(HERE, 'website.json'), 'w'), indent=1, ensure_ascii=False)
print('pages', len(out), 'with tables', sum(1 for v in out.values() if v['tables']))
