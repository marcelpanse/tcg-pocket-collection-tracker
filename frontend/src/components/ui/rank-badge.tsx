const rankClassMap: Record<string, string> = {
  D: 'bg-gray-500',
  C: 'bg-yellow-700',
  B: 'bg-blue-600',
  A: 'bg-green-600',
  'A+': 'bg-orange-500',
  S: 'bg-red-600 font-bold',
}
export function RankBadge({ rank }: { rank: string }) {
  return <span className={`${rankClassMap[rank] || 'rank-d'} text-white p-1 h-fit rounded w-7 text-center`}>{rank}</span>
}
