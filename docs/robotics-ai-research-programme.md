# Industrial Robotics and AI — research programme and subtopic map

**Parent strategy:** [`citable-research-content-strategy.md`](./citable-research-content-strategy.md)
**Programme:** B (elevated from gated to primary, per owner decision 2026-09-11)
**Named co-authors:** Ayush Bhatia, Krishan Bhatia
**Date:** 2026-09-11
**Status:** proposal

---

## 0. Decision recorded

The owner has reviewed the concern raised in §1.2 of the parent strategy — that
robotics-and-AI commentary from a fluid-power distributor risks being neither
citable nor topically useful — and has decided to proceed with the topic as
originally framed. This document takes that as settled and does the work of
making the topic defensible rather than re-arguing it.

One substantive change follows from that decision, and it is the organising
idea of this document:

> **Own the inspected, not the inspector.**
>
> Do not compete on how reasoning models work. Compete on what they are being
> pointed at. On a drilling rig, the majority of what an inspection robot looks
> at is a pressure-containment or hydraulic interface — hoses, fittings,
> manifolds, accumulators, BOP control lines. Roboticists know their models.
> They do not know what a failing hydraulic joint looks like six hours before
> it fails, and they do not know why a thermal camera lies about it.
>
> That asymmetry is the entire authority position, and it is real.

Written that way, every cluster below is authored from the asset owner's side
of the problem — a requirements document addressed to robotics, not a robotics
paper. That framing is honest about what the authors know, is more useful to
the target audience than another model survey, and is the version of this topic
that can actually earn citations.

---

## 1. Co-authors — what is needed before publishing

Two named authors are recorded above. Two `BlogAuthor` rows are needed
(currently the database holds one). `BlogAuthor.credentials` feeds
`hasCredential` in Person JSON-LD, which is the mechanism converting a byline
into a machine-readable expertise signal — it is a substantial part of why
author pages are worth building at all.

**These fields must be filled with real, verifiable credentials. Supply them
before the rows are created — nothing here should be invented, and a fabricated
credential on a safety-adjacent technical claim is the fastest way to lose
exactly the credibility this programme is being built to earn.**

| Field | Ayush Bhatia | Krishan Bhatia |
|---|---|---|
| `name` | Ayush Bhatia | Krishan Bhatia |
| `jobTitle` | *needed* | *needed* |
| `credentials` | *needed* — degrees, certifications, e.g. IWCF level, API inspector tickets, chartered status | *needed* |
| `yearsExperience` | *needed* | *needed* |
| `bio` | *needed* — 2–3 sentences, specific to fluid power and the markets served | *needed* |
| `linkedinUrl` | *needed* | *needed* |
| `avatarMediaId` | *needed* — real photograph | *needed* |

**Authorship split, honestly assigned.** Clusters 3, 4 and 6 are directly
within fluid-power and distribution expertise and can be authored outright.
Clusters 1, 2 and 5 are robotics, ML and functional-safety territory; they are
written as *requirements and constraints from the asset-owner side*, never as
claims about model internals. Where a cluster makes a claim about how a model
behaves, it cites a primary source rather than asserting it. That discipline is
what keeps the programme defensible without a robotics PhD on the byline.

If an external co-author from robotics or asset integrity becomes available
later, cluster 2 is where they add the most and should be revisited.

---

## 2. Decomposing the header

The proposed header contains four separable claims. Treating them as one
article produces a shallow survey; treating them as four research questions
produces a programme.

> *"Industrial robotics and AI — how advanced reasoning models can perform
> industrial jobs in drilling rig inspection, with the advancement of
> model × robot interconnectedness."*

| Layer | The claim | The real question | Cluster |
|---|---|---|---|
| Cognition | "advanced reasoning models" | What can a model that thinks for 1–3 seconds actually be trusted to decide? | 1 |
| Interface | "model × robot interconnectedness" | What protocol carries a model's decision to an actuator, and what can it not express? | 2 |
| Domain | "drilling rig inspection" | What is actually on a rig inspection checklist, and what fraction is hydraulic? | 3 |
| Physical | *(implicit)* | What can no camera see, however good the model behind it? | 4 |
| Ceiling | *(absent from the header, and it is the binding constraint)* | Who certifies it, and who is liable when it is wrong? | 5 |
| Loop | *(absent)* | A finding is not a fix. How does a detection become a part on a boat? | 6 |

