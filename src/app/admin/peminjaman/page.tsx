import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusPeminjaman } from "@prisma/client";
import { PeminjamanFilter } from "@/components/peminjaman/PeminjamanFilter";
import { PeminjamanList } from "@/components/peminjaman/PeminjamanList";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PeminjamanClient } from "@/components/peminjaman";

export default async function AdminPeminjamanPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/auth/login");
  }

  return (
    <div className="container py-10 px-4 md:px-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Daftar Peminjaman</h1>
            <p className="text-muted-foreground">
              Kelola dan pantau status peminjaman sarana dan prasarana
            </p>
          </div>
        </div>
      </div>

      <PeminjamanClient userId={session.user.id} />
    </div>
  );
} 