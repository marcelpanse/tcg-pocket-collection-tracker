import i18n from 'i18next'
import { CircleHelp } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Tooltip } from 'react-tooltip'
import { Card as CardComponent } from '@/components/Card'
import { CardLine } from '@/components/CardLine'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Radio, RadioIndicator, RadioItem } from '@/components/ui/radio'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { craftingCost, getCardByInternalId, getExpansionById, pullRateForSpecificCard } from '@/lib/CardsDB.ts'
import { getCardNameByLang } from '@/lib/utils'
import { useCollection, useDeleteCard, useSelectedCard } from '@/services/collection/useCollection'
import type { Card, CollectionRow } from '@/types'

function CardDetail() {
  const { t } = useTranslation(['pages/card-detail', 'common/types', 'common/packs', 'common/sets'])
  const { selectedCardId: id, setSelectedCardId: setId } = useSelectedCard()

  const { data: ownedCards = new Map<number, CollectionRow>() } = useCollection()
  const deleteCardMutation = useDeleteCard()

  const [isOpen, setIsOpen] = useState(false)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)

  const card = useMemo(() => (id === undefined ? undefined : getCardByInternalId(id)), [id])
  const row = useMemo(() => (id === undefined ? undefined : ownedCards.get(id)), [id, ownedCards])
  const alternatives = useMemo(
    () =>
      card?.alternate_versions.map((alternate_id) => ({
        card: getCardByInternalId(alternate_id) as Card,
        amount_owned: ownedCards.get(alternate_id)?.amount_owned ?? 0,
      })),
    [card, ownedCards],
  )
  const expansion = useMemo(() => card && getExpansionById(card.expansion), [card])

  useEffect(() => {
    if (id) {
      setIsOpen(true)
    }
  }, [id])

  if (id && !card) {
    console.log(`Unrecognized card id: ${id}`)
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

  const handleUncollect = (cardId: string) => {
    if (id && row?.collection.includes(cardId)) {
      deleteCardMutation.mutate({ cardId })
    }
  }

  return (
    <Sheet
      open={Boolean(id) && isOpen}
      onOpenChange={(open) => {
        if (!open) {
          setIsOpen(open)
          setTimeout(() => setId(undefined), 300) // keep content when sliding out
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
            {card && (
              <CardComponent className="w-full" card={{ ...card, amount_owned: row?.amount_owned || 0 }} onImageClick={() => setIsImageDialogOpen(true)} />
            )}
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
                <Radio className="w-fit" value={String(id)} onValueChange={(x) => setId(Number(x))}>
                  {alternatives.map((x) => (
                    <label key={x.card.card_id} className="flex items-center" htmlFor={`radio-${x.card.card_id}`}>
                      <RadioItem id={`radio-${x.card.card_id}`} value={String(x.card.internal_id)}>
                        <RadioIndicator />
                      </RadioItem>
                      <CardLine className="w-auto bg-transparent" card_id={x.card.card_id} rarity="w-14" name="hidden" details="hidden" amount="pl-4" />
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
            {card?.hp && (
              <p className="mt-1 flex">
                <strong className="block min-w-[175px]">{t('text.hp')}</strong> {card?.hp}
              </p>
            )}
            {card?.retreat && (
              <p className="mt-1 flex">
                <strong className="block min-w-[175px]">{t('text.retreat')}</strong> {card.retreat}
              </p>
            )}

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

            {!!row?.collection?.length && (
              <>
                <p className="flex items-center gap-2 mt-6 mb-1">
                  <span>Collected in</span>
                  <Tooltip id="minInput" style={{ maxWidth: '300px', whiteSpace: 'normal' }} clickable={true} />
                  <CircleHelp className="h-4 w-4" data-tooltip-id="minInput" data-tooltip-content={t('text.uncollectTooltip')} />
                </p>
                {deleteCardMutation.isPending ? (
                  <p>{t('text.uncollecting')}</p>
                ) : (
                  <div className="flex flex-col gap-1 w-fit">
                    {row?.collection.map((cardId) => (
                      <Button
                        key={cardId}
                        variant="destructive"
                        className="mr-auto min-w-48 w-full"
                        onClick={() => handleUncollect(cardId)}
                        disabled={deleteCardMutation.isPending}
                      >
                        {t('text.uncollect')} {cardId}
                      </Button>
                    ))}
                  </div>
                )}
              </>
            )}

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
