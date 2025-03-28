import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isToday } from 'date-fns';

// See LessonsLearned.md for implementation insights
import CalendarHeader from './CalendarHeader';
import EventModal from './EventModal';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "../ui/use-toast";
import { getEventColor } from './calendarUtils';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { Button } from "../ui/button";

// Setup the localizer for react-big-calendar
const locales = {
  'en-US': require('date-fns/locale/en-US')
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Color legend component for event types
const ColorLegend = () => {
  const eventTypes = [
    { type: 'interview', label: 'Interview', color: 'bg-purple-500' },
    { type: 'deadline', label: 'Deadline', color: 'bg-red-500' },
    { type: 'followup', label: 'Follow-up', color: 'bg-blue-500' },
    { type: 'assessment', label: 'Assessment', color: 'bg-yellow-500' },
    { type: 'general', label: 'General', color: 'bg-gray-400' },
    { type: 'offer', label: 'Offer', color: 'bg-green-500' },
    { type: 'rejected', label: 'Rejected', color: 'bg-red-500' },
    { type: 'withdrawn', label: 'Withdrawn', color: 'bg-gray-600' },
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

// Custom event component for mobile
const MobileEventComponent = ({ event, onClick }) => {
  return (
    <div 
      className="text-xs p-1 overflow-hidden text-ellipsis whitespace-nowrap"
      onClick={onClick}
    >
      {event.title}
    </div>
  );
};

const BigCalendarView = ({ 
  events = [], 
  opportunities = [], 
  user,
  dispatch,
  notificationPreferences = {},
  onUpdateNotificationPreferences
}) => {
  // Check if we're on mobile using the existing hook
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Debug log to track events in state
  useEffect(() => {
    console.log("Current events in state:", events);
  }, [events]);
  
  
  // Load saved view preferences from localStorage
  const loadSavedPreferences = () => {
    try {
      const savedView = localStorage.getItem('calendarViewMode');
      const savedFilter = localStorage.getItem('calendarEventFilter');
      const savedDateStr = localStorage.getItem('calendarSelectedDate');
      
      return {
        viewMode: savedView || (isMobile ? 'agenda' : 'month'),
        eventTypeFilter: savedFilter || 'all',
        selectedDate: savedDateStr ? new Date(savedDateStr) : new Date()
      };
    } catch (error) {
      console.error("Error loading calendar preferences:", error);
      return {
        viewMode: isMobile ? 'agenda' : 'month',
        eventTypeFilter: 'all',
        selectedDate: new Date()
      };
    }
  };
  
  const { viewMode: initialView, eventTypeFilter: initialFilter, selectedDate: initialDate } = loadSavedPreferences();
  
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [viewMode, setViewMode] = useState(initialView);
  const [eventTypeFilter, setEventTypeFilter] = useState(initialFilter);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  
  // Save preferences when they change
  useEffect(() => {
    try {
      localStorage.setItem('calendarViewMode', viewMode);
      localStorage.setItem('calendarEventFilter', eventTypeFilter);
      localStorage.setItem('calendarSelectedDate', selectedDate.toISOString());
    } catch (error) {
      console.error("Error saving calendar preferences:", error);
    }
  }, [viewMode, eventTypeFilter, selectedDate]);
  
  // Adjust view for mobile devices
  useEffect(() => {
    if (isMobile && (viewMode === 'month' || viewMode === 'week')) {
      setViewMode('agenda');
    }
  }, [isMobile, viewMode]);
  
  
  // Filter events based on selected filters
  const filteredEvents = events.filter(event => {
    // Filter by event type if not 'all'
    if (eventTypeFilter !== 'all' && event.type !== eventTypeFilter) {
      return false;
    }
    return true;
  });
  
  // Filter opportunities to exclude archived ones
  const filteredOpportunities = opportunities.filter(opp => 
    opp && opp.status !== 'archived'
  );
  
  // Format events for react-big-calendar
  const formattedEvents = filteredEvents.map(event => {
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
      
      return {
        id: event.id || `temp-${Date.now()}-${Math.random()}`,
        title: event.title || "Untitled Event",
        start: startDate,
        end: endDate,
        allDay: event.allDay || false,
        resource: event // Store the original event data
      };
    } catch (error) {
      console.error("Error formatting event:", error, event);
      return null;
    }
  }).filter(Boolean); // Remove any null events
  
  // Handle event selection
  const handleSelectEvent = (event) => {
    console.log('Selected event:', event);
    console.log('Event resource:', event.resource);
    setCurrentEvent(event.resource);
    setIsEventModalOpen(true);
  };
  
  // Handle slot selection (creating a new event)
  const handleSelectSlot = ({ start }) => {
    setCurrentEvent({
      date: start,
      type: 'general',
      title: '',
      description: ''
    });
    setIsEventModalOpen(true);
  };
  
  // Handle saving an event (create or update)
  const handleSaveEvent = (eventData) => {
    const isNewEvent = !eventData.id;
    
    try {
      // Ensure opportunityId is a number if provided
      let finalEventData = { ...eventData };
      
      if (finalEventData.opportunityId) {
        // Convert opportunityId to number if it's a string
        finalEventData.opportunityId = typeof finalEventData.opportunityId === 'string' ? 
          parseInt(finalEventData.opportunityId, 10) : finalEventData.opportunityId;
      }

      // Here you would dispatch to your state management
      if (dispatch) {
        dispatch({ 
          type: isNewEvent ? 'ADD_EVENT' : 'UPDATE_EVENT', 
          payload: isNewEvent ? finalEventData : { id: finalEventData.id, updates: finalEventData } 
        });
        
        // Show toast notification with more details
        toast({
          title: isNewEvent ? "Event Created Successfully" : "Event Updated Successfully",
          description: `"${eventData.title}" has been ${isNewEvent ? 'added to' : 'updated in'} your calendar.`,
          variant: "success",
          duration: 3000,
        });
      } else {
        console.warn("No dispatch function provided to BigCalendarView");
        
        // Show error toast
        toast({
          title: "Error Saving Event",
          description: "There was a problem saving the event. Please try again.",
          variant: "destructive",
          duration: 3000,
        });
      }
      
      setIsEventModalOpen(false);
      setCurrentEvent(null);
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Error Saving Event",
        description: "There was a problem saving the event: " + error.message,
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  // Handle deleting an event
  const handleDeleteEvent = (eventId) => {
    console.log("Delete request received in BigCalendarView:", eventId);
    
    if (!dispatch) {
      console.error("No dispatch function available");
      toast({
        title: "Error Deleting Event",
        description: "There was a problem with the application state.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    try {
      // Convert to number if it's a string
      let idToDelete = eventId;
      
      if (typeof idToDelete === 'string' && !isNaN(parseInt(idToDelete, 10))) {
        idToDelete = parseInt(idToDelete, 10);
        console.log("Converted string ID to number:", idToDelete);
      }
      
      console.log("Final ID to delete:", idToDelete);
      
      // Dispatch the delete action
      dispatch({
        type: 'DELETE_EVENT',
        payload: idToDelete
      });
      
      // Update the UI
      toast({
        title: "Event Deleted",
        description: "The event has been removed from your calendar.",
        variant: "success",
        duration: 3000,
      });
      
      // Clean up any open UI elements
      setIsEventModalOpen(false);
      setCurrentEvent(null);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error Deleting Event",
        description: error.message || "Could not delete the event. Please try again.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  // Handle date navigation
  const handleNavigate = useCallback((date) => {
    setSelectedDate(date);
  }, []);
  
  // Custom event styling
  const eventStyleGetter = (event) => {
    const colorClass = getEventColor(event.resource);
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
    
    return {
      style: {
        backgroundColor: colorMap[backgroundColor] || '#9ca3af',
        borderRadius: '4px',
        color: 'white', // Ensure text is visible on colored backgrounds
        border: 'none',
        fontSize: isMobile ? '0.75rem' : '0.875rem',
        padding: isMobile ? '2px' : '4px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
        fontWeight: '500' // Make text slightly bolder for better visibility
      }
    };
  };
  
  // Custom day cell wrapper for highlighting today
  const dayPropGetter = (date) => {
    if (isToday(date)) {
      return {
        style: {
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          borderTop: '2px solid #3b82f6'
        }
      };
    }
    return {};
  };
  
  // Define the available views
  const calendarViews = {
    month: true,
    week: true,
    day: true,
    agenda: true
  };
  
  // Debug function to log events
  const logEvents = () => {
    console.log("All events:", events);
    console.log("Event IDs:", events.map(e => e.id));
    toast({
      title: "Events Logged",
      description: `${events.length} events found. Check console.`,
      duration: 3000,
    });
  };
  
  return (
    <div className="grid grid-cols-1 gap-4">
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardContent className="p-0">
          <CalendarHeader 
            viewMode={viewMode}
            setViewMode={setViewMode}
            eventTypeFilter={eventTypeFilter}
            setEventTypeFilter={setEventTypeFilter}
            selectedDate={selectedDate}
            onCreateEvent={() => handleSelectSlot({ start: selectedDate })}
            onNavigate={handleNavigate}
          />
          
          {/* Debug button */}
          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logEvents}
              className="text-xs"
            >
              Debug: Log Events
            </Button>
          </div>
          
          <div className="p-2 sm:p-4" style={{ height: isMobile ? '60vh' : '70vh' }}>
            <Calendar
              localizer={localizer}
              events={formattedEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ 
                height: '100%',
                backgroundColor: 'transparent'
              }}
              className="calendar-container dark:text-gray-200"
              view={viewMode}
              views={calendarViews}
              onView={(view) => setViewMode(view)}
              date={selectedDate}
              onNavigate={handleNavigate}
              selectable
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              eventPropGetter={eventStyleGetter}
              dayPropGetter={dayPropGetter}
                popup
                tooltipAccessor={(event) => event.title}
                messages={{
                  showMore: (total) => `+${total} more`,
                  next: "Next",
                  previous: "Back",
                  today: "Today",
                  month: "Month",
                  week: "Week",
                  day: "Day",
                  agenda: "Agenda"
                }}
                components={{
                  agenda: {
                    event: ({ event }) => (
                      <div className="p-1 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded" onClick={() => handleSelectEvent(event)}>
                        <div className="font-medium text-gray-900 dark:text-white">{event.title}</div>
                        <div className="text-xs text-gray-600 dark:text-gray-300">
                          {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                        </div>
                        {event.resource.location && (
                          <div className="text-xs text-gray-600 dark:text-gray-300">
                            Location: {event.resource.location}
                          </div>
                        )}
                      </div>
                    )
                  },
                  event: isMobile ? (props) => (
                    <MobileEventComponent 
                      event={props.event} 
                      onClick={() => handleSelectEvent(props.event)}
                    />
                  ) : undefined
                }}
                // Mobile-specific props
                {...(isMobile ? {
                  step: 30,
                  timeslots: 2,
                  length: 30,
                  drilldownView: "day"
                } : {})}
              />
          </div>
        </CardContent>
      </Card>
      
      {!isMobile && <ColorLegend />}
      
      {console.log('Current event being passed to modal:', currentEvent)}
      <EventModal 
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setCurrentEvent(null);
        }}
        event={currentEvent}
        opportunities={filteredOpportunities}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
};

export default BigCalendarView;
