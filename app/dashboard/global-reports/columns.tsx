"use client"

import { useState } from "react"
import { ColumnDef } from "@tanstack/react-table"
import { Badge } from "@/components/ui/badge"
import { ArrowUpDown, Trash2, FileText, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { deleteClassification } from "./actions"

export type GlobalClassification = {
  id: string
  date: string
  operator_name: string
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
  analysis_notes: string
}

const RowActions = ({ classification }: { classification: GlobalClassification }) => {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const res = await deleteClassification(classification.id)
      if (res.success) {
        toast.success("Riwayat berhasil dihapus.")
        setIsDeleteDialogOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || "Gagal menghapus riwayat")
      }
    } catch {
      toast.error("Terjadi kesalahan sistem")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Detail Dialog */}
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8 text-primary" title="Detail Validasi">
            <FileText className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Validasi Sistem</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">Tanggal:</span>
              <span className="font-semibold">{new Date(classification.date).toLocaleString('id-ID')}</span>
              <span className="text-muted-foreground">Operator:</span>
              <span className="font-semibold">{classification.operator_name}</span>
              <span className="text-muted-foreground">Unit / Engine:</span>
              <span className="font-semibold">{classification.unit_name} / {classification.engine_id}</span>
              <span className="text-muted-foreground">Hasil:</span>
              <Badge variant={classification.result === 'layak' ? 'default' : 'destructive'} className={classification.result === 'layak' ? 'bg-green-500 w-fit' : 'w-fit'}>
                {classification.result === 'layak' ? 'Layak' : 'Tidak Layak'}
              </Badge>
            </div>
            <div className="bg-muted p-4 rounded-md text-sm whitespace-pre-wrap leading-relaxed border">
              <span className="font-bold block mb-2 text-primary">Catatan Analisis & Validasi SOP:</span>
              {classification.analysis_notes || 'Tidak ada catatan tersedia.'}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" title="Hapus Riwayat">
            <Trash2 className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Riwayat Analisis?</DialogTitle>
            <DialogDescription>
              Tindakan ini tidak dapat dibatalkan. Riwayat analisis dari operator <b>{classification.operator_name}</b> pada tanggal {new Date(classification.date).toLocaleDateString('id-ID')} akan dihapus secara permanen dari server.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isDeleting}>Batal</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Hapus Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const columns: ColumnDef<GlobalClassification>[] = [
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
    accessorKey: "operator_name",
    header: "Operator",
    cell: ({ row }) => {
      return <span className="font-semibold">{row.getValue("operator_name")}</span>
    }
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
    header: "Fe",
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
  {
    id: "actions",
    header: "Aksi",
    cell: ({ row }) => {
      return <RowActions classification={row.original} />
    }
  }
]
