import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, Shield, UserCircle } from "lucide-react"

async function getUsers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('full_name')

  if (error) return []
  return data
}

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <Users className="w-8 h-8 text-primary" /> Manajemen Pengguna
        </h1>
        <p className="text-muted-foreground">Kelola hak akses dan informasi operator sistem.</p>
      </div>

      <Card className="border-border/50 shadow-md">
        <CardHeader className="bg-primary/5 border-b border-border/50">
          <CardTitle>Daftar Pengguna</CardTitle>
          <CardDescription>Semua pengguna yang terdaftar di sistem cooling water.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[100px]">Avatar</TableHead>
                <TableHead>Nama Lengkap</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Terdaftar</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <UserCircle className="w-6 h-6" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{user.full_name || 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'outline'} className={user.role === 'admin' ? 'bg-primary' : 'border-primary text-primary'}>
                      {user.role === 'admin' ? (
                        <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> Admin</span>
                      ) : (
                        'Operator'
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(user.updated_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-xs text-muted-foreground italic">Contact Admin to Change</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
