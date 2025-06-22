"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { getUsers, updateRole } from "@/actions/userManagementActions";
import { User, UserRole } from "@prisma/client";
import { toast } from "sonner";

/**
 * Props for useUserManagement hook
 */
interface UseUserManagementProps {
  initialPage?: number;
  initialLimit?: number;
}

interface EditRoleDialogState {
  isOpen: boolean;
  user: User | null;
}

interface HukumanDialogState {
  isOpen: boolean;
  user: User | null;
}

interface UserDetailDialogState {
  isOpen: boolean;
  user: User | null;
}

/**
 * Custom hook for user management functionality
 * Used by: Admin pages
 * Purpose: Manage user data, pagination, filtering, and dialog states for user management
 * Features: Fetch users, handle search/filter, manage role editing, punishment, and detail dialogs
 * 
 * @param initialPage - Starting page number (default: 1)
 * @param initialLimit - Items per page (default: 10)
 * @returns Object with user data, handlers, and dialog controls
 */
export function useUserManagement({ initialPage = 1, initialLimit = 10 }: UseUserManagementProps = {}) {
  // Session
  const { data: session } = useSession();
  
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
  const [hukumanDialog, setHukumanDialog] = useState<HukumanDialogState>({
    isOpen: false,
    user: null,
  });
  const [userDetailDialog, setUserDetailDialog] = useState<UserDetailDialogState>({
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
    if (!session?.user?.id) {
      toast.error("Session tidak valid");
      return false;
    }
    
    setIsLoading(true);
    try {
      const response = await updateRole(session.user.id, userId, newRole);
      if (response.success) {
        toast.success(response.message);
        await fetchUsers();
        closeEditRoleDialog();
        return true;
      } else {
        toast.error(response.message || "Gagal mengubah role pengguna");
      }
      return false;
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Terjadi kesalahan saat mengubah role");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, fetchUsers, closeEditRoleDialog]);

  // Handle hukuman management
  const openHukumanDialog = useCallback((user: User) => {
    setHukumanDialog({ isOpen: true, user });
  }, []);

  const closeHukumanDialog = useCallback(() => {
    setHukumanDialog({ isOpen: false, user: null });
  }, []);

  const handleHukumanUpdate = useCallback(async () => {
    await fetchUsers();
  }, [fetchUsers]);

  // Handle user detail dialog
  const openUserDetailDialog = useCallback((user: User) => {
    setUserDetailDialog({ isOpen: true, user });
  }, []);

  const closeUserDetailDialog = useCallback(() => {
    setUserDetailDialog({ isOpen: false, user: null });
  }, []);

  return {
    // Data
    users,
    metadata: {
      ...metadata,
      page: currentPage,
    },
    isLoading,
    editRoleDialog,
    hukumanDialog,
    userDetailDialog,
    
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
    openHukumanDialog,
    closeHukumanDialog,
    handleHukumanUpdate,
    openUserDetailDialog,
    closeUserDetailDialog,
  };
}
