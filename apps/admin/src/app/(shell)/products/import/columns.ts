// Single source of truth for the bulk-import CSV column spec.
// Used by the server action (validation + parsing) AND the UI (template + helptext).
// Order here is the order columns appear in the downloadable template.
//
// Beyond the fixed columns below, the parser also accepts DYNAMIC columns
// of the form `attr_<field_key>` — one per template field on the row's
// `spec_template_slug`. E.g. for the "Axial Piston Pump" template with a
// field `displacement`, add a column `attr_displacement` with the numeric
// value. Validated per the field's data type (text/number/boolean/select).

export type ProductImportColumn = {
  key: string
  required?: boolean
  description: string
  example?: string
}

/** Prefix used for dynamic spec-value columns. */
export const SPEC_ATTR_PREFIX = 'attr_'

export const PRODUCT_IMPORT_COLUMNS: ProductImportColumn[] = [
  { key: 'sku', required: true, description: 'Unique SKU code', example: 'IH-AP71-D-R-V' },
  { key: 'title', required: true, description: 'Product title', example: 'Bosch Rexroth A10VSO 71cc Pump' },
  { key: 'mpn', description: "Manufacturer's part number", example: 'A10VSO71DRV/31R-PSC62K02' },
  { key: 'brand_slug', description: 'Brand slug — must already exist in the system', example: 'bosch-rexroth' },
  { key: 'category_slug', description: 'Category slug — must already exist', example: 'hydraulic-pumps' },
  { key: 'spec_template_slug', description: 'Spec-template slug — auto-attaches the typed schema. Pair with attr_<field_key> columns for values.', example: 'axial-piston-pump' },
  { key: 'description_short', description: 'One-line teaser shown on listings', example: 'Variable displacement axial piston pump.' },
  { key: 'description_long', description: 'Full description (Markdown allowed)' },
  { key: 'list_price', description: 'Decimal, no currency symbol', example: '184000' },
  { key: 'currency', description: 'USD | INR | EUR | AED | SAR (default: USD)', example: 'INR' },
  { key: 'unit_of_measure', description: 'each | metre | kit | set (default: each)', example: 'each' },
  { key: 'weight_kg', description: 'Decimal kilograms', example: '26.5' },
  { key: 'lead_time_days', description: 'Integer days from order to dispatch', example: '0' },
  { key: 'warranty_months', description: 'Integer months', example: '24' },
  { key: 'stock_qty', description: 'Integer units in stock (default: 0)', example: '12' },
  { key: 'stock_warehouse', description: 'Free-text warehouse label shown next to stock pill', example: 'Mumbai' },
  { key: 'country_of_origin', description: 'Country name', example: 'Germany' },
  { key: 'hs_code', description: 'HS classification code', example: '84132000' },
  { key: 'status', description: 'draft | active | discontinued (default: draft)', example: 'active' },
  { key: 'seo_title', description: 'Optional <title> override' },
  { key: 'seo_description', description: 'Meta description' },
]

export const REQUIRED_KEYS = PRODUCT_IMPORT_COLUMNS.filter((c) => c.required).map((c) => c.key)
