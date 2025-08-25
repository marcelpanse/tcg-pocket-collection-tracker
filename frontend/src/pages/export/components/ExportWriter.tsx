import i18n from 'i18next'
import { use } from 'react'
import { useTranslation } from 'react-i18next'
import XLSX from 'xlsx'
import { Button } from '@/components/ui/button.tsx'
import { allCards } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { getCardNameByLang } from '@/lib/utils'
import type { ImportExportRow } from '@/types'

export const ExportWriter = () => {
  const { t } = useTranslation('pages/export')
  const { ownedCards } = use(CollectionContext)

  const createFile = () => {
    const json: ImportExportRow[] = allCards
      .filter((c) => !c.linkedCardID)
      .map((ac) => {
        return {
          Id: ac.card_id,
          CardName: getCardNameByLang(ac, i18n.language),
          NumberOwned: ownedCards.find((oc) => oc.card_id === ac.card_id)?.amount_owned ?? 0,
          Expansion: ac.expansion,
          Pack: ac.pack,
          Rarity: ac.rarity,
        }
      })
    const sheet = XLSX.utils.json_to_sheet(json)
    const book = XLSX.utils.book_new(sheet)
    XLSX.writeFile(book, 'tcgcollectiontracterexport.csv')
  }

  return (
    <Button onClick={() => createFile()} type="submit" className="w-40">
      {t('downloadCSV')}
    </Button>
  )
}
