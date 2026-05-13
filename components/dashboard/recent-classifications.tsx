import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function RecentClassifications({ data }: { data: any[] }) {
  return (
    <div className="rounded-md border border-border/50">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-semibold">Tanggal</TableHead>
            <TableHead className="font-semibold">Unit</TableHead>
            <TableHead className="font-semibold">pH</TableHead>
            <TableHead className="font-semibold">Besi (Fe)</TableHead>
            <TableHead className="font-semibold">Hasil</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium">
                {new Date(item.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
              </TableCell>
              <TableCell>{item.unit_name}</TableCell>
              <TableCell>{item.ph}</TableCell>
              <TableCell>{item.iron}</TableCell>
              <TableCell>
                <Badge variant={item.result === 'layak' ? 'default' : 'destructive'} className={item.result === 'layak' ? 'bg-green-500 hover:bg-green-600' : ''}>
                  {item.result === 'layak' ? 'Layak' : 'Tidak Layak'}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
