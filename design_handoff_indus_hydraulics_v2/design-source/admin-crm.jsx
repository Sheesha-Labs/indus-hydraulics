/* eslint-disable */
// Admin — demand, content and platform.

function AdminQuotes() {
  const rows = [["RFQ-4821", "Gulf Drilling Services", "Cylinders · 4 lines", "38 min", "Unassigned", "warn"],
    ["RFQ-4820", "Tata Steel — Jamshedpur", "Valves · 12 lines", "1h 12m", "R. Kulkarni", "default"],
    ["RFQ-4819", "Mazagon Dock", "Pumps · 2 lines", "2h 04m", "R. Kulkarni", "default"],
    ["RFQ-4818", "Al Faris Equipment", "Hoses · 26 lines", "3h 41m", "A. Nasser", "default"],
    ["RFQ-4817", "Bharat Forge", "Accumulators · 1 line", "5h 20m", "S. Pillai", "success"],
    ["RFQ-4816", "Adani Ports", "Seal kits · 9 lines", "1 d", "A. Nasser", "success"],
    ["RFQ-4815", "Sterlite Copper", "Power pack · 1 unit", "1 d", "R. Kulkarni", "success"]];
  return <AdminShell active="Quotes / RFQ" title="Quotes & RFQ" sub="24 open · 5 awaiting first response"
    actions={<><Btn kind="outline" size="sm" icon={I.download}>Export</Btn><Btn kind="primary" size="sm" icon={I.plus}>Manual quote</Btn></>}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
      <Stat label="Awaiting first reply" value="5" delta="SLA 4h" /><Stat label="Quoted, awaiting client" value="11" />
      <Stat label="Won this month" value="18" delta="+4" /><Stat label="Median response" value="3.4h" delta="−0.8h" />
    </div>
    <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
      <Chip on>Open · 24</Chip><Chip>Unassigned · 3</Chip><Chip>Breaching SLA · 1</Chip><Chip>Quoted</Chip><Chip>Closed</Chip>
      <div style={{ position: "relative", width: 220, marginLeft: "auto" }}>
        <span style={{ position: "absolute", left: 11, top: 8, color: "var(--ih-muted)", display: "flex" }}>{I.search}</span>
        <input className="ih-field" style={{ height: 32, paddingLeft: 34 }} placeholder="Reference or customer" />
      </div>
    </div>
    <div className="ih-card">
      <table className="ih-table">
        <thead><tr><th>Reference</th><th>Customer</th><th>Scope</th><th>Waiting</th><th>Owner</th><th /></tr></thead>
        <tbody>{rows.map(([r, c, s, w, o, k]) => <tr key={r}>
          <td className="num" style={{ fontSize: 12, color: "var(--ih-accent)" }}>{r}</td>
          <td style={{ fontWeight: 500 }}>{c}</td>
          <td style={{ color: "var(--ih-muted)", fontSize: 12.5 }}>{s}</td>
          <td><Badge kind={k} dot={k !== "default"}>{w}</Badge></td>
          <td>{o === "Unassigned" ? <Badge kind="warn">Unassigned</Badge> :
            <span style={{ display: "inline-flex", gap: 7, alignItems: "center", fontSize: 12.5 }}>
              <Avatar initials={o.split(" ")[1].slice(0, 2).toUpperCase()} size={26} />{o}</span>}</td>
          <td style={{ textAlign: "right" }}><Btn kind="outline" size="sm">Open</Btn></td>
        </tr>)}</tbody>
      </table>
    </div>
  </AdminShell>;
}

