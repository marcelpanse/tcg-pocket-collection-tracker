import { useTranslation } from 'react-i18next'

interface GradientCardProps {
  title: string
  className?: string
  backgroundColor?: string
  packNames: string
  percentage: number
  otherPacks?: { packName: string; percentage: number }[]
}

export function GradientCard({ title, packNames, percentage, className, backgroundColor, otherPacks }: GradientCardProps) {
  const { t } = useTranslation(['gradient-card', 'common/packs'])
  const chancePercentage = Math.round(percentage * 1000) / 10

  console.log('GradientCard', { title, packNames, percentage, className, backgroundColor, otherPacks })

  return (
    <div
      className={`${className} tex flex flex-col items-center justify-center rounded-3xl p-4 sm:p-8 transition-all duration-200 bg-white/70 backdrop-blur border border-slate-200/60 shadow-md`}
      style={{ backgroundColor }}
    >
      {/* Most probable pack title */}
      <div className="w-full flex justify-center mb-4">
        <span className="px-6 py-1 rounded-full bg-white/80 border border-slate-200/60 text-slate-700 text-base sm:text-lg font-semibold shadow-sm select-none">
          {t('mostProbablePack', { defaultValue: 'Most probable pack' })}
        </span>
      </div>
      {/* Main pack card */}
      <div className="w-full flex items-center justify-center gap-2 rounded-2xl bg-white/90 backdrop-blur-sm border border-slate-200/60 py-4 px-4 mb-6 shadow-md">
        <img src={getPokemonImageUrl(title)} alt={title} className="w-10 h-10 sm:w-14 sm:h-14" />
        <span className="font-bold text-slate-800 text-2xl sm:text-4xl flex items-center gap-3">
          {t(title, { ns: 'common/packs' })}
          <span className="ml-2 px-4 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-800 text-xl sm:text-3xl font-bold shadow-sm select-none">
            {chancePercentage}%
          </span>
        </span>
        <img src={getPokemonImageUrl(title)} alt={title} className="w-10 h-10 sm:w-14 sm:h-14" />
      </div>
      {/* Other packs title */}
      {otherPacks &&
        otherPacks.length > 1 &&
        // Filtrar el pack principal
        (() => {
          const filteredPacks = otherPacks.filter((pack) => pack.packName !== title)
          if (filteredPacks.length === 0) return null
          return (
            <>
              <div className="w-full flex justify-center mb-2">
                <span className="px-6 py-1 rounded-full bg-white/80 border border-slate-200/60 text-slate-700 text-base sm:text-lg font-semibold shadow-sm select-none">
                  {t('otherPacks', { defaultValue: 'Other Packs' })}
                </span>
              </div>
              <ul className="w-full flex flex-col gap-2 mb-2 p-3 rounded-xl bg-slate-50/80 border border-slate-200/60 shadow-sm">
                {filteredPacks.map((pack) => (
                  <li
                    key={pack.packName}
                    className="flex items-center gap-4 p-2 rounded-lg bg-white/90 border border-slate-200 hover:shadow-md transition-shadow duration-200"
                  >
                    <img
                      src={getPokemonImageUrl(pack.packName)}
                      alt={pack.packName}
                      className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-100 border border-slate-200"
                      style={{ filter: 'drop-shadow(0 1px 4px rgba(0,0,0,0.10))' }}
                    />
                    <span className="flex-1 text-slate-700 text-sm sm:text-base font-semibold text-left truncate select-none">
                      {t(pack.packName, { ns: 'common/packs', defaultValue: pack.packName })}
                    </span>
                    <span className="px-3 py-1 rounded-full bg-slate-100 border border-slate-300 text-slate-800 text-base sm:text-lg font-bold shadow select-none">
                      {Math.round(pack.percentage * 1000) / 10}%
                    </span>
                  </li>
                ))}
              </ul>
            </>
          )
        })()}
    </div>
  )
}

const getPokemonImageUrl = (packName: string) => {
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

  const pokemon = pokemonMap[packName]

  return `/images/pokemon/${pokemon}.webp`
}
