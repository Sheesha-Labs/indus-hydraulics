"""Turn the extracted hose tables into a `backfill-fitting-size-tables` payload.

One catalogue family = one of our listings, matched on the part code in the
SKU (`IH-IH-A190` <- `A190`). The book prints bore in millimetres only, so the
inch column is DERIVED from the industry nominal ladder and emitted only for
bores that ladder actually names — never rounded into existence.
"""
import json, re
from collections import OrderedDict

TABLES = json.load(open("hose_tables.json"))

# Our listing SKUs, keyed by the catalogue's own part code.
SKUS = {
    "A101AS-T3": "IH-IH-A101AS-T3", "A101HP": "IH-IH-A101HP", "A102HP": "IH-IH-A102HP",
    "A103HP": "IH-IH-A103HP", "A105HP": "IH-IH-A105HP", "A116EU100": "IH-IH-A116EU100",
    "A190": "IH-IH-A190", "A190Y": "IH-IH-A190Y", "A210": "IH-IH-A210", "A216": "IH-IH-A216",
    "DELVAC": "IH-IH-DELVAC", "IRRIBULK": "IH-IH-IRRIBULK", "SANB": "IH-IH-SANB",
    "SANF": "IH-IH-SANF", "SANSIL": "IH-IH-SANSIL", "DELIKATESSE": "IH-IH-DELIKATESSE",
    "PREMVIN": "IH-IH-PREMVIN", "BAKU": "IH-IH-BAKU", "A104": "IH-IH-A104", "A110": "IH-IH-A110",
    "A125": "IH-IH-A125", "A420": "IH-IH-A420", "A430": "IH-IH-A430", "A460": "IH-IH-A460",
    "A400EU": "IH-IH-A400EU", "A410": "IH-IH-A410", "A416": "IH-IH-A416",
    "A901GG": "IH-IH-A901GG", "A901AG": "IH-IH-A901AG", "A906PG": "IH-IH-A906PG",
    "A911SG": "IH-IH-A911SG", "A230": "IH-IH-A230", "A235BK": "IH-IH-A235BK",
    "A235BU": "IH-IH-A235BU", "A361": "IH-IH-A361", "PREMFLEX": "IH-IH-PREMFLEX",
}

# Nominal hose bore ladder. mm -> the inch size the trade calls that bore. Only
# the rungs the trade actually names; an unlisted bore gets no inch label.
INCH = {
    5: '3/16"', 6: '1/4"', 8: '5/16"', 10: '3/8"', 13: '1/2"', 16: '5/8"', 19: '3/4"',
    25: '1"', 32: '1-1/4"', 38: '1-1/2"', 51: '2"', 63: '2-1/2"', 76: '3"', 102: '4"',
    127: '5"', 152: '6"', 203: '8"', 254: '10"', 305: '12"',
}

# Listings whose PUBLISHED working pressure was set by the founder against the
# manufacturer figure (see the 2026-08-21 rebrand). Their size tables ship
# WITHOUT the two pressure columns rather than printing a figure that argues
# with the same page's title and spec table.
PRESSURE_WITHHELD = {
    "A125": ("catalogue 25 bar", "page states 20 bar"),
    "A235BK": ("catalogue 7 bar", "page states 10 bar"),
    "A901GG": ("catalogue 14 bar", "page states 20 bar"),
    "A906PG": ("catalogue 14 bar", "page states 20 bar"),
    "A911SG": ("catalogue 14 bar", "page states 20 bar"),
}


def num(v):
    return float(v) if "." in v else int(v)


def build():
    products, notes, derated = [], [], []
    for t in TABLES:
        code = t["code"]
        sku = SKUS[code]
        withheld = code in PRESSURE_WITHHELD
        variants = []
        for i, row in enumerate(t["rows"]):
            bore_key = "Nominal Bore" if "Nominal Bore" in t["columns"] else "I.D"
            bore = int(float(row[bore_key]))
            dims = OrderedDict()
            if "O.D" in row:
                dims["hoseOD"] = num(row["O.D"])
            if not withheld and "Min Burst" in row:
                dims["burstPressure"] = num(row["Min Burst"].rstrip("*"))
            if "Vacuum" in row:
                dims["vacuum"] = num(row["Vacuum"])
            if "Min Bend Radius" in row:
                dims["bendRadius"] = num(row["Min Bend Radius"])
            if "Weight" in row:
                dims["weightPerMetre"] = num(row["Weight"])

            wp_raw = row.get("Max Working", "")
            if wp_raw.endswith("*"):
                derated.append(f"{code} DN{bore}: {wp_raw} — the book stars this row, "
                               f"stating a safety factor for the family 'except *' without "
                               f"giving the exception's figure")
            variants.append({
                "partNumber": f"{sku}-{bore:03d}",
                "position": i,
                "hoseDash": None,
                "hoseInch": INCH.get(bore),
                "hoseDn": bore,
                "portLabel": None,
                "portDash": None,
                "weightG": None,
                "pressureBar": None if withheld else num(wp_raw.rstrip("*")),
                "dimensions": dims,
                "sourcePart": f"{code} DN{bore}",
            })
        if withheld:
            cat, page = PRESSURE_WITHHELD[code]
            notes.append(f"{sku}: working and burst pressure columns withheld — {cat}, {page}.")
        products.append({
            "sku": sku,
            "sources": [f"{code} (catalogue p{t['page']})"],
            "variants": variants,
        })

    payload = {
        "source": "Industrial hose catalogue, 36 non-metallic families, pages 4-22",
        "sizeFieldCorrections": [],
        "duplicateRowsDropped": [],
        "columnsNotPublished": [],  # noqa - see README
        "_columnsNote": [
            "None. Every printed column is carried, except on the five listings "
            "named in pressureWithheld.",
        ],
        "pressureWithheld": notes,
        "deratedRowsFlagged": derated,
        "products": sorted(products, key=lambda p: p["sku"]),
    }
    json.dump(payload, open("hose-size-tables.json", "w"), indent=1)
    print(f"{len(products)} listings, {sum(len(p['variants']) for p in products)} sizes")
    print(f"pressure withheld on {len(notes)}; {len(derated)} starred rows flagged")
    missing = set(SKUS) - {t["code"] for t in TABLES}
    print("families with no table:", missing or "none")


build()
