# 05 · Domain & data model

Carried forward from the v1 handoff, which remains **substantially valid** — the domain did not change when the design language did. Sections 1–11 below are the original model, unaltered.

**§12 at the foot is new** and is the part to read first if you already know the v1 model: it amends the model for the v2 surfaces (cross-reference, services, cases, richer industries, structured policies) and corrects facts that changed.

---


This is the canonical data model derived from the designs. It's stack-agnostic — translate to your ORM (Prisma, Eloquent, Django ORM, etc.) directly. Field types use a generic vocabulary (`string`, `text`, `int`, `decimal`, `bool`, `datetime`, `enum`, `json`, `fk`).

PII is marked `[PII]`. Money fields are `decimal(12,2)` unless noted.

---

## 1. Identity & accounts

### `account`
A B2B company entity. The customer organization, not a person.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `code` | string | Human-readable, e.g. `ACC-2018-0142` |
| `legal_name` | string | "Saudi Arabian Oil Company" |
| `display_name` | string | "Aramco Saudi" |
| `industry_id` | fk → `industry` | Oil & Gas, Mining, Marine… |
| `region` | string | "Saudi Arabia · Eastern Province" |
| `tier` | enum | `bronze` \| `silver` \| `gold` \| `platinum` |
| `status` | enum | `prospect` \| `active` \| `at_risk` \| `archived` |
| `assigned_rep_id` | fk → `staff_user` | Internal sales rep |
| `tax_id` | string | VAT / GSTIN |
| `preferred_currency` | enum | `USD` \| `INR` \| `EUR` \| `AED` \| `SAR` |
| `default_incoterm` | string | "DAP Dammam" |
| `credit_limit` | decimal | |
| `credit_outstanding` | decimal | Computed; cached |
| `payment_terms_days` | int | 0 (prepaid), 30, 45, 60 |
| `avg_dso_days` | int | Computed; cached |
| `requires_address_approval` | bool | Approval rule flag |
| `requires_rfq_approval_above` | decimal nullable | If set, RFQs above this need designated approver sign-off |
| `tags` | json (string[]) | "Strategic", "Refining", "Plant-down priority"… |
| `created_at`, `updated_at` | datetime | |

### `account_contact`
A person attached to an account. This is what logs in.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `account_id` | fk → `account` | |
| `email` | string unique | [PII] |
| `password_hash` | string | Null if SSO-only |
| `sso_provider` | enum nullable | `microsoft365` |
| `first_name`, `last_name` | string | [PII] |
| `phone` | string nullable | [PII] |
| `role` | enum | `procurement` \| `engineer` \| `ap` \| `approver` \| `admin` (account-level admin) |
| `is_default_billing_contact` | bool | |
| `is_active` | bool | |
| `last_sign_in_at` | datetime nullable | |
| `failed_sign_in_count` | int | Reset on success; 5 → lockout |
| `locked_until` | datetime nullable | |
| `created_at`, `updated_at` | datetime | |

### `account_address`
Multiple ship-to and bill-to per account.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | `ADDR-0142` |
| `account_id` | fk → `account` | |
| `kind` | enum | `ship_to` \| `bill_to` \| `both` |
| `is_default_ship` | bool | One per account |
| `is_default_bill` | bool | One per account |
| `label` | string | "Refinery Line 4 · Receiving Bay 02" |
| `attention` | string | "Mohammed Al-Rashid" [PII] |
| `lines` | json (string[]) | Address lines |
| `city`, `region`, `postal_code`, `country_code` | string | |
| `phone`, `email` | string nullable | [PII] |
| `delivery_notes` | text nullable | "Escort required · 48h notice" |
| `tax_id_override` | string nullable | If bill-to has different VAT |
| `approved_at` | datetime nullable | If `account.requires_address_approval` |
| `approved_by_id` | fk → `account_contact` nullable | |
| `created_at`, `updated_at` | datetime | |

### `staff_user`
Indus internal staff (sales reps, engineers, admins).

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `email`, `name` | string | [PII] |
| `role` | enum | `super_admin` \| `manager` \| `sales_rep` \| `engineer` \| `warehouse` \| `finance` \| `cms_editor` |
| `permissions` | json | Fine-grained overrides |
| `is_active` | bool | |
| `created_at`, `updated_at` | datetime | |

