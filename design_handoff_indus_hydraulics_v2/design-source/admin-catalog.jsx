/* eslint-disable */
// Admin — catalogue operations.

function AdminProductEdit() {
  return <AdminShell active="Products" title="Axial Piston Pump A10VSO 71cc" sub="IH-AP71-D-R-V · last edited 2 days ago by R. Kulkarni"
    actions={<><Badge kind="success" dot>Live</Badge><Btn kind="ghost" size="sm">Preview</Btn><Btn kind="outline" size="sm">Save draft</Btn><Btn kind="primary" size="sm">Publish changes</Btn></>}>
    <div className="ih-tabs" style={{ marginBottom: 20 }}>{["Details", "Specifications", "Media", "Pricing & stock", "SEO", "Cross-reference", "History"].map((t, i) =>
      <span key={t} className={`ih-tab ${i === 0 ? "is-active" : ""}`}>{t}</span>)}</div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="ih-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, marginBottom: 16 }}>Identity</h3>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
            <Field label="Product title"><input className="ih-field" defaultValue="Axial Piston Pump A10VSO 71cc" /></Field>
            <Field label="SKU"><input className="ih-field" defaultValue="IH-AP71-D-R-V" /></Field>
            <Field label="Manufacturer part number"><input className="ih-field" defaultValue="A10VSO 71 DFR1/32R-VPB12N00" /></Field>
            <Field label="Brand"><select className="ih-field"><option>Bosch Rexroth</option></select></Field>
            <Field label="Category"><select className="ih-field"><option>Hydraulic Pumps › Piston</option></select></Field>
            <Field label="Country of origin"><select className="ih-field"><option>Germany</option></select></Field>
            <Field label="Short description" style={{ gridColumn: "span 2" }}>
              <textarea className="ih-field" rows={3} defaultValue="Variable-displacement axial piston pump for open-circuit industrial and mobile applications. DFR1 control holds set pressure while reducing flow on demand." /></Field>
          </div>
        </div>
        <div className="ih-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14 }}>Specification table</h3>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted)", marginLeft: 10 }}>12 ATTRIBUTES</span>
            <Btn kind="outline" size="sm" icon={I.plus} style={{ marginLeft: "auto" }}>Add row</Btn>
          </div>
          <table className="ih-table">
            <thead><tr><th>Attribute</th><th>Value</th><th>Unit</th><th>Filterable</th><th style={{ width: 36 }} /></tr></thead>
            <tbody>{[["Working pressure", "350", "bar", true], ["Displacement", "71", "cc/rev", true], ["Max speed", "2600", "rpm", false],
              ["Mounting flange", "SAE-C 4-bolt", "—", true], ["Seal material", "FKM", "—", true]].map(([a, v, u, f]) => <tr key={a}>
              <td style={{ fontWeight: 500 }}>{a}</td><td className="num">{v}</td><td className="num" style={{ color: "var(--ih-muted)" }}>{u}</td>
              <td><span className={`ih-check ${f ? "is-on" : ""}`}>{f && <Icn size={11} sw={2.6} d={<path d="m5 12 5 5L20 7" />} />}</span></td>
              <td style={{ textAlign: "right", color: "var(--ih-muted-2)" }}><span style={{ display: "inline-flex" }}>{I.dotsV}</span></td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="ih-card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>Media</h3>
          <Img style={{ aspectRatio: "4/3", borderRadius: 6 }} label="primary image" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 6, marginTop: 8 }}>
            {[0, 1, 2].map(i => <Img key={i} style={{ aspectRatio: "1/1", borderRadius: 4 }} label="" />)}
            <div style={{ aspectRatio: "1/1", border: "1px dashed var(--ih-border-strong)", borderRadius: 4, display: "grid", placeItems: "center", color: "var(--ih-muted)" }}>{I.plus}</div>
          </div>
          <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            {[["RE 92711 datasheet.pdf", "1.2 MB"], ["A10VSO dimensional.dwg", "840 KB"]].map(([n, s]) =>
              <div key={n} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12 }}>
                <span style={{ color: "var(--ih-steel)", display: "flex" }}>{I.doc}</span>
                <span style={{ flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{n}</span>
                <span className="mono" style={{ fontSize: 10, color: "var(--ih-muted)" }}>{s}</span></div>)}
          </div>
        </div>
        <div className="ih-card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>Stock & lead time</h3>
          <Spec rows={[["Mumbai", "18 units"], ["Dubai", "4 units"], ["Reorder point", "6"], ["Lead time", "24 hours"]]} />
        </div>
        <div className="ih-card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>Completeness</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[["Datasheet attached", true], ["Dimensional drawing", true], ["Performance curve", false], ["Meta description", true], ["Cross-references", false]].map(([t, ok]) =>
              <div key={t} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 12.5 }}>
                <span style={{ color: ok ? "var(--ih-success)" : "var(--ih-warning)", display: "flex" }}>
                  {ok ? <Icn size={14} sw={2} d={<path d="m5 12 5 5L20 7" />} /> : <Icn size={14} sw={2} d={<><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16h.01" /></>} />}
                </span>{t}</div>)}
          </div>
        </div>
      </div>
    </div>
  </AdminShell>;
}

