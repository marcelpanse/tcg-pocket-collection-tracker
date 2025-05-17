import FancyCard from '@/components/FancyCard.tsx'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { getCardById } from '@/lib/CardsDB.ts'
import { getCardNameByLang } from '@/lib/utils.ts'
import i18n from 'i18next'

interface MissionDetailProps {
  missionCardOptions: string[]
  onClose: () => void // Function to close the sidebar
}

function MissionDetail({ missionCardOptions, onClose }: MissionDetailProps) {
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
            List of Eligible Cards: {missionCardOptions.length} option{missionCardOptions.length === 1 ? '' : 's'}
          </SheetTitle>
        </SheetHeader>
        {missionCardOptions.map((cardId) => {
          const foundCard = getCardById(cardId)
          return (
            foundCard && (
              <div className="flex flex-col items-center">
                <div className="px-10 py-4 w-full">
                  <FancyCard card={foundCard} selected={false} />
                </div>
                <p className="max-w-[130px] overflow-hidden text-ellipsis whitespace-nowrap font-semibold text-[12px] pt-2">
                  {cardId} - {getCardNameByLang(foundCard, i18n.language)}
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