function AdminCustomers() {
  const rows = [["Gulf Drilling Services", "Ras Al Khaimah, UAE", "Tier 1 — contract", 42, "38 min ago", "Oil & gas"],
    ["Tata Steel — Jamshedpur", "Jharkhand, India", "Tier 1 — contract", 128, "1h ago", "Steel & metals"],
    ["Al Faris Equipment", "Abu Dhabi, UAE", "Tier 2 — repeat", 66, "3h ago", "Construction plant"],
    ["Mazagon Dock", "Mumbai, India", "Tier 1 — contract", 91, "2h ago", "Marine"],
    ["Bharat Forge", "Pune, India", "Tier 2 — repeat", 54, "5h ago", "Machine tools"],
    ["Adani Ports", "Mundra, India", "Tier 2 — repeat", 37, "1 d ago", "Marine"],
    ["Mehta Engineering Works", "Pune, India", "Tier 3 — standard", 12, "2 d ago", "Machine tools"],
    ["Sterlite Copper", "Tuticorin, India", "Tier 3 — standard", 8, "3 d ago", "Metals"]];
  return <AdminShell active="Customers" title="Customers" sub="494 accounts · 80 active in the last 90 days"
    actions={<><Btn kind="outline" size="sm" icon={I.download}>Export</Btn><Btn kind="primary" size="sm" icon={I.plus}>New account</Btn></>}>
    <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
      <Chip on>All</Chip><Chip>Tier 1 · 12</Chip><Chip>Tier 2 · 68</Chip><Chip>Tier 3 · 410</Chip><Chip>Dormant · 88</Chip>
      <select className="ih-field" style={{ width: 150, height: 32, marginLeft: "auto" }}><option>All industries</option></select>
    </div>
    <div className="ih-card">
      <table className="ih-table">
        <thead><tr><th>Account</th><th>Location</th><th>Tier</th><th>Quotes</th><th>Industry</th><th>Last activity</th><th /></tr></thead>
        <tbody>{rows.map(([n, l, t, q, act, ind]) => <tr key={n}>
          <td><div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Avatar initials={n.slice(0, 2).toUpperCase()} size={28} />
            <span style={{ fontWeight: 500, fontSize: 13 }}>{n}</span></div></td>
          <td style={{ fontSize: 12.5, color: "var(--ih-muted)" }}>{l}</td>
          <td><Badge kind={t.startsWith("Tier 1") ? "accent" : t.startsWith("Tier 2") ? "steel" : "default"}>{t}</Badge></td>
          <td className="num">{q}</td>
          <td style={{ fontSize: 12.5, color: "var(--ih-muted)" }}>{ind}</td>
          <td className="num" style={{ fontSize: 12, color: "var(--ih-muted)" }}>{act}</td>
          <td style={{ textAlign: "right", color: "var(--ih-muted-2)" }}><span style={{ display: "inline-flex" }}>{I.dotsV}</span></td>
        </tr>)}</tbody>
      </table>
    </div>
  </AdminShell>;
}

