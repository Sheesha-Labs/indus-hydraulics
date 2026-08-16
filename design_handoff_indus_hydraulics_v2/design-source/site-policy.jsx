/* eslint-disable */
// One policy template, five content sets: shipping, returns, warranty, privacy, terms.

const POLICIES = {
  shipping: {
    nav: "Shipping", crumb: "Shipping", updated: "Updated 4 August 2026",
    h1: ["How we pack, ship and clear ", "hydraulic components", "."],
    lede: "Everything below applies to orders despatched from our Jebel Ali bonded warehouse or our Mumbai plant. Incoterms are stated on every quotation — this page explains what sits behind them.",
    aside: [["Standard dispatch", "24 hours ex-stock"], ["Emergency dispatch", "Same day, GCC"], ["Free-zone origin", "JAFZA, Dubai"], ["Default incoterm", "CIF"]],
    sections: [
      ["Dispatch times", [["Ex-stock lines", "Picked, packed and handed to the carrier within 24 working hours of a confirmed order. Lines marked in stock on the quotation are held physically, not on a supplier's shelf."],
        ["Emergency orders", "Where a line is down, we despatch same day within the GCC on stocked lines. Tell the desk it is an emergency and it is treated as one."],
        ["Made-to-order and rebuild", "Lead time is stated per line on the quotation. We confirm dispatch date in writing when the unit passes test, not when it is scheduled."]]],
      ["Packing", [["Standard", "Components are drained, ports plugged or capped, and packed in ISPM-15 treated timber or double-wall carton with foam profiling. Pumps and motors ship with shaft support."],
        ["Preservation", "Units held longer than 30 days before shipping are internally oiled and desiccant-packed. Preservation method is stated on the packing list."],
        ["Marine and offshore", "Sea-freight consignments to platforms are packed in certified DNV 2.7-1 baskets where the destination requires it. Lifting certificates travel with the basket."]]],
      ["Freight and duty", [["Incoterms", "CIF is our default. EXW, FCA, CPT, DAP and DDP are all available — the quotation names the term and the named place."],
        ["Duty and clearance", "On CIF and below, duty and clearance at destination are the buyer's account. On DDP we clear and pay, and the amount is shown separately on the invoice rather than absorbed."],
        ["Dangerous goods", "Accumulators, nitrogen-charged assemblies and certain lubricants are classed DG. We raise the declaration, the shipper's certificate and any PESO paperwork needed."]]],
      ["Tracking and proof", [["Tracking", "An airway bill or bill of lading number is emailed on dispatch, with the packing list and any test certificates as PDF."],
        ["Proof of delivery", "Signed POD is available on request for twelve months after delivery. For platform and rig deliveries we also retain the boat note or manifest."],
        ["Shortages and damage", "Note it on the carrier's paperwork at the point of receipt and tell us within 5 working days. Photographs of the packaging as received make the claim straightforward."]]],
    ],
  },
  returns: {
    nav: "Returns", crumb: "Returns", updated: "Updated 4 August 2026",
    h1: ["Returns, on parts that are ", "harder to return than most", "."],
    lede: "A hydraulic component that has been installed and run is rarely resaleable, so our returns policy distinguishes carefully between what has been fitted and what has not.",
    aside: [["Unfitted, standard line", "30 days"], ["Unfitted, special order", "Case by case"], ["Fitted or commissioned", "Warranty route only"], ["Restocking fee", "15% after 14 days"]],
    sections: [
      ["What can be returned", [["Unfitted standard lines", "Within 30 days of delivery, in original packaging, with ports still plugged and no evidence of fluid having passed through the unit. Full credit within 14 days; 15% restocking thereafter."],
        ["Special order and made-to-order", "Ordered specifically against your requirement and generally not returnable. We will always ask the manufacturer, and we will tell you the answer either way."],
        ["Fitted, commissioned or run", "Not a return. If the part has failed, it is a warranty claim, and the warranty page sets out how that works."]]],
      ["What cannot be returned", [["Cut, crimped or assembled to order", "Hose assemblies, custom manifolds and cut lengths are made to your dimensions and cannot be resold."],
        ["Seals and elastomers", "Once a seal kit is opened, shelf life and traceability are compromised. Unopened kits within 30 days are fine."],
        ["Nitrogen-charged units", "Accumulators that have been charged and installed cannot be returned to stock."]]],
      ["How to raise one", [["Ask for an RMA first", "Email the desk with the invoice number and the line. We issue an RMA number and a return address — goods sent back without one are difficult to trace and slower to credit."],
        ["Pack it as it arrived", "Ports plugged, original carton or crate, RMA number on the outside. Freight on returns is the buyer's account unless we shipped the wrong item."],
        ["Inspection", "Returned units are inspected within 5 working days. If we cannot credit in full we tell you why, with photographs, before raising the credit note."]]],
      ["If we got it wrong", [["Wrong item shipped", "We collect at our cost, ship the correct item on the next available service, and credit in full. No restocking fee, no argument."],
        ["Mis-specified by us", "If our engineering desk recommended a part that does not suit the duty, we treat it as our error and take it back — including where it has been trial-fitted."]]],
    ],
  },
  warranty: {
    nav: "Warranty", crumb: "Warranty", updated: "Updated 4 August 2026",
    h1: ["A warranty that survives ", "an actual claim", "."],
    lede: "Twelve months on supplied components, twelve months on the assembled system for workshop rebuilds. What follows is what we cover, what we do not, and what we need from you to process a claim quickly.",
    aside: [["Supplied components", "12 months"], ["Workshop rebuilds", "12 months, full unit"], ["Field service work", "6 months"], ["Claim assessment", "5 working days"]],
    sections: [
      ["What is covered", [["Supplied components", "Twelve months from date of delivery against defects in material and manufacture. Where the manufacturer offers longer, you get the longer term."],
        ["Workshop rebuilds", "Twelve months on the assembled unit, not merely on the parts we fitted. If a rebuilt pump fails inside the term, the pump is the subject of the claim."],
        ["Field service and commissioning", "Six months on workmanship. Components fitted during the visit carry their own twelve months."]]],
      ["What is not covered", [["Contamination", "By far the most common cause of failure we see. Particle ingress, water in oil and wrong fluid are not manufacturing defects. Our lab can establish which it was."],
        ["Duty outside specification", "Running a 210 bar cylinder at 280 bar, or an NBR seal in sour service, voids the claim. We will have flagged the specification in writing at the point of quotation."],
        ["Installation damage", "Misalignment, over-torqued fittings, unsupported hose runs and dry starts. We will say so plainly and quote the repair."]]],
      ["Raising a claim", [["Tell us early", "Photographs, the serial number and a description of the symptoms. Do not strip the unit before speaking to us — a stripped unit loses the evidence a claim depends on."],
        ["Return for assessment", "We issue an RMA and assess within 5 working days of receipt. Assessment includes a dimensional report and photographs, whether or not the claim succeeds."],
        ["Outcome", "Repair, replace or credit, at our discretion but in consultation with you. Where the claim fails, you receive the findings report and a quotation to repair — the assessment itself is free."]]],
      ["Documentation we hold", [["Test certificates", "Every rebuilt unit leaves with a test certificate. We retain a copy indefinitely, so a claim never depends on you finding your paperwork."],
        ["Traceability", "Seal batch numbers, nitrogen bottle serials, hose swage records and torque values are held against the work order."]]],
    ],
  },
  privacy: {
    nav: "Privacy", crumb: "Privacy", updated: "Updated 4 August 2026",
    h1: ["What we do with ", "your information", "."],
    lede: "We are a components distributor, not an advertising business. We collect what a quotation and a delivery need, and we do not sell it.",
    aside: [["Data controller", "Indus Hydraulics Pvt. Ltd."], ["Jurisdiction", "UAE · India"], ["Retention", "7 years, tax"], ["Contact", "privacy@indushydraulics.me"]],
    sections: [
      ["What we collect", [["When you request a quote", "Name, company, work email, phone, destination and whatever you tell us about the application. The application notes are the part our engineers actually need."],
        ["When you create an account", "The above, plus a password hash, and your quote and order history against the account."],
        ["Automatically", "Standard server logs, and analytics on which catalogue pages are used. We do not run advertising trackers or sell audience data."]]],
      ["Why we hold it", [["To quote and to deliver", "A quotation needs the specification and the destination; a delivery needs a consignee and a phone number."],
        ["To meet obligations", "Tax, customs, export-control screening and product traceability all require records to be kept."],
        ["To tell you things you asked for", "Newsletter and stock alerts, only where you opted in, and unsubscribable in one click."]]],
      ["Who sees it", [["Carriers and customs brokers", "Consignee details, as required to deliver and clear."],
        ["Manufacturers", "Only where a warranty claim or a technical query requires it, and only the technical detail."],
        ["Nobody else", "We do not sell, rent or trade personal data. We do not share enquiry data between customers."]]],
      ["Your rights", [["Access and correction", "Ask and we will tell you what we hold, and correct anything wrong."],
        ["Deletion", "We will delete what we are not legally required to retain. Invoices and customs records we must keep for seven years."],
        ["How to ask", "Email privacy@indushydraulics.me. A person reads it; we reply within 30 days and usually much sooner."]]],
    ],
  },
  terms: {
    nav: "Terms", crumb: "Terms", updated: "Updated 4 August 2026",
    h1: ["Terms of sale, in ", "plain language", "."],
    lede: "These terms apply to every quotation and order unless a signed supply agreement says otherwise. Where a customer's own purchasing terms conflict, the signed agreement governs.",
    aside: [["Quote validity", "30 days"], ["Payment terms", "Per account, 30–45 days"], ["Title passes", "On full payment"], ["Governing law", "UAE, Dubai courts"]],
    sections: [
      ["Quotations and orders", [["Validity", "Thirty days from issue. Currency movement, duty changes and manufacturer price revisions after that point may change the number, and we will say so before proceeding."],
        ["Stock statements", "Availability shown on a quotation is at the time of quoting. Stock is not reserved until an order is confirmed."],
        ["Confirmation", "An order is accepted when we issue an order confirmation, not when a purchase order is received."]]],
      ["Prices and payment", [["Quote-only catalogue", "We do not publish prices. Pricing depends on quantity, variant, destination and duty, and is quoted per order."],
        ["Payment terms", "Set per account, typically 30 to 45 days from invoice. New accounts trade on advance payment until terms are agreed."],
        ["Title and risk", "Risk passes per the stated incoterm. Title passes on receipt of payment in full."]]],
      ["Specification and fitness", [["Our recommendations", "Where we recommend a part, the recommendation is based on the information you give us. If the duty differs from what was described, the recommendation may not hold."],
        ["Cross-references", "Interchange suggestions are documented, not guaranteed. Where a substitution is borderline we say so in writing and ask you to confirm."],
        ["Drawings and data", "Manufacturer datasheets are provided for reference. Where a dimension is critical, ask us to confirm it against the current drawing before you machine anything."]]],
      ["Liability", [["What we stand behind", "Defective goods and defective workmanship, per the warranty page."],
        ["What we cap", "Our liability is limited to the invoice value of the goods or services supplied. We do not accept liability for consequential loss, including lost production, rig time or downtime costs."],
        ["Export compliance", "Orders are screened against dual-use and sanctions lists. We will decline an order rather than breach an export control, and we will explain why where we are permitted to."]]],
    ],
  },
};

