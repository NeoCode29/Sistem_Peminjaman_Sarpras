"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, UserCircle2, ShieldCheck, GraduationCap, Briefcase, AlertTriangle, CheckCircle, UserCheck, Shield, Eye } from "lucide-react"
import { User, UserRole } from "@prisma/client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

// Helper function to format role display
const formatRole = (role: UserRole) => {
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
}

// Helper function to get role badge variant
const getRoleBadgeVariant = (role: UserRole) => {
  return role === "ADMIN" ? "destructive" : "default"
}

interface UserTableActions {
  onEditRole: (user: User) => void
  onManageHukuman: (user: User) => void
  onViewDetail: (user: User) => void
}

/**
 * Creates table columns for user management
 * Used by: Admin
 * Purpose: Generate column definitions for user table with actions
 * 
 * @param onEditRole - Handler for editing user role
 * @param onManageHukuman - Handler for managing user punishment
 * @param onViewDetail - Handler for viewing user details
 * @returns Array of column definitions for the user table
 */
export function createUserColumns(
  onEditRole: (user: User) => void,
  onManageHukuman: (user: User) => void,
  onViewDetail: (user: User) => void
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
              <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {user.name?.[0] || "U"}
              </AvatarFallback>
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
              <div className="flex items-center gap-2">
                <div className="p-1 bg-blue-100 rounded-full">
                  <GraduationCap className="h-3 w-3 text-blue-600" />
                </div>
                <span className="text-blue-700 font-medium">Mahasiswa</span>
              </div>
            ) : position === "pegawai" ? (
              <div className="flex items-center gap-2">
                <div className="p-1 bg-green-100 rounded-full">
                  <Briefcase className="h-3 w-3 text-green-600" />
                </div>
                <span className="text-green-700 font-medium">Pegawai</span>
              </div>
            ) : (
              <span className="text-gray-500 italic">Belum ditentukan</span>
            )}
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
            className="min-w-[100px] justify-center font-medium"
          >
            {role === "ADMIN" ? (
              <div className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Administrator
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <UserCheck className="h-3 w-3" />
                Peminjam
              </div>
            )}
          </Badge>
        );
      },
    },
    {
      accessorKey: "due_blocked",
      header: "Status Hukuman",
      cell: ({ row }) => {
        const user = row.original;
        const dueBlocked = user.due_blocked;
        
        if (!dueBlocked) {
          return (
            <Badge variant="secondary" className="flex items-center gap-1 w-fit bg-green-100 text-green-800 border-green-200">
              <CheckCircle className="h-3 w-3" />
              Normal
            </Badge>
          );
        }

        const isBlocked = new Date(dueBlocked) > new Date();
        
        if (isBlocked) {
          const daysRemaining = Math.ceil(
            (new Date(dueBlocked).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
          );
          
          return (
            <div className="space-y-1">
              <Badge variant="destructive" className="flex items-center gap-1 w-fit bg-red-100 text-red-800 border-red-200">
                <AlertTriangle className="h-3 w-3" />
                Dihukum
              </Badge>
              <div className="text-xs text-red-600 font-medium">
                Sisa: {daysRemaining} hari
              </div>
            </div>
          );
        }

        return (
          <Badge variant="secondary" className="flex items-center gap-1 w-fit bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3" />
            Normal
          </Badge>
        );
      },
    },
    {
      accessorKey: "number_phone",
      header: "No. Telepon",
      cell: ({ row }) => {
        const phoneNumber = row.getValue("number_phone") as string;
        return (
          <span className="min-w-[120px] font-mono text-sm">
            {phoneNumber || (
              <span className="text-gray-400 italic">Tidak ada</span>
            )}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Aksi",
      cell: ({ row }) => {
        const user = row.original;
        const isBlocked = user.due_blocked && new Date(user.due_blocked) > new Date();
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 hover:bg-gray-100 data-[state=open]:bg-gray-100"
              >
                <span className="sr-only">Buka menu aksi</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel className="font-semibold text-gray-900">
                Aksi untuk {user.name}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => onEditRole(user)}
                className="cursor-pointer hover:bg-blue-50 focus:bg-blue-50"
              >
                <UserCheck className="mr-2 h-4 w-4 text-blue-600" />
                <span className="text-blue-700">Ubah Peran</span>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => onManageHukuman(user)}
                className={`cursor-pointer ${
                  isBlocked 
                    ? "hover:bg-red-50 focus:bg-red-50" 
                    : "hover:bg-orange-50 focus:bg-orange-50"
                }`}
              >
                <AlertTriangle className={`mr-2 h-4 w-4 ${
                  isBlocked ? "text-red-600" : "text-orange-600"
                }`} />
                <span className={isBlocked ? "text-red-700" : "text-orange-700"}>
                  {isBlocked ? "Kelola Hukuman" : "Beri Hukuman"}
                </span>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={() => onViewDetail(user)}
                className="cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
              >
                <Eye className="mr-2 h-4 w-4 text-gray-600" />
                <span className="text-gray-700">Detail User</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ]
}