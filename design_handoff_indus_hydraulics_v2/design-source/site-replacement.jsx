/* eslint-disable */
// /replacement — obsolete part cross-reference finder.

const XREF = [
  { obs: "A10VSO 71 DFR/31R-PPA12N00", brand: "Bosch Rexroth", cur: "A10VSO 71 DFR1/32R-VPB12N00", conf: "Exact fit",
    note: "Dimensionally identical. Series 31 → 32 revised the DFR control internals; mounting, shaft and ports unchanged." },
  { obs: "DSG-01-3C4-A240-N1-50", brand: "Yuken", cur: "DSG-01-3C4-D24-N1-70", conf: "Check coil",
    note: "Body and spool identical. Original is 240 V AC; current listing is 24 V DC — confirm your solenoid supply before ordering." },
  { obs: "PVQ32-B2R-SS1S-21-C14-12", brand: "Eaton Vickers", cur: "PVQ32-B2R-SE1S-21-C14-12", conf: "Exact fit",
    note: "SS1S → SE1S seal designation only. FKM in place of NBR; suits higher fluid temperature." },
  { obs: "SB330-10A1/112U-330A", brand: "Hydac", cur: "SB330-10A1/112U-330A-2", conf: "Exact fit",
    note: "Suffix change reflects revised bladder compound. Shell, port and pre-charge unchanged." },
];

