EXPLAIN ANALYZE
WITH recent_accounts AS (
    SELECT email, friend_id, username, language
    FROM accounts
    WHERE
        email != $1
      AND is_active_trading = TRUE
      AND is_public = TRUE
      AND collection_last_updated IS NOT NULL
      AND ($2::text IS NULL OR language = $2::text)
    ORDER BY collection_last_updated DESC
    LIMIT 50
)
SELECT
    give.friend_id,
    give.username,
    give.language,
    SUM(LEAST(give.num_to_give, get.num_to_get)) as trade_matches
FROM
    (
        SELECT
            a.friend_id,
            a.username,
            a.language,
            t.rarity_id as rarity,
            COUNT(*) as num_to_give
        FROM
            (
                SELECT
                    ca.internal_id
                FROM
                    card_amounts ca
                        INNER JOIN trade_rarity_settings t ON t.email = $1 AND (ca.internal_id & 63) = t.rarity_id
                WHERE
                    ca.email = $1
                  AND ca.amount_owned > t.to_keep
            ) as to_give
                CROSS JOIN recent_accounts a
                LEFT JOIN card_amounts ca ON ca.email = a.email AND ca.internal_id = to_give.internal_id
                INNER JOIN trade_rarity_settings t ON t.email = a.email AND (to_give.internal_id & 63) = t.rarity_id
        WHERE
            COALESCE(ca.amount_owned, 0) < t.to_collect
        GROUP BY a.friend_id, a.username, a.language, t.rarity_id
    ) give
        JOIN
    (
        SELECT
            a.friend_id,
            a.username,
            a.language,
            t.rarity_id as rarity,
            COUNT(*) as num_to_get
        FROM
            (
                SELECT
                    cl.internal_id
                FROM
                    cards_list cl
                        LEFT JOIN card_amounts ca ON ca.email = $1 AND cl.internal_id = ca.internal_id
                        INNER JOIN trade_rarity_settings t ON t.email = $1 AND (cl.internal_id & 63) = t.rarity_id
                WHERE
                    t.to_collect > 0 AND (ca.amount_owned IS NULL OR ca.amount_owned < t.to_collect)
            ) as to_get
                CROSS JOIN recent_accounts a
                INNER JOIN card_amounts ca ON ca.email = a.email AND ca.internal_id = to_get.internal_id
                INNER JOIN trade_rarity_settings t ON t.email = a.email AND (ca.internal_id & 63) = t.rarity_id
        WHERE
            ca.amount_owned > t.to_keep
        GROUP BY a.friend_id, a.username, a.language, t.rarity_id
    ) get
        ON give.friend_id = get.friend_id
        AND give.rarity = get.rarity
        AND give.language IS NOT DISTINCT FROM get.language
GROUP BY give.friend_id, give.username, give.language
ORDER BY trade_matches DESC;

