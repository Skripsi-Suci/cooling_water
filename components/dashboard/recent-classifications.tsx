import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function RecentClassifications({ data }: { data: any[] }) {
  return (
    <div className="rounded-md border border-border/50 overflow-x-auto">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-semibold whitespace-nowrap">Tanggal</TableHead>
            <TableHead className="font-semibold whitespace-nowrap">Unit</TableHead>
            <TableHead className="font-semibold whitespace-nowrap">Engine ID</TableHead>
            <TableHead className="font-semibold whitespace-nowrap">Running Hour</TableHead>
            <TableHead className="font-semibold whitespace-nowrap">pH</TableHead>
            <TableHead className="font-semibold whitespace-nowrap">SC</TableHead>
            <TableHead className="font-semibold whitespace-nowrap">Nitrite</TableHead>
            <TableHead className="font-semibold whitespace-nowrap">Fe (Besi)</TableHead>
            <TableHead className="font-semibold whitespace-nowrap">Sulfate</TableHead>
            <TableHead className="font-semibold whitespace-nowrap">Turbidity</TableHead>
            <TableHead className="font-semibold whitespace-nowrap">Hasil</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/30 transition-colors">
              <TableCell className="font-medium whitespace-nowrap">
                {new Date(item.date).toLocaleDateString('id-ID', { 
                  day: '2-digit', 
                  month: 'short', 
                  year: 'numeric', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </TableCell>
              <TableCell className="whitespace-nowrap">{item.unit_name}</TableCell>
              <TableCell className="whitespace-nowrap">{item.engine_id ?? '-'}</TableCell>
              <TableCell className="whitespace-nowrap">{item.running_hour ?? '-'}</TableCell>
              <TableCell>{item.ph}</TableCell>
              <TableCell>{item.sc ?? '-'}</TableCell>
              <TableCell>{item.nitrite ?? '-'}</TableCell>
              <TableCell>{item.iron}</TableCell>
              <TableCell>{item.sulfate ?? '-'}</TableCell>
              <TableCell>{item.turbidity}</TableCell>
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
