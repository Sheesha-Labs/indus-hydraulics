/**
 * Closes the drawer on any other navigation (05 §6.3). A soft navigation leaves an unmatched parallel slot
 * showing its previous content, so the Why? drawer would linger over the next page; this catch-all matches
 * every URL the intercepting `(.)why/[evidenceId]` route does not, and renders nothing. Keep it returning
 * null, like `../default.tsx` (which covers hard navigations).
 */
export default function DrawerCatchAll() {
  return null
}
