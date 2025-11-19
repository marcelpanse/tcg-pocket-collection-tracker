import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card as CardComponent } from '@/components/Card'
import { CardsTable } from '@/components/CardsTable'
import { DropdownFilter, TabsFilter, ToggleFilter } from '@/components/Filters'
import { Button } from '@/components/ui/button.tsx'
import { formatRarity } from '@/components/utils'
import { toast } from '@/hooks/use-toast.ts'
import { getCardByInternalId } from '@/lib/CardsDB.ts'
import { getExtraCards, getNeededCards } from '@/lib/utils'
import { useAccount } from '@/services/account/useAccount.ts'
import { useUser } from '@/services/auth/useAuth.ts'
import { useCollection } from '@/services/collection/useCollection.ts'
import { type Card, type CollectionRow, type Rarity, tradableRarities } from '@/types'
import { UserNotLoggedIn } from './components/UserNotLoggedIn'

const options = ['lookingFor', 'forTrade'] as const

function TradeCards() {
  const { t } = useTranslation(['pages/trade', 'filters'])

  const { data: user } = useUser()
  const { data: account } = useAccount()
  const { data: ownedCards = new Map<number, CollectionRow>() } = useCollection()

  const [rarityFilter, setRarityFilter] = useState<Rarity[]>([])
  const [lookingForMaxCards, setLookingForMaxCards] = useState<number>((account?.max_number_of_cards_wanted ?? 1) - 1)
  const [forTradeMinCards, setForTradeMinCards] = useState<number>((account?.min_number_of_cards_to_keep ?? 1) + 1)
  const [currentTab, setCurrentTab] = useState<(typeof options)[number]>('lookingFor')

  const filterRarities = (c: Card) => (rarityFilter.length === 0 ? (tradableRarities as readonly Rarity[]) : rarityFilter).includes(c.rarity)

  const populateCards = (internal_id: number) => {
    const card = getCardByInternalId(internal_id) as Card
    const amount_owned = ownedCards.get(internal_id)?.amount_owned ?? 0
    return { ...card, amount_owned }
  }

  const lookingForCards = useMemo(() => getNeededCards(ownedCards, lookingForMaxCards + 1).map(populateCards), [ownedCards, lookingForMaxCards])
  const lookingForCardsFiltered = useMemo(() => lookingForCards.filter(filterRarities), [lookingForCards, rarityFilter])

  const forTradeCards = useMemo(() => getExtraCards(ownedCards, forTradeMinCards - 1).map(populateCards), [ownedCards, forTradeMinCards])
  const forTradeCardsFiltered = useMemo(() => forTradeCards.filter(filterRarities), [forTradeCards, rarityFilter])

  const getCardValues = () => {
    let cardValues = ''

    if (account?.is_public) {
      cardValues += `${t('publicTradePage')} https://tcgpocketcollectiontracker.com/#/trade/${account?.friend_id}\n`
    }
    if (account?.username) {
      cardValues += `${t('friendID')} ${account.friend_id} (${account.username})\n\n`
    }

    cardValues += `${t('lookingForCards')}\n`

    const lookingForCardsSorted = lookingForCardsFiltered.sort((a, b) => {
      const expansionComparison = a.expansion.localeCompare(b.expansion)
      if (expansionComparison !== 0) {
        return expansionComparison
      }
      return a.rarity.localeCompare(b.rarity)
    })

    for (let i = 0; i < lookingForCardsSorted.length; i++) {
      const prevExpansion = i > 0 ? lookingForCardsSorted[i - 1].expansion : ''
      if (prevExpansion !== lookingForCardsSorted[i].expansion) {
        cardValues += `\n${lookingForCardsSorted[i].set_details}:\n`
      }
      cardValues += `${lookingForCardsSorted[i].rarity} ${lookingForCardsSorted[i].card_id} - ${lookingForCardsSorted[i].name}\n`
    }

    const raritiesLookingFor = lookingForCardsFiltered.map((c) => c.rarity)

    cardValues += `\n\n${t('forTradeCards')}\n`
    const forTradeCardsSorted = forTradeCardsFiltered.filter((c) => raritiesLookingFor.includes(c.rarity)).sort((a, b) => a.rarity.localeCompare(b.rarity))

    for (let i = 0; i < forTradeCardsSorted.length; i++) {
      const prevExpansion = i > 0 ? forTradeCardsSorted[i - 1].expansion : ''
      if (prevExpansion !== forTradeCardsSorted[i].expansion) {
        cardValues += `\n${forTradeCardsSorted[i].set_details}:\n`
      }
      cardValues += `${forTradeCardsSorted[i].rarity} ${forTradeCardsSorted[i].card_id} - ${forTradeCardsSorted[i].name}\n`
    }

    return cardValues
  }

  const copyToClipboard = async () => {
    const cardValues = getCardValues()
    toast({ title: t('copiedInClipboard'), variant: 'default', duration: 3000 })

    await navigator.clipboard.writeText(cardValues)
  }

  if (!user) {
    return <UserNotLoggedIn />
  }

  return (
    <CardsTable
      cards={currentTab === 'lookingFor' ? lookingForCardsFiltered : forTradeCardsFiltered}
      render={(c) => <CardComponent card={c} editable={false} />}
    >
      <div className="flex flex-wrap gap-2 mx-2 mb-2">
        <TabsFilter options={options} value={currentTab} onChange={setCurrentTab} show={t} />
        <ToggleFilter options={tradableRarities} value={rarityFilter} onChange={setRarityFilter} show={formatRarity} asChild />
        {currentTab === 'lookingFor' && (
          <DropdownFilter
            label={t('f-number.maxNum', { ns: 'filters' })}
            options={[1, 2, 3, 4, 5] as const}
            value={lookingForMaxCards}
            onChange={setLookingForMaxCards}
          />
        )}
        {currentTab === 'forTrade' && (
          <DropdownFilter
            label={t('f-number.minNum', { ns: 'filters' })}
            options={[2, 3, 4, 5] as const}
            value={forTradeMinCards}
            onChange={setForTradeMinCards}
          />
        )}
        <Button variant="outline" onClick={copyToClipboard}>
          Copy to clipboard
        </Button>
      </div>
    </CardsTable>
  )
}

export default TradeCards
