"use client"

import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { FcGoogle } from "react-icons/fc"
import { useState } from "react"

interface GoogleSignInButtonProps {
  className?: string
}

export function GoogleSignInButton({ className }: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    try {
      setIsLoading(true)
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error("Error signin with Google:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="lg"
      className={`${className} bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300 text-gray-700 hover:text-blue-600 font-semibold py-4 px-6 rounded-xl transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
      onClick={handleSignIn}
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      ) : (
        <FcGoogle className="mr-3 h-6 w-6" />
      )}
      {isLoading ? "Memproses..." : "Masuk dengan Google"}
    </Button>
  )
} 