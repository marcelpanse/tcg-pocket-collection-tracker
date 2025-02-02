type Card = {
  id: string
  name: string
  probabilities: number[] // Probabilities of getting the card in a pack [1-3, 4, 5] cards
}

type Pack = {
  name: string
  cards: Card[]
}

type Collection = {
  [cardId: string]: boolean // true if the card is in the collection
}

/**
 * Calculates the probability of getting a new card in a pack.
 *
 * @param pack - The pack of cards to draw from.
 * @param collection - The player's current collection of cards.
 */
export function calculateNewCardProbability(pack: Pack, collection: Collection): number {
  let probabilityNoNewCard = 1

  // Probabilities of not getting any new card, Index 0 is the probability of not getting any new card in first 3 cards
  const noNewCardProbabilities = [1, 1, 1]

  // Sum all probabilities for cards not in the collection
  const summedProbabilities = [0, 0, 0]
  pack.cards.forEach((card) => {
    if (!collection[card.id]) {
      card.probabilities.forEach((probability, index) => {
        summedProbabilities[index] += probability
      })
    }
  })

  // Calculate the probability of not getting any new card
  summedProbabilities.forEach((summedProbability, index) => {
    if (index === 0) {
      noNewCardProbabilities[index] = Math.pow(1 - summedProbability, 3)
    } else {
      noNewCardProbabilities[index] = 1 - summedProbability
    }
  })

  // Probability of not getting any new card
  probabilityNoNewCard = noNewCardProbabilities.reduce((acc, curr) => acc * curr, 1)

  // Return the probability of getting a new card using toFixed to avoid floating point errors
  return 1 - parseFloat(probabilityNoNewCard.toFixed(20))
}
