/* eslint-disable */
// /services — rebuilt to the live structure, with the real 20-service taxonomy.
// Titles and descriptions verbatim from indushydraulics.com/services.

const SVC_CATS = [["All services", 20], ["Cylinders", 1], ["Hoses", 1], ["Pumps", 2], ["Valves & manifolds", 0],
  ["BOP & pressure control", 10], ["CT & wireline", 2], ["Wellhead", 0], ["Field service", 2], ["Lab & forensics", 1], ["Custom builds", 1]];

const SVC_FEATURED = {
  no: "NO. 01", tag: "CYLINDERS · OILFIELD", stamp: "MAR 2026 · BAY 2 / ON-SITE",
  h: ["Eight tie-rod cylinders, 96 hoses, and a workover rig that needed to be ", "back on a well in 19 days", "."],
  body: "ADNOC sub-contractor pulled a 50,000-lb hydraulic workover unit off a sour-gas well in the Rub' al Khali. We rebuilt eight tie-rod cylinders, 96 hoses and four accumulators in our JAFZA yard — back skidding 23 days later.",
  outcomes: ["19 D TAT", "NACE MR0175", "ADNOC AVL"], img: "featured · workover rig cylinder & hose overhaul · 1100×760",
};

const SVC_CASES = [
  ["NO. 20", "IWCF TRAINING", "2-5 D / COURSE", "IWCF and IADC WellSharp well-control certification — the cards Aramco asks for, taught by people who have closed a real BOP under a real kick.",
    ["IWCF + IADC WellSharp accredited", "Aramco-spec supervisor cert", "Bilingual EN / AR on request"], "iwcf training case"],
  ["NO. 19", "RCD / MPD", "2-6 WEEK CYCLE", "The RCD service line that keeps Managed Pressure Drilling inside its narrow window — passive seals, bearings, and the ancillary kit downstream.",
    ["4 OEM families serviced", "Function test 200 rpm under pressure", "NACE MR0175 sour service"], "rcd / mpd case"],
  ["NO. 18", "DIVERTER RECERT", "4-8 WEEK CYCLE", "A 21-1/4\" 2K diverter recert — because shallow gas doesn't belong on the rig floor.",
    ["Hydrotest 3,000 psi · 0 drop", "Close-divert function · witnessed", "API 16A recert · 5 yr validity"], "diverter recert case"],
  ["NO. 17", "15K HPHT BOP", "8-14 WEEK CYCLE", "A 15K HPHT BOP service for the GCC's nastiest reservoirs — where 30% H₂S is the design case, not the worst case.",
    ["Hydrotest 22,500 psi · 0 drop", "Charpy + NACE on every metallic", "API 16A HPHT recert · 5 yr"], "15k hpht bop case"],
  ["NO. 16", "SUBSEA FAT/SIT", "PER-PROJECT · 4-8 WEEK", "Your eyes on the OEM floor — independent FAT and SIT witness on a new-build subsea BOP stack.",
    ["IWCF Supervisor + 15+ yr authority", "API 16A · 16D · 17D witness", "Operator stamp + signed report"], "subsea fat/sit case"],
  ["NO. 15", "CT/SNUB/WL BOP", "2-6 WEEK CYCLE", "Intervention BOPs are not drilling BOPs — and the workshop discipline is not the same.",
    ["CT Quad · Snub · Wireline", "Hydrotest 1.5× WP · 30 min", "API 16A recert · 5 yr"], "ct/snub/wl bop case"],
  ["NO. 14", "FIELD CREW", "DAY-RATE · 48 H DISPATCH", "A BOP field service crew on day-rate — IWCF cards, H₂S certs, and a truck rolling out of Jebel Ali in 48 hours.",
    ["48 h standard · 24 h emergency", "IWCF L4 + WellSharp + SAEP-1142", "Day-rate · 30+ day campaigns"], "field crew case"],
  ["NO. 13", "STACK RENTAL", "7-DAY MOB · 30-365 DAYS HIRE", "The 11\" 10K workover BOP stack we keep on a 7-day mob — and a fresh API STD 53 cert in the box.",
    ["Mob 5 — 7 days from PO", "Hydrotest cert ≤14 d", "Spares pool on standby"], "stack rental case"],
  ["NO. 12", "ANNUAL REDRESS", "12-MONTH CYCLE · 5-10 D", "The 12-month BOP redress — Aramco-spec elastomer renewal, on-rig in a week or workshop in three.",
    ["Per-cavity HNBR / AFLAS soft goods", "API STD 53 pressure tests", "12-month redress certificate"], "annual redress case"],
  ["NO. 11", "PRESSURE TESTING", "PER-RIG · 14-DAY CYCLE", "The 14-day BOP test cycle, per API STD 53 — every active rig in the GCC, every two weeks, on the chart.",
    ["API STD 53 · 14-day cycle", "5K · 10K · 15K stacks", "IWCF Level 4 supervisor"], "pressure testing case"],
  ["NO. 10", "BUILD", "4 WK BUILD", "A plant engineer walked in with a sketch on grid paper. Four weeks later we bolted his 16-port manifold to the press.",
    ["630 bar hydrotest · pass", "27 / 27 leak paths", "EN24 · 850 MPa"], "build case"],
  ["NO. 09", "LAB", "5 D / SAMPLE", "Fourteen hydraulic systems, one rising iron trend, and a pump bearing caught three weeks before it grenaded.",
    ["14 / 14 verdicts on time", "Bearing caught at 75% spall", "~AED 800K avoided"], "lab case"],
  ["NO. 08", "HOSES", "14 D BUILD", "112 assemblies, 14 days, every hose tagged. A cold-stacked rig refitted for sour service.",
    ["112 / 112 proof-pass", "14-day build", "NACE MR0175 per assembly"], "hoses case"],
  ["NO. 07", "HPU", "8 D ON BENCH", "A 50 HP rig HPU came in for a filter change. The schematic on file was wrong, the oil was at 22/19/16, and the noise floor was 7 dB louder than the operator remembered.",
    ["Oil 17/15/12", "−7 dB cabin", "Schematic redrawn"], "hpu case"],
  ["NO. 06", "CHOKE & KILL", "28 D ON BENCH", "A 3-1/16\" 10K choke & kill manifold, eight gate valves, and the trim swap that bought it five more years of sour service.",
    ["5-yr recert stamped", "15K hydrotest · 10/10", "NACE MR0175 cert"], "choke & kill case"],
  ["NO. 05", "CT & WIRELINE", "5 D EMERGENCY", "A CT injector skid pulled mid-job from a sour Aramco well — back on location in five days, not seven.",
    ["5-day turnaround · slot held", "OEM commissioning · 24/24", "Same-week return"], "ct & wireline case"],
  ["NO. 04", "KOOMEY", "8 D ON BENCH", "Eleven nitrogen bottles, four spent bladders, and an API 16D 5-year clock with thirty days left.",
    ["API 16D · 5-yr stamp", "11 / 11 SPM passed", "8 days bench"], "koomey case"],
  ["NO. 03", "BOP & RECERT", "42 D ON BENCH", "A 5-year recert on a 13-5/8\" 10K Cameron Type-U — and an annular that came off the bench faster than it went on.",
    ["Hydrotest 15,000 psi · 0 drop", "Annular −0.6 s vs last rig run", "API 16A recert · valid to 2031"], "bop & recert case"],
  ["NO. 02", "MUD PUMP", "11 D ON BENCH", "A 12-P-160 fluid end the operator wanted to scrap — and the AED 1.4 million we talked them out of spending.",
    ["AED 1.4 M saved", "11 days on bench", "7,500 psi hydrotest"], "mud pump case"],
];

