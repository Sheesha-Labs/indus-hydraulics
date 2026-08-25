"""Extract hose size tables from the supplier catalogue by page GEOMETRY.

Reading order is unreliable here: on some pages the two tables are emitted
before both titles, on others they interleave. Every table is laid out under
its own family title, so the assignment rule is spatial, not sequential.
"""
import json, re, sys
import fitz

SRC = "/Users/ayushkbhatia/Documents/Indus Hydraulics Website/Catalogues/Sample Catalogues/Industrial Hoses/hose_catalogue_apr_18.pdf"
HEADER_KEYS = ("I.D", "O.D", "Nominal Bore", "Max Working", "Min Burst", "Vacuum", "Min Bend Radius", "Weight")
TITLE_RE = re.compile(r"^([A-Za-z0-9\-­]+)\s*[-–]\s*(.+)$")
NUM_RE = re.compile(r"^\d+(?:\.\d+)?\*?$")


def lines(page):
    out = []
    for b in page.get_text("dict")["blocks"]:
        if b["type"] != 0:
            continue
        for l in b["lines"]:
            txt = "".join(s["text"] for s in l["spans"]).strip()
            if txt:
                out.append({"text": txt, "x0": l["bbox"][0], "x1": l["bbox"][2],
                            "y": l["bbox"][1], "size": l["spans"][0]["size"]})
    return out


def columns_for(header_lines):
    """Column centres, from the header cells themselves."""
    cols = []
    for key in HEADER_KEYS:
        for h in header_lines:
            if h["text"].startswith(key):
                cols.append({"key": key, "cx": (h["x0"] + h["x1"]) / 2})
                break
    return sorted(cols, key=lambda c: c["cx"])


def parse_page(page, pno):
    ls = lines(page)
    titles = [l for l in ls if l["size"] >= 13.5 and TITLE_RE.match(l["text"])]
    anchors = [l for l in ls if l["text"] == "Sizes"]
    tables = []

    for a in anchors:
        # Header band: the labelled cells within ~40pt below the "Sizes" caption.
        band = [l for l in ls if a["y"] < l["y"] < a["y"] + 40
                and any(l["text"].startswith(k) for k in HEADER_KEYS)]
        cols = columns_for(band)
        if len(cols) < 4:
            continue
        top = max(l["y"] for l in band) + 4
        # Data cells: numeric, below the header, above the next anchor/title.
        stops = [t["y"] for t in titles + anchors if t["y"] > top]
        bottom = min(stops) if stops else 10_000
        cells = [l for l in ls if top < l["y"] < bottom and NUM_RE.match(l["text"].strip())]
        rows = {}
        for c in cells:
            key = round(c["y"] / 4)
            rows.setdefault(key, []).append(c)
        table = []
        for key in sorted(rows):
            cells_in_row = rows[key]
            if len(cells_in_row) < len(cols) - 1:
                continue
            row = {}
            for c in cells_in_row:
                cx = (c["x0"] + c["x1"]) / 2
                col = min(cols, key=lambda k: abs(k["cx"] - cx))
                row[col["key"]] = c["text"].strip()
            if len(row) == len(cols):
                table.append(row)
        if table:
            tables.append({"y": a["y"], "columns": [c["key"] for c in cols], "rows": table})

    # Assigning a table to its family is spatial, and the book uses two layouts.
    #
    # Usually a family owns a stacked block — title, characteristics, table — so
    # the owner is the nearest title ABOVE the table. But the composite pages
    # print BOTH titles at the top and BOTH tables underneath, where that rule
    # hands both tables to the lower title. When every table sits below every
    # title the layout is columnar, so pair them in printed order instead.
    titles.sort(key=lambda t: t["y"])
    tables.sort(key=lambda t: t["y"])
    if titles and tables and len(titles) == len(tables) and \
            min(t["y"] for t in tables) > max(t["y"] for t in titles):
        owners = list(titles)
    else:
        owners = []
        for t in tables:
            above = [ti for ti in titles if ti["y"] < t["y"]]
            owners.append(max(above, key=lambda ti: ti["y"]) if above else None)

    out = []
    for owner, t in zip(owners, tables):
        m = TITLE_RE.match(owner["text"]) if owner else None
        out.append({
            "page": pno,
            "code": (m.group(1).replace("­", "") if m else None),
            "heading": (owner["text"] if owner else None),
            "columns": t["columns"],
            "rows": t["rows"],
        })
    return out


def main():
    doc = fitz.open(SRC)
    first, last = 3, 22  # 0-based: catalogue pages 4-22, the non-metallic families
    found = []
    for i in range(first, last):
        found.extend(parse_page(doc[i], i + 1))
    json.dump(found, open("hose_tables.json", "w"), indent=1)
    print(f"{len(found)} tables, {sum(len(t['rows']) for t in found)} rows")
    for t in found:
        stated = re.search(r"(\d+(?:\.\d+)?)\s*[Bb]ar", t["heading"] or "")
        mwp = {r.get("Max Working") for r in t["rows"]}
        flag = ""
        if stated:
            if stated.group(1) not in {m.rstrip("*") for m in mwp}:
                flag = f"  <-- heading says {stated.group(1)} bar, table says {sorted(mwp)}"
        print(f"p{t['page']:>3} {str(t['code']):<12} rows={len(t['rows']):>2} cols={len(t['columns'])}{flag}")


main()
