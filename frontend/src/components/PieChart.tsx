'use client'

import * as React from 'react'
import { Label, Pie, PieChart } from 'recharts'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

interface PieChartComponentProps {
  data: { packName: string; percentage: number; fill: string }[]
  config: ChartConfig
  title?: string
  description?: string
  footer?: string
}

export const PieChartComponent = ({ data, config, title, description, footer }: PieChartComponentProps) => {
  const totalPercentage = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.percentage, 0)
  }, [data])

  return (
    <Card className="flex flex-col h-full border-2 border-solid border-gray-500 rounded-4xl">
      <CardHeader className="items-center pb-0 text-balance text-center">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer config={config} className="mx-auto aspect-square max-h-[250px]">
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Pie data={data} dataKey="percentage" nameKey="packName" innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    return (
                      <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                        <tspan x={viewBox.cx} y={viewBox.cy} className="fill-white text-3xl font-bold">
                          {totalPercentage.toLocaleString()}
                        </tspan>
                        <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 24} className="fill-white">
                          Cards
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 font-medium leading-none">{footer}</div>
      </CardFooter>
    </Card>
  )
}
