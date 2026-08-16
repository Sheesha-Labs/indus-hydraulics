/* eslint-disable */
// Product detail and the quote path.

function ProductPage() {
  const specs = [["Working pressure", "350 bar"], ["Peak pressure", "400 bar"], ["Displacement", "71 cc/rev"], ["Max speed", "2600 rpm"],
    ["Mounting flange", "SAE-C 4-bolt · ISO 3019-1"], ["Shaft", "Splined 14T 12/24 DP"], ["Port thread", "1¼\" BSP suction · ¾\" BSP pressure"],
    ["Control", "DFR1 pressure & flow"], ["Seal material", "FKM (Viton)"], ["Fluid temp range", "−20 °C to +90 °C"], ["Weight", "31.5 kg"], ["Certification", "ISO 4413 · CE"]];
  return <><UtilityBar /><SiteNav active="Products" />
    <div style={{ padding: "20px 48px 0" }}><Crumb items={["Catalogue", "Hydraulic Pumps", "Piston pumps", "A10VSO 71"]} /></div>
    <div style={{ padding: "18px 48px 44px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "start" }}>
      <div>
        <Img style={{ aspectRatio: "4/3", borderRadius: 12 }} label="A10VSO 71 · three-quarter view · 1200×900" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginTop: 12 }}>
          {["front", "port face", "shaft end", "dimensional dwg", "curve"].map((t, i) =>
            <Img key={t} style={{ aspectRatio: "1/1", borderRadius: 6, border: i === 0 ? "1.5px solid var(--ih-accent)" : "1px solid var(--ih-border)" }} label={t} />)}
        </div>
      </div>
      <div>
        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 12 }}>
          <Badge kind="square" style={{ background: "var(--ih-navy)", color: "#fff" }}>NEW</Badge>
          <span className="mono" style={{ fontSize: 11.5, color: "var(--ih-muted)" }}>IH-AP71-D-R-V</span>
        </div>
        <h1 style={{ fontSize: 34, lineHeight: 1.12 }}>Axial Piston Pump A10VSO 71cc</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 14 }}>
          <span style={{ fontSize: 14, color: "var(--ih-ink-2)" }}>Bosch Rexroth</span>
          <span style={{ color: "var(--ih-border-strong)" }}>·</span>
          <Badge kind="accent">Authorised distributor</Badge>
          <Badge kind="success" dot>18 in stock · Mumbai</Badge>
        </div>
        <p className="lede" style={{ marginTop: 18 }}>
          Variable-displacement axial piston pump for open-circuit industrial and mobile applications. DFR1 control holds set pressure while
          reducing flow on demand, cutting standby heat in press and clamping circuits.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
          <Btn kind="primary" size="lg" icon={I.doc}>Add to quote</Btn>
          <Btn kind="outline" size="lg" icon={I.download}>Datasheet RE 92711</Btn>
          <Btn kind="ghost" size="lg" icon={I.compare}>Compare</Btn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 26 }}>
          {[[I.truck, "Ships in 24h", "Ex-Mumbai bonded"], [I.shield, "12-month warranty", "Genuine OEM"], [I.wrench, "Rebuild available", "Exchange unit"]].map(([ic, t, s], i) =>
            <div key={i} className="ih-card" style={{ padding: 14, display: "flex", gap: 10 }}>
              <span style={{ color: "var(--ih-steel)", display: "flex" }}>{ic}</span>
              <div><div style={{ fontSize: 12.5, fontWeight: 500 }}>{t}</div><div style={{ fontSize: 11.5, color: "var(--ih-muted)", marginTop: 2 }}>{s}</div></div>
            </div>)}
        </div>
      </div>
    </div>
    <div style={{ padding: "0 48px" }}><div className="ih-tabs">{["Specifications", "Dimensions & drawings", "Performance curves", "Cross-reference", "Rebuild kit"].map((t, i) => <span key={t} className={`ih-tab ${i === 0 ? "is-active" : ""}`}>{t}</span>)}</div></div>
    <div style={{ padding: "32px 48px 64px", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 56, alignItems: "start" }}>
      <div>
        <h3 style={{ fontSize: 17, marginBottom: 16 }}>Technical specification</h3>
        <div className="ih-card" style={{ padding: "4px 20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 40 }}>
            <Spec rows={specs.slice(0, 6)} /><Spec rows={specs.slice(6)} />
          </div>
        </div>
        <h3 style={{ fontSize: 17, margin: "32px 0 16px" }}>Ordering code</h3>
        <div className="ih-card" style={{ padding: 20 }}>
          <div className="mono" style={{ fontSize: 15, letterSpacing: ".02em", display: "flex", gap: 4, flexWrap: "wrap" }}>
            {["A10VSO", "71", "DFR1", "32R", "VPB12N00"].map((s, i) => <span key={i} style={{ padding: "5px 9px", background: i === 1 ? "var(--ih-accent-soft)" : "var(--ih-surface-2)", color: i === 1 ? "var(--ih-accent)" : "var(--ih-ink)", borderRadius: 4 }}>{s}</span>)}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 4, marginTop: 10, fontSize: 11, color: "var(--ih-muted)" }}>
            {["Series", "Size (cc)", "Control", "Rotation / series", "Ports & seals"].map(s => <span key={s}>{s}</span>)}
          </div>
        </div>
      </div>
      <div>
        <div className="ih-card" style={{ padding: 22 }}>
          <Eyebrow>Request pricing</Eyebrow>
          <p style={{ fontSize: 13.5, color: "var(--ih-ink-2)", marginTop: 10, lineHeight: 1.55 }}>We quote per order — pricing depends on quantity, control variant and destination. A hydraulics engineer replies within four working hours.</p>
          <div style={{ display: "flex", gap: 10, marginTop: 16, alignItems: "flex-end" }}>
            <Field label="Quantity" style={{ width: 90 }}><input className="ih-field" defaultValue="2" /></Field>
            <Field label="Required by" style={{ flex: 1 }}><input className="ih-field" defaultValue="Within 2 weeks" /></Field>
          </div>
          <Btn kind="primary" style={{ width: "100%", marginTop: 14 }}>Add to quote list</Btn>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <Btn kind="outline" size="sm" style={{ flex: 1 }} icon={I.phone}>Call desk</Btn>
            <Btn kind="outline" size="sm" style={{ flex: 1 }} icon={I.bookmark}>Save</Btn>
          </div>
        </div>
        <div className="ih-card" style={{ padding: 22, marginTop: 16 }}>
          <Eyebrow>Frequently paired</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
            {PRODUCTS.slice(4, 7).map(p => <a key={p.sku} style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <Img style={{ width: 52, height: 52, borderRadius: 5, flexShrink: 0 }} label="" />
              <div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.3 }}>{p.t}</div>
                <div className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted)", marginTop: 3 }}>{p.sku}</div></div>
            </a>)}
          </div>
        </div>
      </div>
    </div>
    <SiteFooter /></>;
}

