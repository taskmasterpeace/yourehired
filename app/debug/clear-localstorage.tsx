import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClearLocalStoragePage() {
  const [message, setMessage] = useState<string>('');
  const [storageInfo, setStorageInfo] = useState<string>('');
  
  // Get localStorage info on page load
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        // Estimate localStorage size
        let totalSize = 0;
        let items: Record<string, number> = {};
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i) || '';
          const value = localStorage.getItem(key) || '';
          const size = (key.length + value.length) * 2; // UTF-16 encoding uses 2 bytes per character
          totalSize += size;
          items[key] = size;
        }
        
        // Format info
        let infoText = `Total localStorage usage: ${(totalSize / 1024).toFixed(2)} KB\n\n`;
        infoText += 'Individual items:\n';
        
        Object.entries(items).forEach(([key, size]) => {
          infoText += `${key}: ${(size / 1024).toFixed(2)} KB\n`;
        });
        
        setStorageInfo(infoText);
      }
    } catch (error) {
      setStorageInfo('Error getting localStorage info: ' + (error as Error).message);
    }
  }, []);
  
  const clearAllLocalStorage = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        setMessage('SUCCESS: All localStorage data has been completely cleared. Reload the app to start fresh.');
        setStorageInfo('Total localStorage usage: 0 KB');
      }
    } catch (error) {
      setMessage('ERROR: Failed to clear localStorage: ' + (error as Error).message);
    }
  };
  
  const clearAppState = () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('captainAppState');
        localStorage.removeItem('captainAppStateEmergency');
        setMessage('SUCCESS: App state data has been cleared. Other settings remain intact.');
        
        // Update storage info
        const totalSize = [...Array(localStorage.length)].reduce((acc, _, i) => {
          const key = localStorage.key(i) || '';
          const value = localStorage.getItem(key) || '';
          return acc + (key.length + value.length) * 2;
        }, 0);
        
        setStorageInfo(`Total localStorage usage: ${(totalSize / 1024).toFixed(2)} KB\n\nItems deleted: captainAppState, captainAppStateEmergency`);
      }
    } catch (error) {
      setMessage('ERROR: Failed to clear app state: ' + (error as Error).message);
    }
  };
  
  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>EMERGENCY: Clear LocalStorage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded">
            <p className="font-bold text-red-800 mb-2">WARNING:</p>
            <p className="text-red-700">
              This is an emergency tool to fix localStorage quota errors. Using these buttons will 
              delete your local data. Only use this if your application is crashing with 
              "QuotaExceededError" messages.
            </p>
          </div>
          
          <div className="space-y-4">
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={clearAppState}
            >
              Clear App Data Only (Recommended)
            </Button>
            
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={clearAllLocalStorage}
            >
              Clear ALL LocalStorage Data (Nuclear Option)
            </Button>
            
            {message && (
              <div className={`p-3 rounded ${message.startsWith('SUCCESS') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {message}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>LocalStorage Information</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs whitespace-pre-wrap bg-gray-50 p-3 rounded overflow-auto max-h-60">
            {storageInfo}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
} 