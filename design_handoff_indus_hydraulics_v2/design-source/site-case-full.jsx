/* eslint-disable */
// Case study — the seven-part oilfield format, section for section as built in the
// orange/black original (service-case-uae-cylinders-hoses.html), in the blue language.

const SOP_BLOCK = [
  ["Phase 01 · Mobilise & inspect", [
    ["On-site inspection within 24 h", "Engineer dispatched from JAFZA yard; photo log, walk-around, fluid sample", "K. AL MARZOUQI", "Site visit"],
    ["Sour-service classification", "Confirmed H₂S partial pressure > 0.3 kPa — NACE MR0175 applies", "QA", "Gas data"],
    ["Cylinder rod straightness survey", "3 of 4 jacks > 0.3 mm/m TIR — flagged for removal", "QA", "Dial gauge"],
    ["Hose schedule audit", "96 assemblies inventoried by circuit, length, fitting, rated pressure", "F. NAIR", "Tag sheet"],
    ["Recerts & pressure-vessel audit", "Accumulator N₂ pre-charge file 7 mo overdue; relief valves 4 mo overdue", "QA", "Recerts log"]]],
  ["Phase 02 · Quote & PO release", [
    ["Three-option intake report (PDF)", "22 pp · costed minimum, recommended, full-recert paths", "S. PATEL", "PDF"],
    ["Customer PO & LOI received", "Recommended-path PO; LOI on file dated 2026-03-06 09:40 GST", "SALES", "Email"]]],
  ["Phase 03 · Cylinder rebuild", [
    ["Disassemble 8× tie-rod cylinders", "4× jack 6″ bore, 2× snubbing 4½″ bore, 2× travelling 5″ bore — tagged by position", "R. SHARMA", "Workshop"],
    ["Straighten & re-chrome 3× rods", "Press-straightened to < 0.1 mm/m TIR; 80 µm hard chrome, ground to size", "M. JOSHI", "Press + lathe"],
    ["Hone 8× barrels", "0.05 mm oversize bore; cross-hatch pattern at 45°, Ra 0.4 µm", "M. JOSHI", "Hone bar"],
    ["Fit NACE-spec seal kits", "HNBR rod & piston seals, FKM back-ups; all to MR0175", "R. SHARMA", "Press fit"],
    ["Wet-test each cylinder at 1.5× MAWP", "525 bar held 30 min; leak-rate < 5 ml/min on all 8", "QA", "Closed-loop rig"]]],
  ["Phase 04 · Hose build & install", [
    ["Build 60× hi-pressure hoses · EN 856 4SP", "3/4″ & 1″ ID, 316 stainless fittings, proof-tested at 2× WP", "F. NAIR", "Crimp bay"],
    ["Build 28× return-line hoses · EN 853 2SN", "1″ & 1¼″ ID, abrasion sleeve on boom run", "F. NAIR", "Crimp bay"],
    ["Build 8× rotary lines · API 7K Grade D", "2″ ID, 5,000 psi WP, fire-resistant cover", "F. NAIR", "API bay"],
    ["Tag & certify every assembly", "Each hose: circuit ID, swage no., proof-test date, batch trace", "QA", "Tag printer"],
    ["Re-pressurise 4× accumulators", "1,000 psi N₂ pre-charge, traceable bottle nos. on file", "K. AL MARZOUQI", "N₂ rig"]]],
  ["Phase 05 · Function-test & release", [
    ["Closed-loop function test", "Full skidding, jacking, snubbing sequence vs OEM commissioning script", "QA", "Test rig"],
    ["Client-witnessed sign-off", "Operator HSE rep present; ADNOC vendor cert verified", "S. PATEL", "On-site"],
    ["Issue return packet", "42 pp · test curves, NACE certs, hose register, recerts, photos × 38", "S. PATEL", "PDF + paper"]]],
];

