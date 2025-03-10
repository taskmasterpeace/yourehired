"use client"

import React, { useState } from 'react';
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
