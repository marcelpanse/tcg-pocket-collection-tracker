-- All matches
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
                  AND ca.amount_owned > COALESCE(ca.amount_wanted, t.to_keep)
            ) as to_give
                CROSS JOIN recent_accounts a
                LEFT JOIN card_amounts ca ON ca.email = a.email AND ca.internal_id = to_give.internal_id
                INNER JOIN trade_rarity_settings t ON t.email = a.email AND (to_give.internal_id & 63) = t.rarity_id
        WHERE
            COALESCE(ca.amount_owned, 0) < COALESCE(ca.amount_wanted, t.to_collect)
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
                    COALESCE(ca.amount_owned, 0) < COALESCE(ca.amount_wanted, t.to_collect)
            ) as to_get
                CROSS JOIN recent_accounts a
                INNER JOIN card_amounts ca ON ca.email = a.email AND ca.internal_id = to_get.internal_id
                INNER JOIN trade_rarity_settings t ON t.email = a.email AND (ca.internal_id & 63) = t.rarity_id
        WHERE
            ca.amount_owned > COALESCE(ca.amount_wanted, t.to_keep)
        GROUP BY a.friend_id, a.username, a.language, t.rarity_id
    ) get
        ON give.friend_id = get.friend_id
        AND give.rarity = get.rarity
        AND give.language IS NOT DISTINCT FROM get.language
GROUP BY give.friend_id, give.username, give.language
ORDER BY trade_matches DESC;

-- Single card
WITH recent_accounts AS (
    SELECT a.email, a.friend_id, a.username, a.language, t.to_collect
    FROM
        accounts a
        INNER JOIN trade_rarity_settings t ON t.email = a.email AND t.rarity_id = ($2::int & 63)
    WHERE
        a.email != $1
        AND a.is_active_trading = TRUE
        AND a.is_public = TRUE
        AND a.collection_last_updated IS NOT NULL
        AND EXISTS (
            SELECT internal_id
            FROM card_amounts ca
            WHERE
                ca.email = a.email
                AND ca.internal_id = $2::int
                AND ca.amount_owned > COALESCE(ca.amount_wanted, t.to_keep)
        )
        AND ($3::text IS NULL OR language = $3::text)
    ORDER BY collection_last_updated DESC
    LIMIT 50
)
SELECT
    a.friend_id,
    a.username,
    a.language,
    COUNT(*) as trade_matches
FROM
    (
        SELECT internal_id
        FROM card_amounts
        WHERE
            email = $1
            AND (internal_id & 63) = ($2::int & 63)
            AND amount_owned > COALESCE(
                amount_wanted,
                (
                    SELECT to_keep
                    FROM trade_rarity_settings
                    WHERE email = $1 AND rarity_id = ($2::int & 63)
                )
            )
    ) as to_give
    CROSS JOIN recent_accounts a
    LEFT JOIN card_amounts ca ON ca.email = a.email AND ca.internal_id = to_give.internal_id
WHERE
    COALESCE(ca.amount_owned, 0) < a.to_collect
GROUP BY a.friend_id, a.username, a.language
ORDER BY trade_matches DESC;
