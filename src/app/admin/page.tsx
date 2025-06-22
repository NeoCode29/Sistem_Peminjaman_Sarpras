import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminDashboardServer } from "@/components/admin/AdminDashboardServer";

const AdminPage = async () => {
  const session = await auth();
  
  if (!session || session.user.role !== "ADMIN") {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
        <p className="text-muted-foreground">
          Kelola dan pantau sistem peminjaman sarana dan prasarana
        </p>
      </div>
      
      <AdminDashboardServer adminId={session.user.id} />
    </div>
  );
};

export default AdminPage;
