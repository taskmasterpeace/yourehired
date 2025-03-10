import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const ActivityContext = createContext();

export const useActivity = () => useContext(ActivityContext);

export const ActivityProvider = ({ children }) => {
  const [activities, setActivities] = useState([]);
  
  // Load activities from localStorage on mount
  useEffect(() => {
    try {
      const savedActivities = localStorage.getItem('activities');
      if (savedActivities) {
        setActivities(JSON.parse(savedActivities));
      }
    } catch (error) {
      console.error('Error loading activities from localStorage:', error);
    }
  }, []);
  
  // Save activities to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('activities', JSON.stringify(activities));
    } catch (error) {
      console.error('Error saving activities to localStorage:', error);
    }
  }, [activities]);
  
  // Add a new activity
  const addActivity = (activity) => {
    const newActivity = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...activity
    };
    
    setActivities(prev => [newActivity, ...prev]);
    return newActivity.id;
  };
  
  // Get activities for a specific opportunity
  const getOpportunityActivities = (opportunityId) => {
    return activities.filter(activity => activity.opportunityId === opportunityId);
  };
  
  // Get all activities
  const getAllActivities = () => {
    return activities;
  };
  
  // Clear old activities (older than 30 days)
  const clearOldActivities = () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    setActivities(prev => 
      prev.filter(activity => new Date(activity.timestamp) >= thirtyDaysAgo)
    );
  };
  
  const value = {
    activities,
    addActivity,
    getOpportunityActivities,
    getAllActivities,
    clearOldActivities
  };
  
  return (
    <ActivityContext.Provider value={value}>
      {children}
    </ActivityContext.Provider>
  );
};
