import type { BlogArticleSeed } from '../shared'

/**
 * Safety content. Describes the hazard and the urgency; deliberately does NOT
 * prescribe treatment. The single message that matters is "get to a hospital
 * now and use the words high-pressure injection injury" — anything beyond
 * that is a clinician's call, not a hose distributor's.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'hydraulic-fluid-injection-injury',
  title: 'Hydraulic fluid injection injury: why a pinhole is a surgical emergency',
  excerpt:
    'A high-pressure leak can inject fluid through skin from a hole you cannot see. The entry wound looks trivial and the damage underneath is not. What it is, why it is missed, and what to do in the first hour.',
  categorySlug: 'safety',
  authorSlug: 'anjali-krishnan',
  seoTitle: 'Hydraulic fluid injection injury — first hour, and why it is missed',
  seoDescription:
    'High-pressure hydraulic injection injuries look like a pinprick and destroy tissue underneath. Why they are under-triaged, what to tell the hospital, and how to avoid one.',
  focusKeyword: 'hydraulic fluid injection injury',
  publishedAt: '2026-08-17T07:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'A pinhole leak in a hydraulic line can inject fluid straight through intact skin. You do not have to touch a jet for long, and you may not see the hole at all.',
        'The entry wound looks trivial — often a small mark on a fingertip — which is exactly why these injuries get sent home from triage as punctures.',
        'This is treated as a surgical emergency. Delay is the factor most strongly associated with losing the limb or digit.',
        'Say the words "high-pressure injection injury" at the hospital, and take the fluid safety data sheet with you.',
        'Never search for a hydraulic leak with your hand. A piece of cardboard costs nothing.',
      ],
    },
    {
      type: 'lead',
      html: 'Someone runs a finger along a hose to find a weep. There is a mark on the fingertip, a bit of stinging, and no obvious wound. They finish the shift. That is the injury this article is about, and the reason it is dangerous is that at the moment it happens it does not feel like much.',
    },

    { type: 'section_head', number: '/01', title: 'What is actually happening.', anchor: 'what-happens' },
    {
      type: 'paragraph',
      html: 'A failing hose or fitting can release fluid through an opening far too small to see, at a pressure high enough to break the skin without any cut. The fluid does not stop at the surface. It follows the path of least resistance along tendon sheaths and tissue planes, spreading well beyond the entry point — which is why the visible mark tells you almost nothing about how far the damage extends.',
    },
    {
      type: 'paragraph',
      html: 'The harm is mechanical and chemical at once. The injected volume raises pressure inside a compartment that cannot expand, restricting blood supply, while the fluid itself is an irritant that provokes an inflammatory response in tissue never meant to encounter it. Both worsen with time, which is the whole reason the clock matters.',
    },
    {
      type: 'callout',
      tone: 'danger',
      title: 'It does not look serious, and that is the danger.',
      body: 'Injection injuries are routinely under-triaged because the presentation is so mild — a small mark, little bleeding, and a patient who can still use the hand. The mismatch between how it looks in the first hour and what is happening under the skin is the defining feature of this injury.',
    },

    { type: 'section_head', number: '/02', title: 'What to do.', anchor: 'what-to-do' },
    {
      type: 'direct_answer',
      question: 'What should you do after a suspected hydraulic injection injury?',
      answer:
        'Treat it as an emergency and get to hospital immediately, even if the person feels fine and the wound looks like a pinprick. Tell staff explicitly that it is a high-pressure injection injury, and bring the safety data sheet for the fluid. Do not wait to see whether it worsens.',
    },
    {
      type: 'sop_block',
      header: 'SUSPECTED INJECTION INJURY · FIRST RESPONSE',
      completion: '5 steps',
      phases: [
        {
          name: 'Immediately',
          rows: [
            { task: 'Stop and isolate', detail: 'Shut down and depressurise the system so nobody else is exposed while attention is on the casualty.', who: 'Supervisor', tool: 'LOTO' },
            { task: 'Treat as an emergency', detail: 'Arrange transport to hospital now. Do not let the person finish the shift or wait to see how it develops.', who: 'Supervisor', tool: '—' },
            { task: 'Name the injury', detail: 'Tell clinical staff it is a suspected HIGH-PRESSURE INJECTION INJURY. The words matter — they change how it is triaged.', who: 'Escort', tool: '—' },
            { task: 'Take the SDS', detail: 'The safety data sheet for the fluid tells the treating team what was injected. Print it or photograph it before leaving site.', who: 'Supervisor', tool: 'SDS' },
            { task: 'Record the circumstances', detail: 'System pressure, fluid, time of injury and the component that failed. Useful clinically, and required for the incident investigation.', who: 'HSE', tool: 'Incident form' },
          ],
        },
      ],
    },
    {
      type: 'paragraph',
      html: 'What this article deliberately does not do is describe treatment. That is a clinician’s decision, made with the fluid, the site and the elapsed time in front of them. The job on site is to recognise it, name it and move fast.',
    },

    { type: 'section_head', number: '/03', title: 'Not getting one.', anchor: 'prevention' },
    {
      type: 'decision_tree',
      heading: 'Finding a leak without becoming the incident',
      intro: 'Every one of these is standard practice and every one of them gets skipped when a machine is down and someone is in a hurry.',
      branches: [
        { condition: 'You need to locate a weep on a pressurised line', outcome: 'Depressurise first. If you genuinely cannot, use a piece of cardboard or timber held at arm’s length — never a hand, gloved or not.', detail: 'A glove offers no protection whatsoever against injection pressure. It only hides the entry wound.' },
        { condition: 'A hose shows cover damage with wire visible', outcome: 'Take the machine out of service and replace the assembly.', detail: 'Exposed reinforcement is a hose already failing. It will not improve.', sku: 'IH-HOSE-2SC' },
        { condition: 'A hose is rubbing against structure or another hose', outcome: 'Re-route or clamp it now.', detail: 'Abrasion is the most common route to a pinhole leak, and it is the easiest failure mode to design out.' },
        { condition: 'An assembly is weeping at the fitting', outcome: 'Replace the assembly rather than re-torquing it.', detail: 'A weep at a crimped fitting usually means the crimp or the seat is compromised; more torque does not fix either.', sku: 'IH-CF-NS-R2T2SN' },
      ],
    },
    {
      type: 'callout',
      tone: 'warning',
      title: 'Gloves are not protection.',
      body: 'This is worth stating plainly because it is a common assumption on site. Personal protective equipment does not stop an injection injury at hydraulic working pressures. Distance and depressurisation do.',
    },

    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'It barely bled and there is no pain. Is it still serious?', answer: 'Yes, and that presentation is typical rather than reassuring. Minimal bleeding and little early pain are characteristic of injection injuries, because the wound is small and the damage is beneath it. Go to hospital.' },
        { question: 'Does the type of fluid matter?', answer: 'It affects the clinical picture, which is exactly why the safety data sheet should go with the casualty. It does not change what you do on site — the response is the same for any hydraulic fluid.' },
        { question: 'Can this happen through a glove?', answer: 'Yes. Gloves do not stop injection at hydraulic pressures, and they can make things worse by concealing the entry wound so the injury is noticed later.' },
        { question: 'What if we are not sure it was an injection?', answer: 'Treat it as one. The cost of an unnecessary hospital visit is a few hours; the cost of a missed injection injury is measured in surgery.' },
      ],
    },

    { type: 'category_link', slug: 'hoses-fittings', label: 'Replacement hose and fittings', blurb: 'If a line has failed, the assembly should be replaced rather than patched. Full range in stock in Dubai.' },
    { type: 'as_of_stamp', verifiedOn: '2026-08-17', note: 'Hazard description and first-response guidance only. Clinical management is deliberately out of scope.' },
    {
      type: 'cta_block',
      heading: 'Replacing a failed line?',
      body: 'Send the part number or a photograph of the failed assembly. We will identify it and come back with what we hold and how quickly you can have it.',
      quoteLabel: 'Get a replacement quoted',
    },
  ],
}

export default ARTICLE
