ALTER TABLE public.cards_list
    ADD COLUMN IF NOT EXISTS deckbuilding_id integer NOT NULL;

COMMENT ON COLUMN public.cards_list.deckbuilding_id IS
    'Canonical internal_id shared by card variants that are interchangeable for deckbuilding.';
