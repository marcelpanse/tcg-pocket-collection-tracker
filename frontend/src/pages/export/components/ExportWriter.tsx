import { Button } from '@/components/ui/button.tsx'
import { allCards } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext'
import type { ImportExportRow } from '@/types'
import { use } from 'react'
import XLSX from 'xlsx'

export const ExportWriter = () => {
  const { ownedCards } = use(CollectionContext)

  const createFile = () => {
    const json: ImportExportRow[] = allCards
      .filter((c) => !c.linkedCardID)
      .map((ac) => {
        return {
          Id: ac.card_id,
          CardName: ac.name,
          NumberOwned: ownedCards.find((oc) => oc.card_id === ac.card_id)?.amount_owned ?? 0,
        }
      })
    const sheet = XLSX.utils.json_to_sheet(json)
    const book = XLSX.utils.book_new(sheet)
    XLSX.writeFile(book, 'tcgcollectiontracterexport.csv')
  }

  return (
    <Button onClick={() => createFile()} type="submit" className="w-40">
      Download CSV file
    </Button>
  )
}
