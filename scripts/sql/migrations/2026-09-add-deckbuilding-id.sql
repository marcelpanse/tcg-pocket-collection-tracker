-- Adds cards_list.deckbuilding_id: the canonical internal_id of a card's deckbuilding group.
--
-- The column is NOT NULL, but cards_list is already populated and there is no sensible default, so
-- the constraint can only go on after the rows have a value. Apply in this order:
--   1. this file, up to and including the ADD COLUMN
--   2. scripts/sql/output/bulk-insert.sql (regenerate with `pnpm scraper` first) -- TRUNCATEs and
--      refills cards_list, populating deckbuilding_id
--   3. the SET NOT NULL at the bottom of this file
ALTER TABLE public.cards_list
    ADD COLUMN IF NOT EXISTS deckbuilding_id integer;

COMMENT ON COLUMN public.cards_list.deckbuilding_id IS
    'Canonical internal_id shared by card variants that are interchangeable for deckbuilding.';

-- Step 3: only after bulk-insert.sql has run.
ALTER TABLE public.cards_list
    ALTER COLUMN deckbuilding_id SET NOT NULL;
