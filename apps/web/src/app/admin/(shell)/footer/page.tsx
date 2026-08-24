import { permanentRedirect } from 'next/navigation'

/**
 * The Footer editor moved under Navigation.
 *
 * It shipped as its own sidebar section, which put the `footer_main` and
 * `footer_legal` menus behind two different screens — this one and the
 * per-menu Navigation editor — with different save semantics and no way for
 * either to know what the other had done. Navigation → Footer is now the one
 * screen, and this is kept as a redirect rather than deleted: the section
 * existed long enough to be bookmarked, and a 404 would read as the feature
 * having been removed.
 */
export default function RetiredFooterSectionPage(): never {
  permanentRedirect('/admin/navigation/footer')
}