Clusters 4, 5 and 6 are the ones the original framing left out, and they are
the three where this authorship is strongest. Cluster 5 in particular is where
the current industry conversation has moved — the constraint on physical AI in
2026 is reported to be certification and insurability rather than capability,
which is precisely an asset-owner's question, not a model-builder's.

---

## 3. The pillar

**`Reasoning models on the drill floor: what autonomy can and cannot do at the pressure boundary`**

5,000–6,000 words. The hub. Every cluster links up to it; it links down to all
six. Structure:

1. The state of deployment — autonomous inspection robots are reported on
   roughly one in four offshore rigs; what they actually do today is gauge
   reading, leak detection, thermal and acoustic survey.
2. The capability that arrived — reasoning models and VLAs can now classify a
   finding and describe it in language.
3. The four walls they hit — latency (cluster 1), authorisation (cluster 2),
   physics of what is invisible (cluster 4), certification (cluster 5).
4. The unclosed loop — detection to procurement (cluster 6).
5. What a defensible architecture looks like: a deterministic safety envelope,
   the model advising and never actuating, the reasoning trace retained as the
   audit artefact.

*Artefact: the inspection-target taxonomy from cluster 3 — an original count of
what is on a rig inspection scope and how much of it is fluid power.*

---

## 4. Cluster 1 — The cognition layer

*What a reasoning model can be trusted to decide.*

**1.1 `The three-second problem: reasoning latency against hydraulic failure timescales`**
The strongest opening piece in the programme. Agentic ROS 2 frameworks report
LLM inference in the region of 1–3 seconds per turn, which confines them to
deliberative, task-level control. Set that against the physics: a hose burst
propagates in milliseconds; an accumulator dumps its stored energy faster than
any inference loop can close. Conclusion, stated plainly — a reasoning model
can be an inspector and a planner, and cannot be a controller. Nothing in the
current trajectory changes that, because the gap is four orders of magnitude.
*Artefact: a timescale chart, failure event duration against inference latency.*

**1.2 `Decomposing "inspection": eight tasks, and the three a model is good at`**
Inspection is not one job. Detect → classify → grade severity → attribute cause
→ decide action → authorise → specify the part → schedule. Reasoning models are
strong at classification, description and report drafting; weak at severity
grading under partial observation; and have no standing at all at
authorisation. Making the decomposition explicit is genuinely useful to anyone
scoping an autonomy pilot.
*Artefact: task decomposition table with a capability assessment per task.*

**1.3 `Silent failure and the confident model`**
The literature on runtime action authorization describes a black-box model
issuing a physically consequential action while appearing confident, plausible
and semantically aligned — failure arising from sensor drift, occlusion,
distribution shift or hallucinated affordances before any downstream controller
detects a violation. Applied to a rig: what an overconfident "joint is
serviceable" costs. Argues for calibrated uncertainty as a hard requirement in
any inspection specification.

**1.4 `The reasoning trace is the deliverable`**
Contrarian and likely the most-shared piece in the cluster. In a regulated
inspection regime the auditable artefact matters more than the verdict — a
human inspector's value is partly that they can be cross-examined. A chain of
thought is cross-examinable in a way a classifier score is not. Proposes
retaining and signing the trace as the inspection record.

**1.5 `Grading severity under partial observation`**
Why "is this hose serviceable?" is not a vision problem. Service age, fluid
compatibility history, pressure cycle count and storage conditions are all
invisible in the frame and decisive in the answer. The model needs asset
history it does not have.

**1.6 `What we would need to see before letting a model near a BOP`**
The requirements document, written from the operator's side. The single most
useful thing this programme can hand the robotics industry, and it requires no
robotics credential to write — only knowledge of what the consequence is.

---

## 5. Cluster 2 — Model × robot interconnectedness

*The interface layer. The most novel phrase in the original header; treat it as
the most technically substantial cluster.*

