import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LogAplikasiClient from "./LogAplikasiClient";

export const metadata: Metadata = {
  title: "Log Aplikasi | Admin Dashboard",
  description: "Monitor aktivitas pengguna dalam aplikasi",
};

export default async function LogAplikasiPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Log Aplikasi</h1>
          <p className="text-muted-foreground">
            Monitor semua aktivitas pengguna dalam aplikasi
          </p>
        </div>
        
        <LogAplikasiClient />
      </div>
    </div>
  );
} 