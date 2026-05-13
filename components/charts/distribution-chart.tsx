"use client"

import { Pie, PieChart, Cell, Legend } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartConfig = {
  layak: {
    label: "Layak",
    color: "#16a34a",
  },
  tidak_layak: {
    label: "Tidak Layak",
    color: "#dc2626",
  },
} satisfies ChartConfig

export function StatusDistributionChart({ layak, tidakLayak }: { layak: number, tidakLayak: number }) {
  const data = [
    { name: "layak", value: layak },
    { name: "tidak_layak", value: tidakLayak },
  ]

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
        >
          <Cell fill="var(--color-layak)" />
          <Cell fill="var(--color-tidak_layak)" />
        </Pie>
        <ChartTooltip content={<ChartTooltipContent hideLabel />} />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          formatter={(value) => <span className="text-sm font-medium capitalize text-foreground/70">{value.replace('_', ' ')}</span>}
        />
      </PieChart>
    </ChartContainer>
  )
}