function AdminCustomerDetail() {
  return <AdminShell active="Customers" title="Gulf Drilling Services" sub="Account #GDS-0114 · Ras Al Khaimah, UAE · customer since 2014"
    actions={<><Badge kind="accent">Tier 1 — contract</Badge><Btn kind="outline" size="sm">Log a call</Btn><Btn kind="primary" size="sm" icon={I.doc}>New quote</Btn></>}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          <Stat label="Quotes, 12 mo" value="42" delta="+9" /><Stat label="Win rate" value="71%" delta="+4 pts" />
          <Stat label="Avg. order value" value="₹8.4L" /><Stat label="Open RFQs" value="3" />
        </div>
        <div className="ih-card">
          <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--ih-border)", display: "flex", alignItems: "center" }}>
            <h3 style={{ fontSize: 14 }}>Recent quotes</h3><a style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--ih-accent)" }}>All 42</a>
          </div>
          <table className="ih-table">
            <thead><tr><th>Ref</th><th>Scope</th><th>Raised</th><th>Value</th><th>Status</th></tr></thead>
            <tbody>{[["RFQ-4821", "Cylinders · 4 lines", "15 Aug", "—", "Awaiting reply", "warn"],
              ["RFQ-4788", "Mud pump rebuild", "22 Jul", "₹14.2L", "Won", "success"],
              ["RFQ-4740", "Hose assemblies · 26", "02 Jul", "₹3.8L", "Won", "success"],
              ["RFQ-4702", "Valve bank", "11 Jun", "₹6.1L", "Lost — price", "danger"],
              ["RFQ-4688", "Seal kits · 14", "28 May", "₹1.2L", "Won", "success"]].map(([r, s, d, v, st, k]) =>
              <tr key={r}><td className="num" style={{ fontSize: 12, color: "var(--ih-accent)" }}>{r}</td><td>{s}</td>
                <td className="num" style={{ fontSize: 12.5, color: "var(--ih-muted)" }}>{d}</td><td className="num">{v}</td>
                <td><Badge kind={k} dot>{st}</Badge></td></tr>)}
            </tbody>
          </table>
        </div>
        <div className="ih-card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, marginBottom: 14 }}>Activity</h3>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {[["Today, 09:04", "RFQ-4821 received — 4 cylinder lines, marked urgent", "doc"],
              ["12 Aug", "Call logged: A. Nasser discussed sour-gas seal spec", "phone"],
              ["28 Jul", "Mud pump rebuild dispatched, certificate issued", "truck"],
              ["22 Jul", "RFQ-4788 won at ₹14.2L", "check"]].map(([t, d], i, arr) =>
              <div key={t} style={{ display: "flex", gap: 14, paddingBottom: i < arr.length - 1 ? 16 : 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <span style={{ width: 7, height: 7, borderRadius: 999, background: i === 0 ? "var(--ih-accent)" : "var(--ih-border-strong)", marginTop: 5 }} />
                  {i < arr.length - 1 && <span style={{ width: 1, flex: 1, background: "var(--ih-border)", marginTop: 5 }} />}
                </div>
                <div><div className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted)", letterSpacing: ".05em" }}>{t.toUpperCase()}</div>
                  <div style={{ fontSize: 13, marginTop: 3 }}>{d}</div></div>
              </div>)}
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="ih-card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>Contacts</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[["FA", "Faisal Al Marri", "Maintenance manager", "Primary"], ["SK", "S. Kurian", "Procurement", ""], ["JB", "J. Baptista", "Rig superintendent", ""]].map(([i2, n, r, tag]) =>
              <div key={n} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <Avatar initials={i2} size={30} />
                <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 500 }}>{n}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ih-muted)" }}>{r}</div></div>
                {tag && <Badge kind="accent">{tag}</Badge>}
              </div>)}
          </div>
        </div>
        <div className="ih-card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>Commercial terms</h3>
          <Spec rows={[["Tier", "Tier 1 — contract"], ["Discount", "−8% off band"], ["Payment terms", "45 days"], ["Incoterm", "CIF Jebel Ali"], ["Credit limit", "₹50L"], ["Currency", "AED"]]} />
        </div>
        <div className="ih-card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>Notes</h3>
          <p style={{ fontSize: 12.5, color: "var(--ih-ink-2)", lineHeight: 1.6 }}>
            Everything on this account is sour service — default to FKM unless told otherwise. Faisal prefers WhatsApp for photos and email for quotations.
          </p>
        </div>
      </div>
    </div>
  </AdminShell>;
}

