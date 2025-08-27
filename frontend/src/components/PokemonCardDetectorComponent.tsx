import i18n from 'i18next'
import type { ChangeEvent, FC } from 'react'
import { use, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/Spinner.tsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogOverlay, DialogTitle } from '@/components/ui/dialog'
import { allCards } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { UserContext } from '@/lib/context/UserContext'
import { getCardNameByLang } from '@/lib/utils'
import { CardHashStorageService } from '@/services/CardHashStorageService'
import { ImageSimilarityService } from '@/services/ImageHashingService'
import PokemonCardDetectorService, { type DetectionResult } from '@/services/PokemonCardDetectionServices'
import type { Card, CollectionRowUpdate } from '@/types'

interface PokemonCardDetectorProps {
  onDetectionComplete?: (results: DetectionResult[]) => void
  modelPath?: string
}

interface ExtractedCard {
  imageUrl: string
  confidence: number
  hash?: ArrayBuffer
  matchedCard?: {
    id: string
    similarity: number
    imageUrl?: string
  }
  resolvedImageUrl?: string
  topMatches?: Array<{
    id: string
    similarity: number
    card: Card
  }>
  selected?: boolean
}

enum State {
  Error = 0,
  Closed = 1,
  UploadImages = 2,
  UploadingImages = 3,
  ShowMatches = 4,
  ProcessUpdates = 5,
  Confirmation = 6,
}

