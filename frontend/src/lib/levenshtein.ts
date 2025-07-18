export function levenshtein(a: string, b: string): number {
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  let prev = Array(a.length + 1)
    .fill(0)
    .map((_, i) => i)
  let curr = Array(a.length + 1)

  for (let j = 1; j <= b.length; j++) {
    curr[0] = j
    for (let i = 1; i <= a.length; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[i] = Math.min(
        prev[i] + 1, // deletion
        curr[i - 1] + 1, // insertion
        prev[i - 1] + cost, // substitution
      )
    }
    ;[prev, curr] = [curr, prev]
  }

  return prev[a.length]
}
