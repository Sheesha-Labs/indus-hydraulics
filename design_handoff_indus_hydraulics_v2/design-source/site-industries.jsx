/* eslint-disable */
// Industries — master + data-driven detail template.
// Layout follows the live indushydraulics.com/industries pattern; copy verbatim from the live pages.

const IND_STATS = [["6", "Industries served"], ["1,134", "Live SKUs"], ["47", "Countries shipped"], ["23 yrs", "Specialist experience"]];

const INDUSTRIES = [
  { slug: "oil-gas", name: "Oil & Gas", kicker: "UPSTREAM · MIDSTREAM · DOWNSTREAM",
    certs: ["API 6A / 16A RATED", "ATEX / IECEx", "NACE MR0175"],
    blurb: "API-rated, ATEX-certified and NACE-compliant components for wellhead controls, BOP systems, pipeline pump stations and refinery process control valves.", img: "wellhead control panel" },
  { slug: "mining", name: "Mining", kicker: "UNDERGROUND · OPEN PIT · SURFACE",
    certs: ["HIGH-CYCLE RATED", "IP67 ENCLOSURES", "COAL MINE APPROVED"],
    blurb: "High-cycle, dust-rated components for underground and open-pit mining — from roof-support proportional valves to excavator pump replacements.", img: "powered roof support" },
  { slug: "marine", name: "Marine & Offshore", kicker: "VESSELS · OFFSHORE · DREDGING",
    certs: ["★ DNV · LR · ABS · IRS APPROVED", "SS316 / DUPLEX OPTIONS", "IP66 ENCLOSURES"],
    blurb: "Saltwater-rated pumps, IP-rated valves, class-approved cylinders. We supply 64 vessels across the regional fleet — including DG-rated parts for offshore platforms and dredgers.", img: "deck machinery, offshore" },
  { slug: "steel", name: "Steel & Metals", kicker: "ROLLING MILLS · PRESSES · CASTING",
    certs: ["ROLLING MILLS", "SERVO-HYDRAULIC", "HIGH-FORCE CYLINDERS"],
    blurb: "High-force cylinders, servo valves and proportional systems for steel rolling mills, aluminium presses, forging equipment and continuous casting machines.", img: "rolling mill stand" },
  { slug: "construction", name: "Construction", kicker: "EXCAVATORS · CRANES · CONCRETE",
    certs: ["OEM REPLACEMENT", "NEXT-DAY METRO DELIVERY", "ALL MAJOR BRANDS"],
    blurb: "OEM-equivalent and upgraded hydraulic components for construction machinery. Most common excavator and crane pump models in stock at our regional warehouses.", img: "excavator boom cylinder" },
  { slug: "power", name: "Power & Energy", kicker: "HYDRO · WIND · THERMAL · DAM GATES",
    certs: ["IEC 61511 FUNCTIONAL SAFETY", "TURBINE GOVERNORS", "PITCH CONTROL"],
    blurb: "Electrohydraulic governor systems, pitch and yaw actuators for wind, Kaplan blade controls and dam gate operators — for utilities, IPPs and EPC contractors.", img: "kaplan turbine governor" },
];

function CertPills({ items, onDark }) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
    {items.map(t => <span key={t} className="mono" style={{ fontSize: 10, letterSpacing: ".08em", padding: "5px 9px", borderRadius: 3,
      border: `1px solid ${onDark ? "rgba(255,255,255,.22)" : "var(--ih-border)"}`,
      background: onDark ? "rgba(255,255,255,.07)" : "var(--ih-surface-2)",
      color: onDark ? "oklch(0.86 0.02 250)" : "var(--ih-ink-2)" }}>{t}</span>)}
  </div>;
}

function StatRow({ items, onDark, big = 34 }) {
  return <div style={{ display: "grid", gridTemplateColumns: `repeat(${items.length},1fr)`, gap: 28 }}>
    {items.map(([v, l]) => <div key={l} style={{ borderTop: `2px solid ${onDark ? "var(--ih-steel)" : "var(--ih-accent)"}`, paddingTop: 14 }}>
      <div className="mono" style={{ fontSize: big, letterSpacing: "-0.03em", lineHeight: 1, color: onDark ? "#fff" : "var(--ih-ink)" }}>{v}</div>
      <div className="eyebrow" style={{ marginTop: 10, color: onDark ? "oklch(0.72 0.03 250)" : undefined }}>{l}</div>
    </div>)}
  </div>;
}

