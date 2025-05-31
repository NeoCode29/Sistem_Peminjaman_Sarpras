import React, { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

interface AdminLayoutProps {
    children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <SidebarProvider>
            <div className="min-h-screen flex">
                <AppSidebar role="admin" />
                <div className="flex-1 flex flex-col">
                    <SidebarTrigger />
                    <header className="bg-blue-600 text-white p-4">
                        <h1 className="text-xl font-bold">Admin Dashboard</h1>
                    </header>
                    <main className="flex-grow p-6 bg-gray-100">
                        {children}
                    </main>
                    <footer className="bg-blue-600 text-white p-4 text-center">
                        <p>&copy; 2023 Your Company</p>
                    </footer>
                </div>
            </div>
        </SidebarProvider>
    );
};

export default AdminLayout;

