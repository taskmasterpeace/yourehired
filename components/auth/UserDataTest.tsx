import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/auth-context';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export function UserDataTest() {
  const { user, isLoading, loadUserData, saveUserData } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [testResult, setTestResult] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(false);

  // Load user data when component mounts if user is logged in
  useEffect(() => {
    if (user) {
      handleLoadData();
    }
  }, [user]);

  const handleLoadData = async () => {
    if (!user) return;
    
    setIsDataLoading(true);
    setTestResult('');
    try {
      const data = await loadUserData();
      setUserData(data);
      setTestResult('Data loaded successfully!');
    } catch (err: any) {
      setTestResult(`Loading data failed: ${err.message}`);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleSaveTestData = async () => {
    if (!user) return;
    
    setIsDataLoading(true);
    setTestResult('');
    try {
      // Create some test data
      const testOpportunities = [
        { 
          id: Date.now(),
          company: 'Test Company',
          position: 'Test Position',
          jobDescription: 'This is a test job description',
          status: 'Applied',
          appliedDate: new Date().toLocaleDateString()
        }
      ];
      
      const testResume = 'This is a test resume for ' + user.email;
      
      const testEvents = [
        { 
          id: Date.now(),
          title: 'Test Interview',
          date: new Date().toLocaleDateString(),
          type: 'interview'
        }
      ];
      
      await saveUserData({
        opportunities: testOpportunities,
        resume: testResume,
        events: testEvents
      });
      
      setTestResult('Test data saved successfully!');
      setUserData({
        opportunities: testOpportunities,
        resume: testResume,
        events: testEvents
      });
    } catch (err: any) {
      setTestResult(`Saving test data failed: ${err.message}`);
    } finally {
      setIsDataLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!user) return;
    
    setIsDataLoading(true);
    setTestResult('');
    try {
      await saveUserData({
        opportunities: [],
        resume: '',
        events: []
      });
      
      setUserData({
        opportunities: [],
        resume: '',
        events: []
      });
      
      setTestResult('Data cleared successfully!');
    } catch (err: any) {
      setTestResult(`Clearing data failed: ${err.message}`);
    } finally {
      setIsDataLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="h-8 w-8 rounded-full border-2 border-blue-500 border-t-transparent animate-spin"></div>
          </div>
          <p className="text-center mt-4">Loading authentication status...</p>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>User Data Test</CardTitle>
          <CardDescription>You need to be logged in to test user data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center">Please sign in to continue</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>User Data Test</CardTitle>
        <CardDescription>Test user-specific data storage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-green-100 rounded">
            <p><strong>Logged in as:</strong> {user.email}</p>
            <p><strong>User ID:</strong> {user.id}</p>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={handleLoadData} disabled={isDataLoading}>
              {isDataLoading ? 'Loading...' : 'Load Data'}
            </Button>
            <Button onClick={handleSaveTestData} variant="outline" disabled={isDataLoading}>
              {isDataLoading ? 'Saving...' : 'Save Test Data'}
            </Button>
            <Button onClick={handleClearData} variant="destructive" disabled={isDataLoading}>
              Clear Data
            </Button>
          </div>
          
          {testResult && (
            <div className={`p-3 rounded ${testResult.includes('failed') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
              {testResult}
            </div>
          )}
          
          {userData && (
            <div className="mt-4">
              <h3 className="font-bold mb-2">User Data:</h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-gray-100 rounded">
                  <h4 className="font-semibold mb-1">Opportunities ({userData.opportunities.length})</h4>
                  {userData.opportunities.length > 0 ? (
                    <pre className="text-xs overflow-auto max-h-40">
                      {JSON.stringify(userData.opportunities, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-gray-500">No opportunities found</p>
                  )}
                </div>
                
                <div className="p-3 bg-gray-100 rounded">
                  <h4 className="font-semibold mb-1">Resume</h4>
                  {userData.resume ? (
                    <div className="text-sm border p-2 bg-white">
                      {userData.resume}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No resume found</p>
                  )}
                </div>
                
                <div className="p-3 bg-gray-100 rounded">
                  <h4 className="font-semibold mb-1">Events ({userData.events.length})</h4>
                  {userData.events.length > 0 ? (
                    <pre className="text-xs overflow-auto max-h-40">
                      {JSON.stringify(userData.events, null, 2)}
                    </pre>
                  ) : (
                    <p className="text-sm text-gray-500">No events found</p>
                  )}
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 border-t pt-4">
            <h3 className="font-bold mb-2">How to Test:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>Click "Save Test Data" to create sample data in your account</li>
              <li>Click "Load Data" to verify the data was saved</li>
              <li>Sign out and sign back in to verify data persistence</li>
              <li>Click "Clear Data" to remove all your data</li>
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
