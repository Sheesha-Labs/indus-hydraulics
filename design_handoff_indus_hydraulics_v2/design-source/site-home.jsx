/* eslint-disable */
// Home — full assembly.

function Hero() {
  return <section style={{ padding: "72px 48px 64px", background: "var(--ih-surface)", borderBottom: "1px solid var(--ih-border)" }}>
    <div style={{ display: "grid", gridTemplateColumns: "1.05fr 1fr", gap: 64, alignItems: "center" }}>
      <div>
        <Eyebrow>Est. 2003 — Mumbai · Houston · Dubai</Eyebrow>
        <h1 className="serif" style={{ fontSize: 60, marginTop: 20, lineHeight: 1.02 }}>
          Full range of <em>Oilfield Equipments</em>.
        </h1>
        <p className="lede" style={{ marginTop: 22, maxWidth: 540 }}>
          1,800+ SKUs across pumps, cylinders, valves and consumables — from 14 specialist brands.
          ISO-certified, datasheet-backed, ready to ship to 47 countries.
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 30 }}>
          <Btn kind="primary" size="lg" iconR={I.arrowR}>Browse the catalogue</Btn>
          <Btn kind="outline" size="lg" icon={I.doc}>Send a parts list</Btn>
        </div>
        <div style={{ display: "flex", gap: 32, marginTop: 40, paddingTop: 26, borderTop: "1px solid var(--ih-border)" }}>
          {[["1,870", "SKUs live"], ["14", "Brands"], ["47", "Countries"], ["3.4h", "Avg. RFQ reply"]].map(([v, l]) =>
            <div key={l}><div className="mono" style={{ fontSize: 22, letterSpacing: "-0.02em" }}>{v}</div>
              <div className="eyebrow" style={{ marginTop: 5 }}>{l}</div></div>)}
        </div>
      </div>
      <div style={{ position: "relative" }}>
        <Img style={{ aspectRatio: "4/3.4", borderRadius: 12 }} label="hero — hydraulic pump line-up, workshop bench · 1100×800" />
        <div style={{ position: "absolute", left: 20, bottom: 20, right: 20, background: "var(--ih-surface)", border: "1px solid var(--ih-border)", borderRadius: 8, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }} className="ih-shadow-1">
          <div><div className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted)", letterSpacing: ".06em" }}>IH-AP71-D-R-V</div>
            <div style={{ fontSize: 13, fontWeight: 500, marginTop: 3 }}>Axial Piston Pump A10VSO 71cc</div></div>
          <Badge kind="success" dot>In stock</Badge>
        </div>
      </div>
    </div>
  </section>;
}

function UspStrip() {
  const items = [
    ["01", "Datasheet on every SKU", "Specs, curves and dimensional drawings — not a photo and a phone number."],
    ["02", "Quote in under four hours", "A hydraulics engineer reads every RFQ. Average reply 3.4 hours."],
    ["03", "Stocked, not drop-shipped", "1,870 lines held in Mumbai and Dubai bonded warehouses."],
    ["04", "Rebuild instead of replace", "In-house workshop returns failed units to OEM spec."],
  ];
  return <section style={{ background: "var(--ih-navy)", padding: "34px 48px" }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 36 }}>
      {items.map(([n, h, p]) => <div key={n} style={{ display: "flex", gap: 14 }}>
        <span className="mono" style={{ fontSize: 11, color: "var(--ih-steel)", paddingTop: 3 }}>/{n}</span>
        <div><div style={{ color: "#fff", fontSize: 14, fontWeight: 500 }}>{h}</div>
          <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "oklch(0.75 0.02 250)", marginTop: 5 }}>{p}</p></div>
      </div>)}
    </div>
  </section>;
}