function IndustriesMasterPage() {
  return <><UtilityBar /><SiteNav active="Industries" />
    <div style={{ background: "var(--ih-surface)", borderBottom: "1px solid var(--ih-border)", padding: "60px 48px 52px" }}>
      <Eyebrow>Industries we serve</Eyebrow>
      <h1 className="serif" style={{ fontSize: 56, marginTop: 18, maxWidth: 960, lineHeight: 1.03 }}>
        Specialist supply for the industries that <em>cannot stop</em>.
      </h1>
      <p className="lede" style={{ marginTop: 18, maxWidth: 700 }}>
        From oil well to wind turbine, from underground mine to floating drydock — our engineers understand your application, not just your part number.
      </p>
      <div style={{ marginTop: 40, maxWidth: 900 }}><StatRow items={IND_STATS} /></div>
    </div>
    <section className="ih-sec">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
        {INDUSTRIES.map(ind => <a key={ind.slug} className="ih-card" style={{ display: "flex", flexDirection: "column" }}>
          <Img style={{ aspectRatio: "16/9" }} label={ind.img} />
          <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            <div className="mono" style={{ fontSize: 9.5, letterSpacing: ".12em", color: "var(--ih-muted)" }}>{ind.kicker}</div>
            <h3 style={{ fontSize: 24, letterSpacing: "-0.02em" }}>{ind.name}</h3>
            <CertPills items={ind.certs} />
            <p style={{ fontSize: 13, color: "var(--ih-muted)", lineHeight: 1.6, flex: 1 }}>{ind.blurb}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid var(--ih-border)" }}>
              <span style={{ fontSize: 13.5, fontWeight: 500, color: "var(--ih-accent)" }}>View solutions</span>
              <span style={{ color: "var(--ih-muted-2)", display: "flex" }}>{I.arrowR}</span>
            </div>
          </div>
        </a>)}
      </div>
    </section>
    <section style={{ padding: "0 48px 72px" }}>
      <div className="ih-card" style={{ padding: "44px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 48 }}>
        <div>
          <h2 className="serif" style={{ fontSize: 32 }}>Don't see your industry listed?</h2>
          <p style={{ fontSize: 14.5, color: "var(--ih-muted)", marginTop: 10, maxWidth: 560, lineHeight: 1.6 }}>
            We supply hydraulic components across many more applications. Send us your part number or specification.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
          <Btn kind="primary" size="lg" iconR={I.arrowR}>Submit an RFQ</Btn>
          <Btn kind="outline" size="lg">Contact us</Btn>
        </div>
      </div>
    </section>
    <SiteFooter /></>;
}

// ─── Detail page data ──────────────────────────────────────────────
const IND_PAGES = {
  "oil-gas": {
    name: "Oil & Gas", crumb: "OIL & GAS",
    h1: ["Hydraulics for wells, pipelines and refineries — where ", "downtime is never an option", "."],
    lede: "API-rated, ATEX-certified and NACE-compliant components for wellhead controls, BOP systems, pipeline pump stations and refinery process control valves.",
    certs: ["API 6A / 16A RATED", "ATEX / IECEx", "NACE MR0175", "H₂S TRIM"],
    hero: "wellhead christmas tree, control panel · 1200×900",
    stats: [["220+", "Oil & gas customers"], ["18", "Yrs · upstream focus"], ["48h", "Emergency delivery"], ["24/7", "Plant-down support"]],
    deliver: [["WELLHEAD & BOP", "Blowout preventer controls", "Accumulators, shuttle valves, kill manifold components. API 16A-compliant.", "78 SKUs"],
      ["PIPELINE", "Pump station hydraulics", "Axial piston pumps, proportional valves, HPUs for mainline and booster stations.", "94 SKUs"],
      ["REFINERY", "Process valve actuators", "Rack-and-pinion and scotch-yoke actuators, NAMUR solenoids, positioners.", "112 SKUs"],
      ["OFFSHORE", "Subsea & riser systems", "High-pressure cylinders, seawater-compatible seals, ROV-interface components.", "62 SKUs"]],
    cases: [["HPCL · 2024", "Mumbai Refinery — HPU overhaul on 14 FCC control valves", "14 rotary actuators, 3 HPUs and 220+ solenoid valves replaced during planned shutdown. 9-day turnaround."],
      ["ONGC · 2025", "BHS Neelam — BOP accumulator recharge", "Emergency replacement of 6 × A10VSO-180 charge pumps on BOP stack. Plant-down response in 36h."],
      ["RELIANCE · 2024", "Jamnagar DTA — actuator upgrade programme", "Scotch-yoke actuator fleet upgrade: 32 units, HART-enabled positioners, commissioned in 4 weeks."]],
    support: { eyebrow: "PLANT-DOWN SUPPORT", h2: ["When your process line trips at 02:00, ", "we answer", "."],
      body: "Our oil & gas team maintains pre-staged critical spares and can despatch to wellhead, pipeline station or refinery gate within 48 hours — anywhere in our service network.",
      checks: ["Pre-staged API-rated critical spares", "ATEX-certified components from stock", "On-site commissioning by certified hydraulic technicians", "NACE-compliant materials, certified documentation"],
      cta: "Request plant-down support", img: "oil & gas service team · 720×560" },
  },
  mining: {
    name: "Mining", crumb: "MINING",
    h1: ["Heavy-duty hydraulics for roof supports, haul trucks and ", "continuous miners", "."],
    lede: "High-cycle, dust-rated components for underground and open-pit mining — from roof-support proportional valves to excavator pump replacements.",
    certs: ["HIGH-CYCLE RATED", "IP67 ENCLOSURES", "COAL MINE APPROVED", "CBM CERTIFIED"],
    hero: "powered roof support, underground · 1200×900",
    stats: [["85+", "Mining sites served"], ["14", "Yrs · mining focus"], ["72h", "Site delivery (remote)"], ["24/7", "Plant-down line"]],
    deliver: [["UNDERGROUND", "Roof support systems", "Proportional valves, high-pressure cylinders and pumps for powered roof supports.", "96 SKUs"],
      ["HAUL TRUCKS", "Steering & hoist", "Replacement hydraulics for Cat, Komatsu and Liebherr haul trucks. Quick-fit hoses.", "74 SKUs"],
      ["CONTINUOUS MINERS", "Cutting & conveying", "High-flow pumps and directional valves for Joy, Sandvik and Atlas Copco machines.", "58 SKUs"],
      ["SURFACE", "Draglines & shovels", "Large bore cylinders, high-pressure accumulators for P&H, BE and Bucyrus machines.", "42 SKUs"]],
    cases: [["COAL INDIA · 2024", "Singrauli — 48-unit roof support valve overhaul", "48 proportional valves on DBT shield supports replaced during panel setup. Zero unplanned downtime."],
      ["VEDANTA · 2024", "Lanjigarh — Komatsu 930E haul truck fleet", "Hydraulic pump kits for 12 × Komatsu 930E trucks. Site delivery to Odisha in 72h."],
      ["HINDALCO · 2025", "Mahan — continuous miner pump replacement", "Joy 14CM15 cutter-head pump failure. Swap unit despatched overnight. Mine back online in 18h."]],
    support: { eyebrow: "REMOTE SITE SUPPORT", h2: ["We deliver to pit head and shaft collar — ", "72 hours", ", anywhere in our service network."],
      body: "Our mining logistics team coordinates airfreight, DG certification and last-mile delivery to the most remote sites. Pre-agreed exchange kits for repeat customers.",
      checks: ["Pre-staged exchange kits by machine type", "DG / PESO certified documentation", "On-site commissioning support available", "Quality certs and test reports standard"],
      cta: "Request mining support", img: "mining service team at pit head · 720×560" },
  },
  construction: {
    name: "Construction", crumb: "CONSTRUCTION",
    h1: ["Replacement hydraulics for excavators, cranes and concrete pumps — ", "fast", "."],
    lede: "OEM-equivalent and upgraded hydraulic components for construction machinery. Most common excavator and crane pump models in stock at our regional warehouses.",
    certs: ["OEM REPLACEMENT", "NEXT-DAY METRO DELIVERY", "ALL MAJOR BRANDS", "GENUINE & AFTERMARKET"],
    hero: "excavator boom, site · 1200×900",
    stats: [["300+", "Construction customers"], ["8", "Yrs · construction focus"], ["24h", "Metro delivery"], ["1200+", "Excavator pump SKUs"]],
    deliver: [["EXCAVATORS", "Main & pilot pumps", "Replacement pumps for Cat, Komatsu, Hitachi, Hyundai, Volvo and Doosan machines.", "420 SKUs"],
      ["CRANES", "Slewing & luffing", "Fixed and variable displacement pumps and motors for crawler and truck cranes.", "186 SKUs"],
      ["CONCRETE", "Pump & mixer drives", "High-pressure piston pumps, rock valve cylinders, boom hydraulics for truck-mounted pumps.", "94 SKUs"],
      ["COMPACTION", "Vibro & roller drives", "Eaton and Bosch orbit motors, charge pumps, drum drive axle drives for compactors.", "68 SKUs"]],
    cases: [["SHAPOORJI PALLONJI · 2024", "Bandra Dharavi — Cat 390 main pump", "Emergency replacement of twin-pump assembly on Cat 390 excavator. Site delivery to Mumbai in 18h."],
      ["AFCONS · 2025", "Zojila tunnel — Liebherr LTM crane", "Slewing pump kit for LTM 1100-5.2. Altitude delivery to J&K site. 48h turnaround."],
      ["PUTZMEISTER · 2024", "Pune — PM 47Z boom pump rebuild", "Rock valve cylinder set + piston wear kit for 47-metre boom pump. Scheduled PM support."]],
    support: { eyebrow: "SAME-DAY METRO DELIVERY", h2: ["Pump fails at 06:00 — ", "we're at your site by lunch", "."],
      body: "Same-day delivery on stocked SKUs across our partner metro network. WhatsApp your model number and get a live stock check in minutes.",
      checks: ["Live stock check via WhatsApp in 5 minutes", "Same-day delivery in partner metro cities", "OEM cross-reference database for all major brands", "Exchange programme for large pumps and motors"],
      cta: "Check availability now", img: "construction service team, site delivery · 720×560" },
  },
  power: {
    name: "Power & Energy", crumb: "POWER & ENERGY",
    h1: ["Precision actuators for hydro turbines, wind pitch systems and ", "dam gates", "."],
    lede: "Electrohydraulic governor systems, pitch and yaw actuators for wind, Kaplan blade controls and dam gate operators — for utilities, IPPs and EPC contractors.",
    certs: ["IEC 61511 FUNCTIONAL SAFETY", "TURBINE GOVERNORS", "PITCH CONTROL", "REDUNDANT SYSTEMS"],
    hero: "kaplan turbine governor cabinet · 1200×900",
    stats: [["28", "Power plants served"], ["10", "Yrs · energy focus"], ["4000 MW", "Installed base"], ["48h", "Critical delivery"]],
    deliver: [["HYDRO TURBINES", "Governor systems", "Moog and Bosch servo valves for Francis, Kaplan and Pelton governors. Redundant configurations.", "52 SKUs"],
      ["WIND ENERGY", "Pitch & yaw systems", "Compact hydraulic pitch cylinders, proportional valves and HPUs for onshore turbines.", "38 SKUs"],
      ["DAM GATES", "Gate operators", "High-force cylinders, electro-hydraulic power packs for radial, tainter and flap gates.", "44 SKUs"],
      ["THERMAL & GAS", "Steam valve actuators", "High-temperature rack-and-pinion actuators, positioners and solenoids for turbine steam valves.", "66 SKUs"]],
    cases: [["NHPC · 2024", "Salal hydro — Kaplan runner blade controls", "4 units servo valve replacement on Kaplan runner blade controls. Plant back to full capacity in 72h."],
      ["NTPC WIND · 2025", "Rojmal wind farm — pitch HPU overhaul", "12 × pitch HPU systems overhauled during annual maintenance window. Full redundancy restored."],
      ["DAMODAR VALLEY · 2024", "Panchet dam — radial gate operators", "6 radial gate operator cylinder sets replaced. Monsoon-readiness certification met ahead of schedule."]],
    support: { eyebrow: "OUTAGE SUPPORT", h2: ["We plan to your maintenance schedule — and ", "respond when the plan changes", "."],
      body: "Our power team pre-stages governor and pitch components ahead of planned outages. When an unplanned trip occurs, our 24/7 line connects you to a hydraulic engineer in minutes.",
      checks: ["Outage-aligned pre-staged critical spares", "IEC 61511 compliant components available", "On-site commissioning and testing support", "As-built documentation and traceability records"],
      cta: "Plan your outage support", img: "power & energy service team · 720×560" },
  },
  marine: {
    name: "Marine & Offshore", crumb: "MARINE & OFFSHORE",
    h1: ["Saltwater-rated hydraulics for deck machinery, steering gear and ", "dredging plant", "."],
    lede: "Saltwater-rated pumps, IP-rated valves, class-approved cylinders. We supply 64 vessels across the regional fleet — including DG-rated parts for offshore platforms and dredgers.",
    certs: ["★ DNV · LR · ABS · IRS APPROVED", "SS316 / DUPLEX OPTIONS", "IP66 ENCLOSURES", "SALT-SPRAY TESTED"],
    hero: "deck crane and winch hydraulics, offshore vessel · 1200×900",
    stats: [["64", "Vessels supplied"], ["16", "Yrs · marine focus"], ["4", "Class societies"], ["48h", "Port-call delivery"]],
    deliver: [["DECK MACHINERY", "Winches & cranes", "Radial piston motors, brake valves and power packs for mooring winches and provision cranes.", "88 SKUs"],
      ["STEERING GEAR", "Rudder & thruster", "Rotary vane and ram-type steering actuators, follow-up controls, class-approved spares.", "54 SKUs"],
      ["HATCH & RAMP", "Covers & doors", "Tie-rod and telescopic cylinders for hatch covers, stern ramps and bow visors.", "72 SKUs"],
      ["DREDGING", "Cutter & pump drives", "High-flow closed-circuit pumps and motors for cutter heads, spud carriages and gantries.", "46 SKUs"]],
    cases: [["ADNOC L&S · 2025", "Jebel Ali — mooring winch motor overhaul", "Six radial piston motors on two AHTS vessels rebuilt during a single port call. 48-hour turnaround alongside."],
      ["DP WORLD · 2024", "Mina Rashid — stern ramp cylinder set", "Four ramp cylinders re-sleeved with duplex rods after chloride pitting. Class survey passed on first inspection."],
      ["NMDC DREDGING · 2025", "Abu Dhabi — cutter drive circuit rebuild", "Closed-circuit pump and motor pair replaced on a cutter suction dredger. Back on the cut in 5 days."]],
    support: { eyebrow: "PORT-CALL SUPPORT", h2: ["A vessel alongside is a clock. ", "We work to it", "."],
      body: "Our marine desk holds class-certified spares in Jebel Ali bonded stock and delivers to berth, dry dock or anchorage. Where a class survey is involved, we produce the certification with the part.",
      checks: ["Class-approved spares from bonded stock", "DNV / LR / ABS / IRS certification with the part", "Attendance alongside or in dry dock", "Duplex and SS316 options for chloride service"],
      cta: "Request port-call support", img: "marine service team alongside · 720×560" },
  },
  steel: {
    name: "Steel & Metals", crumb: "STEEL & METALS",
    h1: ["High-force hydraulics for rolling mills, presses and ", "continuous casting", "."],
    lede: "High-force cylinders, servo valves and proportional systems for steel rolling mills, aluminium presses, forging equipment and continuous casting machines.",
    certs: ["ROLLING MILLS", "SERVO-HYDRAULIC", "HIGH-FORCE CYLINDERS", "HEAT-DUTY SEALS"],
    hero: "rolling mill stand, hydraulic gap control · 1200×900",
    stats: [["46", "Mills & plants served"], ["19", "Yrs · metals focus"], ["12,000 kN", "Largest cylinder supplied"], ["24/7", "Breakdown line"]],
    deliver: [["ROLLING MILLS", "Gap & AGC control", "Servo valves, position transducers and capsule cylinders for automatic gauge control.", "68 SKUs"],
      ["PRESSES", "Forging & extrusion", "Large-bore cylinders, prefill valves and high-pressure pumps for presses to 12,000 kN.", "82 SKUs"],
      ["CONTINUOUS CASTING", "Mould oscillation", "Servo-hydraulic oscillators, proportional valves and hot-environment seal packages.", "44 SKUs"],
      ["HANDLING", "Coilers & manipulators", "Motors, brake valves and cylinders for coilers, tilters and charging manipulators.", "58 SKUs"]],
    cases: [["EMIRATES STEEL · 2025", "Abu Dhabi — AGC servo valve replacement", "Eight Moog servo valves on two mill stands swapped during a planned stop. Gauge tolerance restored inside one shift."],
      ["HADEED · 2024", "Jubail — 6,300 kN press cylinder rebuild", "Main press cylinder re-sleeved and re-sealed with heat-duty compounds. 14 days, against a 6-week replacement lead."],
      ["ALBA · 2025", "Bahrain — caster oscillator overhaul", "Two mould oscillators rebuilt and re-tuned on the rig. Oscillation profile back inside spec on first trial cast."]],
    support: { eyebrow: "PLANNED-STOP SUPPORT", h2: ["A mill stop is measured in tonnes. ", "We pre-stage for it", "."],
      body: "Our metals team works to your planned-stop calendar, pre-staging servo valves, seal kits and capsule cylinders ahead of the window. When a stand goes down unplanned, the breakdown line is answered by an engineer.",
      checks: ["Stop-aligned pre-staged critical spares", "Servo valve bench testing and re-tuning", "Hot-environment seal and hose specification", "On-site commissioning during the window"],
      cta: "Plan your stop support", img: "metals service team at mill stand · 720×560" },
  },
};

function IndustryDetailPage({ slug }) {
  const d = IND_PAGES[slug];
  return <><UtilityBar /><SiteNav active="Industries" />
    {/* HERO — breadcrumb, long declarative title, lede, cert pills, stat row */}
    <div style={{ background: "var(--ih-surface)", borderBottom: "1px solid var(--ih-border)", padding: "26px 48px 48px" }}>
      <div className="ih-crumb" style={{ marginBottom: 22 }}>
        <span style={{ color: "var(--ih-accent)" }}>INDUSTRIES</span><span style={{ opacity: .5 }}>/</span><span style={{ color: "var(--ih-ink-2)" }}>{d.crumb}</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 56, alignItems: "center" }}>
        <div>
          <h1 className="serif" style={{ fontSize: 52, lineHeight: 1.04 }}>{d.h1[0]}<em>{d.h1[1]}</em>{d.h1[2]}</h1>
          <p className="lede" style={{ marginTop: 18, maxWidth: 580 }}>{d.lede}</p>
          <div style={{ marginTop: 22 }}><CertPills items={d.certs} /></div>
        </div>
        <Img style={{ aspectRatio: "4/3", borderRadius: 12 }} label={d.hero} />
      </div>
      <div style={{ marginTop: 44 }}><StatRow items={d.stats} /></div>
    </div>

    {/* WHERE WE DELIVER */}
    <section className="ih-sec">
      <SecHead eyebrow="Application areas" title="Where we deliver" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--ih-border)", border: "1px solid var(--ih-border)", borderRadius: 10, overflow: "hidden" }}>
        {d.deliver.map(([tag, t, desc, n]) => <a key={t} style={{ background: "var(--ih-surface)", padding: "26px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div className="mono" style={{ fontSize: 9.5, letterSpacing: ".12em", color: "var(--ih-steel)" }}>{tag}</div>
          <h3 style={{ fontSize: 18, lineHeight: 1.25 }}>{t}</h3>
          <p style={{ fontSize: 12.5, color: "var(--ih-muted)", lineHeight: 1.6, flex: 1 }}>{desc}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 7, paddingTop: 12, borderTop: "1px solid var(--ih-border)" }}>
            <span className="mono" style={{ fontSize: 12, color: "var(--ih-accent)" }}>{n}</span>
            <span style={{ color: "var(--ih-accent)", display: "flex" }}>{I.arrowR}</span>
          </div>
        </a>)}
      </div>
    </section>

    {/* RATED SKUs */}
    <section className="ih-sec" style={{ paddingTop: 0 }}>
      <SecHead eyebrow="From the catalogue" title={`${d.name}-rated SKUs`}
        action={<Btn kind="outline" iconR={I.arrowR}>All {d.name} SKUs</Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {[...PRODUCTS, ...PRODUCTS.slice(0, 0)].slice(0, 8).map(p => <ProdCard key={p.sku} p={p} compact />)}
      </div>
    </section>

    {/* REFERENCE INSTALLS */}
    <section className="ih-sec" style={{ paddingTop: 0 }}>
      <SecHead eyebrow="Reference installs" title="A few of the projects we serve"
        action={<Btn kind="ghost" iconR={I.arrowR}>All case studies</Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
        {d.cases.map(([who, t, body]) => <a key={t} className="ih-card" style={{ display: "flex", flexDirection: "column" }}>
          <Img style={{ aspectRatio: "16/9" }} label={t.split("—")[0].trim().toLowerCase()}>
            <span className="ih-badge ih-badge--square ih-badge--navy" style={{ position: "absolute", top: 12, left: 12 }}>CASE</span>
          </Img>
          <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".1em", color: "var(--ih-muted)" }}>{who}</div>
            <h3 style={{ fontSize: 17.5, lineHeight: 1.3 }}>{t}</h3>
            <p style={{ fontSize: 13, color: "var(--ih-muted)", lineHeight: 1.6, flex: 1 }}>{body}</p>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ih-accent)", display: "inline-flex", gap: 6, alignItems: "center", paddingTop: 12, borderTop: "1px solid var(--ih-border)" }}>Read the case {I.arrowR}</span>
          </div>
        </a>)}
      </div>
    </section>

    {/* QUOTE BAND */}
    <section style={{ padding: "0 48px 64px" }}>
      <div className="ih-card" style={{ padding: "40px 44px", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 48, alignItems: "center", background: "var(--ih-steel-soft)", borderColor: "oklch(0.88 0.03 240)" }}>
        <div>
          <h2 className="serif" style={{ fontSize: 30 }}>Quoting a project in {d.name}?</h2>
          <p style={{ fontSize: 14.5, color: "var(--ih-ink-2)", marginTop: 10, lineHeight: 1.6, maxWidth: 560 }}>
            Tell our applications team what you're specifying. We reply within one business day with availability, lead time and a fixed-price quote — no obligation.
          </p>
        </div>
        <div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn kind="primary" iconR={I.arrowR}>Request a quote</Btn>
            <Btn kind="outline" style={{ background: "var(--ih-surface)" }}>WhatsApp us</Btn>
            <Btn kind="outline" style={{ background: "var(--ih-surface)" }} icon={I.mail}>Email</Btn>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ih-muted)", marginTop: 14 }}>
            Plant-down? <span style={{ color: "var(--ih-accent)", fontWeight: 500 }}>Call +971 52 2477942</span> — 24/7
          </div>
        </div>
      </div>
    </section>

    {/* SUPPORT BAND — the one navy panel on the page */}
    <section style={{ background: "var(--ih-navy)", padding: "56px 48px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 56, alignItems: "center" }}>
        <div>
          <Eyebrow style={{ color: "var(--ih-steel)" }}>{d.support.eyebrow}</Eyebrow>
          <h2 className="serif" style={{ fontSize: 36, color: "#fff", marginTop: 16, lineHeight: 1.12 }}>
            {d.support.h2[0]}<em>{d.support.h2[1]}</em>{d.support.h2[2]}
          </h2>
          <p style={{ fontSize: 14.5, color: "oklch(0.82 0.02 250)", marginTop: 16, lineHeight: 1.65, maxWidth: 540 }}>{d.support.body}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 26 }}>
            {d.support.checks.map(c => <div key={c} style={{ display: "flex", gap: 9, alignItems: "flex-start" }}>
              <span style={{ color: "var(--ih-steel)", display: "flex", marginTop: 1 }}><Icn size={15} sw={2.2} d={<path d="m5 12 5 5L20 7" />} /></span>
              <span style={{ fontSize: 13, color: "oklch(0.88 0.015 250)", lineHeight: 1.5 }}>{c}</span>
            </div>)}
          </div>
          <Btn kind="primary" size="lg" iconR={I.arrowR} style={{ marginTop: 28 }}>{d.support.cta}</Btn>
        </div>
        <div>
          <Img navy style={{ aspectRatio: "4/3", borderRadius: 12 }} label={d.support.img} />
          <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: "oklch(0.68 0.03 250)", marginTop: 12, textAlign: "right" }}>
            {d.name.toUpperCase()} SERVICE TEAM
          </div>
        </div>
      </div>
    </section>
    <SiteFooter /></>;
}
Object.assign(window, { IndustriesMasterPage, IndustryDetailPage, INDUSTRIES, IND_PAGES, CertPills, StatRow });
