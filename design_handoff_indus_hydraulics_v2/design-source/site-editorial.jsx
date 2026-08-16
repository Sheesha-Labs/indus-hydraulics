/* eslint-disable */
// Editorial & company — about, insights, post, contact, industry.

function AboutPage() {
  return <><UtilityBar /><SiteNav active="About" />
    <div style={{ background: "var(--ih-surface)", borderBottom: "1px solid var(--ih-border)", padding: "56px 48px 52px" }}>
      <Eyebrow>About Indus · established 2003</Eyebrow>
      <h1 className="serif" style={{ fontSize: 52, marginTop: 18, maxWidth: 880, lineHeight: 1.04 }}>
        Twenty-three years of being the call people make when the <em>line is down</em>.
      </h1>
      <p className="lede" style={{ marginTop: 18, maxWidth: 660 }}>
        Indus started as a two-bench workshop in Mumbai rebuilding vane pumps for the local textile mills. The catalogue came later,
        and only because customers kept asking us to source the parts we were fitting.
      </p>
    </div>
    <section className="ih-sec">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
        {[["2003", "Founded", "Two benches, Andheri East"], ["2011", "Houston desk", "Oilfield and drilling accounts"],
          ["2018", "Dubai warehouse", "Bonded stock for GCC delivery"], ["2026", "Today", "1,870 SKUs, 47 countries"]].map(([y, t, d]) =>
          <div key={y} style={{ borderTop: "2px solid var(--ih-accent)", paddingTop: 16 }}>
            <div className="mono" style={{ fontSize: 22, letterSpacing: "-0.02em" }}>{y}</div>
            <div style={{ fontSize: 14, fontWeight: 500, marginTop: 8 }}>{t}</div>
            <div style={{ fontSize: 12.5, color: "var(--ih-muted)", marginTop: 4 }}>{d}</div>
          </div>)}
      </div>
    </section>
    <section className="ih-sec" style={{ paddingTop: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
        <Img style={{ aspectRatio: "4/3", borderRadius: 12 }} label="Mumbai workshop floor · 1200×900" />
        <div>
          <Eyebrow>How we work</Eyebrow>
          <h2 className="serif" style={{ fontSize: 34, marginTop: 14, lineHeight: 1.15 }}>Findings before quotations.</h2>
          <p style={{ fontSize: 15, lineHeight: 1.7, marginTop: 16, color: "var(--ih-ink-2)" }}>
            On a rebuild we strip and measure before we price anything, then issue a findings report with photographs and a
            repair-or-replace call on every component. It takes an extra day and removes three rounds of email.
          </p>
          <p style={{ fontSize: 15, lineHeight: 1.7, marginTop: 14, color: "var(--ih-ink-2)" }}>
            On supply, every listing carries a datasheet, a performance curve and a dimensional drawing. If a part is obsolete we
            document the interchange rather than quietly substituting it.
          </p>
        </div>
      </div>
    </section>
    <section className="ih-sec" style={{ paddingTop: 0 }}>
      <SecHead eyebrow="Certification & compliance" title="Audited, and happy to prove it." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {[["ISO 9001:2015", "Quality management, recertified 2025"], ["ISO 4413", "Hydraulic fluid power safety"],
          ["PED 2014/68/EU", "Pressure equipment, accumulator work"], ["Export compliance", "Dual-use screening on every order"]].map(([t, d]) =>
          <div key={t} className="ih-card" style={{ padding: 20 }}>
            <span style={{ color: "var(--ih-steel)", display: "flex" }}>{I.shield}</span>
            <div style={{ fontSize: 14.5, fontWeight: 500, marginTop: 12 }}>{t}</div>
            <div style={{ fontSize: 12.5, color: "var(--ih-muted)", marginTop: 6, lineHeight: 1.5 }}>{d}</div>
          </div>)}
      </div>
    </section>
    <section className="ih-sec" style={{ paddingTop: 0 }}>
      <SecHead eyebrow="The desk" title="Who picks up the phone." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
        {[["R. Kulkarni", "Applications engineer", "Pumps, press circuits"], ["S. Pillai", "Workshop lead", "Rebuilds, testing"],
          ["A. Nasser", "Field engineer, UAE", "Commissioning, oilfield"], ["M. Fernandes", "Procurement", "Sourcing, obsolete parts"]].map(([n, r, s]) =>
          <div key={n}><Img style={{ aspectRatio: "1/1", borderRadius: 10 }} label={n.toLowerCase()} />
            <div style={{ fontSize: 15, fontWeight: 500, marginTop: 14 }}>{n}</div>
            <div style={{ fontSize: 12.5, color: "var(--ih-accent)", marginTop: 3 }}>{r}</div>
            <div style={{ fontSize: 12.5, color: "var(--ih-muted)", marginTop: 3 }}>{s}</div></div>)}
      </div>
    </section>
    <SiteFooter /></>;
}

const POSTS = [
  ["Sizing guide", "How to size an accumulator without guessing at pre-charge", "9 min", "The rule of thumb everyone uses is wrong by about 15% on most press circuits. Here's the arithmetic."],
  ["Teardown", "Why your A10VSO is losing pressure at temperature", "12 min", "Four failure modes, photographed, with the measurement that distinguishes each one."],
  ["Field note", "Cetop interchange: reading a valve you've never seen before", "6 min", "Port pattern, spool symbol, solenoid voltage. Three things and you can order a replacement."],
  ["Sizing guide", "Hose whip: why 4SH is not always the answer", "7 min", "Burst rating is the easy part. Bend radius and routing kill more assemblies than pressure does."],
  ["Teardown", "Seal failure in sour-gas service, in pictures", "10 min", "What NBR looks like after six weeks of H₂S, next to FKM from the same circuit."],
  ["Field note", "Flushing a new circuit properly, and why nobody does", "8 min", "Particle counts before and after, on a rig that thought it was clean."],
];

function BlogPage() {
  const [lead, ...rest] = POSTS;
  return <><UtilityBar /><SiteNav active="Blog" />
    <div style={{ background: "var(--ih-surface)", borderBottom: "1px solid var(--ih-border)", padding: "52px 48px 44px" }}>
      <Eyebrow>Insights · from the workshop</Eyebrow>
      <h1 className="serif" style={{ fontSize: 46, marginTop: 16, maxWidth: 760, lineHeight: 1.06 }}>Field notes, sizing guides and component teardowns.</h1>
      <p className="lede" style={{ marginTop: 14, maxWidth: 600 }}>Written by the people on the bench. No press releases.</p>
      <div style={{ display: "flex", gap: 8, marginTop: 28 }}>
        {["All", "Sizing guide", "Teardown", "Field note", "Standards"].map((t, i) => <Chip key={t} on={i === 0}>{t}</Chip>)}
      </div>
    </div>
    <section className="ih-sec">
      <a className="ih-card" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", marginBottom: 28 }}>
        <Img style={{ minHeight: 340 }} label="accumulator pre-charge rig · 1200×800" />
        <div style={{ padding: 40, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Badge kind="accent">{lead[0]}</Badge>
            <span className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted-2)" }}>{lead[2]} read · 12 Aug 2026</span></div>
          <h2 className="serif" style={{ fontSize: 32, lineHeight: 1.15 }}>{lead[1]}</h2>
          <p style={{ fontSize: 14.5, color: "var(--ih-muted)", lineHeight: 1.6 }}>{lead[3]}</p>
          <span style={{ color: "var(--ih-accent)", fontWeight: 500, fontSize: 13.5, display: "inline-flex", gap: 6, alignItems: "center", marginTop: 4 }}>Read the guide {I.arrowR}</span>
        </div>
      </a>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
        {rest.map(([k, t, r, d]) => <a key={t}>
          <Img style={{ aspectRatio: "16/10", borderRadius: 8 }} label={k.toLowerCase()} />
          <div style={{ paddingTop: 14 }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}><Badge kind="steel">{k}</Badge>
              <span className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted-2)" }}>{r} read</span></div>
            <h3 style={{ fontSize: 18, marginTop: 11, lineHeight: 1.3 }}>{t}</h3>
            <p style={{ fontSize: 13, color: "var(--ih-muted)", marginTop: 8, lineHeight: 1.55 }}>{d}</p>
          </div>
        </a>)}
      </div>
    </section>
    <SiteFooter /></>;
}

function BlogPostPage() {
  return <><UtilityBar /><SiteNav active="Blog" />
    <div style={{ padding: "28px 48px 0" }}><Crumb items={["Insights", "Sizing guide", "Accumulator pre-charge"]} /></div>
    <article style={{ padding: "24px 48px 64px", display: "grid", gridTemplateColumns: "200px minmax(0,720px) 1fr", gap: 48 }}>
      <div>
        <div className="eyebrow" style={{ marginBottom: 12 }}>Contents</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 12.5 }}>
          {["The rule of thumb", "Where it breaks", "Doing the arithmetic", "A worked example", "Checking on the rig"].map((t, i) =>
            <a key={t} style={{ color: i === 0 ? "var(--ih-accent)" : "var(--ih-muted)", borderLeft: `2px solid ${i === 0 ? "var(--ih-accent)" : "var(--ih-border)"}`, paddingLeft: 10 }}>{t}</a>)}
        </div>
      </div>
      <div>
        <Badge kind="accent">Sizing guide</Badge>
        <h1 className="serif" style={{ fontSize: 42, marginTop: 16, lineHeight: 1.1 }}>How to size an accumulator without guessing at pre-charge</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 20, paddingBottom: 24, borderBottom: "1px solid var(--ih-border)" }}>
          <Avatar initials="RK" size={36} />
          <div><div style={{ fontSize: 13.5, fontWeight: 500 }}>R. Kulkarni</div>
            <div className="mono" style={{ fontSize: 11, color: "var(--ih-muted)" }}>APPLICATIONS ENGINEER · 12 AUG 2026 · 9 MIN</div></div>
        </div>
        <p style={{ fontSize: 18, lineHeight: 1.65, marginTop: 28, color: "var(--ih-ink-2)" }}>
          Most people set pre-charge at 90% of minimum system pressure because that is what the poster on the workshop wall says.
          On a press circuit with a fast decompression stroke that number is optimistic by about 15%, and the accumulator spends its
          life bottoming out against the poppet.
        </p>
        <p style={{ fontSize: 15.5, lineHeight: 1.75, marginTop: 20 }}>
          The poster is not wrong so much as incomplete. It assumes isothermal expansion, which is a reasonable model when the gas
          has time to exchange heat with the shell. A decompression stroke that completes in under a second is closer to adiabatic,
          and the polytropic exponent moves from 1.0 to about 1.4.
        </p>
        <Img style={{ aspectRatio: "16/9", borderRadius: 10, margin: "32px 0" }} label="pressure/volume curves, isothermal vs adiabatic · 1200×675" />
        <p style={{ fontSize: 15.5, lineHeight: 1.75 }}>
          In practice that means sizing from the adiabatic case and then confirming on the rig. The arithmetic below takes about
          five minutes and has never once given us a unit that bottomed out in service.
        </p>
        <div className="ih-card" style={{ padding: 24, margin: "28px 0", background: "var(--ih-surface-2)" }}>
          <div className="eyebrow">Worked example · 250T press</div>
          <div style={{ marginTop: 14 }}><Spec rows={[["Max system pressure", "210 bar"], ["Min working pressure", "160 bar"], ["Required delivery", "3.2 L"], ["Stroke time", "0.6 s → adiabatic, n = 1.4"], ["Pre-charge (calculated)", "134 bar"], ["Selected unit", "SB330-10A1 · 10 L"]]} /></div>
        </div>
        <p style={{ fontSize: 15.5, lineHeight: 1.75 }}>
          Set the pre-charge cold, with the circuit vented, and check it again after the machine has run for an hour. Nitrogen
          migrates and a bladder that reads correct at 20 °C will read high at operating temperature.
        </p>
      </div>
      <div>
        <div className="ih-card" style={{ padding: 20, position: "sticky", top: 20 }}>
          <Eyebrow>Parts in this article</Eyebrow>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 14 }}>
            {PRODUCTS.slice(3, 6).map(p => <a key={p.sku} style={{ display: "flex", gap: 11, alignItems: "center" }}>
              <Img style={{ width: 46, height: 46, borderRadius: 5, flexShrink: 0 }} label="" />
              <div style={{ minWidth: 0 }}><div style={{ fontSize: 12.5, fontWeight: 500, lineHeight: 1.3 }}>{p.t}</div>
                <div className="mono" style={{ fontSize: 10, color: "var(--ih-muted)", marginTop: 3 }}>{p.sku}</div></div>
            </a>)}
          </div>
          <Btn kind="outline" size="sm" style={{ width: "100%", marginTop: 16 }}>Quote these parts</Btn>
        </div>
      </div>
    </article>
    <SiteFooter /></>;
}

