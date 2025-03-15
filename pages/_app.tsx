import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../context/auth-context';
import { NotificationsProvider } from '../context/NotificationContext';
import { AppStateProvider } from '../context/context';
import { ThemeProvider } from 'next-themes';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class">
      <AuthProvider>
        <AppStateProvider>
          <NotificationsProvider>
            <Component {...pageProps} />
          </NotificationsProvider>
        </AppStateProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
