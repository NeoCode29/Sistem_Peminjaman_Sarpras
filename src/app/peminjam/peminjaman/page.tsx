import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PeminjamanPeminjamClient } from "@/components/peminjaman/PeminjamanPeminjamClient";

export default async function PeminjamanPage() {
  const session = await auth();
  
  if (!session?.user || session.user.role !== "PEMINJAM") {
    redirect("/auth/login");
  }

  return (
    <div className="container py-10 px-4 md:px-6">
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Daftar Peminjaman</h1>
            <p className="text-muted-foreground">
              Kelola dan pantau status peminjaman sarana dan prasarana Anda
            </p>
          </div>
        </div>
      </div>

      <PeminjamanPeminjamClient user={session.user} />
    </div>
  );
}
