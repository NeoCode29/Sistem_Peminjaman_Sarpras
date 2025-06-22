import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldX, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="container mx-auto p-6 max-w-md mt-20">
      <Card>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <ShieldX className="w-8 h-8 text-red-600" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Akses Ditolak
              </h1>
              <p className="text-gray-600 text-sm">
                Anda tidak memiliki akses untuk melihat halaman ini. 
                Anda hanya dapat melihat peminjaman yang Anda buat sendiri.
              </p>
            </div>

            <div className="pt-4">
              <Button asChild className="w-full">
                <Link href="/peminjam" className="flex items-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Kembali ke Beranda
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 