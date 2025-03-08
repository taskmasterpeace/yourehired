import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Calendar } from "../ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";

interface CalendarTabProps {
  events: any[];
  opportunities: any[];
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  eventTypeFilter: string;
  setEventTypeFilter: (filter: string) => void;
  isDarkMode: boolean;
  user: any;
  dispatch: any;
}

export function CalendarTab({
  events,
  opportunities,
  date,
  setDate,
  eventTypeFilter,
  setEventTypeFilter,
  isDarkMode,
  user,
  dispatch
}: CalendarTabProps) {
  // Helper function to get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events
      .filter(event => eventTypeFilter === 'all' || event.type === eventTypeFilter)
      .filter(event => {
        const eventDate = new Date(event.date);
        return day.getDate() === eventDate.getDate() && 
               day.getMonth() === eventDate.getMonth() && 
               day.getFullYear() === eventDate.getFullYear();
      });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className={`md:col-span-2 ${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Calendar</CardTitle>
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="interview">Interviews</SelectItem>
                <SelectItem value="deadline">Deadlines</SelectItem>
                <SelectItem value="followup">Follow-ups</SelectItem>
                <SelectItem value="assessment">Assessments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border"
            modifiers={{
              event: (date) => getEventsForDay(date).length > 0
            }}
            modifiersStyles={{
              event: { fontWeight: 'bold', textDecoration: 'underline' }
            }}
          />
        </CardContent>
      </Card>
      
      <Card className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : ''}`}>
        <CardHeader>
          <CardTitle>
            {date ? date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Events'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {date && getEventsForDay(date).length > 0 ? (
            <div className="space-y-4">
              {getEventsForDay(date).map((event, index) => (
                <div key={index} className="border-b pb-3 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{event.title}</h3>
                      <p className="text-sm text-gray-500">{event.date}</p>
                    </div>
                    <Badge variant="outline" className={
                      event.type === 'interview' ? 'bg-purple-100 text-purple-800' :
                      event.type === 'deadline' ? 'bg-red-100 text-red-800' :
                      event.type === 'followup' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }>
                      {event.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center py-6 text-gray-500">
              {date ? 'No events for this day' : 'Select a date to view events'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