**2.1 `The emerging agent-to-robot protocol stack, and what it cannot express`**
A survey with a point of view. MCP as agent-to-tool, A2A as agent-to-agent,
and the robot-side proposals — Robot Context Protocol, ROS 2 bridges such as
ROSClaw and rosbridge-based MCP servers. Recent work explicitly identifies
governance gaps in what these protocols cannot express. Reframe those gaps in
physical terms: none of them carries reversibility, stored-energy state,
required isolation, or authorisation level.
*Artefact: a capability matrix of protocols against physical-action requirements.*

**2.2 `Tool calls were designed for idempotent software, and actuation is neither`**
The clearest technical argument available here. A tool call that fails can be
retried. Opening a valve cannot. Function-calling schemas carry no notion of
reversibility, no precondition on stored energy, no lockout/tagout state, no
two-person rule. Proposes the missing fields.
*Artefact: a proposed action-envelope schema — preconditions, reversibility class,
energy state, authorisation tier, timeout behaviour.*

**2.3 `Runtime action authorization: who says yes`**
Follows the emerging literature on silent failures and runtime authorization
and applies it to permit-to-work. The oil and gas industry has had a mature
human answer to this for decades — the permit system. Map the permit to a
machine protocol. This is a genuinely novel contribution and nobody in robotics
is likely to make it, because it requires knowing how a permit actually works.

**2.4 `Prompt injection against a physical robot`**
Highest link potential in the programme. Recent work traces a path from
manipulated agent inputs to hijacked physical robots. The rig-specific version
is concrete and alarming: an inspection robot reading equipment labels, QR
codes, valve tags and handwritten annotations is consuming untrusted input from
its environment. A sticker is an attack surface. ISO 10218:2025 brings
cybersecurity into robot safety scope for the first time — this sits exactly on
that seam.
*Artefact: a threat model for environment-sourced injection in industrial inspection.*

**2.5 `What an inspection finding must contain to become an order`**
The schema piece, and the one that ties this programme to the catalogue. A
finding that says "hydraulic leak, moderate" is unactionable. A finding that
carries port thread identity, seal form, pressure class, material and
orientation is a purchase order. Pairs directly with the spec-schema work in
programme A of the parent strategy.
*Artefact: `InspectionFinding` JSON schema, versioned and published.*

**2.6 `Latency, bandwidth and the offshore link`**
The unglamorous constraint that decides architecture. Where does inference run
when the platform's backhaul is satellite? Edge, ship, shore — and what each
choice costs in reaction time and certifiability.

---

## 6. Cluster 3 — Drilling rig inspection as a domain

*Written for a robotics audience that has never read an inspection scope.*

**3.1 `What is actually on a rig inspection scope`**
The foundational reference piece. Walk the real regimes — API RP 8B for
hoisting equipment, DS-1 and API RP 7G-2 for drill stem, API RP 54 for
occupational safety, 30 CFR 250 Subpart G for BOP systems offshore in US
waters. Categorise every inspection target by type.
*Artefact: an original taxonomy — inspection targets by system, with the fluid-power
fraction counted. This number does not currently exist in public and is the
single most citable output of the cluster.*

**3.2 `The BOP control system: the highest-consequence inspection on the rig`**
API 16D territory — hydraulic control manifolds, ASME-coded accumulator
bottles, remote panels, air and electric pump assemblies. Why this is the
inspection autonomy will reach last, and why that is correct. Deep domain
authority, and directly adjacent to the catalogue.

**3.3 `Zone 1 and Zone 2: the certification wall robotics keeps walking into`**
Chronically underrated by the robotics industry and immediately obvious to
anyone who works on a rig. A robot that is not ATEX or IECEx certified for the
hazardous area cannot go where the inspection is needed. Explosion-protection
certification is a hardware discipline, largely orthogonal to how good the
model is. Expect this piece to be shared by people who have had this argument.

**3.4 `Land rig versus offshore: two different autonomy economics`**
Offshore pays for autonomy because a person on a platform is expensive and
exposed. A land rig in Oman or the Western Desert does not have the same maths.
Directly relevant to the markets already served.

**3.5 `Gauge reading, leak detection, thermography, acoustics: what deployed robots actually do`**
An honest audit of current capability against the marketing. Grounds the whole
programme in what is real today.

**3.6 `Inspection intervals as a scheduling problem`**
Autonomy changes inspection economics by making the marginal inspection nearly
free. What happens to a maintenance regime built around scarce inspections when
inspection becomes continuous? Genuinely open and worth arguing about.

