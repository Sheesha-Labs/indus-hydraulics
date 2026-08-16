/* eslint-disable */
// System & utility surfaces, plus the mega-menu reference.

function RfqConfirmPage() {
  return <><UtilityBar /><SiteNav active="Products" />
    <div style={{ padding: "72px 48px 80px", display: "flex", justifyContent: "center" }}>
      <div style={{ width: 720 }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <span style={{ width: 44, height: 44, borderRadius: 999, background: "var(--ih-accent-soft)", color: "var(--ih-accent)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <Icn size={22} sw={2} d={<path d="m5 12 5 5L20 7" />} />
          </span>
          <div>
            <h1 className="serif" style={{ fontSize: 40, lineHeight: 1.08 }}>Request received. We're on it.</h1>
            <p className="lede" style={{ marginTop: 12 }}>An acknowledgement is on its way to jane@mehta-eng.in. Keep the reference below if you need to chase it.</p>
          </div>
        </div>
        <div className="ih-card" style={{ padding: 28, marginTop: 32, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div><div className="eyebrow">Your reference</div>
            <div className="mono" style={{ fontSize: 30, letterSpacing: "-0.01em", marginTop: 8 }}>RFQ-4822</div></div>
          <div style={{ textAlign: "right" }}><div className="eyebrow">Expected first reply</div>
            <div style={{ fontSize: 16, fontWeight: 500, marginTop: 8 }}>Today, before 14:00 IST</div></div>
        </div>
        <div className="ih-card" style={{ marginTop: 20 }}>
          <div style={{ padding: "16px 22px", borderBottom: "1px solid var(--ih-border)" }}><h3 style={{ fontSize: 14.5 }}>What you sent</h3></div>
          <table className="ih-table">
            <thead><tr><th>Component</th><th>Qty</th><th>Required by</th></tr></thead>
            <tbody>{PRODUCTS.slice(0, 3).map((p, i) => <tr key={p.sku}>
              <td><div style={{ fontWeight: 500, fontSize: 13 }}>{p.t}</div>
                <div className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted)", marginTop: 3 }}>{p.sku}</div></td>
              <td className="num">{[2, 1, 4][i]}</td>
              <td className="num" style={{ color: "var(--ih-muted)", fontSize: 12.5 }}>{["12 Sep", "ASAP", "30 Sep"][i]}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
          <Btn kind="primary">Track this request</Btn>
          <Btn kind="outline">Back to catalogue</Btn>
          <Btn kind="ghost" icon={I.download}>Download as PDF</Btn>
        </div>
      </div>
    </div>
    <SiteFooter /></>;
}

function NotFoundPage() {
  return <><UtilityBar /><SiteNav active="none" />
    <div style={{ padding: "88px 48px 80px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center", maxWidth: 1200, margin: "0 auto" }}>
      <div>
        <div className="mono" style={{ fontSize: 13, color: "var(--ih-accent)", letterSpacing: ".14em" }}>ERROR 404</div>
        <h1 className="serif" style={{ fontSize: 52, marginTop: 18, lineHeight: 1.05 }}>This port doesn't go anywhere.</h1>
        <p className="lede" style={{ marginTop: 16, maxWidth: 480 }}>
          The page has moved or the part number changed. Search the catalogue, or send us the number and we'll find its current equivalent.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 28, maxWidth: 460 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <span style={{ position: "absolute", left: 13, top: 13, color: "var(--ih-muted)", display: "flex" }}>{I.search}</span>
            <input className="ih-field" style={{ height: 44, paddingLeft: 40 }} placeholder="Part number or description" />
          </div>
          <Btn kind="primary" size="lg">Search</Btn>
        </div>
        <div style={{ display: "flex", gap: 20, marginTop: 26 }}>
          {["Catalogue", "Services", "Contact the desk"].map(t => <a key={t} style={{ fontSize: 13.5, color: "var(--ih-accent)", fontWeight: 500 }}>{t} →</a>)}
        </div>
      </div>
      <Img style={{ aspectRatio: "4/3", borderRadius: 12 }} label="blanked-off port, capped · 900×675" />
    </div>
    <SiteFooter /></>;
}

function MaintenancePage() {
  return <div style={{ minHeight: 760, display: "grid", placeItems: "center", background: "var(--ih-bg)", padding: 48 }}>
    <div style={{ width: 560, textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 26 }}>
        <span className="ih-nav__mark" style={{ width: 44, height: 44, fontSize: 15 }}>IH</span>
      </div>
      <Badge kind="warn" dot>Scheduled maintenance</Badge>
      <h1 className="serif" style={{ fontSize: 38, marginTop: 20, lineHeight: 1.1 }}>We're changing the seals on the website.</h1>
      <p className="lede" style={{ marginTop: 14 }}>
        Back at 03:00 IST, about ninety minutes from now. The parts desk is unaffected — call or email and we'll pick it up as normal.
      </p>
      <div className="ih-card" style={{ padding: 22, marginTop: 30, display: "flex", justifyContent: "space-around" }}>
        {[["Phone", "+971 52 2477942"], ["Email", "desk@indushydraulics.com"], ["WhatsApp", "+91 98200 41120"]].map(([k, v]) =>
          <div key={k}><div className="eyebrow">{k}</div><div className="mono" style={{ fontSize: 13, marginTop: 7 }}>{v}</div></div>)}
      </div>
    </div>
  </div>;
}

function MegaMenuPage() {
  const cols = [["Hydraulic Pumps", ["Gear pumps", "Vane pumps", "Axial piston", "Radial piston", "Hand & foot pumps", "Power packs"]],
    ["Cylinders", ["Tie-rod ISO 6020/2", "Welded / mill type", "Telescopic", "Compact / block", "Custom bore", "Repair kits"]],
    ["Valves & Manifolds", ["Directional (Cetop)", "Cartridge valves", "Pressure control", "Flow control", "Proportional & servo", "Manifold blocks"]],
    ["Hoses & Fittings", ["1SN / 2SN hose", "4SP / 4SH hose", "Thermoplastic", "BSP & JIC fittings", "Quick couplers", "Crimped assemblies"]]];
  return <div style={{ minHeight: 760, background: "var(--ih-bg)" }}>
    <UtilityBar /><SiteNav active="Products" />
    <div style={{ background: "var(--ih-surface)", borderBottom: "1px solid var(--ih-border)", boxShadow: "0 18px 48px rgba(20,28,45,.09)" }}>
      <div style={{ padding: "32px 48px", display: "grid", gridTemplateColumns: "repeat(4,1fr) 300px", gap: 40 }}>
        {cols.map(([h, items]) => <div key={h}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 12, marginBottom: 14, borderBottom: "1px solid var(--ih-border)" }}>
            <span style={{ fontSize: 13.5, fontWeight: 500 }}>{h}</span>
            <span style={{ color: "var(--ih-muted-2)", display: "flex", marginLeft: "auto" }}>{I.chevR}</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map(t => <a key={t} style={{ fontSize: 13, color: "var(--ih-ink-2)" }}>{t}</a>)}
          </div>
        </div>)}
        <div className="ih-card" style={{ overflow: "hidden" }}>
          <Img style={{ aspectRatio: "16/10" }} label="featured: A10VSO line" />
          <div style={{ padding: 16 }}>
            <Badge kind="accent">New this week</Badge>
            <div style={{ fontSize: 14, fontWeight: 500, marginTop: 10, lineHeight: 1.35 }}>Rexroth A10VSO series now stocked to 140cc</div>
            <span style={{ color: "var(--ih-accent)", fontSize: 13, fontWeight: 500, marginTop: 10, display: "inline-flex", gap: 6, alignItems: "center" }}>See the range {I.arrowR}</span>
          </div>
        </div>
      </div>
      <div style={{ borderTop: "1px solid var(--ih-border)", background: "var(--ih-surface-2)", padding: "14px 48px", display: "flex", gap: 26, alignItems: "center" }}>
        <span className="eyebrow">Quick links</span>
        {["Obsolete part lookup", "Cross-reference tool", "Download the catalogue (PDF)", "Bulk parts list upload"].map(t =>
          <a key={t} style={{ fontSize: 12.5, color: "var(--ih-accent)" }}>{t}</a>)}
      </div>
    </div>
    <div style={{ padding: "40px 48px", opacity: .4 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {PRODUCTS.slice(0, 4).map(p => <ProdCard key={p.sku} p={p} compact />)}
      </div>
    </div>
  </div>;
}
Object.assign(window, { RfqConfirmPage, NotFoundPage, MaintenancePage, MegaMenuPage });
