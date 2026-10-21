import type { BlogBlocksInput } from '@indus/domain'

/**
 * The instrumentation and gauges hub.
 *
 * Created 2026-10-21, straight after the cylinders, pumps and motors hub, because the Instrumentation &
 * Controls root had 140 products and not one article pointing at them: double and single ferrule tube
 * fittings, stainless instrument tubing, pressure gauges and the oilfield sensors, flowmeters and DAQ that go
 * on a treating line. Compression fittings and gauges are bought by instrument technicians and project buyers
 * rather than hose shops, so they get a hub of their own rather than being filed under hose fittings.
 */
export const INSTRUMENTATION_GAUGES_CATEGORY = {
  slug: 'instrumentation-gauges',
  name: 'Instrumentation & gauges',
  description:
    'Instrumentation tube fittings, stainless tubing and pressure gauges — how compression fittings seal, single against double ferrule, making up a fitting, choosing tube wall and grade, gauge accuracy, range and fill, and the oilfield sensors and flowmeters on a treating line.',
  heroCopy:
    'An instrument line is the smallest pipework on the plant and the one most often built wrong: a ferrule from one maker in a nut from another, a tube a shade too hard, a gauge whose pointer lives at the top of its dial. These guides cover the details that decide whether a line holds for twenty years or weeps by the end of commissioning.',
  seoTitle: 'Instrumentation tube fittings & pressure gauges — guides',
  seoDescription:
    'Guides to instrumentation tube fittings, stainless instrument tubing and pressure gauges: compression fitting make-up, single vs double ferrule, tube selection, gauge accuracy and range, and oilfield instruments.',
  focusKeyword: 'instrumentation tube fittings and pressure gauges',
  position: 19,
  bodyBlocks: [
    {
      type: 'direct_answer',
      question: 'What is an instrumentation tube fitting?',
      answer:
        'A compression fitting that joins small-bore metal tube — typically 1/16" to 1" or 2 mm to 38 mm — to a valve, gauge, transmitter or another tube. A nut drives one or two ferrules onto the outside of the tube so they seal against both the tube and the fitting body and grip the tube, with no welding, threading or flaring of the tube itself.',
    },
    {
      type: 'comparison_table',
      caption: 'What each part of an instrument line has to get right',
      columns: ['Part', 'The decision', 'What goes wrong'],
      rows: [
        { cells: ['Tube fitting', 'Single or double ferrule, one maker throughout', 'Intermixed parts, under- or over-tightening'] },
        { cells: ['Tubing', 'Grade, OD, wall, hardness', 'Tube too hard or too thin for the fitting and pressure'], highlight: true },
        { cells: ['End connection', 'NPT, BSP, SAE straight thread, weld', 'Wrong thread family, taper into parallel'] },
        { cells: ['Gauge', 'Range, accuracy class, fill, connection', 'Pointer at full scale, flutter, wrong wetted material'] },
      ],
    },
    {
      type: 'category_link',
      slug: 'instrumentation-tube-fittings',
      label: 'Instrumentation tube fittings',
      blurb: 'Double and single ferrule 316 fittings and stainless instrument tubing.',
    },
    {
      type: 'category_link',
      slug: 'ic-pressure-gauges',
      label: 'Pressure gauges',
      blurb: 'Dry, glycerine-filled and all-stainless gauges, and 10,000–50,000 psi hydraulic gauges.',
    },
    {
      type: 'category_link',
      slug: 'instrumentation-controls',
      label: 'Instrumentation & controls',
      blurb: 'Pressure sensors, flowmeters, DAQ and thermowells for treating lines.',
    },
    {
      type: 'cta_block',
      heading: 'Building an instrument line?',
      body: 'Send the tube OD and wall, the end connections and the pressure and temperature. We will quote the fittings, tube and gauges from one maker, with material certificates if the project needs them.',
      quoteLabel: 'Ask for a quotation',
    },
  ] satisfies BlogBlocksInput,
}
