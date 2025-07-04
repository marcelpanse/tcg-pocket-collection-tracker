import { BatchUpdateDialog } from '@/components/BatchUpdateDialog.tsx'
import { updateMultipleCards } from '@/components/Card.tsx'
import ExpansionsFilter from '@/components/filters/ExpansionsFilter.tsx'
import NumberFilter from '@/components/filters/NumberFilter.tsx'
import OwnedFilter from '@/components/filters/OwnedFilter.tsx'
import PackFilter from '@/components/filters/PackFilter.tsx'
import RarityFilter from '@/components/filters/RarityFilter.tsx'
import SearchInput from '@/components/filters/SearchInput.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.tsx'
import { allCards, expansionsDict } from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import { getCardNameByLang } from '@/lib/utils'
import type { Card, CardType, CollectionRow, Mission, Rarity } from '@/types'
import i18n from 'i18next'
import { type FC, type JSX, useContext, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import CardTypeFilter from './filters/CardTypeFilter'
import SortByRecent from './filters/SortByRecent'

interface Props {
  children?: JSX.Element
  onFiltersChanged: (cards: Card[] | null) => void
  onChangeToMissions: (missions: Mission[] | null) => void
  cards: CollectionRow[] | null

  visibleFilters?: {
    expansions?: boolean
    search?: boolean
    owned?: boolean
    rarity?: boolean
  }

  filtersDialog?: {
    expansions?: boolean
    pack?: boolean
    search?: boolean
    owned?: boolean
    cardType?: boolean
    rarity?: boolean
    amount?: boolean
    sortBy?: boolean
  }

  batchUpdate?: boolean
  share?: boolean
}

const FilterPanel: FC<Props> = ({ children, cards, onFiltersChanged, onChangeToMissions, visibleFilters, filtersDialog, batchUpdate, share }: Props) => {
  const { t } = useTranslation(['pages/collection'])
  const { user, setIsProfileDialogOpen } = useContext(UserContext)
  const { ownedCards, setOwnedCards } = useContext(CollectionContext)

  const [langState, setLangState] = useState(i18n.language)
  const [searchValue, setSearchValue] = useState('')
  const [expansionFilter, setExpansionFilter] = useState<string>('all')
  const [packFilter, setPackFilter] = useState<string>('all')
  const [cardTypeFilter, setCardTypeFilter] = useState<CardType[]>([])
  const [rarityFilter, setRarityFilter] = useState<Rarity[]>([])
  const [ownedFilter, setOwnedFilter] = useState<'all' | 'owned' | 'missing'>('all')
  const [sortBy, setSortBy] = useState<'default' | 'recent'>('default')
  const [numberFilter, setNumberFilter] = useState(0)
  const [maxNumberFilter, setMaxNumberFilter] = useState(100)

  const filterRarities = (c: Card) => {
    if (rarityFilter.length === 0) return true
    return c.rarity !== '' && rarityFilter.includes(c.rarity)
  }

  const filterCardTypes = (c: Card) => {
    if (cardTypeFilter.length === 0) return true
    if (c.card_type.toLowerCase() === 'trainer') {
      return cardTypeFilter.includes('trainer')
    }
    return c.energy !== '' && cardTypeFilter.includes(c.energy.toLowerCase() as CardType)
  }

  const getFilteredCards = useMemo(() => {
    if (!cards) {
      return null // cards are still loading
    }

    let filteredCards = allCards

    if (expansionFilter !== 'all') {
      filteredCards = filteredCards.filter((card) => card.expansion === expansionFilter)
    }
    if (packFilter === 'missions') {
      filteredCards = []
      let missions = expansionsDict.get(expansionFilter)?.missions || null
      if (missions) {
        if (ownedFilter === 'owned') {
          missions = missions.filter((mission) => mission.completed)
        } else if (ownedFilter === 'missing') {
          missions = missions.filter((mission) => !mission.completed)
        }
      }
      onChangeToMissions(missions)
    } else {
      onChangeToMissions(null)
      if (packFilter !== 'all') {
        filteredCards = filteredCards.filter((card) => card.pack === packFilter || card.pack === 'everypack')
      }
    }
    if (ownedFilter !== 'all') {
      if (ownedFilter === 'owned') {
        filteredCards = filteredCards.filter((card) => cards.find((oc: CollectionRow) => oc.card_id === card.card_id && oc.amount_owned > 0))
      } else if (ownedFilter === 'missing') {
        filteredCards = filteredCards.filter((card) => !cards.find((oc: CollectionRow) => oc.card_id === card.card_id && oc.amount_owned > 0))
      }
    }

    if (sortBy === 'recent') {
      filteredCards = [...filteredCards].sort((a: Card, b: Card) => {
        const isUpdatedA = cards.find((oc: CollectionRow) => oc.card_id === a.card_id)?.updated_at
        const isUpdatedB = cards.find((oc: CollectionRow) => oc.card_id === b.card_id)?.updated_at
        if (isUpdatedA && isUpdatedB) {
          return new Date(isUpdatedB).getTime() - new Date(isUpdatedA).getTime()
        } else if (isUpdatedA && !isUpdatedB) {
          return -1
        } else {
          return 1
        }
      })
    }

    filteredCards = filteredCards.filter(filterRarities)
    filteredCards = filteredCards.filter(filterCardTypes)

    if (searchValue) {
      filteredCards = filteredCards.filter((card) => {
        return (
          getCardNameByLang(card, i18n.language).toLowerCase().includes(searchValue.toLowerCase()) ||
          card.card_id.toLowerCase().includes(searchValue.toLowerCase())
        )
      })
    }

    for (const card of filteredCards) {
      if (!card.linkedCardID) {
        card.amount_owned = cards.find((oc: CollectionRow) => oc.card_id === card.card_id)?.amount_owned || 0
      } else {
        card.amount_owned = 0
      }
    }
    filteredCards = filteredCards.filter((f) => (f.amount_owned || 0) >= numberFilter)
    if (maxNumberFilter !== 100) {
      filteredCards = filteredCards.filter((f) => (f.amount_owned || 0) <= maxNumberFilter)
    }

    return filteredCards
  }, [cards, expansionFilter, packFilter, rarityFilter, searchValue, ownedFilter, cardTypeFilter, numberFilter, maxNumberFilter, langState, sortBy])

  useEffect(() => {
    onFiltersChanged(getFilteredCards)
    const handleLanguageChange = (lng: string) => {
      setLangState(lng)
    }

    i18n.on('languageChanged', handleLanguageChange)

    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [getFilteredCards])

  const handleBatchUpdate = async (cardIds: string[], amount: number) => {
    await updateMultipleCards(cardIds, amount, ownedCards, setOwnedCards, user)
  }

  return (
    <div id="filterbar" className="flex flex-col gap-x-2 flex-wrap">
      {children}

      <div className="flex items-center gap-2 flex-col md:flex-row gap-y-1 px-4 mb-2">
        {visibleFilters?.expansions && (
          <ExpansionsFilter
            expansionFilter={expansionFilter}
            setExpansionFilter={setExpansionFilter}
            setPackFilter={setPackFilter}
            packFilter={packFilter}
            showPacks
          />
        )}
      </div>
      <div className="items-center gap-2 flex-row gap-y-1 px-4 flex">
        {visibleFilters?.search && <SearchInput setSearchValue={setSearchValue} />}
        {visibleFilters?.owned && <OwnedFilter ownedFilter={ownedFilter} setOwnedFilter={setOwnedFilter} />}
        {visibleFilters?.rarity && <RarityFilter rarityFilter={rarityFilter} setRarityFilter={setRarityFilter} collapse />}

        {filtersDialog && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">{t('filters.allFilters')}</Button>
            </DialogTrigger>
            <DialogContent className="border-1 border-neutral-700 shadow-none">
              <DialogHeader>
                <DialogTitle>{t('filters.filtersCount', { count: (getFilteredCards || []).filter((c) => !c.linkedCardID).length })}</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                {filtersDialog.search && <SearchInput setSearchValue={setSearchValue} fullWidth />}
                {filtersDialog.expansions && (
                  <ExpansionsFilter
                    expansionFilter={expansionFilter}
                    setExpansionFilter={setExpansionFilter}
                    setPackFilter={setPackFilter}
                    packFilter={packFilter}
                  />
                )}
                {filtersDialog.pack && <PackFilter packFilter={packFilter} setPackFilter={setPackFilter} expansion={expansionFilter} fullWidth />}
                {filtersDialog.rarity && <RarityFilter rarityFilter={rarityFilter} setRarityFilter={setRarityFilter} />}
                {filtersDialog.cardType && <CardTypeFilter cardTypeFilter={cardTypeFilter} setCardTypeFilter={setCardTypeFilter} />}
                {filtersDialog.owned && <OwnedFilter ownedFilter={ownedFilter} setOwnedFilter={setOwnedFilter} fullWidth />}
                {filtersDialog.sortBy && <SortByRecent sortBy={sortBy} setSortBy={setSortBy} />}
                {filtersDialog.amount && (
                  <>
                    <NumberFilter numberFilter={numberFilter} setNumberFilter={setNumberFilter} options={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]} labelKey="minNum" />
                    <NumberFilter
                      numberFilter={maxNumberFilter}
                      setNumberFilter={setMaxNumberFilter}
                      options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100]}
                      labelKey="maxNum"
                    />
                  </>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}

        {batchUpdate && (
          <BatchUpdateDialog
            filteredCards={getFilteredCards || []}
            onBatchUpdate={handleBatchUpdate}
            disabled={!getFilteredCards || getFilteredCards.length === 0}
          />
        )}

        {share && (
          <Button variant="outline" onClick={() => setIsProfileDialogOpen(true)}>
            {t('filters.share')}
          </Button>
        )}
      </div>
    </div>
  )
}

export default FilterPanel
