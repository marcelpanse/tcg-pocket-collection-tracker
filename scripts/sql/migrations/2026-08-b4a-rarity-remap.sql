-- B4a rarity correction: remap internal_id for four mislabeled trainers.
--
-- internal_id packs rarity into its low 6 bits (see scripts/encoder.ts):
--     (expansionId << 16) | (cardNr << 6) | rarityId
-- so correcting a rarity necessarily changes the id:
--
--     card_id   old rarity  new rarity   old id     new id
--     B4a-67    ◊           ◊◊           1380544 -> 1380545
--     B4a-68    ◊           ◊◊           1380608 -> 1380609
--     B4a-69    ◊           ◊◊           1380672 -> 1380673
--     B4a-72    ◊◊◊         ◊◊           1380866 -> 1380865
--
-- cards_list needs nothing here: scripts/sql/output/bulk-insert.sql is TRUNCATE + INSERT and fully
-- replaces it. What this script fixes is user data keyed on internal_id, which has no FK to
-- cards_list and therefore degrades silently rather than erroring:
--   * card_amounts  - the real collection table, PK (email, internal_id)
--   * decks.cards   - integer[] of internal_ids
--
--
-- PERFORMANCE — READ THIS BEFORE RUNNING
--
-- card_amounts has millions of rows and EVERY index on it leads with `email`:
--     card_amounts_pkey                         (email, internal_id)
--     idx_card_amounts_email_internal_id_amount (email, internal_id) INCLUDE (amount_owned)
--     idx_card_amounts_email_rarity_id          (email, (internal_id & 63))
-- There is no index on internal_id alone, and Postgres 17 has no index skip scan (PG18 feature).
-- So `WHERE internal_id IN (...)` is a FULL SEQUENTIAL SCAN. Doing that two or three times inside
-- one transaction risks blowing the statement timeout and holding row locks on a live table.
--
-- Part 2 therefore builds a tiny partial index on just these eight ids first, so the remap in
-- Part 3 touches a handful of rows and finishes in milliseconds. Run the parts as SEPARATE batches,
-- in order. Part 3 refuses to run if Part 2 has not taken effect.
--
-- Part 2 uses CREATE INDEX CONCURRENTLY, which cannot run inside a transaction block. The Supabase
-- dashboard SQL editor may wrap statements in one; if it errors with "cannot run inside a
-- transaction block", run Part 2 through psql on a direct connection instead.
--
-- NOTE for anyone editing Part 3: because the helper index is PARTIAL, every statement that reads
-- card_amounts must repeat the literal `internal_id IN (...)` list even where the join already
-- constrains it. Postgres only uses a partial index when the query's WHERE clause provably implies
-- the index predicate, and it cannot infer that through a join to the temp mapping table. Removing
-- those "redundant" predicates silently reintroduces full sequential scans.


-- ===========================================================================
-- PART 1 — Pre-flight. Read-only, safe to run any time.
-- ===========================================================================
-- Blast radius. Note the row counts and amounts so Part 5 can be compared against them.
-- This one DOES seq-scan card_amounts; run it once and accept the cost, or run it after Part 2
-- to get the indexed plan.
SELECT internal_id, count(*) AS rows, sum(amount_owned) AS owned, count(*) FILTER (WHERE collected) AS collected
FROM card_amounts
WHERE internal_id IN (1380544, 1380608, 1380672, 1380866,   -- old
                      1380545, 1380609, 1380673, 1380865)   -- new (expected empty pre-migration)
GROUP BY internal_id
ORDER BY internal_id;

SELECT count(*) AS affected_decks FROM decks WHERE cards && ARRAY[1380544, 1380608, 1380672, 1380866];

-- Confirm the legacy `collection` table really is unused before Part 4 drops it.
SELECT count(*) AS collection_rows FROM public.collection;
SELECT count(*) AS dependent_views
FROM pg_depend d
JOIN pg_rewrite r ON r.oid = d.objid
WHERE d.refobjid = 'public.collection'::regclass;