### `account_activity`
Append-only audit log for an account (RFQ submitted, credit limit changed, comment added). Used in the activity panel of `customer-detail.html`.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `account_id` | fk | |
| `actor_type` | enum | `contact` \| `staff` \| `system` |
| `actor_id` | uuid | |
| `verb` | string | `submitted_rfq`, `updated_credit_limit`, `commented`, `tier_upgraded` |
| `payload` | json | Verb-specific |
| `created_at` | datetime | |

---

## 2. Catalogue

### `category`
Tree structure (parent_id self-ref). Pumps → Piston → Variable, etc.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `parent_id` | fk → `category` nullable | |
| `slug` | string unique | |
| `name` | string | |
| `short_description` | text | |
| `seo_title`, `seo_description` | string | |
| `image_id` | fk → `media` nullable | Hero |
| `position` | int | Sort order within parent |
| `is_published` | bool | |

### `brand`
Manufacturer (Bosch Rexroth, Parker Hannifin…).

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `slug` | string unique | |
| `name` | string | |
| `country` | string | |
| `description` | text | |
| `logo_id` | fk → `media` nullable | |
| `hero_id` | fk → `media` nullable | |
| `is_authorized_distributor` | bool | |
| `seo_title`, `seo_description` | string | |
| `is_published` | bool | |

### `industry`
Customer-facing industry pages (Oil & Gas, Mining, Steel…).

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `slug`, `name` | string | |
| `description`, `seo_*` | text/string | |
| `hero_id` | fk → `media` | |
| `is_published` | bool | |

### `product`
The SKU. One row per orderable variant.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `sku` | string unique | `IH-AP71-D-R-V` |
| `mpn` | string | Manufacturer part number |
| `slug` | string unique | |
| `title` | string | "A10VSO 71cc Variable Pump" |
| `category_id` | fk → `category` | |
| `brand_id` | fk → `brand` | |
| `description_short` | text | |
| `description_long` | text (markdown / rich) | |
| `list_price` | decimal | In `list_price_currency` |
| `list_price_currency` | enum | |
| `unit_of_measure` | enum | `each` \| `metre` \| `kit` \| `set` |
| `weight_kg` | decimal(8,3) | |
| `dimensions_mm` | json `{l,w,h}` | |
| `lead_time_days` | int | When out of stock — supplier OEM lead time |
| `warranty_months` | int | |
| `country_of_origin` | string | |
| `hs_code` | string | Customs |
| `status` | enum | `draft` \| `active` \| `discontinued` |
| `superseded_by_id` | fk → `product` nullable | For "X is replaced by Y" |
| `seo_title`, `seo_description` | string | |
| `created_at`, `updated_at` | datetime | |

### `product_image`
Many per product, ordered.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `product_id` | fk | |
| `media_id` | fk → `media` | |
| `position` | int | |
| `alt` | string | |

### `product_spec`
Key/value technical specs. Used in product page spec table and `compare.html`. Specs are **categorized** (Hydraulic, Mechanical, Fluids, Commercial) so compare can section them.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `product_id` | fk | |
| `group` | string | "Hydraulic performance" |
| `label` | string | "Nominal pressure" |
| `value` | string | "350" |
| `unit` | string nullable | "bar" |
| `position` | int | Within group |
| `is_filterable` | bool | If true, exposed as a category facet |

### `product_document`
Datasheets, STEP files, service manuals.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `product_id` | fk | |
| `kind` | enum | `datasheet` \| `step` \| `iges` \| `service_manual` \| `installation_guide` |
| `title`, `language` | string | |
| `media_id` | fk → `media` | The actual file |
| `is_gated` | bool | If true, requires sign-in |
| `position` | int | |

### `product_cross_reference`
"This SKU replaces these competitor part numbers."

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `product_id` | fk | |
| `competitor_brand` | string | "Bosch Rexroth" |
| `competitor_mpn` | string | "R902401854" |
| `compatibility` | enum | `direct` \| `compatible` \| `superseded_by_us` |