function ReplacementPage() {
  return <><UtilityBar /><SiteNav active="Products" />
    {/* HERO + SEARCH */}
    <div style={{ background: "var(--ih-surface)", borderBottom: "1px solid var(--ih-border)", padding: "56px 48px 44px" }}>
      <div style={{ maxWidth: 1180 }}>
        <Eyebrow>Cross-reference · OEM replacement</Eyebrow>
        <h1 className="serif" style={{ fontSize: 52, marginTop: 18, maxWidth: 900, lineHeight: 1.04 }}>
          Give us a part number that no longer exists. <em>We'll tell you what fits.</em>
        </h1>
        <p className="lede" style={{ marginTop: 18, maxWidth: 660 }}>
          Obsolete codes, superseded series, cast markings with no catalogue behind them. Our engineering desk maintains an
          interchange database across 14 brands and documents every substitution rather than making it quietly.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 32, maxWidth: 860 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 15, top: 17, color: "var(--ih-muted)", display: "flex" }}>{I.search}</span>
            <input className="ih-field" style={{ height: 52, paddingLeft: 44, fontSize: 15.5 }} defaultValue="A10VSO 71 DFR/31R-PPA12N00" />
          </div>
          <select className="ih-field" style={{ height: 52, width: 180, fontSize: 14 }}><option>Any brand</option></select>
          <Btn kind="primary" size="lg" style={{ height: 52, padding: "0 26px" }}>Cross-reference</Btn>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center", flexWrap: "wrap" }}>
          <span className="eyebrow" style={{ marginRight: 4 }}>Try</span>
          {["DSG-01-3C4-A240", "PVQ32-B2R-SS1S", "4WE6D62/EG24", "SB330-10A1", "T6C-012-1R00"].map(t => <Chip key={t} ghost>{t}</Chip>)}
        </div>
      </div>
    </div>

    {/* RESULT */}
    <section className="ih-sec">
      <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 320px", gap: 40, alignItems: "start" }}>
        <div>
          <SecHead eyebrow="1 exact match · 3 related" title="What replaces it" />
          <div className="ih-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 44px 1fr", alignItems: "stretch" }}>
              <div style={{ padding: 26 }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--ih-muted)" }}>YOU SEARCHED · OBSOLETE</div>
                <div className="mono" style={{ fontSize: 17, marginTop: 12, lineHeight: 1.4, color: "var(--ih-ink-2)" }}>A10VSO 71<br />DFR/31R-PPA12N00</div>
                <div style={{ marginTop: 14 }}><Badge kind="danger" dot>Discontinued 2019</Badge></div>
                <p style={{ fontSize: 12.5, color: "var(--ih-muted)", marginTop: 14, lineHeight: 1.6 }}>
                  Bosch Rexroth · axial piston pump, variable · series 31
                </p>
              </div>
              <div style={{ display: "grid", placeItems: "center", background: "var(--ih-surface-2)", borderLeft: "1px solid var(--ih-border)", borderRight: "1px solid var(--ih-border)" }}>
                <span style={{ color: "var(--ih-accent)", display: "flex" }}>{I.arrowR}</span>
              </div>
              <div style={{ padding: 26, background: "var(--ih-accent-soft)" }}>
                <div className="mono" style={{ fontSize: 10, letterSpacing: ".12em", color: "var(--ih-accent)" }}>CURRENT EQUIVALENT · IN STOCK</div>
                <div className="mono" style={{ fontSize: 17, marginTop: 12, lineHeight: 1.4, color: "var(--ih-ink)" }}>A10VSO 71<br />DFR1/32R-VPB12N00</div>
                <div style={{ display: "flex", gap: 6, marginTop: 14 }}>
                  <Badge kind="success" dot>18 in stock</Badge><Badge kind="accent">Exact fit</Badge>
                </div>
                <p style={{ fontSize: 12.5, color: "oklch(0.42 0.07 248)", marginTop: 14, lineHeight: 1.6 }}>
                  Bosch Rexroth · IH-AP71-D-R-V · ships in 24h ex-Jebel Ali
                </p>
              </div>
            </div>
            <div style={{ padding: "18px 26px", borderTop: "1px solid var(--ih-border)", display: "flex", gap: 10, alignItems: "center" }}>
              <Btn kind="primary" icon={I.doc}>Add to quote</Btn>
              <Btn kind="outline" icon={I.download}>Datasheet RE 92711</Btn>
              <Btn kind="ghost" icon={I.compare}>Compare both</Btn>
            </div>
          </div>

          {/* what changed */}
          <h3 style={{ fontSize: 17, margin: "36px 0 14px" }}>What changed between the two</h3>
          <div className="ih-card">
            <table className="ih-table">
              <thead><tr><th style={{ width: "26%" }}>Attribute</th><th>Obsolete · series 31</th><th>Current · series 32</th><th style={{ width: 130 }}>Effect on fit</th></tr></thead>
              <tbody>{[["Mounting flange", "SAE-C 4-bolt", "SAE-C 4-bolt", "None", 0],
                ["Shaft", "Splined 14T 12/24 DP", "Splined 14T 12/24 DP", "None", 0],
                ["Port thread", "1¼\" BSP / ¾\" BSP", "1¼\" BSP / ¾\" BSP", "None", 0],
                ["Overall length", "268 mm", "268 mm", "None", 0],
                ["Control", "DFR pressure & flow", "DFR1 pressure & flow", "Setting range widened", 1],
                ["Seal material", "NBR", "FKM", "Higher fluid temp OK", 1],
                ["Max speed", "2600 rpm", "2600 rpm", "None", 0]].map(([a, o, c, e, flag]) => <tr key={a}>
                <td style={{ fontWeight: 500, fontSize: 13 }}>{a}</td>
                <td className="num" style={{ fontSize: 12, color: "var(--ih-muted)" }}>{o}</td>
                <td className="num" style={{ fontSize: 12 }}>{c}</td>
                <td>{flag ? <Badge kind="steel">{e}</Badge> : <span style={{ fontSize: 12, color: "var(--ih-muted-2)" }}>{e}</span>}</td>
              </tr>)}</tbody>
            </table>
          </div>
          <div className="ih-note" style={{ marginTop: 16 }}>
            Both changes are improvements, not compromises — the revised control has a wider setting range and FKM tolerates
            higher fluid temperature. Nothing about the installation changes.
          </div>

          {/* related interchanges */}
          <h3 style={{ fontSize: 17, margin: "36px 0 14px" }}>Other interchanges on this circuit</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {XREF.slice(1).map(x => <div key={x.obs} className="ih-card" style={{ padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                <span className="mono" style={{ fontSize: 12.5, color: "var(--ih-muted)" }}>{x.obs}</span>
                <span style={{ color: "var(--ih-muted-2)", display: "flex" }}>{I.arrowR}</span>
                <span className="mono" style={{ fontSize: 12.5, color: "var(--ih-ink)", fontWeight: 500 }}>{x.cur}</span>
                <Badge kind={x.conf === "Exact fit" ? "success" : "warn"} dot style={{ marginLeft: "auto" }}>{x.conf}</Badge>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--ih-muted)", marginTop: 10, lineHeight: 1.6 }}>{x.note}</p>
              <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <Btn kind="outline" size="sm">View listing</Btn><Btn kind="ghost" size="sm">Add to quote</Btn>
              </div>
            </div>)}
          </div>
        </div>

        {/* rail */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16, position: "sticky", top: 20 }}>
          <div className="ih-card" style={{ padding: 22 }}>
            <Eyebrow>No number to search?</Eyebrow>
            <p style={{ fontSize: 13, color: "var(--ih-ink-2)", marginTop: 10, lineHeight: 1.6 }}>
              Photograph the nameplate or the cast markings on the body. Most identifications need nothing else.
            </p>
            <div style={{ border: "1px dashed var(--ih-border-strong)", borderRadius: 8, padding: 22, textAlign: "center", background: "var(--ih-surface-2)", marginTop: 14 }}>
              <span style={{ color: "var(--ih-steel)", display: "inline-flex" }}>{I.upload}</span>
              <div style={{ fontSize: 12.5, marginTop: 8 }}>Drop a nameplate photo</div>
              <div style={{ fontSize: 11, color: "var(--ih-muted)", marginTop: 4 }}>JPG, PNG, HEIC · up to 25 MB</div>
            </div>
            <Btn kind="primary" size="sm" style={{ width: "100%", marginTop: 14 }}>Identify this part</Btn>
          </div>

          <div className="ih-card" style={{ padding: 22 }}>
            <Eyebrow>How we cross-reference</Eyebrow>
            <div style={{ marginTop: 14, display: "flex", flexDirection: "column" }}>
              {[["01", "Decode the original", "Series, size, control, rotation, ports and seals read off the code or the plate."],
                ["02", "Match the envelope", "Mounting, shaft, port positions and overall length checked against the current drawing."],
                ["03", "Check the duty", "Pressure, speed, fluid and temperature compared — a fit that won't survive isn't a fit."],
                ["04", "Document it", "The interchange goes in writing, with what changed and why, before you order."]].map(([n, t, d], i, arr) =>
                <div key={n} style={{ display: "flex", gap: 13, paddingBottom: i < arr.length - 1 ? 16 : 0 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <span className="mono" style={{ fontSize: 9.5, color: "var(--ih-accent)", marginTop: 1 }}>{n}</span>
                    {i < arr.length - 1 && <span style={{ width: 1, flex: 1, background: "var(--ih-border)", marginTop: 6 }} />}
                  </div>
                  <div><div style={{ fontSize: 12.5, fontWeight: 500 }}>{t}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ih-muted)", marginTop: 4, lineHeight: 1.5 }}>{d}</div></div>
                </div>)}
            </div>
          </div>

          <div className="ih-card" style={{ padding: 22, background: "var(--ih-steel-soft)", borderColor: "oklch(0.88 0.03 240)" }}>
            <div style={{ fontSize: 13.5, fontWeight: 500 }}>Borderline call?</div>
            <p style={{ fontSize: 12.5, color: "var(--ih-ink-2)", marginTop: 8, lineHeight: 1.55 }}>
              If the substitution depends on your duty cycle, an applications engineer will look at the circuit rather than guess.
            </p>
            <div className="mono" style={{ fontSize: 14, marginTop: 12 }}>+971 52 2477942</div>
            <Btn kind="outline" size="sm" style={{ width: "100%", marginTop: 12, background: "var(--ih-surface)" }}>Talk to an engineer</Btn>
          </div>
        </div>
      </div>
    </section>

    {/* POPULAR */}
    <section className="ih-sec" style={{ paddingTop: 0 }}>
      <SecHead eyebrow="Looked up most this quarter" title="Interchanges people ask for"
        action={<Btn kind="outline" iconR={I.arrowR}>Download the full interchange list</Btn>} />
      <div className="ih-card">
        <table className="ih-table">
          <thead><tr><th>Obsolete code</th><th>Brand</th><th>Current equivalent</th><th style={{ width: 120 }}>Fit</th><th style={{ width: 110 }}>Stock</th><th /></tr></thead>
          <tbody>{[...XREF, ...XREF.slice(0, 2)].map((x, i) => <tr key={i}>
            <td className="num" style={{ fontSize: 12, color: "var(--ih-muted)" }}>{x.obs}</td>
            <td style={{ fontSize: 12.5 }}>{x.brand}</td>
            <td className="num" style={{ fontSize: 12, color: "var(--ih-accent)" }}>{x.cur}</td>
            <td><Badge kind={x.conf === "Exact fit" ? "success" : "warn"} dot>{x.conf}</Badge></td>
            <td className="num" style={{ fontSize: 12.5 }}>{[18, 44, 132, 7, 18, 44][i]}</td>
            <td style={{ textAlign: "right" }}><Btn kind="outline" size="sm">Quote</Btn></td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>
    <SiteFooter /></>;
}
Object.assign(window, { ReplacementPage, XREF });
