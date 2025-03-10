import { NotificationProvider } from '../context/NotificationContext';
import { ActivityProvider } from '../context/ActivityContext';
import Navbar from '../components/layout/Navbar';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NotificationProvider>
          <ActivityProvider>
            {/* Your other providers */}
            <Navbar />
            <main>{children}</main>
            {/* Footer and other components */}
          </ActivityProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
