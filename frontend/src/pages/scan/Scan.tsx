import i18n from 'i18next'
import type { ChangeEvent, Dispatch, SetStateAction } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/Spinner.tsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { allCards } from '@/lib/CardsDB'
import { calculatePerceptualHash, calculateSimilarity, imageToBuffers } from '@/lib/hash'
import { getCardNameByLang } from '@/lib/utils'
import { useCollection, useUpdateCards } from '@/services/collection/useCollection'
import CardDetectorService, { type DetectionResult } from '@/services/scanner/CardDetectionService'
import type { Card, CollectionRowUpdate } from '@/types'

interface ExtractedCard {
  imageUrl: string
  confidence: number
  hash?: ArrayBuffer
  matchedCard: {
    similarity: number
    card: Card
  }
  resolvedImageUrl?: string
  selected?: boolean
}

enum State {
  Error = 0,
  UploadImages = 1,
  UploadingImages = 2,
  ShowMatches = 3,
  ProcessUpdates = 4,
  Confirmation = 5,
}

type Hashes = Record<string, ArrayBuffer>

const modelPath = '/model/model.json'

const Scan = () => {
  const { t } = useTranslation('scan')

  const { data: ownedCards = [] } = useCollection()
  const updateCardsMutation = useUpdateCards()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [state, setState] = useState<State>(State.UploadImages)
  const [error, setError] = useState<string>('')

  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(false)
  const [hashes, setHashes] = useState<Hashes>()
  const [fallbackHashes, setFallbackHashes] = useState<Hashes>()
  const isInitialized = useMemo(() => !isLoadingModel && !!hashes && !!fallbackHashes, [isLoadingModel, hashes, fallbackHashes])

  const [amount, setAmount] = useState(1)

  const [extractedCards, setExtractedCards] = useState<ExtractedCard[]>([])
  const [incrementedCards, setIncrementedCards] = useState<number>(0)

  const detectorService = useMemo(() => CardDetectorService.getInstance(), [])

  useEffect(() => {
    const fetchHashes = async (lang: string, set: Dispatch<SetStateAction<Hashes | undefined>>) => {
      try {
        const res = await fetch(`/hashes/${lang}/hashes.json`)
        if (!res.ok) {
          setState(State.Error)
          setError(`Could not fetch hashes: ${res.status}: ${res.statusText}`)
          return
        }
        const json = await res.json()
        // @ts-expect-error: Brand new api https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/fromBase64
        const decoded = Object.fromEntries(Object.entries(json).map(([k, v]) => [k, Uint8Array.fromBase64(v).buffer]))
        set(decoded)
      } catch (err) {
        console.error(`Failed getting hashes for '${lang}': ${err}`)
        if (lang === 'en-US') {
          setState(State.Error)
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
    initializeModel().catch(console.error)
  }, [])

  useEffect(() => {
    if (state === State.UploadImages) {
      if (extractedCards.length > 0) {
        setExtractedCards([])
        setAmount(1)
      }
    }
  }, [state])

  const initializeModel = async () => {
    try {
      setIsLoadingModel(true)
      await detectorService.loadModel(modelPath)
      console.log('Model loaded successfully')
    } catch (error) {
      setState(State.Error)
      setError(`Error loading model: ${error}`)
    } finally {
      setIsLoadingModel(false)
    }
  }

  function getRightPathOfImage(imageUrl?: string): Promise<string> {
    const baseName = imageUrl?.split('/').at(-1)
    const localizedPath = `/images/${i18n.language}/${baseName}`
    const fallbackPath = `/images/en-US/${baseName}`

    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        console.log('[Image Load] Success:', localizedPath)
        resolve(localizedPath)
      }
      img.onerror = () => {
        console.warn('[Image Load] Failed:', localizedPath, 'returning', fallbackPath, 'instead')
        resolve(fallbackPath)
      }
      img.src = localizedPath
    })
  }

  // Extract card images function
  const extractCardImages = async (file: File, detections: DetectionResult) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('PokemonCardDetectorComponent.tsx:extractCardImages: Invalid file type')
    }
    if (!hashes || !fallbackHashes) {
      throw new Error('Cant extract card images: hashes not loaded yet')
    }
    const image = new Image()
    const imageUrl = URL.createObjectURL(file)

    return new Promise<ExtractedCard[]>((resolve) => {
      image.onload = async () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        const extractedCards = await Promise.all(
          detections.detections
            .filter((detection) => detection.confidence >= 50)
            .map(async (detection) => {
              const points = detection.points
              const [x1, y1] = points[0]
              const [x2, y2] = points[2]
              const width = x2 - x1
              const height = y2 - y1

              canvas.width = width
              canvas.height = height

              ctx?.drawImage(image, x1, y1, width, height, 0, 0, width, height)

              const cardImageUrl = canvas.toDataURL('image/png')
              const buffers = await imageToBuffers(cardImageUrl)
              const hash = calculatePerceptualHash(buffers)

              // Calculate similarityes for all cards and sort them
              const matches = allCards
                .map((c) => {
                  const c_hash = hashes[c.card_id] ?? fallbackHashes[c.card_id]
                  if (!c_hash) {
                    console.warn(`Couldn't find hash for card ${c.card_id}`)
                    return { card: c, similarity: 0 }
                  }
                  return { card: c, similarity: calculateSimilarity(hash, c_hash) }
                })
                .sort((a, b) => b.similarity - a.similarity)

              // Best match is the first one
              const bestMatch = matches[0]

              const resolvedImageUrl = bestMatch ? await getRightPathOfImage(bestMatch.card.image) : undefined

              return {
                imageUrl: cardImageUrl,
                confidence: detection.confidence,
                hash,
                matchedCard: bestMatch,
                resolvedImageUrl,
                selected: true, // Default to selected
              }
            }),
        )

        URL.revokeObjectURL(imageUrl)
        resolve(extractedCards)
      }
      if (imageUrl.startsWith('blob:')) {
        image.src = imageUrl
      } else {
        console.error('Invalid image URL:', imageUrl)
        URL.revokeObjectURL(imageUrl)
        throw new Error('PokemonCardDetectorComponent.tsx:extractCardImages: Invalid image URL')
      }
    })
  }

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    setState(State.UploadingImages)

    const files = event.target.files
    if (!files || files.length === 0) {
      return
    }

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (imageFiles.length === 0) {
      return
    }

    try {
      if (!detectorService.isModelLoaded()) {
        await detectorService.loadModel(modelPath)
      }

      const detectionResults = await detectorService.detectImages(imageFiles)
      console.log(detectionResults)

      // Extract card images
      const allExtractedCards: ExtractedCard[] = []
      for (let i = 0; i < imageFiles.length; i++) {
        const extractedFromImage = await extractCardImages(imageFiles[i], detectionResults[i])
        allExtractedCards.push(...extractedFromImage)
      }
      setExtractedCards(allExtractedCards)
      console.log(allExtractedCards)

      setState(State.UploadingImages + 1)
    } catch (error) {
      setState(State.Error)
      setError(`Error during detection: ${error}`)
    }
  }

  const handleSelect = (index: number, selected: boolean) => {
    setExtractedCards((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], selected }
      return updated
    })
  }

  const handleSelectAll = () => {
    setExtractedCards((prev) => prev.map((card) => ({ ...card, selected: true })))
  }

  const handleDeselectAll = () => {
    setExtractedCards((prev) => prev.map((card) => ({ ...card, selected: false })))
  }

  const selectedCount = useMemo(() => extractedCards.filter((card) => card.selected).length, [extractedCards])

  const incrementCards = async (cardIds: string[]) => {
    const counts = new Map()
    for (const cardId of cardIds) {
      counts.set(cardId, (counts.get(cardId) || 0) + amount)
    }

    const cardArray: CollectionRowUpdate[] = []

    for (const [card_id, increment] of counts) {
      const ownedCard = ownedCards.find((row) => row.card_id === card_id)
      cardArray.push({ card_id, amount_owned: (ownedCard?.amount_owned ?? 0) + increment })
    }

    updateCardsMutation.mutate({ updates: cardArray })

    return cardIds.length * amount
  }

  const handleConfirm = async () => {
    if (amount === 0) {
      setState(State.ProcessUpdates + 1)
      setIncrementedCards(0)
      return
    }

    setState(State.ProcessUpdates)

    const cardIds = extractedCards.filter((card) => card.selected && card.matchedCard).map((card) => card.matchedCard.card.card_id)

    if (cardIds.length > 0) {
      try {
        const incrementedCards = await incrementCards(cardIds.filter((id): id is string => id !== undefined))
        setIncrementedCards(incrementedCards)
      } catch (error) {
        setError(`Error incrementing card quantities: ${error}`)
        setState(State.Error)
        return
      }
    }
    setState(State.ProcessUpdates + 1)
  }

  const renderPotentialMatches = (card: ExtractedCard, index: number) => {
    return (
      <button
        type="button"
        key={index}
        className={`border rounded-md p-2 cursor-pointer transition-all duration-200 ${
          card.selected ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/70' : 'border-gray-200 grayscale'
        }`}
        onClick={() => handleSelect(index, !card.selected)}
      >
        <div className="flex flex-col items-center">
          {/* Extracted card and best match side by side */}
          <div className="flex w-full gap-2 mb-2">
            {/* Extracted card */}
            <div className="w-1/2 relative">
              <img src={card.imageUrl} alt={`Detected card ${index + 1}`} className="w-full h-auto object-contain" />
              <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-1 py-0.5 text-center">{t('extractedCard')}</div>
            </div>

            {/* Best match card */}
            <div className="w-1/2 relative">
              <img src={card.resolvedImageUrl} alt="Best match" className="w-full h-auto object-contain" />
              <div className="absolute bottom-0 left-0 right-0 bg-green-500/80 text-white text-xs px-1 py-0.5 text-center">
                {t('percentMatch', { match: (card.matchedCard.similarity * 100).toFixed(0) })}
              </div>
            </div>
          </div>

          {/* Potential matches thumbnails */}
          <div className="flex justify-between items-center mb-2 w-full">
            <span className="text-sm font-medium">
              {card.selected ? t('selected') : t('clickToSelect')} {getCardNameByLang(card.matchedCard.card, i18n.language)}
            </span>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="flex flex-col mx-auto max-w-[900px] p-4 mt-4 mb-10 rounded-lg border-1 border-neutral-700 border-solid">
      {error && (
        <Alert variant="destructive">
          <AlertTitle>An error occured!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {!isInitialized && state !== State.UploadingImages && (
        <Alert variant="default">
          <AlertDescription className="flex items-center space-x-2">
            <Spinner />
            <p>{t('loading', { initProgress: 50 })}</p>
          </AlertDescription>
        </Alert>
      )}

      {isInitialized && state === State.UploadImages && (
        // biome-ignore lint/a11y/noStaticElementInteractions: cant be a button because it contains another button
        <div
          className="file-input-container flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/10"
          onClick={() => fileInputRef.current?.click()}
        >
          <AlertDescription>
            <p className="mb-4 text-center">{t('description')}</p>
          </AlertDescription>
          <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple className="w-full hidden" />
          <Button variant="outline" className="mt-2">
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
          <div className="flex gap-2 justify-between my-4 flex-wrap">
            <Button variant="outline" onClick={handleDeselectAll}>
              {t('deselectAll')}
            </Button>
            <Button variant="outline" onClick={handleSelectAll}>
              {t('selectAll')}
            </Button>
          </div>

          <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">{extractedCards.map((card, index) => renderPotentialMatches(card, index))}</div>

          <div className="flex flex-col items-center text-center mt-4">
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="incrementType" value="increment" checked={amount === 1} onChange={() => setAmount(1)} />
                <span>{t('increment')}</span>
              </label>
              <label className="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="incrementType" value="decrement" checked={amount === -1} onChange={() => setAmount(-1)} />
                <span>{t('decrement')}</span>
              </label>
            </div>
          </div>
          <Button className="mx-auto mt-2 min-w-60" onClick={handleConfirm} disabled={selectedCount === 0} variant="default">
            {t('updateSelectedCards')}
          </Button>
          <Button className="mx-auto mt-2 min-w-60 border" onClick={() => setState(State.UploadImages)} variant="ghost">
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
        <>
          <p className="text-xl text-center mb-8">{t('success', { n: incrementedCards })}</p>
          <Button onClick={() => setState(State.UploadImages)} variant="default">
            {t('scanMore')}
          </Button>
        </>
      )}
    </div>
  )
}

export default Scan