function AdminCategories() {
  const tree = [["Hydraulic Pumps", 184, 0], ["Gear pumps", 42, 1], ["Vane pumps", 28, 1], ["Axial piston", 56, 1], ["Radial piston", 18, 1],
    ["Power packs", 40, 1], ["Cylinders", 226, 0], ["Tie-rod ISO 6020/2", 92, 1], ["Welded / mill type", 64, 1], ["Telescopic", 30, 1],
    ["Valves & Manifolds", 412, 0], ["Hoses & Fittings", 540, 0]];
  return <AdminShell active="Categories" title="Categories" sub="6 top-level · 34 sub-categories"
    actions={<><Btn kind="outline" size="sm">Reorder</Btn><Btn kind="primary" size="sm" icon={I.plus}>New category</Btn></>}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 20, alignItems: "start" }}>
      <div className="ih-card">
        <table className="ih-table">
          <thead><tr><th>Category</th><th>SKUs</th><th>Slug</th><th>Menu</th><th>Status</th><th style={{ width: 36 }} /></tr></thead>
          <tbody>{tree.map(([n, c, d], i) => <tr key={n} style={i === 3 ? { background: "var(--ih-accent-soft)" } : undefined}>
            <td><span style={{ paddingLeft: d * 22, display: "inline-flex", alignItems: "center", gap: 8 }}>
              {d === 0 ? <span style={{ color: "var(--ih-muted-2)", display: "flex" }}>{I.chevD}</span> : <span style={{ width: 16 }} />}
              <span style={{ fontWeight: d === 0 ? 500 : 400, fontSize: d === 0 ? 13.5 : 13 }}>{n}</span></span></td>
            <td className="num">{c}</td>
            <td className="num" style={{ fontSize: 11.5, color: "var(--ih-muted)" }}>/{n.toLowerCase().replace(/[^a-z0-9]+/g, "-")}</td>
            <td>{d === 0 ? <Badge kind="steel">Featured</Badge> : <span style={{ color: "var(--ih-muted-2)", fontSize: 12 }}>—</span>}</td>
            <td><Badge kind="success" dot>Live</Badge></td>
            <td style={{ textAlign: "right", color: "var(--ih-muted-2)" }}><span style={{ display: "inline-flex" }}>{I.dotsV}</span></td>
          </tr>)}</tbody>
        </table>
      </div>
      <div className="ih-card" style={{ padding: 20 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}><h3 style={{ fontSize: 14 }}>Axial piston</h3>
          <Badge kind="accent" style={{ marginLeft: "auto" }}>Editing</Badge></div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Name"><input className="ih-field" defaultValue="Axial piston" /></Field>
          <Field label="Parent"><select className="ih-field"><option>Hydraulic Pumps</option></select></Field>
          <Field label="Slug"><input className="ih-field" defaultValue="axial-piston" /></Field>
          <Field label="Description"><textarea className="ih-field" rows={3} defaultValue="Variable and fixed displacement axial piston pumps for open and closed circuits." /></Field>
          <Field label="Category image"><Img style={{ aspectRatio: "16/9", borderRadius: 6 }} label="category image" /></Field>
          <Field label="Filterable attributes">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>{["Pressure", "Displacement", "Control", "Mounting", "Brand"].map(t => <Chip key={t} on>{t}</Chip>)}</div>
          </Field>
        </div>
        <Btn kind="primary" size="sm" style={{ width: "100%", marginTop: 18 }}>Save category</Btn>
      </div>
    </div>
  </AdminShell>;
}

