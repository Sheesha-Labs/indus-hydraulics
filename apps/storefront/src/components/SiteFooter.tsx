import { getTranslations } from 'next-intl/server'

export default async function SiteFooter({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: 'nav' })

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
              {t('footerTagline')}
            </p>
            <p className="font-mono text-[11px] text-[oklch(0.6_0_0)] mt-4">
              ISO 9001:2015 Certified
            </p>
          </div>

          {/* Products */}
          <div>
            <h3 className="font-mono text-[10px] tracking-[0.14em] text-[oklch(0.5_0_0)] uppercase mb-3">
              {t('products')}
            </h3>
            <ul className="flex flex-col gap-2 text-[13px] text-[oklch(0.75_0_0)]">
              {['Hydraulic Pumps', 'Valves & Manifolds', 'Hydraulic Cylinders', 'Hoses & Fittings', 'Power Packs', 'Seals & Accessories'].map((item) => (
                <li key={item}>
                  <a href={`/${locale}/c`} className="hover:text-white transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-mono text-[10px] tracking-[0.14em] text-[oklch(0.5_0_0)] uppercase mb-3">
              {t('company')}
            </h3>
            <ul className="flex flex-col gap-2 text-[13px] text-[oklch(0.75_0_0)]">
              <li><a href={`/${locale}/about`} className="hover:text-white transition-colors">{t('about')}</a></li>
              <li><a href={`/${locale}/brands`} className="hover:text-white transition-colors">{t('brands')}</a></li>
              <li><a href={`/${locale}/industries`} className="hover:text-white transition-colors">{t('industries')}</a></li>
              <li><a href={`/${locale}/blog`} className="hover:text-white transition-colors">{t('blog')}</a></li>
              <li><a href={`/${locale}/contact`} className="hover:text-white transition-colors">{t('contact')}</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-mono text-[10px] tracking-[0.14em] text-[oklch(0.5_0_0)] uppercase mb-3">
              {t('contact')}
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
            <a href={`/${locale}/privacy`} className="hover:text-white transition-colors">Privacy</a>
            <a href={`/${locale}/terms`} className="hover:text-white transition-colors">Terms</a>
            <a href={`/${locale}/sitemap.xml`} className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
