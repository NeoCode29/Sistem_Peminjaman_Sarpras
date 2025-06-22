"use server";

import { UserService } from "@/service/userService";
import { User, UserRole } from "@prisma/client";
import { z } from "zod";
import { logUserManagementActivity } from "@/service/logService";

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

const hukumanSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  hariHukuman: z.number().min(1, "Hari hukuman minimal 1 hari"),
  alasan: z.string().min(1, "Alasan hukuman wajib diisi"),
});

export type SearchParams = z.infer<typeof searchParamsSchema>;
export type HukumanParams = z.infer<typeof hukumanSchema>;

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

export interface HukumanResponse {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Get users with pagination, search, and filters
 * Used by: Admin
 * Purpose: Retrieve paginated list of users with filtering capabilities for user management
 * Workflow: Validates params -> calls UserService.getAllUsers -> returns formatted response
 * 
 * @param params - Search and pagination parameters
 * @returns Promise<UserManagementResponse> - Paginated user data with metadata
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
    return {
      success: false,
      message: "Failed to fetch users",
      data: null
    };
  }
}

/**
 * Update user role
 * Used by: Admin
 * Purpose: Change user role between ADMIN and PEMINJAM
 * Workflow: Validates input -> calls UserService.updateUserRole -> returns success/error
 * 
 * @param userId - ID of the user to update
 * @param newRole - New role to assign (ADMIN | PEMINJAM)
 * @returns Promise<HukumanResponse> - Success/error response
 */
export async function updateRole(adminId: string, userId: string, newRole: UserRole): Promise<HukumanResponse> {
  try {
    if (!userId || !newRole) {
      return {
        success: false,
        message: "Invalid input parameters",
        data: null
      };
    }

    // Get user details for logging
    const userResponse = await UserService.getUserById(userId, true);
    const userName = userResponse.success && userResponse.data ? userResponse.data.name || userResponse.data.email : `User ID: ${userId}`;

    const response = await UserService.updateUserRole(userId, newRole);
    
    if (response.success) {
      // Log activity
      await logUserManagementActivity(
        adminId,
        'UPDATE_ROLE',
        userName || 'Unknown User',
        userId,
        `Role diubah menjadi: ${newRole}`
      );

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
    return {
      success: false,
      message: "Failed to update user role",
      data: null
    };
  }
}

/**
 * Apply punishment to user
 * Used by: Admin
 * Purpose: Give punishment to user by setting due_blocked date
 * Workflow: Validates input -> calls UserService.applyPunishment -> logs activity -> returns response
 * 
 * @param params - Punishment parameters (userId, hariHukuman, alasan)
 * @returns Promise<HukumanResponse> - Success/error response with updated user data
 */
export async function applyHukuman(adminId: string, params: HukumanParams): Promise<HukumanResponse> {
  try {
    const validatedParams = hukumanSchema.parse(params);
    
    // Get user details for logging
    const userResponse = await UserService.getUserById(validatedParams.userId, true);
    const userName = userResponse.success && userResponse.data ? userResponse.data.name || userResponse.data.email : `User ID: ${validatedParams.userId}`;
    
    const response = await UserService.applyPunishment(
      validatedParams.userId,
      validatedParams.hariHukuman,
      validatedParams.alasan
    );
    
    if (response.success) {
      // Log activity
      await logUserManagementActivity(
        adminId,
        'APPLY_PUNISHMENT',
        userName || 'Unknown User',
        validatedParams.userId,
        `Hukuman ${validatedParams.hariHukuman} hari: ${validatedParams.alasan}`
      );

      return {
        success: true,
        message: "Hukuman berhasil diberikan",
        data: response.data
      };
    }

    return {
      success: false,
      message: response.message || "Failed to apply punishment",
      data: null
    };

  } catch (error) {
    return {
      success: false,
      message: "Failed to apply punishment",
      data: null
    };
  }
}

/**
 * Cancel user punishment
 * Used by: Admin
 * Purpose: Remove punishment from user by clearing due_blocked date
 * Workflow: Validates input -> calls UserService.cancelPunishment -> logs activity -> returns response
 * 
 * @param userId - ID of the user to remove punishment from
 * @returns Promise<HukumanResponse> - Success/error response
 */
export async function cancelHukuman(adminId: string, userId: string): Promise<HukumanResponse> {
  try {
    if (!userId) {
      return {
        success: false,
        message: "User ID is required",
        data: null
      };
    }

    // Get user details for logging
    const userResponse = await UserService.getUserById(userId, true);
    const userName = userResponse.success && userResponse.data ? userResponse.data.name || userResponse.data.email : `User ID: ${userId}`;

    const response = await UserService.cancelPunishment(userId);
    
    if (response.success) {
      // Log activity
      await logUserManagementActivity(
        adminId,
        'CANCEL_PUNISHMENT',
        userName || 'Unknown User',
        userId,
        'Hukuman berhasil dibatalkan'
      );

      return {
        success: true,
        message: "Hukuman berhasil dibatalkan",
        data: response.data
      };
    }

    return {
      success: false,
      message: response.message || "Failed to cancel punishment",
      data: null
    };

  } catch (error) {
    return {
      success: false,
      message: "Failed to cancel punishment",
      data: null
    };
  }
}

/**
 * Get user details with relations
 * Used by: Admin
 * Purpose: Retrieve detailed user information including mahasiswa/pegawai data
 * Workflow: Validates input -> calls UserService.getUserById with relations -> returns user data
 * 
 * @param userId - ID of the user to fetch details for
 * @returns Promise<HukumanResponse> - User details with relations
 */
export async function getUserDetails(userId: string): Promise<HukumanResponse> {
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
    return {
      success: false,
      message: "Failed to fetch user details",
      data: null
    };
  }
}

// Helper function to calculate pagination range
export async function getPaginationRange(currentPage: number, totalPages: number) {
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
