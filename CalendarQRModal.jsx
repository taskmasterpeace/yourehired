import React, { useState, useEffect } from 'react';
import { generateICalString } from './calendarUtils.js';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "../ui/dialog";
import { Button } from "../ui/button";
import { CalendarIcon, X, Smartphone, Check, Download } from 'lucide-react';

// We'll use a dynamic import for QRCode to avoid SSR issues
const QRCodeComponent = ({ value, size = 200 }) => {
  const [QRCode, setQRCode] = useState(null);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    import('qrcode.react')
      .then(module => {
        setQRCode(() => module.QRCodeSVG);
      })
      .catch(err => {
        console.error("Failed to load QR code module:", err);
        setError(err);
      });
  }, []);

  // Handle loading state
  if (!QRCode && !error) {
    return <div className="w-[200px] h-[200px] bg-gray-100 animate-pulse rounded-lg"></div>;
  }
  
  // Handle error state
  if (error) {
    return (
      <div className="w-[200px] h-[200px] flex items-center justify-center bg-gray-100 rounded-lg border border-red-300">
        <div className="text-center p-4 text-red-500">
          <p>Failed to load QR code</p>
          <p className="text-xs mt-2">Please try another method</p>
        </div>
      </div>
    );
  }
  
  // Ensure we have a valid value
  const safeValue = value || 'https://yourehired.app';
  
  // Check if logo exists
  const logoSettings = {
    src: "/logo-small.png",
    height: 24,
    width: 24,
    excavate: true
  };
  
  return (
    <QRCode 
      value={safeValue}
      size={size}
      level="M"
      includeMargin={true}
      imageSettings={logoSettings}
      onError={(err) => {
        console.error("QR Code rendering error:", err);
      }}
    />
  );
};

const CalendarQRModal = ({ event, isOpen, onClose }) => {
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  // Generate the iCalendar data
  const calendarData = event ? generateICalString(event) : '';
  
  // Format the event date for display
  const formatDisplayDate = (date) => {
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
  
  // Handle direct download of .ics file
  const handleDownload = () => {
    if (!calendarData) return;
    
    try {
      const blob = new Blob([calendarData], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${event?.title || 'event'}.ics`);
      
      // Append to document only if it's not already there
      if (!document.body.contains(link)) {
        document.body.appendChild(link);
      }
      
      link.click();
      
      // Clean up
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      console.error("Error downloading calendar file:", error);
    }
  };
  
  // Handle copy to clipboard
  const handleCopy = () => {
    if (!calendarData) return;
    
    navigator.clipboard.writeText(calendarData)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
  };
  
  const handleFeedback = (success) => {
    // Here you could log analytics about successful scans
    setFeedbackGiven(true);
    setTimeout(() => {
      onClose();
      setFeedbackGiven(false);
    }, 1500);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Calendar</DialogTitle>
          <DialogDescription>
            Scan this QR code with your phone's camera to add this event to your calendar.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          {/* Event preview */}
          <div className="mb-4 text-center">
            <h3 className="font-medium text-lg">{event.title}</h3>
            <p className="text-sm text-gray-500">
              {event && formatDisplayDate(event.startDate || event.date)}
            </p>
            {event && event.location && (
              <p className="text-sm text-gray-500">{event.location}</p>
            )}
          </div>
          
          {/* QR Code */}
          <div className="qr-container p-4 bg-white rounded-lg shadow-sm">
            <div className="text-center mb-2 text-xs text-gray-500">Hey You're Hired! v0.41</div>
            <QRCodeComponent value={calendarData} />
          </div>
          
          {/* Alternative options */}
          <div className="mt-4 flex justify-center space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDownload}
              className="flex items-center"
            >
              <Download className="w-4 h-4 mr-1" />
              Download .ics
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCopy}
              className="flex items-center"
            >
              {isCopied ? <Check className="w-4 h-4 mr-1" /> : <CalendarIcon className="w-4 h-4 mr-1" />}
              {isCopied ? 'Copied!' : 'Copy iCal'}
            </Button>
          </div>
          
          {/* Instructions */}
          <div className="mt-4 text-center text-sm text-gray-600">
            <p className="flex items-center justify-center">
              <Smartphone className="w-4 h-4 mr-1" />
              Point your phone's camera at the QR code
            </p>
            <p className="mt-1">Your phone will recognize it as a calendar event</p>
          </div>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!feedbackGiven ? (
            <>
              <div className="text-sm text-gray-500 mr-auto">
                Did this work for you?
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleFeedback(false)}
              >
                No
              </Button>
              <Button 
                size="sm"
                onClick={() => handleFeedback(true)}
              >
                Yes, Added!
              </Button>
            </>
          ) : (
            <div className="flex items-center text-green-600 mx-auto">
              <Check className="w-5 h-5 mr-1" />
              Thanks for your feedback!
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarQRModal;
