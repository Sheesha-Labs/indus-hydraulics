import type { BlogArticleSeed } from '../shared'

const ARTICLE: BlogArticleSeed = {
  slug: 'removing-a-seized-hydraulic-fitting',
  title: 'Removing a seized hose or fitting without destroying the port',
  excerpt:
    'The hose is scrap either way. The manifold behind it is not, and almost every expensive outcome here comes from a decision made in the first five minutes.',
  categorySlug: 'machine-down',
  authorSlug: 'mehul-rana',
  seoTitle: 'How to remove a seized hydraulic fitting safely',
  seoDescription:
    'A field method for a seized hydraulic hose or adapter: depressurise, back up the port, penetrant and heat in the right order, when to cut the hose off, and when to stop before the port is damaged.',
  focusKeyword: 'seized hydraulic fitting removal',
  publishedAt: '2026-08-24T17:44:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'Depressurise first, including any accumulator and any raised implement. Stored energy does not care that the engine is off.',
        'The hose is already being replaced, so cut it off and work on a clean stub rather than fighting a whole assembly.',
        'Always back up the port adapter with a second wrench. Most ruined manifolds are ruined by the wrench that was not used.',
        'Penetrant then patience, then heat — and heat only where there is no residual oil and no seal you intend to keep.',
        'Stop when the hex starts to round. A rounded nut is recoverable; a cracked port is a component replacement.',
      ],
    },
    {
      type: 'lead',
      html: 'Every workshop has the same photograph somewhere: a rounded union nut, a bright scar across a manifold face, and a machine that went from a one-hour hose change to a three-day parts wait. It is rarely a strength problem. It is an order-of-operations problem.',
    },

    {
      type: 'section_head',
      number: '/01',
      title: 'Before a wrench touches anything.',
      anchor: 'before',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'Stored energy first, always.',
      body: 'Lower every raised implement to the ground or fit the mechanical props. Stop the engine, then cycle the control levers to relieve trapped pressure. Discharge any accumulator by its own procedure. A hydraulic circuit that has been switched off is not the same as a hydraulic circuit that has been depressurised, and a fitting released under pressure moves faster than you can.',
    },
    {
      type: 'comparison_table',
      caption: 'Setup that decides how the next hour goes',
      columns: ['Step', 'Why'],
      rows: [
        {
          cells: [
            'Clean the joint before starting',
            'Grit under a wrench rounds a hex, and grit in an open port is the next failure',
          ],
          highlight: true,
        },
        {
          cells: [
            'Photograph the routing and orientation',
            'The replacement has to go back the same way, elbows and all',
          ],
        },
        {
          cells: [
            'Have caps and plugs ready',
            'An open port collects dust from the moment it is open',
          ],
        },
        {
          cells: [
            'Have a drain tray under it',
            'Both for the environment and so you can see whether you are making progress',
          ],
        },
        {
          cells: [
            'Identify the port adapter as well as the hose end',
            'You may be about to remove both, whether or not you intended to',
          ],
          highlight: true,
        },
      ],
    },

    { type: 'section_head', number: '/02', title: 'Cut the hose off.', anchor: 'cut-it-off' },
    {
      type: 'paragraph',
      html: 'This feels destructive and is the single biggest improvement to the odds. A whole assembly gives leverage in the wrong direction, springs back, and fills the space you need for a second wrench. <strong>Cut the hose a hand’s width from the fitting and work on the stub.</strong> You now have a short, rigid handle, clear access, and no oil arriving from the rest of the line.',
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'Two wrenches is not advice, it is the whole technique.',
      body: 'Put a spanner on the port adapter hex and hold it. Turn the union nut against it. Any force that is not resisted at the adapter is transmitted straight into the port threads — and on an aluminium or cast manifold, that is how the port is lost rather than the fitting.',
    },

    {
      type: 'section_head',
      number: '/03',
      title: 'Penetrant, patience, heat.',
      anchor: 'penetrant-and-heat',
    },
    {
      type: 'decision_tree',
      heading: 'Escalating in the right order',
      intro:
        'Each step is more likely to cause damage than the one before it, which is the order to try them in.',
      branches: [
        {
          condition: 'Penetrating oil and time',
          outcome: 'Apply, tap the hex sharply, wait, apply again.',
          detail:
            'The tapping matters more than the waiting. Vibration draws penetrant along the thread; standing still does very little.',
        },
        {
          condition: 'A better tool',
          outcome: 'Six-point socket or a flare nut wrench, not an adjustable spanner.',
          detail:
            'Most seized fittings are not actually seized. They are being turned by a tool that is deforming the hex instead of loading it.',
        },
        {
          condition: 'Shock rather than steady force',
          outcome:
            'Short sharp loads, alternating tighten and loosen if there is any movement at all.',
          detail:
            'A quarter flat of tightening often breaks a corrosion bond that will not yield to loosening force alone.',
        },
        {
          condition: 'Heat',
          outcome:
            'Localised heat on the female component only, never on a hose or a seal you are keeping.',
          detail:
            'Confirm the port is drained and no residual oil is present, keep a fire watch, and stay away from painted surfaces, wiring and anything elastomeric. Do not heat aluminium castings — the expansion works against you and the material yields.',
        },
        {
          condition: 'Still solid, and the hex is deforming',
          outcome:
            'Stop. Split the nut with a nut splitter, or remove the adapter and the fitting together.',
          detail:
            'Removing the adapter and dealing with the pair on a bench is almost always cheaper than continuing on the machine.',
        },
      ],
    },

    { type: 'section_head', number: '/04', title: 'Knowing when to stop.', anchor: 'when-to-stop' },
    {
      type: 'comparison_table',
      caption: 'Signals to change approach rather than push harder',
      columns: ['What you see', 'What it means', 'Do this instead'],
      rows: [
        {
          cells: [
            'Hex corners going bright and rounding',
            'The tool is deforming the nut',
            'Nut splitter, or grip flats with a pipe wrench as a last resort',
          ],
          highlight: true,
        },
        {
          cells: [
            'The adapter turning instead of the nut',
            'Your backup wrench slipped or was never fitted',
            'Reset, hold the adapter properly',
          ],
        },
        {
          cells: [
            'A creaking noise from the manifold',
            'The port is taking the load',
            'Stop immediately — this precedes a crack',
          ],
          highlight: true,
        },
        {
          cells: [
            'Movement, then nothing',
            'Thread damage binding it',
            'Work it back and forth with penetrant, do not force through',
          ],
        },
        {
          cells: [
            'Nothing after heat and shock',
            'It is going to come out as an assembly',
            'Remove adapter and fitting together',
          ],
        },
      ],
    },
    {
      type: 'direct_answer',
      question: 'How do I remove a seized hydraulic hose fitting?',
      answer:
        'Depressurise the circuit and lower any raised implement first. Clean the joint, then cut the hose off so you are working on a short stub. Hold the port adapter with a second wrench at all times. Escalate in order: penetrating oil with sharp taps, a six-point socket or flare nut wrench, shock loads alternating both directions, then localised heat on the female part only. If the hex begins to round or the manifold creaks, stop and split the nut or remove the adapter and fitting together.',
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'What you do next matters as much as getting it off.',
      body: 'An open port on a machine in a yard collects dust in seconds, and the contamination shows up later as a valve fault nobody connects back to a hose change. Cap the port the moment the fitting is out, and cap the new assembly until it is offered up.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-adapters',
      label: 'Hydraulic adapters',
      blurb: 'The port adapter often comes out with the fitting. Have the replacement.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-hoses',
      label: 'Hydraulic hose by grade',
      blurb: 'Assemblies built to your measurements, same day for stocked grades.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        {
          question: 'Is it safe to heat a hydraulic fitting?',
          answer:
            'Only with the circuit drained at that point, a fire watch present, and heat applied to the female component away from hose, seals, paint and wiring. Never heat a fitting with oil still in it, and avoid heating aluminium or cast housings.',
        },
        {
          question: 'Should I use an impact gun on a union nut?',
          answer:
            'No. Impact rounds the hex and drives shock into the port threads. Use hand tools with a backup wrench; if hand tools will not move it, the answer is a nut splitter, not more impact.',
        },
        {
          question: 'The adapter came out with the hose. Is that a problem?',
          answer:
            'Not usually — it is often the easier outcome. Separate them on the bench, inspect the port threads, and fit a new adapter with the correct sealing method for that port type.',
        },
        {
          question: 'Can I reuse a fitting that took a lot of force to remove?',
          answer:
            'Inspect the seat and threads carefully before deciding. Anything with a marked cone, a stretched thread or a deformed hex is scrap — it is a small part standing in front of a large repair.',
        },
        {
          question: 'What if the port thread is damaged when it finally comes out?',
          answer:
            'Stop and assess before fitting anything. A damaged pressure port is not a place for an improvised repair; what is recoverable depends on the port type and where the seal actually happens.',
        },
      ],
    },
    {
      type: 'as_of_stamp',
      verifiedOn: '2026-08-24',
      note: 'Field method as used by our own mobile service teams.',
    },
    {
      type: 'cta_block',
      heading: 'We can come to the machine.',
      body: 'On-site hose service across the UAE, including the jobs that turn into a seized adapter and a port that needs assessing. Tell us the machine and the location.',
      quoteLabel: 'Request on-site service',
    },
  ],
}

export default ARTICLE