const FINDINGS = [
  ["Jack rod straightness (avg of 4)", "< 0.1 mm/m TIR", "0.42 mm/m", "0.06 mm/m", "↻ Straightened + re-chromed", 1],
  ["Barrel bore (jacks)", "152.4 mm ± 0.05", "152.78 mm", "152.45 mm", "↻ Honed +0.05", 1],
  ["Rod seal compound", "NACE HNBR", "Standard NBR", "HNBR + FKM b/u", "↻ Replaced", 0],
  ["Hi-pressure hose cover (boom)", "EN 856 4SP, sound", "UV-cracked, 60% pop.", "100% new, tagged", "↻ All 60 replaced", 1],
  ["End fittings", "316 SS, NACE", "Mix of plated CS + 316", "100% 316 SS", "↻ Replaced", 0],
  ["Accumulator N₂ pre-charge", "1,000 psi · ≤ 6 mo", "700 psi · 19 mo", "1,000 psi · day 0", "↻ Re-charged, traceable", 0],
  ["Relief valve set pressure", "5,250 psi ± 100", "5,180 psi", "5,250 psi", "↻ Re-certified", 0],
  ["Cylinder wet-test, 525 bar", "30 min hold", "—", "30 min, 0 bar drop", "✓ Pass · all 8", 0],
  ["Hose proof-test, 2× WP", "5 min hold", "—", "96 / 96 passed", "✓ Pass", 0],
];

function SecHeadNum({ n, children }) {
  return <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 44, paddingBottom: 14, borderBottom: "1px solid var(--ih-border)" }}>
    <span className="mono" style={{ fontSize: 12.5, color: "var(--ih-accent)", letterSpacing: ".04em" }}>/{n}</span>
    <h2 className="serif" style={{ fontSize: 31, lineHeight: 1.14 }}>{children}</h2>
  </div>;
}
function P({ lead, children }) {
  return <p style={{ fontSize: lead ? 17.5 : 15.5, lineHeight: lead ? 1.62 : 1.75, marginTop: 18,
    color: lead ? "var(--ih-ink)" : "var(--ih-ink-2)" }}>{children}</p>;
}
function RailCard({ label, children, dark, accentBg }) {
  return <div className="ih-card" style={{ padding: 20,
    background: dark ? "var(--ih-navy)" : accentBg ? "var(--ih-accent-soft)" : "var(--ih-surface)",
    borderColor: dark ? "var(--ih-navy)" : accentBg ? "oklch(0.88 0.04 248)" : "var(--ih-border)" }}>
    <div className="eyebrow" style={{ color: dark ? "var(--ih-steel)" : undefined }}>{label}</div>
    {children}
  </div>;
}

