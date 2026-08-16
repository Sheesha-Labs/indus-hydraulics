/* eslint-disable */
// Services — case-study led (the selected direction), plus a case detail.

const CASES = [
  { no: "01", cat: "Rebuild", t: "Mud pump fluid end returned to spec in nine days", c: "Gulf Drilling Services · Ras Al Khaimah",
    r: "Nine-day turnaround", d: "A triplex fluid end washing out at 4,800 psi. Stripped, re-sleeved, re-valved and pressure-tested against the OEM curve.", img: "mud pump fluid end on the bench" },
  { no: "02", cat: "Rebuild", t: "Cylinders and hoses for a sour-gas wellsite", c: "Al Faris Equipment · Abu Dhabi",
    r: "26 assemblies, zero re-work", d: "H₂S service meant every elastomer had to change. FKM throughout, hoses re-crimped to EN 856 4SH.", img: "hose assemblies laid out" },
  { no: "03", cat: "Supply", t: "Servo valve found in four days against a six-week lead", c: "Fleet operator · Mumbai Port",
    r: "No shift lost", d: "Atos proportional valve traced through the European channel and air-freighted before the dry-dock window closed.", img: "servo valve in packaging" },
  { no: "04", cat: "Commissioning", t: "Press circuit re-piped after a heat failure", c: "Bharat Forge · Pune",
    r: "Standby heat down 22 °C", d: "The circuit was fighting itself. Re-specified the pump control and re-routed return lines through a larger cooler.", img: "press hydraulic circuit" },
  { no: "05", cat: "Supply", t: "Rolling mill valve bank standardised on one Cetop pattern", c: "Tata Steel · Jamshedpur",
    r: "Spares count cut by 40%", d: "Eleven valve variants across two mills consolidated to three, with the interchange documented for the stores team.", img: "valve manifold bank" },
  { no: "06", cat: "Testing", t: "Accumulator recertification for a PED audit", c: "Cement plant · Gujarat",
    r: "Passed first inspection", d: "Twenty-two bladder accumulators pre-charge tested, re-tagged and documented to PED 2014/68/EU.", img: "accumulator test rig" },
];

