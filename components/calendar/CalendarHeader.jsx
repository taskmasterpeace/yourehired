import React from 'react';
import { CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Grid,
  List,
  Clock,
  BarChart as Timeline
} from 'lucide-react';

const CalendarHeader = ({ 
  viewMode, 
  setViewMode, 
  eventTypeFilter, 
  setEventTypeFilter,
  selectedDate,
  onCreateEvent,
  onNavigate
}) => {
  // Format the selected date based on view mode
  const formatHeaderDate = () => {
    const options = { 
      month: { month: 'long', year: 'numeric' },
      week: { month: 'short', day: 'numeric', year: 'numeric' },
      day: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
      agenda: { month: 'long', year: 'numeric' }
    };
    
    return selectedDate.toLocaleDateString('en-US', options[viewMode]);
  };
  
  // Navigation handlers
  const handlePrevious = () => {
    if (onNavigate) {
      const newDate = new Date(selectedDate);
      switch (viewMode) {
        case 'month':
          newDate.setMonth(newDate.getMonth() - 1);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() - 7);
          break;
        case 'day':
          newDate.setDate(newDate.getDate() - 1);
          break;
        default:
          newDate.setMonth(newDate.getMonth() - 1);
      }
      onNavigate(newDate);
    }
  };

  const handleNext = () => {
    if (onNavigate) {
      const newDate = new Date(selectedDate);
      switch (viewMode) {
        case 'month':
          newDate.setMonth(newDate.getMonth() + 1);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() + 7);
          break;
        case 'day':
          newDate.setDate(newDate.getDate() + 1);
          break;
        default:
          newDate.setMonth(newDate.getMonth() + 1);
      }
      onNavigate(newDate);
    }
  };

  const handleToday = () => {
    if (onNavigate) {
      onNavigate(new Date());
    }
  };
  
  return (
    <CardHeader className="flex flex-col space-y-3 pb-2">
      {/* Date display and navigation */}
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrevious}
            className="h-8 w-8"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <CardTitle className="flex items-center mx-1">
            <CalendarIcon className="mr-2 h-5 w-5 text-blue-500 hidden sm:inline" />
            <span className="text-blue-500 font-bold text-sm sm:text-base">{formatHeaderDate()}</span>
          </CardTitle>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNext}
            className="h-8 w-8"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleToday}
            className="ml-2 text-xs h-8"
          >
            Today
          </Button>
        </div>
        
        {/* Create Event Button - Always visible */}
        <Button onClick={onCreateEvent} size="sm" className="h-8">
          <Plus className="h-4 w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Add Event</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>
      
      {/* Controls row */}
      <div className="flex flex-wrap gap-2 justify-between items-center">
        {/* View Mode Selector */}
        <div className="flex rounded-md border">
          <Button 
            variant={viewMode === 'month' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setViewMode('month')}
            className={`rounded-none rounded-l-md ${viewMode === 'month' ? 'bg-green-500 hover:bg-green-600' : ''}`}
            title="Month View"
          >
            <Grid className={`h-4 w-4 ${viewMode === 'month' ? 'text-white' : ''}`} />
            <span className={`ml-1 hidden sm:inline ${viewMode === 'month' ? 'text-white' : ''}`}>Month</span>
          </Button>
          <Button 
            variant={viewMode === 'week' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setViewMode('week')}
            className="rounded-none"
            title="Week View"
          >
            <List className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Week</span>
          </Button>
          <Button 
            variant={viewMode === 'day' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setViewMode('day')}
            className="rounded-none"
            title="Day View"
          >
            <Clock className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Day</span>
          </Button>
          <Button 
            variant={viewMode === 'agenda' ? 'default' : 'ghost'} 
            size="sm"
            onClick={() => setViewMode('agenda')}
            className="rounded-none rounded-r-md"
            title="Agenda View"
          >
            <Timeline className="h-4 w-4" />
            <span className="ml-1 hidden sm:inline">Agenda</span>
          </Button>
        </div>
        
        {/* Event Type Filter */}
        <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
          <SelectTrigger className="w-[120px] sm:w-[150px] h-8">
            <SelectValue placeholder="Filter" />
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
  );
};

export default CalendarHeader;
