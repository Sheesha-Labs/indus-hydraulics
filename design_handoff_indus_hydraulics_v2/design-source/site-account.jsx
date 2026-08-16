/* eslint-disable */
// Account surfaces — auth, dashboard, quotes, saved list.

function AuthShell({ title, sub, children, foot, aside }) {
  return <><UtilityBar /><SiteNav active="Account" />
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 760 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "56px 48px" }}>
        <div style={{ width: 400 }}>
          <h1 className="serif" style={{ fontSize: 34 }}>{title}</h1>
          <p style={{ fontSize: 14, color: "var(--ih-muted)", marginTop: 10, lineHeight: 1.55 }}>{sub}</p>
          <div style={{ marginTop: 30, display: "flex", flexDirection: "column", gap: 16 }}>{children}</div>
          <div style={{ marginTop: 22, fontSize: 13, color: "var(--ih-muted)" }}>{foot}</div>
        </div>
      </div>
      <div style={{ background: "var(--ih-surface)", borderLeft: "1px solid var(--ih-border)", padding: "56px 48px", display: "flex", alignItems: "center" }}>
        <div style={{ maxWidth: 420 }}>{aside}</div>
      </div>
    </div>
    <SiteFooter /></>;
}

const AUTH_ASIDE = <>
  <Eyebrow>An account is optional</Eyebrow>
  <h2 className="serif" style={{ fontSize: 28, marginTop: 14, lineHeight: 1.2 }}>You can quote without one. It just saves re-typing.</h2>
  <div style={{ marginTop: 26, display: "flex", flexDirection: "column", gap: 16 }}>
    {[[I.doc, "Quote history", "Every RFQ, its status and the engineer who handled it."],
      [I.bookmark, "Saved lists", "Standing parts lists per machine or per site."],
      [I.truck, "Dispatch tracking", "Certificates and packing lists against each order."]].map(([ic, t, d], i) =>
      <div key={i} style={{ display: "flex", gap: 12 }}>
        <span style={{ color: "var(--ih-steel)", display: "flex", marginTop: 2 }}>{ic}</span>
        <div><div style={{ fontSize: 14, fontWeight: 500 }}>{t}</div><div style={{ fontSize: 12.5, color: "var(--ih-muted)", marginTop: 3, lineHeight: 1.5 }}>{d}</div></div>
      </div>)}
  </div>
</>;

function SignInPage() {
  return <AuthShell title="Sign in" sub="Pick up a quote where you left it."
    foot={<>No account yet? <a style={{ color: "var(--ih-accent)", fontWeight: 500 }}>Create one</a></>} aside={AUTH_ASIDE}>
    <Field label="Work email"><input className="ih-field" placeholder="you@company.com" /></Field>
    <Field label="Password"><input className="ih-field" type="password" defaultValue="••••••••••" /></Field>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "var(--ih-ink-2)" }}>
        <span className="ih-check is-on"><Icn size={11} sw={2.6} d={<path d="m5 12 5 5L20 7" />} /></span>Keep me signed in</label>
      <a style={{ fontSize: 13, color: "var(--ih-accent)" }}>Forgot password?</a>
    </div>
    <Btn kind="primary" size="lg" style={{ width: "100%" }}>Sign in</Btn>
  </AuthShell>;
}

function SignUpPage() {
  return <AuthShell title="Create an account" sub="Two minutes. We only ask for what a quotation needs."
    foot={<>Already registered? <a style={{ color: "var(--ih-accent)", fontWeight: 500 }}>Sign in</a></>} aside={AUTH_ASIDE}>
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
      <Field label="First name"><input className="ih-field" /></Field>
      <Field label="Last name"><input className="ih-field" /></Field>
    </div>
    <Field label="Work email"><input className="ih-field" placeholder="you@company.com" /></Field>
    <Field label="Company"><input className="ih-field" /></Field>
    <Field label="Country" hint="Sets duty, packing and default incoterm"><select className="ih-field"><option>India</option></select></Field>
    <Field label="Password" hint="At least 10 characters"><input className="ih-field" type="password" /></Field>
    <Btn kind="primary" size="lg" style={{ width: "100%" }}>Create account</Btn>
  </AuthShell>;
}