### `media`
Generic asset (image, PDF, STEP file).

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `kind` | enum | `image` \| `document` \| `cad` |
| `mime_type` | string | |
| `original_filename` | string | |
| `storage_path` | string | S3 key |
| `bytes` | int | |
| `width`, `height` | int nullable | For images |
| `alt`, `caption` | string nullable | |
| `uploaded_by_id` | fk → `staff_user` nullable | |
| `created_at` | datetime | |

---

## 3. Inventory

### `warehouse`
Fixed list — Mumbai, Houston, Dubai, Singapore. Make it a table for future expansion.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `code` | string unique | "MUM", "HOU", "DXB", "SIN" |
| `name` | string | "Mumbai · Primary" |
| `region` | string | |
| `address_lines`, `city`, `country_code` | string | |
| `is_primary` | bool | |
| `capacity_units` | int nullable | For utilization % display |
| `is_active` | bool | |

### `inventory_item`
Per-SKU per-warehouse stock row. (`product_id`, `warehouse_id`) is unique.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `product_id` | fk | |
| `warehouse_id` | fk | |
| `quantity_on_hand` | int | |
| `quantity_reserved` | int | Allocated to open orders |
| `quantity_available` | int (computed) | `on_hand − reserved` |
| `reorder_threshold` | int | |
| `reorder_quantity` | int | Suggested PO size |
| `bin_location` | string nullable | "A-12-04" |
| `last_counted_at` | datetime nullable | |
| `updated_at` | datetime | |

### `inventory_adjustment`
Audit trail for any stock change not from a PO/order.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `inventory_item_id` | fk | |
| `delta` | int | + or − |
| `reason` | enum | `cycle_count` \| `damage` \| `theft` \| `correction` \| `manual` |
| `note` | text nullable | |
| `actor_id` | fk → `staff_user` | |
| `created_at` | datetime | |

### `inventory_transfer`
Inter-warehouse moves. Has `lines` for multi-SKU transfers.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `code` | string unique | "TRF-2026-0014" |
| `from_warehouse_id`, `to_warehouse_id` | fk | |
| `status` | enum | `draft` \| `in_transit` \| `received` \| `cancelled` |
| `dispatched_at`, `received_at` | datetime nullable | |
| `created_by_id` | fk → `staff_user` | |

### `inventory_transfer_line`
| `transfer_id`, `product_id`, `quantity` |

### `purchase_order` (inbound)
PO to a supplier; replenishes a warehouse.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `code` | string unique | "PO-2026-0084" |
| `supplier_name` | string | (Suppliers as a separate entity if you want; not strictly needed yet) |
| `destination_warehouse_id` | fk | |
| `status` | enum | `draft` \| `sent` \| `awaiting_dispatch` \| `in_transit` \| `partially_received` \| `received` \| `cancelled` |
| `eta_at` | date nullable | |
| `total_value`, `currency` | decimal, enum | |
| `created_at`, `updated_at` | datetime | |

### `purchase_order_line`
| `purchase_order_id`, `product_id`, `quantity_ordered`, `quantity_received`, `unit_cost`, `currency` |

---

## 4. Pricing engine

### `pricing_rule`
The engine is "rules sorted by priority". One table, polymorphic via `kind`.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `priority` | int | Lower = evaluated first |
| `name` | string | |
| `kind` | enum | `tier` \| `volume_break` \| `contract` \| `promo_code` \| `campaign` |
| `status` | enum | `active` \| `scheduled` \| `expiring` \| `expired` \| `paused` |
| **Audience selector** | | One of these is set |
| `tier` | enum nullable | If kind=tier |
| `account_id` | fk nullable | If kind=contract |
| `tag` | string nullable | "newsletter_subs" — for kind=promo_code or campaign |
| **Scope selector** | | What it applies to |
| `scope_kind` | enum | `all_skus` \| `category` \| `brand` \| `sku_list` |
| `scope_category_id` | fk nullable | |
| `scope_brand_id` | fk nullable | |
| `scope_sku_ids` | json (uuid[]) nullable | |
| **Effect** | | |
| `effect_kind` | enum | `percent_off` \| `flat_amount_off` \| `flat_price` \| `free_shipping` |
| `effect_value` | decimal nullable | |
| `effect_currency` | enum nullable | For flat_price/flat_amount_off |
| **Volume condition (kind=volume_break)** | | |
| `min_qty` | int nullable | |
| **Promo code (kind=promo_code)** | | |
| `code` | string nullable unique | "SPRING24" |
| `max_uses` | int nullable | |
| `max_uses_per_account` | int nullable | |
| `times_used` | int | |
| **Validity** | | |
| `valid_from` | datetime nullable | |
| `valid_until` | datetime nullable | |
| **Audit** | | |
| `created_by_id` | fk → `staff_user` | |
| `created_at`, `updated_at` | datetime | |