function AdminInventory() {
  const rows = [["IH-AP71-D-R-V", "Axial Piston Pump A10VSO 71cc", 18, 4, 6, "24h", "ok"], ["IH-DSG-01-3C4-D24", "Solenoid Directional Valve DSG-01", 44, 12, 20, "24h", "ok"],
    ["IH-CYL-80-50-300", "ISO 6020/2 Tie-Rod Cylinder 80×50×300", 0, 0, 4, "3 wk", "out"], ["IH-SB330-10A1", "Bladder Accumulator SB330 10L", 7, 2, 10, "10 d", "low"],
    ["IH-PVQ-32-B2R", "Variable Vane Pump PVQ32 B2R", 132, 28, 25, "24h", "ok"], ["IH-RE-06-P-10", "Pressure Relief Valve RE-06 Pilot", 26, 6, 15, "48h", "ok"],
    ["IH-2SN-12-BSP", "2SN Hose Assembly 3/4\" BSP", 91, 40, 60, "24h", "ok"], ["IH-RFV-0160-D", "Return Line Filter RFV 0160 10µ", 3, 1, 12, "2 wk", "low"]];
  const kind = { ok: "success", low: "warn", out: "danger" }, lbl = { ok: "Healthy", low: "Below reorder", out: "Stock-out" };
  return <AdminShell active="Inventory" title="Inventory" sub="Two locations · 38 lines below reorder point"
    actions={<><Btn kind="outline" size="sm" icon={I.download}>Stock report</Btn><Btn kind="primary" size="sm">Raise purchase order</Btn></>}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
      <Stat label="Lines held" value="1,870" /><Stat label="Below reorder" value="38" delta="+11" down />
      <Stat label="Stock-outs" value="6" delta="+2" down /><Stat label="Stock value" value="₹4.2 Cr" delta="+3.1%" />
    </div>
    <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
      <Chip on>All</Chip><Chip>Below reorder · 38</Chip><Chip>Stock-out · 6</Chip><Chip>Overstocked · 14</Chip>
      <select className="ih-field" style={{ width: 160, height: 32, marginLeft: "auto" }}><option>All locations</option></select>
    </div>
    <div className="ih-card">
      <table className="ih-table">
        <thead><tr><th>SKU</th><th>Product</th><th>Mumbai</th><th>Dubai</th><th>Reorder pt</th><th>Lead time</th><th>Status</th><th /></tr></thead>
        <tbody>{rows.map(([sku, t, m, d, r, l, s]) => <tr key={sku}>
          <td className="num" style={{ fontSize: 11.5, color: "var(--ih-muted)" }}>{sku}</td>
          <td style={{ fontWeight: 500, fontSize: 13 }}>{t}</td>
          <td className="num" style={{ color: m === 0 ? "var(--ih-danger)" : m <= r ? "oklch(0.5 0.1 62)" : undefined }}>{m}</td>
          <td className="num">{d}</td><td className="num" style={{ color: "var(--ih-muted)" }}>{r}</td>
          <td className="num" style={{ color: "var(--ih-muted)" }}>{l}</td>
          <td><Badge kind={kind[s]} dot>{lbl[s]}</Badge></td>
          <td style={{ textAlign: "right" }}><Btn kind="outline" size="sm">Adjust</Btn></td>
        </tr>)}</tbody>
      </table>
    </div>
  </AdminShell>;
}

