import React, { useState } from 'react';
import CalendarView from '../calendar/CalendarView';

interface CalendarTabProps {
  events: any[];
  opportunities: any[];
  isDarkMode: boolean;
  user: any;
  dispatch: any;
}

export function CalendarTab({
  events,
  opportunities,
  isDarkMode,
  user,
  dispatch
}: CalendarTabProps) {
  return (
    <div className={`calendar-tab ${isDarkMode ? 'dark-mode' : ''}`}>
      <CalendarView 
        events={events}
        opportunities={opportunities}
        user={user}
        dispatch={dispatch}
      />
    </div>
  );
}
