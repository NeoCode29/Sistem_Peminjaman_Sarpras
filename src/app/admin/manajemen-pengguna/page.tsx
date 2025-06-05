"use client";

import { useEffect } from "react";
import { useUserManagement } from "@/hooks/useUserManagement";
import { createUserColumns } from "@/components/usertable-columns";
import { UserTable } from "@/components/UserTable";
import { EditRoleDialog } from "@/components/EditRoleDialog";

const ManajemenPenggunaPage = () => {
  const {
    users,
    metadata,
    isLoading,
    editRoleDialog,
    currentSearch,
    currentRole,
    currentPosition,
    fetchUsers,
    handleSearch,
    handleFilter,
    handlePageChange,
    openEditRoleDialog,
    closeEditRoleDialog,
    handleRoleUpdate,
  } = useUserManagement();

  // Fetch users when filters change
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, currentSearch, currentRole, currentPosition, metadata.page]);

  // Create table columns
  const columns = createUserColumns(openEditRoleDialog);

  return (
    <div className="container space-y-6 p-4 md:p-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Manajemen Pengguna
        </h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Kelola data dan peran pengguna dalam sistem.
        </p>
      </div>

      <div className="space-y-4">
        <UserTable
          data={users}
          columns={columns}
          pageCount={metadata.totalPages}
          currentPage={metadata.page}
          onSearch={handleSearch}
          onRoleFilter={(role) => handleFilter("role", role)}
          onPositionFilter={(position) => handleFilter("position", position)}
          onPageChange={handlePageChange}
        />

        <EditRoleDialog
          user={editRoleDialog.user}
          isOpen={editRoleDialog.isOpen}
          onClose={closeEditRoleDialog}
          onUpdate={handleRoleUpdate}
        />
      </div>
    </div>
  );
};

export default ManajemenPenggunaPage;