function AdminPricing() {
  return <AdminShell active="Pricing" title="Pricing" sub="Quote-only catalogue · internal cost and margin bands"
    actions={<><Btn kind="outline" size="sm" icon={I.upload}>Import cost file</Btn><Btn kind="primary" size="sm">Save bands</Btn></>}>
    <div className="ih-note" style={{ marginBottom: 18 }}>
      Nothing here is published. The storefront never shows a price — these bands drive the quoting tool and the margin warnings on the RFQ desk.
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 330px", gap: 20, alignItems: "start" }}>
      <div className="ih-card">
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--ih-border)", display: "flex", alignItems: "center" }}>
          <h3 style={{ fontSize: 14 }}>Margin bands by category</h3>
          <Btn kind="outline" size="sm" icon={I.plus} style={{ marginLeft: "auto" }}>Add band</Btn>
        </div>
        <table className="ih-table">
          <thead><tr><th>Category</th><th>Landed cost basis</th><th>Target margin</th><th>Floor</th><th>Auto-quote</th><th /></tr></thead>
          <tbody>{[["Hydraulic Pumps", "FOB + 12% duty", "34%", "22%", true], ["Cylinders", "FOB + 12% duty", "38%", "26%", true],
            ["Valves & Manifolds", "CIF", "31%", "20%", true], ["Hoses & Fittings", "Ex-works + freight", "44%", "30%", false],
            ["Seals & Components", "CIF", "52%", "35%", true], ["Accessories", "CIF", "36%", "24%", false]].map(([c, b, m, f, a]) => <tr key={c}>
            <td style={{ fontWeight: 500 }}>{c}</td><td style={{ color: "var(--ih-muted)", fontSize: 12.5 }}>{b}</td>
            <td className="num" style={{ color: "var(--ih-accent)" }}>{m}</td><td className="num">{f}</td>
            <td>{a ? <Badge kind="success" dot>On</Badge> : <Badge>Manual</Badge>}</td>
            <td style={{ textAlign: "right", color: "var(--ih-muted-2)" }}><span style={{ display: "inline-flex" }}>{I.dotsV}</span></td>
          </tr>)}</tbody>
        </table>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="ih-card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, marginBottom: 14 }}>Customer tiers</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[["Tier 1 — contract", "−8% off band", 12], ["Tier 2 — repeat", "−4% off band", 68], ["Tier 3 — standard", "Band price", 410], ["Spot / one-off", "Band +5%", 1204]].map(([n, d, c]) =>
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 10, borderBottom: "1px solid var(--ih-border)" }}>
                <div style={{ flex: 1 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{n}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ih-muted)", marginTop: 2 }}>{d}</div></div>
                <span className="mono" style={{ fontSize: 11, color: "var(--ih-muted)" }}>{c}</span></div>)}
          </div>
        </div>
        <div className="ih-card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>Currency & duty</h3>
          <Spec rows={[["Base currency", "INR"], ["USD rate (locked)", "83.42"], ["EUR rate (locked)", "90.18"], ["Default incoterm", "CIF"], ["Rates refreshed", "15 Aug, 06:00"]]} />
        </div>
      </div>
    </div>
  </AdminShell>;
}

