

-- run this to migrate all data to the internal card counts

UPDATE collection c
SET internal_id = cl.internal_id
FROM cards_list cl
WHERE c.card_id = cl.card_id
  AND c.internal_id IS NULL
  AND c.ctid IN (
    SELECT c2.ctid
    FROM collection c2
    WHERE c2.internal_id IS NULL
    LIMIT 50000
);

INSERT INTO card_amounts (internal_id, email, amount_owned, created_at, updated_at)
SELECT
    cl.internal_id as internal_id,
    c.email,
    SUM(c.amount_owned) as amount_owned,
    MIN(COALESCE(c.created_at, NOW())) as created_at,
    MAX(COALESCE(c.updated_at, NOW())) as updated_at
FROM collection c
         INNER JOIN cards_list cl ON c.card_id = cl.card_id
GROUP BY cl.internal_id, c.email
ON CONFLICT (internal_id, email) DO UPDATE SET amount_owned = EXCLUDED.amount_owned;
