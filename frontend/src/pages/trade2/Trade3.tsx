import { allCardsDict } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { UserContext } from '@/lib/context/UserContext'
import type { TradeRow } from '@/types'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CardList from './CardList'
import { Button } from '@/components/ui/button'

function groupTrades(arr: TradeRow[], id: string) {
  return Object.groupBy(arr, (row) => {
    if (row.from === id) return row.to
    if (row.to === id) return row.from
    return 'undefined'
  })
}

function TradePropositions() {
  const { t } = useTranslation('trade-matches')

  const { account } = useContext(UserContext)
  const { ownedCards } = useContext(CollectionContext)

  const [trades, setTrades] = useState<TradeRow[] | null>(null)

  const [tradeProposition1, setTradeProposition1] = useState<string[]>([])
  const [tradeProposition2, setTradeProposition2] = useState<string[]>([])
  const propositionLength = tradeProposition1.length + tradeProposition2.length

  useEffect(() => {
    if (account && trades === null) {
      setTrades([
        { from: account.friend_id, to: '123', card_id: 'A1-1' },
        { from: account.friend_id, to: '123', card_id: 'A1-2' },
        { from: '123', to: account.friend_id, card_id: 'A1-3' },
        { from: account.friend_id, to: '456', card_id: 'A1-11' },
        { from: '456', to: account.friend_id, card_id: 'A1-12' },
        { from: '456', to: account.friend_id, card_id: 'A1-13' },
        { from: '789', to: account.friend_id, card_id: 'A1-21' },
      ])
    }
  })

  if (trades === null || !account) return <div>Loading: {JSON.stringify(account)}</div>

  const friends = groupTrades(trades, account.friend_id)

  return (
    <div>
      <Button type="button" onClick={alert} disabled={propositionLength === 0}>
        Remove {propositionLength} propositions
      </Button>
      {Object.keys(friends).map((friend_id) => (
        <div key={friend_id}>
          <p>Trading with {friend_id}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-md font-medium mb-2">{t('friendHas')}</h4>
              <CardList
                cards={friends[friend_id]
                  .filter((row: TradeRow) => row.from === account.friend_id)
                  .map((row) => allCardsDict.get(row.card_id))
                  .filter((c) => !!c)}
                ownedCards={ownedCards}
                tradeProposition={tradeProposition1}
                setTradeProposition={setTradeProposition1}
                selectionColor="red"
              />
            </div>
            <div>
              <h4 className="text-md font-medium mb-2">{t('youHave')}</h4>
              <CardList
                cards={friends[friend_id]
                  .filter((row: TradeRow) => row.to === account.friend_id)
                  .map((row) => allCardsDict.get(row.card_id))
                  .filter((c) => !!c)}
                ownedCards={ownedCards}
                tradeProposition={tradeProposition2}
                setTradeProposition={setTradeProposition2}
                selectionColor="red"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default TradePropositions