function ContactPage() {
  const offices = [["Mumbai", "Head office & workshop", "Unit 14, MIDC Andheri East, Mumbai 400093", "+971 52 2477942", "09:00–19:00 IST"],
    ["Dubai", "Bonded warehouse & GCC desk", "Jebel Ali Free Zone, South 4, Dubai", "+971 4 887 3300", "08:00–18:00 GST"],
    ["Houston", "Oilfield accounts", "5250 Brittmoore Rd, Houston TX 77041", "+1 713 555 0180", "08:00–17:00 CST"]];
  return <><UtilityBar /><SiteNav active="Contact" />
    <div style={{ background: "var(--ih-surface)", borderBottom: "1px solid var(--ih-border)", padding: "52px 48px 44px" }}>
      <Eyebrow>Contact</Eyebrow>
      <h1 className="serif" style={{ fontSize: 46, marginTop: 16, maxWidth: 700, lineHeight: 1.06 }}>Three desks, one parts team.</h1>
      <p className="lede" style={{ marginTop: 14, maxWidth: 560 }}>Whichever office you reach, the same engineers see the request.</p>
    </div>
    <section className="ih-sec">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
        {offices.map(([c, r, a, p, h]) => <div key={c} className="ih-card" style={{ padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <h3 style={{ fontSize: 22 }}>{c}</h3><Badge kind="steel">{h}</Badge>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ih-accent)", marginTop: 6 }}>{r}</div>
          <p style={{ fontSize: 13, color: "var(--ih-muted)", marginTop: 14, lineHeight: 1.6 }}>{a}</p>
          <div className="mono" style={{ fontSize: 14, marginTop: 14 }}>{p}</div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Btn kind="outline" size="sm" icon={I.pin} style={{ flex: 1 }}>Directions</Btn>
            <Btn kind="outline" size="sm" icon={I.mail} style={{ flex: 1 }}>Email</Btn>
          </div>
        </div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginTop: 24 }}>
        <Img style={{ aspectRatio: "16/10", borderRadius: 12 }} label="map — Mumbai, Dubai, Houston" />
        <div className="ih-card" style={{ padding: 28 }}>
          <h3 style={{ fontSize: 19 }}>Send a message</h3>
          <p style={{ fontSize: 13, color: "var(--ih-muted)", marginTop: 8 }}>For a parts enquiry, the RFQ form gets you a faster answer.</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 20 }}>
            <Field label="Name"><input className="ih-field" /></Field>
            <Field label="Company"><input className="ih-field" /></Field>
            <Field label="Email" style={{ gridColumn: "span 2" }}><input className="ih-field" /></Field>
            <Field label="Message" style={{ gridColumn: "span 2" }}><textarea className="ih-field" rows={4} /></Field>
          </div>
          <Btn kind="primary" style={{ marginTop: 18 }}>Send message</Btn>
        </div>
      </div>
    </section>
    <SiteFooter /></>;
}

