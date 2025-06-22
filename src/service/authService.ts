"use client"

import { signIn } from "next-auth/react"

export async function signInWithGoogle() {
    try {
        await signIn("google", { 
            callbackUrl: "/dashboard"
        })
    } catch (error) {
        console.error("Error signing in with Google:", error)
    }
}