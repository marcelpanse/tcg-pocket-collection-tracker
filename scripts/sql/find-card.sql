-- EXPLAIN ANALYZE
WITH recent_accounts AS (
    SELECT a.email, a.friend_id, a.username, t.to_collect
    FROM
        accounts a
        INNER JOIN trade_rarity_settings t ON t.email = a.email AND t.rarity_id = 3
    WHERE
        a.is_active_trading = TRUE
        AND a.is_public = TRUE
        AND a.collection_last_updated IS NOT NULL
        AND EXISTS (
            SELECT internal_id
            FROM card_amounts ca
            WHERE
                ca.email = a.email
                AND ca.internal_id = 792963
                AND ca.amount_owned > t.to_keep
        )
    ORDER BY collection_last_updated DESC
    LIMIT 50
)
SELECT
    a.friend_id,
    a.username,
    COUNT(*) as num_to_give
FROM
    (
        SELECT internal_id
        FROM card_amounts
        WHERE
            email = 'g-kwacz@hotmail.com'
            AND (internal_id & 63) = 3
            AND amount_owned > (
                SELECT to_keep
                FROM trade_rarity_settings
                WHERE email = 'g-kwacz@hotmail.com' AND rarity_id = 3
            )
    ) as to_give
    CROSS JOIN recent_accounts a
    LEFT JOIN card_amounts ca ON ca.email = a.email AND ca.internal_id = to_give.internal_id
WHERE
    COALESCE(ca.amount_owned, 0) < a.to_collect
GROUP BY a.friend_id, a.username
ORDER BY num_to_give DESC
;
