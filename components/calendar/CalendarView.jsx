"use client"

import React from 'react';
import FullCalendarView from "./FullCalendarView";

const CalendarView = ({ 
  events = [], 
  opportunities = [], 
  user,
  dispatch,
  isDarkMode = false
}) => {
  console.log("CalendarView rendering with isDarkMode:", isDarkMode);
  console.log("Events count:", events.length);
  console.log("Opportunities count:", opportunities.length);
  
  return (
    <FullCalendarView 
      events={events}
      opportunities={opportunities}
      user={user}
      dispatch={dispatch}
      isDarkMode={isDarkMode}
    />
  );
};

export default CalendarView;