function QuotePage() {
  const lines = PRODUCTS.slice(0, 4);
  return <><UtilityBar /><SiteNav active="Products" />
    <div style={{ padding: "26px 48px 0" }}><Crumb items={["Quote list"]} /></div>
    <div style={{ padding: "14px 48px 64px", display: "grid", gridTemplateColumns: "1fr 340px", gap: 40, alignItems: "start" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
          <div><h1 className="serif" style={{ fontSize: 36 }}>Your quote list</h1>
            <p style={{ fontSize: 13.5, color: "var(--ih-muted)", marginTop: 8 }}>4 line items · saved to this browser and to your account</p></div>
          <Btn kind="ghost" size="sm" icon={I.upload}>Import a parts list (CSV)</Btn>
        </div>
        <div className="ih-card">
          <table className="ih-table">
            <thead><tr><th style={{ width: "48%" }}>Component</th><th>Availability</th><th style={{ width: 110 }}>Qty</th><th>Required by</th><th /></tr></thead>
            <tbody>
              {lines.map((p, i) => <tr key={p.sku}>
                <td><div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <Img style={{ width: 46, height: 46, borderRadius: 5, flexShrink: 0 }} label="" />
                  <div><div style={{ fontSize: 13.5, fontWeight: 500 }}>{p.t}</div>
                    <div className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted)", marginTop: 3 }}>{p.sku} · {p.b}</div></div>
                </div></td>
                <td><Badge kind={i === 2 ? "warn" : "success"} dot>{i === 2 ? "2–3 wk" : "In stock"}</Badge></td>
                <td><div style={{ display: "flex", alignItems: "center", border: "1px solid var(--ih-border)", borderRadius: 6, width: 92 }}>
                  <span style={{ padding: "6px 8px", color: "var(--ih-muted)", display: "flex" }}>{I.minus}</span>
                  <span className="mono" style={{ flex: 1, textAlign: "center", fontSize: 13 }}>{[2, 1, 4, 1][i]}</span>
                  <span style={{ padding: "6px 8px", color: "var(--ih-muted)", display: "flex" }}>{I.plus}</span>
                </div></td>
                <td className="num" style={{ fontSize: 12.5, color: "var(--ih-muted)" }}>{["12 Sep", "ASAP", "30 Sep", "ASAP"][i]}</td>
                <td style={{ textAlign: "right", color: "var(--ih-muted-2)" }}><span style={{ display: "inline-flex" }}>{I.cross}</span></td>
              </tr>)}
            </tbody>
          </table>
        </div>
        <div className="ih-note" style={{ marginTop: 18 }}>
          Indus quotes per order rather than listing prices — quantity, control variant, destination and duty all move the number. Nothing here is a commitment to buy.
        </div>
      </div>
      <div className="ih-card" style={{ padding: 22, position: "sticky", top: 20 }}>
        <h3 style={{ fontSize: 16 }}>Send this list</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 18 }}>
          <Field label="Company"><input className="ih-field" placeholder="Registered name" /></Field>
          <Field label="Work email"><input className="ih-field" placeholder="you@company.com" /></Field>
          <Field label="Destination" hint="Drives duty, packing and lead time"><select className="ih-field"><option>India — Maharashtra</option></select></Field>
          <Field label="Anything we should know?"><textarea className="ih-field" rows={3} placeholder="Application, existing unit, failure symptoms…" /></Field>
        </div>
        <Btn kind="primary" size="lg" style={{ width: "100%", marginTop: 18 }}>Request quotation</Btn>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 14, fontSize: 11.5, color: "var(--ih-muted)" }}>
          <span style={{ color: "var(--ih-steel)", display: "flex" }}>{I.shield}</span>Typical first reply: 3.4 hours, business days
        </div>
      </div>
    </div>
    <SiteFooter /></>;
}

