/* eslint-disable */
// Long-form service & insight templates, recoloured from the three earlier concepts:
//  · ServicesEditorialPage — feature spreads: masthead, index, dropcap, pull-quote, spec table, byline
//  · ServiceLedgerPage     — service log table + bench-note case (from field notes)
//  (the 7-part deep case now lives in site-case-full.jsx as CaseFullPage)

const SERVICES_LOG = [
  ["/01", "Hydraulic Cylinder Overhaul", "Bore 25–600 mm · stroke ≤ 6 m · honed, plated, resealed", "Workshop", "96 h", "On quote"],
  ["/02", "Mud Pump Fluid-End Repair", "National, Gardner-Denver, Continental Emsco · 4″–7½″ liners", "Oilfield", "10 — 14 d", "On quote"],
  ["/03", "BOP & Koomey Unit Service", "API 16D recerts, accumulator pre-charge, ram packing", "Oilfield", "5 — 7 d", "On quote"],
  ["/04", "Power Pack Refurbishment", "Tank flush, motor rewind, manifold re-machine, schematic redraw", "Workshop", "7 — 10 d", "On quote"],
  ["/05", "Valve Reconditioning", "Spools, coils, springs, seats · bench-tested to OEM curve", "Workshop", "72 h", "On quote"],
  ["/06", "Wireline & CT Skid Service", "Injector hydraulics, winch packs, control panels · planned & emergency", "Oilfield", "3 — 5 d", "On quote"],
  ["/07", "On-site Commissioning & Repair", "Two engineers + test van · anywhere in the GCC within 48 h", "Field", "48 h dispatch", "On quote"],
  ["/08", "Oil Analysis & Filtration", "ISO 4406 coding, water-in-oil, ferrography · 1-page verdict", "Lab", "5 d", "On quote"],
  ["/09", "Failure Investigation", "Root-cause report with photos, dimensional data & metallurgy", "Forensics", "10 d", "On quote"],
  ["/10", "Custom Manifold Build", "Block design, machining, certification — your circuit, our metal", "Build", "3 — 5 wk", "On quote"],
];

function Dropcap({ children }) {
  return <div style={{ fontSize: 15.5, lineHeight: 1.75, color: "var(--ih-ink-2)", display: "flex", flexDirection: "column", gap: 14 }}>{children}</div>;
}
function PullQuote({ children, cite }) {
  return <blockquote style={{ margin: "26px 0", paddingLeft: 22, borderLeft: "2px solid var(--ih-accent)" }}>
    <p className="serif" style={{ fontSize: 23, lineHeight: 1.35, color: "var(--ih-ink)" }}>{children}</p>
    <cite className="mono" style={{ display: "block", fontSize: 11, letterSpacing: ".06em", color: "var(--ih-muted)", marginTop: 12, fontStyle: "normal" }}>{cite}</cite>
  </blockquote>;
}
function Byline({ initials, name, role, cta = "Quote this service" }) {
  return <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 26, paddingTop: 20, borderTop: "1px solid var(--ih-border)" }}>
    <Avatar initials={initials} size={36} />
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: 13.5, fontWeight: 500 }}>{name}</div>
      <div className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted)", letterSpacing: ".05em", marginTop: 2 }}>{role}</div>
    </div>
    <Btn kind="outline" size="sm" iconR={I.arrowR}>{cta}</Btn>
  </div>;
}

