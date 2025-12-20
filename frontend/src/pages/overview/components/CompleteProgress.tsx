import { useTranslation } from 'react-i18next'
import { Progress } from '@/components/ui/progress.tsx'

interface CompleteProgressProps {
  className?: string
  title: string
  barColor?: string
  collected: number
  available: number
}

export function CompleteProgress({ className, title, barColor, collected, available }: CompleteProgressProps) {
  const { t } = useTranslation('expansion-overview')

  return (
    <div className={className}>
      {title}
      <Progress value={(collected / available) * 100} barColor={barColor} />
      {t('youHave', { nCardsOwned: collected, nTotalCards: available })}
    </div>
  )
}
