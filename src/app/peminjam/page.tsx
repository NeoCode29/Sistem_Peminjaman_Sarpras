import { Suspense } from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { PeminjamDashboardClient } from '@/components/peminjam/PeminjamDashboardClient';

export default async function PeminjamPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'PEMINJAM') {
    redirect('/unauthorized');
  }

  return (
    <Suspense fallback={
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    }>
      <PeminjamDashboardClient session={session} />
    </Suspense>
  );
}