// ─── 1 · Editorial feature spreads ─────────────────────────────────
function ServicesEditorialPage() {
  const features = [
    { id: "01", tag: "No. 01 · Overhaul · Featured", h: ["Hydraulic ", "cylinder", " overhaul, done the slow way."], img: "cylinder rod after honing, bay 3 · 1100×1400",
      body: ["The fast way is to swap seals, paint the barrel and ship it back the same week. We don't do that. A proper overhaul starts with a dimensional report — bore roundness, rod straightness, gland clearance — because a cylinder that failed once at 0.4 mm out of true will fail again.",
        "Most of what we see comes back from the rig floor: mill-type cylinders that have lived a hard life under a top drive, or actuators that should never have been specified for the duty cycle they were given."],
      quote: ["The barrel told us what the operator wouldn't. Pitting at the 1-o'clock position, every time the same — that's a contamination story, not a seal story.", "— Arun Iyer, Head of Service"],
      spec: [["Bore range", "25 mm — 600 mm"], ["Stroke", "Up to 6,000 mm"], ["Test pressure", "1.5× MAWP on closed-loop rig"], ["Turnaround", "96 hours, expedited 48"], ["Warranty", "12 months, full unit"]],
      by: ["AI", "Arun Iyer", "HEAD OF SERVICE · JEBEL ALI"] },
    { id: "02", flip: true, tag: "No. 02 · Oilfield · Long read", h: ["Mud pump ", "fluid ends", ": rebuild or replace?"], img: "fluid end deck, MPI inspection · 1100×1400",
      body: ["A triplex fluid end is not a thing you debate sentimentally. Either the bore is within wear tolerance or it isn't; either the deck is uncracked or it isn't. But the decision about which of those two facts matters more is where most operators lose money.",
        "We've taken in National 12-P-160s, Gardner-Denver PZ-11s and a long tail of clones. Our intake report tells you, in twelve pages, what's reusable and what's not, before you spend anything."],
      quote: ["We saved a client the cost of a new fluid end by not selling them one. The old deck was fine — it was the valve seats and the liner that needed work.", "— Sunil Patel, Workshop Manager"],
      spec: [["Models serviced", "National, Gardner-Denver, Continental Emsco"], ["Liner sizes", "4″ — 7½″"], ["Pressure rating", "5,000 — 7,500 psi"], ["Inspection", "MPI on deck, UT on suction manifold"], ["Lead time", "10 — 14 days"]],
      by: ["SP", "Sunil Patel", "WORKSHOP MANAGER · JEBEL ALI"] },
    { id: "03", tag: "No. 03 · Oilfield · Certification", h: ["BOP and Koomey units: ", "recertification", " without the theatre."], img: "koomey unit accumulator bank · 1100×1400",
      body: ["An API 16D recert is a paperwork exercise that only means something if the work underneath it was real. We pre-charge every bottle individually, log the nitrogen against bottle serial, and photograph ram packing before and after.",
        "What clients notice is the file: certificates traceable from end fitting to nitrogen bottle, so the next audit takes an afternoon rather than a fortnight."],
      quote: ["Anyone can issue a certificate. The question an auditor asks is whether the bottle serials in the file match the bottles on the skid.", "— Ahmed Nasser, Field Engineer"],
      spec: [["Scope", "API 16D recert, pre-charge, ram packing"], ["Bottle capacity", "11 L — 80 L, nitrogen"], ["Documentation", "Per-bottle serial traceability"], ["Turnaround", "5 — 7 days"], ["Witness", "Client or third-party, on request"]],
      by: ["AN", "Ahmed Nasser", "FIELD ENGINEER · UAE"] },
  ];
  return <><UtilityBar /><SiteNav active="Services" />
    <div style={{ padding: "52px 48px 0" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 56, alignItems: "end" }}>
        <div>
          <Eyebrow>Services · oilfield &amp; industrial hydraulics</Eyebrow>
          <h1 className="serif" style={{ fontSize: 54, marginTop: 18, lineHeight: 1.03 }}>
            The workshop floor is where <em>specifications meet reality</em>.
          </h1>
          <div style={{ marginTop: 34, maxWidth: 620 }}>
            <StatRow items={[["23", "Yrs in the trade"], ["2,400+", "Overhauls last year"], ["96h", "Typical turnaround"]]} big={30} />
          </div>
        </div>
        <div>
          <p className="lede">Ten services run out of our Jebel Ali and Mumbai workshops — written the way our engineers actually talk about them. Not a brochure. Not a spec sheet. Field notes from the bench.</p>
          <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
            <Btn kind="primary" size="lg">Request a service quote</Btn>
            <Btn kind="ghost" size="lg">Jump to index ↓</Btn>
          </div>
        </div>
      </div>
      {/* MASTHEAD RULE */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 44, padding: "14px 0",
        borderTop: "2px solid var(--ih-ink)", borderBottom: "1px solid var(--ih-border)", fontFamily: "var(--ih-font-mono)", fontSize: 11, letterSpacing: ".08em", color: "var(--ih-muted)" }}>
        <span>Indus Hydraulics · <b style={{ color: "var(--ih-ink)" }}>SERVICE BUREAU</b></span>
        <span>Volume 14 · <b style={{ color: "var(--ih-ink)" }}>Q3 / 2026</b></span>
        <span>Jebel Ali · Mumbai · Houston</span>
      </div>
      {/* INDEX */}
      <nav style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 1, background: "var(--ih-border)", border: "1px solid var(--ih-border)", borderTop: 0 }}>
        {[["No. 01", "Cylinder Overhaul", "Feature"], ["No. 02", "Mud Pump Repair", "Oilfield"], ["No. 03", "BOP Hydraulics", "Oilfield"],
          ["No. 04", "Power Pack Refurb", "Industrial"], ["No. 05", "Field Service", "On-site"]].map(([n, t, s]) =>
          <a key={n} style={{ background: "var(--ih-surface)", padding: "18px 18px", display: "flex", flexDirection: "column", gap: 6 }}>
            <span className="mono" style={{ fontSize: 10, color: "var(--ih-accent)", letterSpacing: ".08em" }}>{n}</span>
            <span style={{ fontSize: 14.5, fontWeight: 500, letterSpacing: "-0.015em" }}>{t}</span>
            <span className="mono" style={{ fontSize: 10, color: "var(--ih-muted)" }}>{s} ↗</span>
          </a>)}
      </nav>
    </div>

    {features.map(f => <section key={f.id} style={{ padding: "56px 48px", borderBottom: "1px solid var(--ih-border)" }}>
      <div style={{ display: "grid", gridTemplateColumns: f.flip ? "1.15fr 0.85fr" : "0.85fr 1.15fr", gap: 56, alignItems: "start" }}>
        {!f.flip && <Img style={{ aspectRatio: "3/4", borderRadius: 12 }} label={f.img} />}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="ih-dot" style={{ color: "var(--ih-accent)" }} />
            <span className="mono" style={{ fontSize: 10.5, letterSpacing: ".1em", color: "var(--ih-muted)", textTransform: "uppercase" }}>{f.tag}</span>
          </div>
          <h2 className="serif" style={{ fontSize: 38, marginTop: 14, lineHeight: 1.1 }}>{f.h[0]}<em>{f.h[1]}</em>{f.h[2]}</h2>
          <div style={{ marginTop: 20 }}>
            <Dropcap>{f.body.map((p, i) => <p key={i} style={i === 0 ? { textIndent: 0 } : undefined}>{p}</p>)}</Dropcap>
          </div>
          <PullQuote cite={f.quote[1]}>"{f.quote[0]}"</PullQuote>
          <div className="ih-card" style={{ padding: "4px 18px" }}><Spec rows={f.spec} /></div>
          <Byline initials={f.by[0]} name={f.by[1]} role={f.by[2]} />
        </div>
        {f.flip && <Img style={{ aspectRatio: "3/4", borderRadius: 12 }} label={f.img} />}
      </div>
    </section>)}

    <section style={{ padding: "64px 48px", textAlign: "center" }}>
      <Eyebrow>Service intake · open 24×7 · Jebel Ali · Mumbai · Houston</Eyebrow>
      <p className="serif" style={{ fontSize: 22, color: "var(--ih-muted)", marginTop: 18, fontStyle: "italic" }}>
        If it leaks, hums, screams, drips, slips or simply refuses to move — we'd like a look at it.
      </p>
      <h2 className="serif" style={{ fontSize: 38, marginTop: 14, maxWidth: 760, marginInline: "auto", lineHeight: 1.1 }}>
        Send us a photo, an SKU or a part on a pallet. <em>We'll do the rest.</em>
      </h2>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 28 }}>
        <Btn kind="primary" size="lg">Open a service ticket</Btn><Btn kind="outline" size="lg">Call the workshop</Btn>
      </div>
    </section>
    <SiteFooter /></>;
}

