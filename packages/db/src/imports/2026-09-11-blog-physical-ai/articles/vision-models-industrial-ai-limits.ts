/**
 * Can robots embedded with vision models solve industrial AI?
 *
 * Generated from `docs/articles/a3-vision-industrial-ai.html`, which is the editable source for this
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
  slug: "vision-models-industrial-ai-limits",
  title: "Can robots embedded with vision models solve industrial AI?",
  excerpt: "The variables that decide whether an industrial component fails are, for the most part, not present in any image of it. Includes original data from an audit of 16,114 specifications.",
  categorySlug: 'physical-ai',
  authorSlug: 'ayush-bhatia',
  seoTitle: "Why vision models cannot solve industrial AI",
  seoDescription: "Industrial failure is determined by history, not appearance. An information-theoretic argument for why better vision models hit a ceiling, with original data from a 16,114-record specification audit.",
  focusKeyword: "vision models industrial AI",
  publishedAt: '2026-09-11T09:00:00.000Z',
  bodyBlocks: [
  {
    type: "lead",
    html: "No — and the obstruction is information-theoretic rather than architectural. The variables that decide whether an industrial component fails are, for the most part, not present in any image of it."
  },
  {
    type: "key_takeaways",
    heading: "In short",
    items: [
      "Vision has an information ceiling with respect to industrial condition, and the data processing inequality means no model can exceed it — only approach it more efficiently.",
      "Of ten failure-determining state variables we examined, vision observes one. Recorded history observes eight.",
      "Accumulated fatigue damage, elastomer compression set, bolt preload loss and thermal exposure history are not properties of an image at any resolution.",
      "In our own catalogue, 89.5% of 16,114 specifications carry no unit, and only 45.1% of pressure values resolve to a parseable number.",
      "The binding constraint is machine-readable asset memory rather than perception. That is a schema problem, not a research problem."
    ]
  },
  {
    type: "direct_answer",
    question: "Can robots embedded with vision models solve industrial AI?",
    answer: "No. The variables that determine whether an industrial component fails — accumulated fatigue, compression set, preload, thermal and pressure history, shelf age — have negligible influence on surface appearance until failure is imminent. Better vision models extract more of a low information ceiling; they cannot raise it. The channel that carries the information is recorded history, and it is currently largely unreadable to a machine."
  },
  {
    type: "prose",
    html: "<h3>Abstract</h3><p>We argue that vision-centric industrial autonomy faces a ceiling that is not a function of model scale. Framing industrial condition assessment as a partially observable Markov decision process makes the difficulty explicit: the state variables that determine failure — accumulated fatigue damage, elastomer compression set, internal chemical attack, preload history, thermal and pressure exposure, shelf age — have negligible causal influence on surface appearance until very late in their evolution. By the data processing inequality, no amount of processing applied to an image can recover information the image does not contain, so improvements in vision models raise extraction efficiency against a fixed and low information ceiling. We support this with a failure-mode observability analysis and then present original data from an audit of our own catalogue: of 16,114 structured specifications across 1,487 products, 89.5% carry no unit; of 1,548 pressure specifications, only 45.1% resolve to a parseable number. We conclude that the binding constraint on industrial AI is not perception but machine-readable asset memory, and that this is a data-infrastructure problem which the field is currently attempting to solve with cameras.</p>"
  },
  {
    type: "section_head",
    number: "/01",
    title: "What would it mean to \"solve industrial AI\"?",
    anchor: "what-would-it-mean-to-solve-industrial-ai"
  },
  {
    type: "prose",
    html: "<p>The claim under examination deserves a precise statement, because the loose version is unfalsifiable and the precise version is interesting.</p><p>The loose version is that sufficiently capable visual perception, embodied in a robot, will eventually handle industrial work. The precise version is a claim about sufficiency: that the observable surface appearance of industrial equipment carries enough information to support the decisions industrial work requires — is this component serviceable, will it survive to the next interval, what caused this, what should replace it.</p><p>Stated that way it is an empirical claim about an information channel, and it can be evaluated. We think it is false, and false in a way that additional capability does not repair.</p><p>To be clear about what we are not arguing. We are not arguing that vision models are unimpressive; the progress has been extraordinary and we use these systems. We are not arguing that they have no industrial role; they have a large one, and section 7 says where. We are arguing against a specific proposition — that scaling visual perception is the path to industrial autonomy — and the argument is structural.</p>"
  },
  {
    type: "section_head",
    number: "/02",
    title: "The formal framing",
    anchor: "the-formal-framing"
  },
  {
    type: "prose",
    html: "<p>Industrial condition assessment is naturally posed as a partially observable Markov decision process (Kaelbling <em>et al.</em>, 1998). There is a latent state — the true condition of the asset — which is not directly accessible. There is an observation, which is what the sensors return. And there is an observation function relating them.</p><p><strong>Concept</strong></p><h3>Partial observability, and where the difficulty lives</h3><p>A POMDP is the tuple ⟨S, A, T, R, Ω, O⟩ — states, actions, transitions, rewards, observations, and the observation function O(o | s, a) giving the probability of observation <em>o</em> in state <em>s</em>. The agent never sees <em>s</em>; it maintains a belief <em>b(s)</em>, a distribution over states, updated by Bayes' rule as observations arrive (Kaelbling <em>et al.</em>, 1998; Thrun <em>et al.</em>, 2005).</p><p>The framework is standard. The point we want is about where difficulty resides. Most robotics work on POMDPs concentrates on planning under a belief — the computational problem. Industrial condition assessment has its difficulty somewhere else entirely: in the <em>observation function itself</em>. If O(o | s) is nearly identical for two states s₁ and s₂, then no belief update distinguishes them, no matter how much computation is applied and no matter how many observations are accumulated.</p><p>That is the situation for most industrially decisive state variables under visual observation.</p><p>This can be sharpened into a limit rather than a complaint. Let <em>S</em> be the failure-relevant state and <em>O</em> the observation. The mutual information <em>I(S;O)</em> measures how much the observation tells us about the state (Shannon, 1948). Any estimator produces an estimate <em>Ŝ</em> that is a function of <em>O</em> alone, forming a Markov chain <em>S → O → Ŝ</em>. The data processing inequality then gives:</p><p><strong>Result</strong></p><h3>The information ceiling</h3><pre><code>I(S ; Ŝ) ≤ I(S ; O)</code></pre><p>No processing of an observation can create information about the state that the observation does not contain. A larger model, a better architecture, more training data and more inference-time computation can all move the achieved <em>I(S;Ŝ)</em> closer to the bound. None can raise the bound.</p><p>Consequently, if <em>I(S;O)</em> is small for a given state variable and observation modality, the question of how good the model is has a ceiling that is reached quickly and cannot be exceeded. The only remedy is a different observation — a different sensor, or a different kind of evidence altogether.</p><p>This is elementary information theory and it is not usually brought to bear on this debate, which is why the debate keeps circling. The question is not \"how good will vision models get\". It is \"how much information about failure-relevant state does an image of an industrial component contain\". Those are different questions and only the second one is binding.</p>"
  },
  {
    type: "section_head",
    number: "/03",
    title: "What determines failure, and where it lives",
    anchor: "what-determines-failure-and-where-it-lives"
  },
  {
    type: "prose",
    html: "<p>So we should look at the state variables. What follows is drawn from fluid power and pressure-containment components, which is our own field, but the pattern generalises to any fatigue- or degradation-limited mechanical system.</p><p><strong>Accumulated fatigue damage.</strong> A steel component under cyclic load accumulates damage long before any crack is optically detectable. Crack initiation typically consumes the majority of fatigue life, and once a crack is propagating, growth per cycle scales with a power of the stress intensity range, so the remaining life shortens sharply (Paris and Erdogan, 1963; Suresh, 1998). The visible symptom appears near the end of the process. Optical inspection is sampling the tail of the distribution and calling it the distribution.</p><p><strong>Elastomer compression set.</strong> A seal that has taken a permanent set has lost the recovery that made it seal. It is measured by compressing a specimen under defined conditions and recording how much of the deflection is not recovered — a destructive laboratory test (ISO 815-1). A seal at 40% set and a seal at 5% set are visually indistinguishable in situ.</p><p><strong>Inner tube degradation from fluid incompatibility.</strong> A hydraulic hose degrades from the inside when the fluid attacks the tube compound. The reinforcement and cover are unaffected and the assembly looks new. The failure is a burst.</p><p><strong>Reinforcement corrosion beneath an intact cover.</strong> Moisture entering through a cover abrasion migrates along the wire braid and corrodes it. The cover closes visually over a reinforcement that has lost a large fraction of its strength.</p><p><strong>Preload loss in a bolted joint.</strong> A bolt that has lost preload is geometrically identical to one that has not. Preload is a force, and force is not a visual property.</p><p><strong>Thermal, pressure and chemical exposure history.</strong> An elastomer that spent an hour above its rated temperature is aged. A hose that has seen ten million pressure impulses has consumed most of its impulse life. Neither leaves a surface signature at the time it matters.</p><p><strong>Shelf age.</strong> Rubber degrades in storage. Industry practice addresses hose shelf life explicitly, and a component may be beyond its recommended storage period on the day it is first installed, having never been pressurised. It is indistinguishable from new.</p>"
  },
  {
    type: "diagram",
    svg: "<svg viewBox=\"0 0 760 430\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"ui-monospace,Menlo,monospace\"><rect width=\"760\" height=\"430\" fill=\"#fff\"/><text x=\"20\" y=\"26\" font-size=\"10.5\" fill=\"#8b95a1\" letter-spacing=\"1.3\">OBSERVABILITY OF FAILURE-RELEVANT STATE BY MODALITY</text><g font-size=\"9.5\" fill=\"#5d6873\" text-anchor=\"middle\"><text x=\"392\" y=\"62\">RGB</text><text x=\"392\" y=\"74\">VISION</text><text x=\"459\" y=\"62\">THERMAL</text><text x=\"526\" y=\"62\">ACOUSTIC</text><text x=\"526\" y=\"74\">VIBRATION</text><text x=\"593\" y=\"62\">UT / EDDY</text><text x=\"593\" y=\"74\">CURRENT</text><text x=\"682\" y=\"62\">RECORDED</text><text x=\"682\" y=\"74\">HISTORY</text></g><line x1=\"20\" y1=\"84\" x2=\"740\" y2=\"84\" stroke=\"#c9d0d7\"/><rect x=\"648\" y=\"52\" width=\"68\" height=\"360\" fill=\"#f4f9f6\"/><rect x=\"358\" y=\"52\" width=\"68\" height=\"360\" fill=\"#fcf6f4\"/><g font-size=\"11\" fill=\"#2b3138\"><text x=\"20\" y=\"108\">Accumulated fatigue damage</text><text x=\"20\" y=\"140\">Crack, propagating, sub-surface</text><text x=\"20\" y=\"172\">Elastomer compression set</text><text x=\"20\" y=\"204\">Inner tube chemical attack</text><text x=\"20\" y=\"236\">Braid corrosion under cover</text><text x=\"20\" y=\"268\">Bolt preload loss</text><text x=\"20\" y=\"300\">Thermal exposure history</text><text x=\"20\" y=\"332\">Pressure cycle count</text><text x=\"20\" y=\"364\">Shelf age at installation</text><text x=\"20\" y=\"396\">Surface corrosion, external</text></g><g font-size=\"13\" text-anchor=\"middle\"><text x=\"392\" y=\"112\" fill=\"#d9dee3\">○</text><text x=\"459\" y=\"112\" fill=\"#d9dee3\">○</text><text x=\"526\" y=\"112\" fill=\"#8a6d1f\">◐</text><text x=\"593\" y=\"112\" fill=\"#d9dee3\">○</text><text x=\"682\" y=\"112\" fill=\"#2f6b4f\">●</text><text x=\"392\" y=\"144\" fill=\"#d9dee3\">○</text><text x=\"459\" y=\"144\" fill=\"#d9dee3\">○</text><text x=\"526\" y=\"144\" fill=\"#2f6b4f\">●</text><text x=\"593\" y=\"144\" fill=\"#2f6b4f\">●</text><text x=\"682\" y=\"144\" fill=\"#8a6d1f\">◐</text><text x=\"392\" y=\"176\" fill=\"#d9dee3\">○</text><text x=\"459\" y=\"176\" fill=\"#d9dee3\">○</text><text x=\"526\" y=\"176\" fill=\"#d9dee3\">○</text><text x=\"593\" y=\"176\" fill=\"#d9dee3\">○</text><text x=\"682\" y=\"176\" fill=\"#2f6b4f\">●</text><text x=\"392\" y=\"208\" fill=\"#d9dee3\">○</text><text x=\"459\" y=\"208\" fill=\"#d9dee3\">○</text><text x=\"526\" y=\"208\" fill=\"#d9dee3\">○</text><text x=\"593\" y=\"208\" fill=\"#8a6d1f\">◐</text><text x=\"682\" y=\"208\" fill=\"#2f6b4f\">●</text><text x=\"392\" y=\"240\" fill=\"#d9dee3\">○</text><text x=\"459\" y=\"240\" fill=\"#d9dee3\">○</text><text x=\"526\" y=\"240\" fill=\"#d9dee3\">○</text><text x=\"593\" y=\"240\" fill=\"#8a6d1f\">◐</text><text x=\"682\" y=\"240\" fill=\"#8a6d1f\">◐</text><text x=\"392\" y=\"272\" fill=\"#d9dee3\">○</text><text x=\"459\" y=\"272\" fill=\"#d9dee3\">○</text><text x=\"526\" y=\"272\" fill=\"#8a6d1f\">◐</text><text x=\"593\" y=\"272\" fill=\"#8a6d1f\">◐</text><text x=\"682\" y=\"272\" fill=\"#2f6b4f\">●</text><text x=\"392\" y=\"304\" fill=\"#d9dee3\">○</text><text x=\"459\" y=\"304\" fill=\"#d9dee3\">○</text><text x=\"526\" y=\"304\" fill=\"#d9dee3\">○</text><text x=\"593\" y=\"304\" fill=\"#d9dee3\">○</text><text x=\"682\" y=\"304\" fill=\"#2f6b4f\">●</text><text x=\"392\" y=\"336\" fill=\"#d9dee3\">○</text><text x=\"459\" y=\"336\" fill=\"#d9dee3\">○</text><text x=\"526\" y=\"336\" fill=\"#d9dee3\">○</text><text x=\"593\" y=\"336\" fill=\"#d9dee3\">○</text><text x=\"682\" y=\"336\" fill=\"#2f6b4f\">●</text><text x=\"392\" y=\"368\" fill=\"#d9dee3\">○</text><text x=\"459\" y=\"368\" fill=\"#d9dee3\">○</text><text x=\"526\" y=\"368\" fill=\"#d9dee3\">○</text><text x=\"593\" y=\"368\" fill=\"#d9dee3\">○</text><text x=\"682\" y=\"368\" fill=\"#2f6b4f\">●</text><text x=\"392\" y=\"400\" fill=\"#2f6b4f\">●</text><text x=\"459\" y=\"400\" fill=\"#8a6d1f\">◐</text><text x=\"526\" y=\"400\" fill=\"#d9dee3\">○</text><text x=\"593\" y=\"400\" fill=\"#8a6d1f\">◐</text><text x=\"682\" y=\"400\" fill=\"#8a6d1f\">◐</text></g><g><line x1=\"20\" y1=\"120\" x2=\"740\" y2=\"120\" stroke=\"#f2f4f6\"/><line x1=\"20\" y1=\"152\" x2=\"740\" y2=\"152\" stroke=\"#f2f4f6\"/><line x1=\"20\" y1=\"184\" x2=\"740\" y2=\"184\" stroke=\"#f2f4f6\"/><line x1=\"20\" y1=\"216\" x2=\"740\" y2=\"216\" stroke=\"#f2f4f6\"/><line x1=\"20\" y1=\"248\" x2=\"740\" y2=\"248\" stroke=\"#f2f4f6\"/><line x1=\"20\" y1=\"280\" x2=\"740\" y2=\"280\" stroke=\"#f2f4f6\"/><line x1=\"20\" y1=\"312\" x2=\"740\" y2=\"312\" stroke=\"#f2f4f6\"/><line x1=\"20\" y1=\"344\" x2=\"740\" y2=\"344\" stroke=\"#f2f4f6\"/><line x1=\"20\" y1=\"376\" x2=\"740\" y2=\"376\" stroke=\"#f2f4f6\"/></g><text x=\"20\" y=\"424\" font-size=\"9.5\" fill=\"#b3bcc5\">● OBSERVABLE ◐ PARTIALLY OR INDIRECTLY OBSERVABLE ○ NOT OBSERVABLE</text></svg>",
    caption: "Observability of failure-relevant state variables by sensing modality. The RGB column, shaded, is almost empty: of ten variables, vision observes one. The recorded-history column, also shaded, is nearly full. This is the central empirical claim of the article, and it is the reason we think industrial AI is a memory problem misdiagnosed as a perception problem.",
    captionPrefix: "FIG. 01",
    alt: "A matrix with ten failure-relevant state variables as rows and five sensing modalities as columns: RGB vision, thermal, acoustic and vibration, ultrasonic and eddy current, and recorded history. Filled circles mark observable, half circles partially observable, open circles not observable. The RGB vision column is almost entirely open circles, with only external surface corrosion observable. The recorded history column is almost entirely filled. Accumulated fatigue damage, elastomer compression set, thermal exposure history, pressure cycle count and shelf age at installation are invisible to every sensing modality and observable only in records."
  },
  {
    type: "prose",
    html: "<p>The pattern in Figure 1 is stark and, we think, not controversial among people who do condition assessment for a living. Vision observes external surface state. Almost nothing that determines remaining life is external surface state until the component is close to failing.</p><blockquote><p>The information about whether this hose will survive the quarter is not in the photograph. It is in the purchase date, the fluid, the duty cycle and the ambient temperature — and those live in records, not in pixels.</p></blockquote>"
  },
  {
    type: "section_head",
    number: "/04",
    title: "Why better vision models do not close this",
    anchor: "why-better-vision-models-do-not-close-this"
  },
  {
    type: "prose",
    html: "<p>Given the ceiling established in section 2, improvements in the vision stack move performance toward a bound rather than raising it. But there is a second reason to be careful, concerning behaviour <em>at</em> the bound.</p><p><strong>Shortcut learning.</strong> Deep networks reliably discover decision rules that succeed on the training distribution through features that are correlated with the label but not causally related to it (Geirhos <em>et al.</em>, 2020). In industrial imagery the opportunities are abundant: components photographed after failure are often photographed in a workshop, at a different angle, under different lighting, with the failure already known. A detector can achieve excellent benchmark numbers on background and framing cues, and it will fail silently the first time it sees a healthy component in a workshop.</p><p><strong>Hallucination.</strong> Vision-language models describe objects, attributes and relations that are not present in the image, a phenomenon documented for captioning (Rohrbach <em>et al.</em>, 2018) and characterised systematically for modern VLMs (Li <em>et al.</em>, 2023). Applied to inspection, this is not a curiosity. A model that reports a component identifier that is not visible, or a condition that is not present, produces a plausible, fluent, wrong finding — and fluency is precisely what makes it hard to catch.</p><p><strong>Miscalibration.</strong> Modern networks are systematically overconfident: predicted probabilities exceed empirical accuracy, and the gap widens with capacity (Guo <em>et al.</em>, 2017). In inspection the confidence is not decoration, it drives the decision to escalate. An overconfident \"serviceable\" is the most expensive output the system can produce, because it terminates the process.</p><p><strong>Conflated uncertainties.</strong> Kendall and Gal (2017) distinguish aleatoric uncertainty — irreducible noise in the observation — from epistemic uncertainty, which reflects the model's ignorance and shrinks with data. The distinction is decisive here. The correct response to high epistemic uncertainty is to gather more data. The correct response to high aleatoric uncertainty, which is what section 3 describes, is to <em>use a different sensor</em>, because more images of an unobservable variable will not help. A system that does not separate these will keep taking photographs of something the camera cannot see.</p><p>These four failure modes share a structure worth naming: each produces a confident, well-formed, wrong answer rather than an obvious error. In a domain where the wrong answer terminates the inspection, that is the worst available failure profile.</p>"
  },
  {
    type: "section_head",
    number: "/05",
    title: "Original data: the memory is not machine-readable either",
    anchor: "original-data-the-memory-is-not-machine-readable-either"
  },
  {
    type: "prose",
    html: "<p>If the argument so far is right, the remedy is recorded history — the right-hand column of Figure 1. This is a comfortable conclusion and we would like to report that the records are in good order. They are not, and we can quantify it from our own data rather than speculating about someone else's.</p><p>We audited the structured specification corpus behind our catalogue: 16,114 specification records attached to 1,487 active products across 29 manufacturers, queried on 8 September 2026. The corpus is typed — each record has a label, a value and an optional unit — so it is already better organised than free-text datasheets or PDFs, which is what most of this industry runs on. The results should therefore be read as a favourable case.</p>"
  },
  {
    type: "comparison_table",
    columns: [
      "Measure",
      "Value",
      "Share"
    ],
    rows: [
      {
        cells: [
          "Total specification records",
          "16,114",
          "—"
        ]
      },
      {
        cells: [
          "Records with no unit recorded",
          "14,419",
          "89.5%"
        ]
      },
      {
        cells: [
          "Distinct specification labels",
          "243",
          "—"
        ]
      },
      {
        cells: [
          "Distinct labels after case and whitespace normalisation",
          "237",
          "—"
        ]
      },
      {
        cells: [
          "Records not bound to a specification template",
          "954",
          "5.9%"
        ]
      }
    ]
  },
  {
    type: "prose",
    html: "<p>Narrowing to pressure — the field that decides whether a substitution is safe, and the one an autonomous system would most need to read:</p>"
  },
  {
    type: "comparison_table",
    columns: [
      "Measure, 1,548 pressure records",
      "Count",
      "Share"
    ],
    rows: [
      {
        cells: [
          "Value is a bare parseable number",
          "698",
          "45.1%"
        ]
      },
      {
        cells: [
          "Unit appears inside the free-text value",
          "527",
          "34.0%"
        ]
      },
      {
        cells: [
          "Value is a range or contains a slash",
          "214",
          "13.8%"
        ]
      },
      {
        cells: [
          "Value contains no digit at all",
          "54",
          "3.5%"
        ]
      },
      {
        cells: [
          "Unit column null or empty",
          "917",
          "59.2%"
        ]
      }
    ]
  },
  {
    type: "prose",
    html: "<p>Verbatim values from the corpus, with occurrence counts, convey the problem better than the aggregates:</p><ul><li><code>15000</code> — 88 records, no unit. Fifteen thousand bar is physically implausible for a fitting, so a human infers psi from domain knowledge the record does not contain.</li> <li><code>0</code> — 10 records. A null encoded as a number, and the most dangerous entry in the corpus: an agent evaluating <em>rated pressure ≥ required pressure</em> rejects a sound part, and with the comparison reversed accepts a catastrophic one.</li> <li><code>L-series up to 250 bar (3625 psi); S-series up to 400 bar (5800 psi)</code> — 40 records. Two products, two unit systems, one field.</li> <li><code>Up to 250 psi (1/2\"–2\"); 150 psi (3\"–4\"); 75 psi (5\"–6\") — derates with size, see datasheet</code> — 30 records. A derating table serialised into a string.</li> <li><code>ANSI Class 150 (285 psi WP) or Class 300 (740 psi WP) per ASME B16.5 ratings</code> — 9 records. A pressure rating expressed as a reference to a standard.</li></ul><p>And the labels themselves collide: <code>Working Pressure</code> (434 records) sits alongside <code>Max Working Pressure</code> (382); <code>Nominal Size Range</code> (582) alongside <code>Size Range</code> (201); <code>Material</code> (633) alongside <code>Materials Available</code> (208). <code>Working Pressure</code> appears with three different unit conventions — null, bar, and psi.</p>"
  },
  {
    type: "diagram",
    svg: "<svg viewBox=\"0 0 760 300\" xmlns=\"http://www.w3.org/2000/svg\" font-family=\"ui-monospace,Menlo,monospace\"><rect width=\"760\" height=\"300\" fill=\"#fff\"/><text x=\"40\" y=\"28\" font-size=\"10.5\" fill=\"#8b95a1\" letter-spacing=\"1.3\">PARSEABILITY OF 1,548 PRESSURE SPECIFICATIONS · INDUS HYDRAULICS CATALOGUE · 2026-09-08</text><rect x=\"40\" y=\"52\" width=\"680\" height=\"42\" fill=\"#eef1f4\"/><rect x=\"40\" y=\"52\" width=\"307\" height=\"42\" fill=\"#2f6b4f\" opacity=\".85\"/><rect x=\"347\" y=\"52\" width=\"231\" height=\"42\" fill=\"#8a6d1f\" opacity=\".85\"/><rect x=\"578\" y=\"52\" width=\"94\" height=\"42\" fill=\"#b05a5a\" opacity=\".85\"/><rect x=\"672\" y=\"52\" width=\"48\" height=\"42\" fill=\"#8f3232\" opacity=\".9\"/><text x=\"46\" y=\"79\" font-size=\"11.5\" fill=\"#fff\">45.1% BARE NUMBER</text><text x=\"353\" y=\"79\" font-size=\"11.5\" fill=\"#fff\">34.0% UNIT IN TEXT</text><text x=\"584\" y=\"79\" font-size=\"10.5\" fill=\"#fff\">13.8% RANGE</text><text x=\"678\" y=\"79\" font-size=\"10\" fill=\"#fff\">3.5%</text><text x=\"40\" y=\"118\" font-size=\"10\" fill=\"#8b95a1\">MACHINE-READABLE ONLY IF THE UNIT IS KNOWN FROM ELSEWHERE · 59.2% HAVE NO UNIT COLUMN</text><line x1=\"40\" y1=\"140\" x2=\"720\" y2=\"140\" stroke=\"#e2e6ea\"/><text x=\"40\" y=\"168\" font-size=\"11\" fill=\"#2b3138\">What an agent asking \"is this rated for 300 bar?\" actually encounters</text><g font-family=\"ui-monospace,Menlo,monospace\" font-size=\"11\"><rect x=\"40\" y=\"182\" width=\"330\" height=\"26\" fill=\"#f6f7f8\"/><text x=\"50\" y=\"199\" fill=\"#2b3138\">\"15000\"</text><text x=\"380\" y=\"199\" fill=\"#8f3232\">unit unknown — psi or bar?</text><rect x=\"40\" y=\"214\" width=\"330\" height=\"26\" fill=\"#f6f7f8\"/><text x=\"50\" y=\"231\" fill=\"#2b3138\">\"0\"</text><text x=\"380\" y=\"231\" fill=\"#8f3232\">null encoded as a number</text><rect x=\"40\" y=\"246\" width=\"330\" height=\"26\" fill=\"#f6f7f8\"/><text x=\"50\" y=\"263\" fill=\"#2b3138\">\"up to 400 bar; derates with size\"</text><text x=\"380\" y=\"263\" fill=\"#8a6d1f\">conditional on a variable not given</text></g><text x=\"40\" y=\"290\" font-size=\"9.5\" fill=\"#b3bcc5\">SOURCE: AUTHORS' OWN CATALOGUE AUDIT, n = 16,114 SPECIFICATION RECORDS ACROSS 1,487 PRODUCTS</text></svg>",
    caption: "Parseability of pressure specifications in a typed, structured industrial catalogue. Fewer than half resolve to a machine-readable quantity without external inference, and the majority carry no unit in the field designated for it. This is a favourable case: most of this industry publishes the same information as prose in PDFs.",
    captionPrefix: "FIG. 02",
    alt: "A single stacked horizontal bar representing 1,548 pressure specification records. It is divided into four segments: 45.1 per cent where the value is a bare parseable number, 34.0 per cent where the unit appears inside the free-text value, 13.8 per cent that are ranges, and 3.5 per cent containing no digit at all. A note records that 59.2 per cent have no unit column. Below, three example values are shown as an agent would encounter them: the string 15000, annotated unit unknown, psi or bar; the string 0, annotated null encoded as a number; and the string 'up to 400 bar, derates with size', annotated conditional on a variable not given."
  },
  {
    type: "prose",
    html: "<p>We publish this against our own interest because the point matters more than the embarrassment. This is a well-maintained, typed catalogue, and it is unreadable to a machine at exactly the field where a wrong answer is dangerous. Every distributor and every manufacturer we know of is in the same condition or worse. The remedy proposed in section 3 — consult the records — is currently a remedy in principle.</p>"
  },
  {
    type: "section_head",
    number: "/06",
    title: "The tacit component",
    anchor: "the-tacit-component"
  },
  {
    type: "prose",
    html: "<p>One further obstruction deserves mention because it is systematically underestimated.</p><p>A significant part of what an experienced technician knows is not merely absent from the records; it has never been in propositional form at all. Polanyi (1966) put it that we know more than we can tell. The technician who runs a thumb along a hose cover and decides it has hardened is performing a measurement, but not one they could write down as a procedure, and not one they arrived at from a datasheet.</p><p>This is Moravec's paradox in a specifically industrial dress (Moravec, 1988): the parts of the job that look most like expertise — reading a specification, calculating a pressure drop — are the parts most easily automated, and the parts that look like nothing at all — touching, listening, noticing that a machine sounds different this week — are the residue.</p><p>The consequence for system design is not despair; it is that elicitation is a design activity with a schedule attached. The knowledge is held by people who are retiring, and it is the highest-value input to the memory the system needs.</p>"
  },
  {
    type: "section_head",
    number: "/07",
    title: "What actually closes the gap",
    anchor: "what-actually-closes-the-gap"
  },
  {
    type: "prose",
    html: "<p>The argument has been negative so far. The constructive version has three parts, in ascending order of importance.</p><h3>7.1 Sense what vision cannot</h3><p>The obvious response to an information ceiling is a different channel. Tactile sensing has matured substantially — vision-based tactile sensors recover surface geometry and contact force at high spatial resolution (Yuan <em>et al.</em>, 2017) — and hardness, compliance and surface texture are exactly the properties Figure 1 marks as invisible. Acoustic emission observes crack activity directly, because a growing crack radiates. Vibration analysis observes bearing and gear condition through spectra with well-understood defect frequencies. Ultrasonic and eddy-current methods observe sub-surface state.</p><p>None of this is novel; it is standard condition-monitoring practice, and it substantially predates the current interest in embodied AI. The observation we would make is that the robotics literature has concentrated overwhelmingly on the modality with the <em>worst</em> observability profile for this application, because that is the modality with the best benchmarks and the largest datasets.</p><h3>7.2 Put the physics in the model</h3><p>Where the state is unobservable it can often be <em>predicted</em>, because degradation follows constitutive laws. Fatigue accumulation given a load history is calculable. Elastomer ageing given a thermal history is modellable. A crack's growth given its size and the stress intensity range is Paris's law.</p><p>Physics-informed neural networks embed the governing differential equations into the training objective as a constraint, so that the learned solution must satisfy the physics as well as fitting the data (Raissi <em>et al.</em>, 2019). This is an unusually good fit for the industrial case, where data is scarce and expensive but the governing physics is well characterised and a century old. A model that cannot see fatigue damage but knows the load history and the material law can estimate it — and the estimate carries an uncertainty that is honest, because it comes from a mechanism rather than from a correlation.</p><h3>7.3 Fix the memory</h3><p>The largest available gain, and the least glamorous.</p><p>Every remedy above depends on records: load history, thermal history, install date, fluid, duty, provenance, and a part identity stable enough to join them. Section 5 shows what condition those records are actually in. Before an autonomous system can reason about the state of an asset it must be able to <em>read</em> what is known about the asset, and today it largely cannot.</p><p>Concretely, this means: canonical field names with required units, quantities expressed as structured objects rather than strings, part identity that resolves across manufacturers, and history attached to the individual serialised component rather than to the catalogue line. None of this is research. All of it is schema design, and it is the work standing between the current state and everything discussed in sections 7.1 and 7.2.</p>"
  },
  {
    type: "section_head",
    number: "/08",
    title: "Conclusion",
    anchor: "conclusion"
  },
  {
    type: "prose",
    html: "<p>Can robots with vision models solve industrial AI? No, and the reason is worth restating precisely, because the precise version is more useful than the headline.</p><p>Vision has an information ceiling with respect to industrial condition, set by the physics of how degradation manifests, and the data processing inequality says no model can exceed it. The variables that decide failure are, for the most part, historical rather than appearance-based: what this component has endured, not what it looks like now. That history exists — in purchase records, maintenance logs, process historians and specification databases — and it is largely unreadable to a machine, as our own audit demonstrates on our own data.</p><p>The field is therefore optimising the wrong term. Enormous effort is going into raising extraction efficiency against a low ceiling, while the channel with a high ceiling — recorded history — receives comparatively little, because schema design does not produce a compelling demonstration video.</p><blockquote><p>Industrial AI will be solved by databases some years before it is solved by cameras.</p></blockquote><p>We do not think this is a pessimistic conclusion. It is a considerably more tractable problem than the one usually posed. Nobody needs to invent anything to fix a pressure field that says <code>15000</code> with no unit. Somebody needs to decide it matters.</p>"
  },
  {
    type: "callout",
    tone: "note",
    title: "A note on sourcing",
    body: "The catalogue figures in section 5 were obtained by direct query of our production database on 8 September 2026 and are reproducible from the stated record counts. Figure 1 is an analytical summary reflecting the authors' assessment of observability by modality, not a measured dataset."
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
        id: "geirhos-2020",
        text: "Geirhos, R., Jacobsen, J.-H., Michaelis, C., Zemel, R., Brendel, W., Bethge, M. and Wichmann, F.A. (2020) 'Shortcut learning in deep neural networks', Nature Machine Intelligence, 2, pp. 665–673."
      },
      {
        id: "guo-2017",
        text: "Guo, C., Pleiss, G., Sun, Y. and Weinberger, K.Q. (2017) 'On calibration of modern neural networks', Proceedings of the 34th International Conference on Machine Learning (ICML), PMLR 70, pp. 1321–1330."
      },
      {
        id: "international-2019",
        text: "International Organization for Standardization (2019) ISO 815-1: Rubber, vulcanized or thermoplastic — Determination of compression set — Part 1: At ambient or elevated temperatures. Geneva: ISO."
      },
      {
        id: "kaelbling-1998",
        text: "Kaelbling, L.P., Littman, M.L. and Cassandra, A.R. (1998) 'Planning and acting in partially observable stochastic domains', Artificial Intelligence, 101(1–2), pp. 99–134."
      },
      {
        id: "kendall-2017",
        text: "Kendall, A. and Gal, Y. (2017) 'What uncertainties do we need in Bayesian deep learning for computer vision?', Advances in Neural Information Processing Systems (NeurIPS) 30, pp. 5574–5584."
      },
      {
        id: "li-2023",
        text: "Li, Y., Du, Y., Zhou, K., Wang, J., Zhao, W.X. and Wen, J.-R. (2023) 'Evaluating object hallucination in large vision-language models', Proceedings of the 2023 Conference on Empirical Methods in Natural Language Processing (EMNLP), pp. 292–305."
      },
      {
        id: "moravec-1988",
        text: "Moravec, H. (1988) Mind Children: The Future of Robot and Human Intelligence. Cambridge, MA: Harvard University Press."
      },
      {
        id: "paris-1963",
        text: "Paris, P. and Erdogan, F. (1963) 'A critical analysis of crack propagation laws', Journal of Basic Engineering, 85(4), pp. 528–533."
      },
      {
        id: "polanyi-1966",
        text: "Polanyi, M. (1966) The Tacit Dimension. New York: Doubleday."
      },
      {
        id: "raissi-2019",
        text: "Raissi, M., Perdikaris, P. and Karniadakis, G.E. (2019) 'Physics-informed neural networks: a deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations', Journal of Computational Physics, 378, pp. 686–707."
      },
      {
        id: "rohrbach-2018",
        text: "Rohrbach, A., Hendricks, L.A., Burns, K., Darrell, T. and Saenko, K. (2018) 'Object hallucination in image captioning', Proceedings of the 2018 Conference on Empirical Methods in Natural Language Processing (EMNLP), pp. 4035–4045."
      },
      {
        id: "shannon-1948",
        text: "Shannon, C.E. (1948) 'A mathematical theory of communication', Bell System Technical Journal, 27(3), pp. 379–423."
      },
      {
        id: "suresh-1998",
        text: "Suresh, S. (1998) Fatigue of Materials. 2nd edn. Cambridge: Cambridge University Press."
      },
      {
        id: "thrun-2005",
        text: "Thrun, S., Burgard, W. and Fox, D. (2005) Probabilistic Robotics. Cambridge, MA: MIT Press."
      },
      {
        id: "worden-2007",
        text: "Worden, K., Farrar, C.R., Manson, G. and Park, G. (2007) 'The fundamental axioms of structural health monitoring', Proceedings of the Royal Society A, 463(2082), pp. 1639–1664."
      },
      {
        id: "yuan-2017",
        text: "Yuan, W., Dong, S. and Adelson, E.H. (2017) 'GelSight: high-resolution robot tactile sensors for estimating geometry and force', Sensors, 17(12), 2762."
      }
    ]
  },
  {
    type: "cta_block",
    heading: "Specifications you can actually read",
    body: "This article audits our own catalogue and reports what it found. We supply hydraulic hose, fittings and adapters across 126 markets, and we would rather be asked hard questions about a specification than sell against a vague one. Send us the part and we will tell you what we know about it.",
    quoteLabel: "Request a quote"
  }
],
}

export default ARTICLE
