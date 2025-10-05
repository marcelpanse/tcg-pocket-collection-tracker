
create table public.collection (
                                   email character varying not null,
                                   card_id character varying not null,
                                   created_at timestamp with time zone null default now(),
                                   amount_owned smallint null default '0'::smallint,
                                   updated_at timestamp with time zone not null default now(),
                                   internal_id character varying null,
                                   constraint collection_pkey primary key (email, card_id)
) TABLESPACE pg_default;

create table public.card_amounts (
                                     id character varying not null default '8'::character varying,
                                     created_at timestamp with time zone not null default now(),
                                     amount_owned smallint not null default '0'::smallint,
                                     email character varying not null,
                                     updated_at timestamp without time zone not null default now(),
                                     constraint card_amounts_pkey primary key (id, email)
) TABLESPACE pg_default;

INSERT INTO public.card_amounts (id, email, amount_owned, created_at, updated_at)
SELECT
    MD5(card_id) as id,
    email,
    amount_owned,
    COALESCE(created_at, NOW()) as created_at,
    COALESCE(updated_at, NOW()) as updated_at
FROM public.collection
WHERE email = 'marcel.panse@gmail.com'
ON CONFLICT (id, email) DO UPDATE
    SET
        amount_owned = EXCLUDED.amount_owned,
        updated_at = EXCLUDED.updated_at;

UPDATE public.collection
SET internal_id = MD5(card_id)
WHERE email = 'marcel.panse@gmail.com';
