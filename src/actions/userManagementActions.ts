"use server";

import { UserService } from "@/service/userService";
import { User, UserRole } from "@prisma/client";
import { z } from "zod";

// Validation schemas
const searchParamsSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1),
  search: z.string().optional(),
  role: z.enum(["ADMIN", "PEMINJAM"]).nullable(),
  position: z.enum(["mahasiswa", "pegawai"]).nullable(),
}).partial().refine(data => {
  // Ensure page and limit have default values if not provided
  return {
    ...data,
    page: data.page ?? 1,
    limit: data.limit ?? 10,
  };
});

export type SearchParams = z.infer<typeof searchParamsSchema>;

interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface UserManagementResponse {
  success: boolean;
  message: string;
  data: {
    users: User[];
    metadata: PaginationMetadata;
  } | null;
}

/**
 * Get users with pagination, search, and filters
 */
export async function getUsers(params: Partial<SearchParams> = {}): Promise<UserManagementResponse> {
  try {
    // Validate and set defaults
    const validatedParams = searchParamsSchema.parse(params);
    
    const response = await UserService.getAllUsers({
      page: validatedParams.page ?? 1,
      limit: validatedParams.limit ?? 10,
      search: validatedParams.search,
      role: validatedParams.role ?? undefined,
      position: validatedParams.position ?? undefined,
    });

    if (!response.success || !response.data) {
      return {
        success: false,
        message: response.message || "Failed to fetch users",
        data: null
      };
    }

    return {
      success: true,
      message: "Users fetched successfully",
      data: {
        users: response.data.users,
        metadata: {
          total: response.data.metadata.total,
          page: validatedParams.page ?? 1,
          limit: validatedParams.limit ?? 10,
          totalPages: response.data.metadata.totalPages,
          hasNextPage: response.data.metadata.hasNextPage,
          hasPrevPage: response.data.metadata.hasPrevPage,
        }
      }
    };

  } catch (error) {
    console.error("Error in getUsers action:", error);
    return {
      success: false,
      message: "Failed to fetch users",
      data: null
    };
  }
}

/**
 * Update user role
 */
export async function updateRole(userId: string, newRole: UserRole) {
  try {
    if (!userId || !newRole) {
      return {
        success: false,
        message: "Invalid input parameters",
        data: null
      };
    }

    const response = await UserService.updateUserRole(userId, newRole);
    
    if (response.success) {
      return {
        success: true,
        message: "User role updated successfully",
        data: response.data
      };
    }

    return {
      success: false,
      message: response.message || "Failed to update user role",
      data: null
    };

  } catch (error) {
    console.error("Error in updateRole action:", error);
    return {
      success: false,
      message: "Failed to update user role",
      data: null
    };
  }
}

/**
 * Get user details
 */
export async function getUserDetails(userId: string) {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required",
        data: null
      };
    }

    const response = await UserService.getUserById(userId, true);
    
    if (response.success) {
      return {
        success: true,
        message: "User details fetched successfully",
        data: response.data
      };
    }

    return {
      success: false,
      message: response.message || "Failed to fetch user details",
      data: null
    };

  } catch (error) {
    console.error("Error in getUserDetails action:", error);
    return {
      success: false,
      message: "Failed to fetch user details",
      data: null
    };
  }
}

// Helper function to calculate pagination range
export  async function getPaginationRange(currentPage: number, totalPages: number) {
  const delta = 2; // Number of pages to show before and after current page
  const range: number[] = [];
  const rangeWithDots: (number | string)[] = [];
  let l: number | undefined;

  // Calculate range
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || 
      i === totalPages ||
      i === currentPage ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      range.push(i);
    }
  }

  // Add dots between numbers
  for (let i of range) {
    if (l) {
      if (i - l === 2) {
        rangeWithDots.push(l + 1);
      } else if (i - l !== 1) {
        rangeWithDots.push('...');
      }
    }
    rangeWithDots.push(i);
    l = i;
  }

  return rangeWithDots;
}
