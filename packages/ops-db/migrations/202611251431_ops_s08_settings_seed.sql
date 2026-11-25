-- Indus Operations · S08-T07 · settings default: how "revert by" is computed (board 93 "Why 26 Sep")
--
--   ack.revert_by   deadline − typical supplier reply (working days; the default until five RFQs exist for the trade)
--                  − pricing and approval − a buffer, never earlier than the next working day; without a deadline,
--                  received + defaultNoDeadlineDays working days. Awaiting the Owner's sign-off (open item P03).
--
-- ON CONFLICT DO NOTHING: a value the Owner changed is kept.

BEGIN;

INSERT INTO "ops"."settings_entry" ("key", "value", "version", "ownerOnly", "signoffStatus", "updatedAt")
VALUES
  ('ack.revert_by',
    '{"pricingDays":0.5,"bufferDays":2,"defaultSupplierReplyDays":2,"defaultNoDeadlineDays":3}',
    0, true, 'awaiting', now())
ON CONFLICT ("key") DO NOTHING;

COMMIT;
