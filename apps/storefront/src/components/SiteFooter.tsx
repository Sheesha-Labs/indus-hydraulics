export default function SiteFooter() {
  return (
    <footer className="bg-[var(--color-primary)] text-[var(--color-surface)] mt-auto">
      <div className="max-w-[1360px] mx-auto px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[var(--color-accent)] grid place-items-center">
                <span className="text-white font-bold text-sm font-mono">IH</span>
              </div>
              <span className="font-semibold text-sm text-white">Indus Hydraulics</span>
            </div>
            <p className="text-[13px] text-[oklch(0.7_0_0)] leading-relaxed">
              India&apos;s trusted distributor of industrial hydraulic components since 2005.
            </p>
            <p className="font-mono text-[11px] text-[oklch(0.6_0_0)] mt-4">
              ISO 9001:2015 Certified
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-mono text-[10px] tracking-[0.14em] text-[oklch(0.5_0_0)] uppercase mb-3">
              Products
            </h3>
            <ul className="flex flex-col gap-2 text-[13px] text-[oklch(0.75_0_0)]">
              {['Hydraulic Pumps', 'Valves & Manifolds', 'Hydraulic Cylinders', 'Hoses & Fittings', 'Power Packs', 'Seals & Accessories'].map((item) => (
                <li key={item}>
                  <a href={`/c`} className="hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-mono text-[10px] tracking-[0.14em] text-[oklch(0.5_0_0)] uppercase mb-3">
              Company
            </h3>
            <ul className="flex flex-col gap-2 text-[13px] text-[oklch(0.75_0_0)]">
              <li><a href={`/about`} className="hover:text-white transition-colors">About</a></li>
              <li><a href={`/brands`} className="hover:text-white transition-colors">Brands</a></li>
              <li><a href={`/industries`} className="hover:text-white transition-colors">Industries</a></li>
              <li><a href={`/blog`} className="hover:text-white transition-colors">Blog</a></li>
              <li><a href={`/contact`} className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-mono text-[10px] tracking-[0.14em] text-[oklch(0.5_0_0)] uppercase mb-3">
              Contact
            </h3>
            <div className="flex flex-col gap-3 text-[13px] text-[oklch(0.75_0_0)]">
              <div>
                <div className="font-mono text-[10px] text-[oklch(0.5_0_0)] uppercase mb-0.5">Mumbai HQ</div>
                <div>+91 22 6614 0200</div>
                <div>sales@indushydraulics.com</div>
              </div>
              <div>
                <div className="font-mono text-[10px] text-[oklch(0.5_0_0)] uppercase mb-0.5">Hours</div>
                <div>Mon–Sat 09:00–19:00 IST</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-10 pt-8 border-t border-[oklch(0.25_0_0)]">
          <p className="font-mono text-[11px] text-[oklch(0.45_0_0)]">
            © {new Date().getFullYear()} Indus Hydraulics Pvt. Ltd. All rights reserved.
          </p>
          <div className="flex gap-6 font-mono text-[11px] text-[oklch(0.5_0_0)]">
            <a href={`/privacy`} className="hover:text-white transition-colors">Privacy</a>
            <a href={`/terms`} className="hover:text-white transition-colors">Terms</a>
            <a href={`/sitemap.xml`} className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
