import React, { useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { 
  Button,
} from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { addHours } from 'date-fns';
import { Trash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Helper functions for date formatting
const formatDateToYYYYMMDD = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const formatTimeToHHMM = (date) => {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const FullCalendarView = ({ events, opportunities, user, dispatch, isDarkMode }) => {
  const { toast } = useToast();
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState({
    id: null,
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    type: 'interview',
    opportunityId: '',
    location: '',
    description: ''
  });
  const calendarRef = useRef(null);

  // Format events for FullCalendar
  const formattedEvents = events.map(event => {
    // Parse the date and create start and end times
    const eventDate = event.date;
    let startTime = event.startTime || '09:00';
    let endTime = event.endTime || '10:00';

    // Create full start and end datetime strings
    const start = `${eventDate}T${startTime}`;
    const end = `${eventDate}T${endTime}`;
    
    console.log(`Formatting event: ${event.id}, title: ${event.title}, date: ${eventDate}`);

    return {
      id: event.id,
      title: event.title,
      start,
      end,
      extendedProps: {
        type: event.type,
        opportunityId: event.opportunityId,
        location: event.location,
        description: event.description
      },
      backgroundColor: getEventColor(event.type)
    };
  });

  // Helper function to get the event color based on type
  function getEventColor(type) {
    switch (type) {
      case 'interview':
        return '#4CAF50'; // Green
      case 'deadline':
        return '#F44336'; // Red
      case 'followup':
        return '#2196F3'; // Blue
      case 'assessment':
        return '#FF9800'; // Orange
      default:
        return '#9E9E9E'; // Grey
    }
  }

  // Handle when a date is clicked (to create new event)
  const handleDateClick = (arg) => {
    const date = formatDateToYYYYMMDD(arg.date);
    const startTime = formatTimeToHHMM(arg.date);
    const endTime = formatTimeToHHMM(addHours(arg.date, 1));

    setCurrentEvent({
      id: null,
      title: '',
      date,
      startTime,
      endTime,
      type: 'interview',
      opportunityId: '',
      location: '',
      description: ''
    });
    setIsEventModalOpen(true);
  };

  // Handle when an event is clicked (to edit)
  const handleEventClick = (arg) => {
    const event = arg.event;
    const { type, opportunityId, location, description } = event.extendedProps;

    // Format dates for form fields
    const date = formatDateToYYYYMMDD(event.start);
    const startTime = formatTimeToHHMM(event.start);
    const endTime = event.end ? formatTimeToHHMM(event.end) : formatTimeToHHMM(addHours(event.start, 1));

    setCurrentEvent({
      id: event.id,
      title: event.title,
      date,
      startTime,
      endTime,
      type: type || 'interview',
      opportunityId: opportunityId || '',
      location: location || '',
      description: description || ''
    });
    setIsEventModalOpen(true);
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setCurrentEvent({
      ...currentEvent,
      [field]: value
    });
  };

  // Handle save event
  const handleSaveEvent = () => {
    if (!currentEvent.title.trim()) {
      toast({
        title: "Error",
        description: "Event title is required",
        variant: "destructive",
      });
      return;
    }

    // Create a properly formatted event object for the store
    const eventToSave = {
      id: currentEvent.id || Date.now(),
      title: currentEvent.title,
      date: currentEvent.date,
      startTime: currentEvent.startTime,
      endTime: currentEvent.endTime,
      type: currentEvent.type,
      location: currentEvent.location,
      description: currentEvent.description
    };

    // Associate with opportunity if selected
    if (currentEvent.opportunityId) {
      eventToSave.opportunityId = parseInt(currentEvent.opportunityId, 10);
    }

    if (currentEvent.id) {
      // Update existing event
      dispatch({
        type: 'UPDATE_EVENT',
        payload: {
          id: currentEvent.id,
          updates: eventToSave
        }
      });
      toast({
        title: "Event updated",
        description: "Your event has been updated successfully.",
      });
    } else {
      // Add new event
      dispatch({
        type: 'ADD_EVENT',
        payload: eventToSave
      });
      toast({
        title: "Event created",
        description: "Your event has been created successfully.",
      });
    }

    // Close the modal and reset current event
    setIsEventModalOpen(false);
    setCurrentEvent({
      id: null,
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      type: 'interview',
      opportunityId: '',
      location: '',
      description: ''
    });
  };

  // Handle delete event
  const handleDeleteEvent = () => {
    if (!currentEvent.id) {
      toast({
        title: "Error",
        description: "Cannot delete event with no ID",
        variant: "destructive",
      });
      return;
    }
    
    console.log(`Deleting event with ID: ${currentEvent.id}`);
    
    // Ensure ID is properly formatted (string or number depending on your needs)
    const eventId = currentEvent.id.toString ? currentEvent.id.toString() : currentEvent.id;
    
    dispatch({
      type: 'DELETE_EVENT',
      payload: eventId
    });

    toast({
      title: "Event deleted",
      description: "Your event has been deleted successfully.",
    });
    setIsDeleteDialogOpen(false);
    setIsEventModalOpen(false);
    setCurrentEvent({
      id: null,
      title: '',
      date: '',
      startTime: '',
      endTime: '',
      type: 'interview',
      opportunityId: '',
      location: '',
      description: ''
    });
  };

  return (
    <div className="calendar-container space-y-4">
      <div className="h-[calc(100vh-200px)]">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={formattedEvents}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          height="100%"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: 'short'
          }}
          views={{
            dayGridMonth: {
              dayHeaderFormat: { weekday: 'short', day: 'numeric', omitCommas: true }
            },
            timeGridWeek: {
              dayHeaderFormat: { weekday: 'short', month: 'numeric', day: 'numeric', omitCommas: true }
            },
            timeGridDay: {
              dayHeaderFormat: { weekday: 'long', month: 'long', day: 'numeric' }
            }
          }}
          allDaySlot={false}
          editable={true}
          selectable={true}
          className={isDarkMode ? 'fc-dark' : ''}
        />
      </div>

      {/* Event Creation/Editing Modal */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{currentEvent.id ? 'Edit Event' : 'Create New Event'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={currentEvent.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={currentEvent.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={currentEvent.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={currentEvent.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Event Type</Label>
                <Select
                  value={currentEvent.type}
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="opportunityId">Associated Opportunity</Label>
                <Select
                  value={currentEvent.opportunityId || "none"}
                  onValueChange={(value) => handleInputChange('opportunityId', value === 'none' ? '' : value)}
                >
                  <SelectTrigger id="opportunityId">
                    <SelectValue placeholder="Select opportunity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {opportunities.map(opp => (
                      <SelectItem key={opp.id} value={opp.id}>
                        {opp.company} - {opp.position}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={currentEvent.location || ''}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Office, Zoom, Phone Call"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentEvent.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                placeholder="Add notes about this event"
              />
            </div>
          </div>
          
          <DialogFooter className="flex justify-between">
            <div className="flex gap-2">
              {currentEvent.id && (
                <Button variant="destructive" onClick={() => setIsDeleteDialogOpen(true)}>
                  <Trash className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEventModalOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleSaveEvent}>
                {currentEvent.id ? 'Update' : 'Create'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the event "{currentEvent.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteEvent}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FullCalendarView; 