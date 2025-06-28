import { incrementMultipleCards } from '@/components/Card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogOverlay, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input.tsx'
import { allCards } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext'
import { UserContext } from '@/lib/context/UserContext'
import { getCardNameByLang } from '@/lib/utils'
import { CardHashStorageService } from '@/services/CardHashStorageService'
import { ImageSimilarityService } from '@/services/ImageHashingService'
import PokemonCardDetectorService, { type DetectionResult } from '@/services/PokemonCardDetectionServices'
import type { Card, CollectionRow } from '@/types'
import i18n from 'i18next'
import type { ChangeEvent, FC } from 'react'
import { use, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { user } = use(UserContext)
  const { ownedCards, setOwnedCards } = use(CollectionContext)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [state, setState] = useState<State>(State.Closed)
  const [error, setError] = useState<string>('')

  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(false)
  const [isGeneratingHashes, setIsGeneratingHashes] = useState<boolean>(false)
  const isInitialized = !isLoadingModel && !isGeneratingHashes

  const [initProgress, setInitProgress] = useState(0)
  const [amount, setAmount] = useState(1)
  const [showPotentialMatches, setShowPotentialMatches] = useState<boolean>(false)

  const [extractedCards, setExtractedCards] = useState<ExtractedCard[]>([])
  const [incrementedCards, setIncrementedCards] = useState<CollectionRow[]>([])

  const detectorService = PokemonCardDetectorService.getInstance()

  useEffect(() => {
    if (state === State.Closed + 1) {
      if (extractedCards.length > 0) {
        setExtractedCards([])
        setAmount(1)
        setShowPotentialMatches(false)
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

  function getRightPathOfImage(imageUrl: string | undefined): string {
    const langCode = i18n.language.split('-')[0].toUpperCase()
    const baseName = imageUrl
      ?.split('/')
      .at(-1)
      ?.replace(/_[A-Z]{2}\.webp$/, `_${langCode}.webp`)
    const imagePath = `/images/${i18n.language}/${baseName}`

    const img = new Image()
    img.src = imagePath
    img.onerror = () => {
      return `/images/en-US/${imageUrl?.split('/').at(-1)}`
    }

    return imagePath
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

              const resolvedImagePath = getRightPathOfImage(card.image)
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

              return {
                imageUrl: cardImageUrl,
                confidence: detection.confidence,
                hash,
                matchedCard: bestMatch
                  ? {
                      id: bestMatch.id,
                      similarity: bestMatch.similarity,
                      imageUrl: getRightPathOfImage(bestMatch.card.image),
                    }
                  : undefined,
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
    if (!files || files.length === 0) return

    const imageFiles = Array.from(files).filter((file) => file.type.startsWith('image/'))
    if (imageFiles.length === 0) return

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

  const handleChangeMatch = (cardIndex: number, matchId: string) => {
    setExtractedCards((prev) => {
      const updated = [...prev]
      const card = updated[cardIndex]

      if (card.topMatches) {
        const newMatch = card.topMatches.find((match) => match.id === matchId)
        if (newMatch) {
          updated[cardIndex] = {
            ...card,
            matchedCard: {
              id: newMatch.id,
              similarity: newMatch.similarity,
              imageUrl: getRightPathOfImage(newMatch.card.image),
            },
          }
        }
      }

      return updated
    })
  }

  const handleConfirm = async () => {
    if (amount === 0) {
      setState(State.ProcessUpdates + 1)
      setIncrementedCards([])
      return
    }

    setState(State.ProcessUpdates)

    const cardIds = extractedCards.filter((card) => card.selected && card.matchedCard).map((card) => card.matchedCard?.id)

    if (cardIds.length > 0) {
      try {
        const incrementedCards = await incrementMultipleCards(
          cardIds.filter((id): id is string => id !== undefined),
          amount,
          ownedCards,
          setOwnedCards,
          user,
        )
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
      <div
        key={index}
        className={`border rounded-md p-2 cursor-pointer transition-all duration-200 ${
          card.selected ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/70' : 'border-gray-200 grayscale'
        }`}
        onClick={() => handleSelect(index, !card.selected)}
      >
        <div className="flex flex-col items-center">
          {/* Selection indicator */}
          {card.matchedCard && card.topMatches && showPotentialMatches && (
            <div className="mt-2 mb-2 w-full">
              <p className="text-sm font-medium mb-4">{t('otherPotentialMatch')}</p>
              <div className="grid grid-cols-4 gap-1">
                {card.topMatches
                  .filter((match) => match.id !== card.matchedCard?.id)
                  .map((match) => (
                    <div
                      key={match.id}
                      className="p-1 border rounded cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transform hover:scale-150 hover:z-50 transition-all duration-200 ease-in-out"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleChangeMatch(index, match.id)
                      }}
                      title={getCardNameByLang(match.card, i18n.language)}
                    >
                      <img
                        src={getRightPathOfImage(match.card.image)}
                        alt={getCardNameByLang(match.card, i18n.language)}
                        className="w-full h-auto object-contain"
                      />
                      <div className="text-xs text-center mt-1 bg-black/60 text-white py-0.5 rounded">{(match.similarity * 100).toFixed(0)}%</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

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
                <img src={getRightPathOfImage(card.matchedCard.imageUrl)} alt="Best match" className="w-full h-auto object-contain" />
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
      </div>
    )
  }

  const Spinner = () => (
    <svg
      aria-hidden="true"
      className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
      viewBox="0 0 100 101"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
        fill="currentColor"
      />
      <path
        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
        fill="currentFill"
      />
    </svg>
  )

  return (
    <div className="pokemon-card-detector flex justify-end">
      <Button onClick={() => setState(State.Closed + 1)} variant="ghost">
        {t('scan')}
      </Button>

      <Dialog
        open={state !== State.Closed}
        onOpenChange={(open) => {
          if (!open) setState(State.Closed)
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

            {!isInitialized && (
              <Alert variant="default">
                <AlertDescription className="flex items-center space-x-2">
                  <Spinner />
                  <p>{t('loading', { initProgress: (initProgress * 100).toFixed(0) })}</p>
                </AlertDescription>
              </Alert>
            )}

            {isInitialized && state === State.UploadImages && (
              <div
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
              </div>
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
                  <Button variant="outline" onClick={() => setShowPotentialMatches((prev) => !prev)}>
                    {showPotentialMatches ? t('hideEditMatches') : t('showEditMatches')}
                  </Button>
                  <Button variant="outline" onClick={handleSelectAll} className="hidden sm:block">
                    {t('selectAll')}
                  </Button>
                </div>

                <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
                  {extractedCards.map((card, index) => renderPotentialMatches(card, index))}
                </div>

                <div className="flex flex-col items-center text-center">
                  <label htmlFor="increment">
                    {t('setIncrement')}
                    <Input name="increment" type="number" min="0" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
                  </label>
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

            {state === State.Confirmation && <p>{t('success', { n: incrementedCards.length * amount })}</p>}

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
