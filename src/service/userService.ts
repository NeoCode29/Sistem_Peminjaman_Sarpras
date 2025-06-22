import { prisma } from "@/lib/prisma";
import { User, UserRole, Prisma } from "@prisma/client";
// import { z } from "zod";

// Validation schemas
/*
const userSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  email: z.string().email().nullable(),
  image: z.string().nullable(),
  role: z.enum(["ADMIN", "PEMINJAM"]),
  position: z.string().nullable(),
  gender: z.string().nullable(),
  number_phone: z.string().nullable(),
});
*/

// Type for user response
export type UserResponse = {
  success: boolean;
  message: string;
  data?: User | null;
};

// Type for paginated user response
export type PaginatedUserResponse = {
  success: boolean;
  message: string;
  data?: {
    users: User[];
    metadata: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  } | null;
};

// Type for get all users params
export type GetAllUsersParams = {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  position?: "mahasiswa" | "pegawai";
  orderBy?: {
    field: keyof User;
    direction: 'asc' | 'desc';
  };
};

/**
 * Service class for handling user-related operations
 */
export class UserService {
  /**
   * Get all users with pagination, search, and filtering
   * Used by: Admin
   * Purpose: Retrieve paginated list of users with filtering and search capabilities
   * 
   * @param params - Parameters for filtering and pagination
   * @returns Promise<PaginatedUserResponse> - Paginated user data with metadata
   */
  static async getAllUsers({
    page = 1,
    limit = 10,
    search = "",
    role,
    position,
    orderBy = { field: "createdAt", direction: "desc" }
  }: GetAllUsersParams): Promise<PaginatedUserResponse> {
    try {
      // Validate page and limit
      if (page < 1) page = 1;
      if (limit < 1) limit = 10;
      if (limit > 100) limit = 100;

      // Calculate skip
      const skip = (page - 1) * limit;

      // Build where clause
      const where: Prisma.UserWhereInput = {
        AND: [
          // Search in name or email
          search ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } },
            ],
          } : {},
          // Filter by role if specified
          role ? { role } : {},
          // Filter by position if specified
          position ? { position } : {},
        ],
      };

      // Get total count
      const total = await prisma.user.count({ where });

      // Calculate total pages
      const totalPages = Math.ceil(total / limit);

      // Get users
      const users = await prisma.user.findMany({
        where,
        take: limit,
        skip,
        orderBy: {
          [orderBy.field]: orderBy.direction,
        },
        include: {
          mahasiswa: {
            include: {
              jurusanJurusan: true,
              prodiProdi: true,
            }
          },
          pegawai: true,
        },
      });

      return {
        success: true,
        message: "Users retrieved successfully",
        data: {
          users,
          metadata: {
            total,
            page,
            limit,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          },
        },
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return {
        success: false,
        message: "Failed to fetch users",
        data: null,
      };
    }
  }

  /**
   * Get user by ID with optional related data
   * Used by: Admin, User (for own profile)
   * Purpose: Retrieve single user data with optional mahasiswa/pegawai relations
   * 
   * @param userId - The ID of the user to fetch
   * @param includeRelations - Whether to include mahasiswa/pegawai relations
   * @returns Promise<UserResponse> - User data with optional relations
   */
  static async getUserById(
    userId: string,
    includeRelations: boolean = false
  ): Promise<UserResponse> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: includeRelations
          ? {
              mahasiswa: {
                include: {
                  jurusanJurusan: true,
                  prodiProdi: true,
                }
              },
              pegawai: true,
            }
          : undefined,
      });

      if (!user) {
        return {
          success: false,
          message: "User not found",
          data: null,
        };
      }

      return {
        success: true,
        message: "User retrieved successfully",
        data: user,
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      return {
        success: false,
        message: "Failed to fetch user",
        data: null,
      };
    }
  }

  /**
   * Update user role
   * Used by: Admin
   * Purpose: Change user role between ADMIN and PEMINJAM with validation
   * 
   * @param userId - The ID of the user to update
   * @param newRole - The new role to assign
   * @returns Promise<UserResponse> - Updated user data or error
   */
  static async updateUserRole(
    userId: string,
    newRole: UserRole
  ): Promise<UserResponse> {
    try {
      // Validate role
      if (!Object.values(UserRole).includes(newRole)) {
        return {
          success: false,
          message: "Invalid role specified",
          data: null,
        };
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: newRole },
      });

      return {
        success: true,
        message: "User role updated successfully",
        data: updatedUser,
      };
    } catch (error) {
      console.error("Error updating user role:", error);
      return {
        success: false,
        message: "Failed to update user role",
        data: null,
      };
    }
  }

  /**
   * Apply punishment to user
   * Used by: Admin
   * Purpose: Set due_blocked date and log the punishment activity
   * 
   * @param userId - The ID of the user to punish
   * @param hariHukuman - Number of days for punishment
   * @param alasan - Reason for punishment
   * @returns Promise<UserResponse> - Updated user data or error
   */
  static async applyPunishment(
    userId: string,
    hariHukuman: number,
    alasan: string
  ): Promise<UserResponse> {
    try {
      // Calculate end date
      const tanggalBerakhir = new Date();
      tanggalBerakhir.setDate(tanggalBerakhir.getDate() + hariHukuman);

      // Update user with punishment date
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          due_blocked: tanggalBerakhir,
        },
        select: {
          id: true,
          name: true,
          due_blocked: true,
        }
      });

      // Log the punishment activity
      await prisma.logAplikasi.create({
        data: {
          userId: userId, // This should be the admin's ID in actual implementation
          log: `Memberikan hukuman kepada ${updatedUser.name} selama ${hariHukuman} hari. Alasan: ${alasan}`,
        }
      });

      return {
        success: true,
        message: "Punishment applied successfully",
        data: updatedUser as User,
      };
    } catch (error) {
      console.error("Error applying punishment:", error);
      return {
        success: false,
        message: "Failed to apply punishment",
        data: null,
      };
    }
  }

  /**
   * Cancel user punishment
   * Used by: Admin
   * Purpose: Remove punishment by clearing due_blocked date and log the activity
   * 
   * @param userId - The ID of the user to remove punishment from
   * @returns Promise<UserResponse> - Updated user data or error
   */
  static async cancelPunishment(userId: string): Promise<UserResponse> {
    try {
      // Update user to remove punishment
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          due_blocked: null,
        },
        select: {
          id: true,
          name: true,
          due_blocked: true,
        }
      });

      // Log the cancellation activity
      await prisma.logAplikasi.create({
        data: {
          userId: userId, // This should be the admin's ID in actual implementation
          log: `Membatalkan hukuman untuk ${updatedUser.name}`,
        }
      });

      return {
        success: true,
        message: "Punishment cancelled successfully",
        data: updatedUser as User,
      };
    } catch (error) {
      console.error("Error cancelling punishment:", error);
      return {
        success: false,
        message: "Failed to cancel punishment",
        data: null,
      };
    }
  }
}
