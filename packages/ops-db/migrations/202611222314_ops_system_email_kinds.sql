-- Indus Operations · S03-T01 · system email kinds
--
-- System mail (password reset, invitations, security notices) is recorded as ops.outbound_email
-- rows with channel 'system' (ADR-07: one record of every email). It needs three new kinds and,
-- for sends outside production to a recipient not on OPS_TEST_RECIPIENTS, a status that says the
-- message was recorded but deliberately not sent:
--
--   ops."OutboundKind"    + auth_password_reset, auth_invite, auth_security_notice
--   ops."OutboundStatus"  + suppressed_preview
--
-- No BEGIN / COMMIT: `ALTER TYPE … ADD VALUE` ships in a file of its own, ahead of the code that
-- uses the values (migrations/README.md, C31). No row uses them until the deploy with the
-- regenerated client is live.
--
-- Idempotent: ADD VALUE IF NOT EXISTS.

ALTER TYPE ops."OutboundKind" ADD VALUE IF NOT EXISTS 'auth_password_reset';
ALTER TYPE ops."OutboundKind" ADD VALUE IF NOT EXISTS 'auth_invite';
ALTER TYPE ops."OutboundKind" ADD VALUE IF NOT EXISTS 'auth_security_notice';
ALTER TYPE ops."OutboundStatus" ADD VALUE IF NOT EXISTS 'suppressed_preview';
