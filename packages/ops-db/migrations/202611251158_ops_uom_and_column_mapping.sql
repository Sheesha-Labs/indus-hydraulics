-- Indus Operations · S08-T02 / T05 · Units of measure and remembered spreadsheet column mappings
--
--   uom_unit               the unit table extraction normalises to (EA, PR, SET, M, FT, KG, L, DRUM, BOX, ROLL, LOT,
--                          PKT). Structure only, editable in Settings later.
--   uom_alias              what clients write for a unit (NOS, PCS, MTR …) → the unit's code
--   client_column_mapping  board 35 "Remember this mapping for <client>": per client company and header signature,
--                          which column holds what. Keyed by a hash of the normalised header cells, so the next
--                          sheet from the same client opens with the mapping applied (used_count counts reuse).
--
-- Idempotent: IF NOT EXISTS, ON CONFLICT DO NOTHING. RLS on, ops_app policy and grants as the base migration.

BEGIN;

CREATE TABLE IF NOT EXISTS "ops"."uom_unit" (
  "code"  text NOT NULL,
  "label" text NOT NULL,
  -- count | length | mass | volume | pack
  "kind"  text NOT NULL,
  CONSTRAINT "uom_unit_pkey" PRIMARY KEY ("code"),
  CONSTRAINT "uom_unit_kind_check" CHECK ("kind" IN ('count', 'length', 'mass', 'volume', 'pack'))
);

CREATE TABLE IF NOT EXISTS "ops"."uom_alias" (
  "alias"     text NOT NULL,
  "unitCode"  text NOT NULL,
  CONSTRAINT "uom_alias_pkey" PRIMARY KEY ("alias")
);
DO $$ BEGIN
  ALTER TABLE "ops"."uom_alias" ADD CONSTRAINT "uom_alias_unitCode_fkey"
    FOREIGN KEY ("unitCode") REFERENCES "ops"."uom_unit"("code") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

INSERT INTO "ops"."uom_unit" ("code", "label", "kind") VALUES
  ('EA', 'Each', 'count'),
  ('PR', 'Pair', 'count'),
  ('SET', 'Set', 'count'),
  ('M', 'Metre', 'length'),
  ('FT', 'Foot', 'length'),
  ('KG', 'Kilogram', 'mass'),
  ('L', 'Litre', 'volume'),
  ('DRUM', 'Drum', 'pack'),
  ('BOX', 'Box', 'pack'),
  ('ROLL', 'Roll', 'pack'),
  ('LOT', 'Lot', 'pack'),
  ('PKT', 'Packet', 'pack')
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "ops"."uom_alias" ("alias", "unitCode") VALUES
  ('NOS', 'EA'), ('NO', 'EA'), ('NOS.', 'EA'), ('PCS', 'EA'), ('PC', 'EA'), ('PIECE', 'EA'), ('PIECES', 'EA'),
  ('EACH', 'EA'), ('UNIT', 'EA'), ('UNITS', 'EA'), ('NUMBERS', 'EA'), ('QTY', 'EA'),
  ('PAIR', 'PR'), ('PAIRS', 'PR'), ('PRS', 'PR'),
  ('SETS', 'SET'), ('KIT', 'SET'), ('KITS', 'SET'),
  ('MTR', 'M'), ('MTRS', 'M'), ('METRE', 'M'), ('METER', 'M'), ('METRES', 'M'), ('METERS', 'M'), ('MTS', 'M'),
  ('FEET', 'FT'), ('FOOT', 'FT'),
  ('KGS', 'KG'), ('KILO', 'KG'), ('KILOGRAM', 'KG'),
  ('LTR', 'L'), ('LTRS', 'L'), ('LITRE', 'L'), ('LITER', 'L'), ('LITRES', 'L'), ('LITERS', 'L'),
  ('DRUMS', 'DRUM'), ('BOXES', 'BOX'), ('ROLLS', 'ROLL'), ('LOTS', 'LOT'),
  ('PACK', 'PKT'), ('PACKET', 'PKT'), ('PACKS', 'PKT'), ('PACKETS', 'PKT')
ON CONFLICT ("alias") DO NOTHING;

CREATE TABLE IF NOT EXISTS "ops"."client_column_mapping" (
  "id"            uuid NOT NULL DEFAULT gen_random_uuid(),
  "companyId"     uuid NOT NULL,
  -- sha256 of the sorted, normalised header cells: survives the client reordering columns
  "fileSignature" text NOT NULL,
  "sheetName"     text,
  "headerRow"     integer NOT NULL,
  -- column letter → line_no | description | part_no | qty | uom | spec | make | notes | ignore
  "mapping"       jsonb NOT NULL,
  -- header text → target field, so a reordered sheet maps by header, not by letter
  "byHeader"      jsonb NOT NULL DEFAULT '{}'::jsonb,
  -- raw unit → unit code chosen by a person
  "unitOverrides" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "usedCount"     integer NOT NULL DEFAULT 0,
  "lastUsedAt"    timestamptz(3),
  "createdById"   uuid,
  "createdAt"     timestamptz(3) NOT NULL DEFAULT now(),
  "updatedAt"     timestamptz(3) NOT NULL DEFAULT now(),
  CONSTRAINT "client_column_mapping_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "client_column_mapping_companyId_fileSignature_key"
  ON "ops"."client_column_mapping" ("companyId", "fileSignature");
CREATE INDEX IF NOT EXISTS "client_column_mapping_companyId_lastUsedAt_idx"
  ON "ops"."client_column_mapping" ("companyId", "lastUsedAt" DESC);
DO $$ BEGIN
  ALTER TABLE "ops"."client_column_mapping" ADD CONSTRAINT "client_column_mapping_companyId_fkey"
    FOREIGN KEY ("companyId") REFERENCES "ops"."company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ops"."client_column_mapping" ADD CONSTRAINT "client_column_mapping_createdById_fkey"
    FOREIGN KEY ("createdById") REFERENCES "ops"."user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── RLS, policies and grants ──────────────────────────────────────────────────────────────
DO $$
DECLARE
  t text;
  r text;
BEGIN
  FOREACH t IN ARRAY ARRAY['uom_unit', 'uom_alias', 'client_column_mapping'] LOOP
    EXECUTE format('ALTER TABLE ops.%I ENABLE ROW LEVEL SECURITY', t);
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname = 'ops' AND tablename = t AND policyname = 'ops_app_all'
    ) THEN
      EXECUTE format(
        'CREATE POLICY ops_app_all ON ops.%I AS PERMISSIVE FOR ALL TO ops_app USING (true) WITH CHECK (true)', t);
    END IF;
    EXECUTE format('REVOKE ALL ON ops.%I FROM PUBLIC', t);
    FOREACH r IN ARRAY ARRAY['anon', 'authenticated', 'service_role'] LOOP
      IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r) THEN
        EXECUTE format('REVOKE ALL ON ops.%I FROM %I', t, r);
      END IF;
    END LOOP;
  END LOOP;
END $$;

GRANT SELECT, INSERT, UPDATE, DELETE ON "ops"."uom_unit" TO ops_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "ops"."uom_alias" TO ops_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON "ops"."client_column_mapping" TO ops_app;

COMMIT;