### `pricing_evaluation_log`
For the rule-evaluation log tab. Append-only.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `quote_line_id` | fk nullable | If from a quote |
| `product_id`, `account_id` | fk | |
| `qty` | int | |
| `list_price`, `final_price` | decimal | |
| `applied_rule_ids` | json (uuid[]) | Order matters — same as eval order |
| `breakdown` | json | `[{rule_id, label, delta, effective_price}, ...]` |
| `created_at` | datetime | |

---

## 5. RFQ → Quote → Order

### `rfq`
The Request for Quote — created when a customer submits their cart-equivalent.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `code` | string unique | "RFQ-2026-0418" |
| `account_id` | fk | |
| `submitted_by_contact_id` | fk → `account_contact` | |
| `subject` | string | "Refinery line 4 — 3 SKUs" |
| `application_context` | text | "Replacement during planned shutdown" |
| `urgency` | enum | `routine` \| `priority` \| `plant_down` |
| `requested_delivery_date` | date nullable | |
| `ship_to_address_id` | fk → `account_address` | |
| `bill_to_address_id` | fk → `account_address` | |
| `incoterm` | string | |
| `currency` | enum | |
| `status` | enum | See `rfq_status` below |
| `assigned_engineer_id` | fk → `staff_user` nullable | |
| `assigned_rep_id` | fk → `staff_user` | Auto-set from `account.assigned_rep_id` |
| `internal_notes` | text | |
| `customer_message` | text nullable | |
| `submitted_at` | datetime | |
| `quote_sent_at` | datetime nullable | |
| `accepted_at` | datetime nullable | |
| `quote_expires_at` | datetime nullable | |
| `created_at`, `updated_at` | datetime | |

**`rfq_status` enum:** `draft`, `submitted`, `engineer_review`, `engineer_questions_pending`, `quote_sent`, `accepted`, `declined`, `expired`, `order_created`, `cancelled`.

### `rfq_line`
| `id` | uuid (pk) |
| --- | --- |
| `rfq_id` | fk |
| `product_id` | fk |
| `requested_qty` | int |
| `customer_target_price` | decimal nullable |
| `ship_from_warehouse_id` | fk → `warehouse` nullable | Engineer assigns |
| `engineer_unit_price` | decimal nullable |
| `engineer_lead_time_days` | int nullable |
| `applied_rule_ids` | json (uuid[]) nullable |
| `engineer_notes` | text nullable |
| `position` | int |

### `rfq_attachment`
Customer can attach a drawing, photo of failed part, etc.

| `id`, `rfq_id`, `media_id`, `uploaded_by_*`, `created_at` |

### `quote`
Created when engineer is ready to send. Snapshot of pricing.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `code` | string unique | "Q-2026-0418" |
| `rfq_id` | fk | One quote per RFQ at a time; revisions get new codes |
| `revision` | int | Starts at 1 |
| `subtotal`, `discount_total`, `shipping`, `tax`, `total` | decimal | |
| `currency` | enum | |
| `terms_payment` | string | "Net 30" |
| `terms_validity_days` | int | |
| `pdf_media_id` | fk → `media` nullable | Generated PDF |
| `sent_at`, `expires_at`, `accepted_at`, `declined_at` | datetime | |

### `order`
Created when a quote is accepted.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `code` | string unique | "ORD-2026-0418" |
| `quote_id`, `rfq_id`, `account_id` | fk | |
| `status` | enum | `pending_credit_check` \| `credit_approved` \| `picking` \| `packed` \| `shipped` \| `delivered` \| `closed` \| `on_hold` |
| `customer_po_number` | string nullable | Their PO |
| `subtotal`, `total`, `currency` | … | (Snapshot at order time) |
| `placed_at`, `shipped_at`, `delivered_at` | datetime | |

