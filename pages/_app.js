import '../globals.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../styles/calendar-dark-mode.css';
import { NotificationProvider } from '../context/NotificationContext';
import { ActivityProvider } from '../context/ActivityContext';
import { AuthProvider } from '../context/auth-context';
import { BackupReminderProvider } from '../context/BackupReminderContext';
import { Toaster } from '../components/ui/toaster';
import Sidebar from '../components/layout/Sidebar'; // Add the sidebar back

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <ActivityProvider>
          <BackupReminderProvider>
            <div className="flex h-screen overflow-hidden">
              <Sidebar /> {/* This is the important sidebar with all navigation links */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-1 overflow-y-auto p-6">
                  <Component {...pageProps} />
                </main>
                <footer className="py-4 text-center text-sm text-gray-500 border-t">
                  <p>© 2025 Hey You're Hired! v0.41 - Your Job Application Tracker</p>
                </footer>
              </div>
            </div>
            <Toaster />
          </BackupReminderProvider>
        </ActivityProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default MyApp;
