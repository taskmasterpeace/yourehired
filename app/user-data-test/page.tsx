"use client"

import { UserDataTest } from '../../components/auth/UserDataTest';
import { AuthWrapper } from '../../components/AuthWrapper';

export default function UserDataTestPage() {
  return (
    <AuthWrapper>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-center">User Data Storage Test</h1>
        <UserDataTest />
      </div>
    </AuthWrapper>
  );
}