function CategoryGrid() {
  const [f, ...rest] = CATS;
  return <section className="ih-sec">
    <SecHead eyebrow="Shop by category · 06 groups" serif title="The full catalogue, organised the way engineers think."
      action={<Btn kind="outline" iconR={I.arrowR}>Browse all categories</Btn>} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }}>
      <a className="ih-card" style={{ gridColumn: "span 2", display: "flex" }}>
        <Img style={{ flex: 1, minHeight: 330 }} label="hydraulic pump line-up · 1100×800" />
        <div style={{ flex: 1, padding: 32, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 }}>
          <Eyebrow>Featured category</Eyebrow>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <h3 style={{ fontSize: 26 }}>{f.n}</h3><span className="mono" style={{ fontSize: 12, color: "var(--ih-muted)" }}>{f.c} SKUs</span>
          </div>
          <p style={{ fontSize: 14, color: "var(--ih-muted)", lineHeight: 1.55 }}>{f.d} From 0.5 cc/rev mini units up to 1000 bar high-pressure systems.</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
            {["Gear · 42", "Vane · 28", "Piston · 56", "Hand & Foot · 18", "Power Packs · 40"].map(t =>
              <span key={t} className="mono" style={{ fontSize: 11, border: "1px solid var(--ih-border)", padding: "4px 8px", borderRadius: 4, color: "var(--ih-muted)" }}>{t}</span>)}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 16, borderTop: "1px solid var(--ih-border)" }}>
            <span style={{ color: "var(--ih-accent)", fontWeight: 500, fontSize: 13.5, display: "inline-flex", gap: 6, alignItems: "center" }}>Explore Pumps {I.arrowR}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ih-muted-2)" }}>{f.id}</span>
          </div>
        </div>
      </a>
      {rest.map(c => <a key={c.id} className="ih-card" style={{ display: "flex", flexDirection: "column" }}>
        <Img style={{ aspectRatio: "16/10" }} label={c.n.toLowerCase()} />
        <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 9, flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 }}>
            <h3 style={{ fontSize: 19 }}>{c.n}</h3><span className="mono" style={{ fontSize: 11.5, color: "var(--ih-muted)" }}>{c.c}</span>
          </div>
          <p style={{ fontSize: 13, color: "var(--ih-muted)", lineHeight: 1.5, flex: 1 }}>{c.d}</p>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 13, borderTop: "1px solid var(--ih-border)" }}>
            <span style={{ color: "var(--ih-accent)", fontWeight: 500, fontSize: 13, display: "inline-flex", gap: 6, alignItems: "center" }}>Explore {I.arrowR}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ih-muted-2)" }}>{c.id}</span>
          </div>
        </div>
      </a>)}
    </div>
  </section>;
}

function BrandRail() {
  return <section className="ih-sec" style={{ paddingTop: 0 }}>
    <SecHead eyebrow="Partner brands · 14" title="Authorised distributor for the names engineers trust."
      action={<Btn kind="ghost" iconR={I.arrowR}>View brand index</Btn>} />
    <div className="ih-card" style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)" }}>
      {BRANDS.map(([n, cty, blurb], i) => <a key={n} style={{ padding: "20px 18px", borderRight: (i % 6 !== 5) ? "1px solid var(--ih-border)" : 0, borderBottom: i < 6 ? "1px solid var(--ih-border)" : 0 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
          <b style={{ fontSize: 14.5, fontWeight: 500, letterSpacing: "-0.015em" }}>{n}</b>
          <span className="mono" style={{ fontSize: 9.5, color: "var(--ih-muted-2)", letterSpacing: ".1em" }}>{cty}</span>
        </div>
        <div style={{ fontSize: 12, color: "var(--ih-muted)", marginTop: 5, lineHeight: 1.4 }}>{blurb}</div>
      </a>)}
    </div>
  </section>;
}

function FeaturedProducts() {
  return <section className="ih-sec" style={{ paddingTop: 0 }}>
    <SecHead eyebrow="Featured · updated weekly" title="New & in stock this week."
      action={<div style={{ display: "flex", gap: 6 }}>{["All", "New arrivals", "Best sellers", "Clearance"].map((t, i) =>
        <Chip key={t} on={i === 0}>{t}</Chip>)}</div>} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
      {PRODUCTS.slice(0, 4).map(p => <ProdCard key={p.sku} p={p} />)}
    </div>
  </section>;
}

function Industries() {
  const items = [["Marine & offshore", "Deck machinery, steering gear, hatch covers"], ["Steel & metals", "Rolling mills, coilers, hydraulic presses"],
    ["Construction plant", "Excavator circuits, boom cylinders, travel motors"], ["Oil & gas", "Wellsite pumps, BOP circuits, sour-gas service"],
    ["Sugar & cement", "Cane carriers, kiln drives, crusher circuits"], ["Machine tools", "Press brakes, injection moulding, clamping"]];
  return <section className="ih-sec" style={{ paddingTop: 0 }}>
    <SecHead eyebrow="Industries served" title="Built for the world's most demanding workshops." />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 1, background: "var(--ih-border)", border: "1px solid var(--ih-border)", borderRadius: 10, overflow: "hidden" }}>
      {items.map(([n, d]) => <a key={n} style={{ background: "var(--ih-surface)", padding: "24px 22px", display: "flex", flexDirection: "column", gap: 7 }}>
        <span style={{ color: "var(--ih-steel)", display: "flex" }}>{I.gauge}</span>
        <div style={{ fontSize: 15, fontWeight: 500, marginTop: 4 }}>{n}</div>
        <div style={{ fontSize: 12.5, color: "var(--ih-muted)", lineHeight: 1.5 }}>{d}</div>
      </a>)}
    </div>
  </section>;
}

