'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Opportunity } from '@/context/types';

interface TimelineEvent {
  date: Date;
  type: 'status_change' | 'interview' | 'note' | 'creation' | 'other';
  description: string;
  icon?: string;
}

export default function ApplicationTimeline({ opportunity }: { opportunity: Opportunity; isDarkMode?: boolean }) {
  const isDarkMode = document.documentElement.classList.contains('dark');
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    // Create initial timeline events from opportunity data
    const timelineEvents: TimelineEvent[] = [];
    
    // Add creation event (using appliedDate as fallback for creation date)
    timelineEvents.push({
      date: new Date(opportunity.appliedDate || new Date()),
      type: 'creation',
      description: opportunity.status === 'Applied' ? 'Application submitted' : 'Opportunity created',
      icon: '📝'
    });

    // Add status changes if available (simulated from current status)
    // In a real implementation, you would use opportunity.status_history
    if (opportunity.status && opportunity.status !== 'Interested' && opportunity.status !== 'Bookmarked') {
      // Add a status change event a few days after creation
      const statusDate = new Date(opportunity.appliedDate || new Date());
      statusDate.setDate(statusDate.getDate() + 3);
      
      timelineEvents.push({
        date: statusDate,
        type: 'status_change',
        description: `Status changed to: ${opportunity.status}`,
        icon: '🔄'
      });
    }

    // Add interviews if available (simulated based on status)
    // In a real implementation, you would use opportunity.interviews
    if (['Screening', 'Technical Assessment', 'First Interview', 'Second Interview', 'Final Interview'].includes(opportunity.status)) {
      // Add an interview event a week after creation
      const interviewDate = new Date(opportunity.appliedDate || new Date());
      interviewDate.setDate(interviewDate.getDate() + 7);
      
      const interviewType = opportunity.status === 'Screening' ? 'Phone Screening' :
                           opportunity.status === 'Technical Assessment' ? 'Technical Assessment' :
                           opportunity.status === 'First Interview' ? 'First Round' :
                           opportunity.status === 'Second Interview' ? 'Second Round' : 'Final Round';
      
      timelineEvents.push({
        date: interviewDate,
        type: 'interview',
        description: `Interview: ${interviewType}`,
        icon: '👥'
      });
    }

    // Add notes event if notes exist
    if (opportunity.notes && opportunity.notes.trim() !== '') {
      const notesDate = new Date(opportunity.appliedDate || new Date());
      notesDate.setDate(notesDate.getDate() + 1);
      
      timelineEvents.push({
        date: notesDate,
        type: 'note',
        description: 'Notes added',
        icon: '📌'
      });
    }

    // Sort events by date (newest first)
    timelineEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    setEvents(timelineEvents);
  }, [opportunity]);

  if (events.length === 0) {
    return <div className={`text-center py-6 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>No timeline events available</div>;
  }

  return (
    <div className="mb-4">
      <h2 className={`text-xl font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : ''}`}>Application Timeline</h2>
      <div className="relative border-l-2 border-blue-300 ml-4">
        {events.map((event, index) => (
          <div key={index} className="mb-6 ml-6">
            <div className="absolute -left-3 mt-1.5 h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white">
              {event.icon || '•'}
            </div>
            <div className={`${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-200'} p-4 rounded-lg shadow-sm border`}>
              <time className={`text-xs font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                {format(event.date, 'MMM d, yyyy • h:mm a')}
              </time>
              <p className={`mt-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>{event.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
