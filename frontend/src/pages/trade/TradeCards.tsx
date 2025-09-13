import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CardsTable } from '@/components/CardsTable'
import NumberFilter from '@/components/filters/NumberFilter.tsx'
import RarityFilter from '@/components/filters/RarityFilter.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast.ts'
import { getCardById } from '@/lib/CardsDB.ts'
import { getExtraCards, getNeededCards } from '@/lib/utils'
import { NoCardsNeeded } from '@/pages/trade/components/NoCardsNeeded.tsx'
import { NoTradeableCards } from '@/pages/trade/components/NoTradeableCards.tsx'
import { useAccount } from '@/services/account/useAccount.ts'
import { useUser } from '@/services/auth/useAuth.ts'
import { useCollection } from '@/services/collection/useCollection.ts'
import { type Card, type Rarity, tradableRarities } from '@/types'
import { UserNotLoggedIn } from './components/UserNotLoggedIn'

function TradeCards() {
  const { t } = useTranslation('pages/trade')

  const { data: user } = useUser()
  const { data: account } = useAccount()
  const { data: ownedCards = [] } = useCollection()

  const [rarityFilter, setRarityFilter] = useState<Rarity[]>([])
  const [lookingForMaxCards, setLookingForMaxCards] = useState<number>((account?.max_number_of_cards_wanted ?? 1) - 1)
  const [forTradeMinCards, setForTradeMinCards] = useState<number>((account?.min_number_of_cards_to_keep ?? 1) + 1)
  const [currentTab, setCurrentTab] = useState('looking_for')

  const filterRarities = (c: Card) => {
    if (rarityFilter.length === 0) {
      return true
    }
    return c.rarity !== '' && rarityFilter.includes(c.rarity)
  }

  const populateCards = (card_id: string) => {
    const card = getCardById(card_id) as Card
    const amount_owned = ownedCards.find((c) => c.card_id === card_id)?.amount_owned ?? 0
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
    <div className="flex flex-col gap-y-4">
      <Tabs defaultValue={currentTab} onValueChange={setCurrentTab}>
        <div className="mx-auto max-w-[900px] flex flex-row flex-wrap align-center gap-x-4 gap-y-2">
          <TabsList className="flex-grow m-auto flex-wrap h-auto border-1 border-neutral-700 rounded-md">
            <TabsTrigger value="looking_for">{t('lookingFor')}</TabsTrigger>
            <TabsTrigger value="for_trade">{t('forTrade')}</TabsTrigger>
          </TabsList>
          <RarityFilter rarityFilter={rarityFilter} setRarityFilter={setRarityFilter} rarities={tradableRarities} />
          <div className="sm:mt-1 flex flex-row flex-wrap align-center gap-x-4 gap-y-1">
            {currentTab === 'looking_for' && (
              <NumberFilter numberFilter={lookingForMaxCards} setNumberFilter={setLookingForMaxCards} options={[0, 1, 2, 3, 4, 5]} labelKey="maxNum" />
            )}
            {currentTab === 'for_trade' && (
              <NumberFilter numberFilter={forTradeMinCards} setNumberFilter={setForTradeMinCards} options={[2, 3, 4, 5]} labelKey="minNum" />
            )}
            <Button variant="outline" onClick={copyToClipboard}>
              Copy to clipboard
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-[900px] mt-6">
          <TabsContent value="looking_for">
            {lookingForCards ? <CardsTable cards={lookingForCardsFiltered} extraOffset={105} editable={false} /> : <NoCardsNeeded />}
          </TabsContent>
          <TabsContent value="for_trade">
            {forTradeCards ? <CardsTable cards={forTradeCardsFiltered} extraOffset={105} editable={false} /> : <NoTradeableCards />}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default TradeCards
