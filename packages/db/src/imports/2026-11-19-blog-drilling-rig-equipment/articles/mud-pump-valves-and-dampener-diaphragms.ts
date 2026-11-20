import type { BlogArticleSeed } from '../shared'

/**
 * Sources for the figures in this article (Oteco export folder, 2026-11-19):
 * - _faq/facts/oteco-fluid-end.json: IH-OTC-VALVES-SEATS (Oteco 1997 fluid-end sheet selection table,
 *   valve, seat, spring, insert and puller head part numbers) and IH-OTC-DAMPENER (K-10 and K-20 parts,
 *   diaphragm ratings, nitrogen-only pre-charge).
 * - _raw/brochure-review.md: Oteco fluid-end sheet (1997) and the Rig Hardware brochure dampener table
 *   (part weights, 1,500 / 3,000 / 5,000 / 7,500 psi diaphragm range, PD-55 diaphragm 230085).
 * Valves and seats come from a 1997 sheet, so the current part number is confirmed for the pump.
 */
const ARTICLE: BlogArticleSeed = {
  slug: 'mud-pump-valves-and-dampener-diaphragms',
  title: 'Mud pump valves, seats and pulsation dampener diaphragms',
  excerpt:
    'How an Oteco wing-guided valve and full-open seat are matched to a mud pump by API 6 or API 7 series and spring, and how to choose a K-10 or K-20 dampener diaphragm in nitrile or HNBR. Includes the nitrogen-only pre-charge rule and what to send for a quote.',
  categorySlug: 'drilling-rig-equipment',
  authorSlug: 'ayush-bhatia',
  seoTitle: 'Mud Pump Valves, Seats, Dampeners',
  seoDescription:
    'Choose mud pump valves and seats by API 6 or 7 series and spring, and pulsation dampener diaphragms for K-10 and K-20 units in NBR or HNBR.',
  focusKeyword: 'pulsation dampener diaphragm',
  publishedAt: '2026-11-19T17:00:00.000Z',
  bodyBlocks: [
    {
      type: 'key_takeaways',
      items: [
        'An Oteco valve set is three parts chosen together by pump model: a wing-guided valve, a full-open seat and the matching full-open spring. The valve must be used with its matching spring.',
        'The series, API 6 or API 7, follows the pump. A Continental Emsco D-125 is API 6; a Continental Emsco D-375 is API 7.',
        'The valve and seat table comes from Oteco’s 1997 fluid-end sheet, so we confirm the current part number for your pump before quoting.',
        'Oteco makes dampener diaphragms for 1,500, 3,000, 5,000 and 7,500 psi service. The listed part numbers are nitrile (NBR) to 5,000 psi for the K-10 and K-20, and hydrogenated nitrile (HNBR) to 7,500 psi for the K-20 only.',
        'Pre-charge a dampener with nitrogen only, to the pressure the pump maker specifies. Never use air or oxygen.',
      ],
    },
    {
      type: 'lead',
      html: 'Valves and the dampener are the two parts of a mud pump fluid end that decide how smoothly it delivers. The valves open and close on every stroke; the dampener smooths the pressure pulses leaving the pump. Both are wear items, and both are ordered by pump model. Pump and dampener makers named here are trademarks of their owners; Oteco parts are replacement parts made to fit that equipment, and Indus Hydraulics is not affiliated with those makers.',
    },

    { type: 'section_head', number: '/01', title: 'The Oteco wing-guided valve and full-open seat.', anchor: 'valve' },
    {
      type: 'paragraph',
      html: 'Oteco’s <a href="/p/oteco-mud-pump-valves-seats">premium wing-guided valve and full-open seat</a> are made in API 6 and API 7 series for most popular mud pumps. The valve is a uni-body with a snap-on polyurethane insert, so there are no snap rings, plates or keepers to fail, and the body is carburised for longer life and lower maintenance. Oteco says the seating angle and full-open seat improve flow through the seat and pass lost-circulation material better than conventional valves and seats, and that the full-open seat is easier to service in valve-over-valve fluid ends and carries a heavy bearing load.',
    },
    {
      type: 'paragraph',
      html: 'Oteco also makes premium stem-guided valves and seats, with an extra-wide metal-to-metal seal and a serrated upper face. Our listing does not carry stem-guided part numbers; tell us which guide style you are replacing and we confirm the current part number for your pump.',
    },

    { type: 'section_head', number: '/02', title: 'Reading the selection table.', anchor: 'table' },
    {
      type: 'paragraph',
      html: 'For each pump model the Oteco table gives a valve, a seat and a spring. Part numbers read <strong>O-U6VL-1</strong> or <strong>O-U7VL-1</strong> for the valve (6 or 7 series), <strong>O-6SL-1, O-6SL-2, O-7SL-1</strong> or <strong>O-7SL-2</strong> for the seat, and <strong>O-5710-15, -84, -90, -91</strong> or <strong>-93</strong> for the spring. Most pumps take O-5710-90; the Continental Emsco D, F and FA/FB models and the National K models take their own springs. Examples from the table:',
    },
    {
      type: 'comparison_table',
      caption: 'Selected rows from Oteco’s fluid-end selection table (1997 sheet)',
      columns: ['Pump', 'Valve', 'Seat', 'Spring'],
      rows: [
        { cells: ['Continental Emsco D-125', 'O-U6VL-1', 'O-6SL-1', 'O-5710-15'] },
        { cells: ['Continental Emsco D-375', 'O-U7VL-1', 'O-7SL-1', 'O-5710-84'] },
        { cells: ['Continental Emsco F-1000', 'O-U6VL-1', 'O-6SL-1', 'O-5710-91'] },
        { cells: ['Gardner Denver PZ-10', 'O-U7VL-1', 'O-7SL-1', 'O-5710-90'] },
        { cells: ['Ideco T-1300', 'O-U7VL-1', 'O-7SL-1', 'O-5710-90'] },
        { cells: ['National 8-P-80', 'O-U6VL-1', 'O-6SL-2', 'O-5710-90'] },
        { cells: ['National 12-P-160', 'O-U7VL-1', 'O-7SL-2', 'O-5710-90'] },
        { cells: ['National K-180', 'O-U7VL-1', 'O-7SL-1', 'O-5710-93'] },
        { cells: ['Skytop Brewster B-1000-T', 'O-U6VL-1', 'O-6SL-1', 'O-5710-90'] },
      ],
    },
    {
      type: 'callout',
      tone: 'note',
      title: 'A 1997 table.',
      body: 'The selection table is from Oteco’s fluid-end product sheet of 1997. Pump models and part numbers change, so we confirm the current part number for your pump before quoting.',
    },
    {
      type: 'paragraph',
      html: 'Spares are listed separately: the polyurethane insert (OU-23310 for API 6, OU-23315 for API 7) and seat puller heads (OP1700-6 for API 6 seats, OP1700-7 for API 7 seats). Replacing only the insert on a sound valve body is possible, since the insert snaps on. Fluid-end pistons are the other half of the job; see <a href="/blog/mud-pump-pistons-explained">mud pump pistons explained</a>.',
    },

    { type: 'section_head', number: '/03', title: 'What a pulsation dampener does.', anchor: 'dampener' },
    {
      type: 'paragraph',
      html: 'A dampener on the pump discharge holds a gas charge on one side of a flexible diaphragm. As the pump pulses, the diaphragm moves and the gas absorbs the peaks, so the pressure downstream is steadier. The diaphragm is the part that flexes on every stroke, which is why it is the part you replace. Oteco makes most replacement parts for Hydril and Mattco K-10 (10 gallon) and K-20 (20 gallon) dampeners; the <a href="/p/oteco-pulsation-dampener-diaphragms-parts">listing</a> also includes a diaphragm for the Continental Emsco PD-55.',
    },
    {
      type: 'paragraph',
      html: 'Oteco diaphragms are moulded in one piece down to the bottom flange, with a metal insert moulded into the bottom so the rubber cannot extrude into the bottom-flange connection.',
    },

    { type: 'section_head', number: '/04', title: 'Choosing NBR or HNBR and the pressure range.', anchor: 'choose' },
    {
      type: 'paragraph',
      html: 'Oteco makes diaphragms for 1,500, 3,000, 5,000 and 7,500 psi service. The listed part numbers are narrower: nitrile (NBR) diaphragms to 5,000 psi for both the K-10 and K-20, and a hydrogenated nitrile (HNBR) diaphragm to 7,500 psi for the K-20 only. There is no listed HNBR diaphragm for the K-10. The stabilizer, stabilizer plate, screw and lock washer are needed only for the 1,500 psi range.',
    },
    {
      type: 'comparison_table',
      caption: 'Oteco K-10 and K-20 dampener parts',
      columns: ['Part', 'K-10', 'K-20'],
      rows: [
        { cells: ['Diaphragm, NBR, 0 to 5,000 psi', 'IH-OTC-230110 (14 lb, 6.4 kg)', 'IH-OTC-230010 (22 lb, 10 kg)'] },
        { cells: ['Diaphragm, HNBR, 0 to 7,500 psi', 'Not listed', 'IH-OTC-230012 (22 lb, 10 kg)'] },
        { cells: ['Diaphragm stabilizer (1,500 psi range)', 'IH-OTC-230120', 'IH-OTC-230020'] },
        { cells: ['Stabilizer plate', 'IH-OTC-230030', 'IH-OTC-230030'] },
        { cells: ['Pressure gauge, 316 stainless, 0 to 6,000 psi', 'IH-OTC-230060', 'IH-OTC-230060'] },
        { cells: ['Charging valve with bull plug, brass', 'IH-OTC-230070', 'IH-OTC-230070'] },
        { cells: ['Bottom plate gasket', 'IH-OTC-230080', 'IH-OTC-230080'] },
        { cells: ['Bottom plate, 4-1/16 in 5,000 psi R-39', 'Not listed', 'IH-OTC-123754 (79 lb, 35.8 kg)'] },
      ],
    },
    {
      type: 'paragraph',
      html: 'Pick a rating at or above your pump discharge pressure. Note that the stainless gauge reads to 6,000 psi, so on a 7,500 psi duty it will not show the full range. Send the dampener model from the plate and the working pressure, and we confirm the diaphragm.',
    },

    { type: 'section_head', number: '/05', title: 'Pre-charge with nitrogen only.', anchor: 'precharge' },
    {
      type: 'paragraph',
      html: 'Pre-charge the dampener with nitrogen only, to the pressure the pump maker specifies for the operating pressure. Never use air or oxygen. Oxygen with oil and rubber under pressure is a fire and explosion hazard, and air contains it. Check the pre-charge on the gauge before the pump starts and inspect the diaphragm whenever the bottom plate comes off. Oteco gives no replacement interval for diaphragms; follow the pump maker’s manual and your own records.',
    },
    {
      type: 'faq_block',
      heading: 'Common questions',
      items: [
        { question: 'Which spring goes with which valve?', answer: 'The spring depends on the pump model, not only the series. In the Oteco table O-5710-15 is for Continental Emsco D-125 and D-225, O-5710-84 for D-375, O-5710-91 for the Emsco F series, O-5710-93 for National K-180, K-280 and K-380, and O-5710-90 for most others.' },
        { question: 'Can I order a valve without the seat?', answer: 'Yes, the valve, seat, spring, insert and puller heads are each listed. Oteco notes that each valve must be used with its matching full-open spring, so check the spring when you change the valve.' },
        { question: 'Is there a K-10 diaphragm for 7,500 psi?', answer: 'Not among the part numbers we list. The HNBR diaphragm to 7,500 psi is listed for the K-20 only. Oteco makes diaphragms across 1,500 to 7,500 psi, so send the model and pressure and we check.' },
        { question: 'Why nitrogen and not air?', answer: 'Air contains oxygen, which is dangerous with oil and rubber under pressure. Oteco states nitrogen only, to the pump maker’s specified pre-charge.' },
      ],
    },
    {
      type: 'product_embed',
      heading: 'Valves, seats and dampener parts',
      skus: ['IH-OTC-VALVES-SEATS', 'IH-OTC-DAMPENER', 'IH-OTC-PST-DA', 'IH-OTC-PST-SA'],
    },
    { type: 'category_link', slug: 'mud-pump-fluid-end-parts', label: 'Mud pump fluid-end parts', blurb: 'Pistons, valves, seats, springs and dampener diaphragms.' },
    {
      type: 'related_articles',
      slugs: ['mud-pump-pistons-explained', 'swivel-washpipe-and-packing', 'oteco-drilling-equipment-guide', 'cementing-and-drilling-fluid-equipment'],
    },
    {
      type: 'cta_block',
      heading: 'Valves, seats or a dampener diaphragm?',
      body: 'Send the pump make and model, or the dampener model and working pressure. We confirm the current part numbers and quote from Oteco stock at our warehouse in Dubai, UAE, shipping worldwide.',
      quoteLabel: 'Request a quote',
    },
  ],
}

export default ARTICLE