function RfqPage() {
  const steps = [["01", "Within 1 hour", "Acknowledgement with an RFQ reference you can track."],
    ["02", "Within 4 hours", "An engineer reviews the spec and flags anything ambiguous."],
    ["03", "Within 24 hours", "Formal quotation with lead time, packing and incoterm."],
    ["04", "On acceptance", "Order confirmation, test certificates and dispatch tracking."]];
  return <><UtilityBar /><SiteNav active="Products" />
    <div style={{ background: "var(--ih-surface)", borderBottom: "1px solid var(--ih-border)", padding: "52px 48px 44px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <Eyebrow>Request for quotation</Eyebrow>
        <h1 className="serif" style={{ fontSize: 46, marginTop: 16, maxWidth: 760, lineHeight: 1.06 }}>
          Tell us what failed, or what you need to <em>build</em>.
        </h1>
        <p className="lede" style={{ marginTop: 16, maxWidth: 620 }}>
          Part numbers are welcome but not required. A nameplate photo and a description of the circuit is usually enough.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, marginTop: 40, background: "var(--ih-border)", border: "1px solid var(--ih-border)", borderRadius: 10, overflow: "hidden" }}>
          {steps.map(([n, t, d]) => <div key={n} style={{ background: "var(--ih-surface)", padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span className="mono" style={{ fontSize: 10.5, color: "var(--ih-accent)" }}>/{n}</span>
              <span className="mono" style={{ fontSize: 10.5, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--ih-ink-2)" }}>{t}</span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--ih-muted)", marginTop: 8, lineHeight: 1.5 }}>{d}</p>
          </div>)}
        </div>
      </div>
    </div>

    <div style={{ padding: "44px 48px 72px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 320px", gap: 36, alignItems: "start" }}>
        <div className="ih-card" style={{ padding: 32 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", paddingBottom: 18, marginBottom: 26, borderBottom: "1px solid var(--ih-border)" }}>
            <h2 style={{ fontSize: 19 }}>Your requirement</h2>
            <span className="mono" style={{ fontSize: 11, color: "var(--ih-muted)" }}>ALL FIELDS OPTIONAL EXCEPT EMAIL</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <Field label="Full name"><input className="ih-field" placeholder="Jane Mehta" /></Field>
            <Field label="Company"><input className="ih-field" placeholder="Registered name" /></Field>
            <Field label="Work email"><input className="ih-field" placeholder="you@company.com" /></Field>
            <Field label="Phone / WhatsApp"><input className="ih-field" placeholder="+91 …" /></Field>
            <Field label="Country"><select className="ih-field"><option>India</option></select></Field>
            <Field label="Industry"><select className="ih-field"><option>Select…</option></select></Field>
            <Field label="What do you need?" style={{ gridColumn: "span 2" }}>
              <textarea className="ih-field" rows={5} placeholder="e.g. Replacement for a Rexroth A10VSO 71 on a 250T press. Losing pressure above 60 °C. Need two units, one urgent." />
            </Field>
            <div style={{ gridColumn: "span 2" }}>
              <label className="ih-label">Attachments</label>
              <div style={{ border: "1px dashed var(--ih-border-strong)", borderRadius: 8, padding: 28, textAlign: "center", background: "var(--ih-surface-2)" }}>
                <span style={{ color: "var(--ih-steel)", display: "inline-flex" }}>{I.upload}</span>
                <div style={{ fontSize: 13, marginTop: 8 }}>Drop a nameplate photo, drawing or parts list</div>
                <div style={{ fontSize: 11.5, color: "var(--ih-muted)", marginTop: 4 }}>PDF, DWG, XLSX, JPG · up to 25 MB</div>
              </div>
            </div>
            <Field label="How soon do you need it?" style={{ gridColumn: "span 2" }}>
              <div style={{ display: "flex", gap: 8 }}>
                {["Urgent — line is down", "Within 2 weeks", "This quarter", "Budgetary only"].map((t, i) => <Chip key={t} on={i === 1}>{t}</Chip>)}
              </div>
            </Field>
          </div>
          <div style={{ display: "flex", gap: 14, alignItems: "center", marginTop: 30, paddingTop: 22, borderTop: "1px solid var(--ih-border)" }}>
            <Btn kind="primary" size="lg">Send request</Btn>
            <span style={{ fontSize: 12.5, color: "var(--ih-muted)" }}>We reply to every RFQ, including the ones we can't fill.</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="ih-card" style={{ padding: 22, background: "var(--ih-steel-soft)", borderColor: "oklch(0.88 0.03 240)" }}>
            <Eyebrow style={{ color: "oklch(0.44 0.07 240)" }}>Parts desk</Eyebrow>
            <p style={{ fontSize: 13.5, color: "var(--ih-ink-2)", marginTop: 10, lineHeight: 1.55 }}>
              Staffed 09:00–18:00 GST, Monday to Friday. Ask for the applications engineer if the circuit is unusual.
            </p>
            <div className="mono" style={{ fontSize: 17, marginTop: 14, color: "var(--ih-ink)" }}>+971 52 2477942</div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <Btn kind="outline" size="sm" icon={I.phone} style={{ flex: 1, background: "var(--ih-surface)" }}>Call</Btn>
              <Btn kind="outline" size="sm" icon={I.mail} style={{ flex: 1, background: "var(--ih-surface)" }}>Email</Btn>
            </div>
          </div>
          <div className="ih-card" style={{ padding: 22 }}>
            <Eyebrow>Already sent one?</Eyebrow>
            <p style={{ fontSize: 13, color: "var(--ih-muted)", marginTop: 10, lineHeight: 1.55 }}>Track status with the reference from your acknowledgement email.</p>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              <input className="ih-field" placeholder="RFQ-0000" />
              <Btn kind="outline">Track</Btn>
            </div>
          </div>
          <div className="ih-card" style={{ padding: 22 }}>
            <Eyebrow>What helps us quote faster</Eyebrow>
            <div style={{ display: "flex", flexDirection: "column", gap: 11, marginTop: 14 }}>
              {["A photo of the nameplate or cast markings", "The machine and circuit the part sits in", "Failure symptoms, if it's a replacement", "Destination port or plant address"].map(t =>
                <div key={t} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12.5, color: "var(--ih-ink-2)" }}>
                  <span style={{ color: "var(--ih-accent)", display: "flex", marginTop: 1 }}><Icn size={14} sw={2} d={<path d="m5 12 5 5L20 7" />} /></span>
                  <span style={{ lineHeight: 1.45 }}>{t}</span>
                </div>)}
            </div>
          </div>
        </div>
      </div>
    </div>
    <SiteFooter /></>;
}
Object.assign(window, { ProductPage, QuotePage, RfqPage });
