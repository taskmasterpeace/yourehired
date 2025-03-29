// app/layout.tsx - updated with AuthRedirector
"use client";

import { Inter } from "next/font/google";
import "../styles/globals.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "../styles/calendar.css";
import { AuthProvider } from "@/context/auth-context";
import { AppProvider } from "@/context/context";
import { AuthRedirector } from "./providers";
import { Toaster } from "@/components/ui/toaster";
import { NotificationProvider } from "@/components/notifications/NotificationContext";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NotificationProvider>
          <AuthProvider>
            <AppProvider>
              <AuthRedirector>{children}</AuthRedirector>
              <Toaster />
            </AppProvider>
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
