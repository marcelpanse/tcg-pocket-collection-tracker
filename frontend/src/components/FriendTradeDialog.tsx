import { CardMiniature } from '@/components/CardMiniature'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import ScrollArea from '@/components/ui/scroll-area'
import { getLookingForTradeCards } from '@/lib/CardsDB'
import type { CollectionRow } from '@/types'
// src/components/FriendTradeDialog.tsx
import { useMemo, useState } from 'react' // Add useEffect

interface FriendTradeDialogProps {
  userCards: CollectionRow[]
  friendCards: CollectionRow[]
  disabled?: boolean
}

export function FriendTradeDialog({ userCards, friendCards, disabled }: FriendTradeDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedCard, setSelectedCards] = useState<{ person: 'user' | 'friend'; cardId: string } | null>()

  const userLookingForCards = useMemo(() => {
    return getLookingForTradeCards({ cardCollection: userCards })
  }, [userCards])

  const friendLookingForCards = useMemo(() => {
    return getLookingForTradeCards({ cardCollection: friendCards })
  }, [userCards])

  const handleSelect = (person: 'user' | 'friend', cardId: string, selected: boolean) => {
    if (!selected) setSelectedCards(null)
    else setSelectedCards({ person, cardId })
  }

  return (
    <>
      <Button className="hidden sm:block" variant="outline" onClick={() => setIsOpen(true)} disabled={disabled}>
        View Trade Matches
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Trade Matches</DialogTitle>
          </DialogHeader>

          <div className="flex flex-row sm:flex-col sm:gap-y-4">
            {(!selectedCard || selectedCard.person === 'friend') && (
              <div>
                <h1>Cards Friend Needs</h1>
                <ScrollArea className="h-64 rounded-md border p-4">
                  <div className="grid grid-cols-5 gap-2">
                    {friendLookingForCards.map((card) => (
                      <CardMiniature
                        key={card.card_id}
                        card={card}
                        showCardRarity
                        onSelect={(cardId: string, selected: boolean) => handleSelect('friend', cardId, selected)}
                        selected={selectedCard?.person === 'friend' && selectedCard?.cardId === card.card_id}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
            {selectedCard && selectedCard.person === 'friend' && (
              <div>
                <h1>Cards You Can Trade</h1>
                <ScrollArea className="h-64 rounded-md border p-4">
                  <div className="grid grid-cols-5 gap-2">
                    {userLookingForCards.map((card) => (
                      <CardMiniature
                        key={card.card_id}
                        card={card}
                        showCardRarity
                        onSelect={(cardId: string, selected: boolean) => handleSelect('user', cardId, selected)}
                        selected={selectedCard?.person === 'user' && selectedCard?.cardId === card.card_id}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
            {(!selectedCard || selectedCard.person === 'user') && (
              <div>
                <h1>Cards You Need</h1>
                <ScrollArea className="h-64 rounded-md border p-4">
                  <div className="grid grid-cols-5 gap-2">
                    {userLookingForCards.map((card) => (
                      <CardMiniature
                        key={card.card_id}
                        card={card}
                        showCardRarity
                        onSelect={(cardId: string, selected: boolean) => handleSelect('user', cardId, selected)}
                        selected={selectedCard?.person === 'user' && selectedCard?.cardId === card.card_id}
                      />
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Exit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
