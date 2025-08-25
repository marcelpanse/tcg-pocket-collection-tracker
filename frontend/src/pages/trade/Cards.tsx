import { use, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CardsTable } from '@/components/CardsTable'
import NumberFilter from '@/components/filters/NumberFilter.tsx'
import RarityFilter from '@/components/filters/RarityFilter.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/hooks/use-toast.ts'
import { allCards, expansions, sellableForTokensDictionary, tradeableRaritiesDictionary } from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { UserContext } from '@/lib/context/UserContext'
import CardDetail from '@/pages/collection/CardDetail.tsx'
import { NoCardsNeeded } from '@/pages/trade/components/NoCardsNeeded.tsx'
import { NoSellableCards } from '@/pages/trade/components/NoSellableCards.tsx'
import { NoTradeableCards } from '@/pages/trade/components/NoTradeableCards.tsx'
import type { Card, Rarity } from '@/types'
import { UserNotLoggedIn } from './components/UserNotLoggedIn'

function Cards() {
  const { t } = useTranslation('pages/trade')
  const { user, account } = use(UserContext)
  const { ownedCards, selectedCardId, setSelectedCardId } = use(CollectionContext)

  const [rarityFilter, setRarityFilter] = useState<Rarity[]>([])
  const [forTradeMinCards, setForTradeMinCards] = useState<number>(0)
  const [lookingForMinCards, setLookingForMinCards] = useState<number>(2)
  const [buyingTokensMinCards, setBuyingTokensMinCards] = useState<number>(3)
  const [currentTab, setCurrentTab] = useState('looking_for')

  const tradeableExpansions = useMemo(() => expansions.filter((e) => e.tradeable).map((e) => e.id), [])

  const filterRarities = (c: Card) => {
    if (rarityFilter.length === 0) return true
    return c.rarity !== '' && rarityFilter.includes(c.rarity)
  }

  // LOOKING FOR CARDS
  const lookingForCards = useMemo(
    () =>
      allCards
        .filter(
          (ac) =>
            ownedCards.findIndex((oc) => oc.card_id === ac.card_id) === -1 ||
            ownedCards[ownedCards.findIndex((oc) => oc.card_id === ac.card_id)].amount_owned <= forTradeMinCards,
        )
        .filter((c) => tradeableRaritiesDictionary[c.rarity] !== null && tradeableExpansions.includes(c.expansion)),
    [ownedCards, forTradeMinCards],
  )
  const lookingForCardsFiltered = useMemo(() => {
    return lookingForCards.filter(filterRarities)
  }, [lookingForCards, rarityFilter])

  // FOR TRADE CARDS
  const forTradeCards = useMemo(() => {
    const myCards = ownedCards.filter((c) => c.amount_owned >= lookingForMinCards)
    return allCards
      .filter((ac) => myCards.findIndex((oc) => oc.card_id === ac.card_id) > -1)
      .map((ac) => ({
        ...ac,
        amount_owned: myCards.find((oc) => oc.card_id === ac.card_id)?.amount_owned,
      }))
      .filter((c) => tradeableRaritiesDictionary[c.rarity] !== null && tradeableExpansions.includes(c.expansion))
  }, [ownedCards, lookingForMinCards])

  const forTradeCardsFiltered = useMemo(() => {
    return forTradeCards.filter(filterRarities)
  }, [forTradeCards, rarityFilter])

  // BUYING TOKENS
  const buyingTokensCards = useMemo(() => {
    const myCards = ownedCards.filter((c) => c.amount_owned >= buyingTokensMinCards)

    return allCards
      .filter((ac) => myCards.findIndex((oc) => oc.card_id === ac.card_id) > -1)
      .map((ac) => ({
        ...ac,
        amount_owned: myCards.find((oc) => oc.card_id === ac.card_id)?.amount_owned,
      }))
      .filter((c) => sellableForTokensDictionary[c.rarity] !== null)
  }, [ownedCards, buyingTokensMinCards])

  const buyingTokensCardsFiltered = useMemo(() => buyingTokensCards.filter(filterRarities), [buyingTokensCards, rarityFilter])

  const getCardValues = () => {
    let cardValues = ''

    if (account?.is_public) {
      cardValues += `${t('publicTradePage')} https://tcgpocketcollectiontracker.com/#/collection/${account?.friend_id}/trade\n`
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
            <TabsTrigger value="buying_tokens">{t('buyingTokens')}</TabsTrigger>
          </TabsList>
          <RarityFilter rarityFilter={rarityFilter} setRarityFilter={setRarityFilter} />
          <div className="sm:mt-1 flex flex-row flex-wrap align-center gap-x-4 gap-y-1">
            {currentTab === 'looking_for' && (
              <NumberFilter numberFilter={forTradeMinCards} setNumberFilter={setForTradeMinCards} options={[0, 1, 2, 3, 4, 5]} labelKey="maxNum" />
            )}
            {currentTab === 'for_trade' && (
              <NumberFilter numberFilter={lookingForMinCards} setNumberFilter={setLookingForMinCards} options={[2, 3, 4, 5]} labelKey="minNum" />
            )}
            {currentTab === 'buying_tokens' && (
              <NumberFilter numberFilter={buyingTokensMinCards} setNumberFilter={setBuyingTokensMinCards} options={[2, 3, 4, 5]} labelKey="minNum" />
            )}
            <Button variant="outline" onClick={copyToClipboard}>
              Copy to clipboard
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-[900px] mt-6">
          <TabsContent value="looking_for">
            {lookingForCards && lookingForCards.length > 0 ? <CardsTable cards={lookingForCardsFiltered} extraOffset={105} /> : <NoCardsNeeded />}
          </TabsContent>
          <TabsContent value="for_trade">
            {forTradeCards && forTradeCards.length > 0 ? <CardsTable cards={forTradeCardsFiltered} extraOffset={105} /> : <NoTradeableCards />}
          </TabsContent>
          <TabsContent value="buying_tokens">
            {buyingTokensCards && buyingTokensCards.length > 0 ? <CardsTable cards={buyingTokensCardsFiltered} extraOffset={105} /> : <NoSellableCards />}
          </TabsContent>
        </div>
      </Tabs>
      {selectedCardId && <CardDetail cardId={selectedCardId} onClose={() => setSelectedCardId('')} />}
    </div>
  )
}

export default Cards