function AdminBulkImport() {
  return <AdminShell active="Bulk import" title="Bulk import" sub="Q3-Yuken.csv · 428 rows · 4 errors, 12 warnings"
    actions={<><Btn kind="ghost" size="sm">Discard</Btn><Btn kind="outline" size="sm">Download error report</Btn><Btn kind="primary" size="sm">Import 424 valid rows</Btn></>}>
    <div style={{ display: "flex", gap: 0, marginBottom: 20, border: "1px solid var(--ih-border)", borderRadius: 8, overflow: "hidden", background: "var(--ih-surface)" }}>
      {[["1", "Upload", true], ["2", "Map columns", true], ["3", "Validate", true], ["4", "Import", false]].map(([n, t, done], i) =>
        <div key={n} style={{ flex: 1, padding: "14px 18px", display: "flex", alignItems: "center", gap: 10, borderRight: i < 3 ? "1px solid var(--ih-border)" : 0,
          background: i === 2 ? "var(--ih-accent-soft)" : undefined }}>
          <span style={{ width: 22, height: 22, borderRadius: 999, display: "grid", placeItems: "center", fontSize: 11,
            background: i === 2 ? "var(--ih-accent)" : done ? "var(--ih-success)" : "var(--ih-surface-3)", color: (i === 2 || done) ? "#fff" : "var(--ih-muted)" }} className="mono">{done && i !== 2 ? "✓" : n}</span>
          <span style={{ fontSize: 13, fontWeight: i === 2 ? 500 : 400, color: i === 2 ? "var(--ih-accent)" : "var(--ih-ink-2)" }}>{t}</span>
        </div>)}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>
      <div className="ih-card">
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--ih-border)", display: "flex", gap: 8, alignItems: "center" }}>
          <h3 style={{ fontSize: 14 }}>Validation results</h3>
          <Badge kind="danger" dot>4 errors</Badge><Badge kind="warn" dot>12 warnings</Badge>
          <span className="mono" style={{ fontSize: 11, color: "var(--ih-muted)", marginLeft: "auto" }}>SHOWING ROWS WITH ISSUES</span>
        </div>
        <table className="ih-table">
          <thead><tr><th style={{ width: 60 }}>Row</th><th>SKU</th><th>Field</th><th>Issue</th><th>Severity</th></tr></thead>
          <tbody>{[[14, "YU-DSG-03-2B2", "working_pressure", "Value \"31.5 MPa\" — expected bar", "error"],
            [37, "YU-A3H-56-FR01", "category", "\"Piston Pump\" does not match any category", "error"],
            [88, "YU-BST-06-3C2", "brand", "Blank — will default to Yuken", "warn"],
            [141, "YU-DSHG-04-3C4", "sku", "Duplicate of row 96", "error"],
            [206, "YU-EFBG-03-125", "datasheet_url", "404 on fetch", "warn"],
            [318, "YU-MSA-01-X-30", "displacement", "Blank", "warn"],
            [402, "YU-SRCG-03-2", "moq", "Negative value (−4)", "error"]].map(([r, s, f, m, sev]) => <tr key={r}>
            <td className="num" style={{ color: "var(--ih-muted)" }}>{r}</td>
            <td className="num" style={{ fontSize: 11.5 }}>{s}</td>
            <td className="mono" style={{ fontSize: 11.5, color: "var(--ih-steel)" }}>{f}</td>
            <td style={{ fontSize: 12.5 }}>{m}</td>
            <td><Badge kind={sev === "error" ? "danger" : "warn"} dot>{sev === "error" ? "Error" : "Warning"}</Badge></td>
          </tr>)}</tbody>
        </table>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="ih-card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>Column mapping</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
            {[["part_no", "sku"], ["description", "title"], ["mfr", "brand"], ["press_bar", "working_pressure"], ["disp_cc", "displacement"], ["qty_moq", "moq"]].map(([a, b]) =>
              <div key={a} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11.5 }}>
                <span className="mono" style={{ flex: 1, color: "var(--ih-muted)" }}>{a}</span>
                <span style={{ color: "var(--ih-muted-2)", display: "flex" }}>{I.arrowR}</span>
                <span className="mono" style={{ flex: 1, textAlign: "right", color: "var(--ih-accent)" }}>{b}</span></div>)}
          </div>
        </div>
        <div className="ih-card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>Summary</h3>
          <Spec rows={[["Rows in file", "428"], ["Will create", "391"], ["Will update", "33"], ["Blocked", "4"], ["Estimated time", "~40 s"]]} />
        </div>
      </div>
    </div>
  </AdminShell>;
}
Object.assign(window, { AdminProductEdit, AdminCategories, AdminInventory, AdminPricing, AdminBulkImport });
