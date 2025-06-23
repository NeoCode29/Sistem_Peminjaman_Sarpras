import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PanduanContent } from '@/components/peminjam/PanduanContent';

export default async function PanduanPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'PEMINJAM') {
    redirect('/unauthorized');
  }

  return (
    <div className="container mx-auto p-3 sm:p-6 max-w-4xl">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Panduan Peminjaman</h1>
        <p className="text-gray-600 mt-2 text-sm sm:text-base">
          Panduan lengkap tentang proses peminjaman sarana prasarana dan fitur marking.
        </p>
      </div>
      
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }>
        <PanduanContent />
      </Suspense>
    </div>
  );
} 