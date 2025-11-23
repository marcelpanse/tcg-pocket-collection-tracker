EXPLAIN ANALYZE
WITH recent_accounts AS (
    SELECT email, friend_id, username
    FROM accounts
    WHERE
        is_active_trading = TRUE
      AND is_public = TRUE
      AND collection_last_updated IS NOT NULL
    ORDER BY collection_last_updated DESC
    LIMIT 50
)
SELECT
    friend_id,
    username,
    SUM(LEAST(num_to_give, num_to_get)) as trade_matches
FROM
    (
        SELECT
            a.friend_id,
            a.username,
            t.rarity_id,
            COUNT(*) as num_to_give
        FROM
            (
                SELECT
                    ca.internal_id
                FROM
                    card_amounts ca
                        INNER JOIN trade_rarity_settings t ON t.email = 'tcg@example.com' AND (ca.internal_id & 63) = t.rarity_id
                WHERE
                    ca.email = 'tcg@example.com'
                  AND ca.amount_owned > t.to_keep
            ) as to_give
                CROSS JOIN recent_accounts a
                LEFT JOIN card_amounts ca ON ca.email = a.email AND ca.internal_id = to_give.internal_id
                INNER JOIN trade_rarity_settings t ON t.email = a.email AND (to_give.internal_id & 63) = t.rarity_id
        WHERE
            COALESCE(ca.amount_owned, 0) < t.to_collect
        GROUP BY a.friend_id, username, t.rarity_id
    )
        NATURAL JOIN
    (
        SELECT
            a.friend_id,
            a.username,
            t.rarity_id,
            COUNT(*) as num_to_get
        FROM
            (
                SELECT
                    cl.internal_id
                FROM
                    cards_list cl
                        LEFT JOIN card_amounts ca ON ca.email = 'tcg@example.com' AND cl.internal_id = ca.internal_id
                        INNER JOIN trade_rarity_settings t ON t.email = 'tcg@example.com' AND (cl.internal_id & 63) = t.rarity_id
                WHERE
                    t.to_collect > 0 AND (ca.amount_owned IS NULL OR ca.amount_owned < t.to_collect)
            ) as to_get
                CROSS JOIN recent_accounts a
                INNER JOIN card_amounts ca ON ca.email = a.email AND ca.internal_id = to_get.internal_id
                INNER JOIN trade_rarity_settings t ON t.email = a.email AND (ca.internal_id & 63) = t.rarity_id
        WHERE
            ca.amount_owned > t.to_keep
        GROUP BY a.friend_id, username, t.rarity_id
    )
GROUP BY friend_id, username
ORDER BY trade_matches DESC
;
