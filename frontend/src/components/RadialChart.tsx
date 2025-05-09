import type React from 'react'

interface RadialChartProps {
  /** Valor entre 0 y 1 */
  value: number
  /** Texto central */
  label?: string
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
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="#262626" // tailwind slate-200
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.5s' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        className="font-semibold text-md"
        fill="#FFFFFF" // tailwind slate-700
      >
        {label ?? `${Math.round(value * 100)}%`}
      </text>
    </svg>
  )
}
