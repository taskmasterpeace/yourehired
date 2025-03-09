"use client"

import React, { useState } from 'react'
import { SignInForm } from '../../components/auth/SignInForm'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../context/auth-context'

export default function LoginPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [bgImageError, setBgImageError] = useState(false)
  
  
  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      router.push('/')
    }
  }, [user, router])

  return (
    <div className="min-h-screen flex items-center justify-start pl-16 bg-cover bg-center relative">
      {/* Background image with fallback */}
      <Image
        src="/login-background.jpg"
        alt="Background"
        fill
        className="object-cover z-5"
        priority
        onError={(e) => {
          console.log("Background image failed to load - using fallback gradient");
          setBgImageError(true);
          // Make the image invisible but keep it in the DOM
          e.currentTarget.style.display = 'none';
        }}
      />
      
      {/* Fallback background color - only show when image fails */}
      {bgImageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-indigo-800 z-0"></div>
      )}
      
      {/* Semi-transparent overlay - with reduced blur effect */}
      <div className="absolute inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-10"></div>
      
      {/* Version number and developer credit - moved above blur layer and made more visible */}
      <div className="absolute bottom-4 left-4 text-white text-sm font-medium z-20">
        Version 0.4 - Auth
      </div>
      
      <div className="absolute bottom-4 right-4 text-white text-sm font-medium z-20">
        Developed by Robert Task Smith
      </div>
      
      <motion.div 
        className="relative z-20 w-full max-w-4xl bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-2xl overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left panel with branding */}
          <div className="relative bg-blue-600 p-8 flex flex-col items-center justify-center text-white">
            {/* Fallback background in case the panel needs a placeholder */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-indigo-600"></div>
            
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
                ease: "easeInOut",
                repeatType: "loop"
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
                ease: "easeInOut",
                repeatType: "loop"
              }}
            />
            
            {/* 16:9 banner image with fallback */}
            <div className="relative w-full mb-8" style={{ aspectRatio: '16/9' }}>
              <div className="relative w-full h-full bg-blue-700 rounded-lg flex items-center justify-center">
                {/* Fallback content if image doesn't load */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <h2 className="text-2xl font-bold text-white">You're Hired!</h2>
                </div>
                
                <Image
                  src="/banner-image.jpg"
                  alt="You're Hired Banner"
                  fill
                  className="object-cover rounded-lg"
                  priority
                  onError={(e) => {
                    // If image fails to load, we already have the fallback visible
                    console.error("Banner image failed to load: /banner-image.jpg");
                    // Make the fallback more visible
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            </div>
            
            {/* 1:1 logo with fallback */}
            <div className="relative w-32 h-32 mb-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold">YH</span>
              </div>
              
              <Image
                src="/logo.png"
                alt="You're Hired Logo"
                fill
                className="object-contain rounded-full"
                priority
                onError={(e) => {
                  // If image fails to load, we already have the fallback visible
                  console.error("Logo image failed to load: /logo.png");
                  // Make the fallback more visible
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
            
            <h1 className="text-3xl font-bold mb-2 text-center relative z-10">Hey You're Hired!</h1>
            <p className="text-center opacity-80 relative z-10">Your personal job search assistant</p>
          </div>
          
          {/* Right panel with login form */}
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h2>
              <p className="text-gray-600 dark:text-gray-300">Sign in to continue your job search journey</p>
            </div>
            
            <SignInForm />
            
            <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
              <p>Don't have an account? <a href="/signup" className="text-blue-600 dark:text-blue-400 hover:underline">Sign up</a></p>
            </div>
            
            {/* Auth test component removed */}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
