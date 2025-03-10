import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import CalendarHeader from './CalendarHeader';
import EventModal from './EventModal';
import { Card, CardContent } from "../ui/card";
import { useToast } from "../ui/use-toast";
import { getEventColor } from './calendarUtils';

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

const BigCalendarView = ({ 
  events = [], 
  opportunities = [], 
  user,
  dispatch
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('month'); // month, week, day, agenda
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
    return true;
  });
  
  // Filter opportunities to exclude archived ones
  const filteredOpportunities = opportunities.filter(opp => 
    opp && opp.status !== 'archived'
  );
  
  // Format events for react-big-calendar
  const formattedEvents = filteredEvents.map(event => {
    const startDate = new Date(event.startDate || event.date || new Date());
    const endDate = new Date(event.endDate || new Date(startDate.getTime() + 60 * 60 * 1000));
    
    return {
      id: event.id,
      title: event.title,
      start: startDate,
      end: endDate,
      allDay: false,
      resource: event // Store the original event data
    };
  });
  
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
      <Card>
        <CardContent className="p-0">
          <CalendarHeader 
            viewMode={viewMode}
            setViewMode={setViewMode}
            eventTypeFilter={eventTypeFilter}
            setEventTypeFilter={setEventTypeFilter}
            selectedDate={selectedDate}
            onCreateEvent={() => handleSelectSlot({ start: selectedDate })}
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
            />
          </div>
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
