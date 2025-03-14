"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SignInForm } from "@/components/auth/SignInForm"
import { SignUpForm } from "@/components/auth/SignUpForm"
import Link from "next/link"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [defaultTab, setDefaultTab] = useState("signin")
  
  useEffect(() => {
    // Check if there's a tab parameter in the URL
    const tabParam = searchParams.get("tab")
    if (tabParam === "signup") {
      setDefaultTab("signup")
    }
  }, [searchParams])

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <div className="flex items-center justify-center mb-4">
              <img 
                src="/logo.png" 
                alt="Hey, You're Hired! Logo" 
                className="h-12 w-12 mr-2" 
              />
              <h1 className="text-3xl font-bold">Hey, You're Hired!</h1>
            </div>
          </Link>
          <p className="text-muted-foreground mt-2">Sign in to your account or create a new one</p>
        </div>
        
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <div className="mt-4">
              <SignInForm />
            </div>
          </TabsContent>
          <TabsContent value="signup">
            <div className="mt-4">
              <SignUpForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
