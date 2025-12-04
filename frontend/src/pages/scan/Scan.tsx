import type { GraphModel } from '@tensorflow/tfjs'
import i18n from 'i18next'
import { SquareCheck, SquareX } from 'lucide-react'
import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CardLine } from '@/components/CardLine'
import { DropdownFilter, TabsFilter } from '@/components/Filters'
import { Spinner } from '@/components/Spinner.tsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getCardById, getCardsByInternalId } from '@/lib/CardsDB'
import { getInteralIdByCardId } from '@/lib/CardsDB.ts'
import type { Hashes } from '@/lib/hash'
import { useCollection, useUpdateCards } from '@/services/collection/useCollection'
import { detectImages, type ExtractedCard, extractCardImages, loadModel } from '@/services/scanner/CardDetectionService'

interface IncrementedCard {
  card_id: string
  previous_amount: number
  increment: number
}

enum State {
  UploadImages = 1,
  UploadingImages = 2,
  ShowMatches = 3,
  ProcessUpdates = 4,
  Confirmation = 5,
}

function decode(base64: string): ArrayBuffer {
  try {
    // @ts-expect-error: Brand new api https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/fromBase64
    return Uint8Array.fromBase64(base64).buffer
  } catch {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
  }
}

const Scan = () => {
  const { t } = useTranslation(['scan', 'common/sets'])

  const { data: ownedCards, isLoading } = useCollection()
  const updateCardsMutation = useUpdateCards()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [state, setState] = useState<State>(State.UploadImages)
  const [error, setError] = useState<string | undefined>(undefined)

  const [model, setModel] = useState<GraphModel>()
  const [hashes, setHashes] = useState<Hashes>()
  const [fallbackHashes, setFallbackHashes] = useState<Hashes>()

  const [extractedCards, setExtractedCards] = useState<ExtractedCard[]>([])
  const [incrementedCards, setIncrementedCards] = useState<IncrementedCard[]>([])

  const cardIncrements = useMemo(() => {
    const card_ids = extractedCards
      .filter((card) => card.increment !== 0 && card.matchedCard)
      .map((card) => ({ card_id: card.matchedCard.card.card_id, increment: card.increment }))
    const counts = new Map<string, number>()
    for (const { card_id, increment } of card_ids) {
      counts.set(card_id, (counts.get(card_id) ?? 0) + increment)
    }
    for (const card_id of counts.keys()) {
      if (counts.get(card_id) === 0) {
        counts.delete(card_id)
      }
    }
    return counts
  }, [extractedCards])

  useEffect(() => {
    const fetchHashes = async (lang: string, set: Dispatch<SetStateAction<Hashes | undefined>>) => {
      try {
        const res = await fetch(`/hashes/${lang}/hashes.json`)
        if (!res.ok) {
          setError(`Could not fetch hashes: ${res.status}: ${res.statusText}`)
          return
        }
        const json = await res.json()
        const decoded = Object.fromEntries(Object.entries(json).map(([k, v]) => [k, decode(v as string)]))
        set(decoded)
      } catch (err) {
        console.error(`Failed getting hashes for '${lang}': ${err}`)
        if (lang === 'en-US') {
          setError(`Error getting card hashes: ${err}`)
        }
      }
    }

    const callback = (lang: string) => {
      if (lang === 'en-US') {
        setHashes({})
      } else {
        fetchHashes(lang, setHashes)
      }
    }

    fetchHashes('en-US', setFallbackHashes)
    callback(i18n.language)

    i18n.on('languageChanged', callback)
    return () => i18n.off('languageChanged', callback)
  }, [i18n])

  useEffect(() => {
    loadModel().then(setModel)
  }, [])

  // Extract card images function
  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!model || !hashes || !fallbackHashes) {
      setError('Model and hashes not loaded yet')
      return
    }

    setState(State.UploadingImages)

    const files = event.target.files
    if (!files) {
      return
    }

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      return
    }

    try {
      const detectionResults = await detectImages(model, imageFiles)
      const allExtractedCards = imageFiles.map((imageFile, i) =>
        extractCardImages(imageFile, detectionResults[i], Object.assign(fallbackHashes, hashes), i18n.language),
      )
      setExtractedCards((await Promise.all(allExtractedCards)).flat())
      setState(State.UploadingImages + 1)
    } catch (error) {
      setError(`Error during detection: ${error}`)
    }
  }

  const handleConfirm = async () => {
    if (isLoading) {
      setError('Confirm called before collection loaded')
      return
    }
    if (!ownedCards) {
      setError('Loading collection failed')
      return
    }
    setState(State.ProcessUpdates)

    if (cardIncrements.size === 0) {
      setState(State.ProcessUpdates + 1)
      setIncrementedCards([])
      return
    }

    const updates: IncrementedCard[] = []

    for (const [card_id, increment] of cardIncrements) {
      const card = getCardById(card_id)
      const previous_amount = ownedCards.get(card?.internal_id || 0)?.amount_owned ?? 0
      updates.push({ card_id, previous_amount, increment })
    }

    try {
      updateCardsMutation.mutate({
        updates: updates.map((x) => ({
          card_id: x.card_id,
          internal_id: getInteralIdByCardId(x.card_id),
          amount_owned: x.previous_amount + x.increment,
        })),
      })
    } catch (error) {
      setError(`Error incrementing card quantities: ${error}`)
      return
    }

    setIncrementedCards(updates)
    setState(State.ProcessUpdates + 1)
  }

  if (error !== undefined) {
    return (
      <Alert variant="destructive" className="max-w-sm mx-auto">
        <AlertTitle>An error occured!</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!model || !hashes || !fallbackHashes) {
    return <div className="mx-auto mt-12 animate-spin rounded-full size-12 border-4 border-white border-t-transparent" />
  }

  return (
    <div className="flex flex-col mx-auto max-w-[900px] p-1 sm:p-2 gap-2 rounded-lg border-1 border-neutral-700 border-solid">
      {state === State.UploadImages && (
        <div className="file-input-container flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md hover:bg-gray-50 dark:hover:bg-gray-900/10">
          <AlertDescription>
            <p className="text-neutral-400 mb-4 text-center">{t('description')}</p>
          </AlertDescription>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple className="w-full hidden" />
          <Button variant="outline" className="mt-2" onClick={() => fileInputRef.current?.click()}>
            {t('selectImages')}
          </Button>
        </div>
      )}

      {state === State.UploadingImages && (
        <Alert variant="default">
          <AlertDescription className="flex items-center space-x-2">
            <Spinner />
            <p>{t('processing')}</p>
          </AlertDescription>
        </Alert>
      )}

      {state === State.ShowMatches && (
        <>
          <h2 className="text-center text-xl">Found {extractedCards.length} cards</h2>
          <p className="text-center text-sm text-neutral-400 px-2">
            Select the increment amount for the matched cards. Click the image to quickly exclude or include a card.
          </p>
          <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-2 my-2">
            {extractedCards.map((card, index) => {
              const isSelected = card.increment !== 0
              const cardInExpansions = getCardsByInternalId(card.matchedCard.card.internal_id)
              if (!cardInExpansions) {
                throw new Error('InternalId doesnt match any card')
              }
              const expansions = cardInExpansions.map((c) => c.expansion)
              const onIncrementChange = (inc: string) => {
                const increment = Number(inc)
                setExtractedCards((arr) => arr.map((x, i) => (i === index ? { ...x, increment } : x)))
              }
              const onExpansionChange = (expansionId: string) => {
                const targetCard = cardInExpansions.find((c) => c.expansion === expansionId)
                if (!targetCard) {
                  throw new Error('Card expansion mismatch')
                }
                setExtractedCards((arr) => arr.map((x, i) => (i === index ? { ...x, matchedCard: { ...x.matchedCard, card: targetCard } } : x)))
              }
              return (
                <div key={index} className={`border-3 rounded-lg p-2 ${card.increment > 0 && 'border-green-400'} ${card.increment < 0 && 'border-red-400'}`}>
                  <h3 className="flex mb-2">
                    {isSelected ? <SquareCheck /> : <SquareX />}
                    <CardLine
                      className="bg-transparent"
                      card_id={card.matchedCard.card.card_id}
                      id="hidden"
                      rarity="hidden"
                      details="hidden"
                      increment={cardIncrements.get(card.matchedCard.card.card_id)}
                    />
                  </h3>
                  <div className="flex gap-2 justify-between mb-2">
                    <TabsFilter options={['-1', '0', '+1']} value={(card.increment > 0 ? '+' : '') + String(card.increment)} onChange={onIncrementChange} />
                    {expansions.length > 1 && (
                      <DropdownFilter className="inline-block" options={expansions} value={card.matchedCard.card.expansion} onChange={onExpansionChange} />
                    )}
                  </div>
                  <button
                    type="button"
                    className={`flex w-full cursor-pointer gap-2 ${!isSelected && 'grayscale'} transition-all duration-200`}
                    onClick={() => (isSelected ? onIncrementChange('0') : onIncrementChange('+1'))}
                  >
                    <div className="w-1/2 relative">
                      <img src={card.imageUrl} alt={`Detected card ${index + 1}`} className="w-full h-auto object-contain" />
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-1 py-0.5 text-center">{t('extractedCard')}</div>
                    </div>
                    <div className="w-1/2 relative">
                      <img src={card.resolvedImageUrl} alt="Best match" className="w-full h-auto object-contain" />
                      <div className="absolute bottom-0 left-0 right-0 bg-green-500/80 text-white text-xs px-1 py-0.5 text-center">
                        {t('percentMatch', { match: (card.matchedCard.similarity * 100).toFixed(0) })}
                      </div>
                    </div>
                  </button>
                </div>
              )
            })}
          </div>

          <Button variant="default" className="mx-auto w-full sm:w-60" onClick={handleConfirm} disabled={cardIncrements.size === 0 || isLoading}>
            {t('updateSelectedCards')}
          </Button>
          <Button variant="outline" className="mx-auto w-full sm:w-60" onClick={() => setState(State.UploadImages)}>
            {t('scanMore')}
          </Button>
        </>
      )}

      {state === State.ProcessUpdates && (
        <Alert variant="default">
          <AlertDescription className="flex items-center space-x-2">
            <Spinner />
            <p>{t('processing')}</p>
          </AlertDescription>
        </Alert>
      )}

      {state === State.Confirmation && (
        <div className="flex flex-col w-full max-w-lg mx-auto">
          <p className="text-xl text-center mb-4">{t('success', { n: incrementedCards.reduce((acc, x) => acc + x.increment, 0) })}</p>
          <ul className="flex flex-col gap-2 mb-8">
            {incrementedCards.map((x) => (
              <li key={x.card_id}>
                <CardLine card_id={x.card_id} amount_owned={x.previous_amount} increment={x.increment} />
              </li>
            ))}
          </ul>
          <Button onClick={() => setState(State.UploadImages)} variant="default">
            {t('scanMore')}
          </Button>
        </div>
      )}
    </div>
  )
}

export default Scan
