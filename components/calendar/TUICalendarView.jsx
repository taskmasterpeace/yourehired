import React, { useState, useRef, useEffect } from 'react';
import Calendar from '@toast-ui/react-calendar';
import '@toast-ui/calendar/dist/toastui-calendar.min.css';
import { Card, CardContent } from "../ui/card";
import { useToast } from "../ui/use-toast";
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Button } from "../ui/button";
import { format } from 'date-fns';
import TUIEventForm from './TUIEventForm';
import { getEventColor } from './calendarUtils';

const TUICalendarView = ({ 
  events = [], 
  opportunities = [], 
  user,
  dispatch
}) => {
  const calendarRef = useRef(null);
  const { toast } = useToast();
  const [selectedView, setSelectedView] = useState('month');
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Format events for TUI Calendar
  const formattedEvents = events.map(event => {
    try {
      // Ensure we have valid dates
      let startDate;
      if (event.startDate instanceof Date) {
        startDate = event.startDate;
      } else if (event.startDate) {
        startDate = new Date(event.startDate);
      } else if (event.date) {
        startDate = new Date(event.date);
      } else {
        console.error("Event has no valid date:", event);
        return null;
      }
      
      // Validate the date
      if (isNaN(startDate.getTime())) {
        console.error("Invalid start date for event:", event);
        return null;
      }
      
      // Ensure we have a valid end date
      let endDate;
      if (event.endDate instanceof Date) {
        endDate = event.endDate;
      } else if (event.endDate) {
        endDate = new Date(event.endDate);
      } else {
        // Default to 1 hour after start
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      }
      
      // Validate the end date
      if (isNaN(endDate.getTime())) {
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      }
      
      // Get color from the existing utility function
      const colorClass = getEventColor(event);
      const backgroundColor = colorClass.split(' ')[0].replace('bg-', '');
      
      // Map Tailwind color classes to actual color values
      const colorMap = {
        'gray-400': '#9ca3af',
        'blue-500': '#3b82f6',
        'purple-500': '#8b5cf6',
        'yellow-500': '#eab308',
        'orange-500': '#f97316',
        'green-500': '#22c55e',
        'red-500': '#ef4444',
        'gray-600': '#4b5563'
      };
      
      const color = colorMap[backgroundColor] || '#9ca3af';
      
      return {
        id: event.id,
        calendarId: event.type || 'general',
        title: event.title || "Untitled Event",
        start: startDate,
        end: endDate,
        category: 'time',
        isReadOnly: false,
        backgroundColor: color,
        borderColor: color,
        raw: event // Store the original event data
      };
    } catch (error) {
      console.error("Error formatting event:", error, event);
      return null;
    }
  }).filter(Boolean);
  
  // Define calendar options
  const calendars = [
    { id: 'interview', name: 'Interview', color: '#8b5cf6', backgroundColor: '#8b5cf6' },
    { id: 'deadline', name: 'Deadline', color: '#ef4444', backgroundColor: '#ef4444' },
    { id: 'followup', name: 'Follow-up', color: '#3b82f6', backgroundColor: '#3b82f6' },
    { id: 'assessment', name: 'Assessment', color: '#eab308', backgroundColor: '#eab308' },
    { id: 'general', name: 'General', color: '#9ca3af', backgroundColor: '#9ca3af' }
  ];
  
  // Handle event click
  const handleClickEvent = (event) => {
    console.log('Clicked event:', event);
    setCurrentEvent(event.raw);
    setIsEventFormOpen(true);
  };
  
  // Handle event creation
  const handleCreateEvent = () => {
    setCurrentEvent(null);
    setIsEventFormOpen(true);
  };
  
  // Handle saving an event
  const handleSaveEvent = (eventData) => {
    const isNewEvent = !eventData.id;
    
    if (dispatch) {
      dispatch({ 
        type: isNewEvent ? 'ADD_EVENT' : 'UPDATE_EVENT', 
        payload: eventData 
      });
      
      toast({
        title: isNewEvent ? "Event Created" : "Event Updated",
        description: `"${eventData.title}" has been ${isNewEvent ? 'added to' : 'updated in'} your calendar.`,
        variant: "success",
        duration: 3000,
      });
    }
  };
  
  // Handle deleting an event
  const handleDeleteEvent = (eventId) => {
    if (dispatch) {
      dispatch({ type: 'DELETE_EVENT', payload: eventId });
      
      toast({
        title: "Event Deleted",
        description: "The event has been removed from your calendar.",
        variant: "success",
        duration: 3000,
      });
    }
  };
  
  // Set up mobile options
  useEffect(() => {
    if (calendarRef.current) {
      const instance = calendarRef.current.getInstance();
      
      if (isMobile) {
        // Set mobile-friendly options
        instance.setOptions({
          week: {
            narrowWeekend: true,
            hourStart: 8,
            hourEnd: 20
          },
          month: {
            visibleWeeksCount: 4
          }
        });
        
        // Switch to day view on mobile if in week view
        if (selectedView === 'week') {
          setSelectedView('day');
          instance.changeView('day');
        }
      } else {
        // Set desktop options
        instance.setOptions({
          week: {
            narrowWeekend: false,
            hourStart: 0,
            hourEnd: 24
          },
          month: {
            visibleWeeksCount: 6
          }
        });
      }
    }
  }, [isMobile]);
  
  // Create calendar toolbar
  const renderToolbar = () => {
    return (
      <div className="flex flex-col sm:flex-row justify-between items-center p-4 border-b dark:border-gray-700">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <Button 
            variant="outline"
            onClick={() => {
              if (calendarRef.current) {
                calendarRef.current.getInstance().today();
              }
            }}
          >
            Today
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              if (calendarRef.current) {
                calendarRef.current.getInstance().prev();
              }
            }}
          >
            &lt;
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              if (calendarRef.current) {
                calendarRef.current.getInstance().next();
              }
            }}
          >
            &gt;
          </Button>
          <h2 className="text-lg font-semibold ml-2">
            {calendarRef.current ? format(calendarRef.current.getInstance().getDate().toDate(), 'MMMM yyyy') : ''}
          </h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant={selectedView === 'day' ? 'default' : 'outline'}
            onClick={() => {
              setSelectedView('day');
              if (calendarRef.current) {
                calendarRef.current.getInstance().changeView('day');
              }
            }}
          >
            Day
          </Button>
          <Button 
            variant={selectedView === 'week' ? 'default' : 'outline'}
            onClick={() => {
              setSelectedView('week');
              if (calendarRef.current) {
                calendarRef.current.getInstance().changeView('week');
              }
            }}
          >
            Week
          </Button>
          <Button 
            variant={selectedView === 'month' ? 'default' : 'outline'}
            onClick={() => {
              setSelectedView('month');
              if (calendarRef.current) {
                calendarRef.current.getInstance().changeView('month');
              }
            }}
          >
            Month
          </Button>
          
          <Button onClick={handleCreateEvent}>
            Create Event
          </Button>
        </div>
      </div>
    );
  };
  
  // Color legend component for event types
  const ColorLegend = () => {
    const eventTypes = [
      { type: 'interview', label: 'Interview', color: 'bg-purple-500' },
      { type: 'deadline', label: 'Deadline', color: 'bg-red-500' },
      { type: 'followup', label: 'Follow-up', color: 'bg-blue-500' },
      { type: 'assessment', label: 'Assessment', color: 'bg-yellow-500' },
      { type: 'general', label: 'General', color: 'bg-gray-400' }
    ];

    return (
      <div className="flex flex-wrap gap-3 mt-4 p-3 bg-white dark:bg-gray-800 rounded-md border dark:border-gray-700">
        <div className="text-sm font-medium mr-2 text-gray-800 dark:text-gray-200">Event Types:</div>
        {eventTypes.map(item => (
          <div key={item.type} className="flex items-center">
            <div className={`w-3 h-3 rounded-full ${item.color} mr-1`}></div>
            <span className="text-sm text-gray-700 dark:text-gray-300">{item.label}</span>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-0">
          {renderToolbar()}
          
          <div style={{ height: isMobile ? '60vh' : '70vh' }}>
            <Calendar
              ref={calendarRef}
              height="100%"
              view={selectedView}
              month={{ startDayOfWeek: 0 }}
              calendars={calendars}
              events={formattedEvents}
              useDetailPopup={true}
              onClickEvent={handleClickEvent}
              isReadOnly={false}
            />
          </div>
        </CardContent>
      </Card>
      
      {!isMobile && <ColorLegend />}
      
      <TUIEventForm
        isOpen={isEventFormOpen}
        onClose={() => {
          setIsEventFormOpen(false);
          setCurrentEvent(null);
        }}
        event={currentEvent}
        opportunities={opportunities}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
};

export default TUICalendarView;
