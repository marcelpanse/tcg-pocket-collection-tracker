interface ProbabilityCardProps {
  packName: string
  percentage: number
  subtitle?: string
}

const getPokemonImageUrl = (packName: string) => {
  const normalizedPackName = packName.toLowerCase().replace(/\s+/g, '')
  const pokemonMap: Record<string, string> = {
    pikachupack: 'pikachu',
    charizardpack: 'charizard',
    mewtwopack: 'mewtwo',
    dialgapack: 'dialga',
    palkiapack: 'palkia',
    mewpack: 'mew',
    arceuspack: 'arceus',
    shiningrevelrypack: 'rayquaza',
    lunalapack: 'lunala',
    solgaleopack: 'solgaleo',
    everypack: 'eevee',
    all: 'mew',
  }
  const pokemon = pokemonMap[normalizedPackName] || 'eevee'
  return `/images/pokemon/${pokemon}.webp`
}

export function ProbabilityCard({ packName, percentage, subtitle = 'More probability of new card' }: ProbabilityCardProps) {
  return (
    <div className="w-full h-full min-h-[320px] rounded-2xl border border-white p-8 bg-black flex flex-col items-center justify-center">
      <div className="flex flex-col items-center justify-center gap-2 mb-2 w-full">
        <span className="text-white font-bold text-xl text-center w-full">{packName}</span>
        <img
          src={getPokemonImageUrl(packName)}
          alt={packName}
          className="h-7 w-7 mx-auto"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).src = '/images/pokemon/eevee.webp'
          }}
        />
      </div>
      <div className="text-white font-extrabold text-7xl mb-2 text-center">{(Math.round(percentage * 1000) / 10).toFixed(1)}%</div>
      <hr className="w-full border-t border-white/60 mb-4" />
      <div className="text-white text-center text-base opacity-80">{subtitle}</div>
    </div>
  )
}
