import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isToday } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../../styles/calendar-dark-mode.css';
import CalendarHeader from './CalendarHeader';
import EventModal from './EventModal';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useToast } from "../ui/use-toast";
import { getEventColor } from './calendarUtils';
import { useNotifications } from '../../context/NotificationContext';
import { useActivity } from '../../context/ActivityContext';
import RecentActivity from '../common/RecentActivity';

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
      <div className="text-sm font-medium mr-2 dark:text-gray-200">Event Types:</div>
      {eventTypes.map(item => (
        <div key={item.type} className="flex items-center">
          <div className={`w-3 h-3 rounded-full ${item.color} mr-1`}></div>
          <span className="text-sm dark:text-gray-300">{item.label}</span>
        </div>
      ))}
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
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day, agenda
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const { toast } = useToast();
  
  // Import the notification context with fallbacks
  const notificationContext = useNotifications();
  
  // Use context if available, otherwise use props or defaults
  const notificationSettings = notificationContext?.settings || notificationPreferences || {
    enabled: true,
    inAppNotifications: true
  };
  
  // Check for upcoming events when the component mounts
  useEffect(() => {
    // Use the notification context to check for upcoming events
    const checkEvents = () => {
      // Find events that are starting soon
      const now = new Date();
      const upcomingEvents = events.filter(event => {
        const eventStart = new Date(event.startDate || event.date);
        const diffMs = eventStart - now;
        const diffMins = Math.floor(diffMs / 60000);
        // Events starting in the next 30 minutes
        return diffMins > 0 && diffMins <= 30;
      });
      
      // Show notifications for upcoming events
      if (upcomingEvents.length > 0 && notificationSettings?.enabled) {
        upcomingEvents.forEach(event => {
          toast({
            title: `Hey! Upcoming: ${event.title}`,
            description: `This event is starting soon. - Hey You're Hired! v0.41`,
            duration: 5000,
          });
        });
      }
    };
    
    checkEvents();
  }, [events, notificationSettings, toast]);
  
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
      // Debug the event to see what's wrong
      console.log("Processing event for calendar:", event);
      
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
      
      // Log the formatted event for debugging
      console.log("Formatted event:", {
        id: event.id,
        title: event.title,
        start: startDate,
        end: endDate
      });
      
      return {
        id: event.id || `temp-${Date.now()}-${Math.random()}`,
        title: event.title || "Untitled Event",
        start: startDate,
        end: endDate,
        allDay: false,
        resource: event // Store the original event data
      };
    } catch (error) {
      console.error("Error formatting event:", error, event);
      return null;
    }
  }).filter(Boolean); // Remove any null events
  
  // Handle event selection
  const handleSelectEvent = (event) => {
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
  
  // Get activity context with fallbacks
  const activityContext = useActivity() || {};
  const addActivity = activityContext.addActivity || ((activityData) => {
    console.warn("Activity context not available, activity logging disabled", activityData);
  });
  const getAllActivities = activityContext.getAllActivities || (() => []);
  const allActivities = getAllActivities();
  
  // Handle saving an event (create or update)
  const handleSaveEvent = (eventData) => {
    const isNewEvent = !eventData.id;
    
    console.log("Saving event:", eventData);
    
    // Here you would dispatch to your state management
    if (dispatch) {
      dispatch({ 
        type: isNewEvent ? 'ADD_EVENT' : 'UPDATE_EVENT', 
        payload: eventData 
      });
    } else {
      console.warn("No dispatch function provided to BigCalendarView");
    }
    
    // Record the activity
    addActivity({
      type: isNewEvent ? 'event_created' : 'event_updated',
      description: `${isNewEvent ? 'Created' : 'Updated'} event: ${eventData.title}`,
      opportunityId: eventData.opportunityId || null,
      opportunityName: eventData.opportunity?.company 
        ? `${eventData.opportunity.company} - ${eventData.opportunity.position}` 
        : null,
      eventId: eventData.id,
      user: user // Assuming you have the user object from props
    });
    
    // Show toast notification
    toast({
      title: isNewEvent ? "Hey! Event Created" : "Hey! Event Updated",
      description: `${eventData.title} has been ${isNewEvent ? 'added to' : 'updated in'} your calendar. - Hey You're Hired! v0.41`,
      duration: 3000,
    });
    
    setIsEventModalOpen(false);
    setCurrentEvent(null);
  };
  
  // Custom event styling
  const eventStyleGetter = (event) => {
    const backgroundColor = getEventColor(event.resource).split(' ')[0].replace('bg-', '');
    
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
        color: 'white',
        border: 'none'
      }
    };
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
            notificationPreferences={notificationSettings}
          />
          
          <div className="p-4" style={{ height: '70vh' }}>
            <Calendar
              localizer={localizer}
              events={formattedEvents}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              view={viewMode}
              onView={(view) => setViewMode(view)}
              date={selectedDate}
              onNavigate={(date) => setSelectedDate(date)}
              selectable
              onSelectEvent={handleSelectEvent}
              onSelectSlot={handleSelectSlot}
              eventPropGetter={eventStyleGetter}
              views={['month', 'week', 'day', 'agenda']}
              popup
              tooltipAccessor={(event) => event.title}
              components={{
                agenda: {
                  event: ({ event }) => (
                    <div className="p-1 cursor-pointer hover:bg-gray-100 rounded" onClick={() => handleSelectEvent(event)}>
                      <div className="font-medium">{event.title}</div>
                      <div className="text-xs text-gray-500">
                        {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                      </div>
                      {event.resource.location && (
                        <div className="text-xs text-gray-500">
                          Location: {event.resource.location}
                        </div>
                      )}
                    </div>
                  )
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
      
      <ColorLegend />
      
      <Card className="dark:bg-gray-800 dark:border-gray-700 mt-4">
        <CardHeader>
          <CardTitle className="text-lg">Hey! Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <RecentActivity 
            activities={allActivities} 
            limit={5} 
            showOpportunityInfo={true} 
          />
        </CardContent>
      </Card>
      
      <EventModal 
        isOpen={isEventModalOpen}
        onClose={() => {
          setIsEventModalOpen(false);
          setCurrentEvent(null);
        }}
        event={currentEvent}
        opportunities={filteredOpportunities}
        onSave={handleSaveEvent}
      />
    </div>
  );
};

export default BigCalendarView;