function CaseFullPage() {
  return <><UtilityBar /><SiteNav active="Services" />
    <div style={{ padding: "22px 48px 0" }}>
      <div className="ih-crumb">
        <span>Home</span><span style={{ opacity: .5 }}>/</span><span>Services</span><span style={{ opacity: .5 }}>/</span>
        <span>Oil &amp; Gas</span><span style={{ opacity: .5 }}>/</span>
        <span style={{ color: "var(--ih-ink-2)" }}>No. 07 — Workover Rig Cylinder &amp; Hose Overhaul · Jebel Ali</span>
      </div>
    </div>

    {/* ── HERO ── */}
    <section style={{ padding: "24px 48px 0" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Badge kind="steel">Cylinders · Hoses · Oilfield</Badge>
        <Badge kind="accent">UAE · Jebel Ali</Badge>
        <span className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted)", letterSpacing: ".09em" }}>CASE NO. 07 · MAR 2026 · BAY 2 / ON-SITE</span>
      </div>
      <h1 className="serif" style={{ fontSize: 50, marginTop: 20, maxWidth: 1040, lineHeight: 1.04 }}>
        Eight tie-rod cylinders, 96 hoses, and a workover rig that needed to be <em>back on a well in 19 days</em>.
      </h1>
      <p className="lede" style={{ marginTop: 18, maxWidth: 780 }}>
        An ADNOC sub-contractor running a hydraulic workover unit in the Rub' al Khali had four cylinders weeping at the gland,
        two hoses ruptured at the swage, and a recerts file three months overdue. We took the call on a Sunday.
        The unit was back skidding on a wellhead the third Friday after.
      </p>

      <figure style={{ margin: "32px 0 0" }}>
        <Img style={{ aspectRatio: "1320/560", borderRadius: 12 }} label="workover unit in our Jebel Ali yard, jacks extended for cylinder removal · 1320×560" />
        <figcaption style={{ display: "flex", justifyContent: "space-between", gap: 24, marginTop: 10, fontFamily: "var(--ih-font-mono)", fontSize: 10.5, letterSpacing: ".04em", color: "var(--ih-muted)" }}>
          <span>FIG. 01 · HWO-50K skid in JAFZA yard, day 2 — cylinders being broken out</span>
          <span>PHOTO · K. AL MARZOUQI · 2026-03-04</span>
        </figcaption>
      </figure>

      {/* meta strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr) auto", gap: 1, marginTop: 28,
        background: "var(--ih-border)", border: "1px solid var(--ih-border)", borderRadius: 10, overflow: "hidden" }}>
        {[["Asset", "HWO-50K", " · 50 klb HWU", ""], ["Cylinders", "8", " · 6″ bore tie-rod", ""],
          ["Hoses replaced", "96", " · 4SP + 2SN", ""], ["Turnaround", "19", " days", "accent"],
          ["H₂S service", "NACE MR0175", "", "good"]].map(([k, v, s, tone]) =>
          <div key={k} style={{ background: "var(--ih-surface)", padding: "16px 18px" }}>
            <div className="eyebrow">{k}</div>
            <div className="mono" style={{ fontSize: 19, marginTop: 8, letterSpacing: "-0.01em",
              color: tone === "accent" ? "var(--ih-accent)" : tone === "good" ? "var(--ih-success)" : "var(--ih-ink)" }}>
              {v}<small style={{ fontSize: 11.5, color: "var(--ih-muted)", letterSpacing: 0 }}>{s}</small>
            </div>
          </div>)}
        <div style={{ background: "var(--ih-surface)", padding: "16px 18px", display: "grid", placeItems: "center" }}>
          <Btn kind="primary">Quote a similar job</Btn>
        </div>
      </div>
    </section>

    {/* ── BODY: TOC · ARTICLE · RAIL ── */}
    <div style={{ padding: "8px 48px 64px", display: "grid", gridTemplateColumns: "196px minmax(0,1fr) 288px", gap: 40, alignItems: "start" }}>
      <nav style={{ position: "sticky", top: 20 }}>
        <div className="eyebrow" style={{ paddingBottom: 12, borderBottom: "1px solid var(--ih-border)" }}>In this case</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
          {[["01", "The problem"], ["02", "Our solution"], ["03", "How we approached it"], ["04", "Standard procedure"],
            ["05", "Technical findings"], ["06", "Outcome & sign-off"], ["07", "Team on the job"]].map(([n, t], i) =>
            <a key={n} style={{ display: "flex", gap: 9, padding: "7px 0 7px 10px", fontSize: 12.5,
              borderLeft: `2px solid ${i === 0 ? "var(--ih-accent)" : "var(--ih-border)"}`,
              color: i === 0 ? "var(--ih-accent)" : "var(--ih-muted)", fontWeight: i === 0 ? 500 : 400 }}>
              <span className="mono" style={{ fontSize: 10.5, opacity: .8 }}>/{n}</span>{t}</a>)}
        </div>
        <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--ih-border)" }}>
          <div className="mono" style={{ fontSize: 9.5, letterSpacing: ".12em", color: "var(--ih-muted-2)" }}>READING</div>
          <div style={{ height: 3, background: "var(--ih-surface-3)", borderRadius: 2, marginTop: 8 }}>
            <div style={{ width: "18%", height: "100%", background: "var(--ih-accent)", borderRadius: 2 }} />
          </div>
          <div className="mono" style={{ fontSize: 9.5, letterSpacing: ".1em", color: "var(--ih-muted-2)", marginTop: 8 }}>~ 10 MIN · 18% READ</div>
        </div>
      </nav>

      <article>
        {/* /01 */}
        <SecHeadNum n="01">The problem on the rig.</SecHeadNum>
        <P lead>The call came in at 22:14 on a Sunday. A 50,000-lb hydraulic workover unit had been pulled off a sour-gas well in the Rub' al Khali because two main jack cylinders were weeping at the gland and a 1″ pressure hose had ruptured at the swage. The client had a slot booked at Habshan in three weeks. <strong>The clock was already running.</strong></P>
        <P>By Monday morning a transporter was rolling the unit into our Jebel Ali yard. The story we got was: "seal kits, please." The story the unit told, once it was in the bay, was longer than that. Three of the four jack cylinders were out of straightness. Six hoses had cover degradation consistent with ambient temps north of 55 °C and a year on a rig without UV shrouds. The accumulator pre-charge file hadn't been updated since 2024.</P>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 26 }}>
          <div className="ih-card" style={{ padding: 20, borderColor: "oklch(0.86 0.06 62)", background: "oklch(0.985 0.014 78)" }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".1em", color: "oklch(0.5 0.11 62)" }}>⚠ WHAT THE OPERATOR TOLD US</div>
            <h4 style={{ fontSize: 16, marginTop: 12, lineHeight: 1.35 }}>"Weeping seals, one burst hose — seal kits, please."</h4>
            <p style={{ fontSize: 13, color: "var(--ih-ink-2)", marginTop: 9, lineHeight: 1.6 }}>Two jack cylinders weeping at the gland, one pressure hose ruptured at the swage. Operator wanted a 5-day seal-and-swap and back on hire.</p>
          </div>
          <div className="ih-card" style={{ padding: 20, borderColor: "oklch(0.88 0.04 248)", background: "var(--ih-accent-soft)" }}>
            <div className="mono" style={{ fontSize: 10, letterSpacing: ".1em", color: "var(--ih-accent)" }}>✓ WHAT THE INSPECTION ACTUALLY FOUND</div>
            <h4 style={{ fontSize: 16, marginTop: 12, lineHeight: 1.35 }}>Three bent rods, 96 hoses end-of-life, recerts overdue</h4>
            <p style={{ fontSize: 13, color: "var(--ih-ink-2)", marginTop: 9, lineHeight: 1.6 }}>Rod straightness out on 3/4 jacks. Hose covers cracked across the boom run. Accumulator nitrogen + relief valves out of recert by 7 months — couldn't legally re-skid sour-service without sign-off.</p>
          </div>
        </div>

        <P>This is the case for sending an inspection engineer before you send a seal kit. The cheapest version of this job — the one the operator asked for — would have put the unit back on a wellhead with two cylinders that were going to fail inside a month, on a sour-gas job where failure is not a paperwork problem. We didn't do that.</P>

        {/* /02 */}
        <SecHeadNum n="02">What we did instead.</SecHeadNum>
        <P>We rebuilt all eight tie-rod cylinders (four jacks, two snubbing, two travelling), replaced 96 hoses across the boom, jack circuit and accumulator manifold, repressurised the four accumulators with traceable nitrogen, and ran a closed-loop function test against the rig's original commissioning sequence. Nineteen days, end to end, with three of our engineers on-site at JAFZA and two more on the bench in Mumbai for the hose end-fitting work.</P>
        <P>Every hose was built in-house to <strong>EN 856 4SP</strong> on the high-pressure circuits, <strong>EN 853 2SN</strong> on the return and case-drain lines, and <strong>API 7K Grade D</strong> on the two rotary-line replacements. End fittings are stainless 316 with NACE MR0175-compliant elastomers throughout — non-negotiable on sour service.</P>

        <figure style={{ margin: "28px 0 0" }}>
          <Img style={{ aspectRatio: "16/9", borderRadius: 10 }} label="hose crimping bay — 96 assemblies built to spec · 1200×675" />
          <figcaption style={{ marginTop: 10, fontSize: 12.5, color: "var(--ih-muted)", lineHeight: 1.55 }}>
            <b className="mono" style={{ fontSize: 10.5, color: "var(--ih-ink-2)", letterSpacing: ".06em" }}>FIG. 02</b>{" "}
            Day 6 — JAFZA hose bay. Every assembly is laid out, tagged with circuit ID, swage number and proof-test record before it leaves the bench.
          </figcaption>
        </figure>

        <blockquote style={{ margin: "28px 0 0", padding: "4px 0 4px 22px", borderLeft: "2px solid var(--ih-accent)" }}>
          <p className="serif" style={{ fontSize: 24, lineHeight: 1.34 }}>
            You can't argue with sour service. NACE elastomers, 316 fittings, proof test on every assembly. The minute you cut a corner, you're betting somebody's life against three days of schedule.
          </p>
          <cite className="mono" style={{ display: "block", fontStyle: "normal", fontSize: 11, letterSpacing: ".06em", color: "var(--ih-muted)", marginTop: 14 }}>
            — KHALID AL MARZOUQI · FIELD LEAD · JEBEL ALI
          </cite>
        </blockquote>

        {/* /03 */}
        <SecHeadNum n="03">How we approached it — the four phases.</SecHeadNum>
        <P>Every workover-rig hydraulic overhaul we run in the Gulf goes through the same four phases. Names don't change; the durations vary with how much we find.</P>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 16, marginTop: 24 }}>
          {[["PHASE 01", "Mobilise & inspect", "Engineer on rig within 24 h. Photo log, fluid sample, dimensional survey, recerts audit. Report on operator's desk inside 48 h.", "Days 0 — 2"],
            ["PHASE 02", "Quote & PO release", "Three-option quote: minimum-fix, recommended, full-recert. Hose schedule attached, with EN/API/SAE specs called out per circuit.", "Days 3 — 4"],
            ["PHASE 03", "Rebuild & assemble", "Cylinders honed, rods chromed, sealed to NACE. 96 hoses built in JAFZA bay. Accumulators re-bladdered, N₂ recharged.", "Days 5 — 14"],
            ["PHASE 04", "Function-test & release", "Closed-loop test vs OEM commissioning sequence. Witnessed by client rep. Sign-off pack: 42 pages, two paper copies on the skid.", "Days 15 — 19"]].map(([n, t, d, dur]) =>
            <div key={n} className="ih-card" style={{ padding: 20 }}>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".1em", color: "var(--ih-accent)" }}>{n}</div>
              <h4 style={{ fontSize: 17, marginTop: 10 }}>{t}</h4>
              <p style={{ fontSize: 13, color: "var(--ih-muted)", marginTop: 9, lineHeight: 1.6 }}>{d}</p>
              <div className="mono" style={{ fontSize: 11, color: "var(--ih-ink-2)", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--ih-border)" }}>{dur}</div>
            </div>)}
        </div>

        {/* /04 */}
        <SecHeadNum n="04">The SOP we followed, line by line.</SecHeadNum>
        <P>Below is the actual SOP for a tie-rod cylinder &amp; rig-hose overhaul on a sour-service workover unit — abridged. The full SOP-OG-014 runs 46 lines; this is the subset that was ticked off on this job.</P>
        <div className="ih-card" style={{ marginTop: 24, overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px",
            background: "var(--ih-navy)", fontFamily: "var(--ih-font-mono)", fontSize: 10.5, letterSpacing: ".07em", color: "oklch(0.86 0.02 250)" }}>
            <span>SOP-OG-014 · HWU CYLINDER &amp; HOSE OVERHAUL · REV 06 · NACE</span>
            <span><b style={{ color: "#fff" }}>32 / 32</b> COMPLETE</span>
          </div>
          {SOP_BLOCK.map(([phase, rows]) => <React.Fragment key={phase}>
            <div className="mono" style={{ padding: "10px 18px", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase",
              color: "var(--ih-muted)", background: "var(--ih-surface-2)", borderBottom: "1px solid var(--ih-border)", borderTop: "1px solid var(--ih-border)" }}>{phase}</div>
            {rows.map(([task, sub, who, tool]) => <div key={task} style={{ display: "grid", gridTemplateColumns: "22px 1fr 118px 96px", gap: 12,
              alignItems: "start", padding: "12px 18px", borderBottom: "1px solid var(--ih-border)" }}>
              <span className="ih-check is-on" style={{ marginTop: 1 }}><Icn size={11} sw={2.6} d={<path d="m5 12 5 5L20 7" />} /></span>
              <div><div style={{ fontSize: 13, fontWeight: 500 }}>{task}</div>
                <div style={{ fontSize: 12, color: "var(--ih-muted)", marginTop: 3, lineHeight: 1.5 }}>{sub}</div></div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".05em", color: "var(--ih-ink-2)" }}>{who}</div>
              <div className="mono" style={{ fontSize: 10, letterSpacing: ".04em", color: "var(--ih-muted-2)" }}>{tool}</div>
            </div>)}
          </React.Fragment>)}
        </div>

        {/* /05 */}
        <SecHeadNum n="05">The numbers, before and after.</SecHeadNum>
        <P>Below is what we actually measured on the cylinders and hose population, against OEM and API/EN tolerance. Four cylinder findings and two hose findings would have failed an audit — all six were fixed in Phase 03.</P>
        <div className="ih-card" style={{ marginTop: 24 }}>
          <div style={{ padding: "13px 18px", borderBottom: "1px solid var(--ih-border)", fontFamily: "var(--ih-font-mono)", fontSize: 10.5, letterSpacing: ".06em", color: "var(--ih-muted)" }}>
            FINDINGS · HWO-50K · SERIAL HWU-50-2218 · SOUR SERVICE
          </div>
          <table className="ih-table">
            <thead><tr><th style={{ width: "27%" }}>Component</th><th>Spec</th><th>As-found</th><th>After rebuild</th><th>Status</th></tr></thead>
            <tbody>{FINDINGS.map(([c, spec, found, after, status, hl]) => <tr key={c} style={hl ? { background: "var(--ih-accent-soft)" } : undefined}>
              <td style={{ fontWeight: 500, fontSize: 13 }}>{c}</td>
              <td className="num" style={{ fontSize: 12, color: "var(--ih-muted)" }}>{spec}</td>
              <td className="num" style={{ fontSize: 12, color: found === "—" ? "var(--ih-muted-2)" : "var(--ih-danger)" }}>{found}</td>
              <td className="num" style={{ fontSize: 12, color: "var(--ih-success)" }}>{after}</td>
              <td style={{ fontSize: 12, color: "var(--ih-ink-2)" }}>{status}</td>
            </tr>)}</tbody>
          </table>
        </div>

        {/* /06 */}
        <SecHeadNum n="06">Outcome &amp; sign-off.</SecHeadNum>
        <P>The unit left our JAFZA yard on day 19, low-loaded back to the Rub' al Khali on day 20, and was skidding on a wellhead by day 23. The operator made their Habshan slot. All eight cylinders, the 96 new hoses and the four accumulators are covered under a single 12-month warranty for the assembled hydraulic system — not just parts. We've since been added to the ADNOC AVL for hydraulic field services.</P>
        <div className="ih-card" style={{ padding: 28, marginTop: 24, background: "var(--ih-steel-soft)", borderColor: "oklch(0.88 0.03 240)" }}>
          <Eyebrow>Result · summary</Eyebrow>
          <h3 className="serif" style={{ fontSize: 25, marginTop: 12, lineHeight: 1.26 }}>
            Eight rebuilt cylinders, 96 new hoses, four re-certed accumulators — and a workover unit fit for sour service for the next 12 months.
          </h3>
          <p style={{ fontSize: 14, color: "var(--ih-ink-2)", marginTop: 12, lineHeight: 1.65 }}>
            Delivered inside the operator's 21-day window with four days of margin to spare. ADNOC vendor sign-off, NACE certs on every consumable, traceable from end fitting to nitrogen bottle.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24, marginTop: 24, paddingTop: 22, borderTop: "1px solid oklch(0.88 0.03 240)" }}>
            {[["19", " days", "Turnaround", 1], ["96 / 96", "", "Hoses proof-passed", 0], ["8 / 8", "", "Cyl. wet-test pass", 0], ["12", " mo", "System warranty", 0]].map(([v, s, k, acc]) =>
              <div key={k}>
                <div className="mono" style={{ fontSize: 26, letterSpacing: "-0.02em", color: acc ? "var(--ih-accent)" : "var(--ih-ink)" }}>
                  {v}<small style={{ fontSize: 12, color: "var(--ih-muted)" }}>{s}</small>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--ih-muted)", marginTop: 6 }}>{k}</div>
              </div>)}
          </div>
        </div>

        {/* /07 */}
        <SecHeadNum n="07">The team on the job.</SecHeadNum>
        <P>Five engineers logged time against this work order, split between Jebel Ali and Mumbai. If you call either yard and ask about case 07, any of them can pull the file.</P>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 22 }}>
          {[["KM", "Khalid Al Marzouqi", "Field Lead, Jebel Ali", "On-site inspection, accumulator re-charge, client-witness sign-off."],
            ["SP", "Sunil Patel", "Workshop Manager, Pune", "Three-option quote, sign-off pack."],
            ["RS", "Rohit Sharma", "Lead Fitter, Mumbai", "Cylinder disassembly, sealing, wet-test."],
            ["MJ", "Mahesh Joshi", "Machinist, Mumbai", "Rod straightening, chroming, barrel honing."],
            ["FN", "Fahad Nair", "Hose-bay Supervisor, JAFZA", "All 96 assemblies, end-fitting traceability."]].map(([ini, n, r, d]) =>
            <div key={n} style={{ display: "flex", gap: 14, alignItems: "center", padding: "14px 0", borderBottom: "1px solid var(--ih-border)" }}>
              <Avatar initials={ini} size={34} />
              <div style={{ width: 210, flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{n}</div>
                <div style={{ fontSize: 12, color: "var(--ih-accent)", marginTop: 2 }}>{r}</div>
              </div>
              <div style={{ fontSize: 13, color: "var(--ih-muted)", lineHeight: 1.55 }}>{d}</div>
            </div>)}
        </div>
        <p className="mono" style={{ marginTop: 28, fontSize: 11, letterSpacing: ".05em", color: "var(--ih-muted-2)" }}>
          Case file · INTAKE-2026-03-097 · WO-2026-1077 · Published 2026-04-12 · Updated 2026-05-09
        </p>
      </article>

      {/* ── RIGHT RAIL ── */}
      <aside style={{ display: "flex", flexDirection: "column", gap: 14, position: "sticky", top: 20 }}>
        <RailCard label="Quote a similar job" dark>
          <h4 style={{ fontSize: 16, color: "#fff", marginTop: 12, lineHeight: 1.3 }}>Got a rig that needs to be back next month?</h4>
          <p style={{ fontSize: 12.5, color: "oklch(0.8 0.02 250)", marginTop: 9, lineHeight: 1.6 }}>
            Send photos, the OEM nameplate and the well slot date. A field engineer in Jebel Ali will be on your skid within 24 h.
          </p>
          <Btn kind="primary" size="sm" style={{ width: "100%", marginTop: 14 }}>Open a service ticket</Btn>
          <Btn kind="onnavy" size="sm" style={{ width: "100%", marginTop: 6 }}>JAFZA · +971 52 2477942</Btn>
        </RailCard>

        <RailCard label="From the field">
          <p className="serif" style={{ fontSize: 16.5, lineHeight: 1.42, marginTop: 12 }}>
            "You can't argue with sour service. The minute you cut a corner, you're betting somebody's life against three days of schedule."
          </p>
          <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 14, paddingTop: 13, borderTop: "1px solid var(--ih-border)" }}>
            <Avatar initials="KM" size={30} />
            <div><div style={{ fontSize: 12.5, fontWeight: 500 }}>Khalid Al Marzouqi</div>
              <div className="mono" style={{ fontSize: 9.5, letterSpacing: ".08em", color: "var(--ih-muted)", marginTop: 2 }}>FIELD LEAD · JEBEL ALI</div></div>
          </div>
        </RailCard>

        <RailCard label="Specs at a glance">
          <div style={{ marginTop: 10 }}>
            <Spec rows={[["Asset", "HWO-50K"], ["Service", "Sour gas"], ["Cylinders", "8 tie-rod"], ["Hi-P hose", "EN 856 4SP"],
              ["Rotary line", "API 7K-D"], ["Elastomers", "HNBR / FKM"], ["Standard", "NACE MR0175"], ["TAT", "19 days"]]} />
          </div>
        </RailCard>

        <RailCard label="From the case file">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginTop: 12 }}>
            {["FIG.01 yard", "FIG.02 hoses", "FIG.03 rod", "FIG.04 chrome", "FIG.05 N₂", "FIG.06 signoff"].map(t =>
              <Img key={t} style={{ aspectRatio: "1/1", borderRadius: 4 }} label={t} />)}
          </div>
          <Btn kind="outline" size="sm" style={{ width: "100%", marginTop: 10 }}>View 38 photos →</Btn>
        </RailCard>

        <RailCard label="Downloads">
          <div style={{ marginTop: 10 }}>
            {[["Intake report (PDF)", "22 pp"], ["Hose register (XLSX)", "96 rows"], ["NACE certs (ZIP)", "12 MB"], ["Sign-off pack (PDF)", "42 pp"]].map(([n, s], i, arr) =>
              <div key={n} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "9px 0",
                borderBottom: i < arr.length - 1 ? "1px dashed var(--ih-border)" : 0, fontFamily: "var(--ih-font-mono)", fontSize: 11.5 }}>
                <a style={{ color: "var(--ih-accent)" }}>{n}</a><span style={{ color: "var(--ih-muted-2)" }}>{s}</span>
              </div>)}
          </div>
        </RailCard>
      </aside>
    </div>

    {/* ── RELATED ── */}
    <section style={{ background: "var(--ih-surface)", borderTop: "1px solid var(--ih-border)", padding: "56px 48px" }}>
      <SecHead eyebrow="Related cases · similar jobs this quarter" title="Three more from the oilfield desk."
        action={<Btn kind="outline" iconR={I.arrowR}>All case studies</Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
        {[["NO. 02 · MUD PUMP", "Saved a Barmer operator ₹14 lakh on a fluid end rebuild.", "Eleven days on the bench; reused the deck, replaced liners and seats.", "mud pump fluid end · 520×325"],
          ["NO. 03 · BOP & KOOMEY", "BOP recertification ahead of a critical workover.", "Drained, rebladdered, re-pressured. Closure dropped 0.6 s, DNV witnessed.", "BOP koomey panel · 520×325"],
          ["NO. 06 · CT & WIRELINE", "Coiled-tubing injector skid, emergency repair.", "Stripped, gripper blocks re-faced, accumulator re-bladdered. Same-week return.", "CT injector skid · 520×325"]].map(([tag, h, p, img]) =>
          <a key={tag} className="ih-card">
            <Img style={{ aspectRatio: "16/10" }} label={img} />
            <div style={{ padding: 20 }}>
              <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", color: "var(--ih-accent)" }}>{tag}</span>
              <h4 style={{ fontSize: 17, marginTop: 11, lineHeight: 1.3 }}>{h}</h4>
              <p style={{ fontSize: 12.5, color: "var(--ih-muted)", marginTop: 8, lineHeight: 1.6 }}>{p}</p>
            </div>
          </a>)}
      </div>
    </section>

    {/* ── CTA STRIP ── */}
    <section style={{ padding: "64px 48px", textAlign: "center" }}>
      <Eyebrow>Service intake · open 24×7 · Jebel Ali · Mumbai · Houston</Eyebrow>
      <p className="serif" style={{ fontSize: 21, color: "var(--ih-muted)", marginTop: 16, fontStyle: "italic" }}>
        If it leaks, hums, screams, drips, slips or simply refuses to move — we'd like a look at it.
      </p>
      <h2 className="serif" style={{ fontSize: 38, marginTop: 14, maxWidth: 780, marginInline: "auto", lineHeight: 1.1 }}>
        Send us a photo, an SKU or a part on a pallet. <em>We'll do the rest.</em>
      </h2>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 28 }}>
        <Btn kind="primary" size="lg">Open a service ticket</Btn>
        <Btn kind="outline" size="lg" iconR={I.arrowR}>Call the workshop</Btn>
      </div>
    </section>
    <SiteFooter /></>;
}
Object.assign(window, { CaseFullPage, SOP_BLOCK, FINDINGS });
