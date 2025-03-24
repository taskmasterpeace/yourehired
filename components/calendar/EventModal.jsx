import React, { useState, useEffect } from 'react';
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
import { toast } from "@/components/ui/use-toast";


const EventModal = ({ isOpen, onClose, event, opportunities = [], onSave, onDelete }) => {
  const [eventData, setEventData] = useState({
    id: '',
    title: '',
    date: new Date(),
    startTime: '09:00',
    endTime: '10:00',
    type: 'general',
    description: '',
    opportunityId: '',
    location: ''
  });
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
        // Parse the ID correctly - ensure we're getting a number for comparison
        let eventId = null;
        
        if (event.id) {
          eventId = typeof event.id === 'string' ? parseInt(event.id, 10) : event.id;
        } else if (event._id) {
          eventId = typeof event._id === 'string' ? parseInt(event._id, 10) : event._id;
        } else if (event.resource && event.resource.id) {
          eventId = typeof event.resource.id === 'string' ? 
            parseInt(event.resource.id, 10) : event.resource.id;
        }
        
        console.log('Parsed event ID:', eventId);
        
        const eventDate = new Date(event.date || event.startDate || new Date());
        
        // Create a clean copy without circular references
        setEventData({
          id: eventId, // Use our parsed id
          title: event.title || '',
          date: eventDate,
          startTime: format(eventDate, 'HH:mm'),
          endTime: event.endDate ? format(new Date(event.endDate), 'HH:mm') : format(new Date(eventDate.getTime() + 60 * 60 * 1000), 'HH:mm'),
          type: event.type || 'general',
          description: event.description || '',
          opportunityId: event.opportunityId || '',
          location: event.location || ''
        });
        
        console.log('EventData after setting:', {
          ...eventData,
          id: eventId // Log this separately to verify
        });
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
          description: '',
          opportunityId: '',
          location: ''
        });
      }
    }
  }, [event]);
  
  // Handle form input changes
  const handleChange = (field, value) => {
    if (field === 'opportunityId') {
      // If "none" is selected, set to empty string
      const finalValue = value === "none" ? "" : value;
      setEventData(prev => ({
        ...prev,
        [field]: finalValue
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
        endDate,
        // Convert opportunityId to number if it exists and is a string
        opportunityId: eventData.opportunityId ? 
          (typeof eventData.opportunityId === 'string' ? 
            parseInt(eventData.opportunityId, 10) : eventData.opportunityId) : undefined
      };
      
      // If associated with an opportunity, add that data
      if (completeEvent.opportunityId) {
        // Find the opportunity by ID, making sure to compare as numbers
        const opportunity = opportunities.find(opp => 
          opp.id === completeEvent.opportunityId
        );
        
        if (opportunity) {
          completeEvent.opportunity = {
            id: opportunity.id,
            company: opportunity.company,
            position: opportunity.position
          };
        }
      }
      
      console.log("Saving event with data:", completeEvent);
      onSave(completeEvent);
      toast({
        title: eventData.id ? "Event updated" : "Event created",
        description: "Your event has been saved successfully.",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Error",
        description: "There was an error saving the event. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle delete event
  const handleDelete = () => {
    console.log("Attempting to delete event with data:", eventData);
    console.log("Event ID to delete:", eventData.id);
    
    // Make sure we have a valid ID
    if (eventData.id) {
      try {
        console.log("Calling onDelete with ID:", eventData.id);
        onDelete(eventData.id);
        setIsDeleteDialogOpen(false);
        toast({
          title: "Event deleted",
          description: "Your event has been deleted successfully.",
        });
      } catch (error) {
        console.error("Error in handleDelete:", error);
        toast({
          title: "Error",
          description: "Could not delete the event. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      console.error("No valid ID found for deletion");
      toast({
        title: "Error",
        description: "Could not identify the event to delete.",
        variant: "destructive",
      });
    }
  };

  // Generate calendar event URL for QR code
  const generateCalendarEventUrl = () => {
    try {
      // Create date objects from form data before formatting
      const startDate = new Date(eventData.date);
      const [startHours, startMinutes] = eventData.startTime.split(':');
      startDate.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10));
      
      const endDate = new Date(eventData.date);
      const [endHours, endMinutes] = eventData.endTime.split(':');
      endDate.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10));
      
      // Format the dates for the URL
      const formattedStartDate = format(startDate, "yyyyMMdd'T'HHmmss'Z'");
      const formattedEndDate = format(endDate, "yyyyMMdd'T'HHmmss'Z'");
      
      const title = encodeURIComponent(eventData.title);
      const description = encodeURIComponent(eventData.description);
      const location = encodeURIComponent(eventData.location || '');
      
      return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&location=${location}&dates=${formattedStartDate}/${formattedEndDate}`;
    } catch (error) {
      console.error("Error generating calendar URL:", error);
      toast({
        title: "Error",
        description: "Could not generate calendar link. Please check your event details.",
        variant: "destructive",
      });
      return '#';
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
              
              {/* Event Type and Associated Opportunity */}
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
                  <Label htmlFor="opportunity">Associated Opportunity</Label>
                  <Select 
                    value={eventData.opportunityId || "none"} 
                    onValueChange={(value) => handleChange('opportunityId', value)}
                  >
                    <SelectTrigger id="opportunity">
                      <SelectValue placeholder="Select opportunity" />
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
              
              {/* Location */}
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={eventData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                />
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
              
            </div>
            
            
            {/* Save/Cancel/Delete buttons in one row - ALWAYS SHOW DELETE */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              {/* Always show all three buttons */}
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="w-full sm:w-1/3 bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
              <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-1/3">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-1/3 bg-blue-600 hover:bg-blue-700">
                {eventData.id ? 'Update' : 'Create'}
              </Button>
            </div>
            
            {/* Direct delete button for debugging */}
            {eventData.id && (
              <div className="mt-4 border-t pt-4">
                <Button 
                  type="button"
                  variant="destructive"
                  onClick={() => {
                    console.log("Direct delete with ID:", eventData.id);
                    onDelete(eventData.id);
                    onClose();
                  }}
                  className="w-full bg-red-800 hover:bg-red-900"
                >
                  Force Delete (Debug)
                </Button>
              </div>
            )}
            
            {/* Direct download button for existing events */}
            {(eventData.id || event?.id) && (
              <div className="mt-4">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={() => setShowQRCode(true)}
                  className="w-full flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  Show QR Code
                </Button>
              </div>
            )}
            
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent 
          className="bg-white dark:bg-gray-800 dark:text-gray-100 border dark:border-gray-700"
          style={{ maxWidth: '350px', width: '90%' }}
        >
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
      
      {/* QR Code Dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scan to Add to Calendar</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center p-4">
            <QRCodeSVG value={generateCalendarEventUrl()} size={200} />
          </div>
        </DialogContent>
      </Dialog>
      
    </>
  );
};

export default EventModal;
