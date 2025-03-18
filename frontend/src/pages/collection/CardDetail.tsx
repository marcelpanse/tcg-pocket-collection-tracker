import { Card as CardComponent } from '@/components/Card'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { getCardById, sellableForTokensDictionary } from '@/lib/CardsDB.ts'
import type { Card } from '@/types'
import { useTranslation } from 'react-i18next'

interface CardDetailProps {
  cardId: string
  onClose: () => void // Function to close the sidebar
}

function CardDetail({ cardId, onClose }: CardDetailProps) {
  const { t } = useTranslation(['pages/card-detail', 'common/types', 'common/packs', 'common/sets'])
  const card: Card = getCardById(cardId) || ({} as Card)

  return (
    <Sheet
      open={!!cardId}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <SheetContent className="transition-all duration-300 ease-in-out border-slate-600 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {card.name} {card.rarity}
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col items-center">
          <div className="px-10 py-4 w-full">
            <CardComponent card={card} useMaxWidth />
          </div>

          <div className="p-4 w-full">
            <p className="text-lg mb-1">
              <strong>{t('text.tradeTokens')}:</strong> {sellableForTokensDictionary[card.rarity] || 'N/A'}
            </p>
            <p className="text-lg mb-1">
              <strong>Energy:</strong> {card.energy}
            </p>
            <p className="text-lg mb-1">
              <strong>{t('text.hp')}:</strong> {card.hp}
            </p>
            <p className="text-lg mb-1">
              <strong>{t('text.cardType')}:</strong> {t(`cardType.${card.card_type}`)}
            </p>
            <p className="text-lg mb-1">
              <strong>{t('text.evolutionType')}:</strong> {t(`evolutionType.${card.evolution_type}`)}
            </p>
            <p className="text-lg mb-1">
              <strong>{t('text.ex')}:</strong> {t(`ex.${card.ex}`)}
            </p>
            <p className="text-lg mb-1">
              <strong>{t('text.craftingCost')}:</strong> {card.crafting_cost}
            </p>
            <p className="text-lg mb-1">
              <strong>{t('text.artist')}:</strong> {card.artist}
            </p>
            <p className="text-lg mb-1">
              <strong>{t('text.setDetails')}:</strong> {t(card.set_details, { ns: 'common/sets' })}
            </p>
            <p className="text-lg mb-1">
              <strong>{t('text.expansion')}:</strong> {card.expansion}
            </p>
            <p className="text-lg mb-1">
              <strong>{t('text.pack')}:</strong> {t(`${card.pack}`, { ns: 'common/packs' })}
            </p>

            <div className="mt-4">
              <h2 className="text-xl font-semibold">{t('text.details')}</h2>
              <p>
                <strong>{t('text.weakness')}:</strong> {t(`${card.weakness}`, { ns: 'common/types' }) || 'N/A'}
              </p>
              <p>
                <strong>{t('text.retreat')}:</strong> {card.retreat || 'N/A'}
              </p>
              <p>
                <strong>{t('text.ability')}:</strong> {card.ability?.name || 'No ability'}
              </p>
              <p>
                <strong>{t('text.abilityEffect')}:</strong> {card.ability?.effect || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default CardDetail
