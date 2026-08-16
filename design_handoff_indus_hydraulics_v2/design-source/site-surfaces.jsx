/* eslint-disable */
// Command palette (⌘K), compare tray, category index, brand detail.

function CommandPalettePage() {
  const groups = [
    ["Products", [["A10VSO 71cc Axial Piston Pump", "IH-AP71-D-R-V · Bosch Rexroth", "In stock"],
      ["DSG-01 Solenoid Directional Valve", "IH-DSG-01-3C4-D24 · Yuken", "In stock"],
      ["Tie-Rod Cylinder 80×50×300", "IH-CYL-80-50-300 · Bosch Rexroth", "2–3 wk"]]],
    ["Categories", [["Hydraulic Pumps", "184 SKUs", ""], ["Hoses & Fittings", "540 SKUs", ""]]],
    ["Services", [["BOP 5-year recertification", "NO. 03 · 42 d on bench", ""], ["Mud pump fluid end rebuild", "NO. 02 · 11 d on bench", ""]]],
    ["Pages", [["Cross-reference an obsolete part", "/replacement", ""], ["Request a quote", "/quote", ""]]],
  ];
  return <div style={{ position: "relative", height: "100%" }}>
    <div style={{ filter: "blur(1.5px)", opacity: .5 }}><UtilityBar /><SiteNav active="Products" /><Hero /></div>
    <div style={{ position: "absolute", inset: 0, background: "oklch(0.2 0.02 255 / 0.42)", display: "flex", justifyContent: "center", paddingTop: 96 }}>
      <div className="ih-card ih-shadow-2" style={{ width: 660, height: "fit-content", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", borderBottom: "1px solid var(--ih-border)" }}>
          <span style={{ color: "var(--ih-muted)", display: "flex" }}>{I.search}</span>
          <input className="ih-field" style={{ border: 0, height: 26, padding: 0, fontSize: 16, background: "transparent" }} defaultValue="A10VSO" />
          <span className="mono" style={{ fontSize: 10, letterSpacing: ".06em", color: "var(--ih-muted-2)", border: "1px solid var(--ih-border)", padding: "3px 6px", borderRadius: 4 }}>ESC</span>
        </div>
        <div style={{ maxHeight: 460, overflow: "hidden" }}>
          {groups.map(([g, rows]) => <div key={g}>
            <div className="eyebrow" style={{ padding: "12px 20px 7px" }}>{g}</div>
            {rows.map(([t, s, badge], i) => <div key={t} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 20px",
              background: g === "Products" && i === 0 ? "var(--ih-accent-soft)" : "transparent" }}>
              <Img style={{ width: 30, height: 30, borderRadius: 4, flexShrink: 0 }} label="" />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: g === "Products" && i === 0 ? 500 : 400,
                  color: g === "Products" && i === 0 ? "var(--ih-accent)" : "var(--ih-ink)" }}>{t}</div>
                <div className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted)", marginTop: 2 }}>{s}</div>
              </div>
              {badge && <Badge kind={badge === "In stock" ? "success" : "warn"} dot>{badge}</Badge>}
              {g === "Products" && i === 0 && <span className="mono" style={{ fontSize: 10, color: "var(--ih-accent)" }}>↵</span>}
            </div>)}
          </div>)}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "11px 20px", borderTop: "1px solid var(--ih-border)",
          background: "var(--ih-surface-2)", fontFamily: "var(--ih-font-mono)", fontSize: 10, letterSpacing: ".05em", color: "var(--ih-muted)" }}>
          {[["↑↓", "navigate"], ["↵", "open"], ["⌘↵", "add to quote"], ["ESC", "close"]].map(([k, l]) =>
            <span key={k} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <b style={{ border: "1px solid var(--ih-border-strong)", padding: "2px 5px", borderRadius: 3, color: "var(--ih-ink-2)" }}>{k}</b>{l}</span>)}
          <span style={{ marginLeft: "auto" }}>1,134 SKUs INDEXED</span>
        </div>
      </div>
    </div>
  </div>;
}