function WhyIndus() {
  const items = [["01", "Specialists, not generalists", "We carry only hydraulic components — no PPE, no fasteners. Depth over breadth."],
    ["02", "An engineering desk, not a call centre", "Every RFQ is read by someone who has stripped the unit you're asking about."],
    ["03", "Cross-referenced to OEM", "Obsolete part numbers matched to current equivalents, with the interchange documented."],
    ["04", "Rebuild capability in-house", "Failed units come back to spec with a test certificate, at a fraction of replacement."]];
  return <section className="ih-sec" style={{ paddingTop: 0 }}>
    <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 56, alignItems: "start" }}>
      <div>
        <Eyebrow>Why Indus · a few reasons</Eyebrow>
        <h2 className="serif" style={{ fontSize: 36, marginTop: 16, maxWidth: 480 }}>We're a parts supplier that thinks like an <em>engineering desk</em>.</h2>
        <div style={{ marginTop: 32, display: "flex", flexDirection: "column" }}>
          {items.map(([n, h, p]) => <div key={n} style={{ display: "flex", gap: 18, padding: "20px 0", borderTop: "1px solid var(--ih-border)" }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--ih-accent)", paddingTop: 3 }}>/{n}</span>
            <div><div style={{ fontSize: 15, fontWeight: 500 }}>{h}</div>
              <p style={{ fontSize: 13.5, color: "var(--ih-muted)", marginTop: 5, lineHeight: 1.55 }}>{p}</p></div>
          </div>)}
        </div>
      </div>
      <div style={{ position: "relative", borderRadius: 12, overflow: "hidden", minHeight: 520 }}>
        <Img navy style={{ position: "absolute", inset: 0 }} label="engineer at workbench · 720×800" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, oklch(0.24 0.05 252 / 0.94) 30%, transparent 75%)" }} />
        <div style={{ position: "absolute", left: 32, right: 32, bottom: 32 }}>
          <Eyebrow style={{ color: "var(--ih-steel)" }}>Customer · marine</Eyebrow>
          <p className="serif" style={{ fontSize: 25, color: "#fff", marginTop: 14, lineHeight: 1.3 }}>
            "Indus delivered a 6-week-lead Atos servo valve in 4 days. We didn't lose a single shift."
          </p>
          <div className="mono" style={{ fontSize: 11, color: "oklch(0.72 0.03 250)", marginTop: 16, letterSpacing: ".06em" }}>CHIEF ENGINEER · FLEET OPERATOR, MUMBAI PORT</div>
        </div>
      </div>
    </div>
  </section>;
}

function InsightsRow() {
  const posts = [["Sizing guide", "How to size an accumulator without guessing at pre-charge", "9 min"],
    ["Teardown", "Why your A10VSO is losing pressure at temperature", "12 min"],
    ["Field note", "Cetop interchange: reading a valve you've never seen before", "6 min"]];
  return <section className="ih-sec" style={{ paddingTop: 0 }}>
    <SecHead eyebrow="From the workshop · insights" title="Field notes, sizing guides and component teardowns."
      action={<Btn kind="outline" iconR={I.arrowR}>Read all insights</Btn>} />
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
      {posts.map(([k, t, r]) => <a key={t}>
        <Img style={{ aspectRatio: "16/10", borderRadius: 8 }} label={k.toLowerCase()} />
        <div style={{ paddingTop: 14 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Badge kind="steel">{k}</Badge>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted-2)" }}>{r} read</span></div>
          <h3 style={{ fontSize: 18, marginTop: 11, lineHeight: 1.3 }}>{t}</h3>
        </div>
      </a>)}
    </div>
  </section>;
}

function CtaBand() {
  return <section style={{ padding: "0 48px 72px" }}>
    <div style={{ background: "var(--ih-accent)", borderRadius: 14, padding: "44px 48px", display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 56, alignItems: "center" }}>
      <div>
        <Eyebrow style={{ color: "rgba(255,255,255,.75)" }}>Newsletter · 2× a month</Eyebrow>
        <h2 className="serif" style={{ fontSize: 32, color: "#fff", marginTop: 14, lineHeight: 1.15 }}>Catalogue drops, sizing notes and stock alerts — straight to your inbox.</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,.82)", marginTop: 12, maxWidth: 480 }}>4,200+ engineers, plant managers and procurement leads read it. No marketing fluff, no spam.</p>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input className="ih-field" style={{ height: 48, flex: 1, border: "1px solid rgba(255,255,255,.35)", background: "rgba(255,255,255,.12)", color: "#fff" }} placeholder="you@company.com" />
        <Btn size="lg" style={{ background: "#fff", color: "var(--ih-accent)" }}>Subscribe</Btn>
      </div>
    </div>
  </section>;
}

function HomePage() {
  return <><UtilityBar /><SiteNav active="Products" /><Hero /><UspStrip /><CategoryGrid /><BrandRail />
    <FeaturedProducts /><Industries /><WhyIndus /><InsightsRow /><CtaBand /><SiteFooter /></>;
}
Object.assign(window, { HomePage, Hero, UspStrip, CategoryGrid, BrandRail, FeaturedProducts, Industries, WhyIndus, InsightsRow, CtaBand });
