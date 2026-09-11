/**
 * Can AI models embedded in humanoid robots adequately operate offshore rigs?
 *
 * Generated from `docs/articles/a1-humanoid-offshore.html`, which is the editable source for this
 * article's prose and its figures. The SVG in each `diagram` block is the
 * figure as authored there; regenerate rather than hand-editing the markup
 * here, or the two drift and the HTML is the one people will read.
 *
 * Blocks added on top of the converted document, because they are structure
 * the source has no place for: `key_takeaways` and `direct_answer` open the
 * article for retrieval, `as_of_stamp` carries the verification date as a date
 * rather than as a sentence, and `cta_block` closes it — every article carries
 * one, and a research piece that ranks and offers no path to a quote is a cost
 * rather than an asset.
 */
import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: "humanoid-robots-offshore-rigs",
  title: "Can AI models embedded in humanoid robots adequately operate offshore rigs?",
  excerpt: "Four constraints bind humanoid deployment offshore \u2014 endurance, a deck that is not an inertial frame, explosion-protection certification, and validation. Only the first is a robotics problem.",
  categorySlug: 'physical-ai',
  authorSlug: 'ayush-bhatia',
  seoTitle: "Humanoid robots on offshore rigs: what actually blocks deployment",
  seoDescription: "An analysis of the four constraints on humanoid robots offshore \u2014 locomotive energetics, dynamic balance on a moving deck, Ex certification, and the validation problem \u2014 and what deploys first.",
  focusKeyword: "humanoid robots offshore rigs",
  publishedAt: '2026-09-11T09:00:00.000Z',
  bodyBlocks: [
  {
    type: "lead",
    html: "The honest answer is no, and the reasons are more interesting than the verdict. Three of the four binding constraints have nothing to do with how intelligent the model is."
  },
  {
    type: "key_takeaways",
    heading: "In short",
    items: [
      "Four constraints bind humanoid deployment offshore, and only one of them — endurance — is a robotics problem in the conventional sense.",
      "Every deployed offshore robotic capability performs reversible observation. None actuates anything of consequence, and that boundary is about permission rather than capability.",
      "A floating deck is not an inertial frame: apparent gravity rotates out of the support polygon without the robot changing posture or intent.",
      "Explosion-protection certification scales with actuator count and freezes the hardware, so offshore improvement runs on a certification cycle measured in quarters, not a training cycle measured in days.",
      "The validation problem has no statistical solution. Consequential offshore failures are too rare for any deployment programme to demonstrate a failure rate by experience."
    ]
  },
  {
    type: "direct_answer",
    question: "Can AI models embedded in humanoid robots adequately operate offshore rigs?",
    answer: "No, if operate means actuating consequential, irreversible systems without a human in the authorisation path. Humanoids will arrive offshore as supervised inspection and light-intervention platforms. The barrier is not perception, manipulation or reasoning — it is that no accepted method exists for licensing a stochastic policy to hold a safety function, and the rarity of the events that matter closes the statistical route to one."
  },
  {
    type: "prose",
    html: "<h3>Abstract</h3><p>The humanoid form factor is often defended offshore on the grounds that platforms are built for human bodies, so a human-shaped machine inherits the affordances for free. We accept that premise and argue it is not where the difficulty lies. Decomposing \"operating a rig\" into eight task classes shows that the verb conflates monitoring, intervention, maintenance and emergency response, which have radically different autonomy profiles. We then examine four constraints in ascending order of severity: locomotive energetics against a twelve-hour shift; dynamic balance on a deck that is itself an accelerating reference frame; explosion-protection certification, which is a hardware discipline largely orthogonal to model capability; and the validation problem, for which no amount of field experience can supply statistical sufficiency. Only the first is likely to yield to engineering within a decade. We conclude that humanoids will arrive offshore as supervised inspection and light-intervention platforms, and that <em>operate</em> is the wrong verb for what they will do.</p>"
  },
  {
    type: "section_head",
    number: "/01",
    title: "The question behind the question",
    anchor: "the-question-behind-the-question"
  },
  {
    type: "prose",
    html: "<p>There is a good argument for humanoid robots offshore, and it is worth stating properly before taking it apart. An offshore platform is a legacy interface. Its valve handwheels are sized for two hands. Its ladders are rungs at human pitch. Its walkways are shoulder-width, its doorways are human-height, its control panels sit at human eye level, and its stairwells turn at angles chosen for a person carrying a toolbag. None of this was designed for a machine; all of it was inherited from a century of accumulated convention about what a body can do.</p><p>Redesigning a platform around a machine is capital-intensive and slow. Retrofitting a machine to the platform is neither. On that reading, anthropomorphism is not an aesthetic preference or a marketing decision — it is a strategy for amortising the installed base. The humanoid is a compatibility layer.</p><p>This is a serious argument and we do not think it is wrong. Our objection is that it answers a question nobody is really asking. The interesting question is not <em>what shape should the robot be</em>. It is <em>what, precisely, do we mean by operate</em>, and the answer turns out to carry almost all of the difficulty.</p><p>It is worth recalling why this class of problem resists intuition. Moravec (1988) observed that the tasks humans find hardest — symbolic reasoning, chess, calculus — turned out to be computationally cheap, while the tasks a two-year-old performs without effort — grasping, balancing, walking over uneven ground — turned out to be extraordinarily expensive. Brooks (1990) made the complementary point that intelligence embedded in the world does not decompose cleanly into perception, then cognition, then action; the world is its own best model, and abstraction away from it discards precisely the information that made the behaviour work.</p><p>Both observations are now four decades old and both remain the correct starting point. The last five years have produced genuine advances in the layer Moravec identified as hard: vision-language-action models trained on large-scale, cross-embodiment demonstration corpora can now map a natural-language instruction onto a continuous action sequence, with some generalisation to unseen objects and unseen phrasings (Brohan <em>et al.</em>, 2023; Open X-Embodiment Collaboration, 2023; Kim <em>et al.</em>, 2024; Black <em>et al.</em>, 2024). That is a real result and it is easy to underrate.</p><blockquote><p>The capability that has advanced fastest is not the capability that binds.</p></blockquote><p>But it is also easy to over-read. What those systems demonstrate is competence at short-horizon manipulation in benign, instrumented, well-lit, mechanically forgiving environments. An offshore platform is none of those things, and the gap between the demonstration and the duty is not, for the most part, a gap in the model.</p>"
  },
  {
    type: "section_head",
    number: "/02",
    title: "What the verb \"operate\" conflates",
    anchor: "what-the-verb-operate-conflates"
  },
  {
    type: "prose",
    html: "<p>Offshore work is not one job. When an operator says a robot might \"operate\" a facility, the sentence is doing an enormous amount of quiet work, and the first analytical move is to make it explicit.</p><p>We find it useful to separate offshore activity into eight task classes, distinguished by two axes that matter far more than difficulty: the <strong>consequence of an error</strong>, and the <strong>reversibility of the action</strong>. Reversibility is the axis usually left out, and it is the one that decides what autonomy is permissible.</p><p><strong>Concept</strong></p><h3>Reversibility class</h3><p>A property of an action, not of the agent performing it. An action is <em>reversible</em> if the system state after an erroneous execution can be restored by a further action of comparable cost. Reading a gauge is reversible: a misreading costs nothing a second reading does not fix. Opening a valve on a live line is not: the fluid has left, the pressure has fallen, and no subsequent action restores the prior state.</p><p>This matters because almost all contemporary machine learning practice assumes reversibility implicitly. A misclassification is corrected by the next forward pass. A failed API call is retried. Physical actuation has no such property, and no amount of model quality supplies it.</p>"
  },
  {
    type: "diagram",
    svg: "<svg viewBox=\"0 0 760 470\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"ui-monospace,Menlo,monospace\"><rect width=\"760\" height=\"470\" fill=\"#fff\"/><rect x=\"90\" y=\"50\" width=\"310\" height=\"175\" fill=\"#faf7f5\"/><rect x=\"400\" y=\"225\" width=\"310\" height=\"175\" fill=\"#f7fbf8\"/><line x1=\"400\" y1=\"50\" x2=\"400\" y2=\"400\" stroke=\"#eef1f4\" stroke-width=\"1\"/><line x1=\"90\" y1=\"225\" x2=\"710\" y2=\"225\" stroke=\"#eef1f4\" stroke-width=\"1\"/><line x1=\"90\" y1=\"400\" x2=\"710\" y2=\"400\" stroke=\"#c9d0d7\" stroke-width=\"1\"/><line x1=\"90\" y1=\"400\" x2=\"90\" y2=\"50\" stroke=\"#c9d0d7\" stroke-width=\"1\"/><text x=\"400\" y=\"440\" font-size=\"11\" fill=\"#5d6873\" text-anchor=\"middle\" letter-spacing=\"1.2\">CONSEQUENCE OF ERROR</text><text x=\"34\" y=\"225\" font-size=\"11\" fill=\"#5d6873\" text-anchor=\"middle\" letter-spacing=\"1.2\" transform=\"rotate(-90 34 225)\">IRREVERSIBILITY</text><text x=\"250\" y=\"392\" font-size=\"9.5\" fill=\"#b3bcc5\" text-anchor=\"middle\" letter-spacing=\"1\">REVERSIBLE · LOW CONSEQUENCE</text><text x=\"555\" y=\"70\" font-size=\"9.5\" fill=\"#c9a99a\" text-anchor=\"middle\" letter-spacing=\"1\">IRREVERSIBLE · HIGH CONSEQUENCE</text><circle cx=\"150\" cy=\"360\" r=\"6\" fill=\"#2f6b4f\"/><text x=\"163\" y=\"364\" font-size=\"11.5\" fill=\"#2b3138\">Gauge and indicator reading</text><circle cx=\"196\" cy=\"332\" r=\"6\" fill=\"#2f6b4f\"/><text x=\"209\" y=\"336\" font-size=\"11.5\" fill=\"#2b3138\">Thermal and acoustic survey</text><circle cx=\"243\" cy=\"300\" r=\"6\" fill=\"#2f6b4f\"/><text x=\"256\" y=\"304\" font-size=\"11.5\" fill=\"#2b3138\">Leak detection round</text><circle cx=\"330\" cy=\"262\" r=\"6\" fill=\"#8a6d1f\"/><text x=\"343\" y=\"266\" font-size=\"11.5\" fill=\"#2b3138\">Sample collection</text><circle cx=\"392\" cy=\"205\" r=\"6\" fill=\"#8a6d1f\"/><text x=\"405\" y=\"209\" font-size=\"11.5\" fill=\"#2b3138\">Lubrication, consumable replacement</text><circle cx=\"500\" cy=\"158\" r=\"6\" fill=\"#8a6d1f\"/><text x=\"513\" y=\"162\" font-size=\"11.5\" fill=\"#2b3138\">Hose and fitting replacement</text><circle cx=\"592\" cy=\"112\" r=\"6\" fill=\"#8f3232\"/><text x=\"452\" y=\"100\" font-size=\"11.5\" fill=\"#2b3138\" text-anchor=\"end\">Valve actuation, live line</text><line x1=\"458\" y1=\"96\" x2=\"585\" y2=\"110\" stroke=\"#c9d0d7\" stroke-width=\".8\"/><circle cx=\"656\" cy=\"78\" r=\"6\" fill=\"#8f3232\"/><text x=\"516\" y=\"64\" font-size=\"11.5\" fill=\"#2b3138\" text-anchor=\"end\">Well-control intervention</text><line x1=\"522\" y1=\"60\" x2=\"649\" y2=\"74\" stroke=\"#c9d0d7\" stroke-width=\".8\"/><path d=\"M120 385 Q 300 330 400 240 T 600 95\" stroke=\"#8a4b2a\" stroke-width=\"1.4\" fill=\"none\" stroke-dasharray=\"5 4\"/><text x=\"112\" y=\"150\" font-size=\"10\" fill=\"#8a4b2a\" letter-spacing=\".8\">DEPLOYED AUTONOMY</text><text x=\"112\" y=\"165\" font-size=\"10\" fill=\"#8a4b2a\" letter-spacing=\".8\">FRONTIER, 2026</text></svg>",
    caption: "Eight offshore task classes plotted against consequence of error and irreversibility of action. The deployed autonomy frontier tracks the reversible, low-consequence diagonal almost exactly. This is neither coincidence nor a limitation of perception: it is the shape permissible autonomy takes when a wrong action cannot be undone.",
    captionPrefix: "FIG. 01",
    alt: "A scatter plot with consequence of error on the horizontal axis and irreversibility on the vertical. Eight offshore task classes are plotted. Gauge reading, thermal and acoustic survey and leak detection sit in the low-consequence, reversible corner at the lower left. Sample collection, lubrication and hose replacement occupy the middle. Valve actuation on a live line and well-control intervention sit in the high-consequence, irreversible corner at the upper right. A dashed curve labelled 'deployed autonomy frontier, 2026' runs along the lower-left diagonal, enclosing only the reversible tasks."
  },
  {
    type: "prose",
    html: "<p>The figure makes a point that is obvious once drawn and routinely missed in discussion. Every deployed offshore robotic capability sits in the lower-left region. Autonomous inspection robots on production platforms read gauges, detect leaks, run thermal and acoustic surveys, and record video. Every one of those is a <em>reversible observation</em>. None of them actuates anything of consequence.</p><p>The tasks that would constitute operating a facility — valve actuation on live systems, isolation, well control — sit in the upper right. The distance between the two regions is not a distance in model capability. It is a distance in what a wrong action costs, and no scaling law addresses it.</p>"
  },
  {
    type: "section_head",
    number: "/03",
    title: "Constraint I: the energetics of legs",
    anchor: "constraint-i-the-energetics-of-legs"
  },
  {
    type: "prose",
    html: "<p>The first hard constraint is the least discussed and the most likely to be solved, which is why we take it first.</p><p>Legged locomotion is expensive. The relevant figure of merit is the dimensionless cost of transport, and for electrically actuated bipeds it has historically sat well above both biological walking and wheeled locomotion. Some of that penalty is unavoidable: a walking machine performs negative work at every heel strike and must generate positive work to restore it. Much of it is not, and a decade of work on transmission compliance, gear ratio and actuator topology has narrowed the gap considerably.</p><p>But energetics offshore is not really about efficiency. It is about shift length.</p><p><strong>Concept</strong></p><h3>Cost of transport (CoT)</h3><p>A dimensionless measure of locomotive efficiency: the energy expended to move unit weight unit distance.</p><pre><code>CoT = E / (m · g · d)</code></pre><p>Lower is better. Human walking sits at roughly 0.2–0.3. Wheeled vehicles on hard level ground are substantially lower. Electrically actuated bipeds have historically been higher than human walking, though the gap has narrowed. The number matters offshore because it converts directly into how much of a shift a battery covers.</p><p>An offshore operational shift is twelve hours. A contemporary humanoid's endurance on a single charge is measured in hours — the figure varies by platform and duty cycle, and vendors quote it under favourable conditions — but nobody is claiming twelve. The mismatch is structural rather than marginal, and it forces one of three architectures.</p><p>The first is <strong>battery swap</strong>. Offshore this is not trivial. Hot-swapping a high-energy-density lithium pack is an ignition-risk activity; in a hazardous area it either requires a certified swap station or must occur in a designated safe area, which means the robot walks there and back, consuming further endurance and operator attention. The second is <strong>tethering</strong>, which solves power and communications at once, and is why so many genuinely deployed industrial robots are tethered — at the cost of the mobility that justified legs. The third is <strong>duty-cycle restriction</strong>: accept that the machine works a fraction of the shift and size the fleet accordingly.</p>"
  },
  {
    type: "diagram",
    svg: "<svg viewBox=\"0 0 760 330\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"ui-monospace,Menlo,monospace\"><rect width=\"760\" height=\"330\" fill=\"#fff\"/><text x=\"40\" y=\"30\" font-size=\"10.5\" fill=\"#8b95a1\" letter-spacing=\"1.3\">INDICATIVE COVERAGE OF A 12-HOUR SHIFT — SINGLE UNIT, SINGLE CHARGE</text><line x1=\"250\" y1=\"52\" x2=\"720\" y2=\"52\" stroke=\"#e2e6ea\"/><text x=\"250\" y=\"46\" font-size=\"9.5\" fill=\"#b3bcc5\">0h</text><text x=\"367\" y=\"46\" font-size=\"9.5\" fill=\"#b3bcc5\">3h</text><text x=\"485\" y=\"46\" font-size=\"9.5\" fill=\"#b3bcc5\">6h</text><text x=\"602\" y=\"46\" font-size=\"9.5\" fill=\"#b3bcc5\">9h</text><text x=\"720\" y=\"46\" font-size=\"9.5\" fill=\"#b3bcc5\" text-anchor=\"end\">12h</text><line x1=\"367\" y1=\"52\" x2=\"367\" y2=\"282\" stroke=\"#f0f3f5\"/><line x1=\"485\" y1=\"52\" x2=\"485\" y2=\"282\" stroke=\"#f0f3f5\"/><line x1=\"602\" y1=\"52\" x2=\"602\" y2=\"282\" stroke=\"#f0f3f5\"/><line x1=\"720\" y1=\"52\" x2=\"720\" y2=\"282\" stroke=\"#8f3232\" stroke-width=\"1\" stroke-dasharray=\"4 3\"/><text x=\"40\" y=\"86\" font-size=\"11.5\" fill=\"#2b3138\">Fixed sensor / camera</text><rect x=\"250\" y=\"74\" width=\"470\" height=\"15\" fill=\"#2f6b4f\" opacity=\".82\"/><text x=\"40\" y=\"124\" font-size=\"11.5\" fill=\"#2b3138\">Tethered crawler</text><rect x=\"250\" y=\"112\" width=\"470\" height=\"15\" fill=\"#2f6b4f\" opacity=\".82\"/><text x=\"40\" y=\"162\" font-size=\"11.5\" fill=\"#2b3138\">Wheeled / tracked rover</text><rect x=\"250\" y=\"150\" width=\"313\" height=\"15\" fill=\"#8a6d1f\" opacity=\".85\"/><rect x=\"563\" y=\"150\" width=\"157\" height=\"15\" fill=\"#eef1f4\"/><text x=\"40\" y=\"200\" font-size=\"11.5\" fill=\"#2b3138\">Quadruped, inspection duty</text><rect x=\"250\" y=\"188\" width=\"156\" height=\"15\" fill=\"#8a6d1f\" opacity=\".85\"/><rect x=\"406\" y=\"188\" width=\"314\" height=\"15\" fill=\"#eef1f4\"/><text x=\"40\" y=\"238\" font-size=\"11.5\" fill=\"#2b3138\">Humanoid, inspection duty</text><rect x=\"250\" y=\"226\" width=\"117\" height=\"15\" fill=\"#8f3232\" opacity=\".8\"/><rect x=\"367\" y=\"226\" width=\"353\" height=\"15\" fill=\"#eef1f4\"/><text x=\"40\" y=\"276\" font-size=\"11.5\" fill=\"#2b3138\">Humanoid, manipulation duty</text><rect x=\"250\" y=\"264\" width=\"70\" height=\"15\" fill=\"#8f3232\" opacity=\".8\"/><rect x=\"320\" y=\"264\" width=\"400\" height=\"15\" fill=\"#eef1f4\"/><text x=\"40\" y=\"312\" font-size=\"9.5\" fill=\"#b3bcc5\" letter-spacing=\".6\">SHADED = ON CHARGE, IN TRANSIT TO CHARGE, OR OUT OF SERVICE</text></svg>",
    caption: "Indicative shift coverage by platform class. The bars are order-of-magnitude and duty-dependent; the point is the ordering, not the precise lengths. Manipulation draws substantially more than locomotion alone, so the most capable configuration is also the shortest-lived.",
    captionPrefix: "FIG. 02",
    alt: "A horizontal bar chart showing how much of a twelve-hour offshore shift each platform class covers on one charge. Fixed sensors and tethered crawlers span the full twelve hours. A wheeled rover reaches about eight hours. A quadruped on inspection duty reaches about four. A humanoid on inspection duty reaches about three, and a humanoid on manipulation duty under two, each leaving a long shaded remainder marked as on charge, in transit to charge, or out of service."
  },
  {
    type: "prose",
    html: "<p>Note the perverse ordering the figure exposes. The configurations that justify a humanoid — bimanual manipulation, tool use, force-controlled intervention — drain the battery fastest. The machine is least enduring precisely when it is doing the thing that made its morphology worth paying for. We expect this constraint to soften over the coming decade through actuator and pack improvements. It is the only one of the four of which we would say that.</p>"
  },
  {
    type: "section_head",
    number: "/04",
    title: "Constraint II: the deck is not the ground",
    anchor: "constraint-ii-the-deck-is-not-the-ground"
  },
  {
    type: "prose",
    html: "<p>This constraint receives almost no attention in the humanoid literature and we think it is the most technically interesting of the four.</p><p>Every bipedal walking controller in production use rests, directly or indirectly, on a notion of dynamic balance defined against a fixed support surface. The dominant formulation is the zero-moment point (Vukobratović and Borovac, 2004), and the classical preview-control approach generates a centre-of-mass trajectory that keeps the ZMP within the support polygon over a receding horizon (Kajita <em>et al.</em>, 2003). Modern learned locomotion policies do not compute a ZMP explicitly, but they are trained in simulators whose ground planes are inertial and whose gravity vector is constant (Rudin <em>et al.</em>, 2022; Miki <em>et al.</em>, 2022).</p><p>A floating production unit is not an inertial frame. It moves in six degrees of freedom — surge, sway and heave in translation, roll, pitch and yaw in rotation — continuously, stochastically, and with a spectrum determined by sea state and vessel geometry (Faltinsen, 1990). In the deck frame, this has a specific and awkward consequence.</p><p><strong>Concept</strong></p><h3>Apparent gravity in a non-inertial support frame</h3><p>A walking controller reasons in the frame of the surface it stands on. When that surface accelerates, the effective gravity vector experienced in the deck frame is not <em>g</em> but</p><pre><code>g_eff(t) = g − a_deck(t)</code></pre><p>which varies in both magnitude and direction on the timescale of the wave period — typically several seconds. Every quantity derived from gravity varies with it: the support polygon tilts, the ZMP admissible region deforms, and the linear inverted-pendulum time constant, normally treated as a fixed property of the robot's height, becomes time-varying.</p><p>A controller that assumes constant <em>g</em> does not merely lose accuracy. It is solving a different problem from the one the world is posing.</p>"
  },
  {
    type: "diagram",
    svg: "<svg viewBox=\"0 0 760 400\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"ui-monospace,Menlo,monospace\"><rect width=\"760\" height=\"400\" fill=\"#fff\"/><text x=\"40\" y=\"30\" font-size=\"10.5\" fill=\"#8b95a1\" letter-spacing=\"1.3\">SUPPORT POLYGON AND APPARENT GRAVITY UNDER DECK MOTION</text><text x=\"150\" y=\"60\" font-size=\"10\" fill=\"#5d6873\" text-anchor=\"middle\" letter-spacing=\"1\">FIXED GROUND</text><line x1=\"55\" y1=\"250\" x2=\"245\" y2=\"250\" stroke=\"#5d6873\" stroke-width=\"2\"/><rect x=\"120\" y=\"238\" width=\"60\" height=\"12\" fill=\"#e2e6ea\" stroke=\"#8b95a1\"/><line x1=\"150\" y1=\"238\" x2=\"150\" y2=\"130\" stroke=\"#2b3138\" stroke-width=\"2\"/><circle cx=\"150\" cy=\"122\" r=\"13\" fill=\"#f6f7f8\" stroke=\"#2b3138\" stroke-width=\"2\"/><line x1=\"150\" y1=\"122\" x2=\"150\" y2=\"232\" stroke=\"#8a4b2a\" stroke-width=\"1.6\" stroke-dasharray=\"3 3\"/><circle cx=\"150\" cy=\"232\" r=\"4\" fill=\"#8a4b2a\"/><text x=\"158\" y=\"185\" font-size=\"10\" fill=\"#8a4b2a\">g</text><text x=\"150\" y=\"278\" font-size=\"9.5\" fill=\"#2f6b4f\" text-anchor=\"middle\">ZMP CENTRED</text><text x=\"150\" y=\"292\" font-size=\"9.5\" fill=\"#8b95a1\" text-anchor=\"middle\">STABLE MARGIN BOTH SIDES</text><line x1=\"330\" y1=\"60\" x2=\"330\" y2=\"330\" stroke=\"#eef1f4\"/><text x=\"545\" y=\"60\" font-size=\"10\" fill=\"#5d6873\" text-anchor=\"middle\" letter-spacing=\"1\">DECK IN ROLL AND HEAVE</text><g transform=\"rotate(-11 545 250)\"><line x1=\"450\" y1=\"250\" x2=\"640\" y2=\"250\" stroke=\"#5d6873\" stroke-width=\"2\"/><rect x=\"515\" y=\"238\" width=\"60\" height=\"12\" fill=\"#e2e6ea\" stroke=\"#8b95a1\"/><line x1=\"545\" y1=\"238\" x2=\"545\" y2=\"130\" stroke=\"#2b3138\" stroke-width=\"2\"/><circle cx=\"545\" cy=\"122\" r=\"13\" fill=\"#f6f7f8\" stroke=\"#2b3138\" stroke-width=\"2\"/></g><line x1=\"530\" y1=\"106\" x2=\"596\" y2=\"228\" stroke=\"#8f3232\" stroke-width=\"1.6\" stroke-dasharray=\"3 3\"/><circle cx=\"596\" cy=\"228\" r=\"4\" fill=\"#8f3232\"/><text x=\"574\" y=\"176\" font-size=\"10\" fill=\"#8f3232\">g_eff</text><path d=\"M 596 228 L 566 240\" stroke=\"#8f3232\" stroke-width=\"1\"/><text x=\"545\" y=\"292\" font-size=\"9.5\" fill=\"#8f3232\" text-anchor=\"middle\">ZMP OUTSIDE SUPPORT POLYGON</text><text x=\"545\" y=\"306\" font-size=\"9.5\" fill=\"#8b95a1\" text-anchor=\"middle\">RECOVERY STEP REQUIRED, OR FALL</text><text x=\"40\" y=\"352\" font-size=\"10.5\" fill=\"#5d6873\" letter-spacing=\".5\">The deck contributes a disturbance the robot did not cause, cannot predict from proprioception alone,</text><text x=\"40\" y=\"368\" font-size=\"10.5\" fill=\"#5d6873\" letter-spacing=\".5\">and cannot reject by stepping if the next wave arrives before the step completes.</text></svg>",
    caption: "Left: dynamic balance on a fixed support surface, the case every walking controller is designed and trained for. Right: the same machine on a rolling and heaving deck. The apparent gravity vector rotates out of the support polygon without any change in the robot's own posture or intent.",
    captionPrefix: "FIG. 03",
    alt: "Two side-by-side diagrams of a simplified biped standing on a surface. On the left, on fixed ground, the gravity vector falls vertically through the centre of the support polygon and the zero-moment point is centred with margin either side. On the right, the deck is tilted in roll and the apparent gravity vector, labelled g underscore eff, is rotated so that it falls outside the support polygon, even though the robot's posture is unchanged. The right-hand case is annotated as requiring a recovery step or resulting in a fall."
  },
  {
    type: "prose",
    html: "<p>There are three responses available and each has a cost. The robot can <strong>sense the deck directly</strong>, taking a feed from the vessel's motion reference unit and treating hull motion as a measured disturbance rather than an unmodelled one. This is technically the right answer and it creates a dependency: the robot's balance now relies on an external system, over a network, with a latency budget. The robot can be <strong>trained on simulated deck motion</strong> through domain randomisation over sea states (Tobin <em>et al.</em>, 2017), which is straightforward to implement and produces conservative, energy-hungry gaits. Or the robot can <strong>hold on</strong>.</p><blockquote><p>Offshore, the rule is three points of contact. A humanoid that walks freely across a moving deck is doing exactly what people who work there are trained not to do.</p></blockquote><p>The third option deserves more attention than it gets, because it points at something the first two miss. The three-points-of-contact rule exists in offshore practice precisely because unaided dynamic balance on a moving deck is understood to be insufficient — not for weak or careless people, but for anyone. Human offshore workers are not solving the balance problem the way a bipedal controller solves it. They are avoiding it, by maintaining a kinematic constraint to the structure at all times.</p><p>This inverts the design conclusion in a way we find genuinely instructive. If the correct offshore locomotion strategy is continuous structural contact, then the morphology that matters is not two legs. It is <em>many limbs, any of which can grip</em> — and the strongest argument for a humanoid's arms turns out to be that they hold the handrail, not that they turn the valve.</p>"
  },
  {
    type: "section_head",
    number: "/05",
    title: "Constraint III: everything is a potential ignition source",
    anchor: "constraint-iii-everything-is-a-potential-ignition-source"
  },
  {
    type: "prose",
    html: "<p>The third constraint is the one that most surprises people arriving from a software background, because it is completely indifferent to how good the system is.</p><p>Offshore production facilities are classified into hazardous areas by the likelihood that an explosive atmosphere is present: Zone 0 continuously or for long periods, Zone 1 likely in normal operation, Zone 2 unlikely and short-lived if it occurs. Equipment taken into these areas must be certified under the relevant explosion-protection regime — the IEC 60079 series internationally, and the ATEX Directive 2014/34/EU within the European Union — against a defined protection concept: flameproof enclosure, increased safety, intrinsic safety, pressurisation, and others.</p><p><strong>Concept</strong></p><h3>Explosion protection is a property of the assembly, not the algorithm</h3><p>Ex certification does not ask whether a machine behaves correctly. It asks whether the machine can produce an arc, a spark or a hot surface capable of igniting a specified gas group, under both normal operation <em>and</em> defined fault conditions. A correctly behaving robot with an uncertified motor is non-compliant. An erratic robot in a fully certified enclosure is compliant.</p><p>The consequence for a humanoid is arithmetic. A machine with several dozen actuators has several dozen motors, each a commutating electrical device with windings, bearings and a thermal profile — and each therefore a certification object, along with its cabling, connectors, sensors, battery and enclosure penetrations.</p><p>Two implications follow, and the second is the one worth sitting with.</p><p>The first is straightforward: certification cost and lead time scale with actuator count, which is exactly the dimension along which humanoids are elaborate. A quadruped with twelve actuators is a materially easier certification object than a humanoid with forty. A tracked crawler with two is easier still. There is a real sense in which the offshore environment penalises morphological sophistication directly, independent of what that sophistication buys.</p><p>The second is about tempo. Ex certification attaches to a specific hardware configuration. Substantive modification of a certified assembly invalidates the certificate and requires re-assessment. Software may be updated within the terms of the certification, which means model weights can be revised freely — but the actuator cannot be swapped, the enclosure cannot be redesigned, and the sensor cannot be relocated without going back through the process.</p><p>The iteration loop that produced modern robot policies — build, test, redesign the hardware, retrain, repeat — is available in a laboratory and largely unavailable in a certified hazardous-area product. This is not an argument that humanoids cannot be certified. Several classes of industrial robot already are. It is an argument that the <em>rate</em> of improvement offshore will be set by a certification cycle measured in quarters, not by a training cycle measured in days, and that forecasts extrapolating the latter into the former will be wrong by a large factor.</p>"
  },
  {
    type: "section_head",
    number: "/06",
    title: "Constraint IV: the validation problem",
    anchor: "constraint-iv-the-validation-problem"
  },
  {
    type: "prose",
    html: "<p>The fourth constraint is the deepest, and unlike the other three we do not currently see a path through it.</p><p>Suppose every preceding objection is answered: a humanoid with twelve-hour endurance, certified for Zone 1, balancing competently on a heaving deck. It now proposes to perform an action in the upper-right region of Figure 1 — to isolate a line, or actuate a valve on a live system. On what basis is it permitted to do so?</p><p>The established answer in industrial safety is functional safety. A safety function is assigned a target failure measure — a safety integrity level under IEC 61508, or a performance level under ISO 13849-1 — and the implementation must be shown by analysis and test to achieve it. This machinery is mature, well understood by regulators and insurers, and it has a hard prerequisite: a quantified, demonstrable failure rate for the element implementing the function.</p><p>A learned policy does not have one in any usable sense. Its failure rate is conditional on an input distribution that is not stationary, not fully characterised, and not under the operator's control.</p><p>The scale of the difficulty is best conveyed by an argument from an adjacent domain. Kalra and Paddock (2016) asked how many miles an autonomous vehicle would have to be driven to demonstrate, with statistical confidence, that it was safer than a human driver. Because the base rate of fatal accidents is very low, the answer runs to hundreds of millions of miles, and for some formulations hundreds of billions — decades or centuries of continuous test driving. Their conclusion was not that autonomous vehicles are unsafe. It was that <em>road testing alone cannot establish the claim</em>, and that other methods must carry the argument.</p>"
  },
  {
    type: "diagram",
    svg: "<svg viewBox=\"0 0 760 320\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"ui-monospace,Menlo,monospace\"><rect width=\"760\" height=\"320\" fill=\"#fff\"/><text x=\"40\" y=\"30\" font-size=\"10.5\" fill=\"#8b95a1\" letter-spacing=\"1.3\">THE VALIDATION GAP — RARE EVENTS RESIST DEMONSTRATION BY EXPERIENCE</text><line x1=\"120\" y1=\"245\" x2=\"720\" y2=\"245\" stroke=\"#c9d0d7\"/><line x1=\"120\" y1=\"245\" x2=\"120\" y2=\"60\" stroke=\"#c9d0d7\"/><text x=\"420\" y=\"285\" font-size=\"10\" fill=\"#5d6873\" text-anchor=\"middle\" letter-spacing=\"1\">OPERATING HOURS ACCUMULATED (LOG SCALE)</text><text x=\"44\" y=\"152\" font-size=\"10\" fill=\"#5d6873\" text-anchor=\"middle\" letter-spacing=\"1\" transform=\"rotate(-90 44 152)\">CONFIDENCE</text><text x=\"200\" y=\"262\" font-size=\"9.5\" fill=\"#b3bcc5\" text-anchor=\"middle\">10³</text><text x=\"320\" y=\"262\" font-size=\"9.5\" fill=\"#b3bcc5\" text-anchor=\"middle\">10⁴</text><text x=\"440\" y=\"262\" font-size=\"9.5\" fill=\"#b3bcc5\" text-anchor=\"middle\">10⁵</text><text x=\"560\" y=\"262\" font-size=\"9.5\" fill=\"#b3bcc5\" text-anchor=\"middle\">10⁶</text><text x=\"680\" y=\"262\" font-size=\"9.5\" fill=\"#b3bcc5\" text-anchor=\"middle\">10⁷</text><path d=\"M120 243 Q 300 238 440 225 T 720 150\" stroke=\"#8a4b2a\" stroke-width=\"2\" fill=\"none\"/><text x=\"600\" y=\"140\" font-size=\"10\" fill=\"#8a4b2a\">EVIDENCE ACCUMULATED</text><line x1=\"120\" y1=\"95\" x2=\"720\" y2=\"95\" stroke=\"#8f3232\" stroke-width=\"1.4\" stroke-dasharray=\"5 4\"/><text x=\"128\" y=\"87\" font-size=\"10\" fill=\"#8f3232\" letter-spacing=\".6\">CONFIDENCE REQUIRED FOR A SAFETY FUNCTION ON A LIVE HYDROCARBON SYSTEM</text><rect x=\"255\" y=\"200\" width=\"94\" height=\"44\" fill=\"#f6f7f8\" stroke=\"#c9d0d7\" stroke-dasharray=\"3 3\"/><text x=\"302\" y=\"218\" font-size=\"9.5\" fill=\"#5d6873\" text-anchor=\"middle\">REALISTIC</text><text x=\"302\" y=\"231\" font-size=\"9.5\" fill=\"#5d6873\" text-anchor=\"middle\">FLEET-YEARS</text><text x=\"302\" y=\"192\" font-size=\"9\" fill=\"#b3bcc5\" text-anchor=\"middle\">where a real programme lives</text><path d=\"M 355 150 L 700 118\" stroke=\"#c9d0d7\" stroke-width=\".8\" stroke-dasharray=\"2 3\"/><text x=\"380\" y=\"145\" font-size=\"10\" fill=\"#8b95a1\">THE GAP CLOSES ONLY BY ARGUMENT, NOT BY HOURS</text></svg>",
    caption: "The structure of the validation problem, following the argument of Kalra and Paddock (2016) for autonomous vehicles. Because consequential offshore failures are rare, the operating experience needed to demonstrate a low failure rate empirically exceeds what any deployment programme can accumulate. Confidence must come from architecture and analysis, not from hours survived.",
    captionPrefix: "FIG. 04",
    alt: "A line chart with operating hours on a logarithmic horizontal axis from ten cubed to ten to the seventh, and confidence on the vertical axis. A rising curve labelled 'evidence accumulated' climbs slowly and is still well below a horizontal dashed line marking the confidence required for a safety function on a live hydrocarbon system. A shaded box near the left of the curve marks the realistic fleet-years a deployment programme can reach. The remaining distance is annotated: the gap closes only by argument, not by hours."
  },
  {
    type: "prose",
    html: "<p>Transposed offshore, the argument is sharper still. The events that matter — loss of containment, ignition, well-control incidents — are rarer than road fatalities, the fleet is smaller by orders of magnitude, and the consequences are less tolerable. No credible deployment programme accumulates the experience required.</p><p>The way out is well established in safety engineering and it is architectural rather than statistical. If the element cannot be assigned a failure rate, it must not implement the safety function. The safety function is implemented by something that can — a hardwired interlock, a certified logic solver, a mechanical relief device — and the learned component is placed strictly outside that boundary, where it advises, prioritises, drafts and explains, but cannot actuate. Leveson (2011) makes the general case that safety is a property of the system's control structure rather than of any component's reliability, and that is exactly the framing this problem needs.</p><p>This is not a limitation to be engineered away. It is the correct architecture, and recognising it early is what separates a programme that deploys from one that stalls in pilot.</p>"
  },
  {
    type: "section_head",
    number: "/07",
    title: "What actually arrives, and in what order",
    anchor: "what-actually-arrives-and-in-what-order"
  },
  {
    type: "prose",
    html: "<p>Rejecting the strong claim does not mean rejecting the technology. It means being specific about the sequence, and the sequence is legible if the four constraints are taken seriously.</p>"
  },
  {
    type: "comparison_table",
    columns: [
      "Horizon",
      "Capability",
      "Binding constraint at that step"
    ],
    rows: [
      {
        cells: [
          "Now",
          "Supervised inspection rounds on wheeled and legged platforms; gauge reading, thermography, acoustic survey, gas detection",
          "None — this is deployed"
        ]
      },
      {
        cells: [
          "Near",
          "Longer autonomous rounds, richer sensing, persistent asset memory across visits",
          "Endurance; data infrastructure"
        ]
      },
      {
        cells: [
          "Near",
          "Bimanual platforms in Zone 2 and safe areas — workshop, store, laydown, logistics",
          "Certification cost; manipulation reliability"
        ]
      },
      {
        cells: [
          "Medium",
          "Light intervention in Zone 1 under supervision: lubrication, filter and consumable change, sampling",
          "Ex certification of a high-actuator-count assembly"
        ]
      },
      {
        cells: [
          "Medium",
          "Tele-assisted manipulation with autonomous sub-tasks — the operator supplies intent, the machine supplies execution",
          "Link latency; operator span of control"
        ]
      },
      {
        cells: [
          "Far",
          "Unsupervised actuation on live hydrocarbon systems",
          "Validation. No current path"
        ]
      }
    ]
  },
  {
    type: "prose",
    html: "<p>Two features of this table deserve comment.</p><p>First, the near-term entries are dominated by <em>sensing and logistics</em>, not manipulation. That is where the value is, because that is where reversibility permits autonomy. An organisation that buys a humanoid to turn valves has misread the problem; an organisation that buys one to carry, fetch, inspect and document has read it correctly.</p><p>Second, tele-assisted manipulation is more interesting than it sounds and is probably where humanoid morphology first genuinely pays. Sheridan (1992) laid out supervisory control as a spectrum rather than a binary, and the productive region has always been the middle: a human supplying goals and authorisation, a machine supplying the fine motor execution that a latency-bound teleoperation link cannot. A humanoid is an unusually good substrate for that division of labour, because the operator's intuitions about reach, grasp and posture transfer directly.</p><h3>The human-factors trap</h3><p>There is a failure mode that arrives with partial autonomy and is worth naming before it is designed in.</p><p>Bainbridge (1983) observed that automating the easy part of a task leaves the human with the residue — the difficult, rare, poorly practised part — while simultaneously removing the routine practice that maintained their skill at it. The better the automation, the rarer the intervention, and the less prepared the operator is when it comes. She also noted that a monitor asked to supervise a highly reliable process will not maintain vigilance, because sustained attention to an uneventful display is a task humans perform badly.</p><p>Parasuraman and Riley (1997) extended this into the taxonomy of use, misuse, disuse and abuse, and documented automation bias: operators accept an automated recommendation more readily than the evidence warrants, particularly under time pressure and particularly when the system has been reliable in the past. Endsley (1995) supplies the mechanism — situation awareness degrades when the operator is out of the control loop, and it degrades fastest precisely for the operators who trust the system most.</p><p>Every one of these findings applies with full force to a control-room engineer supervising a fleet of inspection robots offshore. The system that reports \"no anomalies\" for two hundred consecutive rounds is training its supervisor not to look at round two hundred and one. Designing against this is a first-order requirement, not a human-factors afterthought, and it argues for interfaces that surface uncertainty and disagreement rather than clean verdicts.</p>"
  },
  {
    type: "section_head",
    number: "/08",
    title: "Conclusion",
    anchor: "conclusion"
  },
  {
    type: "prose",
    html: "<p>Can AI models embedded in humanoid robots adequately operate offshore rigs? No — but the word carrying the weight is <em>operate</em>, not <em>humanoid</em> and not <em>AI</em>.</p><p>If operating means observing, documenting, fetching, and reporting, then machines are already doing it, mostly without legs, and they will do more of it every year. If it means actuating consequential, irreversible systems without a human in the authorisation path, then the barrier is not perception, not manipulation, not language grounding and not reasoning. It is that we have no accepted method for licensing a stochastic policy to hold a safety function, and the statistical route to one is closed by the rarity of the events that matter.</p><p>We would go further. Of the four constraints examined, only energetics is a robotics problem in the conventional sense. Deck motion is a control problem with a known if inconvenient solution — instrument the disturbance, or hold on. Ignition is a hardware certification discipline that predates machine learning by half a century and is indifferent to it. Validation is a problem in the philosophy of evidence.</p><blockquote><p>The humanoid question is a distraction from the authorisation question, and the authorisation question is the one that decides deployment.</p></blockquote><p>The productive research direction, in our view, is not a more capable humanoid. It is a well-specified boundary: an architecture in which learned components do the perception, the language and the drafting, a deterministic and certifiable layer holds every safety function, and the interface between them is explicit, auditable, and designed to be examined after an incident. That architecture will be less impressive in a demonstration video and considerably more likely to be installed.</p><p>The machines that reach the drill floor first will be the ones that arrive with an answer to <em>who authorised this</em>, not the ones that arrive with the most degrees of freedom.</p>"
  },
  {
    type: "callout",
    tone: "note",
    title: "A note on sourcing",
    body: "Claims about model capability are cited to primary sources; standards are cited by designation and edition. Figures 2 and 4 are indicative schematics illustrating a structural argument, not measurements."
  },
  {
    type: "as_of_stamp",
    verifiedOn: "2026-09-11",
    note: "Deployment figures and model-capability claims decay quickly"
  },
  {
    type: "references",
    entries: [
      {
        id: "bainbridge-1983",
        text: "Bainbridge, L. (1983) 'Ironies of automation', Automatica, 19(6), pp. 775–779."
      },
      {
        id: "black-2024",
        text: "Black, K., Brown, N., Driess, D., Esmail, A., Equi, M., Finn, C., Fusai, N., Groom, L., Hausman, K., Ichter, B., Jakubczak, S., Jones, T., Ke, L., Levine, S., Li-Bell, A., Mothukuri, M., Nair, S., Pertsch, K., Shi, L.X., Tanner, J., Vuong, Q., Walling, A., Wang, H. and Zhilinsky, U. (2024) '&pi;0: a vision-language-action flow model for general robot control', arXiv:2410.24164."
      },
      {
        id: "brohan-2023",
        text: "Brohan, A., Brown, N., Carbajal, J., Chebotar, Y., Chen, X., Choromanski, K., Ding, T., Driess, D., Dubey, A., Finn, C. et al. (2023) 'RT-2: vision-language-action models transfer web knowledge to robotic control', arXiv:2307.15818."
      },
      {
        id: "brooks-1990",
        text: "Brooks, R.A. (1990) 'Elephants don't play chess', Robotics and Autonomous Systems, 6(1–2), pp. 3–15."
      },
      {
        id: "endsley-1995",
        text: "Endsley, M.R. (1995) 'Toward a theory of situation awareness in dynamic systems', Human Factors, 37(1), pp. 32–64."
      },
      {
        id: "faltinsen-1990",
        text: "Faltinsen, O.M. (1990) Sea Loads on Ships and Offshore Structures. Cambridge: Cambridge University Press."
      },
      {
        id: "international-nd",
        text: "International Electrotechnical Commission (2017–) IEC 60079 series: Explosive atmospheres. Geneva: IEC."
      },
      {
        id: "international-2010",
        text: "International Electrotechnical Commission (2010) IEC 61508: Functional safety of electrical/electronic/programmable electronic safety-related systems. 2nd edn. Geneva: IEC."
      },
      {
        id: "international-2023",
        text: "International Organization for Standardization (2023) ISO 13849-1: Safety of machinery — Safety-related parts of control systems — Part 1: General principles for design. Geneva: ISO."
      },
      {
        id: "international-2025",
        text: "International Organization for Standardization (2025) ISO 10218-1: Robotics — Safety requirements — Part 1: Industrial robots. Geneva: ISO."
      },
      {
        id: "kajita-2003",
        text: "Kajita, S., Kanehiro, F., Kaneko, K., Fujiwara, K., Harada, K., Yokoi, K. and Hirukawa, H. (2003) 'Biped walking pattern generation by using preview control of zero-moment point', Proceedings of the IEEE International Conference on Robotics and Automation (ICRA), pp. 1620–1626."
      },
      {
        id: "kalra-2016",
        text: "Kalra, N. and Paddock, S.M. (2016) Driving to Safety: How Many Miles of Driving Would It Take to Demonstrate Autonomous Vehicle Reliability? RR-1478-RC. Santa Monica, CA: RAND Corporation."
      },
      {
        id: "kim-2024",
        text: "Kim, M.J., Pertsch, K., Karamcheti, S., Xiao, T., Balakrishna, A., Nair, S., Rafailov, R., Foster, E., Lam, G., Sanketi, P., Vuong, Q., Kollar, T., Burchfiel, B., Tedrake, R., Sadigh, D., Levine, S., Liang, P. and Finn, C. (2024) 'OpenVLA: an open-source vision-language-action model', arXiv:2406.09246."
      },
      {
        id: "leveson-2011",
        text: "Leveson, N.G. (2011) Engineering a Safer World: Systems Thinking Applied to Safety. Cambridge, MA: MIT Press."
      },
      {
        id: "miki-2022",
        text: "Miki, T., Lee, J., Hwangbo, J., Wellhausen, L., Koltun, V. and Hutter, M. (2022) 'Learning robust perceptive locomotion for quadrupedal robots in the wild', Science Robotics, 7(62), eabk2822."
      },
      {
        id: "moravec-1988",
        text: "Moravec, H. (1988) Mind Children: The Future of Robot and Human Intelligence. Cambridge, MA: Harvard University Press."
      },
      {
        id: "open-2023",
        text: "Open X-Embodiment Collaboration (2023) 'Open X-Embodiment: robotic learning datasets and RT-X models', arXiv:2310.08864."
      },
      {
        id: "parasuraman-1997",
        text: "Parasuraman, R. and Riley, V. (1997) 'Humans and automation: use, misuse, disuse, abuse', Human Factors, 39(2), pp. 230–253."
      },
      {
        id: "perrow-1984",
        text: "Perrow, C. (1984) Normal Accidents: Living with High-Risk Technologies. New York: Basic Books."
      },
      {
        id: "rudin-2022",
        text: "Rudin, N., Hoeller, D., Reist, P. and Hutter, M. (2022) 'Learning to walk in minutes using massively parallel deep reinforcement learning', Proceedings of the 5th Conference on Robot Learning (CoRL), PMLR 164, pp. 91–100."
      },
      {
        id: "sheridan-1992",
        text: "Sheridan, T.B. (1992) Telerobotics, Automation, and Human Supervisory Control. Cambridge, MA: MIT Press."
      },
      {
        id: "tobin-2017",
        text: "Tobin, J., Fong, R., Ray, A., Schneider, J., Zaremba, W. and Abbeel, P. (2017) 'Domain randomization for transferring deep neural networks from simulation to the real world', Proceedings of the IEEE/RSJ International Conference on Intelligent Robots and Systems (IROS), pp. 23–30."
      },
      {
        id: "vukobratovi-2004",
        text: "Vukobratović, M. and Borovac, B. (2004) 'Zero-moment point — thirty five years of its life', International Journal of Humanoid Robotics, 1(1), pp. 157–173."
      }
    ]
  },
  {
    type: "cta_block",
    heading: "The parts side of offshore autonomy",
    body: "We supply hydraulic hose, fittings and pressure-containment components into offshore and drilling operations across 126 markets from one Dubai warehouse. If you are specifying for an inspection or intervention programme, send us the schedule and we will quote against it.",
    quoteLabel: "Request a quote"
  }
],
}

export default ARTICLE
