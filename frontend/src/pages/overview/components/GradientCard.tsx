interface GradientCardProps {
  title: string
  className?: string
  backgroundColor?: string
  packNames: string
  percentage: number
}

export function GradientCard({ title, packNames, percentage, className, backgroundColor }: GradientCardProps) {
  return (
    <div className={`${className} tex flex flex-col items-center justify-center rounded-4xl p-8 transition-all duration-200`} style={{ backgroundColor }}>
      <header className="font-semibold text-6xl text-white">{title}</header>
      <p className="mt-2 text-center text-xl text-white">
        is the most probable pack to get a new card from among {packNames} packs. You have a {Math.round(percentage * 1000) / 10}% chance of getting a new card.
      </p>
    </div>
  )
}
