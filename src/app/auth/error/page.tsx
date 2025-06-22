"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function AuthErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  let errorMessage = "Terjadi kesalahan saat autentikasi"

  if (error === "OAuthAccountNotLinked") {
    errorMessage = "Email ini sudah terdaftar dengan metode login yang berbeda. Silakan gunakan metode login yang sama dengan yang Anda gunakan sebelumnya."
  }

  return (
    <Card className="w-full max-w-md p-6">
      <div className="flex flex-col space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Error Autentikasi
        </h1>
        <p className="text-sm text-muted-foreground">
          {errorMessage}
        </p>
        <Button asChild>
          <Link href="/auth/signin">
            Kembali ke Halaman Login
          </Link>
        </Button>
      </div>
    </Card>
  )
}

export default function AuthError() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Suspense fallback={
        <Card className="w-full max-w-md p-6">
          <div className="flex flex-col space-y-4 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Error Autentikasi
            </h1>
            <p className="text-sm text-muted-foreground">
              Memuat...
            </p>
          </div>
        </Card>
      }>
        <AuthErrorContent />
      </Suspense>
    </div>
  )
} 