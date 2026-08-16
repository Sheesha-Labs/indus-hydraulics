/* eslint-disable */
// Foundation board — the design language itself.

function Swatch({ name, v, hex, ink }) {
  return <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <div style={{ height: 68, borderRadius: 8, background: `var(${v})`, border: "1px solid var(--ih-border)" }} />
    <div>
      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{name}</div>
      <div className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted)", marginTop: 3 }}>{v}</div>
      {hex && <div className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted-2)" }}>{hex}</div>}
    </div>
  </div>;
}
function Block({ title, note, children, span }) {
  return <section style={{ gridColumn: span ? `span ${span}` : undefined }}>
    <div style={{ display: "flex", alignItems: "baseline", gap: 12, paddingBottom: 12, marginBottom: 20, borderBottom: "1px solid var(--ih-border)" }}>
      <h3 style={{ fontSize: 15 }}>{title}</h3>
      {note && <span style={{ fontSize: 12, color: "var(--ih-muted)" }}>{note}</span>}
    </div>
    {children}
  </section>;
}

function FoundationBoard() {
  return <div style={{ padding: "56px 56px 64px", background: "var(--ih-bg)", minHeight: "100%" }}>
    <div style={{ maxWidth: 1180 }}>
      <Eyebrow>Design language · v2 · Indus × Bazar grammar</Eyebrow>
      <h1 className="serif" style={{ fontSize: 52, marginTop: 16, lineHeight: 1.05 }}>
        Quiet paper, one blue that <em>means something</em>, and data set in mono.
      </h1>
      <p className="lede" style={{ marginTop: 18, maxWidth: 720 }}>
        The Bazar system's restraint carried into an industrial catalogue: hairline rules instead of shadows,
        an editorial serif reserved for statements, and a single saturated blue that only ever marks the next action.
        Everything else is a shade of the same blue, desaturated until it reads as paper or ink.
      </p>
    </div>

    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, marginTop: 56 }}>
      <Block title="The blue family" note="client direction — shades of blue, no orange">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
          <Swatch name="Navy" v="--ih-navy" hex="deep · chrome, footers" />
          <Swatch name="Signal" v="--ih-accent" hex="primary action, links" />
          <Swatch name="Steel" v="--ih-steel" hex="secondary data" />
          <Swatch name="Soft" v="--ih-accent-soft" hex="tints, selected rows" />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginTop: 22 }}>
          <Swatch name="Ink" v="--ih-ink" hex="blue-black text" />
          <Swatch name="Muted" v="--ih-muted" hex="secondary text" />
          <Swatch name="Paper" v="--ih-bg" hex="page ground" />
          <Swatch name="Border" v="--ih-border" hex="1px rules" />
        </div>
        <div className="ih-note" style={{ marginTop: 22 }}>
          Signal blue is rationed. If two things on a screen are signal blue, one of them is wrong.
        </div>
      </Block>

      <Block title="Type" note="Instrument Serif · Geist · JetBrains Mono">
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ display: "flex", gap: 20, alignItems: "baseline", borderBottom: "1px solid var(--ih-border)", paddingBottom: 16 }}>
            <span className="mono" style={{ fontSize: 10, color: "var(--ih-muted)", width: 96, flexShrink: 0 }}>DISPLAY 52/1.05</span>
            <span className="serif" style={{ fontSize: 36 }}>Pressure-tested to <em>350 bar</em></span>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "baseline", borderBottom: "1px solid var(--ih-border)", paddingBottom: 16 }}>
            <span className="mono" style={{ fontSize: 10, color: "var(--ih-muted)", width: 96, flexShrink: 0 }}>HEADING 30/1.12</span>
            <span style={{ fontSize: 26, fontWeight: 500, letterSpacing: "-0.02em" }}>The catalogue, organised the way engineers think</span>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "baseline", borderBottom: "1px solid var(--ih-border)", paddingBottom: 16 }}>
            <span className="mono" style={{ fontSize: 10, color: "var(--ih-muted)", width: 96, flexShrink: 0 }}>BODY 14/1.45</span>
            <span style={{ fontSize: 14, color: "var(--ih-ink-2)" }}>Gear, vane, piston and radial pumps — fixed and variable displacement, from 0.5 cc/rev mini units up to 1000 bar systems.</span>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "baseline", borderBottom: "1px solid var(--ih-border)", paddingBottom: 16 }}>
            <span className="mono" style={{ fontSize: 10, color: "var(--ih-muted)", width: 96, flexShrink: 0 }}>DATA 12.5</span>
            <span className="mono" style={{ fontSize: 12.5 }}>IH-AP71-D-R-V · 350 bar · 71 cc/rev · ISO 6020/2</span>
          </div>
          <div style={{ display: "flex", gap: 20, alignItems: "baseline" }}>
            <span className="mono" style={{ fontSize: 10, color: "var(--ih-muted)", width: 96, flexShrink: 0 }}>EYEBROW 10.5</span>
            <span className="eyebrow">Featured category · 06 groups</span>
          </div>
        </div>
      </Block>

      <Block title="Controls">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 22 }}>
          <Btn kind="primary">Request a quote</Btn>
          <Btn kind="navy">Download datasheet</Btn>
          <Btn kind="outline">Add to compare</Btn>
          <Btn kind="ghost">Cancel</Btn>
          <Btn kind="primary" size="sm">Small</Btn>
          <Btn kind="outline" size="sm">Small</Btn>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 22 }}>
          <Field label="Part number or description"><input className="ih-field" placeholder="e.g. A10VSO 71" /></Field>
          <Field label="Brand" hint="14 authorised brands"><select className="ih-field"><option>Any brand</option></select></Field>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Chip on>In stock</Chip><Chip>350 bar</Chip><Chip>Cetop 3</Chip><Chip>Bosch Rexroth</Chip><Chip ghost>Clear all</Chip>
        </div>
      </Block>

      <Block title="Status & data">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 22 }}>
          <Badge kind="success" dot>In stock</Badge><Badge kind="warn" dot>2–3 week lead</Badge>
          <Badge kind="danger" dot>On backorder</Badge><Badge kind="accent">Authorised</Badge>
          <Badge kind="navy">RFQ #4821</Badge><Badge kind="steel">Rebuildable</Badge>
          <Badge kind="square">NEW</Badge>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 22 }}>
          <Stat label="Open RFQs" value="24" delta="+6 this week" />
          <Stat label="Avg. response" value="3.4h" delta="−0.8h" />
          <Stat label="Fill rate" value="94%" delta="−2 pts" down />
        </div>
        <div className="ih-card"><Spec style={{ padding: "4px 16px" }} rows={[["Working pressure", "350 bar"], ["Displacement", "71 cc/rev"], ["Mounting", "SAE-C 4-bolt"], ["Port thread", "1¼\" BSP"]]} /></div>
      </Block>

      <Block title="Surfaces" span={2}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18 }}>
          <div className="ih-card"><Img style={{ aspectRatio: "4/3" }} label="blueprint placeholder" /><div style={{ padding: 14 }}><div style={{ fontSize: 13, fontWeight: 500 }}>Card · paper</div><div style={{ fontSize: 12, color: "var(--ih-muted)", marginTop: 4 }}>1px border, 10px radius, no shadow</div></div></div>
          <div className="ih-card"><Img navy style={{ aspectRatio: "4/3" }} label="navy placeholder" /><div style={{ padding: 14 }}><div style={{ fontSize: 13, fontWeight: 500 }}>Navy ground</div><div style={{ fontSize: 12, color: "var(--ih-muted)", marginTop: 4 }}>Chrome, footers, hero overlays</div></div></div>
          <div className="ih-card"><Img accent style={{ aspectRatio: "4/3" }} label="signal placeholder" /><div style={{ padding: 14 }}><div style={{ fontSize: 13, fontWeight: 500 }}>Signal ground</div><div style={{ fontSize: 12, color: "var(--ih-muted)", marginTop: 4 }}>One per page, maximum</div></div></div>
          <div style={{ background: "var(--ih-navy)", borderRadius: 10, padding: 18, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div className="eyebrow" style={{ color: "oklch(0.72 0.04 250)" }}>On navy</div>
            <div><div style={{ color: "#fff", fontSize: 15, fontWeight: 500, marginBottom: 12 }}>Inverted panel</div>
              <div style={{ display: "flex", gap: 8 }}><Btn kind="primary" size="sm">Primary</Btn><Btn kind="onnavy" size="sm">Outline</Btn></div></div>
          </div>
        </div>
      </Block>
    </div>
  </div>;
}
Object.assign(window, { FoundationBoard });
