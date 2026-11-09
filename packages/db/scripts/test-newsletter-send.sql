-- DB test for the newsletter send functions (202611091458).
--
-- Safe against production: one DO block that ends by raising, so every write
-- is rolled back. Success is 'newsletter send test: ALL PASSED (rolled back)'.
--
--   pnpm --filter @indus/db exec prisma db execute --file scripts/test-newsletter-send.sql

DO $$
DECLARE
  t       TEXT := md5(random()::text);
  v_l1    TEXT;
  v_l2    TEXT;
  v_c     TEXT;
  v_c2    TEXT;
  v_n     INT;
BEGIN
  -- Subscribers: two confirmed (one suppressed), one pending.
  INSERT INTO newsletter_subscribers (id, email, status, "updatedAt") VALUES
    (gen_random_uuid()::text, 'sub-a-' || t || '@example.invalid', 'confirmed', now()),
    (gen_random_uuid()::text, 'SUB-B-' || t || '@example.invalid', 'confirmed', now()),
    (gen_random_uuid()::text, 'sub-p-' || t || '@example.invalid', 'pending', now());
  INSERT INTO newsletter_suppressions ("emailHash", reason)
  VALUES (newsletter_email_hash('sub-b-' || t || '@example.invalid'), 'complained');

  -- Lists: the same address on both lists; an address also subscribed;
  -- an unsubscribed row; a suppressed address.
  INSERT INTO newsletter_lists (name) VALUES ('send test 1') RETURNING id INTO v_l1;
  INSERT INTO newsletter_lists (name) VALUES ('send test 2') RETURNING id INTO v_l2;
  INSERT INTO newsletter_list_contacts ("listId", email) VALUES
    (v_l1, 'both-' || t || '@example.invalid'),
    (v_l2, 'both-' || t || '@example.invalid'),
    (v_l1, 'sub-a-' || t || '@example.invalid'),
    (v_l2, 'only2-' || t || '@example.invalid'),
    (v_l1, 'supp-' || t || '@example.invalid');
  INSERT INTO newsletter_list_contacts ("listId", email, status) VALUES (v_l1, 'left-' || t || '@example.invalid', 'unsubscribed');
  INSERT INTO newsletter_suppressions ("emailHash", reason)
  VALUES (newsletter_email_hash('supp-' || t || '@example.invalid'), 'bounced')
  ON CONFLICT DO NOTHING;

  -- 1. Lists only: both (once), sub-a (no subscriber copy here, so via list), only2. Not supp, not left.
  INSERT INTO newsletter_campaigns (subject, audience, "listIds") VALUES ('t', 'none', ARRAY[v_l1, v_l2]) RETURNING id INTO v_c;
  v_n := newsletter_start_campaign(v_c);
  IF v_n <> 3 THEN RAISE EXCEPTION 'FAIL 1: lists-only snapshot %', v_n; END IF;
  PERFORM 1 FROM newsletter_campaigns WHERE id = v_c AND status = 'sending' AND "recipientCount" = 3 AND "startedAt" IS NOT NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'FAIL 1b: campaign not marked sending'; END IF;

  -- 2. Starting again does nothing.
  IF newsletter_start_campaign(v_c) IS NOT NULL THEN RAISE EXCEPTION 'FAIL 2: restarted'; END IF;

  -- 3. Subscribers + lists: sub-a once (as a subscriber), not sub-b (suppressed), not pending;
  --    plus both, only2 from the lists. Every other confirmed subscriber in the table counts too.
  INSERT INTO newsletter_campaigns (subject, audience, "listIds") VALUES ('t', 'all', ARRAY[v_l1, v_l2]) RETURNING id INTO v_c2;
  v_n := newsletter_start_campaign(v_c2);
  PERFORM 1 FROM newsletter_deliveries d JOIN newsletter_subscribers s ON s.id = d."subscriberId"
   WHERE d."campaignId" = v_c2 AND s.email = 'sub-a-' || t || '@example.invalid';
  IF NOT FOUND THEN RAISE EXCEPTION 'FAIL 3a: subscriber copy missing'; END IF;
  PERFORM 1 FROM newsletter_deliveries d JOIN newsletter_list_contacts c ON c.id = d."contactId"
   WHERE d."campaignId" = v_c2 AND c.email = 'sub-a-' || t || '@example.invalid';
  IF FOUND THEN RAISE EXCEPTION 'FAIL 3b: list copy for a subscribed address'; END IF;
  PERFORM 1 FROM newsletter_deliveries d JOIN newsletter_subscribers s ON s.id = d."subscriberId"
   WHERE d."campaignId" = v_c2 AND lower(s.email) = 'sub-b-' || t || '@example.invalid';
  IF FOUND THEN RAISE EXCEPTION 'FAIL 3c: suppressed subscriber included'; END IF;
  SELECT count(*) INTO v_n FROM newsletter_deliveries d JOIN newsletter_list_contacts c ON c.id = d."contactId"
   WHERE d."campaignId" = v_c2 AND c.email LIKE '%' || t || '%';
  IF v_n <> 2 THEN RAISE EXCEPTION 'FAIL 3d: list copies %', v_n; END IF;

  -- 4. Claim: only queued rows of that campaign, marked sending, attempts +1.
  SELECT count(*) INTO v_n FROM newsletter_claim_deliveries(v_c, 2);
  IF v_n <> 2 THEN RAISE EXCEPTION 'FAIL 4a: claimed %', v_n; END IF;
  SELECT count(*) INTO v_n FROM newsletter_deliveries WHERE "campaignId" = v_c AND status = 'sending' AND attempts = 1 AND "claimedAt" IS NOT NULL;
  IF v_n <> 2 THEN RAISE EXCEPTION 'FAIL 4b: claimed rows %', v_n; END IF;
  SELECT count(*) INTO v_n FROM newsletter_claim_deliveries(v_c, 10);
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL 4c: second claim %', v_n; END IF;
  -- A row left in sending is never re-claimed.
  SELECT count(*) INTO v_n FROM newsletter_claim_deliveries(v_c, 10);
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL 4d: re-claimed sending rows'; END IF;

  -- 5. Exactly one recipient per row.
  BEGIN
    INSERT INTO newsletter_deliveries ("campaignId") VALUES (v_c);
    RAISE EXCEPTION 'FAIL 5: a row with no recipient';
  EXCEPTION WHEN check_violation THEN NULL;
  END;

  -- 6. Deleting a list takes its delivery rows.
  DELETE FROM newsletter_lists WHERE id IN (v_l1, v_l2);
  SELECT count(*) INTO v_n FROM newsletter_deliveries WHERE "campaignId" = v_c;
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL 6: % rows outlived their contacts', v_n; END IF;

  RAISE EXCEPTION 'newsletter send test: ALL PASSED (rolled back)';
END$$;
