"use client"

import { Button } from "@/components/ui/button"
import { signIn } from "next-auth/react"
import { FcGoogle } from "react-icons/fc"

interface GoogleSignInButtonProps {
  className?: string
}

export function GoogleSignInButton({ className }: GoogleSignInButtonProps) {
  const handleSignIn = async () => {
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      console.error("Error signing in with Google:", error)
    }
  }

  return (
    <Button
      variant="outline"
      className={className}
      onClick={handleSignIn}
    >
      <FcGoogle className="mr-2 h-5 w-5" />
      Masuk dengan Google
    </Button>
  )
} 