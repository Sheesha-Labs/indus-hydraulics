import type { BlogBlocksInput } from '@indus/domain'

/**
 * The pneumatics hub.
 *
 * Created 2026-10-22, the day the Pneumatics root went live with 12 shelves and 864 maker ranges — cylinders,
 * solenoid and manual valves, flow controls, safety and lockout valves, FRL air preparation, tubing, push-to-connect
 * fittings, silencers, grippers, vacuum and air motors — and not one article pointing at any of them. Pneumatics is
 * bought by automation integrators and plant maintenance rather than hydraulic hose shops, so it gets its own hub.
 */
export const PNEUMATICS_CATEGORY = {
  slug: 'pneumatics',
  name: 'Pneumatics & compressed air',
  description:
    'Pneumatic cylinders, solenoid and manual air valves, flow controls, air safety and lockout valves, FRL air preparation, air tubing and push-to-connect fittings, grippers, vacuum and air motors — how to choose, size and specify them.',
  heroCopy:
    'A pneumatic circuit is cheap to build and easy to get almost right: a cylinder a bore too small, a valve that starves it, wet air, a tube that softens in the sun. These guides cover the choices that decide whether a machine runs at its rated speed for years or stalls on its first hot afternoon.',
  seoTitle: 'Pneumatic cylinders, air valves & FRLs — buyer guides',
  seoDescription:
    'Guides to pneumatic cylinders, solenoid valves, flow controls, air safety valves, FRL air preparation, air tubing and fittings, grippers, vacuum and air motors: how to choose, size and specify them.',
  focusKeyword: 'pneumatic cylinders and air valves',
  position: 22,
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What does a pneumatic system need?',
      answer:
        'Clean, dry, regulated compressed air from an FRL; a directional valve — solenoid, pilot or manual — to send it; tubing and fittings sized for the flow; flow controls to set speed; and an actuator to do the work: a cylinder, gripper, vacuum cup or air motor. Safety and lockout valves let the circuit be relieved and isolated.',
    },
    {
      type: 'comparison_table',
      caption: 'What each part of a pneumatic circuit has to get right',
      columns: ['Part', 'The decision', 'What goes wrong'],
      rows: [
        { cells: ['Air preparation (FRL)', 'Filter grade, regulator range, lubricated or not', 'Water and rust in valves, pressure sag under load'] },
        { cells: ['Directional valve', '3/2, 5/2 or 5/3, flow (Cv), voltage, manifold', 'Valve too small for the cylinder, wrong centre position'], highlight: true },
        { cells: ['Cylinder', 'Bore for force, stroke, mount, cushioning', 'Undersized bore, side load on the rod'] },
        { cells: ['Tubing and fittings', 'Material, OD, temperature and pressure rating', 'Tube too small for the flow, softening in heat'] },
        { cells: ['Flow and safety', 'Meter-out speed control, quick exhaust, soft start, lockout', 'Cylinders that lunge, trapped energy at maintenance'] },
      ],
    },
    { type: 'category_link', slug: 'pneumatic-cylinders', label: 'Pneumatic cylinders', blurb: 'Tie-rod, round-body, compact and guided air cylinders by bore and stroke.' },
    { type: 'category_link', slug: 'pneumatic-solenoid-valves', label: 'Solenoid valves & manifolds', blurb: '3/2, 5/2 and 5/3 solenoid and pilot valves and the manifolds they mount on.' },
    { type: 'category_link', slug: 'air-preparation-frl', label: 'Filters, regulators & lubricators', blurb: 'FRL units, coalescing filters, regulators, lubricators, elements and drains.' },
    { type: 'category_link', slug: 'pneumatics', label: 'All pneumatics', blurb: 'Every pneumatics shelf: valves, flow controls, tubing, fittings, grippers, vacuum and air motors.' },
    {
      type: 'cta_block',
      heading: 'Building or repairing a pneumatic circuit?',
      body: 'Send the maker part numbers, or the bore, stroke, port size, voltage and supply pressure. We will quote the cylinders, valves and air preparation by maker part number, delivered across the Gulf.',
      quoteLabel: 'Ask for a quotation',
    },
  ] satisfies BlogBlocksInput,
}
