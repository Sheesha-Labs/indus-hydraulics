/* eslint-disable */
// Catalogue surfaces — PLP, search, compare, brands.

function FilterRail() {
  const groups = [
    ["Availability", [["In stock", 812, true], ["2–3 week lead", 430], ["Made to order", 188]]],
    ["Brand", [["Bosch Rexroth", 214], ["Yuken", 186, true], ["Atos", 142], ["Parker", 131], ["Eaton Vickers", 98]]],
    ["Working pressure", [["≤ 160 bar", 210], ["161–250 bar", 336], ["251–350 bar", 402], ["> 350 bar", 96]]],
    ["Mounting", [["SAE 2-bolt", 148], ["SAE 4-bolt", 122], ["ISO 3019-1", 86], ["Cetop 3 / NG6", 240]]],
  ];
  return <aside style={{ width: 248, flexShrink: 0, display: "flex", flexDirection: "column", gap: 26 }}>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span className="eyebrow">Refine · 2 active</span><a style={{ fontSize: 12, color: "var(--ih-accent)" }}>Clear</a>
    </div>
    {groups.map(([g, rows]) => <div key={g}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 10, marginBottom: 12, borderBottom: "1px solid var(--ih-border)" }}>
        <span style={{ fontSize: 12.5, fontWeight: 500 }}>{g}</span><span style={{ color: "var(--ih-muted-2)", display: "flex" }}>{I.chevD}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
        {rows.map(([n, c, on]) => <label key={n} style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 13, color: on ? "var(--ih-ink)" : "var(--ih-ink-2)" }}>
          <span className={`ih-check ${on ? "is-on" : ""}`}>{on && <Icn size={11} sw={2.6} d={<path d="m5 12 5 5L20 7" />} />}</span>
          <span style={{ flex: 1 }}>{n}</span><span className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted-2)" }}>{c}</span>
        </label>)}
      </div>
    </div>)}
    <div className="ih-card" style={{ padding: 16, background: "var(--ih-accent-soft)", border: "1px solid oklch(0.88 0.04 248)" }}>
      <div style={{ fontSize: 13, fontWeight: 500, color: "oklch(0.35 0.09 248)" }}>Can't find the part?</div>
      <p style={{ fontSize: 12.5, color: "oklch(0.42 0.07 248)", marginTop: 6, lineHeight: 1.5 }}>Send a photo of the nameplate. We cross-reference obsolete numbers daily.</p>
      <Btn kind="primary" size="sm" style={{ marginTop: 12, width: "100%" }}>Upload nameplate</Btn>
    </div>
  </aside>;
}

function CategoryPage() {
  const list = [...PRODUCTS, ...PRODUCTS.slice(0, 4)];
  return <><UtilityBar /><SiteNav active="Products" />
    <div style={{ padding: "20px 48px 0" }}><Crumb items={["Catalogue", "Hydraulic Pumps", "Piston pumps"]} /></div>
    <div style={{ padding: "20px 48px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 40, borderBottom: "1px solid var(--ih-border)" }}>
      <div>
        <h1 className="serif" style={{ fontSize: 40 }}>Hydraulic Pumps</h1>
        <p style={{ fontSize: 14, color: "var(--ih-muted)", marginTop: 10, maxWidth: 620, lineHeight: 1.55 }}>
          Gear, vane, piston and radial pumps — fixed and variable displacement, from 0.5 cc/rev mini units up to 1000 bar high-pressure systems. Every listing carries a datasheet and a performance curve.
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <Btn kind="outline" icon={I.compare}>Compare (2)</Btn><Btn kind="primary" icon={I.doc}>Quote this list</Btn>
      </div>
    </div>
    <div style={{ padding: "24px 48px 64px", display: "flex", gap: 36, alignItems: "flex-start" }}>
      <FilterRail />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span className="mono" style={{ fontSize: 12, color: "var(--ih-muted)" }}>184 results</span>
          <Chip on>Yuken <span style={{ opacity: .7, display: "flex" }}>{I.cross}</span></Chip>
          <Chip on>In stock <span style={{ opacity: .7, display: "flex" }}>{I.cross}</span></Chip>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            <select className="ih-field" style={{ width: 190, height: 34 }}><option>Sort · Relevance</option></select>
            <div style={{ display: "flex", border: "1px solid var(--ih-border)", borderRadius: 6, overflow: "hidden" }}>
              <span style={{ padding: "8px 10px", background: "var(--ih-accent)", color: "#fff", display: "flex" }}>{I.grid}</span>
              <span style={{ padding: "8px 10px", color: "var(--ih-muted)", display: "flex" }}>{I.list}</span>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {list.map((p, i) => <ProdCard key={i} p={p} />)}
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 6, marginTop: 36 }}>
          {["1", "2", "3", "…", "12"].map((n, i) => <span key={i} style={{ minWidth: 34, height: 34, display: "grid", placeItems: "center", borderRadius: 6, fontSize: 13, border: "1px solid " + (i === 0 ? "var(--ih-accent)" : "var(--ih-border)"), background: i === 0 ? "var(--ih-accent)" : "var(--ih-surface)", color: i === 0 ? "#fff" : "var(--ih-ink-2)" }}>{n}</span>)}
          <Btn kind="outline" size="sm" iconR={I.chevR} style={{ marginLeft: 6 }}>Next</Btn>
        </div>
      </div>
    </div>
    <SiteFooter /></>;
}

