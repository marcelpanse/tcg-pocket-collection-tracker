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
      <header className="font-semibold text-2xl sm:text-6xl text-slate-900">{t(title, { ns: 'common/packs' })}</header>
      <p className="mt-2 text-center text-md sm:text-xl text-slate-900">
        {t('text', {
          packNames: packNames,
          chancePercentage: chancePercentage,
        })}
      </p>
    </div>
  )
}
