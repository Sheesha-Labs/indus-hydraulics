-- DB test for the newsletter suppression trigger (202611081838).
--
-- Safe against production: everything runs in one DO block that ends by
-- raising, so every write is rolled back. Success is the final exception
-- message 'newsletter suppression test: ALL PASSED (rolled back)'; any other
-- exception names the assertion that failed.
--
--   pnpm --filter @indus/db exec prisma db execute --file scripts/test-newsletter-suppression.sql
--   (or paste into the Supabase SQL editor / MCP execute_sql)
--
-- Uses status 'pending'/'confirmed', so it needs the enum values committed
-- (part 1 applied).

DO $$
DECLARE
  v_email TEXT := 'suppression-test-' || md5(random()::text) || '@example.invalid';
  v_id    TEXT := gen_random_uuid()::text;
  v_hash  TEXT;
  v_n     INT;
  v_r     TEXT;
BEGIN
  v_hash := public.newsletter_email_hash(v_email);

  -- Hash matches the app's sha256(lower(trim(email))).
  IF public.newsletter_email_hash('  ' || upper(v_email) || ' ') <> v_hash THEN
    RAISE EXCEPTION 'FAIL: hash is not case/space-insensitive';
  END IF;
  IF v_hash !~ '^[0-9a-f]{64}$' THEN RAISE EXCEPTION 'FAIL: hash shape'; END IF;

  -- 1. A pending insert suppresses nothing.
  INSERT INTO newsletter_subscribers (id, email, status, "updatedAt")
  VALUES (v_id, v_email, 'pending', now());
  SELECT count(*) INTO v_n FROM newsletter_suppressions WHERE "emailHash" = v_hash;
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL 1: pending insert suppressed'; END IF;

  -- The default unsubscribe token has the 48-hex shape.
  PERFORM 1 FROM newsletter_subscribers WHERE id = v_id AND "unsubscribeToken" ~ '^[0-9a-f]{48}$';
  IF NOT FOUND THEN RAISE EXCEPTION 'FAIL: default unsubscribe token shape'; END IF;

  -- 2. Confirmed → no suppression.
  UPDATE newsletter_subscribers SET status = 'confirmed' WHERE id = v_id;
  SELECT count(*) INTO v_n FROM newsletter_suppressions WHERE "emailHash" = v_hash;
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL 2: confirmed suppressed'; END IF;

  -- 3. Unsubscribed → suppressed as unsubscribed.
  UPDATE newsletter_subscribers SET status = 'unsubscribed' WHERE id = v_id;
  SELECT reason INTO v_r FROM newsletter_suppressions WHERE "emailHash" = v_hash;
  IF v_r IS DISTINCT FROM 'unsubscribed' THEN RAISE EXCEPTION 'FAIL 3: got %', v_r; END IF;

  -- 4. Re-subscribe to pending keeps the suppression until confirmed.
  UPDATE newsletter_subscribers SET status = 'pending' WHERE id = v_id;
  SELECT count(*) INTO v_n FROM newsletter_suppressions WHERE "emailHash" = v_hash;
  IF v_n <> 1 THEN RAISE EXCEPTION 'FAIL 4: pending lifted suppression'; END IF;

  -- 5. Confirming again lifts it.
  UPDATE newsletter_subscribers SET status = 'confirmed' WHERE id = v_id;
  SELECT count(*) INTO v_n FROM newsletter_suppressions WHERE "emailHash" = v_hash;
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL 5: confirm did not lift'; END IF;

  -- 6. A complaint row written first survives the trigger (webhook order).
  INSERT INTO newsletter_suppressions ("emailHash", reason) VALUES (v_hash, 'complained');
  UPDATE newsletter_subscribers SET status = 'unsubscribed' WHERE id = v_id;
  SELECT reason INTO v_r FROM newsletter_suppressions WHERE "emailHash" = v_hash;
  IF v_r IS DISTINCT FROM 'complained' THEN RAISE EXCEPTION 'FAIL 6: got %', v_r; END IF;

  -- 7. Bounced from a fresh row → suppressed as bounced.
  DELETE FROM newsletter_suppressions WHERE "emailHash" = v_hash;
  UPDATE newsletter_subscribers SET status = 'confirmed' WHERE id = v_id;
  UPDATE newsletter_subscribers SET status = 'bounced' WHERE id = v_id;
  SELECT reason INTO v_r FROM newsletter_suppressions WHERE "emailHash" = v_hash;
  IF v_r IS DISTINCT FROM 'bounced' THEN RAISE EXCEPTION 'FAIL 7: got %', v_r; END IF;

  -- 8. An unrelated column update does not fire it.
  DELETE FROM newsletter_suppressions WHERE "emailHash" = v_hash;
  UPDATE newsletter_subscribers SET source = 'other' WHERE id = v_id;
  SELECT count(*) INTO v_n FROM newsletter_suppressions WHERE "emailHash" = v_hash;
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL 8: non-status update fired'; END IF;

  RAISE EXCEPTION 'newsletter suppression test: ALL PASSED (rolled back)';
END$$;