function SearchPage() {
  return <><UtilityBar /><SiteNav active="Products" />
    <div style={{ background: "var(--ih-surface)", borderBottom: "1px solid var(--ih-border)", padding: "36px 48px" }}>
      <div style={{ maxWidth: 780 }}>
        <Eyebrow>Catalogue search</Eyebrow>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: 15, color: "var(--ih-muted)", display: "flex" }}>{I.search}</span>
            <input className="ih-field" style={{ height: 48, paddingLeft: 42, fontSize: 15 }} defaultValue="A10VSO 71" />
          </div>
          <Btn kind="primary" size="lg">Search</Btn>
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
          <span className="eyebrow">Try</span>
          {["DSG-01-3C4", "Cetop 3 solenoid", "SB330 bladder", "2SN 3/4 BSP"].map(t => <Chip key={t} ghost>{t}</Chip>)}
        </div>
      </div>
    </div>
    <div style={{ padding: "28px 48px 64px" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 20 }}>
        <h2 style={{ fontSize: 20 }}>32 results for <span className="mono" style={{ fontSize: 18, color: "var(--ih-accent)" }}>"A10VSO 71"</span></h2>
        <span style={{ fontSize: 12.5, color: "var(--ih-muted)" }}>· including 6 cross-referenced equivalents</span>
      </div>
      <div className="ih-note" style={{ marginBottom: 24, display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ display: "flex" }}>{I.shield}</span>
        <span><b>A10VSO 71 DFR/31R-PPA12N00</b> is an obsolete Rexroth code. The current equivalent is <b>A10VSO 71 DFR1/32R-VPB12N00</b> — dimensionally identical, revised control.</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {PRODUCTS.slice(0, 5).map((p, i) => <a key={i} className="ih-card" style={{ display: "flex", alignItems: "stretch" }}>
          <Img style={{ width: 160, flexShrink: 0 }} label={p.img} />
          <div style={{ padding: "18px 22px", flex: 1, display: "flex", flexDirection: "column", gap: 7, minWidth: 0 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span className="mono" style={{ fontSize: 11, color: "var(--ih-muted)" }}>{p.sku}</span>
              {i === 0 && <Badge kind="accent">Exact match</Badge>}
              {i > 2 && <Badge kind="steel">Cross-reference</Badge>}
            </div>
            <div style={{ fontSize: 16, fontWeight: 500 }}>{p.t}</div>
            <div style={{ display: "flex", gap: 16, fontFamily: "var(--ih-font-mono)", fontSize: 11.5, color: "var(--ih-muted)" }}>
              <span style={{ color: "var(--ih-ink-2)" }}>{p.b}</span>{p.m.map(m => <span key={m}>{m}</span>)}
            </div>
          </div>
          <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", borderLeft: "1px solid var(--ih-border)", flexShrink: 0 }}>
            <Badge kind={i % 3 === 1 ? "warn" : "success"} dot>{i % 3 === 1 ? "2–3 wk lead" : "In stock"}</Badge>
            <Btn kind="outline" size="sm">Add to quote</Btn>
          </div>
        </a>)}
      </div>
    </div>
    <SiteFooter /></>;
}

function ComparePage() {
  const cols = PRODUCTS.slice(0, 4);
  const rows = [["Brand", ["Bosch Rexroth", "Yuken", "Atos", "Hydac"]], ["Type", ["Axial piston, variable", "Solenoid directional", "Tie-rod cylinder", "Bladder accumulator"]],
    ["Working pressure", ["350 bar", "315 bar", "210 bar", "330 bar"]], ["Displacement / size", ["71 cc/rev", "NG6 · Cetop 3", "Ø80 × 300 mm", "10 L"]],
    ["Port / interface", ["SAE-C 4-bolt", "ISO 4401-03", "1/2\" BSP", "1¼\" SAE"]], ["Seal material", ["FKM", "NBR", "NBR / PU", "NBR"]],
    ["Fluid temp range", ["−20 to +90 °C", "−30 to +70 °C", "−20 to +80 °C", "−10 to +80 °C"]], ["Certification", ["ISO 4413", "CE · RoHS", "ISO 6020/2", "PED 2014/68/EU"]],
    ["Availability", ["In stock", "In stock", "2–3 wk lead", "In stock"]], ["Datasheet", ["RE 92711", "DSG-01 rev.G", "CK series", "SB330 rev.4"]]];
  return <><UtilityBar /><SiteNav active="Products" />
    <div style={{ padding: "22px 48px 0" }}><Crumb items={["Catalogue", "Compare"]} /></div>
    <div style={{ padding: "16px 48px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <div><h1 className="serif" style={{ fontSize: 36 }}>Compare 4 components</h1>
        <p style={{ fontSize: 13.5, color: "var(--ih-muted)", marginTop: 8 }}>Differences are highlighted. Rows that match across all four are dimmed.</p></div>
      <div style={{ display: "flex", gap: 8 }}><Btn kind="outline" icon={I.download}>Export as PDF</Btn><Btn kind="primary" icon={I.doc}>Quote all four</Btn></div>
    </div>
    <div style={{ padding: "0 48px 64px" }}>
      <div className="ih-card">
        <div style={{ display: "grid", gridTemplateColumns: "200px repeat(4, 1fr)" }}>
          <div style={{ borderRight: "1px solid var(--ih-border)", borderBottom: "1px solid var(--ih-border)" }} />
          {cols.map((p, i) => <div key={i} style={{ padding: 18, borderRight: i < 3 ? "1px solid var(--ih-border)" : 0, borderBottom: "1px solid var(--ih-border)" }}>
            <Img style={{ aspectRatio: "4/3", borderRadius: 6, marginBottom: 12 }} label={p.img} />
            <div className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted)" }}>{p.sku}</div>
            <div style={{ fontSize: 13.5, fontWeight: 500, marginTop: 5, lineHeight: 1.35 }}>{p.t}</div>
            <Btn kind="outline" size="sm" style={{ marginTop: 12, width: "100%" }}>Remove</Btn>
          </div>)}
          {rows.map(([k, vals], ri) => <React.Fragment key={k}>
            <div style={{ padding: "13px 18px", borderRight: "1px solid var(--ih-border)", borderBottom: ri < rows.length - 1 ? "1px solid var(--ih-border)" : 0, fontSize: 12.5, color: "var(--ih-muted)", background: "var(--ih-surface-2)" }}>{k}</div>
            {vals.map((v, ci) => <div key={ci} className="mono" style={{ padding: "13px 18px", fontSize: 12, borderRight: ci < 3 ? "1px solid var(--ih-border)" : 0, borderBottom: ri < rows.length - 1 ? "1px solid var(--ih-border)" : 0, color: k === "Availability" ? (v === "In stock" ? "var(--ih-success)" : "oklch(0.5 0.1 62)") : "var(--ih-ink)" }}>{v}</div>)}
          </React.Fragment>)}
        </div>
      </div>
    </div>
    <SiteFooter /></>;
}

function BrandsPage() {
  return <><UtilityBar /><SiteNav active="Brands" />
    <div style={{ background: "var(--ih-surface)", borderBottom: "1px solid var(--ih-border)", padding: "56px 48px" }}>
      <Eyebrow>Partner brands · 14 authorised lines</Eyebrow>
      <h1 className="serif" style={{ fontSize: 46, marginTop: 16, maxWidth: 720 }}>We stock the brands that <em>hold their tolerance</em>.</h1>
      <p className="lede" style={{ marginTop: 16, maxWidth: 620 }}>Authorised distribution means genuine parts, warranty that survives a claim, and access to factory engineering when a spec is borderline.</p>
    </div>
    <div className="ih-sec">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
        {BRANDS.map(([n, cty, blurb], i) => <a key={n} className="ih-card" style={{ padding: 22, display: "flex", flexDirection: "column", gap: 12 }}>
          <Img plain style={{ height: 56, borderRadius: 6 }} label={`${n} wordmark`} />
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <h3 style={{ fontSize: 18 }}>{n}</h3><span className="mono" style={{ fontSize: 10, color: "var(--ih-muted-2)", letterSpacing: ".1em" }}>{cty}</span>
            <Badge kind="accent" style={{ marginLeft: "auto" }}>Authorised</Badge>
          </div>
          <p style={{ fontSize: 13, color: "var(--ih-muted)", lineHeight: 1.5 }}>{blurb}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 13, borderTop: "1px solid var(--ih-border)", marginTop: "auto" }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--ih-muted)" }}>{[214, 186, 142, 131, 98, 88, 76, 64, 58, 44, 38, 32][i]} SKUs</span>
            <span style={{ color: "var(--ih-accent)", fontSize: 13, fontWeight: 500, display: "inline-flex", gap: 6, alignItems: "center" }}>View range {I.arrowR}</span>
          </div>
        </a>)}
      </div>
    </div>
    <SiteFooter /></>;
}
Object.assign(window, { CategoryPage, SearchPage, ComparePage, BrandsPage, FilterRail });
