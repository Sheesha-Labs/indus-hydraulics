/**
 * The nav mark, per 01-design-language.md §5: a 34px rounded square in navy
 * carrying a monospace "IH", with a 5px steel dot at the bottom-right.
 *
 * This is a CSS construction standing in for a real asset. The handoff is
 * explicit that it should be replaced when the client supplies the logo —
 * which is why it lives in one component rather than being inlined at each
 * of its call sites.
 *
 * On a navy ground the navy square would disappear, so `onNavy` lifts it to
 * the raised navy step.
 */
export default function LogoMark({ size = 34, onNavy = false }: { size?: number; onNavy?: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`relative grid shrink-0 place-items-center font-mono font-medium text-white ${
        onNavy ? 'bg-ih-navy-2' : 'bg-ih-navy'
      }`}
      style={{ width: size, height: size, borderRadius: Math.round(size * 0.206), fontSize: Math.round(size * 0.382) }}
    >
      IH
      <span
        className="absolute rounded-full bg-ih-steel"
        style={{ right: size * 0.118, bottom: size * 0.118, width: size * 0.147, height: size * 0.147 }}
      />
    </span>
  )
}
