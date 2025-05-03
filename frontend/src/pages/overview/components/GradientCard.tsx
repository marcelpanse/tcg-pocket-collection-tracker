import { useTranslation } from 'react-i18next'

interface GradientCardProps {
  title: string
  className?: string
  backgroundColor?: string
  packNames: string
  percentage: number
}

export function GradientCard({ title, packNames, percentage, className, backgroundColor }: GradientCardProps) {
  const { t } = useTranslation(['gradient-card', 'common/packs'])
  const chancePercentage = Math.round(percentage * 1000) / 10

  return (
    <div
      className={`${className} tex flex flex-col items-center justify-center rounded-4xl p-4 sm:p-8 transition-all duration-200`}
      style={{ backgroundColor }}
    >
      <header className="font-semibold text-center text-2xl sm:text-6xl text-slate-900 flex items-center justify-center">
        <img src={getPokemonImageUrl(title)} alt={title} className="w-8 h-8 sm:w-12 sm:h-12 mr-2" />
        {t(title, { ns: 'common/packs' })}
        <img src={getPokemonImageUrl(title)} alt={title} className="w-8 h-8 sm:w-12 sm:h-12 ml-2" />
      </header>
      <p className="mt-2 text-center text-md sm:text-xl text-slate-900">
        {t('text', {
          packNames: packNames,
          chancePercentage: chancePercentage,
        })}
      </p>
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

  return `/images/pokemon/${pokemon}.png`
}
