import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function MarkingPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  if (session.user.role !== 'PEMINJAM') {
    redirect('/unauthorized');
  }

  // Redirect to dashboard since marking is now integrated there
  redirect('/peminjam');
} 