"""Builds payload.json for run.ts from the Hydraulics Direct export and the
live variant list (scratch export of product_variants).

    python3 -I build_payload.py <hydraulics-direct-products.json> <allvariants.json> payload.json

Matching: an HD stainless SKU `SS-<code>` is the live part `IH-SS-<code>`;
every other SKU can only be `IH-ST-`, `IH-TF-` or `IH-BR-<sku>` exactly. Never
`IH-SS-<sku>` for a plain SKU: that is the carbon-steel twin of a stainless
part, and its numbers (Parker 0107-4-4, Aeroquip 2027-…) are not the
stainless part's numbers.
"""
import sys, json, collections

d = json.load(open(sys.argv[1]))
live = {r[0]: r for r in json.load(open(sys.argv[2]))}
NORM = {'SSP DUOLOK': 'SSP Duolok'}
# TITAN is HD's house brand; ASCI and Brennan/Tompkins columns repeat HD's own numbering.
SKIP = {'TITAN', 'ASCI', 'Brennan / Tompkins'}
NON_INTERMIX = {'Swagelok', 'Parker A-LOK', 'SSP Duolok'}

def live_pn(sku):
    cands = ['IH-SS-' + sku[3:]] if sku.startswith('SS-') else [p + sku for p in ('IH-ST-', 'IH-TF-', 'IH-BR-')]
    return next((c for c in cands if c in live), None)

rows = {}
def add(brand, mpn, pn, src):
    b = brand.replace('®', '').strip(); b = NORM.get(b, b); m = str(mpn).strip()
    if m and b not in SKIP:
        rows.setdefault((b, m, pn), set()).add(src)

for f in d['families']:
    for v in f['variants']:
        pn = live_pn(v['sku']) if v.get('cross_ref') else None
        if pn:
            for b, m in v['cross_ref'].items():
                if m: add(b, m, pn, 'hd')
for pn, b, m, *_ in live.values():
    if m and b: add(b, m, pn, 'stored-variant')

per_size = [{'competitorBrand': b, 'competitorMpn': m, 'variantPartNumber': pn,
             'compatibility': 'compatible' if b in NON_INTERMIX else 'direct', 'source': sorted(s)}
            for (b, m, pn), s in sorted(rows.items())]
family = [{'competitorBrand': 'Crosby', 'competitorMpn': m, 'sku': s} for m, s in [
    ('404', 'IH-LR-BP-404'), ('408', 'IH-LR-BP-408'), ('409', 'IH-LR-BP-409'), ('418', 'IH-LR-BP-418'),
    ('419', 'IH-LR-BP-419'), ('406', 'IH-LR-BP-CSB420421'), ('420', 'IH-LR-BP-CSB420421'),
    ('421', 'IH-LR-BP-CSB420421'), ('407', 'IH-LR-BP-SCSB43043'), ('430', 'IH-LR-BP-SCSB43043'),
    ('431', 'IH-LR-BP-SCSB43043')]]
json.dump({'perSize': per_size, 'family': family}, open(sys.argv[3], 'w'), indent=0)
print(len(per_size), 'per-size rows', dict(collections.Counter(r['competitorBrand'] for r in per_size)),
      'on', len({live[r['variantPartNumber']][3] for r in per_size}), 'products;', len(family), 'family rows')