function ForgotPage() {
  return <AuthShell title="Reset your password" sub="Enter the email you registered with and we'll send a reset link. It expires in one hour."
    foot={<><a style={{ color: "var(--ih-accent)", fontWeight: 500 }}>← Back to sign in</a></>} aside={AUTH_ASIDE}>
    <Field label="Work email"><input className="ih-field" placeholder="you@company.com" /></Field>
    <Btn kind="primary" size="lg" style={{ width: "100%" }}>Send reset link</Btn>
    <div className="ih-note">If the address is registered you'll get the link within a minute. Check spam before contacting the desk.</div>
  </AuthShell>;
}

function AccountNav({ active }) {
  const items = ["Overview", "My quotes", "Saved lists", "Orders & dispatch", "Company profile", "Users", "Settings"];
  return <aside style={{ width: 210, flexShrink: 0 }}>
    <div className="eyebrow" style={{ marginBottom: 14 }}>Account</div>
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {items.map(i => <a key={i} style={{ padding: "8px 10px", borderRadius: 6, fontSize: 13.5,
        background: i === active ? "var(--ih-accent-soft)" : "transparent",
        color: i === active ? "var(--ih-accent)" : "var(--ih-ink-2)", fontWeight: i === active ? 500 : 400 }}>{i}</a>)}
    </div>
  </aside>;
}

function AccountDashboard() {
  return <><UtilityBar /><SiteNav active="Account" />
    <div style={{ padding: "36px 48px 64px", display: "flex", gap: 44, alignItems: "flex-start" }}>
      <AccountNav active="Overview" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 26 }}>
          <div><h1 className="serif" style={{ fontSize: 34 }}>Good morning, Jane.</h1>
            <p style={{ fontSize: 13.5, color: "var(--ih-muted)", marginTop: 8 }}>Mehta Engineering Works · Pune · account #IH-2291</p></div>
          <Btn kind="primary" icon={I.doc}>Start a new quote</Btn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          <Stat label="Open quotes" value="3" /><Stat label="Awaiting your approval" value="1" />
          <Stat label="In dispatch" value="2" /><Stat label="Saved lists" value="5" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, marginTop: 20 }}>
          <div className="ih-card">
            <div style={{ padding: "16px 18px", borderBottom: "1px solid var(--ih-border)", display: "flex", alignItems: "center" }}>
              <h3 style={{ fontSize: 14.5 }}>Recent quotes</h3><a style={{ marginLeft: "auto", fontSize: 12.5, color: "var(--ih-accent)" }}>View all</a>
            </div>
            <table className="ih-table">
              <thead><tr><th>Ref</th><th>Scope</th><th>Raised</th><th>Status</th></tr></thead>
              <tbody>{[["RFQ-4818", "Hoses · 26 lines", "14 Aug", "Quoted", "accent"], ["RFQ-4802", "Cylinder rebuild · 2 units", "09 Aug", "In workshop", "steel"],
                ["RFQ-4780", "Valve bank · 11 lines", "28 Jul", "Dispatched", "success"], ["RFQ-4771", "Accumulators · 4", "21 Jul", "Closed", "default"]].map(([r, s, d, st, k]) =>
                <tr key={r}><td className="num" style={{ color: "var(--ih-accent)", fontSize: 12 }}>{r}</td><td>{s}</td>
                  <td className="num" style={{ color: "var(--ih-muted)", fontSize: 12.5 }}>{d}</td><td><Badge kind={k}>{st}</Badge></td></tr>)}
              </tbody>
            </table>
          </div>
          <div className="ih-card" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 14.5, marginBottom: 14 }}>Saved lists</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[["Press line 2 — consumables", 14], ["Excavator fleet seals", 9], ["Mill stand spares", 22], ["Workshop standing order", 6], ["Sour-gas service kit", 11]].map(([n, c]) =>
                <a key={n} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                  <span>{n}</span><span className="mono" style={{ fontSize: 11, color: "var(--ih-muted)" }}>{c} lines</span></a>)}
            </div>
          </div>
        </div>
      </div>
    </div>
    <SiteFooter /></>;
}

