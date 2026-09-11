import sanitizeHtml from 'sanitize-html'

/**
 * Allow-list sanitiser for the inline SVG carried by a `diagram` block.
 *
 * The SVG reaches the page through `dangerouslySetInnerHTML`, and nothing
 * between the database column and that injection constrains it. An import
 * script writes the column directly; so does a hand-edited row; so, in
 * principle, does any staff user who can save an article. The column is
 * therefore untrusted input and this is the boundary.
 *
 * WHY AN ALLOW-LIST AND NOT A DENY-LIST
 *
 * SVG is a hostile format to filter by exclusion. Script execution is reachable
 * through `<script>`, through any `on*` handler on any element, through
 * `<foreignObject>` carrying arbitrary HTML, through `<use href="...">` and
 * `<image href="...">` pulling external documents, through `<a href="javascript:">`,
 * and through `<style>` or a `style="..."` attribute carrying `url()`. Every
 * one of those is a separate thing to remember to block. An allow-list forgets
 * nothing: an element or attribute that is not named below does not survive,
 * including whatever is added to the specification next.
 *
 * WHY THIS RUNS ON RENDER AND `sanitizeBlogProseHtml` RUNS ON SAVE
 *
 * The prose sanitiser deliberately runs at save time, reasoning that paying a
 * pass per reader to defend against something only a writer can introduce is
 * the wrong trade. That argument holds there and not here, for two reasons.
 * The write paths for a diagram are wider — every one of these blocks arrives
 * from an import script rather than from the editor, so a save-time hook would
 * never run on any of them. And the article route is statically rendered with
 * `revalidate = 3600`, so "on render" means once an hour per article, not once
 * per reader. The cost argument does not bite and the coverage argument does.
 */

/**
 * Structural and drawing elements only.
 *
 * Deliberately absent, each for its own reason:
 *   script, style          — execution
 *   foreignObject          — smuggles arbitrary HTML into an SVG context
 *   image, use             — fetch external documents by href
 *   a                      — javascript: URLs
 *   animate, animateMotion,
 *   animateTransform, set   — can retarget attributes after sanitisation
 *   filter and its 30-odd
 *   primitives              — large surface, no diagram here needs one
 */
const ALLOWED_TAGS = [
  'svg',
  'g',
  'defs',
  'title',
  'desc',
  'path',
  'rect',
  'circle',
  'ellipse',
  'line',
  'polyline',
  'polygon',
  'text',
  'tspan',
  'marker',
  'linearGradient',
  'radialGradient',
  'stop',
  'clipPath',
]

/**
 * Geometry and presentation attributes.
 *
 * `style` is absent on purpose — it accepts `url()` and, historically, worse.
 * Everything a diagram needs is expressible as a presentation attribute.
 *
 * `href` and `xlink:href` are absent everywhere, which is what makes the
 * omission of `use` and `image` above actually stick.
 *
 * `id` is allowed only on the elements that are legitimately referenced from
 * within the same fragment — a gradient or a clip path. Allowing it generally
 * would let a diagram collide with an id the page itself uses.
 */
const GEOMETRY = [
  'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry',
  'd', 'points', 'width', 'height', 'transform', 'offset', 'dx', 'dy',
]

const PRESENTATION = [
  'fill', 'fill-opacity', 'fill-rule', 'stroke', 'stroke-width', 'stroke-opacity',
  'stroke-dasharray', 'stroke-dashoffset', 'stroke-linecap', 'stroke-linejoin',
  'opacity', 'font-size', 'font-family', 'font-weight', 'font-style',
  'text-anchor', 'letter-spacing', 'word-spacing', 'dominant-baseline',
  'alignment-baseline', 'paint-order', 'class',
]

const COMMON = [...GEOMETRY, ...PRESENTATION]

const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    svg: [...COMMON, 'viewBox', 'xmlns', 'preserveAspectRatio', 'role', 'aria-label'],
    g: COMMON,
    defs: [],
    title: [],
    desc: [],
    path: COMMON,
    rect: COMMON,
    circle: COMMON,
    ellipse: COMMON,
    line: COMMON,
    polyline: COMMON,
    polygon: COMMON,
    text: COMMON,
    tspan: COMMON,
    marker: [...COMMON, 'id', 'markerWidth', 'markerHeight', 'refX', 'refY', 'orient', 'markerUnits'],
    linearGradient: [...COMMON, 'id', 'gradientUnits', 'gradientTransform'],
    radialGradient: [...COMMON, 'id', 'gradientUnits', 'gradientTransform', 'fx', 'fy'],
    stop: [...COMMON, 'stop-color', 'stop-opacity'],
    clipPath: [...COMMON, 'id', 'clipPathUnits'],
  },
  // No schemes are permitted anywhere, because no attribute that takes a URL is
  // on the list above. Stated explicitly so that adding one later is a
  // deliberate act rather than an accident.
  allowedSchemes: [],
  // Drop the CONTENTS of a stripped tag, not just its tags. Without this a
  // `<script>alert(1)</script>` sanitises down to a bare `alert(1)` text node
  // that then renders as visible text inside the diagram.
  nonTextTags: ['script', 'style', 'foreignObject'],
  // SVG element and attribute names are case-sensitive: `viewBox`, `clipPath`
  // and `markerWidth` all stop working if the parser folds them to lower case,
  // and a lower-cased `viewBox` fails silently — the diagram renders at its
  // raw pixel size and overflows the column rather than throwing.
  parser: { lowerCaseTags: false, lowerCaseAttributeNames: false },
}

/**
 * Returns sanitised SVG markup, or an empty string if nothing survived.
 *
 * Idempotent: sanitising already-clean markup is a no-op, so calling this
 * twice anywhere is harmless.
 */
export function sanitizeDiagramSvg(svg: string): string {
  if (!svg) return ''
  const clean = sanitizeHtml(svg, OPTIONS).trim()
  // A fragment whose root element did not survive is not a diagram. Returning
  // the orphaned children would inject loose `<text>` nodes into the article.
  return clean.startsWith('<svg') ? clean : ''
}