// ─── 2 · Service ledger ────────────────────────────────────────────
function ServiceLedgerPage() {
  const tagKind = { Oilfield: "accent", Workshop: "steel", Field: "warn", Lab: "default", Forensics: "danger", Build: "success" };
  return <><UtilityBar /><SiteNav active="Services" />
    <div style={{ background: "var(--ih-navy)", padding: "56px 48px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: .5,
        background: "linear-gradient(to right, oklch(0.34 0.045 252) 1px, transparent 1px) 0 0 / 32px 32px, linear-gradient(to bottom, oklch(0.34 0.045 252) 1px, transparent 1px) 0 0 / 32px 32px" }} />
      <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 56, alignItems: "center" }}>
        <div>
          <Eyebrow style={{ color: "var(--ih-steel)" }}>Services · oilfield &amp; industrial hydraulics</Eyebrow>
          <div className="mono" style={{ fontSize: 12, color: "var(--ih-steel)", marginTop: 14, letterSpacing: ".04em" }}>notes from the workshop —</div>
          <h1 className="serif" style={{ fontSize: 52, color: "#fff", marginTop: 10, lineHeight: 1.04 }}>
            We <span style={{ textDecoration: "line-through", opacity: .5 }}>sell</span> <em>fix</em> things that move under pressure.
          </h1>
          <p style={{ fontSize: 16, color: "oklch(0.82 0.02 250)", marginTop: 18, lineHeight: 1.6, maxWidth: 560 }}>
            Ten services run out of our Jebel Ali and Mumbai workshops. This page is the working file — photos, measurements, notes — for the kinds of jobs we take on.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: "rgba(255,255,255,.14)", border: "1px solid rgba(255,255,255,.14)", borderRadius: 10, overflow: "hidden" }}>
          {[["2,400+", "Overhauls / year", "cylinders, pumps, valves, manifolds"], ["96h", "Typical turnaround", "48h expedited available"],
            ["23", "Years in the trade", "specialist since 2003"], ["47", "Countries shipped", "on-site visits within 48h"]].map(([n, b, s]) =>
            <div key={b} style={{ background: "var(--ih-navy)", padding: "18px 20px" }}>
              <div className="mono" style={{ fontSize: 26, color: "#fff", letterSpacing: "-0.02em" }}>{n}</div>
              <div style={{ fontSize: 12.5, color: "#fff", fontWeight: 500, marginTop: 7 }}>{b}</div>
              <div style={{ fontSize: 11.5, color: "oklch(0.7 0.03 250)", marginTop: 3, lineHeight: 1.4 }}>{s}</div>
            </div>)}
        </div>
      </div>
    </div>

    <section className="ih-sec">
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", paddingBottom: 14, marginBottom: 0, borderBottom: "2px solid var(--ih-ink)" }}>
        <h2 className="serif" style={{ fontSize: 30 }}>Service log — what's on the bench</h2>
        <span className="mono" style={{ fontSize: 10.5, letterSpacing: ".1em", color: "var(--ih-muted)" }}>WK 33 · UPDATED MONDAY 06:00 GST</span>
      </div>
      <div className="ih-card" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0 }}>
        <table className="ih-table">
          <thead><tr><th style={{ width: 54 }}>No.</th><th>Service</th><th style={{ width: 120 }}>Bench</th><th style={{ width: 120 }}>Turnaround</th><th style={{ width: 110 }}>Basis</th><th style={{ width: 40 }} /></tr></thead>
          <tbody>{SERVICES_LOG.map(([n, t, sub, tag, tt, basis]) => <tr key={n}>
            <td className="num" style={{ color: "var(--ih-accent)", fontSize: 12 }}>{n}</td>
            <td><div style={{ fontSize: 14, fontWeight: 500 }}>{t}</div>
              <div style={{ fontSize: 12, color: "var(--ih-muted)", marginTop: 3 }}>{sub}</div></td>
            <td><Badge kind={tagKind[tag]}>{tag}</Badge></td>
            <td className="num" style={{ fontSize: 12.5 }}>{tt}</td>
            <td className="num" style={{ fontSize: 12.5, color: "var(--ih-muted)" }}>{basis}</td>
            <td style={{ textAlign: "right", color: "var(--ih-muted-2)" }}><span style={{ display: "inline-flex" }}>{I.arrowR}</span></td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>

    <section className="ih-sec" style={{ paddingTop: 0 }}>
      <Eyebrow>Case study · no. 01 · cylinder overhaul</Eyebrow>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 48, marginTop: 20, alignItems: "start" }}>
        <div>
          <div className="mono" style={{ fontSize: 12, color: "var(--ih-accent)", letterSpacing: ".04em" }}>a typical overhaul looks like this —</div>
          <h2 className="serif" style={{ fontSize: 34, marginTop: 12, lineHeight: 1.12 }}>Mill-type cylinder, 200 mm bore, off a top drive in <em>Barmer</em>.</h2>
          <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 14, fontSize: 15.5, lineHeight: 1.75, color: "var(--ih-ink-2)" }}>
            <p>Arrived on a truck Tuesday morning. Rod had a 0.4 mm bend, barrel showed pitting on the discharge side, gland was scored. Operator thought it was a seal kit job; we knew on intake it wasn't.</p>
            <p>Three days on the bench: rod straightened in the press, chromed and ground back to size, barrel honed and re-bored 0.5 mm oversize, custom-machined gland to suit. Closed-loop tested at 1.5× MAWP and held.</p>
          </div>
          <div className="ih-card" style={{ padding: 18, marginTop: 22, background: "var(--ih-surface-2)", fontFamily: "var(--ih-font-mono)", fontSize: 12.5, lineHeight: 1.6 }}>
            <b style={{ color: "var(--ih-accent)" }}>Note from the bench</b><br />
            The pitting was caused by water ingress through a failed rod wiper — not the seal pack the operator wanted to replace. We sold him a wiper upgrade, not a new cylinder.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 22 }}>
            {["rod as received, 0.4mm bend", "barrel honed, 0.5mm oversize", "closed-loop test, 1.5× MAWP"].map(t =>
              <Img key={t} style={{ aspectRatio: "4/3", borderRadius: 8 }} label={t} />)}
          </div>
        </div>
        <div className="ih-card" style={{ padding: 22 }}>
          <Eyebrow>Measured, in and out</Eyebrow>
          <div style={{ marginTop: 14 }}>
            <Spec rows={[["Bore, as received", "200.6 mm, oval"], ["Bore, dispatched", "200.5 mm ±0.02"], ["Rod runout, in", "0.40 mm"], ["Rod runout, out", "0.03 mm"],
              ["Gland clearance", "Re-machined to suit"], ["Test pressure", "1.5× MAWP, 30 min"], ["Bench time", "3 days"], ["Warranty", "12 months, full unit"]]} />
          </div>
          <Btn kind="primary" size="sm" style={{ width: "100%", marginTop: 18 }}>Send us a cylinder</Btn>
        </div>
      </div>
    </section>
    <SiteFooter /></>;
}

Object.assign(window, { ServicesEditorialPage, ServiceLedgerPage, SERVICES_LOG, PullQuote, Byline });
