import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "../ui/dialog";
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
import { Trash2, QrCode } from 'lucide-react';
import { format } from 'date-fns';
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
import QRCode from 'qrcode.react';
import { toast } from "@/components/ui/use-toast";

const TUIEventForm = ({
  isOpen,
  onClose,
  event,
  opportunities = [],
  onSave,
  onDelete,
  isDarkMode = false
}) => {
  const [eventData, setEventData] = useState({
    id: '',
    title: '',
    date: new Date(),
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 60 * 1000),
    type: 'general',
    description: '',
    opportunityId: '',
    location: ''
  });
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  
  // Generate calendar event URL for QR code
  const generateCalendarEventUrl = () => {
    const startDate = format(eventData.startDate, "yyyyMMdd'T'HHmmss'Z'");
    const endDate = format(eventData.endDate, "yyyyMMdd'T'HHmmss'Z'");
    const title = encodeURIComponent(eventData.title);
    const description = encodeURIComponent(eventData.description);
    const location = encodeURIComponent(eventData.location);
    
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&location=${location}&dates=${startDate}/${endDate}`;
  };
  
  // Debug logging
  useEffect(() => {
    console.log('TUIEventForm RECEIVED EVENT:', event);
    console.log('EVENT ID:', event?.id);
    console.log('EVENT TITLE:', event?.title);
  }, [event]);
  
  // Initialize form with event data when editing
  useEffect(() => {
    if (event) {
      try {
        console.log("Processing event in form:", event);
        
        // Ensure we have valid dates
        let startDate;
        if (event.startDate instanceof Date) {
          startDate = event.startDate;
        } else if (event.startDate) {
          startDate = new Date(event.startDate);
        } else if (event.start instanceof Date) {
          startDate = event.start;
        } else if (event.start) {
          startDate = new Date(event.start);
        } else if (event.date) {
          startDate = new Date(event.date);
        } else {
          startDate = new Date();
        }
        
        let endDate;
        if (event.endDate instanceof Date) {
          endDate = event.endDate;
        } else if (event.endDate) {
          endDate = new Date(event.endDate);
        } else if (event.end instanceof Date) {
          endDate = event.end;
        } else if (event.end) {
          endDate = new Date(event.end);
        } else {
          endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        }
        
        // Create a new object first, then set it to state
        const newEventData = {
          id: event.id || '',
          title: event.title || '',
          date: startDate,
          startDate: startDate,
          endDate: endDate,
          type: event.type || event.calendarId || 'general',
          description: event.description || event.body || '',
          opportunityId: event.opportunityId || '',
          location: event.location || ''
        };
        
        console.log("New event data being set:", newEventData);
        setEventData(newEventData);
      } catch (error) {
        console.error("Error processing event data:", error);
        // Set default values if there's an error
        setEventData({
          id: event.id || '',
          title: event.title || '',
          date: new Date(),
          startDate: new Date(),
          endDate: new Date(Date.now() + 60 * 60 * 1000),
          type: 'general',
          description: '',
          opportunityId: '',
          location: ''
        });
      }
    } else {
      // Reset form for new event
      setEventData({
        id: '',
        title: '',
        date: new Date(),
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 60 * 1000),
        type: 'general',
        description: '',
        opportunityId: '',
        location: ''
      });
    }
  }, [event]);
  
  // Handle form input changes
  const handleChange = (field, value) => {
    console.log(`Changing ${field} to:`, value);
    
    // Special handling for opportunityId
    if (field === 'opportunityId') {
      // If "none" is selected, set to empty string
      const finalValue = value === "none" ? "" : value;
      console.log(`Setting opportunityId to:`, finalValue);
      
      setEventData(prev => ({
        ...prev,
        opportunityId: finalValue
      }));
    } else {
      // Normal handling for other fields
      setEventData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // If changing startDate, also update the date field for compatibility
    if (field === 'startDate') {
      setEventData(prev => ({
        ...prev,
        date: value
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    try {
      // Create date objects for start and end times
      const startDate = new Date(eventData.date);
      const [startHours, startMinutes] = format(eventData.startDate, 'HH:mm').split(':');
      startDate.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10));
      
      const endDate = new Date(eventData.date);
      const [endHours, endMinutes] = format(eventData.endDate, 'HH:mm').split(':');
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
  
  // Handle delete
  const handleDelete = () => {
    try {
      if (onDelete && eventData.id) {
        onDelete(eventData.id);
        setIsDeleteDialogOpen(false);
        toast({
          title: "Event deleted",
          description: "Your event has been deleted successfully.",
        });
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("There was an error deleting the event. Please try again.");
    }
  };
  
  // Format date for datetime-local input
  const formatDateForInput = (date) => {
    try {
      // First, ensure we have a valid Date object
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        console.error("Invalid date provided to formatDateForInput:", date);
        // Return current date/time as fallback
        return format(new Date(), "yyyy-MM-dd'T'HH:mm");
      }
      
      return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch (error) {
      console.error("Error formatting date:", error, "Date value was:", date);
      // Return current date/time as fallback
      return format(new Date(), "yyyy-MM-dd'T'HH:mm");
    }
  };
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className={`sm:max-w-[500px] ${isDarkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-900 border-gray-200'} shadow-lg overflow-y-auto max-h-[80vh]`}
          style={{
            overflowY: 'auto',
            maxHeight: '80vh',
            width: '95vw',
            margin: '0 auto'
          }}
        >
          <DialogHeader>
            <DialogTitle className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>
              {eventData.id ? 'Edit Event' : 'Create Event'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Title */}
              <div className="grid gap-2">
                <Label htmlFor="title" className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Event Title</Label>
                <Input
                  id="title"
                  value={eventData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Enter event title"
                  required
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : ''}
                />
              </div>
              
              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Start Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formatDateForInput(eventData.startDate)}
                    onChange={(e) => handleChange('startDate', new Date(e.target.value))}
                    required
                    className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : ''}
                  />
                </div>
                <div className="grid gap-2">
                  <Label className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>End Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={formatDateForInput(eventData.endDate)}
                    onChange={(e) => handleChange('endDate', new Date(e.target.value))}
                    required
                    className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : ''}
                  />
                </div>
              </div>
              
              {/* Location */}
              <div className="grid gap-2">
                <Label htmlFor="location" className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Location</Label>
                <Input
                  id="location"
                  value={eventData.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Enter event location"
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : ''}
                />
              </div>
              
              {/* Event Type and Associated Opportunity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type" className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Event Type</Label>
                  <Select
                    value={eventData.type}
                    onValueChange={(value) => handleChange('type', value)}
                  >
                    <SelectTrigger id="type" className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : ''}>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className={isDarkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-900 border-gray-200'}>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="followup">Follow-up</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="opportunity" className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Associated Opportunity</Label>
                  <Select
                    value={eventData.opportunityId || "none"}
                    onValueChange={(value) => handleChange('opportunityId', value)}
                  >
                    <SelectTrigger id="opportunity" className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : ''}>
                      <SelectValue placeholder="Select opportunity" />
                    </SelectTrigger>
                    <SelectContent className={isDarkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-900 border-gray-200'} style={{ maxHeight: '300px', overflowY: 'auto' }}>
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
                <Label htmlFor="description" className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>Description</Label>
                <Textarea
                  id="description"
                  value={eventData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Add details about this event"
                  rows={3}
                  className={isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-100' : ''}
                />
              </div>
            </div>
            
            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              {/* Delete button - only show when editing */}
              {eventData.id && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="w-full sm:w-1/3 bg-red-600 hover:bg-red-700 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              )}
              {/* QR Code button - only show when editing */}
              {eventData.id && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowQRCode(true)}
                  className="w-full sm:w-1/3"
                >
                  <QrCode className="h-4 w-4 mr-2" />
                  QR Code
                </Button>
              )}
              <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-1/3">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-1/3 bg-blue-600 hover:bg-blue-700">
                {eventData.id ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent
          className={`${isDarkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}
          style={{ maxWidth: '350px', width: '90%' }}
        >
          <AlertDialogHeader>
            <AlertDialogTitle className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>Delete Event</AlertDialogTitle>
            <AlertDialogDescription className={isDarkMode ? 'text-gray-300' : 'text-gray-600'}>
              Are you sure you want to delete this event?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className={isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-900'}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* QR Code dialog */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent
          className={`sm:max-w-[300px] ${isDarkMode ? 'bg-gray-800 text-gray-100 border-gray-700' : 'bg-white text-gray-900 border-gray-200'}`}
        >
          <DialogHeader>
            <DialogTitle className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>Event QR Code</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            <QRCode
              value={generateCalendarEventUrl()}
              size={200}
              level="H"
              includeMargin={true}
            />
            <p className="mt-4 text-sm text-center">
              Scan this QR code to add this event to your calendar
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TUIEventForm;
