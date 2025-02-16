import ExpansionsFilter from '@/components/ExpansionsFilter.tsx'
import OwnedFilter from '@/components/OwnedFilter.tsx'
import RarityFilter from '@/components/RarityFilter.tsx'
import SearchInput from '@/components/SearchInput.tsx'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion.tsx'
import { Button } from '@/components/ui/button.tsx'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog.tsx'
import { allCards } from '@/lib/CardsDB'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import { FiltersContext, FiltersContextDefaultState } from '@/lib/context/FiltersContext.ts'
import { DialogDescription } from '@radix-ui/react-dialog'
import { Check, Settings2 } from 'lucide-react'
import { use, useMemo, useState } from 'react'
import { useImmer } from 'use-immer'
import { CardsTable } from './components/CardsTable.tsx'
import { isArtist, isCardType, isEvolutionStage, isEx, isExpansion, isMinimumHp, isOwned, isPack, isRarity, isSearch, isWeakness } from './filters.ts'

function Collection() {
  const { ownedCards } = use(CollectionContext)
  const [filterState, setFilterState] = useImmer(FiltersContextDefaultState)
  const [open, setOpen] = useState(false)

  const filteredCards = useMemo(() => {
    /**
     * This filtering process is commutative (order-independent) but performance-sensitive.
     * Placing more restrictive filters first improves efficiency.
     * The implementation is O(n) and memory-efficient, avoiding intermediary arrays.
     */
    const filters = [
      isOwned(filterState.ownedFilterMode, ownedCards),
      isExpansion(filterState.expansionFilter),
      isRarity(filterState.rarityFilter),
      isSearch(filterState.searchValue),
      isMinimumHp(filterState.minimumHp),
      isCardType(filterState.cardTypeFilter),
      isEvolutionStage(filterState.evolutionStageFilter),
      isWeakness(filterState.weaknessFilter),
      isEx(filterState.exFilter),
      isPack(filterState.packFilter),
      isArtist(filterState.artistFilter),
    ]

    return allCards.filter((card) => filters.every((filter) => filter(card)))
  }, [filterState, ownedCards])

  return (
    <FiltersContext.Provider value={{ filterState, setFilterState }}>
      <div className="flex flex-col gap-y-1 mx-auto max-w-[900px]">
        <div className="flex items-center gap-2 flex-col md:flex-row px-8">
          <SearchInput
            setSearchValue={(searchValue) =>
              setFilterState((draft) => {
                draft.searchValue = searchValue
              })
            }
          />
          <ExpansionsFilter />
        </div>
        <div className="flex items-center justify-between gap-2 flex-col md:flex-row px-8">
          <OwnedFilter />
          <RarityFilter />
        </div>
        <div className="flex items-center justify-end gap-2 flex-col md:flex-row px-8 pb-8">
          <Button onClick={() => setOpen(true)} variant="ghost">
            <Settings2 />
            All Filters
          </Button>
        </div>
        <CardsTable cards={filteredCards} />
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filters</DialogTitle>
            <DialogDescription className="text-sm">Contains all the filters for filtering collection cards.</DialogDescription>
          </DialogHeader>
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="owned-filter">
              <AccordionTrigger>Owned Filter</AccordionTrigger>
              <AccordionContent className="[&>*]:flex-grow">
                <OwnedFilter fullWidth />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="rarity-filter">
              <AccordionTrigger>Rarity Filter</AccordionTrigger>
              <AccordionContent>
                <RarityFilter />
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="expansion-filter">
              <AccordionTrigger>Expansion Filter</AccordionTrigger>
              <AccordionContent>
                <ExpansionsFilter />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
          <DialogFooter>
            <Button onClick={() => setOpen(false)} className="cursor-pointer">
              <Check />
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FiltersContext.Provider>
  )
}

export default Collection
