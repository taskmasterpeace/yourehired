"use client"

import React from 'react'
import { SignUpForm } from '../../components/auth/SignUpForm'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/auth-context'

export default function SignupPage() {
  const router = useRouter()
  const { user } = useAuth()
  
  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center" 
         style={{ backgroundImage: 'url(/login-background.jpg)' }}>
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
      
      <motion.div 
        className="relative z-10 w-full max-w-4xl bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          y: [0, -10, 0],
          x: [0, 5, 0],
          opacity: 1,
        }}
        transition={{
          duration: 6,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left panel with branding */}
          <div className="relative bg-blue-600 p-8 flex flex-col items-center justify-center text-white">
            {/* Floating background elements */}
            <motion.div 
              className="absolute top-[10%] left-[15%] w-32 h-32 bg-blue-400 rounded-full opacity-30"
              animate={{ 
                y: [0, 15, 0],
                x: [0, 10, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 6,
                ease: "easeInOut" 
              }}
            />
            <motion.div 
              className="absolute bottom-[20%] right-[10%] w-40 h-40 bg-indigo-400 rounded-full opacity-20"
              animate={{ 
                y: [0, -20, 0],
                x: [0, -15, 0]
              }}
              transition={{ 
                repeat: Infinity, 
                duration: 7,
                ease: "easeInOut" 
              }}
            />
            
            {/* 16:9 banner image */}
            <div className="w-full mb-8" style={{ aspectRatio: '16/9' }}>
              <div className="relative w-full h-full">
                <Image
                  src="/banner-image.jpg"
                  alt="You're Hired Banner"
                  fill
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
            </div>
            
            {/* 1:1 logo (alternative) */}
            <div className="relative w-32 h-32 mb-6">
              <Image
                src="/logo.jpg"
                alt="You're Hired Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            
            <h1 className="text-3xl font-bold mb-2 text-center">Hey You're Hired!</h1>
            <p className="text-center opacity-80">Your personal job search assistant</p>
          </div>
          
          {/* Right panel with signup form */}
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create an Account</h2>
              <p className="text-gray-600 dark:text-gray-300">Join us to start your job search journey</p>
            </div>
            
            <SignUpForm />
            
            <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
              <p>Already have an account? <a href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">Sign in</a></p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
