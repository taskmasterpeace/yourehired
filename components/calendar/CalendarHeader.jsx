import React from 'react';
import { CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Calendar as CalendarIcon } from 'lucide-react';
import { Plus } from 'lucide-react';
import { Grid } from 'lucide-react';
import { List } from 'lucide-react';
import { Clock } from 'lucide-react';
import { Timeline } from 'lucide-react';

const CalendarHeader = ({ 
  viewMode, 
  setViewMode, 
  eventTypeFilter, 
  setEventTypeFilter,
  selectedDate,
  onCreateEvent
}) => {
  // Format the selected date based on view mode
  const formatHeaderDate = () => {
    const options = { 
      month: { month: 'long', year: 'numeric' },
      week: { month: 'short', day: 'numeric', year: 'numeric' },
      day: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
      timeline: { month: 'long', year: 'numeric' }
    };
    
    return selectedDate.toLocaleDateString('en-US', options[viewMode]);
  };
  
  return (
    <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-2">
      <div>
        <CardTitle className="flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5" />
          <span>{formatHeaderDate()}</span>
        </CardTitle>
      </div>
      
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2 mt-2 sm:mt-0">
        {/* View Mode Selector */}
        <div className="flex rounded-md border">
          <Button 
            variant={viewMode === 'month' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setViewMode('month')}
            className="rounded-none rounded-l-md"
            title="Month View"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'week' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setViewMode('week')}
            className="rounded-none"
            title="Week View"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'day' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setViewMode('day')}
            className="rounded-none"
            title="Day View"
          >
            <Clock className="h-4 w-4" />
          </Button>
          <Button 
            variant={viewMode === 'timeline' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setViewMode('timeline')}
            className="rounded-none rounded-r-md"
            title="Timeline View"
          >
            <Timeline className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Event Type Filter */}
        <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
          <SelectTrigger className="w-[150px]">
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
        
        {/* Create Event Button */}
        <Button onClick={onCreateEvent} size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add Event
        </Button>
      </div>
    </CardHeader>
  );
};

export default CalendarHeader;
