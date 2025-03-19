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

// See LessonsLearned.md for implementation insights
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
  Sparkles,
  Download,
  QrCode
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { generateICalString } from './calendarUtils.js';
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
  const [showQRCode, setShowQRCode] = useState(false);
  
  // Initialize form with event data when editing
  useEffect(() => {
    console.log('Event received in modal:', event);
    console.log('Event properties:', event ? Object.keys(event) : 'No event');
    console.log('Event ID:', event?.id);
    console.log('Event _id:', event?._id);
    console.log('Event resource:', event?.resource);
    
    if (event) {
      try {
        const eventDate = new Date(event.date || event.startDate || new Date());
        
        // Create a clean copy without circular references
        setEventData({
          id: event.id || event._id || '', // Check for both id and _id
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
        
        console.log('EventData after setting:', eventData);
        console.log('EventData.id after setting:', eventData.id);
      } catch (error) {
        console.error("Error processing event data:", error);
        // Set default values if there's an error
        setEventData({
          id: event.id || '',
          title: event.title || '',
          date: new Date(),
          startTime: '09:00',
          endTime: '10:00',
          type: 'general',
          location: '',
          description: '',
          opportunityId: '',
          reminder: {
            enabled: true,
            time: '30'
          }
        });
      }
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
    
    try {
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
          completeEvent.opportunity = {
            id: opportunity.id,
            company: opportunity.company,
            position: opportunity.position
          };
        }
      }
      
      onSave(completeEvent);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error saving the event. Please try again.");
    }
  };

  // Handle delete event
  const handleDelete = () => {
    try {
      console.log("Attempting to delete event with ID:", eventData.id);
      if (onDelete) {
        // Use event.id as a fallback if eventData.id is empty
        const idToDelete = eventData.id || event?.id;
        console.log("Using ID for deletion:", idToDelete);
        
        if (idToDelete) {
          onDelete(idToDelete);
          setIsDeleteDialogOpen(false);
          onClose();
        } else {
          console.error("No ID available for deletion");
          alert("Error: Cannot delete event without an ID");
        }
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("There was an error deleting the event. Please try again.");
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
  
  // Generate calendar data for QR code
  const getCalendarData = () => {
    try {
      // Create date objects for start and end times
      const startDate = new Date(eventData.date);
      const [startHours, startMinutes] = eventData.startTime.split(':');
      startDate.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10));
      
      const endDate = new Date(eventData.date);
      const [endHours, endMinutes] = eventData.endTime.split(':');
      endDate.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10));
      
      const eventForCalendar = {
        ...eventData,
        startDate,
        endDate
      };
      
      return generateICalString(eventForCalendar);
    } catch (error) {
      console.error("Error generating calendar data:", error);
      return "";
    }
  };
  
  // Handle download of .ics file
  const handleDownload = () => {
    const calendarData = getCalendarData();
    if (!calendarData) return;
    
    try {
      const blob = new Blob([calendarData], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${eventData.title || 'event'}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading calendar file:", error);
    }
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent 
          className="sm:max-w-[550px] bg-white dark:bg-gray-800 dark:text-gray-100 border dark:border-gray-700 shadow-lg overflow-y-auto max-h-[80vh]"
          style={{
            overflowY: 'auto',
            maxHeight: '80vh',
            width: '95vw', // Ensure it's not too wide on mobile
            margin: '0 auto' // Center it
          }}
        >
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
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Start Time</Label>
                    <Input 
                      type="time"
                      value={eventData.startTime}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>End Time</Label>
                    <Input 
                      type="time"
                      value={eventData.endTime}
                      onChange={(e) => handleChange('endTime', e.target.value)}
                      required
                    />
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
                    <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-100 border dark:border-gray-700 z-50">
                      <SelectItem value="interview" className="hover:bg-gray-100 dark:hover:bg-gray-700">Interview</SelectItem>
                      <SelectItem value="deadline" className="hover:bg-gray-100 dark:hover:bg-gray-700">Deadline</SelectItem>
                      <SelectItem value="followup" className="hover:bg-gray-100 dark:hover:bg-gray-700">Follow-up</SelectItem>
                      <SelectItem value="assessment" className="hover:bg-gray-100 dark:hover:bg-gray-700">Assessment</SelectItem>
                      <SelectItem value="general" className="hover:bg-gray-100 dark:hover:bg-gray-700">General</SelectItem>
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
                      
                      // If "none" is selected, clear the opportunityId
                      if (value === "none") {
                        handleChange('opportunityId', '');
                      } else {
                        handleChange('opportunityId', value);
                        
                        // Find the selected opportunity
                        const selectedOpportunity = opportunities.find(opp => opp.id === value);
                        if (selectedOpportunity) {
                          // Log the found opportunity
                          console.log("Found opportunity:", selectedOpportunity);
                        }
                      }
                    }}
                    defaultValue="none"
                  >
                    <SelectTrigger id="opportunity" className="flex-1">
                      <SelectValue placeholder="Link to job opportunity (optional)" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-100 border dark:border-gray-700 z-50 max-h-[300px] overflow-y-auto">
                      <SelectItem value="none" className="hover:bg-gray-100 dark:hover:bg-gray-700">None</SelectItem>
                      {Array.isArray(opportunities) && opportunities.length === 0 ? (
                        <SelectItem value="loading" disabled className="text-gray-500 dark:text-gray-400">Loading opportunities...</SelectItem>
                      ) : (
                        opportunities.map(opp => (
                          <SelectItem key={opp.id} value={opp.id} className="hover:bg-gray-100 dark:hover:bg-gray-700">
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
            
            {/* SUPER OBVIOUS DELETE BUTTON FOR EXISTING EVENTS */}
            {console.log('Rendering delete button, condition:', Boolean(event?.id || event?._id || (eventData.id && eventData.id !== '')))}
            <div className="mt-6 mb-4">
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-6 text-lg font-bold"
              >
                <Trash2 className="h-6 w-6 mr-3" />
                DELETE THIS EVENT
              </Button>
            </div>
            
            {/* Save/Cancel buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-1/2">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-1/2 bg-blue-600 hover:bg-blue-700">
                {eventData.id ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
            
            {/* Direct download button for existing events */}
            {(eventData.id || event?.id) && (
              <div className="mt-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Calendar (.ics) File
                </Button>
              </div>
            )}
            
            {/* QR CODE SECTION - Always visible now */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button 
                type="button"
                variant="outline"
                onClick={() => setShowQRCode(!showQRCode)}
                className="w-full flex items-center justify-center"
              >
                <QrCode className="h-4 w-4 mr-2" />
                {showQRCode ? "Hide Calendar QR Code" : "Show Calendar QR Code"}
              </Button>
              
              {showQRCode && (
                <div style={{ 
                  marginTop: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    margin: '16px 0'
                  }}>
                    <QRCodeSVG 
                      value={getCalendarData()}
                      size={200}
                      includeMargin={true}
                      bgColor={"#FFFFFF"}
                      fgColor={"#000000"}
                    />
                  </div>
                  <p style={{ 
                    textAlign: 'center', 
                    fontSize: '14px', 
                    color: '#4b5563', 
                    marginBottom: '16px' 
                  }}>
                    Scan with your phone's camera to add to your calendar
                  </p>
                  <Button 
                    onClick={handleDownload}
                    style={{
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '100%'
                    }}
                  >
                    <Download style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    Download .ics File
                  </Button>
                </div>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 dark:text-gray-100 border dark:border-gray-700 max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-gray-100">Delete Event</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-300">
              Are you sure you want to delete this event?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Template selection dialog */}
      <Dialog open={isTemplateMenuOpen} onOpenChange={setIsTemplateMenuOpen}>
        <DialogContent className="sm:max-w-[450px] bg-white dark:bg-gray-800 dark:text-gray-100 border dark:border-gray-700 shadow-lg">
          <DialogHeader>
            <DialogTitle>Choose Event Template</DialogTitle>
            <DialogDescription className="dark:text-gray-300">
              Select a template to quickly create a common event type
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {EVENT_TEMPLATES.map(template => (
              <Button
                key={template.id}
                variant="outline"
                className="justify-start h-auto py-3 px-4 bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => applyTemplate(template)}
              >
                <div className="flex flex-col items-start text-left">
                  <span className="font-medium">{template.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-300 mt-1">
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