function AdminCms() {
  return <AdminShell active="CMS pages" title="CMS" sub="34 pages · 6 category landing templates"
    actions={<><Btn kind="ghost" size="sm">Preview</Btn><Btn kind="outline" size="sm">Save draft</Btn><Btn kind="primary" size="sm">Publish</Btn></>}>
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr 280px", gap: 18, alignItems: "start" }}>
      <div className="ih-card" style={{ padding: 14 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>Pages</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {["Home", "About", "Services", "Case studies", "Industries — Oil & gas", "Industries — Marine", "Contact", "Insights index", "Terms", "Privacy"].map((t, i) =>
            <a key={t} style={{ padding: "7px 9px", borderRadius: 5, fontSize: 12.5, background: i === 0 ? "var(--ih-accent-soft)" : "transparent", color: i === 0 ? "var(--ih-accent)" : "var(--ih-ink-2)" }}>{t}</a>)}
        </div>
      </div>
      <div className="ih-card">
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--ih-border)", display: "flex", alignItems: "center", gap: 10 }}>
          <h3 style={{ fontSize: 14 }}>Home</h3><Badge kind="success" dot>Live</Badge>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted)", marginLeft: "auto" }}>10 BLOCKS</span>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {[["Hero", "Full range of Oilfield Equipments", true], ["USP strip", "4 items", false], ["Category grid", "6 categories, 1 featured", false],
            ["Brand rail", "12 of 14 brands", false], ["Featured products", "Auto — new arrivals", false], ["Industries", "6 tiles", false],
            ["Why Indus", "4 reasons + testimonial", false], ["Insights", "Latest 3 posts", false], ["Newsletter CTA", "Mailchimp list #4", false], ["Footer", "Global", false]].map(([n, d, sel]) =>
            <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", border: `1px solid ${sel ? "var(--ih-accent)" : "var(--ih-border)"}`,
              background: sel ? "var(--ih-accent-soft)" : "var(--ih-surface)", borderRadius: 6 }}>
              <span style={{ color: "var(--ih-muted-2)", display: "flex", cursor: "grab" }}><Icn size={14} d={<><path d="M9 5h.01M9 12h.01M9 19h.01M15 5h.01M15 12h.01M15 19h.01" /></>} sw={2.4} /></span>
              <span style={{ fontSize: 13, fontWeight: 500, width: 150 }}>{n}</span>
              <span style={{ fontSize: 12, color: "var(--ih-muted)", flex: 1 }}>{d}</span>
              <span style={{ color: "var(--ih-muted-2)", display: "flex" }}>{I.dotsV}</span>
            </div>)}
          <div style={{ border: "1px dashed var(--ih-border-strong)", borderRadius: 6, padding: 14, textAlign: "center", fontSize: 12.5, color: "var(--ih-muted)" }}>+ Add block</div>
        </div>
      </div>
      <div className="ih-card" style={{ padding: 18 }}>
        <h3 style={{ fontSize: 14, marginBottom: 14 }}>Hero block</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Eyebrow"><input className="ih-field" defaultValue="Est. 2003 — Mumbai · Houston · Dubai" /></Field>
          <Field label="Headline"><textarea className="ih-field" rows={2} defaultValue="Full range of Oilfield Equipments." /></Field>
          <Field label="Emphasis span" hint="Rendered in italic serif"><input className="ih-field" defaultValue="Oilfield Equipments" /></Field>
          <Field label="Hero image"><Img style={{ aspectRatio: "16/10", borderRadius: 6 }} label="hero image" /></Field>
          <Field label="Primary CTA"><input className="ih-field" defaultValue="Browse the catalogue" /></Field>
        </div>
      </div>
    </div>
  </AdminShell>;
}

function AdminMedia() {
  const files = ["A10VSO-71-three-quarter.jpg", "DSG-01-valve.jpg", "tie-rod-cylinder-80.jpg", "SB330-accumulator.jpg", "workshop-floor-01.jpg",
    "mud-pump-strip.jpg", "hose-assemblies.jpg", "test-rig-6000psi.jpg", "vane-pump-PVQ32.jpg", "relief-valve-RE06.jpg", "filter-RFV0160.jpg", "jebel-ali-warehouse.jpg"];
  return <AdminShell active="Media library" title="Media library" sub="2,140 files · 8.4 GB of 20 GB"
    actions={<><Btn kind="outline" size="sm">New folder</Btn><Btn kind="primary" size="sm" icon={I.upload}>Upload</Btn></>}>
    <div style={{ display: "flex", gap: 8, marginBottom: 16, alignItems: "center" }}>
      <Chip on>All</Chip><Chip>Product shots · 1,684</Chip><Chip>Workshop · 212</Chip><Chip>Datasheets · 198</Chip><Chip>Unused · 46</Chip>
      <div style={{ position: "relative", width: 220, marginLeft: "auto" }}>
        <span style={{ position: "absolute", left: 11, top: 8, color: "var(--ih-muted)", display: "flex" }}>{I.search}</span>
        <input className="ih-field" style={{ height: 32, paddingLeft: 34 }} placeholder="Search filename or alt text" />
      </div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 18, alignItems: "start" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12 }}>
        {files.map((f, i) => <div key={f} style={{ border: `1px solid ${i === 0 ? "var(--ih-accent)" : "var(--ih-border)"}`, borderRadius: 8, overflow: "hidden", background: "var(--ih-surface)" }}>
          <Img style={{ aspectRatio: "1/1" }} label="" />
          <div style={{ padding: "8px 10px" }}>
            <div style={{ fontSize: 10.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--ih-font-mono)", color: "var(--ih-ink-2)" }}>{f}</div>
          </div>
        </div>)}
      </div>
      <div className="ih-card" style={{ padding: 18 }}>
        <Img style={{ aspectRatio: "1/1", borderRadius: 6 }} label="A10VSO-71" />
        <h3 style={{ fontSize: 13.5, marginTop: 14 }}>A10VSO-71-three-quarter.jpg</h3>
        <div style={{ marginTop: 12 }}><Spec rows={[["Dimensions", "2400 × 1800"], ["Size", "1.8 MB"], ["Format", "JPEG"], ["Uploaded", "02 Aug 2026"], ["Used on", "4 pages"]]} /></div>
        <Field label="Alt text" style={{ marginTop: 14 }}><textarea className="ih-field" rows={2} defaultValue="Bosch Rexroth A10VSO 71cc axial piston pump, three-quarter view" /></Field>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <Btn kind="outline" size="sm" style={{ flex: 1 }}>Replace</Btn><Btn kind="outline" size="sm" style={{ flex: 1 }}>Delete</Btn>
        </div>
      </div>
    </div>
  </AdminShell>;
}

