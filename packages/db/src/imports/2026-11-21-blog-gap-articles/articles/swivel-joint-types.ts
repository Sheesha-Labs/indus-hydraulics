import type { BlogArticleSeed } from '../shared'

/**
 * Pipe and hose swivel joint types. Figures are from the live hose-swivel-joints and live-swivels
 * listings: single ball race joints 1" to 4" (DN 25 to DN 100), BSP or NPT thread or EN / ANSI / TW /
 * TTMA flange ends, stainless 316L, aluminium, brass, gun metal, titanium or Hastelloy by size; double
 * ball race heavy-duty joints 1" to 10" (DN 25 to DN 250), stainless 316L or aluminium, thread or flange
 * per order; both 16 to 25 bar by size and material, seals FKM, NBR, EPDM, FFKM or PTFE. Hydraulic live
 * swivels: in-line 3,000 psi in 1/4" to 3/4" (JIC, NPTF and SAE O-ring boss ends) and 90 degree 5,000 psi
 * in 1/4" to 3/4" (JIC, NPTF, NPSM female union and O-ring boss ends). Multi-plane swivels, rotary unions,
 * hose reel swivels and pipe ball joints are described without implying they are listed. No speed,
 * cycle-life or temperature figure is given because none is published on the listings.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'swivel-joint-types',
  title: 'Pipe and hose swivel joint types: ball race joints, live swivels and when to fit one',
  excerpt:
    'A swivel joint lets a hose or pipe turn under pressure without twisting. The main types are ball race swivel joints for transfer hose, hydraulic live swivels in straight and 90° forms, multi-plane swivels on loading arms, and rotary unions on machines that spin. How each works and how to size one.',
  categorySlug: 'hose-assembly',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Pipe Swivel Joint Types: Ball Race Joints and Live Swivels',
  seoDescription:
    'Pipe and hose swivel joint types: single and double ball race joints, in-line and 90° hydraulic live swivels, how a swivel works, sizes, ends and ratings.',
  focusKeyword: 'pipe swivel joint types',
  publishedAt: '2026-11-21T10:00:00.000Z',
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What are the types of pipe swivel joint?',
      answer:
        'The main types are ball race swivel joints, which give free rotation between a transfer hose and a pipe, nozzle or coupling; hydraulic live swivels, in-line or 90°, which let a pressurised hydraulic line turn; multi-plane swivels, which combine several joints on loading arms; and rotary unions, which feed fluid into a machine that spins continuously.',
    },
    {
      type: 'key_takeaways',
      items: [
        'A swivel joint rotates under pressure. Bearings take the load and a separate seal holds the fluid, so the hose turns instead of twisting.',
        'Ball race swivel joints suit transfer hose. Single ball race joints are the standard-duty type; double ball race joints spread heavy side loads over two rows of balls.',
        'Hydraulic live swivels are compact high-pressure swivels for hose ends. Our in-line swivels are rated 3,000 psi and our 90° swivels 5,000 psi, in 1/4 in to 3/4 in.',
        'A swivel nut on a JIC or NPSM hose end is not a live swivel. It turns only while you tighten it.',
        'Size a swivel by the hose bore, the end connections, the working pressure, the fluid and the seal material, and by whether it must carry side load.',
      ],
    },
    {
      type: 'lead',
      html: 'Twist damage usually starts with a hose that has to turn and has nothing to let it. A tanker loading hose swung through an arc, a hose on a boom pivot or a hose reel all try to wind the hose up. A swivel joint takes that rotation instead. This article sets out the swivel joint types, what our <a href="/c/hose-swivel-joints">hose swivel joints</a> and <a href="/c/live-swivels">live swivels</a> listings actually are, and how to choose. For the damage twist does, read <a href="/blog/hydraulic-hose-installed-with-a-twist">installed with a twist</a>.',
    },

    { type: 'section_head', number: '/01', title: 'How a swivel joint works.', anchor: 'how-it-works' },
    {
      type: 'paragraph',
      html: 'A swivel joint has two bodies that turn against each other. Between them, one or more rows of balls run in hardened races, much like a bearing. The balls hold the two halves together and carry the axial pull and any side load. A seal, usually an O-ring or lip seal, sits separately and holds the pressure. Because the bearing and the seal are separate jobs, the joint can turn freely with fluid flowing through it. A hydraulic swivel works the same way at higher pressure and smaller size.',
    },
    {
      type: 'paragraph',
      html: 'That is different from a swivel nut. The female JIC, ORFS or NPSM nut on a hose end turns only to let you tighten it without twisting the hose. Once it is tight, the joint is rigid. If the hose must keep turning in service, it needs a live swivel. The thread side is explained in <a href="/blog/npt-npsm-and-sae-hose-fittings">NPT, NPSM and SAE hose fittings</a>.',
    },

    { type: 'section_head', number: '/02', title: 'Ball race hose swivel joints.', anchor: 'ball-race' },
    {
      type: 'paragraph',
      html: 'These are the swivel joints on transfer hose: between a hose assembly and a fixed point on a plant or pipe system, or between the hose and the coupling, nozzle or equipment on its end. Both types on our <a href="/c/hose-swivel-joints">hose swivel joints</a> shelf are rated 16 to 25 bar depending on size and material, with seals in FKM, NBR, EPDM, FFKM or PTFE to suit the product.',
    },
    {
      type: 'comparison_table',
      caption: 'Ball race swivel joints on our listings',
      columns: ['Feature', 'Single ball race', 'Double ball race (heavy duty)'],
      rows: [
        { cells: ['Duty', 'Standard: free rotation between hose and end fitting', 'Heavy side loads, at a fixed point of a plant or pipe system'] },
        { cells: ['Sizes', '1 in to 4 in (DN 25 to DN 100)', '1 in to 10 in (DN 25 to DN 250)'] },
        { cells: ['Ends', 'BSP or NPT thread, or EN, ANSI, TW or TTMA flange', 'Thread or flange, specified per order'] },
        { cells: ['Body', 'Stainless 316L, aluminium, brass or gun metal, titanium, Hastelloy (by size)', 'Stainless 316L or aluminium'] },
        { cells: ['Working pressure', '16 to 25 bar by size and material', '16 to 25 bar by size and material'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Pick the <a href="/p/manntek-swivel-joint-single-ball-race">single ball race swivel joint</a> when the joint only has to turn, for example on the end of a hose that is connected and disconnected by hand. Pick the <a href="/p/manntek-heavy-duty-swivel-joint-double-ball-race">double ball race swivel joint</a> when the hose hangs off the joint or is dragged sideways, because the second row of balls carries the bending load the first would wear under. Both include a 2 in (DN 50) size. For the hose and couplings around them, see <a href="/blog/tanker-loading-and-vapour-recovery-hose">tanker loading and vapour recovery hose</a>.',
    },

    { type: 'section_head', number: '/03', title: 'Hydraulic live swivels.', anchor: 'live-swivels' },
    {
      type: 'paragraph',
      html: 'A live swivel is a small high-pressure swivel fitted at a hose end or port. It lets a hydraulic hose rotate under pressure where a machine pivots, a hose drops from a boom or a tool is turned in the hand. The <a href="/c/live-swivels">live swivels</a> shelf carries two forms: straight <a href="/p/hydraulics-inc-in-line-hydraulic-live-swivels">in-line live swivels</a> rated 3,000 psi, and <a href="/p/hydraulics-inc-90-hydraulic-live-swivels">90° live swivels</a> rated 5,000 psi. The 90° form both turns the line through a right angle and lets it rotate, so it does the job of an elbow and a swivel in one.',
    },
    {
      type: 'comparison_table',
      caption: 'Hydraulic live swivels: sizes and end combinations on our listings (M = male, F = female, ORB = SAE O-ring boss)',
      columns: ['Size', 'In-line (3,000 psi)', '90° (5,000 psi)'],
      rows: [
        { cells: ['1/4 in', 'NPTF F × NPTF M', 'JIC M × ORB M; NPTF M × ORB M; NPTF M × NPTF F; NPTF F × ORB M; NPTF F × NPTF M'] },
        { cells: ['3/8 in', 'JIC M × JIC F; JIC M × NPTF F; NPTF F × ORB M; NPTF F × NPTF M', 'JIC M × ORB M; JIC M × NPTF F; NPTF M × ORB M; NPTF M × NPTF F; NPTF F × NPTF F; NPTF F × ORB M; NPTF F × NPTF M; NPSM F union × NPTF F'] },
        { cells: ['1/2 in', 'JIC M × JIC F; JIC M × NPTF F; NPTF F × ORB M; NPTF F × NPTF M', 'JIC M × ORB M; JIC M × NPTF F; NPTF M × ORB M; NPTF M × NPTF F; NPTF F × ORB M; NPTF F × NPTF M; NPSM F union × NPTF F'] },
        { cells: ['5/8 in', 'JIC M × JIC F', 'Not listed'] },
        { cells: ['3/4 in', 'JIC M × JIC F; JIC M × NPTF F; NPTF F × NPTF M', 'JIC M × NPTF F; NPSM F union × NPTF F'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Live swivels are made to let a line turn as a machine moves, not to spin continuously. The listings give no speed rating, so treat them as swivels for turning and oscillating, and use a rotary union where the shaft spins. Match the rated pressure to the circuit, including pressure spikes, and the end threads to the ports. ORB here is SAE straight-thread O-ring boss; the thread families are compared in <a href="/blog/jic-orfs-and-npt-hose-fittings">JIC, ORFS and NPT hose fittings</a>.',
    },

    { type: 'section_head', number: '/04', title: 'Other swivel joint types.', anchor: 'other-types' },
    {
      type: 'prose',
      html: '<p>These types exist and are worth knowing when you specify a system, but they are not on our swivel shelves:</p><ul><li><strong>Multi-plane swivel joints.</strong> Two or three swivels joined by elbows so a pipe can move in more than one plane. They are the joints on marine and tanker loading arms and on hard-piped hose connections that must follow a moving vessel or vehicle.</li><li><strong>Rotary unions.</strong> Built for continuous rotation, feeding water, steam, oil or air into a rotating drum, roll, spindle or table.</li><li><strong>Hose reel swivels.</strong> The inlet swivel on the axle of a hose reel that lets the drum wind and unwind while the supply stays connected.</li><li><strong>Pipe ball joints.</strong> These allow angular movement of a few degrees to take up misalignment or settlement, rather than continuous rotation.</li><li><strong>High-pressure flow-line swivels.</strong> Used on well service treating lines, covered in <a href="/blog/flow-iron-explained">flow iron explained</a>.</li></ul>',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'A swivel does not fix a bad route.',
      body: 'A swivel stops the hose twisting about its own axis. It does not stop a hose being bent too tightly or pulled past its length. Route the hose to its minimum bend radius first, then add a swivel where it has to turn.',
    },
    {
      type: 'paragraph',
      html: 'Routing rules are in <a href="/blog/hose-routing-bend-radius-twist">hose routing: bend radius, twist and the failures they cause</a>.',
    },

    { type: 'section_head', number: '/05', title: 'What to send us.', anchor: 'what-to-send' },
    {
      type: 'prose',
      html: '<p>Indus quotes and ships swivel joints and live swivels from Dubai, UAE. To size one, send:</p><ul><li>The hose bore, or the size of the port it fits.</li><li>Both end connections: thread type and gender, or flange standard and class.</li><li>The working pressure, and for hydraulics, any pressure spikes.</li><li>The fluid and temperature, so we can choose the body and seal material.</li><li>Whether the joint carries the hose weight or a side load, and whether it turns occasionally or rotates continuously.</li></ul><p>Browse the <a href="/c/hose-swivel-joints">hose swivel joints</a> and <a href="/c/live-swivels">live swivels</a> shelves.</p>',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'How does a swivel joint work?',
          answer:
            'Two bodies turn against each other on one or more rows of balls running in races. The balls carry the axial and side loads, and a separate seal holds the pressure, so the joint rotates with fluid flowing through it.',
        },
        {
          question: 'What is a hydraulic live swivel?',
          answer:
            'A compact swivel fitted at a hydraulic hose end or port that lets the line rotate under pressure. Our live swivels come in-line at 3,000 psi and at 90° at 5,000 psi, in 1/4 in to 3/4 in.',
        },
        {
          question: 'What is the difference between a single and a double ball race swivel joint?',
          answer:
            'A single ball race joint is the standard type, for free rotation between a hose and its end fitting. A double ball race joint has two rows of balls and is built for heavy side loads at a fixed point of a plant or pipe system.',
        },
        {
          question: 'Do you supply 2 inch hose swivel joints?',
          answer:
            'Yes. Both the single and double ball race swivel joints include a 2 in (DN 50) size, with thread or flange ends.',
        },
        {
          question: 'Is a swivel nut the same as a live swivel?',
          answer:
            'No. A swivel nut on a JIC, ORFS or NPSM hose end turns only while it is being tightened. A live swivel keeps rotating under pressure in service.',
        },
        {
          question: 'Can a live swivel be used for continuous rotation?',
          answer:
            'Our listings give no speed rating, so use live swivels for turning and oscillating movement. Continuous rotation is the job of a rotary union.',
        },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Swivel joints and live swivels',
      skus: ['IH-MNT-SWV-S', 'IH-MNT-SWV-HD', 'IH-HYD-IN-LINE-LIVE-SWIVEL', 'IH-HYD-90-LIVE-SWIVEL'],
    },
    {
      type: 'category_link',
      slug: 'hose-swivel-joints',
      label: 'Hose swivel joints',
      blurb: 'Single and double ball race swivel joints, 1 in to 10 in, thread or flange ends, in stainless, aluminium and special alloys.',
    },
    {
      type: 'category_link',
      slug: 'live-swivels',
      label: 'Live swivels',
      blurb: 'In-line and 90° hydraulic live swivels, 1/4 in to 3/4 in, with JIC, NPTF, NPSM and O-ring boss ends.',
    },
    {
      type: 'related_articles',
      slugs: ['hydraulic-hose-installed-with-a-twist', 'hose-routing-bend-radius-twist', 'npt-npsm-and-sae-hose-fittings', 'tanker-loading-and-vapour-recovery-hose'],
    },
    {
      type: 'cta_block',
      heading: 'Need a hose to turn without twisting?',
      body: 'Send the bore, the end connections, the pressure and the fluid. We will propose the swivel joint or live swivel and quote it from Dubai, alone or built into the hose assembly.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
