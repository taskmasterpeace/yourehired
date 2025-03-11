import React from 'react';
import TestNotificationButton from '../components/notifications/TestNotificationButton';

export default function Dashboard() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">Welcome to Hey You're Hired!</h2>
        <p className="mb-4">Your job application tracking dashboard.</p>
        
        <div className="mt-4">
          <TestNotificationButton />
        </div>
      </div>
    </div>
  );
}
