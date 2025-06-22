import { getDashboardDataAction } from "@/actions/dashboardActions";
import { AdminDashboardClient } from "./AdminDashboardClient";

interface AdminDashboardServerProps {
  adminId: string;
}

export async function AdminDashboardServer({ adminId }: AdminDashboardServerProps) {
  // Fetch initial data using server actions
  const result = await getDashboardDataAction(new Date());

  if (!result.success || !result.data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <div className="text-red-500 text-center">
          <p className="font-semibold">Error loading dashboard</p>
          <p className="text-sm text-muted-foreground">
            {result.message || "Gagal memuat data dashboard"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <AdminDashboardClient 
      initialStats={result.data.stats}
      initialEvents={result.data.events}
    />
  );
} 