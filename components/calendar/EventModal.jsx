import React, { useState, useEffect } from 'react';
import EventReminderSettings from './EventReminderSettings';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "../ui/dialog";

console.log("LOADING COMPONENT: EventModal.jsx - VERSION 2");
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { 
  CalendarIcon, 
  Clock, 
  MapPin, 
  Briefcase, 
  Trash2, 
  Copy, 
  Save,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { format, addDays } from 'date-fns';
import AddToCalendarButton from './AddToCalendarButton';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

// Event templates for quick creation
const EVENT_TEMPLATES = [
  {
    id: 'phone-interview',
    name: 'Phone Interview',
    type: 'interview',
    title: 'Phone Interview',
    description: 'Initial phone screening interview.',
    duration: 30, // minutes
  },
  {
    id: 'technical-interview',
    name: 'Technical Interview',
    type: 'interview',
    title: 'Technical Interview',
    description: 'Technical skills assessment interview.',
    duration: 60,
  },
  {
    id: 'onsite-interview',
    name: 'Onsite Interview',
    type: 'interview',
    title: 'Onsite Interview',
    description: 'In-person interview at company office.',
    duration: 120,
  },
  {
    id: 'follow-up',
    name: 'Follow-up Reminder',
    type: 'followup',
    title: 'Send Follow-up Email',
    description: 'Send a thank you email or follow up on application status.',
    duration: 15,
  },
  {
    id: 'coding-assessment',
    name: 'Coding Assessment',
    type: 'assessment',
    title: 'Complete Coding Assessment',
    description: 'Complete the assigned coding challenge or technical assessment.',
    duration: 120,
  },
  {
    id: 'application-deadline',
    name: 'Application Deadline',
    type: 'deadline',
    title: 'Application Deadline',
    description: 'Last day to submit job application.',
    duration: 30,
  }
];

const EventModal = ({ isOpen, onClose, event, opportunities = [], onSave, onDelete }) => {
  // Add debugging to see what opportunities are available
  console.log("Available opportunities:", opportunities);
  
  // Add additional debugging for opportunities
  useEffect(() => {
    if (!Array.isArray(opportunities) || opportunities.length === 0) {
      console.warn('No opportunities passed to EventModal');
    } else {
      console.log(`EventModal received ${opportunities.length} opportunities`);
    }
  }, [opportunities]);

  const [eventData, setEventData] = useState({
    id: '',
    title: '',
    date: new Date(),
    startTime: '09:00',
    endTime: '10:00',
    type: 'general',
    location: '',
    description: '',
    opportunityId: '',
    reminder: {
      enabled: true,
      time: '30' // minutes before event
    }
  });
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  
  // Initialize form with event data when editing
  useEffect(() => {
    if (event) {
      const eventDate = new Date(event.date || event.startDate || new Date());
      
      setEventData({
        id: event.id || '',
        title: event.title || '',
        date: eventDate,
        startTime: format(eventDate, 'HH:mm'),
        endTime: event.endDate ? format(new Date(event.endDate), 'HH:mm') : format(new Date(eventDate.getTime() + 60 * 60 * 1000), 'HH:mm'),
        type: event.type || 'general',
        location: event.location || '',
        description: event.description || '',
        opportunityId: event.opportunityId || '',
        reminder: event.reminder || {
          enabled: true,
          time: '30'
        }
      });
    }
  }, [event]);
  
  // Handle form input changes
  const handleChange = (field, value) => {
    // If the field is opportunityId and the value is "none", set it to an empty string
    if (field === 'opportunityId' && value === 'none') {
      setEventData(prev => ({
        ...prev,
        [field]: ''
      }));
    } else {
      setEventData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create date objects for start and end times
    const startDate = new Date(eventData.date);
    const [startHours, startMinutes] = eventData.startTime.split(':');
    startDate.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10));
    
    const endDate = new Date(eventData.date);
    const [endHours, endMinutes] = eventData.endTime.split(':');
    endDate.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10));
    
    // Prepare the complete event object
    const completeEvent = {
      ...eventData,
      startDate,
      endDate
    };
    
    // If associated with an opportunity, add that data
    if (eventData.opportunityId) {
      const opportunity = opportunities.find(opp => opp.id === eventData.opportunityId);
      if (opportunity) {
        completeEvent.opportunity = opportunity;
      }
    }
    
    onSave(completeEvent);
  };

  // Handle delete event
  const handleDelete = () => {
    if (onDelete && eventData.id) {
      onDelete(eventData.id);
      setIsDeleteDialogOpen(false);
      onClose();
    }
  };

  // Handle duplicate event
  const handleDuplicate = () => {
    // Create a copy of the current event without the ID
    const duplicatedEvent = {
      ...eventData,
      id: '', // Remove ID to create a new event
      title: `${eventData.title} (Copy)`,
      date: addDays(new Date(eventData.date), 1) // Schedule for the next day
    };
    
    // Create date objects for start and end times
    const startDate = new Date(duplicatedEvent.date);
    const [startHours, startMinutes] = duplicatedEvent.startTime.split(':');
    startDate.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10));
    
    const endDate = new Date(duplicatedEvent.date);
    const [endHours, endMinutes] = duplicatedEvent.endTime.split(':');
    endDate.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10));
    
    // Prepare the complete event object
    const completeEvent = {
      ...duplicatedEvent,
      startDate,
      endDate
    };
    
    // If associated with an opportunity, add that data
    if (duplicatedEvent.opportunityId) {
      const opportunity = opportunities.find(opp => opp.id === duplicatedEvent.opportunityId);
      if (opportunity) {
        completeEvent.opportunity = opportunity;
      }
    }
    
    onSave(completeEvent);
  };

  // Apply template to current event
  const applyTemplate = (template) => {
    // Calculate end time based on duration
    const startTime = eventData.startTime;
    const [hours, minutes] = startTime.split(':').map(Number);
    
    const endTimeDate = new Date();
    endTimeDate.setHours(hours, minutes + template.duration);
    const endTime = format(endTimeDate, 'HH:mm');
    
    setEventData(prev => ({
      ...prev,
      title: template.title,
      type: template.type,
      description: template.description,
      endTime
    }));
    
    setIsTemplateMenuOpen(false);
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[550px] dark:text-gray-200 border shadow-lg backdrop-blur-none">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>
                {eventData.id ? 'Edit Event' : 'Create New Event'}
              </DialogTitle>
              {!eventData.id && (
                <DialogDescription>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => setIsTemplateMenuOpen(true)}
                  >
                    <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                    Use Template
                  </Button>
                </DialogDescription>
              )}
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Title */}
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title</Label>
                <Input 
                  id="title"
                  value={eventData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter event title"
                  required
                />
              </div>
              
              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {eventData.date ? format(eventData.date, 'PPP') : 'Select date'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={eventData.date}
                        onSelect={(date) => handleChange('date', date || new Date())}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="grid gap-2">
                  <Label>Time</Label>
                  <div className="flex items-center space-x-2 bg-yellow-200 p-2 rounded">
                    <div className="flex-1">
                      <Input 
                        type="time"
                        value={eventData.startTime}
                        onChange={(e) => handleChange('startTime', e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>
                    <span className="px-1">to</span>
                    <div className="flex-1">
                      <Input 
                        type="time"
                        value={eventData.endTime}
                        onChange={(e) => handleChange('endTime', e.target.value)}
                        required
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Event Type and Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Event Type</Label>
                  <Select 
                    value={eventData.type} 
                    onValueChange={(value) => handleChange('type', value)}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border dark:border-gray-700">
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="followup">Follow-up</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="flex">
                    <MapPin className="h-4 w-4 mr-2 mt-3 text-gray-400" />
                    <Input 
                      id="location"
                      value={eventData.location}
                      onChange={(e) => handleChange('location', e.target.value)}
                      placeholder="Add location (optional)"
                    />
                  </div>
                </div>
              </div>
              
              {/* Associated Opportunity */}
              <div className="grid gap-2">
                <Label htmlFor="opportunity">Associated Job Opportunity</Label>
                <div className="flex">
                  <Briefcase className="h-4 w-4 mr-2 mt-3 text-gray-400" />
                  <Select 
                    value={eventData.opportunityId || "none"} 
                    onValueChange={(value) => {
                      console.log("Selected opportunity:", value);
                      handleChange('opportunityId', value);
                    }}
                    defaultValue="none"
                  >
                    <SelectTrigger id="opportunity" className="flex-1">
                      <SelectValue placeholder="Link to job opportunity (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 border dark:border-gray-700">
                      <SelectItem value="none">None</SelectItem>
                      {Array.isArray(opportunities) && opportunities.length === 0 ? (
                        <SelectItem value="loading" disabled>Loading opportunities...</SelectItem>
                      ) : (
                        opportunities.map(opp => (
                          <SelectItem key={opp.id} value={opp.id}>
                            {opp.company} - {opp.position}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  value={eventData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Add details about this event"
                  rows={3}
                />
              </div>
              
              {/* Reminder Settings */}
              <div className="grid gap-2 mt-2">
                <Label className="text-base">Reminder</Label>
                <EventReminderSettings 
                  reminders={eventData.reminder}
                  onChange={(reminderSettings) => handleChange('reminder', reminderSettings)}
                />
              </div>
            </div>
            
            <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {/* Action buttons for existing events */}
              {eventData.id && (
                <div className="flex space-x-2 w-full sm:w-auto justify-start">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    className="flex items-center bg-red-600 hover:bg-red-700 text-white font-medium"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Event
                  </Button>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="icon"
                          onClick={handleDuplicate}
                          className="h-9 w-9"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Duplicate event</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <div 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <AddToCalendarButton 
                      event={{
                        title: eventData.title,
                        startDate: new Date(`${format(eventData.date, 'yyyy-MM-dd')}T${eventData.startTime}`),
                        endDate: new Date(`${format(eventData.date, 'yyyy-MM-dd')}T${eventData.endTime}`),
                        description: eventData.description,
                        location: eventData.location
                      }}
                      variant="outline"
                      size="sm"
                      compact={true}
                    />
                  </div>
                </div>
              )}
              
              {/* Add to calendar button for new events */}
              {!eventData.id && (
                <div className="w-full sm:w-auto">
                  <div 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <AddToCalendarButton 
                      event={{
                        title: eventData.title,
                        startDate: new Date(`${format(eventData.date, 'yyyy-MM-dd')}T${eventData.startTime}`),
                        endDate: new Date(`${format(eventData.date, 'yyyy-MM-dd')}T${eventData.endTime}`),
                        description: eventData.description,
                        location: eventData.location
                      }}
                      variant="outline"
                      size="sm"
                    />
                  </div>
                </div>
              )}
              
              {/* Save/Cancel buttons */}
              <div className="flex space-x-2 w-full sm:w-auto justify-end">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {eventData.id ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Update
                    </>
                  ) : 'Create Event'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Delete Event
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Template selection dialog */}
      <Dialog open={isTemplateMenuOpen} onOpenChange={setIsTemplateMenuOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Choose Event Template</DialogTitle>
            <DialogDescription>
              Select a template to quickly create a common event type
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {EVENT_TEMPLATES.map(template => (
              <Button
                key={template.id}
                variant="outline"
                className="justify-start h-auto py-3 px-4"
                onClick={() => applyTemplate(template)}
              >
                <div className="flex flex-col items-start text-left">
                  <span className="font-medium">{template.name}</span>
                  <span className="text-xs text-gray-500 mt-1">
                    {template.duration} min • {template.type}
                  </span>
                </div>
              </Button>
            ))}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateMenuOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EventModal;
