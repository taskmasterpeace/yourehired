import dynamic from 'next/dynamic';

// Import the main application component with SSR disabled
const CAPTAINGui = dynamic(() => import('@/captain_gui'), { ssr: false });

export default function AppPage() {
  return <CAPTAINGui />;
}
