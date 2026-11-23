-- Indus Operations · S04-T02 · mailbox and send-queue enum values (C31: ADD VALUE in its own file)
--
-- MailboxStatus  + token_expired, revoked, resyncing   (ADR-06: invalid_grant, app removed, history 404)
-- OutboundStatus + scheduled, held, unknown, superseded (ADR-07 state machine)
--                  suppressed_preview already exists (S03-T01).
--                  queued and undone stay in the enum but are no longer written.
--
-- No transaction: ALTER TYPE … ADD VALUE cannot run inside one on older servers, and no row may use a new
-- value until the deploy with the regenerated Prisma client is live (CLAUDE.md §11.5). Idempotent.

ALTER TYPE ops."MailboxStatus" ADD VALUE IF NOT EXISTS 'token_expired';
ALTER TYPE ops."MailboxStatus" ADD VALUE IF NOT EXISTS 'revoked';
ALTER TYPE ops."MailboxStatus" ADD VALUE IF NOT EXISTS 'resyncing';

ALTER TYPE ops."OutboundStatus" ADD VALUE IF NOT EXISTS 'scheduled';
ALTER TYPE ops."OutboundStatus" ADD VALUE IF NOT EXISTS 'held';
ALTER TYPE ops."OutboundStatus" ADD VALUE IF NOT EXISTS 'unknown';
ALTER TYPE ops."OutboundStatus" ADD VALUE IF NOT EXISTS 'superseded';
ALTER TYPE ops."OutboundStatus" ADD VALUE IF NOT EXISTS 'suppressed_preview';
