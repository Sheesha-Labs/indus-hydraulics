#!/usr/bin/env bash
# One-shot migration: dumps local Postgres → restores into Supabase.
# Safe by design: read-only on local DB; restores with --clean --if-exists so re-runs are idempotent.

set -euo pipefail

LOCAL_URL="postgresql://medusa:medusa@host.docker.internal:5432/indus_hydraulics"
SUPABASE_URL="postgresql://postgres.hesezbozronntejnsopr:makeit2Stanford%26@aws-0-ap-south-1.pooler.supabase.com:5432/postgres"
DUMP_FILE="/tmp/indus_dump_$(date +%Y%m%d_%H%M%S).sql"

echo "▸ 1/4  Verifying Supabase connection…"
docker run --rm postgres:16 psql "$SUPABASE_URL" -c "SELECT now() AS connected_at;" >/dev/null
echo "  ✓ Supabase reachable."

echo "▸ 2/4  Dumping local DB to $DUMP_FILE …"
docker run --rm postgres:16 pg_dump "$LOCAL_URL" \
  --schema=public \
  --no-owner \
  --no-acl \
  --clean \
  --if-exists \
  --quote-all-identifiers \
  > "$DUMP_FILE"
DUMP_SIZE=$(wc -c < "$DUMP_FILE" | tr -d ' ')
echo "  ✓ Dumped $DUMP_SIZE bytes."

echo "▸ 3/4  Restoring into Supabase…"
docker run --rm -i postgres:16 psql "$SUPABASE_URL" \
  --set ON_ERROR_STOP=1 \
  --quiet \
  < "$DUMP_FILE" \
  2>&1 | grep -vE 'NOTICE|already exists, skipping' || true
echo "  ✓ Restore complete."

echo "▸ 4/4  Sanity-checking row counts…"
docker run --rm postgres:16 psql "$SUPABASE_URL" -At <<'SQL'
SELECT 'products: ' || count(*) FROM products
UNION ALL SELECT 'categories: ' || count(*) FROM categories
UNION ALL SELECT 'brands: ' || count(*) FROM brands
UNION ALL SELECT 'staff_users: ' || count(*) FROM staff_users
UNION ALL SELECT 'accounts: ' || count(*) FROM accounts
UNION ALL SELECT 'rfqs: ' || count(*) FROM rfqs
UNION ALL SELECT 'product_questions: ' || count(*) FROM product_questions;
SQL

echo ""
echo "✅ Migration done. Dump kept at $DUMP_FILE (delete when satisfied)."
echo "   Next: restart both dev servers so they pick up the new DATABASE_URL."
