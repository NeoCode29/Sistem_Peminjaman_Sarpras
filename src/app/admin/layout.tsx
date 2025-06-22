import React, { ReactNode } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import AppHeader from '@/components/AppHeader';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = async ({ children }) => {
    const session = await auth();
    if (!session || !session.user) {
        redirect('/auth/signin');
    }

    // Ensure user has required properties
    const user = {
        id: session.user.id || '',
        name: session.user.name || null,
        role: session.user.role || 'ADMIN',
        image: session.user.image || null,
    };

    return (
        <SidebarProvider>
            <div className="min-h-screen flex w-screen">
                <AppSidebar role={user.role} />
                <div className="flex-1 flex flex-col">
                    <AppHeader user={user} />
                    <main className="flex-grow p-6">
                        {children}
                    </main>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default AdminLayout;

