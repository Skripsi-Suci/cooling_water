"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  ph: {
    label: "pH",
    color: "hsl(var(--primary))",
  },
  iron: {
    label: "Besi (Fe)",
    color: "hsl(var(--chart-2))",
  },
  turbidity: {
    label: "Turbidity",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function TrendChart({ data }: { data: any[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 10,
          left: 10,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Line
          type="monotone"
          dataKey="ph"
          stroke="var(--color-ph)"
          strokeWidth={3}
          dot={{ fill: 'var(--color-ph)', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="iron"
          stroke="var(--color-iron)"
          strokeWidth={3}
          dot={{ fill: 'var(--color-iron)', r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="turbidity"
          stroke="var(--color-turbidity)"
          strokeWidth={3}
          dot={{ fill: 'var(--color-turbidity)', r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ChartContainer>
  )
}
