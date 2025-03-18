"use client"

import React from 'react';
import BigCalendarView from "./BigCalendarView";

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
