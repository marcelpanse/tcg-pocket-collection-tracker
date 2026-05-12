import { useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import XLSX from 'xlsx'
import ErrorAlert from '@/components/ErrorAlert.tsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button.tsx'
import { useDeleteCard, useUpdateCards } from '@/services/collection/useCollection'
import type { ImportExportRow } from '@/types'

enum State {
  UploadFile = 1,
  Processing = 2,
  Finished = 3,
}

export const ImportReader = () => {
  const { t } = useTranslation('pages/import')
  const updateCardsMutation = useUpdateCards()
  const deleteCardMutation = useDeleteCard()

  const [state, setState] = useState<State>(State.UploadFile)
  const [error, setError] = useState<Error | null>(null)

  const processFileRows = async (data: ImportExportRow[]) => {
    const amountUpdates = data.map((r) => ({ internal_id: r.InternalId, card_id: r.Id, amount_owned: Math.max(0, Number(r.NumberOwned)) }))
    const collectionDeletes = data.filter((r) => !r.Collected).map((r) => r.Id)

    if (amountUpdates.length > 0) {
      await updateCardsMutation.mutateAsync(amountUpdates)
    }
    // We need to do this sequentially to roll back unneccessary collection statuses
    if (collectionDeletes.length > 0) {
      await deleteCardMutation.mutateAsync(collectionDeletes)
    }

    setState(State.Finished)
  }

  const onDrop = (acceptedFiles: File[]) => {
    setState(State.Processing)
    const file = acceptedFiles[0]
    const reader = new FileReader()

    reader.onabort = () => {
      setState(State.UploadFile)
    }

    reader.onerror = () => {
      throw new Error('Failed reading file')
    }

    reader.onload = async (e) => {
      setState(State.Processing)
      try {
        const workbook = XLSX.read(e.target?.result)
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const jsonData = XLSX.utils.sheet_to_json<ImportExportRow>(worksheet)

        const requiredColumns = ['Id', 'InternalId', 'NumberOwned', 'Collected']
        const firstRow = jsonData[0]
        const missingColumns = requiredColumns.filter((col) => !(col in firstRow))
        if (missingColumns.length > 0) {
          throw new Error(`Missing required columns: ${missingColumns.join(', ')}`)
        }

        await processFileRows(jsonData)
        setState(State.Finished)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      }
    }

    reader.readAsArrayBuffer(file)
  }
  const { getRootProps, getInputProps } = useDropzone({ onDrop })

  if (error) {
    return (
      <ErrorAlert error={error}>
        <Button
          onClick={() => {
            setError(null)
            setState(State.UploadFile)
          }}
          className="mt-2 ml-auto block"
        >
          Try Again
        </Button>
      </ErrorAlert>
    )
  }
  if (state === State.UploadFile) {
    return (
      <div className="flex flex-col justify-center p-6 border-2 border-dashed rounded-md mt-2" {...getRootProps()}>
        <input {...getInputProps()} />
        <p>{t('import.dragNDrop')}</p>
      </div>
    )
  }
  if (state === State.Processing) {
    return (
      <Alert className="mt-2">
        <AlertTitle>{t('import.processing')}</AlertTitle>
      </Alert>
    )
  }
  if (state === State.Finished) {
    return (
      <Alert className="mt-2">
        <AlertTitle>Done</AlertTitle>
        <AlertDescription>Your collection has been updated.</AlertDescription>
      </Alert>
    )
  }

  throw new Error('Unknown state')
}