function ServicesCasesPage() {
  return <><UtilityBar /><SiteNav active="Services" />
    <div style={{ background: "var(--ih-surface)", borderBottom: "1px solid var(--ih-border)", padding: "56px 48px 48px" }}>
      <Eyebrow>Services · what we actually did</Eyebrow>
      <h1 className="serif" style={{ fontSize: 52, marginTop: 18, maxWidth: 900, lineHeight: 1.04 }}>
        If it leaks, hums, screams or won't hold pressure — <em>we've had one on the bench</em>.
      </h1>
      <p className="lede" style={{ marginTop: 18, maxWidth: 640 }}>
        Supply is half the business. The other half is the workshop: rebuilds, custom assemblies, commissioning and testing.
        Here is a sample of jobs, with what changed and how long it took.
      </p>
      <div style={{ display: "flex", gap: 8, marginTop: 32, alignItems: "center" }}>
        <span className="eyebrow" style={{ marginRight: 6 }}>Filter</span>
        {["All work", "Rebuild", "Supply", "Commissioning", "Testing"].map((t, i) => <Chip key={t} on={i === 0}>{t}</Chip>)}
      </div>
    </div>
    <div className="ih-sec">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
        {CASES.map(c => <a key={c.no} className="ih-card" style={{ display: "flex", flexDirection: "column" }}>
          <Img style={{ aspectRatio: "4/3" }} label={c.img}>
            <span className="ih-badge ih-badge--square ih-badge--navy" style={{ position: "absolute", top: 12, left: 12 }}>CASE {c.no}</span>
          </Img>
          <div style={{ padding: 22, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <Badge kind="steel">{c.cat}</Badge>
              <span className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted-2)" }}>{c.c}</span>
            </div>
            <h3 style={{ fontSize: 19, lineHeight: 1.28 }}>{c.t}</h3>
            <p style={{ fontSize: 13, color: "var(--ih-muted)", lineHeight: 1.55, flex: 1 }}>{c.d}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid var(--ih-border)" }}>
              <span style={{ fontSize: 13, fontWeight: 500, color: "var(--ih-accent)" }}>{c.r}</span>
              <span style={{ color: "var(--ih-muted-2)", display: "flex" }}>{I.arrowR}</span>
            </div>
          </div>
        </a>)}
      </div>
    </div>
    <section className="ih-sec" style={{ paddingTop: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--ih-border)", border: "1px solid var(--ih-border)", borderRadius: 10, overflow: "hidden" }}>
        {[["Rebuild & overhaul", "Pumps, motors, cylinders and valve banks stripped, measured and returned to OEM tolerance with a test certificate."],
          ["Custom assemblies", "Hose sets, manifold blocks and power packs built to drawing or to a sample."],
          ["On-site commissioning", "Flushing, filling, setting and proving a circuit before it takes load."],
          ["Testing & certification", "Flow, pressure and leak testing on the rig, documented for audit."]].map(([t, d]) =>
          <div key={t} style={{ background: "var(--ih-surface)", padding: "26px 24px" }}>
            <span style={{ color: "var(--ih-steel)", display: "flex" }}>{I.wrench}</span>
            <h3 style={{ fontSize: 16, marginTop: 14 }}>{t}</h3>
            <p style={{ fontSize: 12.5, color: "var(--ih-muted)", marginTop: 8, lineHeight: 1.55 }}>{d}</p>
          </div>)}
      </div>
    </section>
    <SiteFooter /></>;
}

function CaseDetailPage() {
  const ledger = [["D+0", "Unit received, photographed, serial recorded"], ["D+1", "Stripped and washed; bore and rod measured against drawing"],
    ["D+2", "Findings report issued with photographs and a repair-or-replace call"], ["D+4", "Client approval; parts drawn from stock, sleeves ordered"],
    ["D+7", "Re-assembly, new seal set, torque values logged"], ["D+8", "Pressure test to 6,000 psi, 30-minute hold"], ["D+9", "Painted, tagged, crated, dispatched with certificate"]];
  const findings = [["Liner bore", "Washed 0.42 mm oversize", "Re-sleeved"], ["Valve seats", "Pitted, 3 of 6", "Replaced, full set"],
    ["Piston rods", "Within tolerance", "Re-used"], ["Discharge module", "Hairline crack at port", "Replaced"],
    ["Suction manifold", "Serviceable", "Cleaned and re-gasketed"], ["Pulsation dampener", "Bladder perished", "New bladder, re-charged"]];
  return <><UtilityBar /><SiteNav active="Services" />
    <div style={{ padding: "22px 48px 0" }}><Crumb items={["Services", "Case studies", "Case No. 01"]} /></div>
    <div style={{ padding: "20px 48px 44px", display: "grid", gridTemplateColumns: "1.15fr 1fr", gap: 56, alignItems: "center" }}>
      <div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Badge kind="navy">CASE NO. 01</Badge><Badge kind="steel">Rebuild</Badge>
        </div>
        <h1 className="serif" style={{ fontSize: 46, marginTop: 18, lineHeight: 1.05 }}>Mud pump fluid end returned to spec in <em>nine days</em>.</h1>
        <p className="lede" style={{ marginTop: 16, maxWidth: 540 }}>
          A triplex fluid end washing out at 4,800 psi with a rig on standby. Stripped, re-sleeved, re-valved and pressure-tested against the OEM curve.
        </p>
        <div style={{ display: "flex", gap: 36, marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--ih-border)" }}>
          {[["Client", "Gulf Drilling Services"], ["Location", "Ras Al Khaimah, UAE"], ["Turnaround", "9 days"], ["Test pressure", "6,000 psi"]].map(([k, v]) =>
            <div key={k}><div className="eyebrow">{k}</div><div style={{ fontSize: 14, fontWeight: 500, marginTop: 6 }}>{v}</div></div>)}
        </div>
      </div>
      <Img style={{ aspectRatio: "4/3", borderRadius: 12 }} label="mud pump fluid end on the bench · 1200×900" />
    </div>
    <div style={{ padding: "0 48px 64px", display: "grid", gridTemplateColumns: "1fr 340px", gap: 48, alignItems: "start" }}>
      <div>
        <section>
          <Eyebrow>The problem</Eyebrow>
          <p style={{ fontSize: 17, lineHeight: 1.65, marginTop: 14, color: "var(--ih-ink-2)" }}>
            The pump had been washing fluid past the liners for a fortnight and the crew were changing packing every other shift.
            By the time it reached us the discharge module had a hairline crack at the port and three of six valve seats were pitted
            deep enough to catch a fingernail. The client's own estimate was a five-week replacement lead.
          </p>
        </section>
        <section style={{ marginTop: 40 }}>
          <Eyebrow>What we did</Eyebrow>
          <p style={{ fontSize: 15, lineHeight: 1.7, marginTop: 14, color: "var(--ih-ink-2)" }}>
            We took the findings-first route: strip and measure before quoting anything. That produced a repair-or-replace call on each
            component with photographs attached, which let the client approve a mixed scope in a single call rather than three rounds of email.
            Liners were re-sleeved rather than replaced, the discharge module was swapped from stock, and the full valve and seat set went in new.
          </p>
        </section>
        <section style={{ marginTop: 40 }}>
          <Eyebrow>Findings</Eyebrow>
          <div className="ih-card" style={{ marginTop: 14 }}>
            <table className="ih-table">
              <thead><tr><th>Component</th><th>Condition on strip</th><th>Action</th></tr></thead>
              <tbody>{findings.map(([a, b, c]) => <tr key={a}>
                <td style={{ fontWeight: 500 }}>{a}</td>
                <td style={{ color: "var(--ih-muted)" }}>{b}</td>
                <td><Badge kind={c.startsWith("Re-used") || c.startsWith("Cleaned") ? "success" : "steel"}>{c}</Badge></td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>
        <section style={{ marginTop: 40 }}>
          <Eyebrow>Result</Eyebrow>
          <div className="ih-card" style={{ padding: 28, marginTop: 14, display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28 }}>
            {[["9 days", "Bench to dispatch"], ["6,000 psi", "Held 30 min, no weep"], ["38%", "Of replacement cost"]].map(([v, l]) =>
              <div key={l}><div className="mono" style={{ fontSize: 30, letterSpacing: "-0.02em", color: "var(--ih-accent)" }}>{v}</div>
                <div style={{ fontSize: 13, color: "var(--ih-muted)", marginTop: 6 }}>{l}</div></div>)}
          </div>
        </section>
        <section style={{ marginTop: 40 }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {["strip-down, liners out", "re-sleeved bore, measured", "on the test rig at 6,000 psi"].map(t =>
              <Img key={t} style={{ aspectRatio: "4/3", borderRadius: 8 }} label={t} />)}
          </div>
        </section>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 20 }}>
        <div className="ih-card" style={{ padding: 22 }}>
          <Eyebrow>SOP ledger</Eyebrow>
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column" }}>
            {ledger.map(([d, t], i) => <div key={d} style={{ display: "flex", gap: 14, paddingBottom: i < ledger.length - 1 ? 16 : 0 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span style={{ width: 7, height: 7, borderRadius: 999, background: "var(--ih-accent)", marginTop: 5, flexShrink: 0 }} />
                {i < ledger.length - 1 && <span style={{ width: 1, flex: 1, background: "var(--ih-border)", marginTop: 5 }} />}
              </div>
              <div style={{ paddingBottom: 2 }}>
                <div className="mono" style={{ fontSize: 10.5, color: "var(--ih-accent)", letterSpacing: ".06em" }}>{d}</div>
                <div style={{ fontSize: 12.5, color: "var(--ih-ink-2)", marginTop: 4, lineHeight: 1.45 }}>{t}</div>
              </div>
            </div>)}
          </div>
        </div>
        <div className="ih-card" style={{ padding: 22 }}>
          <Eyebrow>On the job</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 14 }}>
            {[["SP", "S. Pillai", "Workshop lead"], ["AN", "A. Nasser", "Field engineer, UAE"], ["RK", "R. Kulkarni", "Applications"]].map(([ini, n, r]) =>
              <div key={n} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Avatar initials={ini} size={32} />
                <div><div style={{ fontSize: 13, fontWeight: 500 }}>{n}</div><div style={{ fontSize: 11.5, color: "var(--ih-muted)" }}>{r}</div></div>
              </div>)}
          </div>
        </div>
        <div className="ih-card" style={{ padding: 22, background: "var(--ih-steel-soft)", borderColor: "oklch(0.88 0.03 240)" }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Have something on the floor?</div>
          <p style={{ fontSize: 12.5, color: "var(--ih-ink-2)", marginTop: 8, lineHeight: 1.55 }}>Send photos and a serial number. We'll tell you whether it's worth rebuilding before you ship it.</p>
          <Btn kind="primary" size="sm" style={{ width: "100%", marginTop: 14 }}>Start a job enquiry</Btn>
        </div>
      </div>
    </div>
    <SiteFooter /></>;
}
Object.assign(window, { ServicesCasesPage, CaseDetailPage, CASES });
