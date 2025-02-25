import { allCards } from '@/lib/CardsDB'
import { useEffect, useState } from 'react'

declare global {
  interface Window {
    cvjs_loaded?: boolean
    Module?: unknown
    cv?: {
      Mat: unknown
      matFromImageData: (data: ImageData) => unknown
      matchTemplate: (src: unknown, template: unknown, result: unknown, method: unknown) => void
      minMaxLoc: (mat: unknown) => unknown
      TM_CCOEFF_NORMED: unknown
    }
  }
}
interface CvMat {
  delete(): void
}

interface CvPoint {
  x: number
  y: number
}

interface CvMinMaxLocResult {
  minVal: number
  maxVal: number
  minLoc: CvPoint
  maxLoc: CvPoint
}

declare const cv: {
  matFromImageData: (imageData: ImageData) => CvMat
  Mat: new () => CvMat
  matchTemplate: (image: CvMat, template: CvMat, result: CvMat, method: number) => void
  minMaxLoc: (mat: CvMat) => CvMinMaxLocResult
  TM_CCOEFF_NORMED: number
}

const CardTracker = () => {
  const [originalCards, setOriginalCards] = useState<HTMLImageElement[]>([]) // Loaded card images
  const [results, setResults] = useState<{ screenshot: string; cards: string[] }[]>([]) // Matching results
  const [cvReady, setCvReady] = useState(false) // Track OpenCV initialization
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const DOWNSAMPLE_FACTOR_ORIGINAL = 0.2
  const DOWNSAMPLE_FACTOR_SCREEN = 0.5
  const MATCH_THRESHOLD = 0.6
  let isLoadingScript = false

  // Fetch card names
  const getCardNames = async () => {
    try {
      const cardNames = allCards.map((x) => `${x.image?.split('/').at(-1)}`)
      return cardNames.filter((name) => name) // Filter out undefined entries
    } catch (error) {
      console.error('Error reading card names:', error)
      return []
    }
  }

  const loadAndProcessImage = async (url: string): Promise<HTMLImageElement> => {
    // Load the original image
    const originalImage = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.src = url
      img.onload = () => resolve(img)
      img.onerror = (err) => reject(err)
    })

    // Create a canvas to resize and crop the image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Calculate the crop dimensions (top 10%-50% of the card)
    const startY = originalImage.height * 0.1
    const cropHeight = originalImage.height * 0.4

    // Calculate the new dimensions after downsampling
    const newWidth = Math.floor(originalImage.width * DOWNSAMPLE_FACTOR_ORIGINAL)
    const newHeight = Math.floor(cropHeight * DOWNSAMPLE_FACTOR_ORIGINAL)

    // Set canvas dimensions
    canvas.width = newWidth
    canvas.height = newHeight

    // Draw the cropped and resized image
    ctx?.drawImage(originalImage, 0, startY, originalImage.width, cropHeight, 0, 0, newWidth, newHeight)

    // Create a new, resized image
    return new Promise<HTMLImageElement>((resolve) => {
      const resizedImage = new Image()
      resizedImage.src = canvas.toDataURL('image/jpeg', 0.8) // Use JPEG for smaller size
      resizedImage.dataset.originalName = url.split('/').pop() || ''
      resizedImage.onload = () => resolve(resizedImage)
    })
  }
  // Load OpenCV.js
  useEffect(() => {
    // Check if OpenCV is already defined and ready
    if (window.cv && typeof window.cv === 'object') {
      console.log('OpenCV is already available and ready')
      setCvReady(true)
      return
    }

    // Check if we've already marked OpenCV as loaded in this session
    if (window.cvjs_loaded) {
      console.log('OpenCV has already been loaded but may not be ready yet')

      // Set up a polling mechanism to check when it's ready
      const checkCvReady = setInterval(() => {
        if (window.cv && typeof window.cv === 'object') {
          console.log('OpenCV is now ready')
          setCvReady(true)
          clearInterval(checkCvReady)
        }
      }, 10000)

      // Stop checking after 30 seconds to prevent infinite polling
      setTimeout(() => {
        clearInterval(checkCvReady)
        if (!cvReady) {
          setCvReady(true)
          clearInterval(checkCvReady)

          // setLoadingError('OpenCV failed to initialize within the expected time.');
        }
      }, 30000)

      return
    }

    // Prevent multiple loads
    if (isLoadingScript) {
      console.log('OpenCV.js is already being loaded')
      return
    }

    isLoadingScript = true
    window.cvjs_loaded = true

    // Remove any existing script to prevent conflicts
    const existingScript = document.getElementById('opencv-js')
    if (existingScript) {
      existingScript.remove()
    }

    // Create a new script element
    const script = document.createElement('script')
    script.id = 'opencv-js'
    script.src = 'https://docs.opencv.org/4.5.5/opencv.js' // Using a specific version to avoid unexpected changes
    script.async = true

    // Set up the callback for when OpenCV is ready
    window.Module = {
      onRuntimeInitialized: () => {
        console.log('OpenCV.js initialized successfully')
        setCvReady(true)
        isLoadingScript = false
      },
    }

    script.onerror = () => {
      console.error('Failed to load OpenCV.js')
      setLoadingError('Failed to load OpenCV.js. Please refresh the page and try again.')
      isLoadingScript = false
    }

    document.body.appendChild(script)

    return () => {
      // Don't remove the script on component unmount, as it needs to stay loaded
      isLoadingScript = false
    }
  }, [])

  // Load card images once OpenCV is ready
  useEffect(() => {
    if (!cvReady) return

    const loadCardImages = async () => {
      try {
        const cardNames = await getCardNames()
        console.log('Card names:', cardNames)

        if (cardNames.length === 0) {
          console.warn('No card names found')
          return
        }

        console.log('Loading and processing card images...')
        const processedCards = await Promise.all(cardNames.map((name) => loadAndProcessImage(`/images/${name}`)))

        console.log(`Processed ${processedCards.length} cards`)
        setOriginalCards(processedCards)
      } catch (error) {
        console.error('Error loading card images:', error)
        setLoadingError('Failed to load card images. Please check network connectivity.')
      }
    }

    loadCardImages()
  }, [cvReady])

  // Process a screenshot for template matching
  const processScreenshot = async (img: HTMLImageElement): Promise<HTMLImageElement> => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    // Resize the screenshot for better performance
    const newWidth = Math.floor(img.width * DOWNSAMPLE_FACTOR_SCREEN)
    const newHeight = Math.floor(img.height * DOWNSAMPLE_FACTOR_SCREEN)

    canvas.width = newWidth
    canvas.height = newHeight

    ctx?.drawImage(img, 0, 0, newWidth, newHeight)

    return new Promise<HTMLImageElement>((resolve) => {
      const resizedImage = new Image()
      resizedImage.src = canvas.toDataURL('image/jpeg', 0.8)
      resizedImage.onload = () => resolve(resizedImage)
    })
  }

  // Utility function to convert HTMLImageElement to ImageData
  const imageToImageData = (img: HTMLImageElement): ImageData => {
    const canvas = document.createElement('canvas')
    canvas.width = img.width
    canvas.height = img.height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new Error('Could not get canvas context')
    }
    ctx.drawImage(img, 0, 0)
    return ctx.getImageData(0, 0, img.width, img.height)
  }

  // Optimized template matching function
  const templateMatch = (screenshot: HTMLImageElement, template: HTMLImageElement): number => {
    if (!window.cv || !window.cv.Mat) {
      throw new Error('OpenCV.js is not fully initialized.')
    }

    let screenshotMat = null
    let templateMat = null
    let result = null

    try {
      // Convert images to OpenCV Mat format
      const screenshotData = imageToImageData(screenshot)
      const templateData = imageToImageData(template)

      screenshotMat = cv.matFromImageData(screenshotData)
      templateMat = cv.matFromImageData(templateData)
      result = new cv.Mat()

      // Template matching with normalized cross-correlation
      cv.matchTemplate(screenshotMat, templateMat, result, cv.TM_CCOEFF_NORMED)

      // Find best match
      const minMaxLoc = cv.minMaxLoc(result)
      return minMaxLoc.maxVal
    } catch (error) {
      console.error('Error during template matching:', error)
      return 0
    } finally {
      // Clean up OpenCV resources
      if (result) result.delete()
      if (screenshotMat) screenshotMat.delete()
      if (templateMat) templateMat.delete()
    }
  }

  // Faster image comparison using worker threads if available
  const compareImages = async (screenshot: HTMLImageElement, originalCards: HTMLImageElement[]): Promise<string[]> => {
    if (originalCards.length === 0) {
      return []
    }

    // Process screenshot once
    const processedScreenshot = await processScreenshot(screenshot)
    const matches: string[] = []

    // Batch processing for better UI responsiveness
    const BATCH_SIZE = 10
    const batches = Math.ceil(originalCards.length / BATCH_SIZE)

    for (let i = 0; i < batches; i++) {
      const start = i * BATCH_SIZE
      const end = Math.min(start + BATCH_SIZE, originalCards.length)
      const batchCards = originalCards.slice(start, end)

      // Process each card in the batch
      const batchPromises = batchCards.map(async (card) => {
        try {
          const confidence = templateMatch(processedScreenshot, card)
          if (confidence > MATCH_THRESHOLD) {
            return card.dataset.originalName || ''
          }
          return null
        } catch (error) {
          console.error('Error comparing with card:', error)
          return null
        }
      })

      // Allow UI to update between batches
      await new Promise((resolve) => setTimeout(resolve, 0))

      // Collect results from this batch
      const batchResults = await Promise.all(batchPromises)
      matches.push(...(batchResults.filter(Boolean) as string[]))
    }

    return matches
  }

  // Handle file uploads
  const handleImagesUploaded = async (screenshots: FileList | null) => {
    if (!cvReady) {
      alert('OpenCV.js is not ready yet. Please wait...')
      return
    }

    if (!screenshots || screenshots.length === 0) {
      return
    }

    // Clear previous results
    setResults([])
    setIsProcessing(true)

    try {
      for (let i = 0; i < screenshots.length; i++) {
        const file = screenshots[i]
        const reader = new FileReader()

        // Process each screenshot
        const processFile = () =>
          new Promise<void>((resolve) => {
            reader.onload = async (e) => {
              if (!e.target || !e.target.result) {
                resolve()
                return
              }

              const img = new Image()
              img.src = e.target.result as string

              img.onload = async () => {
                try {
                  console.time('Image processing')
                  const matches = await compareImages(img, originalCards)
                  console.timeEnd('Image processing')

                  setResults((prev) => [...prev, { screenshot: file.name, cards: matches }])
                } catch (error) {
                  console.error('Error processing image:', error)
                  setResults((prev) => [...prev, { screenshot: file.name, cards: ['Error processing image'] }])
                } finally {
                  resolve()
                }
              }

              img.onerror = () => {
                setResults((prev) => [...prev, { screenshot: file.name, cards: ['Failed to load image'] }])
                resolve()
              }
            }

            reader.onerror = () => {
              setResults((prev) => [...prev, { screenshot: file.name, cards: ['Error reading file'] }])
              resolve()
            }

            reader.readAsDataURL(file)
          })

        await processFile()
      }
    } finally {
      setIsProcessing(false)
    }
  }
  return (
    <div className="p-4">
      {loadingError ? (
        <div className="text-red-500 mb-4">
          <p>Error: {loadingError}</p>
          <button type="button" className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600" onClick={() => window.location.reload()}>
            Refresh Page
          </button>
        </div>
      ) : (
        <div>
          {!cvReady ? (
            <div className="flex items-center space-x-2 mb-4">
              <svg
                className="animate-spin h-5 w-5 text-blue-500"
                xmlns="http://www.w3.org/2000/svg"
                aria-label="Loading spinner"
                fill="none"
                role="img"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p>Loading OpenCV.js... Please wait.</p>
            </div>
          ) : (
            <div className="mb-4">
              <div className="flex items-center mb-2">
                {isProcessing && (
                  <svg
                    className="animate-spin h-4 w-4 text-blue-500 ml-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    role="img"
                    aria-label="Loading spinner"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium mr-2">
                  Upload screenshots to analyze:
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleImagesUploaded(e.target.files)}
                    accept="image/*"
                    className="p-2 border rounded w-full"
                    disabled={isProcessing}
                  />
                </label>
                <p className="text-sm text-gray-600 mt-2">{originalCards.length} card templates loaded and optimized for comparison.</p>
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-6">
              <h2 className="text-lg font-semibold mb-4">Results:</h2>
              {results.map((result, index) => (
                <div key={index} className="mb-4 p-3 border rounded">
                  <h3 className="font-medium">{result.screenshot}</h3>
                  {result.cards.length > 0 ? (
                    <ul className="mt-2 list-disc pl-5">
                      {result.cards.map((card, i) => (
                        <li key={i}>{card}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-gray-500">No matches found.</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CardTracker
