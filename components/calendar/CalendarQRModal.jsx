import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { generateICalString } from './calendarUtils.js';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Download } from 'lucide-react';

// See LessonsLearned.md for implementation insights
const CalendarQRModal = ({ event, isOpen, onClose }) => {
  // Generate the iCalendar data
  const calendarData = event ? generateICalString(event) : '';
  
  // Handle direct download of .ics file
  const handleDownload = () => {
    if (!calendarData) return;
    
    try {
      const blob = new Blob([calendarData], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${event?.title || 'event'}.ics`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading calendar file:", error);
    }
  };
  
  // Format the event date for display
  const formatDisplayDate = (date) => {
    if (!date) return '';
    const eventDate = new Date(date);
    return eventDate.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] bg-white dark:bg-gray-800 dark:text-gray-100 border dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-gray-100">
            Add to Calendar
          </DialogTitle>
        </DialogHeader>
        
        {/* Event Title */}
        <div className="mb-4 text-center">
          <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">{event?.title}</h3>
          {event && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {formatDisplayDate(event.startDate || event.date)}
            </p>
          )}
          {event?.location && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {event.location}
            </p>
          )}
        </div>
        
        {/* QR Code - Always white background for scanning */}
        <div className="flex justify-center mb-4 bg-white p-4 border border-gray-200 dark:border-gray-600 rounded-lg">
          {calendarData ? (
            <QRCodeSVG 
              value={calendarData}
              size={200}
              level="M"
              includeMargin={true}
              bgColor={"#FFFFFF"}
              fgColor={"#000000"}
            />
          ) : (
            <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100">
              <span className="text-gray-500">No calendar data</span>
            </div>
          )}
        </div>
        
        {/* Simple instructions */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-300 mb-4">
          Scan with your phone's camera to add to your calendar
        </p>
        
        <DialogFooter>
          <Button 
            onClick={handleDownload} 
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Download .ics File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarQRModal;
