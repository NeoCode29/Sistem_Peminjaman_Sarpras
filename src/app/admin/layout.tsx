import React, { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AppHeader from '@/components/AppHeader';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = async ({ children }) => {
    const session = await auth();
    if (!session) {
        redirect('/auth/signin');
    }

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-screen">
                <AppSidebar role={session.user.role} />
                <div className="flex-1 flex flex-col">
                    <AppHeader user={session.user} />
                    <main className="flex-grow p-6 bg-gray-100">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default AdminLayout;