### `order_line`
| `order_id`, `product_id`, `qty`, `unit_price`, `ship_from_warehouse_id`, `applied_rule_ids` |

### `order_shipment`
An order can ship in multiple shipments (split across warehouses).

| `id`, `order_id`, `from_warehouse_id`, `carrier`, `tracking_number`, `dispatched_at`, `delivered_at` |

---

## 6. Customer self-service

### `saved_list`
BOM-style list (machine spares, quarterly maint, etc.). Account-scoped, not user-scoped.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `account_id` | fk | |
| `owner_contact_id` | fk → `account_contact` | |
| `name` | string | "Refinery Line 4 · Service spares" |
| `description` | text | |
| `visibility` | enum | `private` \| `team` \| `account` |
| `reorder_cadence` | enum nullable | `monthly` \| `quarterly` \| `biannual` \| `annual` |
| `next_reorder_due_at` | date nullable | |
| `auto_rfq` | bool | |
| `created_at`, `updated_at` | datetime | |

### `saved_list_item`
| `id`, `saved_list_id`, `product_id`, `quantity`, `note`, `is_superseded`, `position` |

### `saved_list_comment`
| `id`, `saved_list_id`, `actor_*`, `body`, `created_at` |

### `password_reset_token`
| `id`, `contact_id`, `token_hash`, `expires_at`, `used_at`, `requested_ip`, `created_at` |

### `notification`
Portal notifications (the bell icon).

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `recipient_kind` | enum | `contact` \| `staff` |
| `recipient_id` | uuid | |
| `kind` | enum | `rfq_status_change` \| `quote_sent` \| `order_shipped` \| `mention` \| `password_reset` |
| `payload` | json | |
| `read_at` | datetime nullable | |
| `created_at` | datetime | |

---

## 7. Content & SEO

### `cms_page`
Static pages — about, contact, terms, privacy.

| `id`, `slug`, `title`, `body` (rich), `seo_*`, `is_published`, `published_at`, `updated_at` |

### `blog_post`
| `id`, `slug`, `title`, `excerpt`, `body` (rich), `hero_id`, `author_staff_id`, `tags` (json), `seo_*`, `published_at`, `is_published` |

### `redirect`
| `id`, `from_path`, `to_path`, `status_code` (301/302), `created_at` |

### `seo_setting` (singleton-ish)
| `default_meta_title_template`, `default_meta_description`, `og_default_image_id`, `robots_txt`, `sitemap_settings` (json) |

---

## 8. Bulk import

### `import_job`
For the bulk product import wizard.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `code` | string unique | "IMPORT-2026-0042" |
| `entity` | enum | `product` \| `customer` \| `pricing_rule` |
| `source_media_id` | fk → `media` | The uploaded CSV/XLSX |
| `column_mapping` | json | `{csv_col: indus_field}` |
| `options` | json | `{skip_errors: true, publish_new: false, ...}` |
| `status` | enum | `uploaded` \| `mapping` \| `validating` \| `previewing` \| `committing` \| `completed` \| `failed` \| `rolled_back` |
| `total_rows` | int | |
| `rows_to_create`, `rows_to_update`, `rows_with_warnings`, `rows_with_errors` | int | |
| `rollback_snapshot_id` | string nullable | For 30-day undo |
| `started_by_id` | fk → `staff_user` | |
| `started_at`, `completed_at` | datetime | |

### `import_job_row`
Per-row result.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `import_job_id` | fk | |
| `row_number` | int | |
| `raw_data` | json | The row as parsed |
| `mapped_data` | json | After column mapping |
| `outcome` | enum | `created` \| `updated` \| `warning` \| `error` \| `skipped` |
| `entity_id` | uuid nullable | If created/updated |
| `messages` | json (string[]) | "Price ↑ 4%", "Title missing" |

---

## 9. Settings & infra (for completeness)

These exist as admin views. Modeling depends on stack — keep them as a settings table or dedicated model:

- `store_settings` — name, support email, default currency, default tax rules.
- `warehouse_settings` — already covered in §3.
- `email_template` — `kind` enum (rfq_ack, quote_sent, password_reset, …), subject/body templates.
- `webhook` — url, events, secret, last_delivery_at, status.
- `api_key` — name, hashed key, scopes, created_by, last_used_at.
- `system_audit_log` — every staff action, IP, payload.

