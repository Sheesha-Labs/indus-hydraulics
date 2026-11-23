-- Indus Operations · S03-T04 · settings defaults and the setup checklist (S03 migration 4)
--
-- Every setting the setup screens (boards 78–83) and the services read is a settings_entry row,
-- validated in code by the registry in apps/ops/src/server/settings/registry.ts. The values are
-- the product defaults from the architecture (C12, C13, C14, C19, C20, C26, C32, C38, ADR-10,
-- ADR-11, ADR-18, §9.2 P01/P04/P08/P12/P23/P27). Rows the handoff marks *default* or *needs
-- sign-off* are 'awaiting' (ADR-28) until the Owner confirms them; the rest are 'not_required'.
--
-- company.profile seeds EMPTY strings on purpose: the company's legal name, TRN, address and
-- phone are filled by the copy script and Setup 1, and never live in this public repository.
--
-- Every key is ownerOnly except setup.progress (the Helper's first visit marks the welcome seen).
--
-- checklist_item rows for checklist 'setup' are the wizard's six steps (board 78 rail). Step 6's
-- label is content: it stores "Invite your helper" and the page renders the Helper's name when it
-- is known.
--
-- Idempotent: ON CONFLICT DO NOTHING everywhere, so a re-run never overwrites a value someone has
-- since changed in Settings or a step someone has since completed.

BEGIN;

INSERT INTO "ops"."settings_entry" ("key", "value", "version", "ownerOnly", "signoffStatus", "updatedAt") VALUES
  ('company.profile',
    '{"legalName":"","tradingName":"","trn":"","addressLines":[],"phone":"","website":"","copiedFrom":null,"confirmedAt":null}',
    0, true, 'not_required', now()),
  ('company.assets',
    '{"logoFileId":null,"stampFileId":null,"signatures":{}}',
    0, true, 'not_required', now()),
  ('currency',
    '{"book":"AED","quotation":["AED","USD","EUR"],"defaultQuotation":"AED"}',
    0, true, 'not_required', now()),
  ('fx',
    '{"source":"CBUAE","fetchTimes":["06:00","08:00","10:00"],"timezone":"Asia/Dubai","lockAt":"capture","repriceThresholdPct":2}',
    0, true, 'awaiting', now()),
  ('vat',
    '{"standardRatePct":5,"localWording":"VAT 5% extra as per UAE law","exportWording":"Zero-rated export"}',
    0, true, 'awaiting', now()),
  ('pricing.defaults',
    '{"marginPct":18,"floorPct":12,"hardMinPct":5,"rounding":{"stepAed":5,"above":{"thresholdAed":5000,"stepAed":10}},"priceGuardPct":25}',
    0, true, 'awaiting', now()),
  ('landed.defaults',
    '{"freightPct":4,"insurancePct":0.5,"dutyPct":5,"bankPct":1}',
    0, true, 'awaiting', now()),
  ('assistant.mode',
    '{"mode":"careful"}',
    0, true, 'not_required', now()),
  ('assistant.budget',
    '{"monthlyUsd":150}',
    0, true, 'awaiting', now()),
  ('research.cap',
    '{"perEnquiryUsd":5,"allowMoreUsd":3}',
    0, true, 'awaiting', now()),
  ('links',
    '{"expiryDays":60}',
    0, true, 'awaiting', now()),
  ('intake',
    '{"callbackAlertMinutes":45,"duplicateWindowDays":7,"maxUploadMb":20}',
    0, true, 'awaiting', now()),
  ('retention',
    '{"years":5}',
    0, true, 'awaiting', now()),
  ('auth',
    '{"sessionHours":8,"lockAttempts":5,"lockMinutes":15,"inviteDays":7,"resetMinutes":30}',
    0, true, 'awaiting', now()),
  ('undo',
    '{"sendWindowMinutes":5}',
    0, true, 'not_required', now()),
  ('system_email.sender',
    '{"from":"Indus Operations <no-reply@indushydraulics.com>","replyTo":"sales@indushydraulics.me"}',
    0, true, 'awaiting', now()),
  ('setup.progress',
    '{"welcomeSeenBy":[]}',
    0, false, 'not_required', now())
ON CONFLICT ("key") DO NOTHING;

INSERT INTO "ops"."checklist_item" ("checklist", "key", "label", "position", "ownerOnly") VALUES
  ('setup', 'company',   'Company and documents',             1, true),
  ('setup', 'mailboxes', 'Connect mailboxes',                 2, true),
  ('setup', 'history',   'Bring in your history',             3, true),
  ('setup', 'money',     'Money defaults',                    4, true),
  ('setup', 'assistant', 'How much should the Assistant do?', 5, true),
  ('setup', 'invite',    'Invite your helper',                6, true)
ON CONFLICT ("checklist", "key") DO NOTHING;

COMMIT;
