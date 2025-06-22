import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminPeminjamanDetailClient from "./AdminPeminjamanDetailClient";
import { use } from "react";

interface PeminjamanDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminPeminjamanDetailPage({ params }: PeminjamanDetailProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const peminjamanId = resolvedParams?.id;

  if (!peminjamanId) {
    return <div>Peminjaman tidak ditemukan</div>;
  }

  const adminId = session.user.id || "";

  return <AdminPeminjamanDetailClient adminId={adminId} peminjamanId={peminjamanId} />;
} 