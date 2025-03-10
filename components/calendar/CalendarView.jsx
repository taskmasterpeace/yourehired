"use client"

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import for BigCalendarView to avoid SSR issues
const BigCalendarView = dynamic(
  () => import("./BigCalendarView"),
  { ssr: false }
);
import { useToast } from "../ui/use-toast";

const CalendarView = ({ 
  events = [], 
  opportunities = [], 
  user,
  dispatch
}) => {
  const { toast } = useToast();
  const [notificationPreferences, setNotificationPreferences] = useState({
    enabled: true,
    browserNotifications: true,
    inAppNotifications: true,
    defaultReminderTime: '30', // minutes before event
    emailNotifications: false
  });
  
  // Load notification preferences from localStorage on component mount
  useEffect(() => {
    try {
      const savedPreferences = localStorage.getItem('notificationPreferences');
      if (savedPreferences) {
        setNotificationPreferences(JSON.parse(savedPreferences));
      }
    } catch (error) {
      console.error("Error loading notification preferences:", error);
    }
  }, []);
  
  // Save notification preferences to localStorage when they change
  const handleUpdateNotificationPreferences = (newPreferences) => {
    setNotificationPreferences(newPreferences);
    try {
      localStorage.setItem('notificationPreferences', JSON.stringify(newPreferences));
    } catch (error) {
      console.error("Error saving notification preferences:", error);
    }
  };
  
  return (
    <BigCalendarView 
      events={events} 
      opportunities={opportunities} 
      user={user}
      dispatch={dispatch}
      notificationPreferences={notificationPreferences}
      onUpdateNotificationPreferences={handleUpdateNotificationPreferences}
    />
  );
};

export default CalendarView;