---

## 7. Cluster 4 — What no camera can see

*Home turf. The cluster where this authorship is strongest and the robotics
audience is weakest. Highest ratio of authority to effort in the programme.*

**4.1 `Failure modes invisible to vision, however good the model`**
The flagship of the cluster. Internal tube degradation, seal compression set,
elastomer swell from fluid incompatibility, permeation, cold flow, wire braid
corrosion progressing under an intact cover. Every one of these is a hose that
looks perfect and is not. States the hard limit of visual autonomy from physics
rather than from model capability.
*Artefact: failure-mode table — mode, external visibility, detectable modality, warning time.*

**4.2 `Why thermal imaging misreads hydraulic leaks`**
Specific, technical, useful. A pinhole leak at pressure can be cooler than the
line through expansion; a restriction can be hotter with no leak at all.
Thermography answers a different question than the one being asked of it.

**4.3 `Reading a weeping joint: the source determines the cause`**
There is already a short article on this. The research version is the deep one
— oil at the crimp, at the seat and at the thread each indicate a different
failure with a different remedy. Argues that inspection output must localise,
not merely detect, and that current models detect.

**4.4 `Acoustic and vibration signatures of hydraulic failure`**
Where autonomy genuinely beats a human inspector — continuous listening.
Cavitation, orifice noise, pump ripple. The honest counterweight to cluster 4's
scepticism, and it strengthens the programme's credibility to include it.

**4.5 `Injection injury and stored energy: why this inspection should be robotic`**
The safety argument, and the emotional centre of the programme. A pinhole leak
at 350 bar injects fluid through skin; the injury looks trivial and is a
surgical emergency. An accumulator holds lethal energy with the pump off and
the machine apparently dead. This is the strongest possible case *for*
autonomous inspection, made by someone who understands the hazard — which is
far more persuasive than a robotics vendor making it.

**4.6 `The substitution problem: identified is not specified`**
Bridges into programme A. The robot correctly identifies a failed fitting. It
cannot say what replaces it, because part identity is not machine-readable —
and here the parent strategy's audit of 16,114 specifications supplies the
numbers, including the 89.5% of specifications that carry no unit.

---

## 8. Cluster 5 — Certification, liability and the real ceiling

*Where the industry conversation actually is in 2026. Absent from the original
header and arguably the most important cluster in the programme.*

**5.1 `The ceiling is certification, not capability`**
ISO 10218-1:2025 and 10218-2:2025 replaced the 2011 editions and entered force
in April 2025, adding system-level integration, functional safety,
cybersecurity and a robot classification scheme — with acknowledged gaps around
AI, humanoids and mobile manipulation. Commentary through 2026 has converged on
certification and insurability, rather than capability, as the binding
constraint on physical AI. Written from the asset owner's side: what an
operator actually needs to see before a robot goes on the drill floor.

**5.2 `You cannot assign a performance level to a stochastic model`**
The sharpest technical argument in the programme. Functional safety under
IEC 61508 and ISO 13849 rests on quantified, demonstrable failure rates. A
model whose output distribution shifts with a prompt does not have one.
Therefore the safety function must live outside the model — deterministic
envelope, model advises. This is an architectural conclusion, not a complaint,
and it is the piece most likely to be cited by people building these systems.

**5.3 `Who is liable when an AI-assisted inspection misses a failure`**
The inspector, the integrator, the model vendor, the operator. Currently
unresolved and increasingly urgent.

**5.4 `A certifiable architecture for autonomous inspection`**
The constructive counterpart to 5.1 and 5.2. Deterministic safety envelope,
model confined to advisory, human authorisation at the action boundary, signed
reasoning trace as the audit record, hardware interlocks that no software path
can override. This is the reference-architecture piece and a strong candidate
for the most-linked asset in the programme.
*Artefact: architecture diagram plus a conformance checklist.*

**5.5 `EU AI Act and ISO/IEC 42001 applied to industrial inspection`**
Concrete rather than general: what classification an inspection system falls
under, what documentation is required, what an operator must retain.

**5.6 `The insurance question`**
Underwriters are the actual gatekeepers of autonomy, well ahead of regulators.
Almost nobody writes about this and it decides deployments.

---