function AdminSeo() {
  return <AdminShell active="SEO" title="SEO" sub="Indexing, metadata and redirects"
    actions={<><Btn kind="outline" size="sm">Regenerate sitemap</Btn><Btn kind="primary" size="sm">Save</Btn></>}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 18 }}>
      <Stat label="Indexed pages" value="1,904" delta="+38" /><Stat label="Missing meta description" value="12" down delta="needs work" />
      <Stat label="Duplicate titles" value="3" down delta="+1" /><Stat label="Avg. position" value="14.2" delta="−2.1" />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18, alignItems: "start" }}>
      <div className="ih-card">
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--ih-border)", display: "flex", alignItems: "center" }}>
          <h3 style={{ fontSize: 14 }}>Pages needing attention</h3>
          <Badge kind="warn" style={{ marginLeft: 10 }}>15 issues</Badge>
        </div>
        <table className="ih-table">
          <thead><tr><th>URL</th><th>Title length</th><th>Meta description</th><th>Issue</th></tr></thead>
          <tbody>{[["/category/seals-components", "38", "Missing", "No meta description"],
            ["/product/ih-rfv-0160-d", "72", "Present", "Title over 60 characters"],
            ["/category/accessories", "41", "Missing", "No meta description"],
            ["/brand/veljan", "22", "Present", "Thin content — 84 words"],
            ["/insights/hose-whip-4sh", "58", "Duplicate", "Duplicate of /insights/hose-selection"],
            ["/product/ih-2sn-12-bsp", "44", "Missing", "No meta description"]].map(([u, t, m, iss]) => <tr key={u}>
            <td className="mono" style={{ fontSize: 11.5, color: "var(--ih-accent)" }}>{u}</td>
            <td className="num">{t}</td>
            <td><Badge kind={m === "Present" ? "success" : m === "Duplicate" ? "warn" : "danger"}>{m}</Badge></td>
            <td style={{ fontSize: 12.5, color: "var(--ih-muted)" }}>{iss}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="ih-card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, marginBottom: 14 }}>Global defaults</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Field label="Title template"><input className="ih-field" defaultValue="%title% | Indus Hydraulics" /></Field>
            <Field label="Default OG image"><Img style={{ aspectRatio: "1.91/1", borderRadius: 5 }} label="og image" /></Field>
            <Field label="Canonical host"><input className="ih-field" defaultValue="https://indushydraulics.com" /></Field>
          </div>
        </div>
        <div className="ih-card" style={{ padding: 18 }}>
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>Redirects</h3>
          <Spec rows={[["Active rules", "212"], ["Added this month", "18"], ["Chains detected", "2"], ["Last crawl", "14 Aug, 02:00"]]} />
          <Btn kind="outline" size="sm" style={{ width: "100%", marginTop: 14 }}>Manage redirects</Btn>
        </div>
      </div>
    </div>
  </AdminShell>;
}
Object.assign(window, { AdminQuotes, AdminCustomers, AdminCustomerDetail, AdminCms, AdminMedia, AdminSeo });
