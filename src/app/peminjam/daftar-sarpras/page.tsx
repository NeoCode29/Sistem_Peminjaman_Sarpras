import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { ImprovedDaftarSarpras } from '@/components/peminjam/ImprovedDaftarSarpras';

export default async function DaftarSarprasPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'PEMINJAM') {
    redirect('/unauthorized');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Content Header - Following Design System Pattern */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Daftar Sarana Prasarana</h1>
          <p className="text-gray-600">
            Lihat ketersediaan sarana dan prasarana berdasarkan tanggal yang Anda pilih.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Suspense fallback={
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        }>
          <ImprovedDaftarSarpras />
        </Suspense>
      </div>
    </div>
  );
} 