## 9. Cluster 6 — Closing the loop

*Detection is not repair. The commercial bridge, and the reason this programme
pays for itself.*

**6.1 `From detection to purchase order: the unclosed loop`**
The narrative spine of the whole programme. A finding becomes a work order
becomes a part specification becomes a supplier becomes a shipment. The loop
breaks at specification, every time, for the reasons in 4.6.

**6.2 `The spares problem: an autonomous rig with a two-week resupply`**
Continuous inspection generates more findings. More findings need more parts.
Remote sites do not have them. Autonomy shifts the bottleneck from detection to
logistics — a genuinely interesting second-order consequence, and directly
adjacent to what the business does.

**6.3 `Machine-readable part identity as the missing layer`**
Explicit bridge to programme A. Whatever is decided about the robotics
programme, this is where the two halves meet.

**6.4 `Condition-based replacement when the condition is continuously observed`**
If a hose is watched continuously, replacement stops being interval-driven.
What that does to stocking policy and to how parts are bought.

---

## 10. Sequencing

Fifteen strong pieces beat thirty-five adequate ones. Ship in this order — each
phase is chosen so the programme's credibility is established before its more
speculative claims are made.

| Phase | Pieces | Why this order |
|---|---|---|
| 0 | Author rows with real credentials; `research` category; engineering PR from parent §5.2 | Nothing publishes without attribution |
| 1 | **4.1, 4.5, 3.1** | Open on home turf. Establish that these authors know things robotics does not, before making any claim about models |
| 2 | **1.1, 3.3** | The two hard-constraint pieces. Both are "here is a wall you have not accounted for", both are highly shareable |
| 3 | **Pillar** | Only now — the hub needs its spokes to point at |
| 4 | **5.1, 5.2, 5.4** | The certification cluster, where the 2026 conversation is |
| 5 | **2.4, 2.2, 2.5** | The protocol cluster. 2.4 is the link magnet; 2.5 is the bridge to the catalogue |
| 6 | **6.1, 4.6, 6.3** | Close the loop into commercial ground |
| 7 | Remainder, by measured performance | Let phase 1–6 data choose |

**Phase 1 is the real test, and 4.1 is the single article to judge the
programme on.** If a rigorous, well-illustrated piece on hydraulic failure
modes invisible to vision earns nothing from the robotics audience, the topic
distance is confirmed too great and the parent strategy's kill criterion
applies.

---

## 11. Artefacts, ranked

Per the parent strategy's rule — no article ships without an artefact.
Highest link-earning potential first.

1. **`InspectionFinding` JSON schema** (2.5) — adoptable, forkable, citable
2. **Rig inspection target taxonomy with fluid-power fraction** (3.1) — an original count that does not exist publicly
3. **Certifiable architecture reference + conformance checklist** (5.4)
4. **Failure-mode table: visibility against detectable modality** (4.1)
5. **Environment-sourced prompt-injection threat model** (2.4)
6. **Protocol capability matrix against physical-action requirements** (2.1)
7. **Action-envelope schema** (2.2)
8. **Latency-against-failure-timescale chart** (1.1)

Schemas 2.5 and 2.2 should live in a public GitHub repository, versioned
independently of this site, so they can be forked and cited on their own terms.

---

## 12. Sourcing discipline

This programme makes claims about model behaviour, standards and deployment
statistics. Three rules, non-negotiable, because the entire value of the
programme is that it is trustworthy:

1. **Every claim about model capability cites a primary source** — a paper, a
   vendor technical report, a standard. Never an assertion, never a secondary
   blog.
2. **Every standard is cited by designation, clause and edition year**, using
   the existing `standard_citation` block, and read before citing. API 16D,
   ISO 10218-1:2025, IEC 61508, ISO 13849, 30 CFR 250 Subpart G, ATEX/IECEx,
   DS-1, API RP 8B.
3. **Every figure carries an `as_of_stamp`.** Deployment statistics and model
   capability claims decay within months.

**The references gathered below were surfaced by search and have not been read
in full.** They are leads, not citations. Each must be retrieved and verified
before it appears in a published article — arXiv identifiers in particular
should be confirmed to resolve to the paper described, and preprints should be
checked for later published versions.

---

## 13. Leads to verify

