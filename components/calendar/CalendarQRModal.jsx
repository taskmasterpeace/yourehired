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
import { 
  CalendarIcon, 
  X, 
  Smartphone, 
  Check, 
  Download, 
  ThumbsUp, 
  ThumbsDown, 
  HelpCircle,
  Share2
} from 'lucide-react';
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

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
  
  // Debug the QR code value
  console.log("QR Code value length:", safeValue.length);
  console.log("QR Code value type:", typeof safeValue);
  
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
  // Add debug logging
  console.log("CalendarQRModal received event:", event);
  console.log("Modal open state:", isOpen);
  
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  const [feedbackType, setFeedbackType] = useState(null); // 'success', 'error', or null
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('qrcode');
  const [showHelp, setShowHelp] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  
  // Generate the iCalendar data
  const calendarData = event ? generateICalString(event) : '';
  
  // Debug the calendar data
  useEffect(() => {
    if (isOpen) {
      console.log("Calendar data generated:", calendarData ? "Data available" : "No data");
      console.log("Event data:", event);
    }
  }, [isOpen, calendarData, event]);
  
  // Reset feedback when modal opens
  useEffect(() => {
    if (isOpen) {
      setFeedbackGiven(false);
      setFeedbackType(null);
      setScanProgress(0);
      setActiveTab('qrcode');
    }
  }, [isOpen]);
  
  // Simulate scanning progress when QR code is shown
  useEffect(() => {
    if (isOpen && activeTab === 'qrcode' && !feedbackGiven) {
      const timer = setTimeout(() => {
        setScanProgress(30);
        
        const timer2 = setTimeout(() => {
          setScanProgress(60);
          
          const timer3 = setTimeout(() => {
            setScanProgress(90);
          }, 3000);
          
          return () => clearTimeout(timer3);
        }, 2000);
        
        return () => clearTimeout(timer2);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, activeTab, feedbackGiven]);
  
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
      
      // Show success feedback
      setFeedbackType('success');
      setFeedbackGiven(true);
      setTimeout(() => {
        setFeedbackGiven(false);
      }, 2000);
    } catch (error) {
      console.error("Error downloading calendar file:", error);
      setFeedbackType('error');
      setFeedbackGiven(true);
    }
  };
  
  // Handle copy to clipboard
  const handleCopy = () => {
    if (!calendarData) return;
    
    navigator.clipboard.writeText(calendarData)
      .then(() => {
        setIsCopied(true);
        setFeedbackType('success');
        setFeedbackGiven(true);
        setTimeout(() => {
          setIsCopied(false);
          setFeedbackGiven(false);
        }, 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
        setFeedbackType('error');
        setFeedbackGiven(true);
      });
  };
  
  // Handle web share API if available
  const handleShare = async () => {
    if (!navigator.share || !calendarData) return;
    
    try {
      const blob = new Blob([calendarData], { type: 'text/calendar;charset=utf-8' });
      const file = new File([blob], `${event?.title || 'event'}.ics`, { type: 'text/calendar' });
      
      await navigator.share({
        title: event?.title || 'Calendar Event',
        text: `Event: ${event?.title} on ${formatDisplayDate(event?.startDate || event?.date)}`,
        files: [file]
      });
      
      setFeedbackType('success');
      setFeedbackGiven(true);
    } catch (error) {
      console.error('Error sharing event:', error);
      if (error.name !== 'AbortError') {
        setFeedbackType('error');
        setFeedbackGiven(true);
      }
    }
  };
  
  const handleFeedback = (success) => {
    // Here you could log analytics about successful scans
    setFeedbackType(success ? 'success' : 'error');
    setFeedbackGiven(true);
    
    // Close the modal after feedback
    setTimeout(() => {
      onClose();
      // Reset state after modal closes
      setTimeout(() => {
        setFeedbackGiven(false);
        setFeedbackType(null);
      }, 300);
    }, 1500);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Add to Calendar</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8" 
              onClick={() => setShowHelp(!showHelp)}
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </DialogTitle>
          <DialogDescription>
            {showHelp ? (
              <div className="text-sm mt-2 space-y-2">
                <p><strong>QR Code:</strong> Scan with your phone's camera app</p>
                <p><strong>Download:</strong> Save the .ics file and open it</p>
                <p><strong>Copy:</strong> Copy the iCal data to clipboard</p>
                {navigator.share && <p><strong>Share:</strong> Send to another app</p>}
              </div>
            ) : (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="qrcode">QR Code</TabsTrigger>
                  <TabsTrigger value="download">Download</TabsTrigger>
                  <TabsTrigger value="copy">Copy</TabsTrigger>
                </TabsList>
              </Tabs>
            )}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          {/* Event preview */}
          <div className="mb-4 text-center">
            <h3 className="font-medium text-lg">{event?.title}</h3>
            <p className="text-sm text-gray-500">
              {event && formatDisplayDate(event.startDate || event.date)}
            </p>
            {event && event.location && (
              <p className="text-sm text-gray-500">{event.location}</p>
            )}
          </div>
          
          <TabsContent value="qrcode" className="w-full flex flex-col items-center">
            {/* QR Code */}
            <div className="qr-container p-4 bg-white rounded-lg shadow-sm border-2 border-blue-200">
              <div className="text-center mb-2 text-xs text-gray-500">Hey You're Hired! v0.41</div>
              <QRCodeComponent value={calendarData} />
            </div>
            
            {/* Scanning progress indicator */}
            {!feedbackGiven && (
              <div className="w-full mt-4">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Scanning...</span>
                  <span>{scanProgress}%</span>
                </div>
                <Progress value={scanProgress} className="h-1" />
              </div>
            )}
            
            {/* Instructions */}
            <div className="mt-4 text-center text-sm text-gray-600">
              <p className="flex items-center justify-center">
                <Smartphone className="w-4 h-4 mr-1" />
                Point your phone's camera at the QR code
              </p>
              <p className="mt-1">Your phone will recognize it as a calendar event</p>
            </div>
          </TabsContent>
          
          <TabsContent value="download" className="w-full flex flex-col items-center">
            <div className="p-6 border rounded-lg w-full text-center">
              <Download className="h-12 w-12 mx-auto mb-4 text-blue-500" />
              <h3 className="font-medium mb-2">Download Calendar File</h3>
              <p className="text-sm text-gray-500 mb-4">
                Download an .ics file that you can open with your calendar app
              </p>
              <Button onClick={handleDownload} className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download .ics File
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="copy" className="w-full flex flex-col items-center">
            <div className="p-6 border rounded-lg w-full text-center">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-medium mb-2">Copy Calendar Data</h3>
              <p className="text-sm text-gray-500 mb-4">
                Copy the iCalendar data to your clipboard
              </p>
              <Button onClick={handleCopy} className="w-full">
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <CalendarIcon className="w-4 h-4 mr-2" />
                    Copy iCal Data
                  </>
                )}
              </Button>
              
              {/* Web Share API if available */}
              {navigator.share && (
                <Button 
                  onClick={handleShare} 
                  variant="outline" 
                  className="w-full mt-2"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Event
                </Button>
              )}
            </div>
          </TabsContent>
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!feedbackGiven ? (
            <>
              <div className="text-sm text-gray-500 mr-auto">
                Did this work for you?
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleFeedback(false)}
                  className="flex items-center"
                >
                  <ThumbsDown className="w-4 h-4 mr-2 text-red-500" />
                  No
                </Button>
                <Button 
                  size="sm"
                  onClick={() => handleFeedback(true)}
                  className="flex items-center"
                >
                  <ThumbsUp className="w-4 h-4 mr-2" />
                  Yes, Added!
                </Button>
              </div>
            </>
          ) : (
            <div className={`flex items-center mx-auto ${
              feedbackType === 'success' ? 'text-green-600' : 'text-red-600'
            }`}>
              {feedbackType === 'success' ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Thanks for your feedback!
                </>
              ) : (
                <>
                  <X className="w-5 h-5 mr-2" />
                  Sorry it didn't work. Try another method.
                </>
              )}
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarQRModal;
