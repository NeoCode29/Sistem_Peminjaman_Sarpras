"use client";

import { useState, useCallback } from "react";
import { getUsers, updateRole } from "@/actions/userManagementActions";
import { User, UserRole } from "@prisma/client";

interface UseUserManagementProps {
  initialPage?: number;
  initialLimit?: number;
}

interface EditRoleDialogState {
  isOpen: boolean;
  user: User | null;
}

export function useUserManagement({ initialPage = 1, initialLimit = 10 }: UseUserManagementProps = {}) {
  // States
  const [users, setUsers] = useState<User[]>([]);
  const [metadata, setMetadata] = useState({
    total: 0,
    page: initialPage,
    limit: initialLimit,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [editRoleDialog, setEditRoleDialog] = useState<EditRoleDialogState>({
    isOpen: false,
    user: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);

  // Fetch users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getUsers({
        page: currentPage,
        limit: initialLimit,
        search: searchQuery || undefined,
        role: selectedRole || undefined,
        position: selectedPosition as "mahasiswa" | "pegawai" | undefined,
      });

      if (response.success && response.data) {
        setUsers(response.data.users);
        setMetadata(response.data.metadata);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, initialLimit, searchQuery, selectedRole, selectedPosition]);

  // Handle search
  const handleSearch = useCallback((search: string) => {
    setSearchQuery(search);
    setCurrentPage(1); // Reset to first page on search
  }, []);

  // Handle filter
  const handleFilter = useCallback((type: "role" | "position", value: string | null) => {
    if (type === "role") {
      setSelectedRole(value as UserRole | null);
    } else {
      setSelectedPosition(value);
    }
    setCurrentPage(1); // Reset to first page on filter
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  // Handle role editing
  const openEditRoleDialog = useCallback((user: User) => {
    setEditRoleDialog({ isOpen: true, user });
  }, []);

  const closeEditRoleDialog = useCallback(() => {
    setEditRoleDialog({ isOpen: false, user: null });
  }, []);

  const handleRoleUpdate = useCallback(async (userId: string, newRole: UserRole) => {
    setIsLoading(true);
    try {
      const response = await updateRole(userId, newRole);
      if (response.success) {
        await fetchUsers();
        closeEditRoleDialog();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating role:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers, closeEditRoleDialog]);

  return {
    // Data
    users,
    metadata: {
      ...metadata,
      page: currentPage,
    },
    isLoading,
    editRoleDialog,
    
    // State values
    currentSearch: searchQuery,
    currentRole: selectedRole,
    currentPosition: selectedPosition,
    
    // Actions
    fetchUsers,
    handleSearch,
    handleFilter,
    handlePageChange,
    openEditRoleDialog,
    closeEditRoleDialog,
    handleRoleUpdate,
  };
}
