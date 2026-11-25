-- S08-T06: ops.numbering.continuity sets this when an outside allocator (the website admin, C5) has reached the
-- Operations block for a sequence, and clears it when the check passes again. Settings › Numbering shows it.
ALTER TABLE "ops"."number_sequence" ADD COLUMN IF NOT EXISTS "outOfStepAt" timestamptz(3);
