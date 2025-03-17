import dynamic from 'next/dynamic'

// Import the main application component with dynamic import to handle client-side only features
const CAPTAINGui = dynamic(() => import('../../captain_gui'), { 
  ssr: false 
});

export default function AppPage() {
  return <CAPTAINGui />
}
