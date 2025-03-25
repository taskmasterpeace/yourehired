import React from 'react';
import dynamic from 'next/dynamic';

// Import components with no SSR
const NotificationTester = dynamic(
  () => import('../../components/debug/NotificationTester'),
  { ssr: false }
);

const NotificationContent = dynamic(
  () => import('../../components/debug/NotificationContent'),
  { ssr: false }
);

export default function NotificationsDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Notifications Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <NotificationTester />
        </div>
        
        <div className="space-y-6">
          <NotificationContent />
        </div>
      </div>
    </div>
  );
}
