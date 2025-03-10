import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Plus, Clock } from 'lucide-react';
import AddToCalendarButton from './AddToCalendarButton';

const EventList = ({ date, events, onEventClick, onCreateEvent }) => {
  // Get events for the selected date
  const getEventsForDay = () => {
    if (!date) return [];
    
    return events.filter(event => {
      const eventDate = new Date(event.date || event.startDate);
      return date.getDate() === eventDate.getDate() && 
             date.getMonth() === eventDate.getMonth() && 
             date.getFullYear() === eventDate.getFullYear();
    });
  };
  
  // Format time for display
  const formatEventTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };
  
  // Get badge variant based on event type
  const getEventBadgeVariant = (eventType) => {
    if (!eventType || typeof eventType !== 'string') {
      return 'gray';
    }
    
    const typeVariantMap = {
      interview: 'purple',
      deadline: 'red',
      followup: 'blue',
      assessment: 'yellow',
      general: 'gray'
    };
    
    return typeVariantMap[eventType.toLowerCase()] || 'gray';
  };
  
  const dayEvents = getEventsForDay();
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>
            {date ? date.toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            }) : 'Events'}
          </CardTitle>
          
          <Button variant="ghost" size="sm" onClick={onCreateEvent}>
            <Plus className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {dayEvents.length > 0 ? (
          <div className="space-y-4">
            {dayEvents.map((event, index) => (
              <div 
                key={index} 
                className="border-b pb-3 last:border-0 cursor-pointer hover:bg-gray-50 p-2 rounded-md transition-colors"
                onClick={() => onEventClick(event)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{event.title}</h3>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatEventTime(event.date || event.startDate)}</span>
                    </div>
                    {event.location && (
                      <p className="text-sm text-gray-500 mt-1">{event.location}</p>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <Badge className={`bg-${getEventBadgeVariant(event.type)}-100 text-${getEventBadgeVariant(event.type)}-800`}>
                      {event.type || 'Event'}
                    </Badge>
                    
                    <AddToCalendarButton event={event} variant="ghost" size="sm" compact={true} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            {date ? 'No events for this day' : 'Select a date to view events'}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventList;