---

## 10. Indexing & performance hints

- `product.sku`, `product.slug`, `product.mpn` — unique indexes; lookup-heavy.
- `inventory_item (product_id, warehouse_id)` — composite unique.
- `rfq.account_id`, `rfq.status`, `rfq.submitted_at` — composite for the customer portal RFQ list.
- `pricing_rule (status, priority)` — for fast rule resolution at quote time.
- `pricing_rule.code` — unique partial index where `kind = 'promo_code'`.
- `account_contact.email` — unique, lookup on sign-in.
- Full-text index on `product.title + product.description_short + sku + mpn` — drives `search.html`. (Or push to Meilisearch / Typesense — recommended.)

---

## 11. Authorization model (sketch)

Two completely separate auth contexts:

1. **Customer portal** — authenticated as `account_contact`. Can see only resources belonging to their `account_id`. The `role` field gates approvals + admin-of-account capabilities.
2. **Admin** — authenticated as `staff_user`. Role-based access (`super_admin` sees all; `sales_rep` sees their assigned accounts; `engineer` sees the RFQ queue; `warehouse` sees inventory + shipments; `finance` sees invoices; `cms_editor` sees content only).

Use whatever your stack favors — RBAC table, policies (Laravel), permission decorators (Django), middleware (Next.js). Don't conflate the two contexts behind the same auth backend.


---

# 12 · Amendments for design language v2

Everything above predates the v2 design work. The domain is unchanged; these are additions and corrections.

## 12.1 Corrections to the model above

| Where | Was | Now | Why |
|---|---|---|---|
| §3 `warehouse` | Mumbai `is_primary` | **Dubai / Jebel Ali is primary** | v2 chrome, contact page and every service case are Dubai-led. Live site is a UAE business. |
| §3 `warehouse` | four warehouses | add `is_bonded` bool | v2 copy repeatedly references "Jebel Ali bonded warehouse" / "bonded stock". Bonded vs duty-paid changes what can ship where. |
| §8 behaviours | stock defaults to Mumbai when signed out | **defaults to Dubai** | follows primary-warehouse change |
| Contact facts | +91 22 4890 1200, IST | **+971 52 2477942, 09:00–18:00 GST Mon–Fri, sales@indushydraulics.me** | matches live site |
| SKU count | 1,870 | **1,134 live SKUs** | matches live site |
| §2 `industry` | 6 slugs assumed | seven verticals designed: oil-gas, mining, construction, power, marine, steel (+ master) | v2 industry template |

**Currency and pricing.** The v2 storefront shows **no prices anywhere** — it is quote-only. The pricing engine in §4 is still required, but it is **internal**: it prices the quote an engineer sends, and it never renders on a public page. Two consequences: (a) `product.list_price` must not leak to any public endpoint; (b) the `promo_code` and `campaign` rule kinds are B2C-shaped and do not appear anywhere in the v2 designs — confirm with the client whether they are still wanted before building them.

## 12.2 New: part interchange

**The existing model cannot support `/replacement`.** `product_cross_reference` (§2) records *competitor* part numbers pointing at our SKU. The v2 cross-reference finder is a different thing: **same-brand supersession** — an obsolete manufacturer code resolving to the current manufacturer code, with the differences documented attribute by attribute.

`product.superseded_by_id` gets the direction right but carries no detail, no confidence, and no explanation. All three are the point of the page.

### `part_interchange`
| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `obsolete_code` | string indexed | `A10VSO 71 DFR/31R-PPA12N00` |
| `obsolete_brand_id` | fk → `brand` | |
| `obsolete_description` | string | "axial piston pump, variable · series 31" |
| `discontinued_year` | int nullable | drives the "Discontinued 2019" badge |
| `current_product_id` | fk → `product` nullable | null = known obsolete, no equivalent on file |
| `confidence` | enum | `exact_fit` | `check_variant` | `engineer_review` |
| `confidence_note` | text | the one-line caveat shown on related rows |
| `narrative` | text | the interpretive note block — why the change is or isn't a compromise |
| `lookup_count` | int | drives "looked up most this quarter" |
| `verified_by_id` | fk → `staff_user` nullable | |
| `verified_at` | datetime nullable | |
| `is_published` | bool | |

