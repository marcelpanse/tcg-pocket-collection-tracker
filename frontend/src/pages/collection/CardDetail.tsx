import i18n from 'i18next'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card as CardComponent } from '@/components/Card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Radio, RadioIndicator, RadioItem } from '@/components/ui/radio'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { getCardById, getExpansionById, pullRateForSpecificCard } from '@/lib/CardsDB.ts'
import { getCardNameByLang } from '@/lib/utils'
import { useCollection } from '@/services/collection/useCollection'
import type { Card, CollectionRow } from '@/types'

interface CardDetailProps {
  cardId: string
  onClose: () => void // Function to close the sidebar
}

function CardDetail({ cardId: initialCardId, onClose }: Readonly<CardDetailProps>) {
  const { t } = useTranslation(['pages/card-detail', 'common/types', 'common/packs', 'common/sets'])
  const [cardId, setCardId] = useState(initialCardId)
  const card: Card = getCardById(cardId) || ({} as Card)
  const expansion = getExpansionById(card.expansion)

  const { data: ownedCards = [] } = useCollection()

  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)

  if (!card) {
    return null
  }

  // if we draw from 'everypack' we need to take one of the packs to calculated based on
  const packName = card.pack === 'everypack' ? expansion?.packs[0].name : card.pack

  const row = ownedCards.find((oc: CollectionRow) => oc.card_id === cardId)

  const formatTimestamp = (timestamp: string) => {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'long',
      timeStyle: 'long',
    }).format(new Date(timestamp))
  }

  return (
    <Sheet
      open={true}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <SheetContent className="transition-all duration-300 ease-in-out border-slate-600 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {getCardNameByLang(card, i18n.language)} {card.rarity}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center">
          <div className="px-10 py-4 w-full">
            <div className="cursor-pointer">
              <CardComponent
                key={cardId}
                className="w-full"
                card={{ ...card, amount_owned: row?.amount_owned || 0 }}
                onImageClick={() => setIsImageDialogOpen(true)}
              />
            </div>
          </div>

          <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
            <DialogHeader className="hidden">
              <DialogTitle>Card image dialog</DialogTitle>
            </DialogHeader>

            <DialogContent className="flex items-center justify-center p-0 max-w-3xl max-h-[90vh]">
              {card.image && (
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
              <Radio value={cardId} onValueChange={setCardId}>
                {card.alternate_versions?.map((x) => (
                  <label key={x.card_id} className="flex items-center cursor-pointer" htmlFor={`radio-${x.card_id}`}>
                    <RadioItem id={`radio-${x.card_id}`} value={x.card_id}>
                      <RadioIndicator />
                    </RadioItem>
                    {x.rarity} {x.card_id}
                  </label>
                ))}
              </Radio>
            </div>

            <p className="text-lg mt-1">
              <strong>{t('text.expansion')}:</strong> {card.expansion}
            </p>
            <p className="text-lg">
              <strong>{t('text.pack')}:</strong> {t(`${card.pack}`, { ns: 'common/packs' })}
            </p>

            <p className="mt-1">
              <strong>Energy:</strong> {card.energy}
            </p>
            <p>
              <strong>{t('text.weakness')}:</strong> {t(`${card.weakness}`, { ns: 'common/types' }) || 'N/A'}
            </p>
            <p>
              <strong>{t('text.hp')}:</strong> {card.hp}
            </p>
            <p>
              <strong>{t('text.retreat')}:</strong> {card.retreat || 'N/A'}
            </p>

            <p className="mt-1">
              <strong>{t('text.ability')}:</strong> {card.ability?.name ?? <i>None</i>}
            </p>
            {card.ability && (
              <p>
                <strong>{t('text.abilityEffect')}:</strong> {card.ability.effect}
              </p>
            )}

            <p className="mt-1">
              <strong>{t('text.cardType')}:</strong> {t(`cardType.${card.card_type}`)}
            </p>
            <p>
              <strong>{t('text.evolutionType')}:</strong> {t(`evolutionType.${card.evolution_type}`)}
            </p>

            {expansion && packName && (
              <p className="mt-1">
                <strong>{t('text.chanceToPull', { ns: 'pages/card-detail', percent: pullRateForSpecificCard(expansion, packName, card).toFixed(2) })}</strong>
              </p>
            )}
            <p>
              <strong>{t('text.craftingCost')}:</strong> {card.crafting_cost}
            </p>

            <p className="mt-1">
              <strong>{t('text.artist')}:</strong> {card.artist}
            </p>

            <p className="mt-4 text-neutral-400 text-sm">
              <strong className="font-semibold">{t('text.updated')}:</strong> {row?.updated_at ? formatTimestamp(row.updated_at) : 'N/A'}
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default CardDetail
