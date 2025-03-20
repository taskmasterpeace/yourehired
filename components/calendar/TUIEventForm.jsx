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
import { QRCodeSVG } from 'qrcode.react';
import { generateICalString } from './calendarUtils.js';
import { Download, QrCode, Trash2 } from 'lucide-react';
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
    opportunityId: ''
  });
  
  const [showQRCode, setShowQRCode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Add debugging for event data
  useEffect(() => {
    if (event) {
      console.log("Event received in TUIEventForm:", event);
      console.log("Event ID:", event.id);
      console.log("Event title:", event.title);
      console.log("Event startDate:", event.startDate);
      console.log("Event endDate:", event.endDate);
      console.log("Event type:", event.type);
      console.log("Event description:", event.description);
      console.log("Event raw:", event.raw);
      if (event.raw) {
        console.log("Raw event ID:", event.raw.id);
      }
    }
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
        
        // Extract ID from all possible locations
        const eventId = event.id || 
                       (event.raw && event.raw.id) || 
                       '';
        
        console.log("Setting event ID to:", eventId);
        console.log("Setting start date to:", startDate);
        console.log("Setting end date to:", endDate);
        
        setEventData({
          id: eventId,
          title: event.title || '',
          date: startDate, // Keep date for compatibility
          startDate: startDate,
          endDate: endDate,
          type: event.type || event.calendarId || 'general',
          description: event.description || event.body || '',
          opportunityId: event.opportunityId || ''
        });
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
          opportunityId: ''
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
        opportunityId: ''
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
      // Prepare the complete event object
      const completeEvent = {
        ...eventData,
        // Ensure date field is set for compatibility
        date: eventData.startDate
      };
      
      onSave(completeEvent);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("There was an error saving the event. Please try again.");
    }
  };
  
  // Handle delete
  const handleDelete = () => {
    try {
      if (onDelete && eventData.id) {
        onDelete(eventData.id);
        setIsDeleteDialogOpen(false);
        onClose();
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("There was an error deleting the event. Please try again.");
    }
  };
  
  // Generate calendar data for QR code
  const getCalendarData = () => {
    try {
      return generateICalString({
        ...eventData,
        date: eventData.startDate
      });
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
  
  // Format date for datetime-local input
  const formatDateForInput = (date) => {
    try {
      return format(date, "yyyy-MM-dd'T'HH:mm");
    } catch (error) {
      console.error("Error formatting date:", error);
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
              {/* Delete button - always show */}
              <Button 
                type="button" 
                variant="destructive" 
                onClick={() => setIsDeleteDialogOpen(true)}
                className="w-full sm:w-1/3 bg-red-600 hover:bg-red-700 text-white"
                disabled={!eventData.id}
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
            
            {/* Calendar Export and QR Code section is now simplified */}
            
            <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <Button 
                type="button"
                variant="outline"
                onClick={() => setShowQRCode(!showQRCode)}
                className="w-full flex items-center justify-center"
                // Enable the button regardless of ID
              >
                <QrCode className="h-4 w-4 mr-2" />
                {showQRCode ? "Hide Calendar QR Code" : "Show Calendar QR Code"}
              </Button>
              
              {/* Always show QR code when showQRCode is true, regardless of ID */}
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
                        backgroundColor: 'white', // Always white for QR code
                        padding: '16px',
                        border: isDarkMode ? '1px solid #4b5563' : '1px solid #e5e7eb',
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
                        color: isDarkMode ? '#9ca3af' : '#4b5563', 
                        marginBottom: '16px' 
                      }}>
                        Scan with your phone's camera to add to your calendar
                      </p>
                    </div>
                )}
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
    </>
  );
};

export default TUIEventForm;
