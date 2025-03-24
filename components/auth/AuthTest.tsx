"use client"

import { useState } from 'react';
import { supabase } from '../../lib/supabase';

export function AuthTest() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<any>(null);
  
  const testAuth = async () => {
    try {
      setResult({ status: 'testing' });
      console.log("Direct auth test starting");
      
      // Check if we're using the real client
      const isDummyClient = !(supabase as any).supabaseUrl;
      console.log("Client check:", {
        isDummyClient,
        hasUrl: !!(supabase as any).supabaseUrl,
        hasAuth: !!supabase.auth
      });
      
      if (isDummyClient) {
        setResult({ 
          error: "Using dummy Supabase client. Environment variables are missing.",
          isDummyClient: true
        });
        return;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log("Direct auth test result:", { 
        success: !!data.session, 
        error: error?.message || null 
      });
      
      setResult({ 
        success: !!data.session, 
        userId: data.session?.user?.id || null,
        error: error?.message || null 
      });
    } catch (e) {
      console.error("Direct auth test exception:", e);
      setResult({ error: String(e) });
    }
  };
  
  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Authentication Test</h3>
      <input
        type="email"
        placeholder="Email"
        className="block w-full p-2 mb-2 border rounded"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="block w-full p-2 mb-2 border rounded"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button 
        onClick={testAuth}
        className="px-4 py-2 bg-blue-500 text-white rounded"
      >
        Test Direct Auth
      </button>
      
      {result && (
        <div className="mt-4 p-2 bg-gray-100 rounded">
          <pre>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
