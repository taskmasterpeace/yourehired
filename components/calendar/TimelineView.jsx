import React from 'react';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';

const TimelineView = ({ events, opportunities, selectedDate, onEventClick }) => {
  // Get the start of the current week
  const weekStart = startOfWeek(selectedDate);
  
  // Generate an array of dates for the week
  const weekDays = Array.from({ length: 14 }, (_, i) => addDays(weekStart, i));
  
  // Group events by opportunity
  const groupEventsByOpportunity = () => {
    const grouped = {};
    
    // First, add all opportunities as rows
    opportunities.forEach(opp => {
      grouped[opp.id] = {
        opportunity: opp,
        events: []
      };
    });
    
    // Then add events to their respective opportunities
    events.forEach(event => {
      if (event.opportunityId && grouped[event.opportunityId]) {
        grouped[event.opportunityId].events.push(event);
      } else if (event.opportunity && grouped[event.opportunity.id]) {
        grouped[event.opportunity.id].events.push(event);
      } else {
        // For events not associated with opportunities, create a special group
        if (!grouped['unassociated']) {
          grouped['unassociated'] = {
            opportunity: null,
            events: []
          };
        }
        grouped['unassociated'].events.push(event);
      }
    });
    
    return Object.values(grouped);
  };
  
  // Get color based on event type or opportunity status
  const getEventColor = (event) => {
    if (!event || !event.type) {
      return 'bg-gray-400';
    }
    
    const typeColorMap = {
      interview: 'bg-purple-500',
      deadline: 'bg-red-500',
      followup: 'bg-blue-500',
      assessment: 'bg-yellow-500',
      general: 'bg-gray-400'
    };
    
    return typeColorMap[event.type.toLowerCase()] || 'bg-gray-400';
  };
  
  // Check if an event falls on a specific day
  const isEventOnDay = (event, day) => {
    const eventDate = new Date(event.date || event.startDate);
    return isSameDay(eventDate, day);
  };
  
  const groupedEvents = groupEventsByOpportunity();
  
  return (
    <div className="timeline-view overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Timeline header */}
        <div className="grid grid-cols-[200px_repeat(14,1fr)] border-b">
          <div className="p-2 font-medium">Opportunity</div>
          {weekDays.map((day, i) => (
            <div 
              key={i} 
              className={`p-2 text-center text-sm ${
                isSameDay(day, selectedDate) ? 'bg-blue-50 font-medium' : ''
              }`}
            >
              <div>{format(day,  'EEE')}</div>
              <div>{format(day, 'd')}</div>
            </div>
          ))}
        </div>
        
        {/* Timeline rows */}
        {groupedEvents.map((group, groupIndex) => (
          <div 
            key={groupIndex} 
            className="grid grid-cols-[200px_repeat(14,1fr)] border-b hover:bg-gray-50"
          >
            {/* Opportunity column */}
            <div className="p-2 border-r">
              {group.opportunity ? (
                <div>
                  <div className="font-medium">{group.opportunity.company}</div>
                  <div className="text-sm text-gray-500">{group.opportunity.position}</div>
                </div>
              ) : (
                <div className="font-medium text-gray-500">Other Events</div>
              )}
            </div>
            
            {/* Day columns */}
            {weekDays.map((day, dayIndex) => (
              <div key={dayIndex} className="p-1 relative min-h-[60px]">
                {group.events
                  .filter(event => isEventOnDay(event, day))
                  .map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className={`${getEventColor(event)} text-white rounded p-1 text-xs mb-1 cursor-pointer`}
                      onClick={() => onEventClick(event)}
                    >
                      {event.title}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineView;
