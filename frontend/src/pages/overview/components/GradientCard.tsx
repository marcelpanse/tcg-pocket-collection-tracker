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
      className={`${className}  flex flex-col items-center justify-center rounded-2xl p-4 sm:p-8 transition-all duration-200 `}
      style={backgroundColor ? { backgroundColor } : undefined}
    >
      {/* Most probable pack title */}
      <div className="w-full flex mb-2">
        <span className="px-2 py-1 text-black text-left text-xl font-bold select-none">
          {t('mostProbablePack', { defaultValue: 'More probability of new card' })}
        </span>
      </div>
      {/* Main pack card */}
      <div className="w-full flex items-center bg-black/90 rounded-full px-4 py-2 mb-2">
        <img
          src={getPokemonImageUrl(title)}
          alt={title}
          className="h-12 w-12"
          onError={(e) => {
            ;(e.currentTarget as HTMLImageElement).src = '/images/pokemon/eevee.webp'
          }}
        />
        <span className="flex-1 text-white text-2xl font-semibold ml-3">{t(title, { ns: 'common/packs', defaultValue: title })}</span>
        <span className="text-white font-bold text-xl">{chancePercentage}%</span>
      </div>
      {/* Other packs title */}
      {otherPacks &&
        otherPacks.length > 1 &&
        (() => {
          const filteredPacks = otherPacks.filter((pack) => pack.packName !== title)
          if (filteredPacks.length === 0) return null
          return (
            <>
              <div className="w-full">
                <span className="text-black text-left text-xl font-bold mb-2 mt-2 select-none block">
                  {t('otherPacks', { defaultValue: 'Probability in other packages' })}
                </span>
              </div>
              <div className="flex flex-col gap-2 w-full">
                {filteredPacks.map((pack) => (
                  <div key={pack.packName} className="flex items-center bg-white rounded-full px-4 py-2">
                    <img
                      src={getPokemonImageUrl(pack.packName)}
                      alt={pack.packName}
                      className="h-12 w-12"
                      onError={(e) => {
                        ;(e.currentTarget as HTMLImageElement).src = '/images/pokemon/eevee.webp'
                      }}
                    />
                    <span className="flex-1 text-black text-xl font-semibold ml-3">
                      {t(pack.packName, { ns: 'common/packs', defaultValue: pack.packName })}
                    </span>
                    <span className="text-black font-bold text-xl">{Math.round(pack.percentage * 1000) / 10}%</span>
                  </div>
                ))}
              </div>
            </>
          )
        })()}
    </div>
  )
}

const getPokemonImageUrl = (packName: string) => {
  // Normalize the packName (lowercase and remove spaces)
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
