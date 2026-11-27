-- Indus Operations · S10-T04 · enum values for the directory, onboarding and screening
--
--   OutboundKind       supplier_document_request (the /u upload link to a new supplier), bank_change_warning (a
--                      warning to the address on file after a not-genuine bank-change call-back, board 132)
--   ComplianceDocKind  code_of_conduct, nda, ownership_declaration (the nine documents of board 50)
--   ScreeningKind      country_of_origin, re_export, adverse_media (the manual checklist of board 51, C40)
--   ScreeningResult    open (a row not yet checked)
--
-- ALTER TYPE … ADD VALUE cannot run inside a transaction block: no BEGIN/COMMIT here. IF NOT EXISTS makes a re-run
-- harmless. The values stay unused until the deploy with the regenerated client is live (CLAUDE.md §11.5).

ALTER TYPE ops."OutboundKind" ADD VALUE IF NOT EXISTS 'supplier_document_request';
ALTER TYPE ops."OutboundKind" ADD VALUE IF NOT EXISTS 'bank_change_warning';
ALTER TYPE ops."ComplianceDocKind" ADD VALUE IF NOT EXISTS 'code_of_conduct';
ALTER TYPE ops."ComplianceDocKind" ADD VALUE IF NOT EXISTS 'nda';
ALTER TYPE ops."ComplianceDocKind" ADD VALUE IF NOT EXISTS 'ownership_declaration';
ALTER TYPE ops."ScreeningKind" ADD VALUE IF NOT EXISTS 'country_of_origin';
ALTER TYPE ops."ScreeningKind" ADD VALUE IF NOT EXISTS 're_export';
ALTER TYPE ops."ScreeningKind" ADD VALUE IF NOT EXISTS 'adverse_media';
ALTER TYPE ops."ScreeningResult" ADD VALUE IF NOT EXISTS 'open';
