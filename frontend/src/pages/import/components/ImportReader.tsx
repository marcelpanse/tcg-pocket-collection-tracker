import { COLLECTION_ID, DATABASE_ID, getDatabase } from '@/lib/Auth'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { UserContext } from '@/lib/context/UserContext'
import type { ImportExportRow } from '@/types'
import { ID } from 'appwrite'
import { use, useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import XLSX from 'xlsx'

export const ImportReader = () => {
  const { user } = use(UserContext)
  const { ownedCards, setOwnedCards } = use(CollectionContext)

  const [processedData, setProcessedData] = useState<(ImportExportRow & { added?: boolean; updated?: boolean; removed?: boolean })[] | null>(null)
  const [numberProcessed, setNumberProcessed] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [progressMessage, setProgressMessage] = useState<string>('')

  const processFileRows = async (data: ImportExportRow[]) => {
    if (data) {
      const db = await getDatabase()
      for (let i = 0; i < data.length; i++) {
        const r = data[i]
        console.log('Row', r)
        console.log('First Owned Card', ownedCards[0])
        const newAmount = Number(r.NumberOwned)
        const cardId = r.Id
        const ownedCard = ownedCards.find((row) => row.card_id === r.Id)
        console.log('Owned Card', ownedCard)
        if (ownedCard && ownedCard.amount_owned !== newAmount) {
          console.log('updating card', ownedCard.card_id, newAmount)
          ownedCard.amount_owned = Math.max(0, newAmount)
          setOwnedCards([...ownedCards])
          await db.updateDocument(DATABASE_ID, COLLECTION_ID, ownedCard.$id, {
            amount_owned: ownedCard.amount_owned,
          })
          setProcessedData((p) => [...(p ?? []), { ...r, updated: newAmount > 0, removed: newAmount === 0 }])
        } else if (!ownedCard && newAmount > 0) {
          console.log('creating card', r.Id, newAmount)
          const newCard = await db.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
            email: user?.email,
            card_id: cardId,
            amount_owned: newAmount,
          })

          setOwnedCards([
            ...ownedCards,
            {
              $id: newCard.$id,
              email: newCard.email,
              card_id: newCard.card_id,
              amount_owned: newCard.amount_owned,
            },
          ])
          setProcessedData((p) => [...(p ?? []), { ...r, added: true }])
        }
        setProgressMessage(`Processed ${i + 1} of ${data.length}`)
        setNumberProcessed((n) => n + 1)
      }
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setIsLoading(true)
    setErrorMessage('')
    const file = acceptedFiles[0]
    const reader = new FileReader()

    reader.onabort = () => {
      setIsLoading(false)
      setErrorMessage('File Was Aborted')
    }

    reader.onerror = () => {
      setIsLoading(false)
      setErrorMessage('Error With File')
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
        setErrorMessage(`Error processing Excel file: ${error}`)
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
        <p>Drag 'n' drop some files here, or click to select files</p>
      </div>
      {isLoading && (
        <>
          <p>Excel file is loading</p>
          <progress className="w-full" value={numberProcessed} />
        </>
      )}
      {errorMessage?.length > 0 && <p className="text-red-400 mb-2">{errorMessage}</p>}
      {progressMessage?.length > 0 && <p className="text-gray-200 mb-2">{progressMessage}</p>}
      {processedData && console.log('Processed Data', processedData) && (
        <div>
          {processedData.length > 0 ? (
            <pre>
              Data updated:
              <table className="w-full text-left table-auto">
                <thead>
                  <tr>
                    <th>Expansion Name</th>
                    <th>ID</th>
                    <th>Card Name</th>
                    <th>Status (Count)</th>
                  </tr>
                </thead>
                {processedData.map((d, index) => (
                  <tbody key={`data-${d.Id}-${index}`}>
                    <tr>
                      <td>{d.Id}</td>
                      <td>{d.CardName}</td>
                      <td>{d.added ? `Added (${d.NumberOwned})` : d.updated ? `Updated (${d.NumberOwned})` : d.removed ? 'Removed' : 'Unknown'}</td>
                    </tr>
                  </tbody>
                ))}
              </table>
            </pre>
          ) : (
            <pre>No Data Updated.</pre>
          )}
        </div>
      )}
    </>
  )
}
