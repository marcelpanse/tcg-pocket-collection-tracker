interface TitleCardProps {
  title: string
  paragraph: string
  className?: string
  backgroundColor?: string
}

export function TitleCard({ title, paragraph, className, backgroundColor }: TitleCardProps) {
  return (
    <div className={`${className} tex flex flex-col items-center justify-center rounded-4xl p-8 transition-all duration-200`} style={{ backgroundColor }}>
      <header className="font-semibold text-6xl text-white">{title}</header>
      <p className="mt-2 text-center text-xl text-white">{paragraph}</p>
    </div>
  )
}