### `part_interchange_delta`
One row per attribute compared. Rows where `fit_effect` is null render as unchanged.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `interchange_id` | fk | |
| `attribute` | string | "Mounting flange", "Seal material" |
| `obsolete_value` | string | "NBR" |
| `current_value` | string | "FKM" |
| `fit_effect` | string nullable | "Higher fluid temp OK" — null means no effect |
| `position` | int | |

### `interchange_enquiry`
The nameplate-photo path, for codes with no interchange on file.

| `id`, `submitted_code` nullable, `media_id` (photo), `contact_email`, `account_id` nullable, `status` enum (`new`/`identified`/`no_match`), `resolved_interchange_id` fk nullable, `assigned_engineer_id`, `created_at` |

**SEO note.** The durable play is a generated page per obsolete code. `part_interchange` should carry `slug`, `seo_title`, `seo_description` and be routable at `/replacement/{slug}` as well as queryable from `/replacement`.

## 12.3 New: services

**Entirely absent from the model above.** The v2 services index carries 20 services across 11 categories with live counts, and the live site treats these as a primary business line.

### `service_category`
| `id`, `slug`, `name`, `position`, `is_published` |

Eleven designed: Cylinders, Hoses, Pumps, Valves & manifolds, BOP & pressure control, CT & wireline, Wellhead, Field service, Lab & forensics, Custom builds (+ "All services" is a UI affordance, not a row). Three currently have a zero count and are retained deliberately — the UI dims them rather than hiding them, so **do not filter empty categories out of the API**.

### `service`
| Field | Type | Notes |
| --- | --- | --- |
| `id` | uuid (pk) | |
| `number` | string | "NO. 03" — display sequence, not the pk |
| `slug`, `title` | string | |
| `category_id` | fk → `service_category` | |
| `summary` | text | the card body — one sentence, written as a claim |
| `turnaround_label` | string | "42 D ON BENCH", "DAY-RATE · 48 H DISPATCH" |
| `bench` | enum | `workshop` | `oilfield` | `field` | `lab` | `forensics` | `build` |
| `hero_media_id` | fk → `media` nullable | |
| `is_featured` | bool | drives "Case of the week" |
| `position`, `is_published` | int, bool | |

### `service_outcome`
The mono chips on each card. `id`, `service_id`, `label` ("Hydrotest 15,000 psi · 0 drop"), `position`.

## 12.4 New: case studies

The seven-part case template (`lf-case-7part`) is the canonical long-form. It needs real structure, not a rich-text blob.

### `case_study`
| Field | Type | Notes |
| --- | --- | --- |
| `id`, `slug` | | |
| `number` | string | "CASE NO. 07" |
| `title` | text | long declarative sentence, italic clause marked in the body |
| `standfirst` | text | the lede |
| `service_id` | fk → `service` nullable | |
| `industry_id` | fk → `industry` nullable | |
| `account_id` | fk → `account` nullable | null when anonymised ("ADNOC sub-contractor") |
| `client_label` | string | what we're permitted to print |
| `location`, `bay` | string | "Rub' al Khali, UAE", "Jebel Ali · Bay 2" |
| `period_label` | string | "MAR 2026" |
| `hero_media_id` | fk | 21:9 |
| `problem_body`, `approach_body` | text | sections /01 and /02 |
| `outcome_summary` | text | the tinted result panel |
| `is_published`, `published_at` | | |

### `case_headline_stat`
The four-up at the top. `case_id`, `value` ("19 d"), `label` ("Total turnaround"), `position`.

### `case_phase`
Section /03. `case_id`, `label` ("Phase 01"), `title`, `body`, `position`.

### `case_sop_step`
Section /04 — the ledger with the signed column. `case_id`, `day_label` ("D+11"), `step`, `is_signed` bool, `position`.

### `case_metric`
Section /05, before and after. `case_id`, `measure`, `on_intake`, `on_signoff`, `position`.

### `case_team_member`
Section /07. `case_id`, `staff_user_id` fk nullable, `display_name`, `role`, `contribution`, `position`.

