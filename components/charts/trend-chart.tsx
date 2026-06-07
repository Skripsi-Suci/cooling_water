"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"

const chartConfig = {
  ph: {
    label: "pH",
    color: "hsl(var(--primary))",
  },
  sc: {
    label: "SC",
    color: "hsl(217, 91%, 60%)",
  },
  nitrite: {
    label: "Nitrite",
    color: "hsl(142, 71%, 45%)",
  },
  iron: {
    label: "Fe (Besi)",
    color: "hsl(var(--chart-2))",
  },
  sulfate: {
    label: "Sulfate",
    color: "hsl(38, 92%, 50%)",
  },
  turbidity: {
    label: "Turbidity",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function TrendChart({ data }: { data: any[] }) {
  return (
    <ChartContainer config={chartConfig} className="h-[320px] w-full">
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
        <ChartLegend content={<ChartLegendContent />} />
        <Line
          type="monotone"
          dataKey="ph"
          stroke="var(--color-ph)"
          strokeWidth={2}
          dot={{ fill: 'var(--color-ph)', r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="sc"
          stroke="var(--color-sc)"
          strokeWidth={2}
          dot={{ fill: 'var(--color-sc)', r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="nitrite"
          stroke="var(--color-nitrite)"
          strokeWidth={2}
          dot={{ fill: 'var(--color-nitrite)', r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="iron"
          stroke="var(--color-iron)"
          strokeWidth={2}
          dot={{ fill: 'var(--color-iron)', r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="sulfate"
          stroke="var(--color-sulfate)"
          strokeWidth={2}
          dot={{ fill: 'var(--color-sulfate)', r: 3 }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="turbidity"
          stroke="var(--color-turbidity)"
          strokeWidth={2}
          dot={{ fill: 'var(--color-turbidity)', r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ChartContainer>
  )
}
