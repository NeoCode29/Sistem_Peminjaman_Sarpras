"use client";

import { ColumnDef } from "@tanstack/react-table";
import { User, UserRole } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GraduationCap, Briefcase } from "lucide-react";

export function createUserColumns(
  onEditRole: (user: User) => void
): ColumnDef<User>[] {
  return [
    {
      accessorKey: "name",
    header: "Nama",
      cell: ({ row }) => {
        const user = row.original;
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <div className="font-medium">{user.name || "Tanpa Nama"}</div>
              <div className="text-sm text-muted-foreground truncate max-w-[150px]">
                {user.email || "Tidak ada email"}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "position",
      header: "Posisi",
      cell: ({ row }) => {
        const position = row.getValue("position") as string;
        return (
          <div className="flex items-center gap-2 min-w-[120px]">
            {position === "mahasiswa" ? (
              <GraduationCap className="h-4 w-4 text-blue-500" />
            ) : (
              <Briefcase className="h-4 w-4 text-green-500" />
            )}
            <span className="capitalize">
              {position || "Belum ditentukan"}
            </span>
          </div>
        );
      },
  },
  {
    accessorKey: "role",
      header: "Peran",
      cell: ({ row }) => {
        const role = row.getValue("role") as UserRole;
        return (
          <Badge 
            variant={role === "ADMIN" ? "destructive" : "secondary"}
            className="min-w-[100px] justify-center"
          >
            {role === "ADMIN" ? "Administrator" : "Peminjam"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "number_phone",
      header: "No. Telepon",
      cell: ({ row }) => (
        <span className="min-w-[120px]">
          {row.getValue("number_phone") || "Tidak ada"}
        </span>
      ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
          <Button
            variant="ghost"
            onClick={() => onEditRole(row.original)}
            className="min-w-[100px]"
          >
            Ubah Peran
            </Button>
        );
      },
    },
  ];
} 