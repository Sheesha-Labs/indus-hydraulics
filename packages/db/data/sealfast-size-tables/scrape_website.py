# Reads Sealfast family pages (HTML only) and records each item row and the
# family's linked assets. No PDF is fetched.
import json, re, sys, time, html, urllib.request
from html.parser import HTMLParser

BASE = 'https://products.sealfast.com/viewitems/'

class Table(HTMLParser):
    def __init__(self):
        super().__init__(); self.rows = []; self.row = None; self.cell = None; self.in_table = 0; self.links = []; self.title = ''; self._t = False
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if tag == 'table': self.in_table += 1
        if tag == 'tr' and self.in_table: self.row = []
        if tag in ('td', 'th') and self.row is not None: self.cell = []
        if tag == 'a' and a.get('href'): self.links.append(a['href'])
        if tag == 'title': self._t = True
    def handle_endtag(self, tag):
        if tag in ('td', 'th') and self.row is not None and self.cell is not None:
            self.row.append(re.sub(r'\s+', ' ', ''.join(self.cell)).strip()); self.cell = None
        if tag == 'tr' and self.row is not None:
            if any(self.row): self.rows.append(self.row)
            self.row = None
        if tag == 'table': self.in_table -= 1
        if tag == 'title': self._t = False
    def handle_data(self, d):
        if self.cell is not None: self.cell.append(d)
        if self._t: self.title += d

out = {}
for line in open('fams.txt'):
    fam = line.strip()
    if not fam: continue
    url = BASE + fam + '?pagesize=200&pagenum=1'
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        body = urllib.request.urlopen(req, timeout=30).read().decode('utf-8', 'replace')
    except Exception as e:
        out[fam] = {'error': str(e)}; print('ERR', fam, e, file=sys.stderr); continue
    p = Table(); p.feed(body)
    header = next((r for r in p.rows if r and r[0].startswith('Item #')), None)
    items = []
    if header:
        hi = p.rows.index(header)
        for r in p.rows[hi + 1:]:
            if len(r) >= 3 and re.match(r'^[A-Z0-9]', r[0]) and 'Results Per Page' not in r[0]:
                items.append(r)
    assets = sorted({h for h in p.links if '/Asset/' in h})
    out[fam] = {'title': html.unescape(p.title.strip()), 'header': header, 'items': items, 'assets': assets}
    time.sleep(0.3)
json.dump(out, open('families.json', 'w'), indent=1)
print('families', len(out), 'items', sum(len(v.get('items', [])) for v in out.values()))
