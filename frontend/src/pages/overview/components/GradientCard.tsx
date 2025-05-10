import { Trans, useTranslation } from 'react-i18next'

interface GradientCardProps {
  title: string
  className?: string
  backgroundColor?: string
  percentage: number
}

export function GradientCard({ title, percentage, className, backgroundColor }: GradientCardProps) {
  const chancePercentage = Math.round(percentage * 1000) / 10
  const { t } = useTranslation('gradient-card')

  return (
    <div
      className={`${className} text flex flex-col items-center justify-center rounded-4xl p-4 sm:p-8 transition-all duration-200`}
      style={{ backgroundColor }}
    >
      <p className="mb-1 text-center text-md sm:text-xl text-slate-900">
        <img src={`/images/packs/${t('language')}/${title}.png`} alt="" />
      </p>
      <p className="mt-2 text-center text-md sm:text-xl text-slate-900">
        <Trans
          i18nKey="text"
          ns="gradient-card"
          values={{ chancePercentage }}
          components={{
            strong: <span className="font-bold" />,
          }}
        />
      </p>
    </div>
  )
}
