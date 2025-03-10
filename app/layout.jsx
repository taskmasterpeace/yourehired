import { NotificationProvider } from '../context/NotificationContext';
import Navbar from '../components/layout/Navbar';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <NotificationProvider>
          {/* Your other providers */}
          <Navbar />
          <main>{children}</main>
          {/* Footer and other components */}
        </NotificationProvider>
      </body>
    </html>
  );
}
