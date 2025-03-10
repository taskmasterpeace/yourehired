"use client"

import React from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import for BigCalendarView to avoid SSR issues
const BigCalendarView = dynamic(
  () => import("./BigCalendarView"),
  { ssr: false }
);

const CalendarView = ({ 
  events = [], 
  opportunities = [], 
  user,
  dispatch
}) => {
  return (
    <BigCalendarView 
      events={events} 
      opportunities={opportunities} 
      user={user}
      dispatch={dispatch}
    />
  );
};

export default CalendarView;
