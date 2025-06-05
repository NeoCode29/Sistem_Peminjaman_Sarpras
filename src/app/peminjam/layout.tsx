import React from 'react';
import { AppSidebar } from '@/components/AppSidebar';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';


const PeminjamLayout = async ({ children }: { children: React.ReactNode }) => {
    
    // pengecekkan apakah user sudah login
    const session = await auth();
    if (!session) {
        redirect('/auth/signin');
    }

    return (
        <SidebarProvider>
            <AppSidebar role={session.user.role} />
            <SidebarTrigger className='md:hidden'/>
            {children}
        </SidebarProvider>
    );
};

export default PeminjamLayout;