**Foundation models and VLAs in industry**
- Robotic Foundation Models for Industrial Control: survey and readiness assessment — https://arxiv.org/pdf/2603.06749
- Foundation Models in Robotics: methods, models, datasets, challenges — https://arxiv.org/pdf/2604.15395
- Characterizing VLA models across XPUs: constraints for on-robot deployment — https://arxiv.org/pdf/2604.24447
- Cortex 2.0: grounding world models in real-world industrial deployment — https://arxiv.org/pdf/2604.20246
- Generative AI in industrial robotics, 2026 layers guide — https://www.evsint.com/generative-ai-industrial-robotics-foundation-models-code-generation-2026/

**Model × robot interconnectedness**
- ROSClaw: a ROS 2 framework for agentic robot control — https://arxiv.org/html/2603.26997v1
- Robot Context Protocol: runtime-agnostic interface for agent-aware robot control — https://arxiv.org/pdf/2506.11650
- Governance gaps in agent interoperability protocols: what MCP, A2A and ACP cannot express — https://arxiv.org/pdf/2606.31498
- AgentRob: from virtual forum agents to hijacked physical robots — https://arxiv.org/pdf/2602.13591
- Survey of LLM agent communication with MCP — https://arxiv.org/pdf/2506.05364

**Safety, failure and verification**
- Silent failures in physical AI: runtime action authorization — https://arxiv.org/pdf/2606.00090
- Safety in embodied AI: risks, attacks and defenses — https://arxiv.org/pdf/2605.02900
- Making embodied AI reliable: from testing to formal verification — https://arxiv.org/html/2606.03593
- Large language model reasoning failures — https://arxiv.org/pdf/2602.06176
- Towards robust and secure embodied AI, ACM Computing Surveys — https://dl.acm.org/doi/10.1145/3806048

**Standards and certification**
- Evolution of safety requirements in industrial robotics: ISO 10218-1/2, 2011 vs 2025 — https://www.sciencedirect.com/science/article/pii/S2590123026015203
- Embedding ISO 10218 compliance via control barrier functions — https://arxiv.org/pdf/2606.13203
- ISO 10218-1:2025 robotics safety requirements — https://pacificcert.com/iso-10218-1-2025-robotics-safety-requirements/
- The new ceiling for physical AI is certification, not capability — https://highways.today/2026/08/13/physical-ai-certification/

**Rig and offshore deployment**
- ANYbotics: transforming offshore operations, the rise of autonomous inspection robots — https://www.offshore-mag.com/business-briefs/equipment-engineering/article/14293038/anybotics-transforming-offshore-operations-the-rise-of-autonomous-inspection-robots
- Offshore oil and gas industry embraces robotic technology — https://www.offshore-mag.com/production/article/14206250/offshore-oil-and-gas-industry-embraces-robotic-technology
- Drone ops edging North Sea platforms toward autonomous inspection — https://www.offshore-energy.biz/drone-ops-edging-north-sea-oil-platform-closer-to-autonomous-offshore-inspections/
- Subsea robotics and data platforms in offshore energy — https://www.workboat.com/subsea-robotics-and-data-platforms-are-streamlining-offshore-energy-operations
- Robots at the rig: AI-driven robotics in inspection, maintenance and drilling safety — https://penchingroup.com/25213-2/

**BOP and rig hydraulics**
- BOP control unit, API 16D hydraulic accumulator system — https://goldenman.com/blog-bop-control-unit/
- Blowout preventers: types, components, testing, API 16A/53 — https://blog.projectmaterials.com/oil-gas-equipment/blow-out-preventers-upstream/
- 30 CFR 250 Subpart G, BOP system requirements — https://www.ecfr.gov/current/title-30/chapter-II/subchapter-B/part-250/subpart-G/subject-group-ECFR045ffcd99ad03d3/

---

## 14. Open questions

1. Real credentials for both authors — blocking, per §1.
2. Is there access to a live rig inspection scope that can be anonymised and
   published? That single document would make 3.1 unassailable.
3. Any existing relationship with an operator or drilling contractor willing to
   be named or quoted? One named operator is worth more than ten citations.
4. Does 2.4, the prompt-injection threat model, need a security review before
   publication? Recommended — it describes an attack class against deployed
   equipment, and it should be written defensively, with no working exploit
   detail.

