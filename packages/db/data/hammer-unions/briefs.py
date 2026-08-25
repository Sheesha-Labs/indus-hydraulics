"""
Render briefs for the 29 hammer union listings.

One brief per SKU, composed from that listing's OWN spec row — figure number,
union type, end connection, seal arrangement, seat material. Nothing here is
traced from a supplier's photograph, and no catalogue page is fed to the model.
A part rendered from its own dimensional description is our asset; a
regenerated copy of someone else's photo is theirs with the watermark taken
off, and it stays theirs. That rule is from README-gap-fill-render-briefs.md
and it did not change for this batch.

The catalogue images WERE read, closely, to get the geometry right — the
three-lug wing nut, the ball-nose male sub against the coned female sub, the
bronze ring in the Figure 600. Reading a drawing and copying a photograph are
different acts.

House style follows refs/: single part, three-quarter view from slightly above,
plain near-white ground, soft key light, gentle contact shadow, square crop.

NO PAINT. Real hammer unions are usually painted, and the colour carries a
figure code that differs between manufacturers — a red nut means one rating at
one mill and another elsewhere. Rendering a colour would assert a code we have
no source for, so every union here is bare steel. Said explicitly in the
preamble so the model does not helpfully invent one.

Usage:
    python3 briefs.py            # print every brief
    python3 briefs.py --json     # emit scenes.json for run.py
"""
import json
import sys
from pathlib import Path

PREAMBLE = """A single oilfield hammer union (wing union), photographed as a clean product shot for
a catalogue. Forged carbon steel with a bare, unpainted machined finish: mid-grey steel with a
faint turned sheen on the body, slightly brighter on the machined faces. NO PAINT, no colour
coating, no coloured nut, no figure-number colour code, no stencilled text, no stamped
lettering, no logos, no watermark, no measurement callouts, no scale props, no hands, no
packaging.

Plain near-white studio background, soft key light from the upper left, a gentle contact
shadow beneath the part and nothing more. Three-quarter view from slightly above, so both ends
of the union and the wing nut are readable. The union is centred and fills about 70% of the
frame with clear margin all round. Square 1:1 crop, photographic realism, matching the
reference images in finish, lighting and framing.

The union to show:
"""

# ── Anatomy, in the terms the catalogue itself uses ────────────────────────
ASSEMBLY = (
    "The complete union set, assembled in line and lying horizontally: a male sub at one end, "
    "a female sub at the other, and a heavy wing nut in the middle drawing the two together. "
    "The wing nut is a thick collar carrying three stout radial lugs spaced evenly around it, "
    "the lugs squared-off and slightly rounded at their tips — these are what a sledgehammer "
    "strikes. The nut turns on a coarse thread cut on the male sub and pulls a shoulder on the "
    "female sub against the seat."
)

SEATS = {
    "ball_cone": "The male sub ends in a smooth convex spherical nose that beds into a matching "
                 "machined cone inside the female sub — a metal-to-metal ball-and-cone seat.",
    "ball_cone_oring": "The male sub ends in a smooth convex spherical nose that beds into a "
                       "matching machined cone inside the female sub, and a narrow black "
                       "elastomer O-ring sits in a groove machined into the male sub's seating "
                       "face just behind the nose.",
    "oring": "A narrow black elastomer O-ring sits in a groove machined into the male sub's "
             "flat seating face.",
    "flat_oring": "The two subs meet on flat machined faces rather than a cone, with a narrow "
                  "black elastomer O-ring set into a groove in the male sub's flat face.",
    "lip_seal": "A dark elastomer lip seal sits in a rectangular groove machined into the male "
                "sub's seating face, its section visibly wider and squarer than an O-ring, "
                "backing a steel-to-steel seat behind it.",
    "lip_seal_ring": "A dark elastomer lip seal sits in a rectangular groove machined into the "
                     "male sub's seating face, with a thin bright metal anti-extrusion ring "
                     "seated in the groove beside it.",
    "bronze": "The female sub carries a bronze seat insert — a distinct warm golden-brown ring "
              "set flush into the machined cone, clearly a different metal from the grey steel "
              "around it. The male sub ends in a smooth convex spherical nose that beds against "
              "it.",
    "insulated": "A non-metallic insulating ring of matte dark composite sits between the two "
                 "subs, standing slightly proud so that no steel face touches steel across the "
                 "joint, with a second elastomer seal inboard of it.",
}

ENDS = {
    "threaded": "Both subs carry a female line pipe thread in a plain flat-cut bore at their "
                "outer ends, the thread visible inside the mouth.",
    "buttweld": "Both subs end in a plain unthreaded cylindrical pipe stub with a square-cut, "
                "bevelled end prepared for butt welding — no thread anywhere on the outer ends.",
    "socketweld": "Both subs end in a plain unthreaded cylindrical socket with a counterbored "
                  "mouth for socket welding — no thread on the outer ends.",
    "both": "One sub carries a female line pipe thread in a plain flat-cut bore; the other ends "
            "in a plain unthreaded cylindrical pipe stub with a bevelled, square-cut end "
            "prepared for butt welding.",
}

PROPORTION = {
    "light": "The union is lightly proportioned, its wall section modest against the bore.",
    "medium": "The union is solidly proportioned, with a noticeably thick wall section.",
    "heavy": "The union is heavily proportioned for high pressure: a very thick wall section, a "
             "deep wing nut and short, stout lugs.",
}

