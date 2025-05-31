import Header from "@/components/header";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import {  DropdownMenu,  DropdownMenuContent,  DropdownMenuItem,  DropdownMenuLabel,  DropdownMenuSeparator,  DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import { SearchForm } from "@/components/ui/search-form";
import FormDialog from "@/components/ui/form-dialog";
import { DatePickerWithRange } from "@/components/ui/date-range"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-screen h-screen grid md:grid-cols-[240px_1fr] grid-cols-1">
      {/* Sidebar */}
      <div className="bg-blue-900">
        <SidebarProvider>
          <AppSidebar />
           <main>
             <SidebarTrigger />
             {children}
           </main>
        </SidebarProvider>
      </div>

      {/* Main Content */}
      <div className="flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="w-full h-16 px-6 border-b border-gray-300 flex items-center justify-between bg-white">
          <Header />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="bg-blue-500">
              Select Infokan
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Select Role</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Mahasiswa</DropdownMenuItem>
              <DropdownMenuItem>Pegawai</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <SearchForm></SearchForm>
          <FormDialog></FormDialog>
          <DatePickerWithRange></DatePickerWithRange>
        </main>
      </div>
    </div>
  );
}
