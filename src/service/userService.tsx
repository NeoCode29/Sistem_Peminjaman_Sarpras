import { prisma } from "@/lib/prisma";
import { User, UserRole, Prisma } from "@prisma/client";
import { z } from "zod";

// Validation schemas
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

// Type for user response
export type UserResponse = {
  success: boolean;
  message: string;
  data?: User | null;
};

// Type for paginated response
export type PaginatedUserResponse = {
  success: boolean;
  message: string;
  data: {
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
   * @param params - Parameters for filtering and pagination
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
          mahasiswa: true,
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
   * @param userId - The ID of the user to fetch
   * @param includeRelations - Whether to include mahasiswa/pegawai relations
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
              mahasiswa: true,
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
   * @param userId - The ID of the user to update
   * @param newRole - The new role to assign
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
}
