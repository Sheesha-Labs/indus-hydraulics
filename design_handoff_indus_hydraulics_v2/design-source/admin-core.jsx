/* eslint-disable */
// Admin console — dashboard and product master.

function AdminDashboard() {
  const queue = [["RFQ-4821", "Gulf Drilling Services", "Cylinders · 4 lines", "38 min", "warn"], ["RFQ-4820", "Tata Steel — Jamshedpur", "Valves · 12 lines", "1h 12m", "default"],
    ["RFQ-4819", "Mazagon Dock", "Pumps · 2 lines", "2h 04m", "default"], ["RFQ-4818", "Al Faris Equipment", "Hoses · 26 lines", "3h 41m", "default"],
    ["RFQ-4817", "Bharat Forge", "Accumulators · 1 line", "5h 20m", "success"]];
  return <AdminShell active="Dashboard" title="Dashboard" sub="Tuesday, 15 August 2026 · 09:42 IST"
    actions={<><Btn kind="ghost" size="sm" icon={I.bell} /><Btn kind="outline" size="sm" icon={I.download}>Export</Btn><Btn kind="primary" size="sm" icon={I.plus}>New product</Btn></>}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
      <Stat label="Open RFQs" value="24" delta="+6 vs last week" />
      <Stat label="Avg. first reply" value="3.4h" delta="−0.8h" />
      <Stat label="SKUs live" value="1,870" delta="+42 this month" />
      <Stat label="Stock-out lines" value="38" delta="+11" down />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 16, marginTop: 16 }}>
      <div className="ih-card">
        <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--ih-border)", display: "flex", alignItems: "center" }}>
          <h3 style={{ fontSize: 14.5 }}>Quote queue</h3>
          <Badge kind="accent" style={{ marginLeft: 10 }}>5 awaiting</Badge>
          <a style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--ih-accent)" }}>Open queue</a>
        </div>
        <table className="ih-table">
          <thead><tr><th>Ref</th><th>Customer</th><th>Scope</th><th>Waiting</th><th /></tr></thead>
          <tbody>{queue.map(([r, c, s, w, k]) => <tr key={r}>
            <td className="num" style={{ fontSize: 12, color: "var(--ih-accent)" }}>{r}</td>
            <td style={{ fontWeight: 500 }}>{c}</td>
            <td style={{ color: "var(--ih-muted)", fontSize: 12.5 }}>{s}</td>
            <td><Badge kind={k} dot={k !== "default"}>{w}</Badge></td>
            <td style={{ textAlign: "right" }}><Btn kind="outline" size="sm">Quote</Btn></td>
          </tr>)}</tbody>
        </table>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="ih-card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14.5, marginBottom: 14 }}>RFQs by category · 30 days</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
            {[["Valves & Manifolds", 82], ["Hoses & Fittings", 64], ["Cylinders", 51], ["Hydraulic Pumps", 46], ["Seals", 28], ["Accessories", 17]].map(([n, v]) =>
              <div key={n}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 5 }}><span>{n}</span><span className="mono" style={{ color: "var(--ih-muted)" }}>{v}</span></div>
                <div style={{ height: 5, background: "var(--ih-surface-3)", borderRadius: 3 }}><div style={{ width: `${v / 82 * 100}%`, height: "100%", background: "var(--ih-accent)", borderRadius: 3 }} /></div></div>)}
          </div>
        </div>
        <div className="ih-card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14.5, marginBottom: 12 }}>Needs attention</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[["38 SKUs below reorder point", "danger"], ["12 products missing a datasheet", "warn"], ["6 categories with no meta description", "warn"], ["Bulk import 'Q3-Yuken.csv' has 4 errors", "danger"]].map(([t, k]) =>
              <div key={t} style={{ display: "flex", gap: 9, alignItems: "flex-start", fontSize: 12.5 }}>
                <span className="ih-dot" style={{ marginTop: 6, color: k === "danger" ? "var(--ih-danger)" : "var(--ih-warning)" }} />
                <span style={{ flex: 1, color: "var(--ih-ink-2)" }}>{t}</span><span style={{ color: "var(--ih-muted-2)", display: "flex" }}>{I.chevR}</span>
              </div>)}
          </div>
        </div>
      </div>
    </div>
  </AdminShell>;
}

