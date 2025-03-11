import React from 'react';
import { NotificationProvider } from '../context/NotificationContext';
import { ActivityProvider } from '../context/ActivityContext';
import { AuthProvider } from '../context/auth-context';
import { BackupReminderProvider } from '../context/BackupReminderContext';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import '../styles/globals.css';

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ActivityProvider>
          <BackupReminderProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar />
                <main className="flex-1 overflow-y-auto p-6">
                  <Component {...pageProps} />
                </main>
                <footer className="py-4 text-center text-sm text-gray-500 border-t">
                  <p>© 2025 Hey You're Hired! v0.41 - Your Job Application Tracker</p>
                </footer>
              </div>
            </div>
          </BackupReminderProvider>
        </ActivityProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
