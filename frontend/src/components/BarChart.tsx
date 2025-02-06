'use client'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Bar, BarChart, CartesianGrid } from 'recharts'

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
  data: { packName: string; percentage: number; fill: string }[]
  config: ChartConfig
  footer?: string
}

interface CustomTooltipContentProps {
  payload: { value: number; key: string }[]
  active: boolean
}

const CustomTooltipContent = (props: CustomTooltipContentProps) => {
  const { payload, active } = props
  if (active && payload && payload.length) {
    const newPayload = payload.map((entry) => {
      return {
        ...entry,
        value: `${entry.value * 100}%`,
      }
    })
    return <ChartTooltipContent {...props} payload={newPayload} />
  }
  return null
}

export function BarChartComponent({ data, config, footer }: PercentageBarChartProps) {
  return (
    <Card className="border-2 border-solid border-gray-500 rounded-4xl">
      <CardHeader className="text-center text-balance">
        <CardTitle>Probability getting new card</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <ChartTooltip cursor={false} content={<CustomTooltipContent payload={[]} active={false} />} />
            <Bar dataKey="percentage" strokeWidth={2} radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col flex-1 items-center gap-2">{footer}</CardFooter>
    </Card>
  )
}
