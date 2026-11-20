/**
 * Adapter title fixes, 2026-11-20.
 *
 * 64 adapter listings from one import carried the importer's shorthand as
 * their title AND their SEO title — "Male Connector m JIC X m BSPT" — so the
 * H1 and the <title> both read like a data row. Buyers search "male JIC to
 * male BSPT adapter"; "m JIC" matches nothing.
 *
 * Each new title is built from the listing's own port specs, not from the old
 * title alone: "SAE" is SAE J1926 ORB, "Metric" is the DIN 24° cone, "BSP" is
 * BSPP with a bonded seal, "Komatsu" is the 30° flare, "L-series flange" is
 * SAE J518 Code 61. Approved by the founder as a before/after table.
 *
 * Held back: male-connector-m-komatsu, whose specs list one metric port and
 * no sizes, contradicting its title. Spec errors found and NOT fixed here:
 * two "45° Swivel" listings have Body Configuration "straight"; Komatsu ports
 * read sealing "24-cone"; NPSM ports read sealing "flat-face".
 */
export type TitleFix = { slug: string; from: string; to: string }

export const ADAPTER_TITLE_FIXES: TitleFix[] = [
  { slug: "45-elbow-flange-connector-m-jic-x-l-series-flange", from: "45° Elbow Flange Connector m JIC X L-series flange", to: "Male JIC 37° × SAE Code 61 Flange 45° Elbow Adapter" },
  { slug: "45-elbow-m-jic-x-m-bspt", from: "45° Elbow m JIC X m BSPT", to: "Male JIC 37° × Male BSPT 45° Elbow Adapter" },
  { slug: "45-swivel-connector-m-jic-x-f-jic", from: "45° Swivel Connector m JIC X f JIC", to: "Male JIC 37° × Female JIC 37° Swivel 45° Elbow Adapter" },
  { slug: "45-swivel-connector-m-orfs-x-f-orfs", from: "45° Swivel Connector m ORFS X f ORFS", to: "Male ORFS × Female ORFS Swivel 45° Elbow Adapter" },
  { slug: "90-elbow-connector-m-jic", from: "90° Elbow Connector m JIC", to: "Male JIC 37° × Male JIC 37° 90° Elbow Adapter" },
  { slug: "90-elbow-connector-m-jic-x-m-npt", from: "90° Elbow Connector m JIC X m NPT", to: "Male JIC 37° × Male NPT 90° Elbow Adapter" },
  { slug: "90-elbow-connector-m-orfs-x-m-orfs", from: "90° Elbow Connector m ORFS X m ORFS", to: "Male ORFS × Male ORFS 90° Elbow Adapter" },
  { slug: "90-elbow-female-f-npt-x-f-swivel-npsm", from: "90° Elbow Female f NPT X f Swivel NPSM", to: "Female NPT × Female NPSM Swivel 90° Elbow Adapter" },
  { slug: "90-elbow-flange-connector-m-jic-x-l-series-flange", from: "90° Elbow Flange Connector m JIC X L-series flange", to: "Male JIC 37° × SAE Code 61 Flange 90° Elbow Adapter" },
  { slug: "90-elbow-m-jic-x-m-bspt", from: "90° Elbow m JIC X m BSPT", to: "Male JIC 37° × Male BSPT 90° Elbow Adapter" },
  { slug: "90-male-female-connector-m-jic-x-f-jic", from: "90° Male Female Connector m JIC X f JIC", to: "Male JIC 37° × Female JIC 37° 90° Elbow Adapter" },
  { slug: "90-male-female-connector-m-npt-x-f-npt", from: "90° Male Female Connector m NPT X f NPT", to: "Male NPT × Female NPT 90° Elbow Adapter" },
  { slug: "90-swivel-connector-m-npt-x-f-npsm", from: "90° Swivel Connector m NPT X f NPSM", to: "Male NPT × Female NPSM Swivel 90° Elbow Adapter" },
  { slug: "90-swivel-connector-m-orfs-x-f-orfs", from: "90° Swivel Connector m ORFS X f ORFS", to: "Male ORFS × Female ORFS Swivel 90° Elbow Adapter" },
  { slug: "adjustable-45-elbow-m-jic-x-m-metric-flat", from: "Adjustable 45° Elbow m JIC X m Metric Flat", to: "Male JIC 37° × Male Metric Flat-Face Adjustable 45° Elbow Adapter" },
  { slug: "adjustable-45-elbow-m-jic-x-m-sae", from: "Adjustable 45° Elbow m JIC X m SAE", to: "Male JIC 37° × Male SAE ORB Adjustable 45° Elbow Adapter" },
  { slug: "adjustable-45-elbow-m-orfs-x-m-bsp", from: "Adjustable 45° Elbow m ORFS X m BSP", to: "Male ORFS × Male BSPP Adjustable 45° Elbow Adapter" },
  { slug: "adjustable-45-elbow-m-orfs-x-m-sae", from: "Adjustable 45° Elbow m ORFS X m SAE", to: "Male ORFS × Male SAE ORB Adjustable 45° Elbow Adapter" },
  { slug: "adjustable-90-elbow-m-jic-x-m-bsp", from: "Adjustable 90° Elbow m JIC X m BSP", to: "Male JIC 37° × Male BSPP Adjustable 90° Elbow Adapter" },
  { slug: "adjustable-90-elbow-m-jic-x-m-metric-flat", from: "Adjustable 90° Elbow m JIC X m Metric Flat", to: "Male JIC 37° × Male Metric Flat-Face Adjustable 90° Elbow Adapter" },
  { slug: "adjustable-90-elbow-m-jic-x-m-sae", from: "Adjustable 90° Elbow m JIC X m SAE", to: "Male JIC 37° × Male SAE ORB Adjustable 90° Elbow Adapter" },
  { slug: "adjustable-90-elbow-m-orfs-x-m-bsp", from: "Adjustable 90° Elbow m ORFS X m BSP", to: "Male ORFS × Male BSPP Adjustable 90° Elbow Adapter" },
  { slug: "adjustable-90-elbow-m-orfs-x-m-metric-flat", from: "Adjustable 90° Elbow m ORFS X m Metric Flat", to: "Male ORFS × Male Metric Flat-Face Adjustable 90° Elbow Adapter" },
  { slug: "adjustable-90-elbow-m-orfs-x-m-sae", from: "Adjustable 90° Elbow m ORFS X m SAE", to: "Male ORFS × Male SAE ORB Adjustable 90° Elbow Adapter" },
  { slug: "adjustable-branch-tee-m-jic-x-m-npt-x-m-jic", from: "Adjustable Branch Tee m JIC X m NPT X m JIC", to: "Adjustable Branch Tee, Male JIC 37° × NPT × JIC 37°" },
  { slug: "adjustable-branch-tee-m-jic-x-m-sae-x-m-jic", from: "Adjustable Branch Tee m JIC X m SAE X m JIC", to: "Adjustable Branch Tee, Male JIC 37° × SAE ORB × JIC 37°" },
  { slug: "adjustable-branch-tee-m-metric-x-m-sae-x-m-metric", from: "Adjustable Branch Tee m Metric X m SAE X m Metric", to: "Adjustable Branch Tee, Male Metric 24° × SAE ORB × Metric 24°" },
  { slug: "adjustable-branch-tee-m-orfs-x-m-bsp-x-m-orfs", from: "Adjustable Branch Tee m ORFS X m BSP X m ORFS", to: "Adjustable Branch Tee, Male ORFS × BSPP × ORFS" },
  { slug: "adjustable-branch-tee-m-orfs-x-m-metric-x-m-orfs", from: "Adjustable Branch Tee m ORFS X m Metric X m ORFS", to: "Adjustable Branch Tee, Male ORFS × Metric 24° × ORFS" },
  { slug: "adjustable-branch-tee-m-orfs-x-m-sae-x-m-orfs", from: "Adjustable Branch Tee m ORFS X m SAE X m ORFS", to: "Adjustable Branch Tee, Male ORFS × SAE ORB × ORFS" },
  { slug: "adjustable-run-tee-m-jic-x-m-jic-x-m-bsp", from: "Adjustable Run Tee m JIC X m JIC X m BSP", to: "Adjustable Run Tee, Male JIC 37° × JIC 37° × BSPP" },
  { slug: "adjustable-run-tee-m-jic-x-m-jic-x-m-metric", from: "Adjustable Run Tee m JIC X m JIC X m Metric", to: "Adjustable Run Tee, Male JIC 37° × JIC 37° × Metric 24°" },
  { slug: "adjustable-run-tee-m-metric-x-m-metric", from: "Adjustable Run Tee m Metric X m Metric", to: "Adjustable Run Tee, Male Metric 24° (all ends)" },
  { slug: "adjustable-run-tee-m-orfs-x-m-orfs-x-m-metric", from: "Adjustable Run Tee m ORFS X m ORFS X m Metric", to: "Adjustable Run Tee, Male ORFS × ORFS × Metric 24°" },
  { slug: "adjustable-run-tee-m-orfs-x-m-orfs-x-m-sae", from: "Adjustable Run Tee m ORFS X m ORFS X m SAE", to: "Adjustable Run Tee, Male ORFS × ORFS × SAE ORB" },
  { slug: "branch-tee-connector-f-npt-x-m-npt-x-f-npt", from: "Branch Tee Connector f NPT X m NPT X f NPT", to: "Branch Tee, Female NPT × Male NPT × Female NPT" },
  { slug: "female-connector-f-npt-x-f-swivel-npsm", from: "Female Connector f NPT X f Swivel NPSM", to: "Female NPT × Female NPSM Swivel Adapter" },
  { slug: "male-connector-m-jic-x-m-bspt", from: "Male Connector m JIC X m BSPT", to: "Male JIC 37° × Male BSPT Adapter" },
  { slug: "male-connector-m-jic-x-m-metric", from: "Male Connector m JIC X m Metric", to: "Male JIC 37° × Male Metric 24° Adapter" },
  { slug: "male-connector-m-jic-x-m-metric-flat-with-seal", from: "Male Connector m JIC X m Metric Flat with Seal", to: "Male JIC 37° × Male Metric Flat-Face Adapter" },
  { slug: "male-connector-m-jic-x-m-npt", from: "Male Connector m JIC X m NPT", to: "Male JIC 37° × Male NPT Adapter" },
  { slug: "male-connector-m-jic-x-m-sae", from: "Male Connector m JIC X m SAE", to: "Male JIC 37° × Male SAE ORB Adapter" },
  { slug: "male-connector-m-metric-flat-x-m-komatsu", from: "Male Connector m Metric Flat X m Komatsu", to: "Male Metric Flat-Face × Male Komatsu 30° Adapter" },
  { slug: "male-connector-m-metric-x-m-komatsu", from: "Male Connector m Metric X m Komatsu", to: "Male Metric 24° × Male Komatsu 30° Adapter" },
  { slug: "male-connector-m-metric-x-m-metric", from: "Male Connector m Metric X m Metric", to: "Male Metric 24° × Male Metric 24° Adapter" },
  { slug: "male-connector-m-metric-x-m-sae", from: "Male Connector m Metric X m SAE", to: "Male Metric 24° × Male SAE ORB Adapter" },
  { slug: "male-connector-m-npt-x-m-komatsu", from: "Male Connector m NPT X m Komatsu", to: "Male NPT × Male Komatsu 30° Adapter" },
  { slug: "male-connector-m-npt-x-m-npt", from: "Male Connector m NPT X m NPT", to: "Male NPT × Male NPT Adapter" },
  { slug: "male-connector-m-orfs-x-m-bsp", from: "Male Connector m ORFS X m BSP", to: "Male ORFS × Male BSPP Adapter" },
  { slug: "male-connector-m-orfs-x-m-metric-flat", from: "Male Connector m ORFS X m Metric Flat", to: "Male ORFS × Male Metric Flat-Face Adapter" },
  { slug: "male-connector-m-orfs-x-m-npt", from: "Male Connector m ORFS X m NPT", to: "Male ORFS × Male NPT Adapter" },
  { slug: "male-connector-m-orfs-x-m-orfs", from: "Male Connector m ORFS X m ORFS", to: "Male ORFS × Male ORFS Adapter" },
  { slug: "male-connector-m-orfs-x-m-sae", from: "Male Connector m ORFS X m SAE", to: "Male ORFS × Male SAE ORB Adapter" },
  { slug: "male-connector-m-sae-x-m-komatsu", from: "Male Connector m SAE X m Komatsu", to: "Male SAE ORB × Male Komatsu 30° Adapter" },
  { slug: "male-female-connector-m-jic-x-f-jic", from: "Male Female Connector m JIC X f JIC", to: "Male JIC 37° × Female JIC 37° Adapter" },
  { slug: "male-female-connector-m-npt-x-f-npt", from: "Male Female Connector m NPT X f NPT", to: "Male NPT × Female NPT Adapter" },
  { slug: "male-female-connector-m-sae-x-f-npt", from: "Male Female Connector m SAE X f NPT", to: "Male SAE ORB × Female NPT Adapter" },
  { slug: "male-flange-connector-m-jic-x-l-series-flange", from: "Male Flange Connector m JIC X L-series flange", to: "Male JIC 37° × SAE Code 61 Flange Adapter" },
  { slug: "run-tee-connector-f-npt-x-f-npt-x-m-npt", from: "Run Tee Connector f NPT X f NPT X m NPT", to: "Run Tee, Female NPT × Female NPT × Male NPT" },
  { slug: "swivel-connector-f-jic-x-f-jic", from: "Swivel Connector f JIC x f JIC", to: "Female JIC 37° Swivel × Female JIC 37° Swivel Adapter" },
  { slug: "swivel-connector-m-npt-x-f-npsm", from: "Swivel Connector m NPT X f NPSM", to: "Male NPT × Female NPSM Swivel Adapter" },
  { slug: "swivel-connector-m-orfs-x-f-orfs", from: "Swivel Connector m ORFS X f ORFS", to: "Male ORFS × Female ORFS Swivel Adapter" },
  { slug: "swivel-connector-m-sae-x-f-npsm", from: "Swivel Connector m SAE X f NPSM", to: "Male SAE ORB × Female NPSM Swivel Adapter" },
  { slug: "swivel-connector-m-sae-x-f-orfs", from: "Swivel Connector m SAE X f ORFS", to: "Male SAE ORB × Female ORFS Swivel Adapter" },
]
