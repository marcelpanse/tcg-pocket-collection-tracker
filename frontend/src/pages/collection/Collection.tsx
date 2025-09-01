import { Siren } from 'lucide-react'
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useMediaQuery } from 'react-responsive'
import { useLoaderData, useNavigate } from 'react-router'
import { CardsTable } from '@/components/CardsTable.tsx'
import FilterPanel, { type Filters } from '@/components/FiltersPanel'
import { MissionsTable } from '@/components/MissionsTable.tsx'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert.tsx'
import { Button } from '@/components/ui/button.tsx'
import { CollectionContext } from '@/lib/context/CollectionContext.ts'
import type { FriendCollectionLoaderReturn } from '@/lib/friendCollectionLoader'
import MissionDetail from '@/pages/collection/MissionDetail.tsx'
import type { Card, Mission } from '@/types'

function Collection() {
  const { friendAccount, friendCollection } = useLoaderData() as Partial<FriendCollectionLoaderReturn>
  const navigate = useNavigate()
  const { t } = useTranslation(['pages/collection'])
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' })

  const { ownedCards, selectedMissionCardOptions, setSelectedMissionCardOptions } = useContext(CollectionContext)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    expansion: 'all',
    pack: 'all',
    cardType: [],
    rarity: [],
    owned: 'all',
    sortBy: 'expansion-newest',
    minNumber: 0,
    maxNumber: 100,
    deckbuildingMode: false,
    allTextSearch: false,
  })
  const [resetScrollTrigger, setResetScrollTrigger] = useState(false)
  const [filteredCards, setFilteredCards] = useState<Card[] | null>(null)
  const [missions, setMissions] = useState<Mission[] | null>(null)

  const cardCollection = friendCollection ?? ownedCards

  useEffect(() => {
    setResetScrollTrigger(true)
    const timeout = setTimeout(() => setResetScrollTrigger(false), 100)
    return () => clearTimeout(timeout)
  }, [filters])

  return (
    <div className="flex flex-col gap-y-1 mx-auto max-w-[900px]">
      <FilterPanel
        cards={cardCollection}
        filters={filters}
        setFilters={setFilters}
        onFiltersChanged={(cards) => setFilteredCards(cards)}
        onChangeToMissions={(missions) => setMissions(missions)}
        visibleFilters={{ expansions: !isMobile, allTextSearch: !isMobile, search: true, owned: !isMobile, rarity: !isMobile }}
        filtersDialog={{
          expansions: true,
          pack: true,
          search: true,
          owned: true,
          sortBy: true,
          rarity: true,
          cardType: true,
          amount: true,
          deckBuildingMode: true,
          allTextSearch: true,
        }}
        batchUpdate={Boolean(friendAccount)}
        share
      >
        <div>
          {friendAccount && (
            <Alert className="mb-4 border-1 border-neutral-700 shadow-none">
              <Siren className="h-4 w-4" />
              <AlertTitle>{t('publicCollectionTitle', { username: friendAccount?.username })}</AlertTitle>
              <AlertDescription>
                <div className="flex items-center">
                  {t('publicCollectionDescription')}
                  <Button className="mb-4" onClick={() => navigate(`/trade/${friendAccount?.friend_id}`)}>
                    {t('showPossibleTrades')}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </div>
      </FilterPanel>
      <div>
        {filteredCards && !missions && (
          <CardsTable
            cards={filteredCards}
            resetScrollTrigger={resetScrollTrigger}
            showStats={!filters.deckbuildingMode}
            extraOffset={24}
            editable={!filters.deckbuildingMode && !friendAccount}
          />
        )}
      </div>
      <div>{missions && <MissionsTable missions={missions} resetScrollTrigger={resetScrollTrigger} />}</div>
      {missions && <MissionDetail missionCardOptions={selectedMissionCardOptions} onClose={() => setSelectedMissionCardOptions([])} />}
    </div>
  )
}

export default Collection
