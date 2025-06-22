"use server";

import { OrmawaService } from "@/service/ormawaService";

export async function getAllOrmawaAction() {
  try {
    const result = await OrmawaService.getAllOrmawa();
    return { data: result.data, error: null };
  } catch (error) {
    return { data: null, error: error instanceof Error ? error.message : "Failed to fetch ormawa" };
  }
} 