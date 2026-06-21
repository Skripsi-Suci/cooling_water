"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

export type Classification = {
  id: string
  date: string
  unit_name: string
  engine_id: string
  running_hour: number
  ph: number
  sc: number
  nitrite: number
  iron: number
  sulfate: number
  turbidity: number
  result: 'layak' | 'tidak_layak'
}

export const columns: ColumnDef<Classification>[] = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Tanggal
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return new Date(row.getValue("date")).toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
  },
  {
    accessorKey: "unit_name",
    header: "Unit",
  },
  {
  accessorKey: "engine_id",
  header: "Engine ID",
},
{
  accessorKey: "running_hour",
  header: "Running Hour",
  cell: ({ row }) => {
    const value = row.getValue("running_hour")
    return `${value} k`
  },
},
{
  accessorKey: "ph",
  header: "pH",
},
  {
    accessorKey: "sc",
    header: "SC",
  },
  {
    accessorKey: "nitrite",
    header: "Nitrite",
  },
  {
    accessorKey: "iron",
    header: "Fe (Besi)",
  },
  {
    accessorKey: "sulfate",
    header: "Sulfate",
  },
  {
    accessorKey: "turbidity",
    header: "Turbidity",
  },
  {
    accessorKey: "result",
    header: "Hasil",
    cell: ({ row }) => {
      const result = row.getValue("result") as string
      return (
        <Badge variant={result === 'layak' ? 'default' : 'destructive'} className={result === 'layak' ? 'bg-green-500 hover:bg-green-600' : ''}>
          {result === 'layak' ? 'Layak' : 'Tidak Layak'}
        </Badge>
      )
    },
  },
]
