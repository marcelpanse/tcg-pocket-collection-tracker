-- Apply manually after cards_list.deckbuilding_id has been added and populated.
-- Returns the same rows as public_decks so callers can compose energy filters,
-- ordering, exact counts, and pagination through PostgREST.
CREATE OR REPLACE FUNCTION public.get_buildable_decks()
RETURNS SETOF public.public_decks
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $function$
    WITH owned AS MATERIALIZED (
        SELECT cl.deckbuilding_id, SUM(ca.amount_owned) AS copies
        FROM public.card_amounts ca
        JOIN public.cards_list cl ON cl.internal_id = ca.internal_id
        WHERE ca.email = (SELECT auth.email())
          AND cl.deckbuilding_id IS NOT NULL
        GROUP BY cl.deckbuilding_id
    )
    SELECT d.*
    FROM public.public_decks d
    WHERE (SELECT auth.email()) IS NOT NULL
      AND cardinality(d.cards) > 0
      AND NOT EXISTS (
          SELECT 1
          FROM unnest(d.cards) AS required(internal_id)
          LEFT JOIN public.cards_list cl ON cl.internal_id = required.internal_id
          LEFT JOIN owned ON owned.deckbuilding_id = cl.deckbuilding_id
          GROUP BY cl.deckbuilding_id
          -- Missing catalog entries must not silently remove a requirement.
          HAVING cl.deckbuilding_id IS NULL
              OR COUNT(*) > COALESCE(MAX(owned.copies), 0)
      );
$function$;

REVOKE ALL ON FUNCTION public.get_buildable_decks() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_buildable_decks() TO authenticated;

COMMENT ON FUNCTION public.get_buildable_decks() IS
    'Public decks buildable from the authenticated user''s owned copies, grouped by cards_list.deckbuilding_id.';

NOTIFY pgrst, 'reload schema';