function AdminProducts() {
  const rows = [...PRODUCTS, ...PRODUCTS.slice(0, 3)];
  return <AdminShell active="Products" title="Products" sub="1,870 SKUs · 6 categories · 14 brands"
    actions={<><Btn kind="outline" size="sm" icon={I.upload}>Bulk import</Btn><Btn kind="primary" size="sm" icon={I.plus}>New product</Btn></>}>
    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 16 }}>
      <div style={{ position: "relative", width: 300 }}>
        <span style={{ position: "absolute", left: 11, top: 9, color: "var(--ih-muted)", display: "flex" }}>{I.search}</span>
        <input className="ih-field" style={{ height: 34, paddingLeft: 34 }} placeholder="Search SKU, title or brand" />
      </div>
      <select className="ih-field" style={{ width: 150, height: 34 }}><option>All categories</option></select>
      <select className="ih-field" style={{ width: 130, height: 34 }}><option>All brands</option></select>
      <Chip on>Live</Chip><Chip>Draft · 24</Chip><Chip>Archived</Chip>
      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
        <span className="mono" style={{ fontSize: 11.5, color: "var(--ih-muted)" }}>3 selected</span>
        <Btn kind="outline" size="sm">Bulk edit</Btn>
      </div>
    </div>
    <div className="ih-card">
      <table className="ih-table">
        <thead><tr>
          <th style={{ width: 36 }}><span className="ih-check" /></th><th style={{ width: "34%" }}>Product</th><th>SKU</th><th>Brand</th><th>Category</th><th>Stock</th><th>Status</th><th style={{ width: 40 }} />
        </tr></thead>
        <tbody>{rows.map((p, i) => { const s = [18, 44, 0, 7, 132, 26, 91, 3, 55, 12, 8][i]; return <tr key={i} style={i < 3 ? { background: "var(--ih-accent-soft)" } : undefined}>
          <td><span className={`ih-check ${i < 3 ? "is-on" : ""}`}>{i < 3 && <Icn size={11} sw={2.6} d={<path d="m5 12 5 5L20 7" />} />}</span></td>
          <td><div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Img style={{ width: 36, height: 36, borderRadius: 4, flexShrink: 0 }} label="" />
            <span style={{ fontWeight: 500, fontSize: 13 }}>{p.t}</span></div></td>
          <td className="num" style={{ fontSize: 11.5, color: "var(--ih-muted)" }}>{p.sku}</td>
          <td style={{ fontSize: 12.5 }}>{p.b}</td>
          <td style={{ fontSize: 12.5, color: "var(--ih-muted)" }}>{["Pumps", "Valves", "Cylinders", "Accessories"][i % 4]}</td>
          <td className="num" style={{ fontSize: 12.5, color: s === 0 ? "var(--ih-danger)" : s <= 10 ? "oklch(0.5 0.1 62)" : undefined }}>{s}</td>
          <td><Badge kind={i % 6 === 4 ? "warn" : "success"} dot>{i % 6 === 4 ? "Draft" : "Live"}</Badge></td>
          <td style={{ textAlign: "right", color: "var(--ih-muted-2)" }}><span style={{ display: "inline-flex" }}>{I.dotsV}</span></td>
        </tr>; })}</tbody>
      </table>
    </div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
      <span className="mono" style={{ fontSize: 11.5, color: "var(--ih-muted)" }}>Showing 1–11 of 1,870</span>
      <div style={{ display: "flex", gap: 6 }}>{["1", "2", "3", "…", "170"].map((n, i) =>
        <span key={i} style={{ minWidth: 30, height: 30, display: "grid", placeItems: "center", borderRadius: 5, fontSize: 12.5, border: "1px solid " + (i === 0 ? "var(--ih-accent)" : "var(--ih-border)"), background: i === 0 ? "var(--ih-accent)" : "var(--ih-surface)", color: i === 0 ? "#fff" : "var(--ih-ink-2)" }}>{n}</span>)}</div>
    </div>
  </AdminShell>;
}
Object.assign(window, { AdminDashboard, AdminProducts });
