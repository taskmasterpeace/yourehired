"use client"

import React, { useState } from 'react';
import dynamic from 'next/dynamic';

// Use dynamic import for Calendar to avoid SSR issues
const Calendar = dynamic(
  () => import("../ui/calendar").then((mod) => mod.Calendar),
  { ssr: false }
);
import CalendarHeader from './CalendarHeader';
import EventList from './EventList';
import TimelineView from './TimelineView';
import EventModal from './EventModal';
import { Card, CardContent } from "../ui/card";
import { useToast } from "../ui/use-toast";

const CalendarView = ({ 
  events = [], 
  opportunities = [], 
  user,
  dispatch
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day, timeline
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const { toast } = useToast();
  
  // Filter events based on selected filters
  const filteredEvents = events.filter(event => {
    // Filter by event type if not 'all'
    if (eventTypeFilter !== 'all' && event.type !== eventTypeFilter) {
      return false;
    }
    
    // Additional filters can be added here
    
    return true;
  });
  
  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    
    // If in month view and user clicks a date, show day view for that date
    if (viewMode === 'month') {
      setViewMode('day');
    }
  };
  
  // Handle creating a new event
  const handleCreateEvent = (date) => {
    setCurrentEvent({
      date: date || selectedDate,
      type: 'general',
      title: '',
      description: ''
    });
    setIsEventModalOpen(true);
  };
  
  // Handle editing an existing event
  const handleEditEvent = (event) => {
    setCurrentEvent(event);
    setIsEventModalOpen(true);
  };
  
  // Handle saving an event (create or update)
  const handleSaveEvent = (eventData) => {
    const isNewEvent = !eventData.id;
    
    // Here you would dispatch to your state management
    // dispatch({ 
    //   type: isNewEvent ? 'ADD_EVENT' : 'UPDATE_EVENT', 
    //   payload: eventData 
    // });
    
    // Show toast notification
    toast({
      title: isNewEvent ? "Event Created" : "Event Updated",
      description: `${eventData.title} has been ${isNewEvent ? 'added to' : 'updated in'} your calendar.`,
      duration: 3000,
    });
    
    setIsEventModalOpen(false);
    setCurrentEvent(null);
  };
  
  // Render the appropriate calendar view based on viewMode
  const renderCalendarView = () => {
    switch (viewMode) {
      case 'timeline':
        return (
          <TimelineView 
            events={filteredEvents}
            opportunities={opportunities}
            selectedDate={selectedDate}
            onEventClick={handleEditEvent}
          />
        );
      case 'week':
        // Week view implementation
        return (
          <div className="week-view">
            <Calendar 
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              events={filteredEvents}
              className="rounded-md border"
              // Additional props for week view
            />
          </div>
        );
      case 'day':
        // Day view implementation
        return (
          <div className="day-view">
            <Calendar 
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              events={filteredEvents}
              className="rounded-md border"
              // Additional props for day view
            />
          </div>
        );
      case 'month':
      default:
        return (
          <Calendar 
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            events={filteredEvents}
            className="rounded-md border"
            onDayClick={(day) => {
              setSelectedDate(day);
              // Check if there are events on this day to determine if we should open event list
            }}
          />
        );
    }
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="md:col-span-2">
        <CardContent className="p-0">
          <CalendarHeader 
            viewMode={viewMode}
            setViewMode={setViewMode}
            eventTypeFilter={eventTypeFilter}
            setEventTypeFilter={setEventTypeFilter}
            selectedDate={selectedDate}
            onCreateEvent={() => handleCreateEvent(selectedDate)}
          />
          
          <div className="p-4">
            {renderCalendarView()}
          </div>
        </CardContent>
      </Card>
      
      <EventList 
        date={selectedDate}
        events={filteredEvents}
        onEventClick={handleEditEvent}
        onCreateEvent={() => handleCreateEvent(selectedDate)}
      />
      
      <EventModal 
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setCurrentEvent(null);
        }}
        event={currentEvent}
        opportunities={opportunities}
        onSave={handleSaveEvent}
      />
    </div>
  );
};

export default CalendarView;
