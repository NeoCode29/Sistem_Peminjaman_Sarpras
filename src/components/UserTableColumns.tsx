"use client"

import { ColumnDef } from "@tanstack/react-table"
import { MoreHorizontal, UserCircle2, ShieldCheck, GraduationCap } from "lucide-react"
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
}

export const createUserColumns = ({ onEditRole }: UserTableActions): ColumnDef<User>[] => [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name || ""} />
            ) : (
              <AvatarFallback>
                <UserCircle2 className="h-4 w-4" />
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex flex-col">
            <span className="font-medium">{user.name}</span>
            <span className="text-xs text-gray-500">{user.email}</span>
          </div>
        </div>
      )
    },
  },
  {
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => {
      const position = row.getValue("position") as string
      const Icon = position === "mahasiswa" ? GraduationCap : ShieldCheck
      return position ? (
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-500" />
          <span className="capitalize">{position}</span>
        </div>
      ) : null
    },
  },
  {
    accessorKey: "number_phone",
    header: "Phone",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const role = row.getValue("role") as UserRole
      return (
        <Badge variant={getRoleBadgeVariant(role)}>
          {formatRole(role)}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEditRole(user)}>
              Change Role
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]