-- ===========================================================================
-- PART 2 — Helper index. Run on its own, NOT inside a transaction.
-- ===========================================================================
-- Tiny partial index (at most a few thousand rows). CONCURRENTLY means two background scans of
-- card_amounts but no write lock, so live traffic is unaffected. Expect this to take a while on a
-- multi-million-row table; that is fine, nothing is blocked while it runs.
--
-- Simpler alternative if a brief write-block is acceptable: drop the CONCURRENTLY keyword and move
-- this statement inside Part 3's transaction. It then takes a SHARE lock on card_amounts for the
-- duration of one scan, blocking writes but not reads.
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_card_amounts_b4a_remap
  ON public.card_amounts (internal_id)
  WHERE internal_id IN (1380544, 1380608, 1380672, 1380866,
                        1380545, 1380609, 1380673, 1380865);

-- Verify it is valid. A failed CONCURRENTLY build leaves an INVALID index behind, which the planner
-- ignores -- you would silently fall back to seq scans. If indisvalid is false, DROP it and retry.
SELECT c.relname, i.indisvalid
FROM pg_index i JOIN pg_class c ON c.oid = i.indexrelid
WHERE c.relname = 'idx_card_amounts_b4a_remap';

ANALYZE public.card_amounts;


-- ===========================================================================
-- PART 3 — The remap. One short transaction, index-driven.
-- ===========================================================================
BEGIN;

-- Fail fast rather than queueing behind a long-running query and blocking writers behind us.
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '5min';

CREATE TEMP TABLE b4a_remap(old_id int PRIMARY KEY, new_id int NOT NULL) ON COMMIT DROP;
INSERT INTO b4a_remap VALUES
  (1380544, 1380545), -- B4a-67 ◊   -> ◊◊
  (1380608, 1380609), -- B4a-68 ◊   -> ◊◊
  (1380672, 1380673), -- B4a-69 ◊   -> ◊◊
  (1380866, 1380865); -- B4a-72 ◊◊◊ -> ◊◊

-- Hard gate: the whole point of Part 2 is that the writes below are index-driven. If the index is
-- missing or was left INVALID by a failed CONCURRENTLY build, abort rather than silently seq-scanning
-- a multi-million-row table three times.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_index i
    JOIN pg_class c ON c.oid = i.indexrelid
    WHERE c.relname = 'idx_card_amounts_b4a_remap' AND i.indisvalid
  ) THEN
    RAISE EXCEPTION 'idx_card_amounts_b4a_remap is missing or invalid -- run Part 2 first';
  END IF;
END $$;

-- Optional: confirm the plan really is an Index Scan on idx_card_amounts_b4a_remap.
EXPLAIN (COSTS OFF)
SELECT ca.email FROM card_amounts ca
JOIN b4a_remap r ON r.old_id = ca.internal_id
WHERE ca.internal_id IN (1380544, 1380608, 1380672, 1380866);

-- 1. Merge each old row into its new id. Not a plain UPDATE: a row at the new id may already exist
-- (a client on a preview build, or one re-syncing mid-deploy), which would raise a PK conflict.
-- GREATEST rather than SUM on amount_owned, because a collision means the same physical card
-- recorded under two encodings, not two owned copies -- and GREATEST cannot overflow
-- `amount_owned smallint` or trip chk_amount_nonnegative.
--
-- The `internal_id IN (...)` predicate below is REDUNDANT with the join -- do not "simplify" it
-- away. idx_card_amounts_b4a_remap is a PARTIAL index, and Postgres only uses a partial index when
-- the query's own WHERE clause provably implies the index predicate. It cannot see through the
-- temp-table join, so without these literals the planner falls back to a full sequential scan.
INSERT INTO card_amounts (email, internal_id, amount_owned, amount_wanted, collected, created_at, updated_at)
SELECT ca.email, r.new_id, ca.amount_owned, ca.amount_wanted, ca.collected, ca.created_at, now()
FROM card_amounts ca
JOIN b4a_remap r ON r.old_id = ca.internal_id
WHERE ca.internal_id IN (1380544, 1380608, 1380672, 1380866)
ON CONFLICT (email, internal_id) DO UPDATE SET
  amount_owned  = GREATEST(card_amounts.amount_owned, EXCLUDED.amount_owned),
  amount_wanted = GREATEST(COALESCE(card_amounts.amount_wanted, 0), COALESCE(EXCLUDED.amount_wanted, 0)),
  collected     = card_amounts.collected OR EXCLUDED.collected,
  updated_at    = now();