const PokemonCardDetector: FC<PokemonCardDetectorProps> = ({ onDetectionComplete, modelPath = '/model/model.json' }) => {
  const { t } = useTranslation('scan')
  const { ownedCards, updateCards } = use(CollectionContext)
  const { user } = use(UserContext)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [state, setState] = useState<State>(State.Closed)
  const [error, setError] = useState<string>('')

  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(false)
  const [isGeneratingHashes, setIsGeneratingHashes] = useState<boolean>(false)
  const isInitialized = !isLoadingModel && !isGeneratingHashes

  const [initProgress, setInitProgress] = useState(0)
  const [amount, setAmount] = useState(1)

  const [extractedCards, setExtractedCards] = useState<ExtractedCard[]>([])
  const [incrementedCards, setIncrementedCards] = useState<number>(0)

  const detectorService = PokemonCardDetectorService.getInstance()

  useEffect(() => {
    if (state === State.Closed + 1) {
      if (extractedCards.length > 0) {
        setExtractedCards([])
        setAmount(1)
      }
    }
    if (state !== State.Closed) {
      initializeModel().catch(console.error)
      generateAndStoreHashes().catch(console.error)
    }
  }, [modelPath, state])

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

  const hashingService = ImageSimilarityService.getInstance()
  const hashStorageService = CardHashStorageService.getInstance()
  const uniqueCards = useMemo(() => {
    return allCards.reduce((acc, card) => {
      if (!acc.some((c) => c.card_id === card.card_id)) {
        acc.push(card)
      }
      return acc
    }, [] as Card[])
  }, [allCards])

  const generateAndStoreHashes = async () => {
    try {
      setIsGeneratingHashes(true)
      await hashStorageService.initDB()
      const storedHashCount = await hashStorageService.getHashCount()

      if (storedHashCount !== uniqueCards.length) {
        console.log('Checking and generating missing card hashes...')

        const batchSize = 80
        const totalCards = uniqueCards.length
        const allHashes = []
        const existingHashes = await hashStorageService.getAllHashes()

        for (let i = 0; i < totalCards; i += batchSize) {
          const batch = uniqueCards.slice(i, i + batchSize)

          // Process one batch
          const batchPromises = batch.map(async (card) => {
            try {
              // Check if hash already exists for this card
              const existingHash = existingHashes.find((h) => h.id === card.card_id)
              if (existingHash) {
                return existingHash
              }

              const resolvedImagePath = await getRightPathOfImage(card.image)
              const hash = await hashingService.calculatePerceptualHash(resolvedImagePath)
              return { id: card.card_id, hash }
            } catch (error) {
              setState(State.Error)
              setError(`Error generating hash for card ${card.card_id}: ${error}`)
              return null
            }
          })

          const batchResults = await Promise.all(batchPromises)
          const validResults = batchResults.filter((hash): hash is { id: string; hash: ArrayBuffer } => hash !== null)
          allHashes.push(...validResults)

          setInitProgress(Math.min(i + batchSize, totalCards) / totalCards)
        }

        await hashStorageService.storeHashes(allHashes)
        console.log('All missing hashes generated and stored')
      } else {
        console.log('Using stored hashes from IndexDB')
      }
    } catch (error) {
      setState(State.Error)
      setError(`Error in hash generation/storage:, ${error}`)
    } finally {
      setIsGeneratingHashes(false)
    }
  }

  // Extract card images function
  const extractCardImages = async (file: File, detections: DetectionResult) => {
    if (!file.type.startsWith('image/')) {
      throw new Error('Invalid file type')
    }
    const image = new Image()
    const imageUrl = URL.createObjectURL(file)
    const hashingService = ImageSimilarityService.getInstance()

    return new Promise<ExtractedCard[]>((resolve) => {
      image.onload = async () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Get all stored hashes for comparison
        const storedHashes = await hashStorageService.getAllHashes()

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
              const hash = await hashingService.calculatePerceptualHash(cardImageUrl)

              // Calculate similarityes for all cards and sort them
              const matches = storedHashes
                .map((storedHash) => {
                  const similarity = hashingService.calculateSimilarity(hash, storedHash.hash)
                  const matchedCard = uniqueCards.find((card) => card.card_id === storedHash.id)
                  return {
                    id: storedHash.id,
                    similarity,
                    card: matchedCard as Card,
                  }
                })
                .sort((a, b) => b.similarity - a.similarity)

              // Get top 5 matches
              const topMatches = matches.slice(0, 5)

              // Best match is the first one
              const bestMatch = topMatches[0]

              const resolvedImageUrl = bestMatch ? await getRightPathOfImage(bestMatch.card.image) : undefined

              return {
                imageUrl: cardImageUrl,
                confidence: detection.confidence,
                hash,
                matchedCard: bestMatch
                  ? {
                      id: bestMatch.id,
                      similarity: bestMatch.similarity,
                      imageUrl: bestMatch.card.image,
                    }
                  : undefined,
                resolvedImageUrl,
                topMatches,
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
        throw new Error('Invalid image URL')
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

      if (onDetectionComplete) {
        onDetectionComplete(detectionResults)
      }
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

  const selectedCount = extractedCards.filter((card) => card.selected).length

  const incrementCards = async (cardIds: string[]) => {
    if (!user || !user.user.email) {
      setState(State.Error)
      setError('User not logged in')
      return 0
    }

    const counts = new Map()
    for (const cardId of cardIds) {
      counts.set(cardId, (counts.get(cardId) || 0) + amount)
    }

    const cardArray: CollectionRowUpdate[] = []

    for (const [card_id, increment] of counts) {
      const ownedCard = ownedCards.find((row) => row.card_id === card_id)
      cardArray.push({ card_id, amount_owned: (ownedCard?.amount_owned ?? 0) + increment })
    }

    updateCards(cardArray)

    return cardIds.length * amount
  }

  const handleConfirm = async () => {
    if (amount === 0) {
      setState(State.ProcessUpdates + 1)
      setIncrementedCards(0)
      return
    }

    setState(State.ProcessUpdates)

    const cardIds = extractedCards.filter((card) => card.selected && card.matchedCard).map((card) => card.matchedCard?.id)

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

  const renderPotentialMatches = async (card: ExtractedCard, index: number) => {
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
            {card.matchedCard && (
              <div className="w-1/2 relative">
                <img src={card.resolvedImageUrl} alt="Best match" className="w-full h-auto object-contain" />
                <div className="absolute bottom-0 left-0 right-0 bg-green-500/80 text-white text-xs px-1 py-0.5 text-center">
                  {t('percentMatch', { match: (card.matchedCard.similarity * 100).toFixed(0) })}
                </div>
              </div>
            )}
          </div>

          {/* Potential matches thumbnails */}
          <div className="flex justify-between items-center mb-2 w-full">
            <span className="text-sm font-medium">
              {card.selected ? t('selected') : t('clickToSelect')}{' '}
              {card.matchedCard &&
                card.topMatches &&
                card.topMatches
                  .filter((match) => match.id === card.matchedCard?.id)
                  .map((match) => getCardNameByLang(match.card, i18n.language))
                  .join(' ')}
            </span>
          </div>
        </div>
      </button>
    )
  }

  return (
    <div className="pokemon-card-detector flex justify-end">
      <Button onClick={() => setState(State.Closed + 1)} variant="ghost">
        {t('scan')}
      </Button>

      <Dialog
        open={state !== State.Closed}
        onOpenChange={(open) => {
          if (!open) {
            setState(State.Closed)
          }
        }}
      >
        <DialogOverlay className="DialogOverlay">
          <DialogContent className="DialogContent max-w-4xl">
            <DialogHeader>
              <DialogTitle>{t('title')}</DialogTitle>
            </DialogHeader>

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
                  <p>{t('loading', { initProgress: (initProgress * 100).toFixed(0) })}</p>
                </AlertDescription>
              </Alert>
            )}

            {isInitialized && state === State.UploadImages && (
              <button
                type="button"
                className="file-input-container flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/10"
                onClick={() => fileInputRef.current?.click()}
              >
                <AlertDescription>
                  <p className="mb-4 text-center">{t('description')}</p>
                </AlertDescription>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple className="w-full hidden" />
                <Button variant="outline" className="mt-2">
                  {t('selectImages')}
                </Button>
              </button>
            )}

            {state === State.UploadingImages && (
              <Alert variant="default">
                <AlertDescription className="flex items-center space-x-2">
                  <Spinner />
                  <p>{t('loading', { initProgress })}</p>
                </AlertDescription>
              </Alert>
            )}

            {state === State.ShowMatches && (
              <div>
                <div className="flex gap-2 justify-between my-4 flex-wrap">
                  <Button variant="outline" onClick={handleDeselectAll} className="hidden sm:block">
                    {t('deselectAll')}
                  </Button>
                  <Button variant="outline" onClick={handleSelectAll} className="hidden sm:block">
                    {t('selectAll')}
                  </Button>
                </div>

                <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
                  {extractedCards.map((card, index) => renderPotentialMatches(card, index))}
                </div>

                <div className="flex flex-col items-center text-center">
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
              </div>
            )}

            {state === State.ProcessUpdates && (
              <Alert variant="default">
                <AlertDescription className="flex items-center space-x-2">
                  <Spinner />
                  <p>{t('processing')}</p>
                </AlertDescription>
              </Alert>
            )}

            {state === State.Confirmation && <p>{t('success', { n: incrementedCards })}</p>}

            <DialogFooter className="gap-y-4">
              <Button
                variant="outline"
                onClick={() => {
                  setState(State.Closed)
                }}
              >
                {state === State.ShowMatches ? t('cancel') : t('close')}
              </Button>
              {state === State.ShowMatches && (
                <Button onClick={handleConfirm} disabled={selectedCount === 0} variant="default">
                  {t('updateSelectedCards')}
                </Button>
              )}
              {state === State.Confirmation && (
                <Button onClick={() => setState(State.Closed + 1)} variant="default">
                  {t('scanMore')}
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </DialogOverlay>
      </Dialog>
    </div>
  )
}

export default PokemonCardDetector
