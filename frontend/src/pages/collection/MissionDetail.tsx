import i18n from 'i18next'
import { useTranslation } from 'react-i18next'
import FancyCard from '@/components/FancyCard.tsx'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { expansions, getCardById, getExpansionById, pullRateForSpecificCard } from '@/lib/CardsDB.ts'
import { getCardNameByLang } from '@/lib/utils.ts'

interface MissionDetailProps {
  missionCardOptions: string[]
  onClose: () => void // Function to close the sidebar
}

function MissionDetail({ missionCardOptions, onClose }: Readonly<MissionDetailProps>) {
  const { t } = useTranslation(['common/sets', 'common/packs', 'pages/collection'])
  const gettingExpansion = missionCardOptions[0] || ''
  const expansionId = gettingExpansion.length > 0 ? gettingExpansion.split('-')[0] : 'Unknown'
  const expansion = getExpansionById(expansionId) || expansions[0]
  const expansionName = expansion.name
  return (
    <Sheet
      open={!!missionCardOptions.length}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
        }
      }}
    >
      <SheetContent className="transition-all duration-300 ease-in-out border-slate-600 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            {missionCardOptions.length === 1
              ? t('missionDetail.eligibleCards-singular', { ns: 'pages/collection', options: 1 })
              : t('missionDetail.eligibleCards-plural', { ns: 'pages/collection', options: missionCardOptions.length })}
          </SheetTitle>
        </SheetHeader>
        {t(expansionName)}
        {missionCardOptions.map((cardId) => {
          const foundCard = getCardById(cardId)
          return (
            foundCard && (
              <div key={cardId} className="flex flex-col items-center">
                <div className="px-10 py-4 w-full">
                  <FancyCard card={foundCard} selected={false} />
                </div>
                <p className="max-w-[130px] whitespace-nowrap font-semibold text-[12px] pt-2">
                  {cardId} - {getCardNameByLang(foundCard, i18n.language)}
                  <br />
                  {t('missionDetail.chanceFrom', {
                    ns: 'pages/collection',
                    pack: t(foundCard.pack, { ns: 'common/packs' }),
                    chance: pullRateForSpecificCard(expansion, foundCard.pack, foundCard).toFixed(2),
                  })}
                </p>
              </div>
            )
          )
        })}
      </SheetContent>
    </Sheet>
  )
}

export default MissionDetail
