import { BatchUpdateDialog } from '@/components/BatchUpdateDialog'
import { updateMultipleCards } from '@/components/Card.tsx'
import { CardsTable } from '@/components/CardsTable.tsx'
import ExpansionsFilter from '@/components/ExpansionsFilter.tsx'
import { FriendTradeDialog } from '@/components/FriendTradeDialog'
import OwnedFilter from '@/components/OwnedFilter.tsx'
import RarityFilter from '@/components/RarityFilter.tsx'
import SearchInput from '@/components/SearchInput.tsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { allCards } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import { fetchCollection } from '@/lib/fetchCollection.ts'
import CardDetail from '@/pages/collection/CardDetail.tsx'
import type { Card, CollectionRow, Rarity } from '@/types'
import { Siren } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router'

function Collection() {
  const params = useParams()
  const { t } = useTranslation(['pages/collection'])

  const { user } = useContext(UserContext)
  const { ownedCards, setOwnedCards, selectedCardId, setSelectedCardId } = useContext(CollectionContext)
  const [searchValue, setSearchValue] = useState('')
  const [expansionFilter, setExpansionFilter] = useState<string>('all')
  const [rarityFilter, setRarityFilter] = useState<Rarity[]>([])
  const [ownedFilter, setOwnedFilter] = useState<'all' | 'owned' | 'missing'>('all')
  const [resetScrollTrigger, setResetScrollTrigger] = useState(false)
  const [friendCards, setFriendCards] = useState<CollectionRow[] | null>(null)

  useEffect(() => {
    const friendId = params.friendId
    if (friendId && !friendCards) {
      console.log('fetching collection by friend id', friendId)
      fetchCollection(undefined, friendId).then(setFriendCards).catch(console.error)
    } else if (!friendId && friendCards) {
      setFriendCards(null)
    }
  }, [params])

  useEffect(() => {
    return () => {
      setFriendCards(null)
    }
  }, [])

  const cardCollection = useMemo(() => {
    return friendCards || ownedCards
  }, [ownedCards, friendCards])

  const filterRarities = (c: Card) => {
    if (rarityFilter.length === 0) return true
    return c.rarity !== 'Unknown' && c.rarity !== '' && rarityFilter.includes(c.rarity)
  }

  const getFilteredCards = useMemo(() => {
    let filteredCards = allCards

    if (expansionFilter !== 'all') {
      filteredCards = filteredCards.filter((card) => card.expansion === expansionFilter)
    }
    if (ownedFilter !== 'all') {
      if (ownedFilter === 'owned') {
        filteredCards = filteredCards.filter((card) => cardCollection.find((oc) => oc.card_id === card.card_id && oc.amount_owned > 0))
      } else if (ownedFilter === 'missing') {
        filteredCards = filteredCards.filter((card) => !cardCollection.find((oc) => oc.card_id === card.card_id && oc.amount_owned > 0))
      }
    }
    filteredCards = filteredCards.filter(filterRarities)
    if (searchValue) {
      filteredCards = filteredCards.filter((card) => {
        return card.name.toLowerCase().includes(searchValue.toLowerCase()) || card.card_id.toLowerCase().includes(searchValue.toLowerCase())
      })
    }

    setResetScrollTrigger(true)

    for (const card of filteredCards) {
      if (!card.linkedCardID) {
        card.amount_owned = cardCollection.find((oc) => oc.card_id === card.card_id)?.amount_owned || 0
      } else {
        card.amount_owned = 0
      }
    }

    return filteredCards
  }, [cardCollection, expansionFilter, rarityFilter, searchValue, ownedFilter])

  useEffect(() => {
    const timeout = setTimeout(() => setResetScrollTrigger(false), 100)

    return () => clearTimeout(timeout)
  }, [getFilteredCards])

  const handleBatchUpdate = async (cardIds: string[], amount: number) => {
    await updateMultipleCards(cardIds, amount, ownedCards, setOwnedCards, user)
  }

  return (
    <div className="flex flex-col gap-y-1 mx-auto max-w-[900px]">
      {friendCards && (
        <Alert className="mb-2 border-2 border-slate-600 shadow-none">
          <Siren className="h-4 w-4" />
          <AlertTitle>{t('publicCollectionTitle')}</AlertTitle>
          <AlertDescription>{t('publicCollectionDescription')}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2 flex-col md:flex-row gap-y-1 px-4">
        <ExpansionsFilter expansionFilter={expansionFilter} setExpansionFilter={setExpansionFilter} />
      </div>
      <div className="items-center justify-between gap-2 flex-col md:flex-row gap-y-1 px-4 md:flex">
        <SearchInput setSearchValue={setSearchValue} />
        <OwnedFilter ownedFilter={ownedFilter} setOwnedFilter={setOwnedFilter} />
        <RarityFilter rarityFilter={rarityFilter} setRarityFilter={setRarityFilter} />

        {!friendCards && <BatchUpdateDialog filteredCards={getFilteredCards} onBatchUpdate={handleBatchUpdate} disabled={getFilteredCards.length === 0} />}
        {friendCards && <FriendTradeDialog userCards={ownedCards} friendCards={friendCards} disabled={getFilteredCards.length === 0} />}
      </div>

      <div>
        <CardsTable cards={getFilteredCards} resetScrollTrigger={resetScrollTrigger} showStats />
      </div>
      <CardDetail cardId={selectedCardId} onClose={() => setSelectedCardId('')} />
    </div>
  )
}

export default Collection
