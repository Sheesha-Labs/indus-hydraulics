import type { BlogBlocksInput } from '@indus/domain'

/**
 * The cylinders, pumps and motors hub.
 *
 * Created 2026-10-21 because roughly three hundred cylinders, pumps and motors were live on the catalogue
 * with no article pointing at any of them, and filing fifteen component articles under
 * `specification-standards` or `maintenance-reliability` would have buried them in two hose clusters. The
 * hub is the node that ties the component articles together and links down into the three catalogue roots.
 */
export const CYLINDERS_PUMPS_MOTORS_CATEGORY = {
  slug: 'cylinders-pumps-motors',
  name: 'Cylinders, pumps & motors',
  description:
    'How hydraulic cylinders, pumps and motors are built, sized, mounted and diagnosed — welded and tie-rod cylinders, telescopic hoists, 10,000 psi jacking systems, gear, vane and piston pumps, and orbital, gear and piston motors.',
  heroCopy:
    'The hoses and fittings carry the power; these three make it and use it. A pump turns shaft power into flow, a cylinder turns flow into straight-line force, a motor turns it back into torque — and almost every buying mistake with them comes from reading one number off a nameplate and ignoring the two beside it.',
  seoTitle: 'Hydraulic cylinders, pumps & motors — guides and sizing',
  seoDescription:
    'Guides to hydraulic cylinders, pumps and motors: types, sizing formulas, mounting styles, interchange codes and failure diagnosis, with the parts stocked in Dubai.',
  focusKeyword: 'hydraulic cylinders pumps and motors',
  position: 18,
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What do a hydraulic pump, cylinder and motor each do?',
      answer:
        'A pump converts the rotation of an engine or electric motor into a flow of oil. It does not make pressure on its own: pressure appears only when something resists the flow. A cylinder converts that flow and pressure into a straight push or pull, with force set by pressure times piston area and speed set by flow divided by area. A motor converts it back into rotation, with torque set by pressure times displacement and speed set by flow divided by displacement.',
    },
    {
      type: 'comparison_table',
      caption: 'The three components, and the two numbers that size each one',
      columns: ['Component', 'Converts', 'Force or torque comes from', 'Speed comes from'],
      rows: [
        { cells: ['Pump', 'Shaft rotation into flow', 'Input torque rises with displacement × pressure', 'Flow = displacement × shaft speed'] },
        { cells: ['Cylinder', 'Flow into straight-line force', 'Pressure × piston (or annulus) area', 'Flow ÷ area'], highlight: true },
        { cells: ['Motor', 'Flow back into rotation', 'Pressure × displacement', 'Flow ÷ displacement'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'The articles below are written to be used at the machine: how to read what is fitted, how to size what should replace it, and how to tell a worn component from a fault somewhere else in the circuit. Each one links to the shelves it describes, so a measurement taken from the guide can go straight into a quotation.',
    },
    {
      type: 'category_link',
      slug: 'cylinders',
      label: 'Hydraulic cylinders',
      blurb: 'Welded, tie-rod, telescopic, loader and 10,000 psi cylinders.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-pumps',
      label: 'Hydraulic pumps',
      blurb: 'Gear, vane, piston, two-stage, dump and PTO pumps, and 10,000 psi pumps.',
    },
    {
      type: 'category_link',
      slug: 'hydraulic-motors',
      label: 'Hydraulic motors',
      blurb: 'Orbital motors in every common mount, and gear motors.',
    },
    {
      type: 'cta_block',
      heading: 'Replacing a cylinder, pump or motor?',
      body: 'Send the nameplate, or the bore, rod, stroke and mount of a cylinder, or the displacement, shaft and flange of a pump or motor. We will match it, quote the connections with it, and ship it as one consignment.',
      quoteLabel: 'Ask for a quotation',
    },
  ] satisfies BlogBlocksInput,
}
