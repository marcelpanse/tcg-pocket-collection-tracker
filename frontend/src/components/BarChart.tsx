import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import type { FC } from 'react'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'

//Example of a percentage bar chart configuration
/* const chartData = [
    { packName: "Pack1", percentage: 0.1, fill: "#FF5733" }, // Color aleatorio
    { packName: "Pack2", percentage: 0.5, fill: "#33FF57" }, // Color aleatorio
    { packName: "Pack3", percentage: 0.8, fill: "#3357FF" }, // Color aleatorio
]

const chartConfig = {
    Pack1: {
        label: "Pack 1",
        color: "hsl(var(--chart-1))",
    },
    Pack2: {
        label: "Pack 2",
        color: "hsl(var(--chart-2))",
    },
    Pack3: {
        label: "Pack 3",
        color: "hsl(var(--chart-3))",
    },
} satisfies ChartConfig */

interface PercentageBarChartProps {
  title: string
  data: { packName: string; percentage: number; fill: string }[]
  config?: ChartConfig
  footer?: string
}
export const BarChartComponent: FC<PercentageBarChartProps> = ({ title, data, config = {}, footer }) => (
  <Card className="rounded-4xl border-2 border-slate-600 border-solid shadow-none">
    <CardHeader className="text-balance text-center">
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <ChartContainer config={config}>
        <BarChart accessibilityLayer data={data.map((d) => ({ ...d, percentage: d.percentage * 100 }))}>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="packName" tickLine={false} tickMargin={10} axisLine={false} />
          <YAxis type="number" domain={[0, 100]} width={25} />
          <ChartTooltip cursor={false} content={<CustomTooltipContent payload={[]} active={false} />} />
          <Bar dataKey="percentage" strokeWidth={2} radius={8} />
        </BarChart>
      </ChartContainer>
    </CardContent>
    <CardFooter className="flex-1 flex-col items-center gap-2">{footer}</CardFooter>
  </Card>
)

interface CustomTooltipContentProps {
  payload: { value: number; key: string }[]
  active: boolean
}
const CustomTooltipContent: FC<CustomTooltipContentProps> = (props) => {
  const { payload, active } = props
  if (active && payload && payload.length) {
    const newPayload = payload.map((entry) => {
      return {
        ...entry,
        value: `: ${Math.round(entry.value * 10) / 10}%`,
      }
    })
    return <ChartTooltipContent {...props} payload={newPayload} />
  }
  return null
}
