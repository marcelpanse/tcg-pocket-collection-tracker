import { CardsTable } from '@/components/CardsTable.tsx'
import NumberFilter from '@/components/filters/NumberFilter.tsx'
import RarityFilter from '@/components/filters/RarityFilter.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast.ts'
import { allCards, expansions, sellableForTokensDictionary, tradeableRaritiesDictionary } from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { UserContext } from '@/lib/context/UserContext'
import { NoCardsNeeded } from '@/pages/trade/components/NoCardsNeeded.tsx'
import { NoSellableCards } from '@/pages/trade/components/NoSellableCards.tsx'
import { NoTradeableCards } from '@/pages/trade/components/NoTradeableCards.tsx'
import type { Card, Rarity } from '@/types'
import { type MouseEvent, use, useMemo, useState } from 'react'
import { UserNotLoggedIn } from './components/UserNotLoggedIn'

function Trade() {
  const { user, account, setIsProfileDialogOpen } = use(UserContext)
  const { ownedCards } = use(CollectionContext)
  const { toast } = useToast()

  const [rarityFilter, setRarityFilter] = useState<Rarity[]>([])
  const [forTradeMinCards, setForTradeMinCards] = useState<number>(0)
  const [lookingForMinCards, setLookingForMinCards] = useState<number>(2)
  const [buyingTokensMinCards, setBuyingTokensMinCards] = useState<number>(3)
  const [currentTab, setCurrentTab] = useState('looking_for')

  const tradeableExpansions = useMemo(() => expansions.filter((e) => e.tradeable).map((e) => e.id), [])

  const filterRarities = (c: Card) => {
    if (rarityFilter.length === 0) return true
    return c.rarity !== 'Unknown' && c.rarity !== '' && rarityFilter.includes(c.rarity)
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
      cardValues += `Public trade page: https://tcgpocketcollectiontracker.com/#/collection/${account?.friend_id}/trade\n`
    }
    if (account?.username) {
      cardValues += `Friend ID: ${account.friend_id} (${account.username})\n\n`
    }

    cardValues += 'Looking for cards:\n'

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

    cardValues += '\n\nFor trade cards:\n'
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

  const copyToClipboard = async (e: MouseEvent) => {
    e.preventDefault()

    const cardValues = getCardValues()
    toast({ title: 'Copied cards for trading to clipboard!', variant: 'default', duration: 3000 })

    await navigator.clipboard.writeText(cardValues)
  }

  const copyTradingLink = async (e: MouseEvent) => {
    e.preventDefault()

    toast({ title: 'Copied trading page URL to clipboard!', variant: 'default', duration: 3000 })
    await navigator.clipboard.writeText(`https://tcgpocketcollectiontracker.com/#/collection/${account?.friend_id}/trade`)
  }

  const enableTradingPage = () => {
    setIsProfileDialogOpen(true)
  }

  if (!user) {
    return <UserNotLoggedIn />
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Tabs defaultValue={currentTab} onValueChange={(value) => setCurrentTab(value)}>
        <div className="mx-auto max-w-[900px] flex flex-row flex-wrap align-center gap-x-4 gap-y-2 px-4">
          <TabsList className="flex-grow m-auto flex-wrap h-auto border-2 border-slate-600 rounded-md">
            <TabsTrigger value="looking_for">Looking For</TabsTrigger>
            <TabsTrigger value="for_trade">For Trade</TabsTrigger>
            <TabsTrigger value="buying_tokens">Buying Tokens</TabsTrigger>
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
            <Button variant="outline" onClick={(e) => copyToClipboard(e)}>
              Copy to clipboard
            </Button>
            {!account?.is_public ? (
              <Button variant="outline" onClick={() => enableTradingPage()}>
                Enable trading page
              </Button>
            ) : (
              <Button variant="outline" onClick={(e) => copyTradingLink(e)}>
                Share trading page
              </Button>
            )}
          </div>
        </div>
        <div className="max-w-auto mx-4 md:mx-8">
          <TabsContent value="looking_for">
            {lookingForCards && lookingForCards.length > 0 ? <CardsTable cards={lookingForCardsFiltered} /> : <NoCardsNeeded />}
          </TabsContent>
          <TabsContent value="for_trade">
            {forTradeCards && forTradeCards.length > 0 ? <CardsTable cards={forTradeCardsFiltered} /> : <NoTradeableCards />}
          </TabsContent>
          <TabsContent value="buying_tokens">
            {buyingTokensCards && buyingTokensCards.length > 0 ? <CardsTable cards={buyingTokensCardsFiltered} /> : <NoSellableCards />}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

export default Trade