## 12.5 Extended: industries

The `industry` table in §2 (slug, name, description, hero, seo) is far too thin for the v2 template. Seven pages render from one component; everything below must be data.

Add to `industry`: `kicker` ("UPSTREAM · MIDSTREAM · DOWNSTREAM"), `headline` (long declarative sentence), `lede`, `support_eyebrow`, `support_headline`, `support_body`, `support_cta_label`, `support_media_id`, `position`.

New child tables:

- **`industry_certification`** — `industry_id`, `label` ("API 6A / 16A RATED"), `position`. These are compliance claims; add `verified_at` and have the client sign them off before publishing.
- **`industry_stat`** — `industry_id`, `value` ("220+"), `label` ("Oil & gas customers"), `position`.
- **`industry_application_area`** — the four-up. `industry_id`, `tag` ("WELLHEAD & BOP"), `title`, `description`, `sku_count`, `category_id` fk nullable (so the card can deep-link to a filtered PLP), `position`.
- **`industry_support_check`** — `industry_id`, `label`, `position`. Four per vertical.
- **`industry_reference_install`** — `industry_id`, `case_study_id` fk nullable, `client_label` ("HPCL · 2024"), `title`, `body`, `position`.

**Rated SKUs** on the industry page should resolve through a join, not a curated list: `product_industry` (`product_id`, `industry_id`) many-to-many.

## 12.6 Extended: structured policy pages

`cms_page` (§7) stores a rich-text body. The v2 policy template is structured — numbered sections, sub-headings, and a separate at-a-glance spec list — and the same template renders five pages. Either give `cms_page` structure or model policies separately:

- **`policy`** — `slug`, `nav_label`, `crumb`, `headline`, `lede`, `updated_at`, `position`, `is_published`
- **`policy_section`** — `policy_id`, `heading`, `position`
- **`policy_clause`** — `section_id`, `heading`, `body`, `position`
- **`policy_glance_row`** — `policy_id`, `key`, `value`, `position`

Five designed: shipping, returns, warranty, privacy, terms. **The copy takes real commercial positions** — liability capped at invoice value, consequential loss and rig time excluded, contamination named as the most common non-covered warranty cause. Route these past the client's commercial lead before publishing.

## 12.7 Small additions

- **`category`** — the new category index shows per-category `sku_count` and `brand_count`. Compute and cache; do not count on every render.
- **`brand`** — brand detail shows range-by-category counts, an authorised-since year, and a document list. Add `authorised_since` int; reuse `product_document` scoped by brand for the catalogue PDFs.
- **`product`** — the PDP is title-first with a 4:3 hero. `product_image` needs an explicit aspect or crop hint so the lead image renders 4:3 rather than square.
- **`saved_list`** — unchanged and still correct.
- **Search** — the part-number interception (a query that looks like a part code surfaces a cross-reference card above organic results) queries `part_interchange.obsolete_code` before the product index. Index accordingly.

## 12.8 Still unmodelled — raise before scoping

1. **Quote pricing console.** `rfq_line` already carries `engineer_unit_price`, `ship_from_warehouse_id` and `engineer_notes`, so the model supports it — but no screen has ever been designed for the engineer who fills those fields in. It is the most-used screen in the backend.
2. **Substitution-on-a-quote-line.** When an engineer quotes a different part from the one requested, the reason must travel with the line to the customer. Add `substituted_for_product_id` and `substitution_reason` to `rfq_line`.
3. **Address book.** `account_address` is fully modelled with an approval workflow; `address-book.html` was referenced in the v1 prompts but never designed, and there is no v2 artboard either. **Screen gap in both packages.**
4. **Notification centre.** `notification` is modelled; no screen in either package.
5. **Recertification calendar.** Not modelled and not designed. The business is date-driven and recurring — BOP recerts on a 5-year clock, redress at 12 months, pressure tests every 14 days. A customer asset register with due dates and certificate history would be the highest-value addition to the platform, and the admin fleet view doubles as a sales pipeline. Discussed, never specified.
6. **IWCF training booking.** A live service line with monthly open enrolment, bulk cohorts and 2-year recerts — a scheduling product. Unmodelled, undesigned.
