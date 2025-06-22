"use server";

import { UserService } from "@/service/userService";

export async function getUserByIdAction(userId: string, includeRelations: boolean = false) {
  try {
    const result = await UserService.getUserById(userId, includeRelations);
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to fetch user" };
  }
} 