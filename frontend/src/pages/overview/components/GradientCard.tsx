import type { FC } from 'react'

interface GradientCardProps {
  title: string
  paragraph: string
  className?: string
  backgroundColor?: string
}
export const GradientCard: FC<GradientCardProps> = ({ title, paragraph, className, backgroundColor }) => {
  return (
    <div className={`${className} rounded-4xl flex flex-col tex items-center justify-center p-8`} style={{ backgroundColor }}>
      <header className="text-7xl font-semibold text-white">{title}</header>
      <p className="text-2xl text-white mt-2 text-center">{paragraph}</p>
    </div>
  )
}
