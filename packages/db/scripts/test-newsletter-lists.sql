-- DB test for the newsletter list triggers (202611091422).
--
-- Safe against production: one DO block that ends by raising, so every write
-- is rolled back. Success is the final exception message
-- 'newsletter lists test: ALL PASSED (rolled back)'; any other exception
-- names the assertion that failed.
--
--   pnpm --filter @indus/db exec prisma db execute --file scripts/test-newsletter-lists.sql
--   (or paste into the Supabase SQL editor / MCP execute_sql)

DO $$
DECLARE
  v_email TEXT := 'lists-test-' || md5(random()::text) || '@example.invalid';
  v_other TEXT := 'lists-other-' || md5(random()::text) || '@example.invalid';
  v_l1    TEXT;
  v_l2    TEXT;
  v_c1    TEXT;
  v_c2    TEXT;
  v_sub   TEXT := gen_random_uuid()::text;
  v_n     INT;
  v_r     TEXT;
  v_s     TEXT;
BEGIN
  INSERT INTO newsletter_lists (name) VALUES ('lists test A') RETURNING id INTO v_l1;
  INSERT INTO newsletter_lists (name) VALUES ('lists test B') RETURNING id INTO v_l2;

  -- 0. Shape checks: lower-case only, unique per list, token default.
  BEGIN
    INSERT INTO newsletter_list_contacts ("listId", email) VALUES (v_l1, upper(v_email));
    RAISE EXCEPTION 'FAIL 0a: upper-case address accepted';
  EXCEPTION WHEN check_violation THEN NULL;
  END;
  INSERT INTO newsletter_list_contacts ("listId", email) VALUES (v_l1, v_email) RETURNING id INTO v_c1;
  BEGIN
    INSERT INTO newsletter_list_contacts ("listId", email) VALUES (v_l1, v_email);
    RAISE EXCEPTION 'FAIL 0b: duplicate on one list accepted';
  EXCEPTION WHEN unique_violation THEN NULL;
  END;
  PERFORM 1 FROM newsletter_list_contacts WHERE id = v_c1 AND "unsubscribeToken" ~ '^[0-9a-f]{48}$' AND status = 'active';
  IF NOT FOUND THEN RAISE EXCEPTION 'FAIL 0c: default token / status'; END IF;

  -- 1. An active insert suppresses nothing.
  SELECT count(*) INTO v_n FROM newsletter_suppressions WHERE "emailHash" = newsletter_email_hash(v_email);
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL 1: active insert suppressed'; END IF;

  -- 2. Same address on a second list and subscribed.
  INSERT INTO newsletter_list_contacts ("listId", email) VALUES (v_l2, v_email) RETURNING id INTO v_c2;
  INSERT INTO newsletter_subscribers (id, email, status, "updatedAt") VALUES (v_sub, v_email, 'confirmed', now());

  -- 3. Unsubscribing on list A: suppressed, list B row and the subscription follow.
  UPDATE newsletter_list_contacts SET status = 'unsubscribed' WHERE id = v_c1;
  SELECT reason INTO v_r FROM newsletter_suppressions WHERE "emailHash" = newsletter_email_hash(v_email);
  IF v_r IS DISTINCT FROM 'unsubscribed' THEN RAISE EXCEPTION 'FAIL 3a: suppression %', v_r; END IF;
  SELECT status::text INTO v_s FROM newsletter_list_contacts WHERE id = v_c2;
  IF v_s <> 'unsubscribed' THEN RAISE EXCEPTION 'FAIL 3b: other list row %', v_s; END IF;
  SELECT status::text INTO v_s FROM newsletter_subscribers WHERE id = v_sub;
  IF v_s <> 'unsubscribed' THEN RAISE EXCEPTION 'FAIL 3c: subscription %', v_s; END IF;
  PERFORM 1 FROM newsletter_subscribers WHERE id = v_sub AND "unsubscribedAt" IS NOT NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'FAIL 3d: unsubscribedAt not set'; END IF;

  -- 4. Confirming again lifts the suppression but does NOT reactivate list rows.
  UPDATE newsletter_subscribers SET status = 'confirmed' WHERE id = v_sub;
  SELECT count(*) INTO v_n FROM newsletter_suppressions WHERE "emailHash" = newsletter_email_hash(v_email);
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL 4a: confirm did not lift'; END IF;
  SELECT count(*) INTO v_n FROM newsletter_list_contacts WHERE email = v_email AND status = 'active';
  IF v_n <> 0 THEN RAISE EXCEPTION 'FAIL 4b: list rows reactivated'; END IF;

  -- 5. Subscriber bounce marks an ACTIVE list row bounced.
  INSERT INTO newsletter_list_contacts ("listId", email) VALUES (v_l1, v_other) RETURNING id INTO v_c1;
  INSERT INTO newsletter_subscribers (id, email, status, "updatedAt")
  VALUES (gen_random_uuid()::text, upper(v_other), 'confirmed', now());
  UPDATE newsletter_subscribers SET status = 'bounced' WHERE lower(email) = v_other;
  SELECT status::text INTO v_s FROM newsletter_list_contacts WHERE id = v_c1;
  IF v_s <> 'bounced' THEN RAISE EXCEPTION 'FAIL 5a: list row %', v_s; END IF;
  SELECT reason INTO v_r FROM newsletter_suppressions WHERE "emailHash" = newsletter_email_hash(v_other);
  IF v_r IS DISTINCT FROM 'bounced' THEN RAISE EXCEPTION 'FAIL 5b: suppression %', v_r; END IF;

  -- 6. A list-row bounce sets the subscriber's bouncedAt, not unsubscribedAt.
  DELETE FROM newsletter_subscribers WHERE lower(email) = v_other;
  DELETE FROM newsletter_suppressions WHERE "emailHash" = newsletter_email_hash(v_other);
  UPDATE newsletter_list_contacts SET status = 'active', "unsubscribedAt" = NULL WHERE id = v_c1;
  INSERT INTO newsletter_subscribers (id, email, status, "updatedAt") VALUES (gen_random_uuid()::text, v_other, 'pending', now());
  UPDATE newsletter_list_contacts SET status = 'bounced' WHERE id = v_c1;
  PERFORM 1 FROM newsletter_subscribers WHERE email = v_other AND status = 'bounced' AND "bouncedAt" IS NOT NULL AND "unsubscribedAt" IS NULL;
  IF NOT FOUND THEN RAISE EXCEPTION 'FAIL 6: subscriber not bounced cleanly'; END IF;

  -- 7. A complaint written first keeps its reason (webhook order).
  DELETE FROM newsletter_suppressions WHERE "emailHash" = newsletter_email_hash(v_email);
  UPDATE newsletter_list_contacts SET status = 'active' WHERE email = v_email;
  INSERT INTO newsletter_suppressions ("emailHash", reason) VALUES (newsletter_email_hash(v_email), 'complained');
  UPDATE newsletter_list_contacts SET status = 'unsubscribed' WHERE id = v_c2;
  SELECT reason INTO v_r FROM newsletter_suppressions WHERE "emailHash" = newsletter_email_hash(v_email);
  IF v_r IS DISTINCT FROM 'complained' THEN RAISE EXCEPTION 'FAIL 7: got %', v_r; END IF;

  -- 8. Deleting a list deletes its rows and its imports, never a suppression.
  INSERT INTO newsletter_list_imports ("listId", "consentText") VALUES (v_l2, 'test');
  SELECT count(*) INTO v_n FROM newsletter_suppressions WHERE "emailHash" IN (newsletter_email_hash(v_email), newsletter_email_hash(v_other));
  DELETE FROM newsletter_lists WHERE id IN (v_l1, v_l2);
  PERFORM 1 FROM newsletter_list_contacts WHERE "listId" IN (v_l1, v_l2);
  IF FOUND THEN RAISE EXCEPTION 'FAIL 8a: rows survived the list'; END IF;
  PERFORM 1 FROM newsletter_list_imports WHERE "listId" IN (v_l1, v_l2);
  IF FOUND THEN RAISE EXCEPTION 'FAIL 8b: imports survived the list'; END IF;
  IF (SELECT count(*) FROM newsletter_suppressions WHERE "emailHash" IN (newsletter_email_hash(v_email), newsletter_email_hash(v_other))) <> v_n THEN
    RAISE EXCEPTION 'FAIL 8c: suppressions changed';
  END IF;

  RAISE EXCEPTION 'newsletter lists test: ALL PASSED (rolled back)';
END$$;