function ServicesIndexPage() {
  return <><UtilityBar /><SiteNav active="Services" />
    {/* HERO */}
    <div style={{ background: "var(--ih-surface)", borderBottom: "1px solid var(--ih-border)", padding: "56px 48px 44px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.25fr 1fr", gap: 56, alignItems: "end" }}>
        <div>
          <Eyebrow>Services · workshops · on-site</Eyebrow>
          <h1 className="serif" style={{ fontSize: 52, marginTop: 18, lineHeight: 1.04 }}>
            Things people bring us broken, and <em>what we sent back</em>.
          </h1>
          <p className="lede" style={{ marginTop: 18, maxWidth: 620 }}>
            Service jobs run out of our Jebel Ali yard — written as case studies, with photos, measurements and what it actually cost.
            Browse the cases or jump straight to a quote.
          </p>
        </div>
        <div>
          <StatRow items={[["2,400+", "Jobs / yr"], ["96h", "Avg TAT"], ["100%", "On-time"]]} big={30} />
          <div style={{ display: "flex", gap: 10, marginTop: 26 }}>
            <Btn kind="primary" size="lg">Request a service quote</Btn>
            <Btn kind="outline" size="lg" iconR={I.arrowR}>Talk to an engineer</Btn>
          </div>
        </div>
      </div>
    </div>

    {/* FILTER BAR */}
    <div style={{ padding: "22px 48px", borderBottom: "1px solid var(--ih-border)", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      {SVC_CATS.map(([n, c], i) => <span key={n} className={`ih-chip ${i === 0 ? "is-on" : ""}`} style={c === 0 ? { opacity: .45 } : undefined}>
        {n}<span className="mono" style={{ fontSize: 10, opacity: .75, marginLeft: 2 }}>{c}</span>
      </span>)}
      <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
        <span className="eyebrow">Sort</span>
        <select className="ih-field" style={{ width: 190, height: 32 }}>
          <option>Most recent</option><option>Highest savings</option><option>Fastest turnaround</option>
        </select>
      </div>
    </div>

    {/* CASE OF THE WEEK */}
    <section className="ih-sec">
      <a className="ih-card" style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr" }}>
        <Img style={{ minHeight: 420 }} label={SVC_FEATURED.img}>
          <span className="ih-badge ih-badge--square ih-badge--navy" style={{ position: "absolute", top: 14, left: 14 }}>CASE OF THE WEEK</span>
        </Img>
        <div style={{ padding: 40, display: "flex", flexDirection: "column", justifyContent: "center", gap: 14 }}>
          <div style={{ display: "flex", gap: 9, alignItems: "center", flexWrap: "wrap" }}>
            <span className="mono" style={{ fontSize: 11, fontWeight: 500, color: "var(--ih-accent)" }}>{SVC_FEATURED.no}</span>
            <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", color: "var(--ih-muted)" }}>· {SVC_FEATURED.tag} · {SVC_FEATURED.stamp}</span>
          </div>
          <h2 className="serif" style={{ fontSize: 33, lineHeight: 1.14 }}>
            {SVC_FEATURED.h[0]}<em>{SVC_FEATURED.h[1]}</em>{SVC_FEATURED.h[2]}
          </h2>
          <p style={{ fontSize: 14.5, color: "var(--ih-muted)", lineHeight: 1.65 }}>{SVC_FEATURED.body}</p>
          <div style={{ display: "flex", gap: 20, marginTop: 8, paddingTop: 18, borderTop: "1px solid var(--ih-border)" }}>
            {SVC_FEATURED.outcomes.map(o => <div key={o}>
              <div className="mono" style={{ fontSize: 13.5, color: "var(--ih-accent)" }}>{o}</div>
              <div className="eyebrow" style={{ marginTop: 5 }}>Outcome</div>
            </div>)}
            <span style={{ marginLeft: "auto", alignSelf: "center", color: "var(--ih-accent)", display: "flex" }}>{I.arrowR}</span>
          </div>
        </div>
      </a>
    </section>

    {/* CASE GRID */}
    <section className="ih-sec" style={{ paddingTop: 0 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
        {SVC_CASES.map(([no, tag, tat, body, outcomes, img]) => <a key={no} className="ih-card" style={{ display: "flex", flexDirection: "column" }}>
          <Img style={{ aspectRatio: "520/390" }} label={img}>
            <span className="ih-badge ih-badge--square" style={{ position: "absolute", top: 12, left: 12, background: "rgba(255,255,255,.94)", color: "var(--ih-ink)" }}>{tag}</span>
            <span className="mono" style={{ position: "absolute", top: 14, right: 12, fontSize: 9.5, letterSpacing: ".08em", color: "var(--ih-muted)", background: "rgba(255,255,255,.9)", padding: "3px 7px", borderRadius: 3 }}>{tat}</span>
          </Img>
          <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
            <span className="mono" style={{ fontSize: 10.5, fontWeight: 500, color: "var(--ih-accent)", letterSpacing: ".06em" }}>{no}</span>
            <p style={{ fontSize: 14.5, fontWeight: 500, lineHeight: 1.4, letterSpacing: "-0.01em" }}>{body}</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginTop: "auto", paddingTop: 14, borderTop: "1px solid var(--ih-border)" }}>
              {outcomes.map(o => <span key={o} className="mono" style={{ fontSize: 9.5, letterSpacing: ".04em", padding: "3px 7px", borderRadius: 3, background: "var(--ih-surface-2)", color: "var(--ih-ink-2)" }}>{o}</span>)}
            </div>
          </div>
        </a>)}
      </div>
    </section>

    {/* HOW WE WORK */}
    <section style={{ background: "var(--ih-surface)", borderTop: "1px solid var(--ih-border)", borderBottom: "1px solid var(--ih-border)", padding: "64px 48px" }}>
      <SecHead eyebrow="How we work · a look inside" serif
        title="The same four steps run every service, every time — from a piston seal to a BOP recert." />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: "var(--ih-border)", border: "1px solid var(--ih-border)", borderRadius: 10, overflow: "hidden" }}>
        {[["01", "Intake & photo report", "Logged, tagged, photographed within 4 hours of arrival."],
          ["02", "Measure & quote", "Dimensional report against OEM tolerances. PDF before we cut metal."],
          ["03", "Rebuild & test", "Closed-loop tested at 1.5× MAWP. Curves on file forever."],
          ["04", "Document & dispatch", "Return packet with serials, torque values, test results, photos."]].map(([n, t, d], i) =>
          <div key={n} style={{ background: i === 1 ? "var(--ih-accent-soft)" : "var(--ih-bg)", padding: "26px 24px" }}>
            <span className="mono" style={{ fontSize: 11, color: "var(--ih-accent)" }}>/{n}</span>
            <h4 style={{ fontSize: 16.5, marginTop: 12 }}>{t}</h4>
            <p style={{ fontSize: 12.5, color: "var(--ih-muted)", marginTop: 8, lineHeight: 1.6 }}>{d}</p>
          </div>)}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, marginTop: 40, alignItems: "center" }}>
        <Img style={{ aspectRatio: "880/500", borderRadius: 12 }} label="step 02 — measurement report on bench · 880×500" />
        <div>
          <Eyebrow>Step 02 · measure &amp; quote</Eyebrow>
          <h3 className="serif" style={{ fontSize: 30, marginTop: 14, lineHeight: 1.18 }}>
            You get a 12-page PDF <em>before</em> we cut a single piece of metal.
          </h3>
          <p style={{ fontSize: 15, color: "var(--ih-ink-2)", marginTop: 14, lineHeight: 1.7 }}>
            Bore roundness, rod straightness, gland clearances, deck flatness, seat depths — captured against OEM tolerances,
            with a recommendation for each finding. If you'd rather replace than rebuild, we'll tell you, and quote the replacement too.
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 20 }}>
            {["12-page PDF", "Dimensional data", "Photo evidence", "Cost vs replace", "Lead-time options"].map(t => <Chip key={t}>{t}</Chip>)}
          </div>
        </div>
      </div>
    </section>

    {/* LONG READS */}
    <section className="ih-sec">
      <SecHead eyebrow="Long reads · engineers writing about their jobs" title="Two recent service stories worth your time." />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {[["CYLINDERS · OILFIELD · 19 D ON BENCH", "Eight tie-rod cylinders, 96 hoses, and a workover rig that needed to be back on a well in 19 days.",
          "ADNOC sub-contractor pulled a 50,000-lb hydraulic workover unit off a sour-gas well in the Rub' al Khali. We rebuilt eight tie-rod cylinders, 96 hoses and four accumulators in our JAFZA yard — back skidding 23 days later.",
          ["19 D TAT", "NACE MR0175", "ADNOC AVL"], "cylinders · oilfield long read · 660×370"],
          ["IWCF TRAINING · 5 D ON BENCH", "IWCF and IADC WellSharp well-control certification — the cards Aramco asks for, taught by people who have closed a real BOP under a real kick.",
          "Drilling Well Control Levels 2-4, WIPC tracks (CT / Snubbing / Wireline), 2-year recerts. Monthly open enrolment plus 15+ candidate bulk cohorts at the centre or on-rig anywhere in the GCC.",
          ["IWCF + IADC accredited", "Aramco-spec cert", "Bilingual EN / AR"], "iwcf training long read · 660×370"]].map(([tag, h, body, outs, img]) =>
          <a key={h} className="ih-card" style={{ display: "flex", flexDirection: "column" }}>
            <Img style={{ aspectRatio: "660/370" }} label={img} />
            <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
              <span className="mono" style={{ fontSize: 10, letterSpacing: ".1em", color: "var(--ih-muted)" }}>FROM THE FIELD · {tag}</span>
              <h3 style={{ fontSize: 21, lineHeight: 1.28 }}>{h}</h3>
              <p style={{ fontSize: 13.5, color: "var(--ih-muted)", lineHeight: 1.65, flex: 1 }}>{body}</p>
              <div style={{ display: "flex", gap: 16, paddingTop: 16, borderTop: "1px solid var(--ih-border)" }}>
                {outs.map(o => <div key={o}><div className="mono" style={{ fontSize: 11.5, color: "var(--ih-accent)" }}>{o}</div>
                  <div className="eyebrow" style={{ marginTop: 4, fontSize: 9 }}>Outcome</div></div>)}
              </div>
            </div>
          </a>)}
      </div>
    </section>

    {/* CTA */}
    <section style={{ padding: "0 48px 72px" }}>
      <div className="ih-card" style={{ padding: "48px", textAlign: "center", background: "var(--ih-surface)" }}>
        <Eyebrow>Service intake · open 24×7 · Jebel Ali</Eyebrow>
        <p className="serif" style={{ fontSize: 21, color: "var(--ih-muted)", marginTop: 16, fontStyle: "italic" }}>
          If it leaks, hums, screams, drips, slips or simply refuses to move — we'd like a look at it.
        </p>
        <h2 className="serif" style={{ fontSize: 36, marginTop: 14, maxWidth: 760, marginInline: "auto", lineHeight: 1.12 }}>
          Send us a photo, an SKU or a part on a pallet. <em>We'll do the rest.</em>
        </h2>
        <p style={{ fontSize: 14, color: "var(--ih-muted)", marginTop: 14, maxWidth: 560, marginInline: "auto", lineHeight: 1.6 }}>
          An applications engineer will read your ticket inside one business day — no charge for the conversation, no obligation to use us.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 26 }}>
          <Btn kind="primary" size="lg">Open a service ticket</Btn>
          <Btn kind="outline" size="lg">WhatsApp us</Btn>
          <Btn kind="ghost" size="lg" icon={I.mail}>Email</Btn>
        </div>
      </div>
    </section>
    <SiteFooter /></>;
}
Object.assign(window, { ServicesIndexPage, SVC_CASES, SVC_CATS });
