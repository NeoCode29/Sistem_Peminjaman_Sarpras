import React from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppHeader from '@/components/AppHeader';
import { Toaster } from 'sonner';

const PeminjamLayout = async ({ children }: { children: React.ReactNode }) => {
    
    // pengecekkan apakah user sudah login
    const session = await auth();
    if (!session || !session.user) {
        redirect('/auth/signin');
    }

    // Ensure user has required properties
    const user = {
        id: session.user.id || '',
        name: session.user.name || null,
        role: session.user.role || 'PEMINJAM',
        image: session.user.image || null,
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-screen">
                <AppSidebar role={user.role} />
                <div className="flex-1 flex flex-col">
                    <AppHeader user={user} />
                    <main className="flex-grow  bg-gray-100">
                        {children}
                        <Toaster />
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default PeminjamLayout;