function PolicyPage({ slug }) {
  const d = POLICIES[slug];
  const keys = Object.keys(POLICIES);
  return <><UtilityBar /><SiteNav active="none" />
    <div style={{ padding: "24px 48px 0" }}><Crumb items={["Home", d.crumb]} /></div>
    <div style={{ padding: "20px 48px 40px", borderBottom: "1px solid var(--ih-border)" }}>
      <div style={{ maxWidth: 820 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Eyebrow>Policy</Eyebrow>
          <span className="mono" style={{ fontSize: 10.5, color: "var(--ih-muted-2)", letterSpacing: ".06em" }}>{d.updated.toUpperCase()}</span>
        </div>
        <h1 className="serif" style={{ fontSize: 46, marginTop: 16, lineHeight: 1.06 }}>{d.h1[0]}<em>{d.h1[1]}</em>{d.h1[2]}</h1>
        <p className="lede" style={{ marginTop: 16 }}>{d.lede}</p>
      </div>
    </div>
    <div style={{ padding: "40px 48px 72px", display: "grid", gridTemplateColumns: "196px minmax(0,780px) 1fr", gap: 48, alignItems: "start" }}>
      <nav style={{ position: "sticky", top: 20 }}>
        <div className="eyebrow" style={{ paddingBottom: 12, borderBottom: "1px solid var(--ih-border)" }}>Policies</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 12 }}>
          {keys.map(k => <a key={k} style={{ padding: "7px 0 7px 10px", fontSize: 13,
            borderLeft: `2px solid ${k === slug ? "var(--ih-accent)" : "var(--ih-border)"}`,
            color: k === slug ? "var(--ih-accent)" : "var(--ih-muted)", fontWeight: k === slug ? 500 : 400 }}>{POLICIES[k].nav}</a>)}
        </div>
        <div className="eyebrow" style={{ padding: "24px 0 12px", borderBottom: "1px solid var(--ih-border)" }}>On this page</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          {d.sections.map(([h], i) => <a key={h} style={{ fontSize: 12.5, color: i === 0 ? "var(--ih-ink-2)" : "var(--ih-muted)" }}>{h}</a>)}
        </div>
      </nav>

      <article style={{ display: "flex", flexDirection: "column", gap: 40 }}>
        {d.sections.map(([h, rows], si) => <section key={h}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 14, paddingBottom: 13, borderBottom: "1px solid var(--ih-border)" }}>
            <span className="mono" style={{ fontSize: 11.5, color: "var(--ih-accent)" }}>/{String(si + 1).padStart(2, "0")}</span>
            <h2 className="serif" style={{ fontSize: 28 }}>{h}</h2>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22, marginTop: 20 }}>
            {rows.map(([t, body]) => <div key={t}>
              <h3 style={{ fontSize: 15.5, fontWeight: 500 }}>{t}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.7, color: "var(--ih-ink-2)", marginTop: 7 }}>{body}</p>
            </div>)}
          </div>
        </section>)}
        <div className="ih-note">
          Questions about anything on this page go to the desk, not to a form. Call +971 52 2477942 or email sales@indushydraulics.me
          and a person will answer.
        </div>
      </article>

      <aside style={{ position: "sticky", top: 20, display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="ih-card" style={{ padding: 20 }}>
          <Eyebrow>At a glance</Eyebrow>
          <div style={{ marginTop: 12 }}><Spec rows={d.aside} /></div>
        </div>
        <div className="ih-card" style={{ padding: 20, background: "var(--ih-steel-soft)", borderColor: "oklch(0.88 0.03 240)" }}>
          <div style={{ fontSize: 13.5, fontWeight: 500 }}>Need this as a PDF?</div>
          <p style={{ fontSize: 12.5, color: "var(--ih-ink-2)", marginTop: 8, lineHeight: 1.55 }}>
            Procurement teams usually want it on file with the vendor pack.
          </p>
          <Btn kind="outline" size="sm" icon={I.download} style={{ width: "100%", marginTop: 12, background: "var(--ih-surface)" }}>Download</Btn>
        </div>
      </aside>
    </div>
    <SiteFooter /></>;
}
Object.assign(window, { PolicyPage, POLICIES });
