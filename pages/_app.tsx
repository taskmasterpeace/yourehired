import '../src/styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../src/context/auth-context';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  );
}
