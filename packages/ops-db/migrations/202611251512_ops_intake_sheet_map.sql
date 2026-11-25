-- S08-T05 (board 35): the column mapping a person is working on for one spreadsheet, before it becomes lines.
-- { sheet, headerRow, signature, columns: [{ c, header, target, sample }], units: {RAW: CODE}, remember, confirmedAt }.
-- Saved per client into client_column_mapping only when "Remember this mapping" is on and a client is known.
ALTER TABLE "ops"."intake_file" ADD COLUMN IF NOT EXISTS "sheetMap" jsonb;
