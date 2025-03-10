import { NotificationProvider } from '../context/NotificationContext';
import { ActivityProvider } from '../context/ActivityContext';
import Navbar from '../components/layout/Navbar';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Hey You're Hired! - Job Application Tracker v0.41</title>
        <meta name="description" content="Track and manage your job applications with Hey You're Hired!" />
      </head>
      <body>
        <NotificationProvider>
          <ActivityProvider>
            {/* Your other providers */}
            <Navbar />
            <main>{children}</main>
            <footer className="mt-8 py-4 text-center text-sm text-gray-500">
              <p>© 2025 Hey You're Hired! v0.41 - Your Job Application Tracker</p>
            </footer>
          </ActivityProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
