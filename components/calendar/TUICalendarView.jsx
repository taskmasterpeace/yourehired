import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { useToast } from "../ui/use-toast";
import { format, parseISO } from 'date-fns';
import TUIEventForm from './TUIEventForm';

// Import a simple calendar library instead of TUI Calendar
import { Calendar as ReactCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { startOfWeek, getDay, parse } from 'date-fns';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Set up the localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const TUICalendarView = ({ 
  events = [], 
  opportunities = [], 
  user,
  dispatch,
  isDarkMode = false
}) => {
  const { toast } = useToast();
  const [selectedView, setSelectedView] = useState('month');
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  
  // Format events for the calendar
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
      
      // Get color based on event type
      const getEventColor = (type) => {
        switch(type) {
          case 'interview': return '#8b5cf6'; // purple
          case 'deadline': return '#ef4444'; // red
          case 'followup': return '#3b82f6'; // blue
          case 'assessment': return '#eab308'; // yellow
          default: return '#9ca3af'; // gray
        }
      };
      
      return {
        id: event.id,
        title: event.title || "Untitled Event",
        start: startDate,
        end: endDate,
        allDay: false,
        resource: event, // Store the original event data
        backgroundColor: getEventColor(event.type)
      };
    } catch (error) {
      console.error("Error formatting event:", error, event);
      return null;
    }
  }).filter(Boolean);
  
  // Handle event click
  const handleSelectEvent = (event) => {
    console.log('Selected event:', event);
    
    // Create a complete event object to pass to the form
    const eventToEdit = {
      id: event.resource?.id || event.id,
      title: event.title,
      startDate: event.start,
      endDate: event.end,
      type: event.resource?.type || 'general',
      description: event.resource?.description || '',
      opportunityId: event.resource?.opportunityId || ''
    };
    
    console.log('Event being passed to form:', eventToEdit);
    setCurrentEvent(eventToEdit);
    setIsEventFormOpen(true);
  };
  
  // Handle slot selection (creating a new event)
  const handleSelectSlot = ({ start }) => {
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    
    setCurrentEvent({
      title: '',
      startDate: start,
      endDate: end,
      type: 'general',
      description: ''
    });
    
    setIsEventFormOpen(true);
  };
  
  // Handle creating a new event
  const handleCreateEvent = () => {
    const start = new Date();
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    
    setCurrentEvent({
      title: '',
      startDate: start,
      endDate: end,
      type: 'general',
      description: ''
    });
    
    setIsEventFormOpen(true);
  };
  
  // Handle saving an event
  const handleSaveEvent = (eventData) => {
    const isNewEvent = !eventData.id;
    
    if (dispatch) {
      // Ensure we have valid dates
      const eventToSave = {
        ...eventData,
        startDate: eventData.startDate instanceof Date ? eventData.startDate : new Date(eventData.startDate),
        endDate: eventData.endDate instanceof Date ? eventData.endDate : new Date(eventData.endDate)
      };
      
      dispatch({ 
        type: isNewEvent ? 'ADD_EVENT' : 'UPDATE_EVENT', 
        payload: eventToSave 
      });
      
      toast({
        title: isNewEvent ? "Event Created" : "Event Updated",
        description: `"${eventData.title}" has been ${isNewEvent ? 'added to' : 'updated in'} your calendar.`,
        variant: "success",
        duration: 3000,
      });
      
      setIsEventFormOpen(false);
      setCurrentEvent(null);
    }
  };
  
  // Handle deleting an event
  const handleDeleteEvent = (eventId) => {
    if (dispatch) {
      console.log("Deleting event with ID:", eventId);
      
      if (!eventId) {
        console.error("No valid event ID to delete");
        toast({
          title: "Error Deleting Event",
          description: "Could not identify the event to delete.",
          variant: "destructive",
          duration: 3000,
        });
        return;
      }
      
      dispatch({ type: 'DELETE_EVENT', payload: eventId });
      
      toast({
        title: "Event Deleted",
        description: "The event has been removed from your calendar.",
        variant: "success",
        duration: 3000,
      });
      
      setIsEventFormOpen(false);
      setCurrentEvent(null);
    }
  };
  
  // Custom event styling
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.backgroundColor || '#3b82f6',
        borderRadius: '4px',
        color: 'white',
        border: 'none',
        display: 'block'
      }
    };
  };
  
  // Create calendar toolbar
  const renderToolbar = () => {
    return (
      <div className={`flex flex-col sm:flex-row justify-between items-center p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <Button 
            variant="outline"
            onClick={() => {
              setSelectedView('month');
            }}
          >
            Month
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setSelectedView('week');
            }}
          >
            Week
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setSelectedView('day');
            }}
          >
            Day
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              setSelectedView('agenda');
            }}
          >
            Agenda
          </Button>
        </div>
        
        <Button onClick={handleCreateEvent}>
          Create Event
        </Button>
      </div>
    );
  };
  
  // Color legend component for event types
  const ColorLegend = () => {
    const eventTypes = [
      { type: 'interview', label: 'Interview', color: '#8b5cf6' },
      { type: 'deadline', label: 'Deadline', color: '#ef4444' },
      { type: 'followup', label: 'Follow-up', color: '#3b82f6' },
      { type: 'assessment', label: 'Assessment', color: '#eab308' },
      { type: 'general', label: 'General', color: '#9ca3af' }
    ];

    return (
      <div className={`flex flex-wrap gap-3 mt-4 p-3 rounded-md border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className={`text-sm font-medium mr-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Event Types:</div>
        {eventTypes.map(item => (
          <div key={item.type} className="flex items-center">
            <div style={{ backgroundColor: item.color }} className="w-3 h-3 rounded-full mr-1"></div>
            <span className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{item.label}</span>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className={isDarkMode ? 'dark:bg-gray-800 dark:border-gray-700' : 'bg-white border-gray-200'}>
        <CardContent className="p-0">
          {renderToolbar()}
          
          <div style={{ height: '70vh' }} className={isDarkMode ? 'dark-calendar' : ''}>
            <ReactCalendar
              localizer={localizer}
              events={formattedEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              views={['month', 'week', 'day', 'agenda']}
              view={selectedView}
              onView={(view) => setSelectedView(view)}
              selectable
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              eventPropGetter={eventStyleGetter}
              popup
              className={isDarkMode ? 'dark-mode-calendar' : ''}
            />
          </div>
        </CardContent>
      </Card>
      
      <ColorLegend />
      
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
        isDarkMode={isDarkMode}
      />
      
      {/* Add some custom styles for dark mode */}
      {isDarkMode && (
        <style jsx global>{`
          .dark-mode-calendar {
            background-color: #1f2937;
            color: white;
          }
          .dark-mode-calendar .rbc-header {
            background-color: #111827;
            color: white;
          }
          .dark-mode-calendar .rbc-month-view {
            border-color: #374151;
          }
          .dark-mode-calendar .rbc-day-bg {
            background-color: #1f2937;
          }
          .dark-mode-calendar .rbc-today {
            background-color: #374151;
          }
          .dark-mode-calendar .rbc-off-range-bg {
            background-color: #111827;
          }
          .dark-mode-calendar .rbc-time-view {
            background-color: #1f2937;
            border-color: #374151;
          }
          .dark-mode-calendar .rbc-time-header {
            background-color: #111827;
            border-color: #374151;
          }
          .dark-mode-calendar .rbc-time-content {
            border-color: #374151;
          }
          .dark-mode-calendar .rbc-time-slot {
            border-color: #374151;
          }
          .dark-mode-calendar .rbc-agenda-view {
            background-color: #1f2937;
            color: white;
          }
          .dark-mode-calendar .rbc-agenda-table {
            border-color: #374151;
          }
          .dark-mode-calendar .rbc-agenda-date-cell,
          .dark-mode-calendar .rbc-agenda-time-cell,
          .dark-mode-calendar .rbc-agenda-event-cell {
            border-color: #374151;
          }
        `}</style>
      )}
    </div>
  );
};

export default TUICalendarView;