---

## Appendix A — Popular titles

Thirty accessible titles for a general technology audience, distinct from the
research titles in §4–§9. Those are written to be cited; these are written to
be clicked and shared, and they feed the same articles.

Each is built on a specific verified fact rather than a vague provocation —
that is what separates a curiosity gap from clickbait, and this audience
punishes the difference. Cluster references map each title to the research
piece it fronts.

### The data problem *(cluster 6, bridges to programme A)*

| # | Title | Hook |
|---|---|---|
| 1 | 15,000 what? | 88 rows in our catalogue say `15000` with no unit. A human infers psi. A machine can't. |
| 2 | We asked an AI to read 16,114 engineering specs. It couldn't. | The audit, in plain language. |
| 3 | 89% of our product data has no units. We checked. | Self-critical, quantified, checkable. |
| 4 | A pressure rating of "0" — and why that's the dangerous one | 10 rows. A null encoded as a number an agent will compare against. |
| 5 | Your robot found the broken part. It can't order a new one. | The whole thesis in one sentence. |
| 6 | Autonomy doesn't fail at thinking. It fails at part numbers. | Shareable version of the pillar. |

### Speed and physics *(cluster 1)*

| # | Title | Hook |
|---|---|---|
| 7 | The hose bursts in milliseconds. The model thinks for three seconds. | Four orders of magnitude, stated as a fact. |
| 8 | Why a reasoning model will never be a controller | Architectural conclusion, not a complaint. |
| 9 | Robots got smart. Steel didn't get slower. | The compressed version of 7. |

### What cameras can't see *(cluster 4)*

| # | Title | Hook |
|---|---|---|
| 10 | The hose that looks perfect and is already dead | Internal degradation under an intact cover. |
| 11 | Why thermal cameras lie about hydraulic leaks | Thermography answers a different question than the one asked. |
| 12 | A leaking pipe can be colder than a healthy one | Expansion cooling at a pinhole. Counterintuitive and true. |
| 13 | Six failure modes no camera will ever catch | The table, as a listicle. |
| 14 | Vision models solved seeing. They didn't solve looking. | Detection versus localisation. |
| 15 | What a mechanic notices that a model doesn't | Tacit knowledge, made explicit. |

### Stakes *(cluster 4)*

| # | Title | Hook |
|---|---|---|
| 16 | The injury that looks like a pinprick and needs surgery by morning | Injection injury. The strongest case *for* robotic inspection. |
| 17 | The machine is off. The hydraulics are still lethal. | Stored energy in an accumulator. |
| 18 | The inspection job robots should have taken first | Positive framing of the same argument. |

### The certification wall *(cluster 5)*

| # | Title | Hook |
|---|---|---|
| 19 | The robot is good enough. It's just not allowed in the room. | ATEX/IECEx hazardous-area certification. |
| 20 | You can't give a language model a safety rating | No demonstrable failure rate, so no PL or SIL. |
| 21 | Physical AI's ceiling isn't capability. It's paperwork. | Where the 2026 conversation actually is. |
| 22 | Why "explosion-proof" matters more than your model weights | Deliberately provocative to a robotics audience. |
| 23 | The wall every robotics startup hits in month 18 | Certification, from the buyer's side. |

### Protocol and interconnect *(cluster 2)*

| # | Title | Hook |
|---|---|---|
| 24 | A failed API call retries. A failed valve doesn't. | Idempotency against actuation. |
| 25 | Tool calling was built for software that can undo itself | The longer form of 24. |
| 26 | You could hack an inspection robot with a sticker | Highest link potential in the programme. |
| 27 | The robot reads the label on the pipe. So can an attacker. | Environment as untrusted input. |
| 28 | Who says yes? The missing layer between AI and actuators | Runtime action authorization, mapped to permit-to-work. |
| 29 | What an AI needs to know before it touches a blowout preventer | Requirements from the operator's side. |
| 30 | The last six inches of industrial AI | Where reasoning meets metal. |

**Note on use.** These are surfaces, not substitutes. A popular title over a
thin article spends credibility rather than building it; each one should front
a piece that carries its research artefact per §11. Numbers 1, 5, 7, 16, 24 and
26 are the strongest candidates for outside distribution.