function AccountQuotes() {
  const rows = [["RFQ-4818", "Hoses & fittings · 26 lines", "14 Aug 2026", "Quoted — awaiting your approval", "accent", "A. Nasser"],
    ["RFQ-4802", "Cylinder rebuild · 2 units", "09 Aug 2026", "In workshop", "steel", "S. Pillai"],
    ["RFQ-4795", "Pump A10VSO 71 · 2 units", "04 Aug 2026", "Quoted", "accent", "R. Kulkarni"],
    ["RFQ-4780", "Valve bank · 11 lines", "28 Jul 2026", "Dispatched", "success", "R. Kulkarni"],
    ["RFQ-4771", "Accumulators · 4 units", "21 Jul 2026", "Closed — order complete", "default", "A. Nasser"],
    ["RFQ-4744", "Seal kits · 18 lines", "02 Jul 2026", "Closed — not proceeded", "default", "S. Pillai"]];
  return <><UtilityBar /><SiteNav active="Account" />
    <div style={{ padding: "36px 48px 64px", display: "flex", gap: 44, alignItems: "flex-start" }}>
      <AccountNav active="My quotes" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
          <div><h1 className="serif" style={{ fontSize: 34 }}>My quotes</h1>
            <p style={{ fontSize: 13.5, color: "var(--ih-muted)", marginTop: 8 }}>Six requests in the last 90 days</p></div>
          <div style={{ display: "flex", gap: 8 }}><Btn kind="outline" size="sm" icon={I.download}>Export</Btn><Btn kind="primary" size="sm" icon={I.plus}>New quote</Btn></div>
        </div>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          {["All", "Awaiting you", "In progress", "Dispatched", "Closed"].map((t, i) => <Chip key={t} on={i === 0}>{t}</Chip>)}
        </div>
        <div className="ih-card">
          <table className="ih-table">
            <thead><tr><th>Reference</th><th>Scope</th><th>Raised</th><th>Status</th><th>Handled by</th><th /></tr></thead>
            <tbody>{rows.map(([r, s, d, st, k, w]) => <tr key={r}>
              <td className="num" style={{ color: "var(--ih-accent)", fontSize: 12 }}>{r}</td>
              <td style={{ fontWeight: 500 }}>{s}</td>
              <td className="num" style={{ fontSize: 12.5, color: "var(--ih-muted)" }}>{d}</td>
              <td><Badge kind={k} dot={k !== "default"}>{st}</Badge></td>
              <td style={{ fontSize: 12.5, color: "var(--ih-muted)" }}>{w}</td>
              <td style={{ textAlign: "right" }}><Btn kind="outline" size="sm">Open</Btn></td>
            </tr>)}</tbody>
          </table>
        </div>
      </div>
    </div>
    <SiteFooter /></>;
}

function SavedListPage() {
  return <><UtilityBar /><SiteNav active="Account" />
    <div style={{ padding: "36px 48px 64px", display: "flex", gap: 44, alignItems: "flex-start" }}>
      <AccountNav active="Saved lists" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
          <div><Crumb items={["Saved lists", "Press line 2 — consumables"]} />
            <h1 className="serif" style={{ fontSize: 34, marginTop: 10 }}>Press line 2 — consumables</h1>
            <p style={{ fontSize: 13.5, color: "var(--ih-muted)", marginTop: 8 }}>14 lines · last updated 11 Aug 2026 by Jane Mehta</p></div>
          <div style={{ display: "flex", gap: 8 }}><Btn kind="outline" icon={I.download}>Export CSV</Btn><Btn kind="primary" icon={I.doc}>Quote this list</Btn></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
          {[...PRODUCTS, ...PRODUCTS.slice(0, 4)].map((p, i) => <ProdCard key={i} p={p} />)}
        </div>
      </div>
    </div>
    <SiteFooter /></>;
}
Object.assign(window, { SignInPage, SignUpPage, ForgotPage, AccountDashboard, AccountQuotes, SavedListPage, AccountNav });
