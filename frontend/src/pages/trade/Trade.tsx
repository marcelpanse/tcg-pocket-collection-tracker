import { CardsTable } from '@/components/CardsTable.tsx'
import NumberFilter from '@/components/NumberFilter'
import RarityFilter from '@/components/RarityFilter.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast.ts'
import { allCards, expansions, sellableForTokensDictionary, tradeableRaritiesDictionary } from '@/lib/CardsDB.ts'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { UserContext } from '@/lib/context/UserContext'
import { NoCardsNeeded } from '@/pages/trade/components/NoCardsNeeded.tsx'
import { NoSellableCards } from '@/pages/trade/components/NoSellableCards.tsx'
import { NoTradeableCards } from '@/pages/trade/components/NoTradeableCards.tsx'
import { type MouseEvent, use, useMemo, useState } from 'react'
import { UserNotLoggedIn } from './components/UserNotLoggedIn'

function Trade() {
  const { user, account } = use(UserContext)
  const { ownedCards } = use(CollectionContext)
  const { toast } = useToast()

  const [rarityFilter, setRarityFilter] = useState<string[]>([])
  const [forTradeMinCards, setForTradeMinCards] = useState<number>(0)
  const [lookingForMinCards, setLookingForMinCards] = useState<number>(2)
  const [buyingTokensMinCards, setBuyingTokensMinCards] = useState<number>(3)
  const [currentTab, setCurrentTab] = useState('looking_for')

  const tradeableExpansions = useMemo(() => expansions.filter((e) => e.tradeable).map((e) => e.id), [])

  // LOOKING FOR CARDS
  const lookingForCards = useMemo(
    () =>
      allCards
        .filter(
          (ac) =>
            ownedCards.findIndex((oc) => oc.card_id === ac.card_id) === -1 ||
            ownedCards[ownedCards.findIndex((oc) => oc.card_id === ac.card_id)].amount_owned <= forTradeMinCards,
        )
        .filter((c) => Object.keys(tradeableRaritiesDictionary).includes(c.rarity) && tradeableExpansions.includes(c.expansion)),
    [ownedCards, forTradeMinCards],
  )
  const lookingForCardsFiltered = useMemo(() => {
    return lookingForCards.filter((c) => rarityFilter.length === 0 || rarityFilter.includes(c.rarity))
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
      .filter((c) => Object.keys(tradeableRaritiesDictionary).includes(c.rarity) && tradeableExpansions.includes(c.expansion))
  }, [ownedCards, lookingForMinCards])

  const forTradeCardsFiltered = useMemo(() => {
    return forTradeCards.filter((c) => rarityFilter.length === 0 || rarityFilter.includes(c.rarity))
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
      .filter((c) => Object.keys(sellableForTokensDictionary).includes(c.rarity))
  }, [ownedCards, buyingTokensMinCards])

  const buyingTokensCardsFiltered = useMemo(
    () => buyingTokensCards.filter((c) => rarityFilter.length === 0 || rarityFilter.includes(c.rarity)),
    [buyingTokensCards, rarityFilter],
  )

  const getCardValues = () => {
    let cardValues = 'Looking for cards:\n'
    cardValues += lookingForCardsFiltered
      .sort((a, b) => a.rarity.localeCompare(b.rarity))
      .map((c) => `${c.rarity} ${c.card_id} - ${c.name}`)
      .join('\n')
    cardValues += '\n\nFor trade cards:\n'
    cardValues += forTradeCardsFiltered
      .sort((a, b) => a.rarity.localeCompare(b.rarity))
      .map((c) => `${c.rarity} ${c.card_id} - ${c.name}`)
      .join('\n')

    return cardValues
  }

  const copyToClipboard = async (e: MouseEvent) => {
    e.preventDefault()

    const cardValues = getCardValues()
    toast({ title: 'Copied cards for trading to clipboard!', variant: 'default', duration: 3000 })

    await navigator.clipboard.writeText(cardValues)
  }

  const postToCommunity = async () => {
    const username = account ? ` - ${account.username} - ${account.friend_id}` : ''
    const title = encodeURIComponent(`Trade cards${username}`)
    const body = encodeURIComponent(getCardValues())
    const category = 'Trading'
    const url = `https://community.tcgpocketcollectiontracker.com/new-topic?title=${title}&body=${body}&category=${category}`

    window.open(url, '_blank')
  }

  if (!user) {
    return <UserNotLoggedIn />
  }

  return (
    <div className="flex flex-col gap-y-4">
      <Tabs defaultValue={currentTab} onValueChange={(value) => setCurrentTab(value)}>
        <div className="mx-auto max-w-[900px] flex flex-row flex-wrap align-center gap-4 p-8">
          <TabsList className="flex-grow m-auto flex-wrap h-auto border-2 border-slate-600 rounded-md">
            <TabsTrigger value="looking_for">Looking For</TabsTrigger>
            <TabsTrigger value="for_trade">For Trade</TabsTrigger>
            <TabsTrigger value="buying_tokens">Buying Tokens</TabsTrigger>
          </TabsList>
          <RarityFilter rarityFilter={rarityFilter} setRarityFilter={setRarityFilter} />
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
          <Button variant="outline" onClick={() => postToCommunity()}>
            Post to community
          </Button>
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
