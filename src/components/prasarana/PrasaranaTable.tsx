import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { EditIcon, Trash2Icon } from "lucide-react"
import { Prisma, StatusPeminjaman } from "@prisma/client"
import { Badge } from "@/components/ui/badge"

type PrasaranaWithImages = Prisma.PrasaranaGetPayload<{
  include: { image_url: true }
}>

interface PrasaranaTableProps {
  data: PrasaranaWithImages[]
  isLoading?: boolean
  onEdit?: (item: PrasaranaWithImages) => void
  onDelete?: (item: PrasaranaWithImages) => void
}

export function PrasaranaTable({
  data,
  isLoading,
  onEdit,
  onDelete,
}: PrasaranaTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Lokasi</TableHead>
            <TableHead>Kapasitas</TableHead>
            <TableHead>Kondisi</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px]">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Memuat data...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                Tidak ada data
              </TableCell>
            </TableRow>
          ) : (
            data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.nama}</TableCell>
                <TableCell>{item.lokasi || "-"}</TableCell>
                <TableCell>{item.kapasitas || "-"}</TableCell>
                <TableCell>{item.kondisi || "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant={item.status === StatusPeminjaman.TERSEDIA ? "default" : "destructive"}
                  >
                    {item.status === StatusPeminjaman.TERSEDIA ? "Tersedia" : "Dipinjam"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit?.(item)}
                    >
                      <EditIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete?.(item)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
} 