function CompareTrayPage() {
  const picks = PRODUCTS.slice(0, 3);
  return <div style={{ position: "relative", height: "100%" }}>
    <CategoryPage />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, background: "var(--ih-navy)", padding: "14px 48px",
      display: "flex", alignItems: "center", gap: 20, boxShadow: "0 -8px 32px rgba(20,28,45,.22)" }}>
      <div>
        <div className="mono" style={{ fontSize: 9.5, letterSpacing: ".12em", color: "var(--ih-steel)" }}>COMPARING</div>
        <div style={{ fontSize: 13, color: "#fff", marginTop: 4 }}>3 of 4 selected</div>
      </div>
      <div style={{ display: "flex", gap: 10, flex: 1 }}>
        {picks.map(p => <div key={p.sku} style={{ display: "flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,.09)",
          borderRadius: 6, padding: "7px 10px 7px 7px", minWidth: 0 }}>
          <Img style={{ width: 30, height: 30, borderRadius: 4, flexShrink: 0 }} label="" />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 11.5, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 150 }}>{p.t}</div>
            <div className="mono" style={{ fontSize: 9.5, color: "oklch(0.72 0.03 250)", marginTop: 1 }}>{p.sku}</div>
          </div>
          <span style={{ color: "oklch(0.75 0.03 250)", display: "flex", marginLeft: 4 }}><Icn size={13} d={<path d="M6 6l12 12M18 6 6 18" />} /></span>
        </div>)}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, border: "1px dashed rgba(255,255,255,.28)",
          borderRadius: 6, padding: "0 16px", color: "oklch(0.72 0.03 250)", fontSize: 11.5 }}>
          {I.plus} Add a fourth
        </div>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <Btn kind="onnavy" size="sm">Clear all</Btn>
        <Btn kind="primary" iconR={I.arrowR}>Compare 3</Btn>
      </div>
    </div>
  </div>;
}

function CategoryIndexPage() {
  const cats = [["Hydraulic Pumps", 184, 9, "gear, vane, piston, radial"], ["Valves & Manifolds", 412, 11, "directional, pressure, flow, proportional"],
    ["Hydraulic Cylinders", 226, 7, "tie-rod, welded, telescopic, custom bore"], ["Hoses & Fittings", 540, 12, "SAE / EN hose, BSP & JIC, crimped assemblies"],
    ["Power Packs", 68, 5, "standard and custom HPUs, 0.75–75 kW"], ["Seals & Accessories", 320, 8, "rod, piston, wiper — NBR / FKM / HNBR"],
    ["Filtration", 148, 6, "suction, return, pressure line, breathers"], ["Accumulators", 96, 4, "bladder, piston, diaphragm"],
    ["Instrumentation", 92, 5, "gauges, transducers, flow meters, switches"], ["Molykote Greases", 33, 1, "multi-purpose, EP, HT/LT, food-grade"],
    ["Oilfield Pressure Control", 214, 6, "hammer unions, plug valves, check valves, flanges"], ["Industrial Hose", 186, 4, "air, water, chemical, food, composite"]];
  return <><UtilityBar /><SiteNav active="Products" />
    <div style={{ padding: "24px 48px 0" }}><Crumb items={["Home", "Categories"]} /></div>
    <div style={{ padding: "20px 48px 40px", borderBottom: "1px solid var(--ih-border)" }}>
      <Eyebrow>Catalogue · 12 categories</Eyebrow>
      <h1 className="serif" style={{ fontSize: 46, marginTop: 16, maxWidth: 820, lineHeight: 1.05 }}>
        Everything we stock, <em>organised the way engineers ask for it</em>.
      </h1>
      <p className="lede" style={{ marginTop: 16, maxWidth: 620 }}>
        1,134 live SKUs across 14 authorised brands. Every listing carries a datasheet; nothing is listed that we can't source.
      </p>
    </div>
    <section className="ih-sec">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
        {cats.map(([n, sku, brands, sub], i) => <a key={n} className="ih-card" style={{ display: "flex", flexDirection: "column" }}>
          <Img style={{ aspectRatio: "16/10" }} label={n.toLowerCase()} />
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
              <h3 style={{ fontSize: 19 }}>{n}</h3>
              <span className="mono" style={{ fontSize: 11.5, color: "var(--ih-muted)" }}>{sku}</span>
            </div>
            <p style={{ fontSize: 12.5, color: "var(--ih-muted)", lineHeight: 1.55, flex: 1 }}>{sub}</p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 13, borderTop: "1px solid var(--ih-border)" }}>
              <span className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted-2)" }}>{brands} {brands === 1 ? "brand" : "brands"}</span>
              <span style={{ color: "var(--ih-accent)", fontSize: 13, fontWeight: 500, display: "inline-flex", gap: 6, alignItems: "center" }}>Browse {I.arrowR}</span>
            </div>
          </div>
        </a>)}
      </div>
    </section>
    <SiteFooter /></>;
}

