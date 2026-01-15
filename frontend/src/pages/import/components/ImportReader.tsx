import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import XLSX from 'xlsx'
import { useCollection, useUpdateCards } from '@/services/collection/useCollection'
import type { CardAmountUpdate, CollectionRow, ImportExportRow } from '@/types'

export const ImportReader = () => {
  const { t } = useTranslation('pages/import')
  const { data: ownedCards = new Map<number, CollectionRow>() } = useCollection()
  const updateCardsMutation = useUpdateCards()

  const [numberProcessed, setNumberProcessed] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [progressMessage, setProgressMessage] = useState<string>('')

  const processFileRows = async (data: ImportExportRow[]) => {
    const cardArray: CardAmountUpdate[] = []

    for (let i = 0; i < data.length; i++) {
      const r = data[i]
      console.log('Row', r)
      const newAmount = Math.max(0, Number(r.NumberOwned))
      const cardId = r.Id
      const ownedCard = ownedCards.get(r.InternalId)
      console.log('Owned Card', ownedCard)

      if (r.Collected) {
        cardArray.push({ card_id: cardId, internal_id: r.InternalId, amount_owned: newAmount })
      }

      // update UI
      if (i + 1 === data.length) {
        setProgressMessage(`Done! Processed ${data.length} cards.`)
      } else {
        setProgressMessage(`Processed ${i + 1} of ${data.length}`)
      }
      setNumberProcessed((n) => n + 1)
    }

    updateCardsMutation.mutate(cardArray)
  }

  const onDrop = (acceptedFiles: File[]) => {
    setIsLoading(true)
    setErrorMessage('')
    const file = acceptedFiles[0]
    const reader = new FileReader()

    reader.onabort = () => {
      setIsLoading(false)
      setErrorMessage(t('fileWasAborted'))
    }

    reader.onerror = () => {
      setIsLoading(false)
      setErrorMessage(t('errorWithFile'))
    }

    reader.onload = async (e) => {
      try {
        const workbook = XLSX.read(e.target?.result)
        console.log('Workbook Sheets', workbook.SheetNames)
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json<ImportExportRow>(worksheet)
        console.log('JsonData', jsonData)
        await processFileRows(jsonData)
        console.log('Processed File Rows')
      } catch (error) {
        console.error('Error processing Excel file:', error)
        setErrorMessage(`${t('errorProcessingExcel')}: ${error}`)
      } finally {
        setIsLoading(false)
      }
    }

    reader.readAsArrayBuffer(file)
  }
  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  return (
    <>
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <p>{t('dragNDrop')}</p>
      </div>
      {isLoading && (
        <>
          <p>{t('loading')}</p>
          <progress className="w-full" value={numberProcessed} />
        </>
      )}
      {errorMessage?.length > 0 && <p className="text-red-400 mb-2">{errorMessage}</p>}
      {progressMessage?.length > 0 && <p className="text-gray-200 mt-4 mb-2">{progressMessage}</p>}
    </>
  )
}
