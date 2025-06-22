"use server";

import { 
  getDashboardStats, 
  getMonthlyCalendarEvents, 
  type DashboardStats, 
  type CalendarEvent 
} from "@/service/dashboardService";
import { auth } from "@/auth";
import { logDashboardActivity } from "@/service/logService";

export interface DashboardData {
  stats: DashboardStats;
  events: CalendarEvent[];
}

export interface ActionResult<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

/**
 * Get dashboard statistics - Admin only
 */
export async function getDashboardStatsAction(): Promise<ActionResult<DashboardStats>> {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "ADMIN") {
      return {
        success: false,
        message: "Akses ditolak. Hanya admin yang dapat mengakses dashboard.",
        error: "UNAUTHORIZED"
      };
    }

    const stats = await getDashboardStats();

    // Log activity
    await logDashboardActivity(
      session.user.id!,
      'VIEW_STATS',
      'Melihat statistik dashboard'
    );

    return {
      success: true,
      message: "Berhasil mengambil statistik dashboard",
      data: stats
    };
  } catch (error) {
    return {
      success: false,
      message: "Gagal mengambil statistik dashboard",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Get calendar events for specific month - Admin only
 */
export async function getCalendarEventsForMonthAction(
  currentDate: Date
): Promise<ActionResult<CalendarEvent[]>> {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "ADMIN") {
      return {
        success: false,
        message: "Akses ditolak. Hanya admin yang dapat mengakses kalender.",
        error: "UNAUTHORIZED"
      };
    }

    const events = await getMonthlyCalendarEvents(currentDate);

    // Log activity
    await logDashboardActivity(
      session.user.id!,
      'VIEW_CALENDAR',
      `Melihat kalender bulan ${currentDate.getMonth() + 1}/${currentDate.getFullYear()}`
    );

    return {
      success: true,
      message: "Berhasil mengambil data kalender",
      data: events
    };
  } catch (error) {
    return {
      success: false,
      message: "Gagal mengambil data kalender",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

/**
 * Get complete dashboard data (stats + calendar) - Admin only
 */
export async function getDashboardDataAction(
  currentDate: Date
): Promise<ActionResult<DashboardData>> {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== "ADMIN") {
      return {
        success: false,
        message: "Akses ditolak. Hanya admin yang dapat mengakses dashboard.",
        error: "UNAUTHORIZED"
      };
    }

    const [stats, events] = await Promise.all([
      getDashboardStats(),
      getMonthlyCalendarEvents(currentDate)
    ]);

    return {
      success: true,
      message: "Berhasil mengambil data dashboard",
      data: {
        stats,
        events
      }
    };
  } catch (error) {
    return {
      success: false,
      message: "Gagal mengambil data dashboard",
      error: error instanceof Error ? error.message : "Unknown error"
    };
  }
} 