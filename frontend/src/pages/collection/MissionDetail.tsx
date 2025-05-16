import FancyCard from '@/components/FancyCard.tsx'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { getCardById } from '@/lib/CardsDB.ts'
import type { Card } from '@/types'

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
        <div className="flex flex-col items-center">
          <div className="px-10 py-4 w-full">
            {missionCardOptions.map((cardId) => {
              return <FancyCard key={cardId} card={getCardById(cardId) as Card} selected={false} />
            })}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MissionDetail
