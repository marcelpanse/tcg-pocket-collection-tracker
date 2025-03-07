import { BatchUpdateDialog } from '@/components/BatchUpdateDialog'
import { updateMultipleCards } from '@/components/Card.tsx'
import { CardsTable } from '@/components/CardsTable.tsx'
import ExpansionsFilter from '@/components/ExpansionsFilter.tsx'
import OwnedFilter from '@/components/OwnedFilter.tsx'
import PokemonCardDetector from '@/components/PokemonCardDetectorComponent'
import RarityFilter from '@/components/RarityFilter.tsx'
import SearchInput from '@/components/SearchInput.tsx'
import { allCards } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { UserContext } from '@/lib/context/UserContext.ts'
import { useMemo, useState } from 'react'
import { useContext } from 'react'

function Collection() {
  const { user } = useContext(UserContext)
  const { ownedCards, setOwnedCards } = useContext(CollectionContext)
  const [searchValue, setSearchValue] = useState('')
  const [expansionFilter, setExpansionFilter] = useState<string>('all')
  const [rarityFilter, setRarityFilter] = useState<string[]>([])
  const [ownedFilter, setOwnedFilter] = useState<'all' | 'owned' | 'missing'>('all')
  const [resetScrollTrigger, setResetScrollTrigger] = useState(false)

  const _handleDetectionsComplete = (allDetections) => {
    // Do something with all the detections
    console.log('All detections:', allDetections)

    // Here you could process the detections to identify cards
    // and update the collection accordingly
  }

  const _preprocessImage = (img) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = img.width
    canvas.height = img.height
    ctx.drawImage(img, 0, 0)

    // Get image data (RGBA format)
    const imageData = ctx.getImageData(0, 0, img.width, img.height)
    const data = imageData.data

    // Remove alpha channel and normalize pixel values to [0, 1]
    const inputData = new Float32Array(img.width * img.height * 3)
    for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
      inputData[j] = data[i] / 255.0 // R
      inputData[j + 1] = data[i + 1] / 255.0 // G
      inputData[j + 2] = data[i + 2] / 255.0 // B
    }

    // Create a tensor with shape [1, 3, height, width]
    const inputTensor = new ort.Tensor('float32', inputData, [1, 3, img.height, img.width])
    return inputTensor
  }
  const getFilteredCards = useMemo(() => {
    let filteredCards = allCards

    if (expansionFilter !== 'all') {
      filteredCards = filteredCards.filter((card) => card.expansion === expansionFilter)
    }
    if (ownedFilter !== 'all') {
      if (ownedFilter === 'owned') {
        filteredCards = filteredCards.filter((card) => ownedCards.find((oc) => oc.card_id === card.card_id && oc.amount_owned > 0))
      } else if (ownedFilter === 'missing') {
        filteredCards = filteredCards.filter((card) => !ownedCards.find((oc) => oc.card_id === card.card_id && oc.amount_owned > 0))
      }
    }
    if (rarityFilter.length > 0) {
      filteredCards = filteredCards.filter((card) => rarityFilter.includes(card.rarity))
    }
    if (searchValue) {
      filteredCards = filteredCards.filter((card) => {
        return card.name.toLowerCase().includes(searchValue.toLowerCase()) || card.card_id.toLowerCase().includes(searchValue.toLowerCase())
      })
    }

    setResetScrollTrigger(true)
    setTimeout(() => setResetScrollTrigger(false), 100)

    return filteredCards
  }, [expansionFilter, rarityFilter, searchValue, ownedFilter])

  const handleBatchUpdate = async (cardIds: string[], amount: number) => {
    await updateMultipleCards(cardIds, amount, ownedCards, setOwnedCards, user)
  }

  return (
    <div className="flex flex-col gap-y-1 mx-auto max-w-[900px]">
      <div className="flex items-center gap-2 flex-col md:flex-row px-8">
        <ExpansionsFilter expansionFilter={expansionFilter} setExpansionFilter={setExpansionFilter} />
      </div>
      <div className="items-center justify-between gap-2 flex-col md:flex-row px-8 md:flex">
        <SearchInput setSearchValue={setSearchValue} />
        <OwnedFilter ownedFilter={ownedFilter} setOwnedFilter={setOwnedFilter} />
        <RarityFilter rarityFilter={rarityFilter} setRarityFilter={setRarityFilter} />

        <BatchUpdateDialog filteredCards={getFilteredCards} onBatchUpdate={handleBatchUpdate} disabled={getFilteredCards.length === 0} />
      </div>

      <div className="px-8 my-4">
        <PokemonCardDetector />
      </div>

      <div>
        <CardsTable cards={getFilteredCards} resetScrollTrigger={resetScrollTrigger} />
      </div>
    </div>
  )
}

export default Collection
