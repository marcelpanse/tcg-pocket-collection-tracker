WITH recent_accounts AS (
    SELECT email, friend_id, min_number_of_cards_to_keep, max_number_of_cards_wanted
    FROM accounts
    WHERE
        is_active_trading = TRUE
        AND is_public = TRUE
        AND collection_last_updated IS NOT NULL
    ORDER BY collection_last_updated DESC
    LIMIT 50
)
SELECT
    email,
    friend_id,
    SUM(LEAST(num_to_give, num_to_get)) as trade_matches
FROM
    (
        SELECT
            a.email,
            a.friend_id,
            -- t.rarity,
            (to_give.internal_id & 63) as rarity,
            COUNT(*) as num_to_give
        FROM
            (
                SELECT
                    ca.internal_id
                FROM
                    card_amounts ca
                    INNER JOIN trade_rarity_settings t ON t.email = 'g-kwacz@hotmail.com' AND (ca.internal_id & 63) = (
                            CASE
                                WHEN t.rarity = '◊' THEN 0
                                WHEN t.rarity = '◊◊' THEN 1
                                WHEN t.rarity = '◊◊◊' THEN 2
                                WHEN t.rarity = '◊◊◊◊' THEN 3
                                WHEN t.rarity = '☆' THEN 4
                                WHEN t.rarity = '☆☆' THEN 5
                                -- WHEN t.rarity = '☆☆☆' THEN 6
                                WHEN t.rarity = '✵' THEN 8
                                WHEN t.rarity = '✵✵' THEN 9
                                -- WHEN t.rarity = 'Crown Rare' THEN 12
                                -- WHEN t.rarity = 'P' THEN 16
                                ELSE 64
                            END
                        )
                WHERE
                    ca.email = 'g-kwacz@hotmail.com'
                    AND ca.amount_owned > t.to_keep
            ) as to_give
            CROSS JOIN recent_accounts a
            LEFT JOIN card_amounts ca ON ca.email = a.email AND ca.internal_id = to_give.internal_id
            LEFT JOIN trade_rarity_settings t ON ca.email = t.email AND (to_give.internal_id & 63) = (
                    CASE
                        WHEN t.rarity = '◊' THEN 0
                        WHEN t.rarity = '◊◊' THEN 1
                        WHEN t.rarity = '◊◊◊' THEN 2
                        WHEN t.rarity = '◊◊◊◊' THEN 3
                        WHEN t.rarity = '☆' THEN 4
                        WHEN t.rarity = '☆☆' THEN 5
                        -- WHEN t.rarity = '☆☆☆' THEN 6
                        WHEN t.rarity = '✵' THEN 8
                        WHEN t.rarity = '✵✵' THEN 9
                        -- WHEN t.rarity = 'Crown Rare' THEN 12
                        -- WHEN t.rarity = 'P' THEN 16
                        ELSE 64
                    END
                )
            WHERE
                COALESCE(ca.amount_owned, 0) < COALESCE(t.to_collect, a.max_number_of_cards_wanted)
        GROUP BY a.email, a.friend_id, (to_give.internal_id & 63)
    )
    NATURAL JOIN
    (
        SELECT
            a.email,
            a.friend_id,
            -- t.rarity,
            (to_get.internal_id & 63) as rarity,
            COUNT(*) as num_to_get
        FROM
            (
                SELECT
                    cl.internal_id
                FROM
                    cards_list cl
                    LEFT JOIN card_amounts ca ON ca.email = 'g-kwacz@hotmail.com' AND cl.internal_id = ca.internal_id
                    INNER JOIN trade_rarity_settings t ON t.email = 'g-kwacz@hotmail.com' AND (cl.internal_id & 63) = (
                            CASE
                                WHEN t.rarity = '◊' THEN 0
                                WHEN t.rarity = '◊◊' THEN 1
                                WHEN t.rarity = '◊◊◊' THEN 2
                                WHEN t.rarity = '◊◊◊◊' THEN 3
                                WHEN t.rarity = '☆' THEN 4
                                WHEN t.rarity = '☆☆' THEN 5
                                -- WHEN t.rarity = '☆☆☆' THEN 6
                                WHEN t.rarity = '✵' THEN 8
                                WHEN t.rarity = '✵✵' THEN 9
                                -- WHEN t.rarity = 'Crown Rare' THEN 12
                                -- WHEN t.rarity = 'P' THEN 16
                                ELSE 64
                            END
                        )
                WHERE
                    COALESCE(ca.amount_owned, 0) < t.to_collect
            ) as to_get
            CROSS JOIN recent_accounts a
            INNER JOIN card_amounts ca ON ca.email = a.email AND ca.internal_id = to_get.internal_id
            LEFT JOIN trade_rarity_settings t ON ca.email = t.email AND (ca.internal_id & 63) = (
                    CASE
                        WHEN t.rarity = '◊' THEN 0
                        WHEN t.rarity = '◊◊' THEN 1
                        WHEN t.rarity = '◊◊◊' THEN 2
                        WHEN t.rarity = '◊◊◊◊' THEN 3
                        WHEN t.rarity = '☆' THEN 4
                        WHEN t.rarity = '☆☆' THEN 5
                        -- WHEN t.rarity = '☆☆☆' THEN 6
                        WHEN t.rarity = '✵' THEN 8
                        WHEN t.rarity = '✵✵' THEN 9
                        -- WHEN t.rarity = 'Crown Rare' THEN 12
                        -- WHEN t.rarity = 'P' THEN 16
                        ELSE 64
                    END
                )
            WHERE
                ca.amount_owned > COALESCE(t.to_keep, a.min_number_of_cards_to_keep)
        GROUP BY a.email, a.friend_id, (to_get.internal_id & 63)
    )
GROUP BY email, friend_id
ORDER BY trade_matches DESC
;
