"use client"

import React from 'react';
import TUICalendarView from "./TUICalendarView";

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
    <TUICalendarView 
      events={events}
      opportunities={opportunities}
      user={user}
      dispatch={dispatch}
      isDarkMode={isDarkMode}
    />
  );
};

export default CalendarView;
