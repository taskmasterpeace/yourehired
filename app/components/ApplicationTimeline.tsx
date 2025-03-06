'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Opportunity } from '@/app/lib/definitions';

interface TimelineEvent {
  date: Date;
  type: 'status_change' | 'interview' | 'note' | 'creation' | 'other';
  description: string;
  icon?: string;
}

export default function ApplicationTimeline({ opportunity }: { opportunity: Opportunity }) {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    // Create initial timeline events from opportunity data
    const timelineEvents: TimelineEvent[] = [];
    
    // Add creation event
    timelineEvents.push({
      date: new Date(opportunity.created_at),
      type: 'creation',
      description: 'Application created',
      icon: '📝'
    });

    // Add status changes if available
    if (opportunity.status_history && opportunity.status_history.length > 0) {
      opportunity.status_history.forEach(statusChange => {
        timelineEvents.push({
          date: new Date(statusChange.date),
          type: 'status_change',
          description: `Status changed to: ${statusChange.status}`,
          icon: '🔄'
        });
      });
    }

    // Add interviews if available
    if (opportunity.interviews && opportunity.interviews.length > 0) {
      opportunity.interviews.forEach(interview => {
        timelineEvents.push({
          date: new Date(interview.date),
          type: 'interview',
          description: `Interview: ${interview.type || 'Scheduled'}`,
          icon: '👥'
        });
      });
    }

    // Sort events by date (newest first)
    timelineEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    setEvents(timelineEvents);
  }, [opportunity]);

  if (events.length === 0) {
    return <div className="text-center py-6 text-gray-500">No timeline events available</div>;
  }

  return (
    <div className="mt-8 mb-12">
      <h2 className="text-xl font-semibold mb-4">Application Timeline</h2>
      <div className="relative border-l-2 border-blue-300 ml-4">
        {events.map((event, index) => (
          <div key={index} className="mb-6 ml-6">
            <div className="absolute -left-3 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {event.icon || '•'}
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <time className="text-xs font-semibold text-gray-500">
                {format(event.date, 'MMM d, yyyy • h:mm a')}
              </time>
              <p className="mt-1 text-gray-800">{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
