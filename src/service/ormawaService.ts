import { prisma } from "@/lib/prisma";
import { Ormawa } from "@prisma/client";

export type OrmawaResponse = {
  success: boolean;
  message: string;
  data?: Ormawa[] | null;
};

export class OrmawaService {
  static async getAllOrmawa(): Promise<OrmawaResponse> {
    try {
      const ormawa = await prisma.ormawa.findMany({
        orderBy: {
          nama: 'asc'
        }
      });

      return {
        success: true,
        message: "Ormawa retrieved successfully",
        data: ormawa
      };
    } catch (error) {
      return {
        success: false,
        message: "Failed to fetch ormawa",
        data: null
      };
    }
  }
} 