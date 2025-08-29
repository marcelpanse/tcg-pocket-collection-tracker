import { use, useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import XLSX from 'xlsx'
import { CollectionContext } from '@/lib/context/CollectionContext'
import type { CollectionRowUpdate, ImportExportRow } from '@/types'

export const ImportReader = () => {
  const { t } = useTranslation('pages/import')
  const { ownedCards, updateCards } = use(CollectionContext)

  const [processedData, setProcessedData] = useState<(ImportExportRow & { added?: boolean; updated?: boolean; removed?: boolean })[] | null>(null)
  const [numberProcessed, setNumberProcessed] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [progressMessage, setProgressMessage] = useState<string>('')

  const processFileRows = async (data: ImportExportRow[]) => {
    const cardArray: CollectionRowUpdate[] = []

    for (let i = 0; i < data.length; i++) {
      const r = data[i]
      console.log('Row', r)
      const newAmount = Math.max(0, Number(r.NumberOwned))
      const cardId = r.Id
      const ownedCard = ownedCards.find((row) => row.card_id === r.Id)
      console.log('Owned Card', ownedCard)

      cardArray.push({ card_id: cardId, amount_owned: newAmount })

      // update UI
      if (ownedCard && ownedCard.amount_owned !== newAmount) {
        console.log('updating card', ownedCard.card_id, newAmount)
        ownedCard.amount_owned = Math.max(0, newAmount)
        setProcessedData((p) => [...(p ?? []), { ...r, updated: newAmount > 0, removed: newAmount === 0 }])
      } else if (!ownedCard && newAmount > 0) {
        console.log('creating card', r.Id, newAmount)
        setProcessedData((p) => [...(p ?? []), { ...r, added: true }])
      }
      setProgressMessage(`Processed ${i + 1} of ${data.length}`)
      setNumberProcessed((n) => n + 1)
    }

    updateCards(cardArray)
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
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
  }, [])
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
      {progressMessage?.length > 0 && <p className="text-gray-200 mb-2">{progressMessage}</p>}
      {processedData && console.log('Processed Data', processedData) && (
        <div>
          {processedData.length > 0 ? (
            <pre>
              {t('dataUpdated')}
              <table className="w-full text-left table-auto">
                <thead>
                  <tr>
                    <th>{t('expansionName')}</th>
                    <th>{t('id')}</th>
                    <th>{t('cardName')}</th>
                    <th>{t('statusCount')}</th>
                  </tr>
                </thead>
                {processedData.map((d, index) => (
                  <tbody key={`data-${d.Id}-${index}`}>
                    <tr>
                      <td>{d.Id}</td>
                      <td>{d.CardName}</td>
                      <td>
                        {d.added
                          ? t('added', { count: d.NumberOwned })
                          : d.updated
                            ? t('updated', { count: d.NumberOwned })
                            : d.removed
                              ? t('removed')
                              : t('unknown')}
                      </td>
                    </tr>
                  </tbody>
                ))}
              </table>
            </pre>
          ) : (
            <pre>{t('noDataUpdated')}</pre>
          )}
        </div>
      )}
    </>
  )
}