-- 2. Drop the now-orphaned rows at the old ids. Same redundant-predicate rule as above.
DELETE FROM card_amounts ca
USING b4a_remap r
WHERE ca.internal_id = r.old_id
  AND ca.internal_id IN (1380544, 1380608, 1380672, 1380866);

-- 3. Rewrite decks.cards element-wise, preserving order and duplicates.
-- decks has no index on `cards`, so the && filter seq-scans decks -- acceptable, decks is small
-- relative to card_amounts. Add a GIN index on cards first if that ever stops being true.
UPDATE decks d
SET cards = sub.cards, updated_at = now()
FROM (
  SELECT d2.id, array_agg(COALESCE(r.new_id, e.val) ORDER BY e.ord) AS cards
  FROM decks d2
  CROSS JOIN LATERAL unnest(d2.cards) WITH ORDINALITY AS e(val, ord)
  LEFT JOIN b4a_remap r ON r.old_id = e.val
  WHERE d2.cards && ARRAY[1380544, 1380608, 1380672, 1380866]
  GROUP BY d2.id
) sub
WHERE d.id = sub.id;

-- 4. Assert, rather than SELECT-and-eyeball: pasted as one batch this whole part runs straight
-- through, so a plain SELECT would report a problem only after COMMIT had already happened.
-- RAISE aborts the transaction instead.
DO $$
DECLARE
  stale_amounts bigint;
  stale_decks   bigint;
BEGIN
  SELECT count(*) INTO stale_amounts FROM card_amounts WHERE internal_id IN (1380544, 1380608, 1380672, 1380866);
  SELECT count(*) INTO stale_decks   FROM decks        WHERE cards && ARRAY[1380544, 1380608, 1380672, 1380866];

  IF stale_amounts <> 0 OR stale_decks <> 0 THEN
    RAISE EXCEPTION 'B4a remap incomplete: % card_amounts rows and % decks still hold old internal_ids',
      stale_amounts, stale_decks;
  END IF;

  RAISE NOTICE 'B4a remap OK: no old internal_ids remain in card_amounts or decks.';
END $$;

COMMIT;


-- ===========================================================================
-- PART 4 — Cleanup. Run after Part 3 has committed successfully.
-- ===========================================================================
BEGIN;

SET LOCAL lock_timeout = '5s';

-- The legacy `collection` table is dead: nothing in frontend/src or supabase/ reads or writes it,
-- and no view depends on it (verified in Part 1). Its FK (internal_id, email) -> card_amounts has
-- no ON UPDATE CASCADE, which is why the remap above had to insert-then-delete rather than UPDATE.
-- Uncomment the backup first if Part 1 showed a non-trivial row count and you want an escape hatch.
-- CREATE TABLE public.collection_backup_20260830 AS SELECT * FROM public.collection;
DROP TABLE IF EXISTS public.collection;

COMMIT;

-- Helper index is no longer needed. CONCURRENTLY so it does not lock; cannot be in a transaction.
DROP INDEX CONCURRENTLY IF EXISTS public.idx_card_amounts_b4a_remap;


-- ===========================================================================
-- PART 5 — Post-checks. Read-only.
-- ===========================================================================
-- Run BEFORE dropping the helper index if you want these to be fast.
--
--   -- Rows should now sit at the new ids, with counts/amounts matching Part 1's old-id figures.
--   SELECT internal_id, count(*) AS rows, sum(amount_owned) AS owned
--   FROM card_amounts
--   WHERE internal_id IN (1380545, 1380609, 1380673, 1380865)
--   GROUP BY internal_id ORDER BY internal_id;
--
--   SELECT to_regclass('public.collection');   -- expect NULL
--
-- Informational only, and expensive (no supporting index): counts card_amounts rows with no
-- matching cards_list entry. Expected to be non-zero -- the earlier B4 re-encoding (PR #999) was
-- never remapped, so those orphans predate this migration. Run bulk-insert.sql first, or this
-- over-reports. Consider running it off-peak.
--
--   SELECT ca.internal_id, count(*)
--   FROM card_amounts ca
--   LEFT JOIN cards_list cl ON cl.internal_id = ca.internal_id
--   WHERE cl.internal_id IS NULL
--   GROUP BY 1 ORDER BY 2 DESC LIMIT 50;
