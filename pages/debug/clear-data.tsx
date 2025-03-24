import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ClearDataPage() {
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [opportunityCount, setOpportunityCount] = useState(0);
  const [isDuplicatesFound, setIsDuplicatesFound] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Get data from localStorage
      const savedState = localStorage.getItem('captainAppState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        if (Array.isArray(parsedState.opportunities)) {
          setOpportunities(parsedState.opportunities);
          setOpportunityCount(parsedState.opportunities.length);
          
          // Check for duplicates
          const opportunityIds = new Set();
          const duplicatesFound = parsedState.opportunities.some(opp => {
            if (opportunityIds.has(opp.id)) {
              return true; // Duplicate found
            }
            opportunityIds.add(opp.id);
            return false;
          });
          
          setIsDuplicatesFound(duplicatesFound);
          
          if (duplicatesFound) {
            setMessage(`Duplicates found! ${parsedState.opportunities.length} total opportunities with duplicated IDs.`);
          } else {
            setMessage(`No duplicates found. ${parsedState.opportunities.length} total opportunities.`);
          }
        } else {
          setMessage('No opportunities found in localStorage.');
        }
      } else {
        setMessage('No data found in localStorage.');
      }
    } catch (error) {
      setMessage(`Error loading data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cleanDuplicateOpportunities = () => {
    try {
      // Get data from localStorage
      const savedState = localStorage.getItem('captainAppState');
      if (!savedState) {
        setMessage('No data found in localStorage.');
        return;
      }

      const parsedState = JSON.parse(savedState);
      if (!Array.isArray(parsedState.opportunities)) {
        setMessage('No opportunities found in localStorage.');
        return;
      }

      // Create a map to store unique opportunities by ID
      const uniqueOpportunities = new Map();
      
      // Keep only the first occurrence of each opportunity ID
      for (const opp of parsedState.opportunities) {
        if (!uniqueOpportunities.has(opp.id)) {
          uniqueOpportunities.set(opp.id, opp);
        }
      }
      
      // Convert map values back to array
      const deduplicatedOpportunities = Array.from(uniqueOpportunities.values());
      
      // Update the state with deduplicated opportunities
      parsedState.opportunities = deduplicatedOpportunities;
      
      // Save back to localStorage
      localStorage.setItem('captainAppState', JSON.stringify(parsedState));
      
      // Update state
      setOpportunities(deduplicatedOpportunities);
      setOpportunityCount(deduplicatedOpportunities.length);
      setIsDuplicatesFound(false);
      setMessage(`Removed ${parsedState.opportunities.length - deduplicatedOpportunities.length} duplicate opportunities. Now have ${deduplicatedOpportunities.length} unique opportunities.`);
    } catch (error) {
      setMessage(`Error cleaning duplicates: ${error.message}`);
    }
  };

  const resetAllData = () => {
    if (confirm('Are you sure you want to reset ALL data? This cannot be undone!')) {
      try {
        localStorage.removeItem('captainAppState');
        localStorage.removeItem('captainAppStateEmergency');
        setMessage('All data has been cleared from localStorage. Refresh the app to start fresh.');
        setOpportunities([]);
        setOpportunityCount(0);
        setIsDuplicatesFound(false);
      } catch (error) {
        setMessage(`Error resetting data: ${error.message}`);
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>CAPTAIN Data Cleanup Utility</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h2 className="text-xl font-bold mb-2">Current Status:</h2>
            <p className={`mb-2 ${isDuplicatesFound ? 'text-red-500 font-bold' : 'text-green-500'}`}>
              {message}
            </p>
            <p>Total opportunities: {opportunityCount}</p>
          </div>
          
          <div className="flex gap-4 mt-4">
            <Button 
              variant="destructive" 
              onClick={cleanDuplicateOpportunities}
              disabled={!isDuplicatesFound || isLoading}
            >
              Remove Duplicates
            </Button>
            
            <Button
              variant="destructive"
              onClick={resetAllData}
              disabled={isLoading}
            >
              Reset ALL Data
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Opportunity Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto max-h-96">
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(opportunities, null, 2)}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 