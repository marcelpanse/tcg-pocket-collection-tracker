import i18n from 'i18next'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card as CardComponent } from '@/components/Card'
import { CardLine } from '@/components/CardLine'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Radio, RadioIndicator, RadioItem } from '@/components/ui/radio'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { craftingCost, getCardById, getExpansionById, pullRateForSpecificCard } from '@/lib/CardsDB.ts'
import { getCardNameByLang } from '@/lib/utils'
import { useCollection, useSelectedCard } from '@/services/collection/useCollection'
import type { CollectionRow } from '@/types'

function CardDetail() {
  const { t } = useTranslation(['pages/card-detail', 'common/types', 'common/packs', 'common/sets'])
  const { selectedCardId: cardId, setSelectedCardId: setCardId } = useSelectedCard()

  const { data: ownedCards = [] } = useCollection()

  const [isOpen, setIsOpen] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)

  const card = useMemo(() => (cardId === undefined ? undefined : getCardById(cardId)), [cardId])
  const row = useMemo(() => ownedCards.find((oc: CollectionRow) => oc.card_id === cardId), [cardId])
  const alternatives = useMemo(
    () => card?.alternate_versions.map((card_id) => ({ card_id, amount_owned: ownedCards.find((c) => c.card_id === card_id)?.amount_owned ?? 0 })),
    [card, ownedCards],
  )
  const expansion = useMemo(() => (card === undefined ? undefined : getExpansionById(card?.expansion)), [card])

  useEffect(() => {
    if (cardId) {
      setIsOpen(true)
    }
  }, [cardId])

  if (cardId && !card) {
    console.log(`Unrecognized card_id: ${cardId}`)
    return null
  }

  if (card && !expansion) {
    console.log(`Unrecognized expansion: ${card.expansion}`)
    return null
  }

  // if we draw from 'everypack' we need to take one of the packs to base calculations on
  const packName = card?.pack === 'everypack' ? expansion?.packs[0].name : card?.pack

  const formatTimestamp = (timestamp: string) => {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'long',
      timeStyle: 'long',
    }).format(new Date(timestamp))
  }

  return (
    <Sheet
      open={Boolean(cardId) && isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setIsOpen(open)
          setTimeout(() => setCardId(undefined), 300) // keep content when sliding out
        }
      }}
    >
      <SheetContent className="transition-all duration-300 ease-in-out border-slate-600 overflow-y-auto w-full md:w-[725px]">
        <SheetHeader>
          <SheetTitle>
            {card && getCardNameByLang(card, i18n.language)} {card?.rarity}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center">
          <div className="px-10 py-4 w-full">
            <div className="cursor-pointer">
              {card && (
                <CardComponent
                  key={cardId}
                  className="w-full"
                  card={{ ...card, amount_owned: row?.amount_owned || 0 }}
                  onImageClick={() => setIsImageDialogOpen(true)}
                />
              )}
            </div>
          </div>

          <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
            <DialogHeader className="hidden">
              <DialogTitle>Card image dialog</DialogTitle>
            </DialogHeader>

            <DialogContent className="flex items-center justify-center p-0 max-w-3xl max-h-[90vh]">
              {card?.image && (
                <img
                  src={card.image}
                  alt={getCardNameByLang(card, i18n.language)}
                  className="w-full h-full object-scale-down"
                  onClick={() => setIsImageDialogOpen(false)}
                />
              )}
            </DialogContent>
          </Dialog>

          <div className="p-4 w-full">
            <div className="mb-3">
              <h2 className="text-xl font-semibold">{t('text.alternateVersions')}</h2>
              {alternatives && (
                <Radio className="w-fit" value={cardId} onValueChange={setCardId}>
                  {alternatives.map((x) => (
                    <label key={x.card_id} className="flex items-center cursor-pointer" htmlFor={`radio-${x.card_id}`}>
                      <RadioItem id={`radio-${x.card_id}`} value={x.card_id}>
                        <RadioIndicator />
                      </RadioItem>
                      <CardLine className="w-auto bg-transparent" card_id={x.card_id} rarity="w-14" name="hidden" details="hidden" amount="pl-4" />
                    </label>
                  ))}
                  <p className="flex items-baseline mt-1">
                    <span className="mr-4">{t('text.totalAmount')}:</span>
                    <span className="text-neutral-400 ml-auto mr-2">×{alternatives?.reduce((acc, c) => acc + c.amount_owned, 0)}</span>
                  </p>
                </Radio>
              )}
            </div>

            <p className="mt-8 flex">
              <strong className="block min-w-[175px]">{t('text.expansion')}</strong> {card?.expansion}
            </p>
            <p className="mt-1 flex">
              <strong className="block min-w-[175px]">{t('text.pack')}</strong> {card && t(`${card.pack}`, { ns: 'common/packs' })}
            </p>

            <p className="mt-1 flex">
              <strong className="block min-w-[175px]">Energy</strong> {card?.energy}
            </p>
            <p className="mt-1 flex">
              <strong className="block min-w-[175px]">{t('text.weakness')}</strong> {(card && t(`${card.weakness}`, { ns: 'common/types' })) || 'N/A'}
            </p>
            <p className="mt-1 flex">
              <strong className="block min-w-[175px]">{t('text.hp')}</strong> {card?.hp}
            </p>
            <p className="mt-1 flex">
              <strong className="block min-w-[175px]">{t('text.retreat')}</strong> {card?.retreat || 'N/A'}
            </p>

            <p className="mt-1 flex">
              <strong className="block min-w-[175px]">{t('text.ability')}</strong> {card?.ability?.name ?? <i>None</i>}
            </p>
            {card?.ability && (
              <p className="mt-1 flex">
                <strong className="block min-w-[175px]">{t('text.abilityEffect')}</strong> {card?.ability.effect}
              </p>
            )}

            <p className="mt-1 flex">
              <strong className="block min-w-[175px]">{t('text.cardType')}</strong> {card && t(`cardType.${card.card_type}`)}
            </p>
            <p className="mt-1 flex">
              <strong className="block min-w-[175px]">{t('text.evolutionType')}</strong> {card && t(`evolutionType.${card.evolution_type}`)}
            </p>

            {expansion && packName && (
              <p className="mt-1 flex">
                <strong className="block min-w-[175px]">{t('text.chanceToPull', { ns: 'pages/card-detail' })}</strong>
                {card && pullRateForSpecificCard(expansion, packName, card).toFixed(2)}%
              </p>
            )}
            {card && craftingCost[card.rarity] && (
              <p className="mt-1 flex">
                <strong className="block min-w-[175px]">{t('text.craftingCost')}</strong> {craftingCost[card.rarity]}
              </p>
            )}

            <p className="mt-1 flex">
              <strong className="block min-w-[175px]">{t('text.artist')}</strong> {card?.artist}
            </p>

            <p className="mt-4 text-neutral-400 text-sm flex">
              <strong className="font-semibold mr-1">{t('text.updated')}</strong> {row?.updated_at ? formatTimestamp(row.updated_at) : 'N/A'}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default CardDetail
