import type React from 'react'

interface RadialChartProps {
  /** Valor entre 0 y 1 */
  value: number
  /** Texto central */
  label?: string
  sublabel?: string
  /** Color del círculo de progreso */
  color?: string
  /** Tamaño en px */
  size?: number
  /** Grosor del círculo */
  strokeWidth?: number
}

export const RadialChart: React.FC<RadialChartProps> = ({
  value,
  label,
  sublabel,
  color = '#38bdf8', // tailwind sky-400
  size = 96,
  strokeWidth = 10,
}) => {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - value)

  return (
    <svg width={size} height={size} className="block mx-auto" style={{ display: 'block' }}>
      <title>{label ? label : `Radial chart showing ${Math.round(value * 100)}%`}</title>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#404040" strokeWidth={strokeWidth / 2} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="butt"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.5s' }}
      />
      <text x="50%" y="45%" textAnchor="middle" dominantBaseline="central" className="font-semibold text-4xl" fill="#FFFFFF">
        {label ?? `${Math.round(value * 100)}%`}
      </text>
      {sublabel && (
        <text x="50%" y="63%" textAnchor="middle" dominantBaseline="central" className="font-semibold text-sm" fill="#A3A3A3">
          {sublabel}
        </text>
      )}
    </svg>
  )
}
