"use client"

import React from 'react';
import BigCalendarView from "./BigCalendarView";

console.log("LOADING COMPONENT: CalendarView.jsx - VERSION 2");

const CalendarView = ({ 
  events = [], 
  opportunities = [], 
  user,
  dispatch
}) => {
  console.log("RENDERING: CalendarView with events:", events.length);
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
