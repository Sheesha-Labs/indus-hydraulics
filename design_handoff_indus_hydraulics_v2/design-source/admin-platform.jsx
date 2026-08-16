/* eslint-disable */
// Admin — platform: users, settings, infrastructure, design tokens.

function AdminUsers() {
  const rows = [["R. Kulkarni", "rk@indushydraulics.com", "Catalogue admin", "Full catalogue, quoting", "Active", "Now"],
    ["S. Pillai", "sp@indushydraulics.com", "Workshop", "Jobs, inventory adjust", "Active", "12 min ago"],
    ["A. Nasser", "an@indushydraulics.com", "Sales — GCC", "Quoting, customers", "Active", "1h ago"],
    ["M. Fernandes", "mf@indushydraulics.com", "Procurement", "Inventory, pricing, PO", "Active", "3h ago"],
    ["D. Shetty", "ds@indushydraulics.com", "Content editor", "CMS, media, SEO", "Active", "2 d ago"],
    ["Auditor (external)", "audit@kpmg-in.example", "Read only", "Reports only", "Expires 30 Sep", "5 d ago"],
    ["T. Rao", "tr@indushydraulics.com", "Sales — India", "Quoting, customers", "Invited", "—"]];
  return <AdminShell active="Users & roles" title="Users & roles" sub="7 users · 5 roles · SSO via Google Workspace"
    actions={<><Btn kind="outline" size="sm">Manage roles</Btn><Btn kind="primary" size="sm" icon={I.plus}>Invite user</Btn></>}>
    <div className="ih-card" style={{ marginBottom: 18 }}>
      <table className="ih-table">
        <thead><tr><th>User</th><th>Role</th><th>Scope</th><th>Status</th><th>Last seen</th><th /></tr></thead>
        <tbody>{rows.map(([n, e, r, s, st, ls]) => <tr key={e}>
          <td><div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <Avatar initials={n.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()} size={30} />
            <div><div style={{ fontWeight: 500, fontSize: 13 }}>{n}</div>
              <div className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted)", marginTop: 2 }}>{e}</div></div></div></td>
          <td><Badge kind={r === "Read only" ? "default" : "steel"}>{r}</Badge></td>
          <td style={{ fontSize: 12.5, color: "var(--ih-muted)" }}>{s}</td>
          <td><Badge kind={st === "Active" ? "success" : st === "Invited" ? "warn" : "default"} dot={st === "Active"}>{st}</Badge></td>
          <td className="num" style={{ fontSize: 12, color: "var(--ih-muted)" }}>{ls}</td>
          <td style={{ textAlign: "right", color: "var(--ih-muted-2)" }}><span style={{ display: "inline-flex" }}>{I.dotsV}</span></td>
        </tr>)}</tbody>
      </table>
    </div>
    <div className="ih-card">
      <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--ih-border)" }}><h3 style={{ fontSize: 14 }}>Permission matrix</h3></div>
      <table className="ih-table">
        <thead><tr><th>Capability</th><th>Catalogue admin</th><th>Workshop</th><th>Sales</th><th>Procurement</th><th>Content</th><th>Read only</th></tr></thead>
        <tbody>{[["Publish products", 1, 0, 0, 0, 0, 0], ["Adjust inventory", 1, 1, 0, 1, 0, 0], ["Send quotations", 1, 0, 1, 0, 0, 0],
          ["Edit pricing bands", 1, 0, 0, 1, 0, 0], ["Edit CMS & SEO", 1, 0, 0, 0, 1, 0], ["Manage users", 1, 0, 0, 0, 0, 0],
          ["View reports", 1, 1, 1, 1, 1, 1]].map(row => <tr key={row[0]}>
          <td style={{ fontWeight: 500, fontSize: 13 }}>{row[0]}</td>
          {row.slice(1).map((v, i) => <td key={i}>{v ?
            <span style={{ color: "var(--ih-success)", display: "inline-flex" }}><Icn size={15} sw={2.2} d={<path d="m5 12 5 5L20 7" />} /></span> :
            <span style={{ color: "var(--ih-muted-2)", fontSize: 13 }}>—</span>}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
  </AdminShell>;
}

function AdminSettings() {
  return <AdminShell active="Settings" title="Settings" sub="Company, commerce and notification defaults"
    actions={<><Btn kind="ghost" size="sm">Revert</Btn><Btn kind="primary" size="sm">Save settings</Btn></>}>
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 24, alignItems: "start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {["Company", "Commerce", "Quoting & SLA", "Notifications", "Shipping & duty", "Integrations", "Danger zone"].map((t, i) =>
          <a key={t} style={{ padding: "8px 10px", borderRadius: 6, fontSize: 13, background: i === 2 ? "var(--ih-accent-soft)" : "transparent",
            color: i === 2 ? "var(--ih-accent)" : "var(--ih-ink-2)", fontWeight: i === 2 ? 500 : 400 }}>{t}</a>)}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="ih-card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 15, marginBottom: 4 }}>Quoting & SLA</h3>
          <p style={{ fontSize: 12.5, color: "var(--ih-muted)", marginBottom: 20 }}>Targets shown on the dashboard and used to escalate an RFQ.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Field label="First-response target" hint="Business hours only"><input className="ih-field" defaultValue="4 hours" /></Field>
            <Field label="Formal quotation target"><input className="ih-field" defaultValue="24 hours" /></Field>
            <Field label="Escalate to" ><select className="ih-field"><option>R. Kulkarni (Catalogue admin)</option></select></Field>
            <Field label="Business hours"><input className="ih-field" defaultValue="09:00–19:00 IST, Mon–Sat" /></Field>
            <Field label="Quote validity" hint="Printed on every quotation"><input className="ih-field" defaultValue="30 days" /></Field>
            <Field label="Default incoterm"><select className="ih-field"><option>CIF</option></select></Field>
          </div>
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: "1px solid var(--ih-border)", display: "flex", flexDirection: "column", gap: 14 }}>
            {[["Show prices on the storefront", "Quote-only catalogue. Turning this on requires published price lists per tier.", false],
              ["Auto-acknowledge new RFQs", "Sends the reference number immediately, before an engineer looks at it.", true],
              ["Require destination on RFQ", "Duty and packing can't be estimated without it.", true],
              ["Allow guest quotes", "No account needed. Recommended — most first-time RFQs are guests.", true]].map(([t, d, on]) =>
              <div key={t} style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
                <span style={{ width: 34, height: 20, borderRadius: 999, background: on ? "var(--ih-accent)" : "var(--ih-surface-3)", flexShrink: 0, padding: 2, display: "flex", justifyContent: on ? "flex-end" : "flex-start" }}>
                  <span style={{ width: 16, height: 16, borderRadius: 999, background: "#fff" }} />
                </span>
                <div><div style={{ fontSize: 13.5, fontWeight: 500 }}>{t}</div>
                  <div style={{ fontSize: 12, color: "var(--ih-muted)", marginTop: 3, lineHeight: 1.5 }}>{d}</div></div>
              </div>)}
          </div>
        </div>
        <div className="ih-card" style={{ padding: 22 }}>
          <h3 style={{ fontSize: 15, marginBottom: 16 }}>Notification routing</h3>
          <table className="ih-table">
            <thead><tr><th>Event</th><th>Email</th><th>WhatsApp</th><th>Recipient</th></tr></thead>
            <tbody>{[["New RFQ received", 1, 1, "Sales rota"], ["RFQ breaching SLA", 1, 1, "R. Kulkarni"], ["Stock below reorder", 1, 0, "Procurement"],
              ["Bulk import finished", 1, 0, "Initiator"], ["Quote accepted", 1, 1, "Owner + accounts"]].map(([e, em, wa, r]) => <tr key={e}>
              <td style={{ fontWeight: 500, fontSize: 13 }}>{e}</td>
              {[em, wa].map((v, i) => <td key={i}><span className={`ih-check ${v ? "is-on" : ""}`}>{v ? <Icn size={11} sw={2.6} d={<path d="m5 12 5 5L20 7" />} /> : null}</span></td>)}
              <td style={{ fontSize: 12.5, color: "var(--ih-muted)" }}>{r}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
  </AdminShell>;
}

function AdminInfra() {
  return <AdminShell active="Infrastructure" title="Infrastructure" sub="Environments, scheduled jobs and logs"
    actions={<><Btn kind="outline" size="sm" icon={I.download}>Download logs</Btn><Btn kind="primary" size="sm">Deploy to production</Btn></>}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 18 }}>
      {[["Production", "indushydraulics.com", "Healthy", "success", "v4.18.2", "14 Aug 21:04"],
        ["Staging", "staging.indushydraulics.com", "Healthy", "success", "v4.19.0-rc3", "15 Aug 08:12"],
        ["Search index", "Typesense · 3 nodes", "Reindexing", "warn", "1,870 docs", "in progress"]].map(([n, h, s, k, v, t]) =>
        <div key={n} className="ih-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <h3 style={{ fontSize: 14.5 }}>{n}</h3><Badge kind={k} dot style={{ marginLeft: "auto" }}>{s}</Badge>
          </div>
          <div className="mono" style={{ fontSize: 11, color: "var(--ih-muted)", marginTop: 8 }}>{h}</div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--ih-border)" }}>
            <span className="mono" style={{ fontSize: 11.5 }}>{v}</span>
            <span className="mono" style={{ fontSize: 11, color: "var(--ih-muted)" }}>{t}</span>
          </div>
        </div>)}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
      <div className="ih-card">
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--ih-border)" }}><h3 style={{ fontSize: 14 }}>Scheduled jobs</h3></div>
        <table className="ih-table">
          <thead><tr><th>Job</th><th>Schedule</th><th>Last run</th><th>Status</th></tr></thead>
          <tbody>{[["Search reindex", "Hourly", "08:00", "Running", "warn"], ["Sitemap regeneration", "Daily 02:00", "02:00", "OK", "success"],
            ["FX rate refresh", "Daily 06:00", "06:00", "OK", "success"], ["Stock sync — Dubai", "Every 15 min", "09:30", "OK", "success"],
            ["Datasheet link check", "Weekly Sun", "10 Aug", "2 failures", "danger"], ["Database backup", "Daily 01:00", "01:00", "OK", "success"]].map(([j, s, l, st, k]) =>
            <tr key={j}><td style={{ fontWeight: 500, fontSize: 13 }}>{j}</td>
              <td className="num" style={{ fontSize: 12, color: "var(--ih-muted)" }}>{s}</td>
              <td className="num" style={{ fontSize: 12 }}>{l}</td>
              <td><Badge kind={k} dot>{st}</Badge></td></tr>)}
          </tbody>
        </table>
      </div>
      <div className="ih-card">
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--ih-border)", display: "flex", alignItems: "center" }}>
          <h3 style={{ fontSize: 14 }}>Recent events</h3>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted)", marginLeft: "auto" }}>LAST 24H</span>
        </div>
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, fontFamily: "var(--ih-font-mono)", fontSize: 11.5 }}>
          {[["09:32", "INFO", "stock-sync: 214 lines updated from Jebel Ali"],
            ["09:00", "WARN", "reindex: 3 docs missing primary image, skipped"],
            ["08:12", "INFO", "deploy: staging v4.19.0-rc3 by D. Shetty"],
            ["06:00", "INFO", "fx-refresh: USD 83.42, EUR 90.18, AED 22.71"],
            ["04:18", "ERROR", "datasheet-check: 2 dead links (Veljan, Polyhydron)"],
            ["02:00", "INFO", "sitemap: 1,904 URLs written"],
            ["01:00", "INFO", "backup: 4.2 GB to cold storage, 38 s"]].map(([t, lvl, m]) =>
            <div key={t + m} style={{ display: "flex", gap: 10 }}>
              <span style={{ color: "var(--ih-muted-2)" }}>{t}</span>
              <span style={{ width: 44, color: lvl === "ERROR" ? "var(--ih-danger)" : lvl === "WARN" ? "oklch(0.5 0.1 62)" : "var(--ih-steel)" }}>{lvl}</span>
              <span style={{ flex: 1, color: "var(--ih-ink-2)" }}>{m}</span>
            </div>)}
        </div>
      </div>
    </div>
  </AdminShell>;
}

