'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Cell } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { motion } from "framer-motion"
import { Brain, Target, Zap, ShieldCheck } from "lucide-react"

const featureImportanceData = [
  { name: "pH", value: 85 },
  { name: "Nitrite", value: 78 },
  { name: "Iron (Fe)", value: 72 },
  { name: "Turbidity", value: 65 },
  { name: "Sulfate", value: 45 },
  { name: "SC", value: 30 },
]

const chartConfig = {
  importance: {
    label: "Importance Score",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig

export default function PerformancePage() {
  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Brain className="w-8 h-8 text-primary" /> Performa Model ML
        </h1>
        <p className="text-muted-foreground">Evaluasi algoritma Random Forest untuk klasifikasi cooling water.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" /> Akurasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary">96.4%</div>
            <p className="text-xs text-muted-foreground mt-1">Cross-validation score</p>
          </CardContent>
        </Card>
        <Card className="bg-green-500/5 border-green-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-green-500" /> Precision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">94.8%</div>
            <p className="text-xs text-muted-foreground mt-1">Positive predictive value</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" /> Recall
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">97.2%</div>
            <p className="text-xs text-muted-foreground mt-1">Sensitivity rate</p>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/5 border-purple-500/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-500" /> F1-Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">96.0%</div>
            <p className="text-xs text-muted-foreground mt-1">Harmonic mean</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <CardTitle>Feature Importance</CardTitle>
            <CardDescription>Parameter yang paling berpengaruh terhadap keputusan model.</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px] w-full">
              <BarChart data={featureImportanceData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid horizontal={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 12, fontWeight: 500 }}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {featureImportanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index < 3 ? 'hsl(var(--primary))' : 'hsl(var(--primary)/40)'} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-border/50 shadow-md">
          <CardHeader>
            <CardTitle>Confusion Matrix</CardTitle>
            <CardDescription>Visualisasi performa klasifikasi (Actual vs Predicted).</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-6">
            <div className="grid grid-cols-3 gap-2 w-full max-w-[300px]">
              <div className="col-start-2 text-center text-xs font-bold text-muted-foreground mb-1 uppercase">Predicted</div>
              <div className="row-start-2 [writing-mode:vertical-lr] rotate-180 text-center text-xs font-bold text-muted-foreground mr-1 uppercase">Actual</div>
              
              {/* Matrix */}
              <div className="bg-muted/50 p-2 text-center flex flex-col justify-center rounded-lg border border-border/50 aspect-square">
                <span className="text-xs font-medium text-muted-foreground">Layak</span>
                <span className="text-xl font-bold text-green-600">142</span>
                <span className="text-[10px] text-muted-foreground italic">(TP)</span>
              </div>
              <div className="bg-red-500/10 p-2 text-center flex flex-col justify-center rounded-lg border border-red-500/20 aspect-square">
                <span className="text-xs font-medium text-muted-foreground">Tidak Layak</span>
                <span className="text-xl font-bold text-red-600">8</span>
                <span className="text-[10px] text-muted-foreground italic">(FN)</span>
              </div>
              
              <div className="bg-yellow-500/10 p-2 text-center flex flex-col justify-center rounded-lg border border-yellow-500/20 aspect-square">
                <span className="text-xs font-medium text-muted-foreground">Layak</span>
                <span className="text-xl font-bold text-yellow-600">5</span>
                <span className="text-[10px] text-muted-foreground italic">(FP)</span>
              </div>
              <div className="bg-muted/50 p-2 text-center flex flex-col justify-center rounded-lg border border-border/50 aspect-square">
                <span className="text-xs font-medium text-muted-foreground">Tidak Layak</span>
                <span className="text-xl font-bold text-primary">85</span>
                <span className="text-[10px] text-muted-foreground italic">(TN)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