# sku -> (ends, seat, proportion, extra)
SCENES = {
    # ── Standard service ──────────────────────────────────────────────────
    "IH-FI-HU-50-NPT-500-STD-INDUS": ("both", "oring", "light", None),
    "IH-FI-HU-100-NPT-1K-STD-INDUS": ("threaded", "ball_cone", "light", None),
    "IH-FI-HU-200-NPT-2K-STD-INDUS": ("threaded", "ball_cone", "light", None),
    "IH-FI-HU-200-BW-2K-STD-INDUS": ("buttweld", "ball_cone", "light", None),
    "IH-FI-HU-206-NPT-2K-STD-INDUS": ("threaded", "ball_cone_oring", "light", None),
    "IH-FI-HU-206-BW-2K-STD-INDUS": ("buttweld", "ball_cone_oring", "light", None),
    "IH-FI-HU-207-NPT-2K-STD-INDUS": (
        "threaded", "oring", "light",
        "This is a BLANKING CAP, not a through union: only one sub is a pipe end. The other "
        "side is a solid domed steel cap that closes the bore completely, held on by the wing "
        "nut. Nothing passes through it and there is no second pipe connection."),
    "IH-FI-HU-211-NPT-2K-STD-INDUS": ("threaded", "insulated", "light", None),
    "IH-FI-HU-300-NPT-2K-STD-INDUS": ("threaded", "flat_oring", "light", None),
    "IH-FI-HU-400-NPT-4K-STD-INDUS": ("threaded", "ball_cone", "medium", None),
    "IH-FI-HU-600-NPT-6K-STD-INDUS": ("threaded", "bronze", "medium", None),
    "IH-FI-HU-602-NPT-6K-STD-INDUS": ("threaded", "lip_seal", "medium", None),
    "IH-FI-HU-602-BW-6K-STD-INDUS": ("buttweld", "lip_seal", "medium", None),
    "IH-FI-HU-1002-NPT-10K-STD-INDUS": ("threaded", "lip_seal", "heavy", None),
    "IH-FI-HU-1002-BW-10K-STD-INDUS": ("buttweld", "lip_seal", "heavy", None),
    "IH-FI-HU-1003-TBW-10K-STD-INDUS": (
        "both", "oring", "heavy",
        "This is a MISALIGNING union. The two subs meet on a spherical joint and are shown "
        "deliberately out of line: the female sub sits at a visible angle of roughly seven "
        "degrees off the male sub's centre line, so the two pipe ends do not point straight at "
        "one another. The seat stays fully closed at that angle."),
    "IH-FI-HU-1004-BW-10K-STD-INDUS": ("buttweld", "lip_seal", "heavy", None),
    "IH-FI-HU-1502-NPT-15K-STD-INDUS": ("threaded", "lip_seal", "heavy", None),
    "IH-FI-HU-1502-BW-15K-STD-INDUS": ("buttweld", "lip_seal", "heavy", None),
    "IH-FI-HU-1505-TBW-15K-STD-INDUS": (
        "both", "lip_seal", "heavy",
        "The nut carries a short raised machined marker on its outer face at the point where the "
        "thread starts, a small rectangular pip standing proud of the surface — this is the "
        "thread start marker."),
    "IH-FI-HU-2002-BW-20K-STD-INDUS": ("buttweld", "lip_seal_ring", "heavy", None),
    # ── Sour gas service ──────────────────────────────────────────────────
    # Sour trim is a metallurgy and hardness question, not a visible one. The
    # sour renders are therefore identical in geometry to their standard
    # siblings; nothing in the frame claims a trim it cannot show.
    "IH-FI-HU-602-NPT-6K-SOUR-INDUS": ("threaded", "lip_seal", "medium", None),
    "IH-FI-HU-602-BW-6K-SOUR-INDUS": ("buttweld", "lip_seal", "medium", None),
    "IH-FI-HU-1002-NPT-7K5-SOUR-INDUS": ("threaded", "lip_seal", "heavy", None),
    "IH-FI-HU-1002-BW-7K5-SOUR-INDUS": ("buttweld", "lip_seal", "heavy", None),
    "IH-FI-HU-1003-TBW-7K5-SOUR-INDUS": (
        "both", "oring", "heavy",
        "This is a MISALIGNING union. The two subs meet on a spherical joint and are shown "
        "deliberately out of line: the female sub sits at a visible angle of roughly seven "
        "degrees off the male sub's centre line, so the two pipe ends do not point straight at "
        "one another. The seat stays fully closed at that angle."),
    "IH-FI-HU-1004-BW-7K5-SOUR-INDUS": ("buttweld", "lip_seal", "heavy", None),
    "IH-FI-HU-1502-NPT-10K-SOUR-INDUS": ("threaded", "lip_seal", "heavy", None),
    "IH-FI-HU-1502-BW-10K-SOUR-INDUS": ("buttweld", "lip_seal", "heavy", None),
    "IH-FI-HU-2202-BW-15K-SOUR-INDUS": ("buttweld", "lip_seal_ring", "heavy", None),
}


def brief(sku: str) -> str:
    ends, seat, prop, extra = SCENES[sku]
    body = f"{ASSEMBLY} {PROPORTION[prop]} {ENDS[ends]} {SEATS[seat]}"
    if extra:
        body += f" {extra}"
    return PREAMBLE + body


def main() -> None:
    if '--json' in sys.argv:
        out = [{"sku": s, "prompt": brief(s)} for s in SCENES]
        Path(__file__).with_name('scenes.json').write_text(
            json.dumps(out, indent=2, ensure_ascii=False) + '\n')
        print(f'{len(out)} briefs written to scenes.json')
        return
    for s in SCENES:
        print('=' * 72)
        print(s)
        print(brief(s))


if __name__ == '__main__':
    main()
