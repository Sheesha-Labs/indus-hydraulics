-- Indus Operations · S03-T03 · team auth_event kinds
--
-- Settings › Team (board 84) writes the access changes it makes to the append-only auth log. The
-- invite and ownership kinds exist already; these three do not:
--
--   ops."AuthEventKind"  + invite_domain_override   an invite to an address outside the Workspace
--                                                    domain, sent because the Owner overrode the rule
--                        + permissions_changed       the Owner changed a Helper's three toggles
--                        + user_removed              the Owner removed a Helper (sessions revoked)
--
-- No BEGIN / COMMIT: `ALTER TYPE … ADD VALUE` ships in a file of its own, ahead of the code that
-- uses the values (migrations/README.md, C31). No row uses them until the deploy with the
-- regenerated client is live.
--
-- Idempotent: ADD VALUE IF NOT EXISTS.

ALTER TYPE ops."AuthEventKind" ADD VALUE IF NOT EXISTS 'invite_domain_override';
ALTER TYPE ops."AuthEventKind" ADD VALUE IF NOT EXISTS 'permissions_changed';
ALTER TYPE ops."AuthEventKind" ADD VALUE IF NOT EXISTS 'user_removed';