function BrandDetailPage() {
  return <><UtilityBar /><SiteNav active="Brands" />
    <div style={{ padding: "24px 48px 0" }}><Crumb items={["Home", "Brands", "Bosch Rexroth"]} /></div>
    <div style={{ background: "var(--ih-surface)", borderBottom: "1px solid var(--ih-border)", padding: "24px 48px 44px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 56, alignItems: "center" }}>
        <div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Badge kind="accent">Authorised distributor</Badge>
            <span className="mono" style={{ fontSize: 10.5, letterSpacing: ".1em", color: "var(--ih-muted)" }}>GERMANY · SINCE 2009</span>
          </div>
          <h1 className="serif" style={{ fontSize: 50, marginTop: 18, lineHeight: 1.04 }}>Bosch Rexroth</h1>
          <p className="lede" style={{ marginTop: 16, maxWidth: 580 }}>
            Industrial and mobile hydraulics — the A10VSO and A4VSO pump families, Cetop and NG valve ranges, ISO cylinders and
            proportional controls. Our deepest stockholding, and the line our engineering desk knows best.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
            <Btn kind="primary" iconR={I.arrowR}>Browse 214 SKUs</Btn>
            <Btn kind="outline" icon={I.download}>Brand catalogue (PDF)</Btn>
          </div>
        </div>
        <Img plain style={{ aspectRatio: "16/9", borderRadius: 12 }} label="Bosch Rexroth wordmark · supplied by brand" />
      </div>
      <div style={{ marginTop: 40, maxWidth: 900 }}>
        <StatRow items={[["214", "SKUs stocked"], ["17", "Yrs authorised"], ["24h", "Ex-stock dispatch"], ["12 mo", "Warranty"]]} />
      </div>
    </div>
    <section className="ih-sec">
      <SecHead eyebrow="What we hold" title="Range by category" />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--ih-border)", border: "1px solid var(--ih-border)", borderRadius: 10, overflow: "hidden" }}>
        {[["Axial piston pumps", 62, "A10VSO · A4VSO · A11VO"], ["Directional valves", 58, "4WE · 4WRE · Cetop 3–10"],
          ["ISO cylinders", 46, "CD / CG series, ISO 6020/6022"], ["Gear pumps", 48, "PGH · AZPF · SILENCE"]].map(([n, c, sub]) =>
          <a key={n} style={{ background: "var(--ih-surface)", padding: "24px 22px" }}>
            <div className="mono" style={{ fontSize: 22, letterSpacing: "-0.02em", color: "var(--ih-accent)" }}>{c}</div>
            <div style={{ fontSize: 14.5, fontWeight: 500, marginTop: 10 }}>{n}</div>
            <div className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted)", marginTop: 6 }}>{sub}</div>
          </a>)}
      </div>
    </section>
    <section className="ih-sec" style={{ paddingTop: 0 }}>
      <SecHead eyebrow="In stock now" title="Bosch Rexroth lines we hold"
        action={<Btn kind="outline" iconR={I.arrowR}>All 214 SKUs</Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {PRODUCTS.slice(0, 8).map(p => <ProdCard key={p.sku} p={p} compact />)}
      </div>
    </section>
    <section className="ih-sec" style={{ paddingTop: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div className="ih-card" style={{ padding: 26 }}>
          <Eyebrow>Documentation</Eyebrow>
          <h3 style={{ fontSize: 19, marginTop: 12 }}>Datasheets and drawings, on file</h3>
          <div style={{ marginTop: 16 }}>
            {[["RE 92711 · A10VSO series 32", "2.4 MB"], ["RE 23178 · 4WE 6 directional valve", "1.1 MB"],
              ["RE 17325 · PGH gear pump", "890 KB"], ["Cylinder interchange guide 2026", "3.8 MB"]].map(([n, s], i, arr) =>
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < arr.length - 1 ? "1px solid var(--ih-border)" : 0 }}>
                <span style={{ color: "var(--ih-steel)", display: "flex" }}>{I.doc}</span>
                <span style={{ flex: 1, fontSize: 13 }}>{n}</span>
                <span className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted-2)" }}>{s}</span>
              </div>)}
          </div>
        </div>
        <div className="ih-card" style={{ padding: 26, background: "var(--ih-steel-soft)", borderColor: "oklch(0.88 0.03 240)" }}>
          <Eyebrow>Obsolete Rexroth code?</Eyebrow>
          <h3 className="serif" style={{ fontSize: 25, marginTop: 12, lineHeight: 1.25 }}>
            Series 30 and 31 pumps are long gone. We know what replaces them.
          </h3>
          <p style={{ fontSize: 13.5, color: "var(--ih-ink-2)", marginTop: 12, lineHeight: 1.65 }}>
            Rexroth has revised most families at least twice since 2010. Our interchange list documents the current equivalent for
            every superseded code we've been asked about.
          </p>
          <Btn kind="primary" style={{ marginTop: 18 }} iconR={I.arrowR}>Cross-reference a part</Btn>
        </div>
      </div>
    </section>
    <SiteFooter /></>;
}
Object.assign(window, { CommandPalettePage, CompareTrayPage, CategoryIndexPage, BrandDetailPage });
