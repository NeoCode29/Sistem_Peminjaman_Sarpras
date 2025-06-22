import { SessionProvider } from "next-auth/react";
import PeminjamanDetailClient from "./PeminjamanDetailClient";
import { use } from "react";

interface PeminjamanDetailProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PeminjamanDetailPage({ params }: PeminjamanDetailProps) {
  // Await params before accessing its properties
  const resolvedParams = use(params);
  const peminjamanId = resolvedParams?.id;

  if (!peminjamanId) {
    return <div>Peminjaman tidak ditemukan</div>;
  }

  return (
    <SessionProvider>
      <PeminjamanDetailClient peminjamanId={peminjamanId} />
    </SessionProvider>
  );
}
