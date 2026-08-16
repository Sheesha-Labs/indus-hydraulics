/* eslint-disable */
// Indus Hydraulics v2 — shared UI atoms. All exported to window at the bottom.

const Icn = ({ d, size = 16, fill = "none", stroke = "currentColor", sw = 1.6, style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke}
       strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, ...style }}>{d}</svg>
);
const I = {
  search:   <Icn d={<><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></>} />,
  filter:   <Icn d={<path d="M4 6h16M7 12h10M10 18h4"/>} />,
  grid:     <Icn d={<><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></>} />,
  list:     <Icn d={<><path d="M8 6h13M8 12h13M8 18h13"/><circle cx="4" cy="6" r="1"/><circle cx="4" cy="12" r="1"/><circle cx="4" cy="18" r="1"/></>} />,
  arrowR:   <Icn d={<path d="M5 12h14M13 6l6 6-6 6"/>} />,
  chevR:    <Icn d={<path d="m9 6 6 6-6 6"/>} />,
  chevD:    <Icn d={<path d="m6 9 6 6 6-6"/>} />,
  plus:     <Icn d={<path d="M12 5v14M5 12h14"/>} />,
  minus:    <Icn d={<path d="M5 12h14"/>} />,
  cross:    <Icn d={<path d="M6 6l12 12M18 6 6 18"/>} />,
  check:    <Icn d={<path d="m5 12 5 5L20 7"/>} />,
  dotsV:    <Icn d={<><circle cx="12" cy="5" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="12" cy="19" r="1.2"/></>} />,
  user:     <Icn d={<><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></>} />,
  bell:     <Icn d={<><path d="M6 9a6 6 0 0 1 12 0v4l2 4H4l2-4z"/><path d="M9 21a3 3 0 0 0 6 0"/></>} />,
  mail:     <Icn d={<><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3 7 9 6 9-6"/></>} />,
  phone:    <Icn d={<path d="M5 4h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 6a2 2 0 0 1 2-2Z"/>} />,
  pin:      <Icn d={<><path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/></>} />,
  doc:      <Icn d={<><path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/></>} />,
  download: <Icn d={<><path d="M12 4v12M6 10l6 6 6-6"/><path d="M4 20h16"/></>} />,
  upload:   <Icn d={<><path d="M12 16V4M6 10l6-6 6 6"/><path d="M4 20h16"/></>} />,
  cart:     <Icn d={<><path d="M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.2a2 2 0 0 0 2-1.55L20 8H6"/><circle cx="10" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/></>} />,
  bookmark: <Icn d={<path d="M6 3h12v18l-6-4.5L6 21z"/>} />,
  compare:  <Icn d={<><path d="M12 3v18"/><path d="M4 8h5M4 8l2.5-2.5M4 8l2.5 2.5"/><path d="M20 16h-5M20 16l-2.5-2.5M20 16l-2.5 2.5"/></>} />,
  truck:    <Icn d={<><path d="M3 6h11v10H3zM14 9h4l3 3v4h-7z"/><circle cx="7" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></>} />,
  shield:   <Icn d={<><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="m9 12 2 2 4-4"/></>} />,
  gauge:    <Icn d={<><path d="M4 18a8 8 0 1 1 16 0"/><path d="m12 18 4-6"/><circle cx="12" cy="18" r="1.3"/></>} />,
  wrench:   <Icn d={<path d="M15 3a5 5 0 0 0-4.6 7L3 17.4 6.6 21l7.4-7.4A5 5 0 0 0 21 9l-3 3-3-3 3-3a5 5 0 0 0-3-3Z"/>} />,
  layers:   <Icn d={<><path d="m12 4 9 4-9 4-9-4 9-4Z"/><path d="m3 12 9 4 9-4M3 16l9 4 9-4"/></>} />,
  chart:    <Icn d={<><path d="M4 20V4M4 20h16"/><path d="M8 16v-4M12 16V8M16 16v-2"/></>} />,
  box:      <Icn d={<><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/></>} />,
  tag:      <Icn d={<><path d="M3 12V3h9l9 9-9 9-9-9Z"/><circle cx="8" cy="8" r="1.5"/></>} />,
  settings: <Icn d={<><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4.8a7 7 0 0 0-2.1-1.2L14 3h-4l-.4 2.4a7 7 0 0 0-2 1.2L5 5.8 3 9.2l2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-.8a7 7 0 0 0 2.1 1.2L10 21h4l.4-2.4a7 7 0 0 0 2-1.2l2.4.8 2-3.4-2-1.6c.1-.4.2-.8.2-1.2Z"/></>} />,
  image:    <Icn d={<><rect x="3" y="4" width="18" height="16" rx="1"/><circle cx="9" cy="10" r="2"/><path d="m4 19 5-5 4 3 3-3 4 4"/></>} />,
  globe:    <Icn d={<><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></>} />,
  server:   <Icn d={<><rect x="3" y="4" width="18" height="7" rx="1"/><rect x="3" y="13" width="18" height="7" rx="1"/><path d="M7 7.5h.01M7 16.5h.01"/></>} />,
  palette:  <Icn d={<><path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.5-.9 1-1.7-.7-1.1 0-2.3 1.3-2.3H17a4 4 0 0 0 4-4c0-5-4-10-9-10Z"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16" cy="10" r="1"/></>} />,
  users:    <Icn d={<><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 5.2a3.5 3.5 0 0 1 0 6.6M17.5 20a6.4 6.4 0 0 0-2-4.6"/></>} />,
};

function Btn({ kind = "outline", size, icon, iconR, children, style, ...rest }) {
  const cls = ["ih-btn", `ih-btn--${kind}`, size && `ih-btn--${size}`].filter(Boolean).join(" ");
  return <button className={cls} style={style} {...rest}>{icon}{children}{iconR}</button>;
}
function Badge({ kind = "default", children, dot, style }) {
  return <span className={`ih-badge ${kind !== "default" ? "ih-badge--" + kind : ""}`} style={style}>{dot && <span className="ih-dot" />}{children}</span>;
}
function Img({ label = "image", style, className = "", navy, accent, plain, children }) {
  const c = ["ih-img", navy && "ih-img--navy", accent && "ih-img--accent", plain && "ih-img--plain", className].filter(Boolean).join(" ");
  return <div className={c} data-label={label} style={style}>{children}</div>;
}
function Field({ label, hint, children, style }) {
  return <div style={style}>{label && <label className="ih-label">{label}</label>}{children}{hint && <div className="ih-hint">{hint}</div>}</div>;
}
function Chip({ on, ghost, children, style }) {
  return <span className={`ih-chip ${on ? "is-on" : ""} ${ghost ? "ih-chip--ghost" : ""}`} style={style}>{children}</span>;
}
function Avatar({ initials, size = 32, accent }) {
  return <div className="ih-avatar" style={{ width: size, height: size, fontSize: size * 0.36,
    background: accent ? "var(--ih-accent)" : "var(--ih-surface-3)", color: accent ? "#fff" : "var(--ih-ink-2)" }}>{initials}</div>;
}
function Eyebrow({ children, style }) { return <div className="eyebrow" style={style}>{children}</div>; }
function SecHead({ eyebrow, title, serif, action, style }) {
  return <div className="ih-sechead" style={style}>
    <div>{eyebrow && <Eyebrow style={{ marginBottom: 12 }}>{eyebrow}</Eyebrow>}
      <h2 className={serif ? "serif" : ""}>{title}</h2></div>
    {action}
  </div>;
}
function Spec({ rows, style }) {
  return <div className="ih-spec" style={style}>
    {rows.map(([k, v], i) => <div className="ih-spec__row" key={i}><span className="ih-spec__k">{k}</span><span className="ih-spec__v">{v}</span></div>)}
  </div>;
}
function Stat({ label, value, delta, down }) {
  return <div className="ih-stat"><div className="ih-stat__label">{label}</div><div className="ih-stat__value">{value}</div>
    {delta && <div className={`ih-stat__delta ${down ? "is-down" : ""}`}>{delta}</div>}</div>;
}
function Crumb({ items }) {
  return <div className="ih-crumb">{items.map((t, i) => <React.Fragment key={i}>{i > 0 && <span style={{ opacity: .5 }}>/</span>}<span style={{ color: i === items.length - 1 ? "var(--ih-ink-2)" : undefined }}>{t}</span></React.Fragment>)}</div>;
}

// ─── Catalog data (shared across screens) ──────────────────────────
const CATS = [
  { n: "Hydraulic Pumps", c: 184, id: "CAT.01", d: "Gear, vane, piston and radial — fixed and variable displacement." },
  { n: "Cylinders", c: 226, id: "CAT.02", d: "Tie-rod, welded, telescopic and custom-bore to ISO 6020/6022." },
  { n: "Valves & Manifolds", c: 412, id: "CAT.03", d: "Directional, pressure, flow control and integrated blocks." },
  { n: "Hoses & Fittings", c: 540, id: "CAT.04", d: "SAE / EN hoses, BSP & JIC fittings, custom assemblies." },
  { n: "Seals & Components", c: 320, id: "CAT.05", d: "Rod, piston and wiper seals — NBR / FKM / EPDM." },
  { n: "Accessories & Instrumentation", c: 188, id: "CAT.06", d: "Filters, gauges, accumulators, coolers, sensors." },
];
const BRANDS = [
  ["Yuken", "JAPAN", "Directional valves & piston pumps"], ["Atos", "ITALY", "Proportional valves & servo"],
  ["Bosch Rexroth", "DE", "Industrial & mobile hydraulics"], ["Parker", "USA", "Hose, fittings, motion control"],
  ["Eaton Vickers", "USA", "Vane & piston pumps"], ["Hydac", "DE", "Filtration & accumulators"],
  ["SUN Hydraulics", "USA", "Cartridge valves"], ["Argo-Hytos", "CZ", "Filtration & valves"],
  ["Veljan", "INDIA", "Vane pumps & motors"], ["Polyhydron", "INDIA", "High-pressure radial piston"],
  ["SKF", "SE", "Sealing solutions"], ["Trelleborg", "SE", "Engineered seals"],
];
const PRODUCTS = [
  { sku: "IH-AP71-D-R-V", t: "Axial Piston Pump A10VSO 71cc", b: "Bosch Rexroth", m: ["350 bar", "71 cc/rev"], tag: "NEW", img: "axial piston pump" },
  { sku: "IH-DSG-01-3C4-D24", t: "Solenoid Directional Valve DSG-01 24V DC", b: "Yuken", m: ["Cetop 3 · NG6", "315 bar"], tag: "BESTSELLER", img: "cetop-3 valve" },
  { sku: "IH-CYL-80-50-300", t: "ISO 6020/2 Tie-Rod Cylinder 80×50×300", b: "Atos", m: ["210 bar", "Bore 80 mm"], img: "tie-rod cylinder" },
  { sku: "IH-SB330-10A1", t: "Bladder Accumulator SB330 10L", b: "Hydac", m: ["330 bar", "10 L"], tag: "RESTOCKED", img: "bladder accumulator" },
  { sku: "IH-PVQ-32-B2R", t: "Variable Vane Pump PVQ32 B2R", b: "Eaton Vickers", m: ["250 bar", "32 cc/rev"], img: "vane pump" },
  { sku: "IH-RE-06-P-10", t: "Pressure Relief Valve RE-06 Pilot", b: "SUN Hydraulics", m: ["350 bar", "NG6"], img: "relief valve cartridge" },
  { sku: "IH-2SN-12-BSP", t: "2SN Hydraulic Hose Assembly 3/4\" BSP", b: "Parker", m: ["275 bar", "DN19"], img: "hose assembly" },
  { sku: "IH-RFV-0160-D", t: "Return Line Filter RFV 0160 10µ", b: "Argo-Hytos", m: ["10 bar", "160 L/min"], img: "return filter" },
];

function ProdCard({ p, compact }) {
  return <a className="ih-prod">
    <Img className="ih-prod__media" label={p.img}>
      {p.tag && <span className="ih-badge ih-badge--square ih-badge--navy" style={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>{p.tag}</span>}
    </Img>
    <div className="ih-prod__body">
      <div className="ih-prod__sku">{p.sku}</div>
      <div className="ih-prod__title">{p.t}</div>
      <div className="ih-prod__meta"><b>{p.b}</b>{p.m.map((x, i) => <span key={i}>{x}</span>)}</div>
      {!compact && <Btn kind="outline" size="sm" style={{ marginTop: 4, width: "100%" }}>Add to quote</Btn>}
    </div>
  </a>;
}

// ─── Chrome ────────────────────────────────────────────────────────
function UtilityBar() {
  return <div className="ih-utility">
    <span style={{ display: "flex", alignItems: "center", gap: 7 }}><span className="ih-dot" style={{ color: "var(--ih-steel)" }} />1,134 live SKUs · ships to 47 countries</span>
    <span style={{ marginLeft: "auto", display: "flex", gap: 22 }}>
      <a>+971 52 2477942</a><a>Mon–Fri 09:00–18:00 GST</a><a>Track an RFQ</a><a>Sign in</a>
    </span>
  </div>;
}
function SiteNav({ active = "Products", light }) {
  const items = ["Products", "Brands", "Industries", "Services", "Blog", "About", "Contact"];
  return <header className="ih-nav" style={light ? { background: "var(--ih-bg)" } : undefined}>
    <a className="ih-nav__logo">
      <span className="ih-nav__mark">IH</span>
      <span className="ih-nav__word">Indus Hydraulics</span>
    </a>
    <nav className="ih-nav__items" style={{ flex: 1, marginLeft: 12 }}>
      {items.map(i => <a key={i} className={i === active ? "is-active" : ""}>{i}</a>)}
    </nav>
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <Btn kind="ghost" size="sm" icon={I.search}>Search</Btn>
      <Btn kind="ghost" size="sm" icon={I.bookmark}>Saved</Btn>
      <Btn kind="ghost" size="sm" icon={I.user}>Sign in</Btn>
      <Btn kind="primary" size="sm" icon={I.doc}>Request a quote</Btn>
    </div>
  </header>;
}
function SiteFooter() {
  const cols = [
    ["Catalogue", ["Hydraulic Pumps", "Cylinders", "Valves & Manifolds", "Hoses & Fittings", "Seals & Components", "Accessories"]],
    ["Services", ["Repair & Rebuild", "Case studies", "On-site commissioning", "Testing & certification", "Custom assemblies"]],
    ["Company", ["About Indus", "Brands we carry", "Industries served", "Insights", "Careers", "Contact"]],
  ];
  return <footer className="ih-footer">
    <div style={{ display: "grid", gridTemplateColumns: "1.6fr repeat(3, 1fr)", gap: 44, paddingBottom: 44 }}>
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
          <span className="ih-nav__mark" style={{ background: "rgba(255,255,255,.12)" }}>IH</span>
          <span style={{ fontFamily: "var(--ih-font-serif)", fontSize: 22, color: "#fff", lineHeight: 1 }}>Indus Hydraulics</span>
        </div>
        <p style={{ marginTop: 14, fontSize: 13, lineHeight: 1.65, maxWidth: 300, color: "oklch(0.75 0.02 250)" }}>
Specialist distributor of industrial hydraulic components — pumps, valves, cylinders and hose assemblies. ISO 9001:2015 certified.
        </p>
        <div style={{ display: "flex", gap: 8, marginTop: 20, flexWrap: "wrap" }}>
          {["Dubai HQ", "Mumbai", "Houston"].map(c => <span key={c} className="ih-badge" style={{ background: "rgba(255,255,255,.09)", color: "oklch(0.85 0.02 250)" }}>{c}</span>)}
        </div>
      </div>
      {cols.map(([h, items]) => <div key={h}><h4>{h}</h4><ul>{items.map(x => <li key={x}><a>{x}</a></li>)}</ul></div>)}
    </div>
    <div style={{ borderTop: "1px solid rgba(255,255,255,.12)", paddingTop: 22, display: "flex", justifyContent: "space-between", fontFamily: "var(--ih-font-mono)", fontSize: 11, color: "oklch(0.65 0.03 250)", letterSpacing: ".04em" }}>
      <span>© 2026 Indus Hydraulics Pvt. Ltd. · +971 52 2477942 · sales@indushydraulics.me</span>
      <span style={{ display: "flex", gap: 20 }}><a>Terms</a><a>Privacy</a><a>Export compliance</a></span>
    </div>
  </footer>;
}

const ADMIN_NAV = [
  ["Overview", [["Dashboard", I.chart, "", true]]],
  ["Catalogue", [["Products", I.box, "1,870"], ["Categories", I.layers, "06"], ["Inventory", I.truck, ""], ["Pricing", I.tag, ""], ["Bulk import", I.upload, ""]]],
  ["Demand", [["Quotes / RFQ", I.doc, "24"], ["Customers", I.users, ""]]],
  ["Content", [["CMS pages", I.image, ""], ["Media library", I.image, ""], ["SEO", I.globe, ""]]],
  ["Platform", [["Users & roles", I.user, ""], ["Settings", I.settings, ""], ["Infrastructure", I.server, ""], ["Design tokens", I.palette, ""]]],
];
function AdminShell({ active = "Dashboard", title, actions, children, sub }) {
  return <div className="ih-admin">
    <aside className="ih-admin__side">
      <div className="ih-admin__brand">
        <span className="ih-nav__mark" style={{ background: "rgba(255,255,255,.14)", width: 30, height: 30, fontSize: 12 }}>IH</span>
        <span className="w">Indus<small>Operations console</small></span>
      </div>
      {ADMIN_NAV.map(([g, items]) => <React.Fragment key={g}>
        <div className="ih-admin__group">{g}</div>
        {items.map(([n, ic, c]) => <div key={n} className={`ih-admin__item ${n === active ? "is-active" : ""}`}>
          <span style={{ opacity: n === active ? 1 : .72, display: "flex" }}>{ic}</span>{n}{c && <span className="c">{c}</span>}
        </div>)}
      </React.Fragment>)}
      <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: 9, padding: "10px 8px", borderTop: "1px solid rgba(255,255,255,.12)" }}>
        <Avatar initials="RK" size={28} />
        <div style={{ lineHeight: 1.25, minWidth: 0 }}>
          <div style={{ fontSize: 12.5, color: "#fff" }}>R. Kulkarni</div>
          <div style={{ fontFamily: "var(--ih-font-mono)", fontSize: 9.5, color: "oklch(0.65 0.03 250)", letterSpacing: ".06em" }}>CATALOGUE ADMIN</div>
        </div>
      </div>
    </aside>
    <main className="ih-admin__main">
      <div className="ih-admin__top">
        <div><div className="ih-admin__title">{title}</div>
          {sub && <div style={{ fontSize: 11.5, color: "var(--ih-muted)", marginTop: 1 }}>{sub}</div>}</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>{actions}</div>
      </div>
      <div className="ih-admin__content">{children}</div>
    </main>
  </div>;
}

Object.assign(window, { Icn, I, Btn, Badge, Img, Field, Chip, Avatar, Eyebrow, SecHead, Spec, Stat, Crumb,
  CATS, BRANDS, PRODUCTS, ProdCard, UtilityBar, SiteNav, SiteFooter, AdminShell, ADMIN_NAV });
