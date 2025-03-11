import { NotificationProvider } from '../context/NotificationContext';
import { ActivityProvider } from '../context/ActivityContext';
import { AuthProvider } from '../context/auth-context';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Hey You're Hired! - Job Application Tracker v0.41</title>
        <meta name="description" content="Track and manage your job applications with Hey You're Hired!" />
      </head>
      <body>
        <AuthProvider>
          <NotificationProvider>
            <ActivityProvider>
              {/* Your other providers */}
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                  <Navbar />
                  <main className="flex-1 overflow-y-auto p-6">{children}</main>
                  <footer className="py-4 text-center text-sm text-gray-500 border-t">
                    <p>© 2025 Hey You're Hired! v0.41 - Your Job Application Tracker</p>
                  </footer>
                </div>
              </div>
            </ActivityProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
