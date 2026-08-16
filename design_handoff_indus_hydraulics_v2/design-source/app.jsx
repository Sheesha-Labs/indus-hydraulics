/* eslint-disable */
function AB({ children }) { return <div className="ih">{children}</div>; }

function App() {
  return <DesignCanvas minScale={0.04} maxScale={2}>
    <DCSection id="foundation" title="00 · Design language" subtitle="The system every screen below is built from — the blue family, the type scale, and the component grammar borrowed from Bazar.">
      <DCArtboard id="tokens" label="Foundation · colour, type, components" width={1440} height={1660}><AB><FoundationBoard /></AB></DCArtboard>
    </DCSection>

    <DCSection id="entry" title="01 · Entry & discovery" subtitle="Where organic search and direct traffic land.">
      <DCArtboard id="home" label="Home · full assembly" width={1440} height={5662}><AB><HomePage /></AB></DCArtboard>
      <DCArtboard id="plp" label="Category · faceted list" width={1440} height={2150}><AB><CategoryPage /></AB></DCArtboard>
      <DCArtboard id="search" label="Search results · with cross-reference" width={1440} height={1475}><AB><SearchPage /></AB></DCArtboard>
      <DCArtboard id="brands" label="Brands index" width={1440} height={1785}><AB><BrandsPage /></AB></DCArtboard>
      <DCArtboard id="compare" label="Compare · spec matrix" width={1440} height={1472}><AB><ComparePage /></AB></DCArtboard>
      <DCArtboard id="megamenu" label="Mega menu · open state" width={1440} height={1050}><AB><MegaMenuPage /></AB></DCArtboard>
    </DCSection>

    <DCSection id="quote" title="02 · Product & quote path" subtitle="Quote-only commerce: no prices, an engineer on the other end.">
      <DCArtboard id="pdp" label="Product detail" width={1440} height={1892}><AB><ProductPage /></AB></DCArtboard>
      <DCArtboard id="quotelist" label="Quote list" width={1440} height={1140}><AB><QuotePage /></AB></DCArtboard>
      <DCArtboard id="rfq" label="RFQ form" width={1440} height={1850}><AB><RfqPage /></AB></DCArtboard>
      <DCArtboard id="rfq-done" label="RFQ confirmation" width={1440} height={1265}><AB><RfqConfirmPage /></AB></DCArtboard>
    </DCSection>

    <DCSection id="services" title="03 · Services & case studies" subtitle="The selected direction: photo-led, outcome-first, filterable by type of work.">
      <DCArtboard id="svc-index" label="Services · index (live structure, 20 services)" width={1440} height={7314}><AB><ServicesIndexPage /></AB></DCArtboard>
      <DCArtboard id="cases" label="Services · case studies index" width={1440} height={2375}><AB><ServicesCasesPage /></AB></DCArtboard>
      <DCArtboard id="case-detail" label="Case detail · mud pump rebuild" width={1440} height={2230}><AB><CaseDetailPage /></AB></DCArtboard>
    </DCSection>

    <DCSection id="industries" title="04 · Industries" subtitle="Master page plus four verticals, following the live indushydraulics.com layout — long declarative titles, certification pills, a stat row, application areas, rated SKUs, reference installs and one navy support band.">
      <DCArtboard id="ind-master" label="Industries · master" width={1440} height={2355}><AB><IndustriesMasterPage /></AB></DCArtboard>
      <DCArtboard id="ind-oil" label="Industry · Oil & Gas" width={1440} height={4025}><AB><IndustryDetailPage slug="oil-gas" /></AB></DCArtboard>
      <DCArtboard id="ind-mining" label="Industry · Mining" width={1440} height={4002}><AB><IndustryDetailPage slug="mining" /></AB></DCArtboard>
      <DCArtboard id="ind-constr" label="Industry · Construction" width={1440} height={4002}><AB><IndustryDetailPage slug="construction" /></AB></DCArtboard>
      <DCArtboard id="ind-power" label="Industry · Power & Energy" width={1440} height={4002}><AB><IndustryDetailPage slug="power" /></AB></DCArtboard>
      <DCArtboard id="ind-marine" label="Industry · Marine & Offshore" width={1440} height={4002}><AB><IndustryDetailPage slug="marine" /></AB></DCArtboard>
      <DCArtboard id="ind-steel" label="Industry · Steel & Metals" width={1440} height={4002}><AB><IndustryDetailPage slug="steel" /></AB></DCArtboard>
    </DCSection>

    <DCSection id="longform" title="05 · Long-form templates" subtitle="Three editorial patterns recoloured from the earlier concepts — feature spreads, the service ledger, and the seven-part deep case. These are the reference set for anything long-form on the platform.">
      <DCArtboard id="lf-editorial" label="Services · editorial feature spreads" width={1440} height={3859}><AB><ServicesEditorialPage /></AB></DCArtboard>
      <DCArtboard id="lf-ledger" label="Services · log & bench notes" width={1440} height={2420}><AB><ServiceLedgerPage /></AB></DCArtboard>
      <DCArtboard id="lf-case-7part" label="Case study · seven-part oilfield format" width={1440} height={8478}><AB><CaseFullPage /></AB></DCArtboard>
    </DCSection>

    <DCSection id="tools" title="06 · Catalogue tools & surfaces" subtitle="The working parts of the storefront: obsolete-part cross-reference, the category landing, a brand page, the ⌘K palette and the compare tray.">
      <DCArtboard id="replacement" label="Replacement · cross-reference finder" width={1440} height={3047}><AB><ReplacementPage /></AB></DCArtboard>
      <DCArtboard id="cat-index" label="Categories · index" width={1440} height={2583}><AB><CategoryIndexPage /></AB></DCArtboard>
      <DCArtboard id="brand-detail" label="Brand detail · Bosch Rexroth" width={1440} height={2758}><AB><BrandDetailPage /></AB></DCArtboard>
      <DCArtboard id="palette" label="⌘K command palette · overlay" width={1440} height={900}><AB><CommandPalettePage /></AB></DCArtboard>
      <DCArtboard id="compare-tray" label="Compare tray · docked state" width={1440} height={2150}><AB><CompareTrayPage /></AB></DCArtboard>
    </DCSection>

    <DCSection id="account" title="07 · Account" subtitle="Optional — quoting works without an account. It only saves re-typing.">
      <DCArtboard id="signin" label="Sign in" width={1440} height={1232}><AB><SignInPage /></AB></DCArtboard>
      <DCArtboard id="signup" label="Sign up" width={1440} height={1232}><AB><SignUpPage /></AB></DCArtboard>
      <DCArtboard id="forgot" label="Forgot password" width={1440} height={1232}><AB><ForgotPage /></AB></DCArtboard>
      <DCArtboard id="acct-dash" label="Account · overview" width={1440} height={1079}><AB><AccountDashboard /></AB></DCArtboard>
      <DCArtboard id="acct-quotes" label="Account · my quotes" width={1440} height={1111}><AB><AccountQuotes /></AB></DCArtboard>
      <DCArtboard id="saved" label="Account · saved list" width={1440} height={2000}><AB><SavedListPage /></AB></DCArtboard>
    </DCSection>

    <DCSection id="editorial" title="08 · Editorial & company" subtitle="Trust, plus the long-tail search surface.">
      <DCArtboard id="about" label="About" width={1440} height={2453}><AB><AboutPage /></AB></DCArtboard>
      <DCArtboard id="blog" label="Insights index" width={1440} height={2140}><AB><BlogPage /></AB></DCArtboard>
      <DCArtboard id="post" label="Insights · article" width={1440} height={2071}><AB><BlogPostPage /></AB></DCArtboard>
      <DCArtboard id="contact" label="Contact" width={1440} height={1549}><AB><ContactPage /></AB></DCArtboard>
    </DCSection>

    <DCSection id="system" title="09 · System & utility" subtitle="The pages nobody designs until they're needed.">
      <DCArtboard id="404" label="404 — not found" width={1440} height={1030}><AB><NotFoundPage /></AB></DCArtboard>
      <DCArtboard id="maint" label="Maintenance" width={1440} height={760}><AB><MaintenancePage /></AB></DCArtboard>
    </DCSection>

    <DCSection id="policy" title="10 · Policy & legal" subtitle="One template, five content sets. Sticky policy switcher, numbered sections, an at-a-glance rail.">
      <DCArtboard id="pol-shipping" label="Shipping" width={1440} height={2372}><AB><PolicyPage slug="shipping" /></AB></DCArtboard>
      <DCArtboard id="pol-returns" label="Returns" width={1440} height={2247}><AB><PolicyPage slug="returns" /></AB></DCArtboard>
      <DCArtboard id="pol-warranty" label="Warranty" width={1440} height={2249}><AB><PolicyPage slug="warranty" /></AB></DCArtboard>
      <DCArtboard id="pol-privacy" label="Privacy" width={1440} height={2168}><AB><PolicyPage slug="privacy" /></AB></DCArtboard>
      <DCArtboard id="pol-terms" label="Terms of sale" width={1440} height={2270}><AB><PolicyPage slug="terms" /></AB></DCArtboard>
    </DCSection>

    <DCSection id="admin-cat" title="11 · Console — catalogue operations" subtitle="Backend, same language: navy chrome, signal blue for the one action that matters. Desktop-only by decision.">
      <DCArtboard id="adm-dash" label="Dashboard" width={1440} height={900}><AB><AdminDashboard /></AB></DCArtboard>
      <DCArtboard id="adm-prod" label="Product master" width={1440} height={965}><AB><AdminProducts /></AB></DCArtboard>
      <DCArtboard id="adm-edit" label="Product editor" width={1440} height={1012}><AB><AdminProductEdit /></AB></DCArtboard>
      <DCArtboard id="adm-cats" label="Categories" width={1440} height={922}><AB><AdminCategories /></AB></DCArtboard>
      <DCArtboard id="adm-inv" label="Inventory" width={1440} height={900}><AB><AdminInventory /></AB></DCArtboard>
      <DCArtboard id="adm-price" label="Pricing & margin bands" width={1440} height={900}><AB><AdminPricing /></AB></DCArtboard>
      <DCArtboard id="adm-import" label="Bulk import · validation" width={1440} height={900}><AB><AdminBulkImport /></AB></DCArtboard>
    </DCSection>

    <DCSection id="admin-crm" title="12 · Console — demand & content" subtitle="The RFQ desk, the accounts behind it, and the pages that feed search.">
      <DCArtboard id="adm-quotes" label="Quotes & RFQ queue" width={1440} height={900}><AB><AdminQuotes /></AB></DCArtboard>
      <DCArtboard id="adm-cust" label="Customers" width={1440} height={900}><AB><AdminCustomers /></AB></DCArtboard>
      <DCArtboard id="adm-cust-1" label="Customer detail" width={1440} height={1000}><AB><AdminCustomerDetail /></AB></DCArtboard>
      <DCArtboard id="adm-cms" label="CMS · block editor" width={1440} height={900}><AB><AdminCms /></AB></DCArtboard>
      <DCArtboard id="adm-media" label="Media library" width={1440} height={900}><AB><AdminMedia /></AB></DCArtboard>
      <DCArtboard id="adm-seo" label="SEO" width={1440} height={932}><AB><AdminSeo /></AB></DCArtboard>
    </DCSection>

    <DCSection id="admin-plat" title="13 · Console — platform" subtitle="Access, configuration and the token set both surfaces read from.">
      <DCArtboard id="adm-users" label="Users & roles" width={1440} height={1056}><AB><AdminUsers /></AB></DCArtboard>
      <DCArtboard id="adm-set" label="Settings · quoting & SLA" width={1440} height={1102}><AB><AdminSettings /></AB></DCArtboard>
      <DCArtboard id="adm-infra" label="Infrastructure" width={1440} height={900}><AB><AdminInfra /></AB></DCArtboard>
      <DCArtboard id="adm-tokens" label="Design tokens" width={1440} height={900}><AB><AdminDesignTokens /></AB></DCArtboard>
    </DCSection>
  </DesignCanvas>;
}
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