function IndustryPage() {
  return <><UtilityBar /><SiteNav active="Industries" />
    <div style={{ position: "relative", minHeight: 420, display: "flex", alignItems: "flex-end" }}>
      <Img navy style={{ position: "absolute", inset: 0 }} label="offshore platform deck machinery · 1920×600" />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, oklch(0.24 0.05 252 / 0.95) 25%, oklch(0.24 0.05 252 / 0.4))" }} />
      <div style={{ position: "relative", padding: "0 48px 48px" }}>
        <Eyebrow style={{ color: "var(--ih-steel)" }}>Industries · oil & gas</Eyebrow>
        <h1 className="serif" style={{ fontSize: 52, color: "#fff", marginTop: 16, maxWidth: 820, lineHeight: 1.05 }}>
          Wellsite hydraulics, where a leak is a <em>safety case</em>.
        </h1>
        <p style={{ fontSize: 16, color: "oklch(0.85 0.02 250)", marginTop: 16, maxWidth: 620, lineHeight: 1.6 }}>
          Sour service, salt spray and equipment that cannot come off location. We stock the elastomers and build the assemblies that survive it.
        </p>
      </div>
    </div>
    <section className="ih-sec">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>
        <div>
          <Eyebrow>What breaks, and why</Eyebrow>
          <div style={{ marginTop: 20 }}>
            {[["H₂S attack on elastomers", "NBR hardens and cracks in weeks. Every seal, hose liner and O-ring in sour service has to be FKM or better."],
              ["Salt and washdown corrosion", "Rod chrome pits, then the wiper tears. Nickel-chrome or ceramic coating pays for itself offshore."],
              ["Contamination from the mud system", "Particle counts that would be a scandal onshore are normal here. Filtration is sized for it or the pump pays."]].map(([t, d]) =>
              <div key={t} style={{ paddingBottom: 22, marginBottom: 22, borderBottom: "1px solid var(--ih-border)" }}>
                <div style={{ fontSize: 16, fontWeight: 500 }}>{t}</div>
                <p style={{ fontSize: 13.5, color: "var(--ih-muted)", marginTop: 7, lineHeight: 1.6 }}>{d}</p>
              </div>)}
          </div>
        </div>
        <div>
          <Eyebrow>Stocked for this sector</Eyebrow>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 20 }}>
            {PRODUCTS.slice(0, 4).map(p => <ProdCard key={p.sku} p={p} compact />)}
          </div>
          <Btn kind="outline" style={{ marginTop: 18 }} iconR={I.arrowR}>See all oilfield lines</Btn>
        </div>
      </div>
    </section>
    <section className="ih-sec" style={{ paddingTop: 0 }}>
      <SecHead eyebrow="Related work" title="Jobs we've done in this sector."
        action={<Btn kind="ghost" iconR={I.arrowR}>All case studies</Btn>} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
        {CASES.slice(0, 3).map(c => <a key={c.no} className="ih-card">
          <Img style={{ aspectRatio: "16/10" }} label={c.img} />
          <div style={{ padding: 20 }}>
            <Badge kind="steel">{c.cat}</Badge>
            <h3 style={{ fontSize: 17, marginTop: 11, lineHeight: 1.3 }}>{c.t}</h3>
            <div style={{ fontSize: 13, color: "var(--ih-accent)", fontWeight: 500, marginTop: 10 }}>{c.r}</div>
          </div>
        </a>)}
      </div>
    </section>
    <SiteFooter /></>;
}
Object.assign(window, { AboutPage, BlogPage, BlogPostPage, ContactPage, IndustryPage, POSTS });
