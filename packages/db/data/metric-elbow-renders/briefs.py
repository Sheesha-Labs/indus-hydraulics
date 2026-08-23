"""Render briefs for the 14 metric adapter elbows that shipped without a photograph.

One brief per SKU, built from that product's OWN spec row — body configuration,
what is on each end, and how each end seals. Nothing is invented: if the spec
table does not say a thing, the brief does not describe it.

House style is set by the 85 adapter renders already live (see refs/): a single
zinc-plated carbon-steel fitting, three-quarter view, plain white ground, soft
studio light, centred with generous margin, square.
"""

PREAMBLE = """A single hydraulic adapter fitting, photographed as a clean product shot for a
catalogue. Zinc-plated carbon steel, bright silver, faint machining marks on the flats.
Plain pure-white background, no shadow beyond a very soft contact shadow, no props, no
hands, no text, no watermark, no measurement callouts. Three-quarter view from slightly
above so both ends are readable. The fitting is centred and occupies about 70% of the
frame with clear white margin all round. Square 1:1 crop. Photographic realism, matching
the reference images exactly in finish, lighting and framing.

The fitting to show:
"""

# end vocabulary, in the terms the spec rows use
MALE_ORING = ("a male straight metric thread with a shallow O-ring groove machined at the "
              "base of the thread against a flat shoulder")
MALE_STUD  = ("a male adjustable stud end: straight metric thread carrying a captive hex "
              "lock nut and a washer partway down it, with an O-ring groove at the base")
MALE_STUD_BSP = ("a male adjustable BSP stud end: straight parallel thread carrying a captive "
                 "hex lock nut and a washer partway down it, with an O-ring groove at the base")
CONE74     = ("a male 74°-included flare end: a smooth polished conical seat inside the mouth, "
              "with a straight metric thread behind it")
CONE60     = ("a male 60°-included flare end: a smooth polished conical seat inside the mouth, "
              "with a straight metric thread behind it")
FEM_SWIVEL = ("a female swivel end: a captive hex nut that turns freely on the body, with an "
              "internal thread visible in its mouth")
# A taper thread is NOT a flare: its mouth is a plain flat-cut bore. Said
# explicitly because the first pilot render gave it a polished conical seat,
# which would show the wrong sealing method on the page.
NPT        = ("a male NPT taper pipe thread whose crests narrow steadily towards the tip; its "
              "mouth is a plain flat-cut bore with no cone and no polished seat inside, and it "
              "has no O-ring groove")
BSPT       = ("a male BSPT taper thread whose crests narrow steadily towards the tip; its mouth "
              "is a plain flat-cut bore with no cone and no polished seat inside, and it has no "
              "O-ring groove")
ORB        = ("a male SAE O-ring boss stud: straight UN/UNF thread with a captive hex lock nut "
              "and washer partway down it and an O-ring groove at the base")
WELD_TUBE  = ("a plain unthreaded round tube stub with a square-cut end, for welding — no "
              "thread and no hex on that leg")

def scene(angle, end_a, end_b):
    return (f"A {angle}° elbow body with a hexagonal wrench flat at the corner. "
            f"One leg ends in {end_a}. The other leg ends in {end_b}.")

SCENES = [
    {"sku": "IH-AD-MET-018", "scene": scene(90, MALE_ORING, MALE_ORING)},
    {"sku": "IH-AD-MET-019", "scene": scene(90, MALE_ORING, FEM_SWIVEL)},
    {"sku": "IH-AD-MET-023", "scene": scene(45, MALE_ORING, MALE_STUD)},
    {"sku": "IH-AD-MET-024", "scene": scene(90, MALE_ORING, MALE_STUD)},
    {"sku": "IH-AD-MET-028", "scene": scene(90, MALE_ORING, WELD_TUBE)},
    {"sku": "IH-AD-MET-032", "scene": scene(90, CONE74, BSPT)},
    {"sku": "IH-AD-MET-034", "scene": scene(90, CONE74, ORB)},
    {"sku": "IH-AD-MET-036", "scene": scene(45, CONE74, NPT)},
    {"sku": "IH-AD-MET-037", "scene": scene(90, CONE74, NPT)},
    {"sku": "IH-AD-MET-041", "scene": scene(90, CONE74, MALE_STUD)},
    {"sku": "IH-AD-MET-042", "scene": scene(90, CONE74, MALE_STUD_BSP)},
    {"sku": "IH-AD-MET-044", "scene": scene(90, CONE74, FEM_SWIVEL)},
    {"sku": "IH-AD-MET-054", "scene": scene(90, CONE60, MALE_STUD)},
    {"sku": "IH-AD-MET-055", "scene": scene(90, CONE60, MALE_STUD_BSP)},
]

REFS = ["refs/elbow-jic.png", "refs/elbow-mf.png", "refs/straight-metric.png"]