function AdminDesignTokens() {
  const tokens = [["--ih-navy", "Deep blue · chrome, footers, admin sidebar"], ["--ih-accent", "Signal blue · primary action, links"],
    ["--ih-steel", "Steel · secondary data, icons on navy"], ["--ih-accent-soft", "Tint · selected rows, notes"],
    ["--ih-ink", "Blue-black · body text"], ["--ih-muted", "Secondary text"], ["--ih-bg", "Paper · page ground"], ["--ih-border", "Hairline rules"]];
  return <AdminShell active="Design tokens" title="Design tokens" sub="Single source of truth for the storefront and this console"
    actions={<><Btn kind="outline" size="sm" icon={I.download}>Export JSON</Btn><Btn kind="primary" size="sm">Publish tokens</Btn></>}>
    <div className="ih-note" style={{ marginBottom: 18 }}>
      Changing a token here re-themes every surface on the next deploy. Signal blue is rationed by convention: one per screen.
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>
      <div className="ih-card">
        <div style={{ padding: "14px 18px", borderBottom: "1px solid var(--ih-border)" }}><h3 style={{ fontSize: 14 }}>Colour</h3></div>
        <div style={{ padding: 8 }}>
          {tokens.map(([t, d]) => <div key={t} style={{ display: "flex", gap: 14, alignItems: "center", padding: "10px 10px" }}>
            <span style={{ width: 34, height: 34, borderRadius: 6, background: `var(${t})`, border: "1px solid var(--ih-border)", flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="mono" style={{ fontSize: 12 }}>{t}</div>
              <div style={{ fontSize: 11.5, color: "var(--ih-muted)", marginTop: 2 }}>{d}</div>
            </div>
            <Btn kind="ghost" size="sm">Edit</Btn>
          </div>)}
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <div className="ih-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, marginBottom: 16 }}>Typography</h3>
          <Spec rows={[["Display", "Instrument Serif · italic for emphasis"], ["Body & UI", "Geist 400/500"], ["Data", "JetBrains Mono, tabular figures"],
            ["Display scale", "60 / 46 / 34 / 26"], ["Body", "16 lede · 14 base · 12.5 small"], ["Eyebrow", "10.5px, 0.13em, uppercase"]]} />
        </div>
        <div className="ih-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, marginBottom: 16 }}>Geometry & motion</h3>
          <Spec rows={[["Radius", "4 / 6 / 10 / 16 px"], ["Border", "1px hairline, no shadow by default"], ["Grid", "48px page gutter"],
            ["Density", "1.0 regular · 0.88 compact"], ["Transition", "150ms, background & border only"]]} />
        </div>
        <div className="ih-card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, marginBottom: 14 }}>Live preview</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <Btn kind="primary" size="sm">Primary</Btn><Btn kind="navy" size="sm">Navy</Btn><Btn kind="outline" size="sm">Outline</Btn>
            <Badge kind="accent">Accent</Badge><Badge kind="success" dot>Live</Badge><Badge kind="steel">Steel</Badge>
          </div>
        </div>
      </div>
    </div>
  </AdminShell>;
}
Object.assign(window, { AdminUsers, AdminSettings, AdminInfra, AdminDesignTokens });
