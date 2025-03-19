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
  onDelete
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
  
  // Initialize form with event data when editing
  useEffect(() => {
    if (event) {
      try {
        const startDate = new Date(event.startDate || event.start || event.date || new Date());
        const endDate = new Date(event.endDate || event.end || new Date(startDate.getTime() + 60 * 60 * 1000));
        
        setEventData({
          id: event.id || '',
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
    setEventData(prev => ({
      ...prev,
      [field]: value
    }));
    
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
          className="sm:max-w-[500px] bg-white dark:bg-gray-800 dark:text-gray-100 border dark:border-gray-700 shadow-lg overflow-y-auto max-h-[80vh]"
          style={{
            overflowY: 'auto',
            maxHeight: '80vh',
            width: '95vw',
            margin: '0 auto'
          }}
        >
          <DialogHeader>
            <DialogTitle>
              {eventData.id ? 'Edit Event' : 'Create Event'}
            </DialogTitle>
          </DialogHeader>
          
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
                  <Label>Start Date & Time</Label>
                  <Input 
                    type="datetime-local"
                    value={formatDateForInput(eventData.startDate)}
                    onChange={(e) => handleChange('startDate', new Date(e.target.value))}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>End Date & Time</Label>
                  <Input 
                    type="datetime-local"
                    value={formatDateForInput(eventData.endDate)}
                    onChange={(e) => handleChange('endDate', new Date(e.target.value))}
                    required
                  />
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
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="followup">Follow-up</SelectItem>
                      <SelectItem value="assessment">Assessment</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="opportunity">Associated Opportunity</Label>
                  <Select 
                    value={eventData.opportunityId || "none"} 
                    onValueChange={(value) => handleChange('opportunityId', value === "none" ? "" : value)}
                  >
                    <SelectTrigger id="opportunity">
                      <SelectValue placeholder="Select opportunity" />
                    </SelectTrigger>
                    <SelectContent className="bg-white dark:bg-gray-800 dark:text-gray-100 border dark:border-gray-700 z-50 max-h-[300px] overflow-y-auto">
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
              <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-1/3">
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-1/3 bg-blue-600 hover:bg-blue-700">
                {eventData.id ? 'Update' : 'Create'}
              </Button>
            </div>
            
            {/* Calendar Export and QR Code - only show when editing */}
            {eventData.id && (
              <>
                <div className="mt-4">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-100 dark:border-blue-700"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Calendar (.ics) File
                  </Button>
                </div>
                
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
                    </div>
                  )}
                </div>
              </>
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
    </>
  );
};

export default TUIEventForm;
