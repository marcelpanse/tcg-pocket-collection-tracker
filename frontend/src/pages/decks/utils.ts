export function serializeDeckToUrl(cards: Map<number, number>) {
  return [...cards]
    .toSorted(([id1, _amount1], [id2, _amount2]) => id1 - id2)
    .map(([id, amount]) => `${id}:${amount}`)
    .join(',')
}
