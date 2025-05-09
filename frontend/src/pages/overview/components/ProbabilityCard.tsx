import { getPokemonImageUrl, getPokemonName } from '@/lib/utils'

interface ProbabilityCardProps {
  title: string
  data: { packName: string; percentage: number; fill: string }[]
  footer?: string
}

export function ProbabilityCard({ title, data }: ProbabilityCardProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-4xl p-4 sm:p-8 transition-all duration-200 border-2 border-slate-600 border-solid">
      <header className="font-semibold text-balance text-center text-white">{title}</header>
      <p className="mt-2 text-center text-md sm:text-xl text-white">
        {data.map((item) => {
          return (
            <div key={item.packName} className="w-full flex items-center  rounded-full px-4 py-2 mb-2 gap-2">
              <img src={getPokemonImageUrl(item.packName)} alt={item.packName} className="h-12 w-12" />
              <span className="flex-1 text-white text-2xl font-semibold ml-3">{getPokemonName(item.packName)}</span>
              <span className="text-white font-bold text-xl">{(item.percentage * 100).toFixed(2)}%</span>
            </div>
          )
        })}
      </p>
    </div>
  )
}
