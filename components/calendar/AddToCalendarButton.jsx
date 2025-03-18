import React, { useState } from 'react';
import { Button } from "../ui/button";
import { CalendarIcon, Download, Copy, QrCode } from 'lucide-react';
import { generateICalString } from './calendarUtils.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import CalendarQRModal from './CalendarQRModal.jsx';

const AddToCalendarButton = ({ event, variant = "default", size = "default", compact = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  // Handle direct download of .ics file
  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (!event) {
        console.warn("No event provided for download");
        return;
      }
      
      const calendarData = generateICalString(event);
      if (!calendarData) {
        console.error("Failed to generate calendar data");
        return;
      }
      
      const blob = new Blob([calendarData], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${event.title || 'event'}.ics`);
      
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
  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (!event) {
        console.warn("No event provided for clipboard copy");
        return;
      }
      
      const calendarData = generateICalString(event);
      if (!calendarData) {
        console.error("Failed to generate calendar data for clipboard");
        return;
      }
      
      navigator.clipboard.writeText(calendarData)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy to clipboard: ', err);
          // Fallback for browsers that don't support clipboard API
          try {
            const textArea = document.createElement('textarea');
            textArea.value = calendarData;
            textArea.style.position = 'fixed';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 2000);
            }
          } catch (fallbackErr) {
            console.error('Clipboard fallback failed:', fallbackErr);
          }
        });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };
  
  if (compact) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant={variant} 
              size={size} 
              className="add-to-calendar-btn"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Add to Calendar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openModal();
            }}>
              <QrCode className="w-4 h-4 mr-2" />
              <span>QR Code</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDownload(e);
            }}>
              <Download className="w-4 h-4 mr-2" />
              <span>Download .ics</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCopy(e);
            }}>
              <Copy className="w-4 h-4 mr-2" />
              <span>{isCopied ? 'Copied!' : 'Copy iCal'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <CalendarQRModal 
          event={event}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </>
    );
  }
  
  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openModal();
        }}
        className="add-to-calendar-btn"
        type="button"
      >
        <CalendarIcon className="w-4 h-4 mr-2" />
        Add to Calendar
      </Button>
      
      <CalendarQRModal 
        event={event}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
};

export default AddToCalendarButton;
import React, { useState } from 'react';
import { Button } from "../ui/button";
import { CalendarIcon, Download, Copy, QrCode } from 'lucide-react';
import { generateICalString } from './calendarUtils.js';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

import CalendarQRModal from './CalendarQRModal.jsx';

const AddToCalendarButton = ({ event, variant = "default", size = "default", compact = false }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  // Handle direct download of .ics file
  const handleDownload = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (!event) {
        console.warn("No event provided for download");
        return;
      }
      
      const calendarData = generateICalString(event);
      if (!calendarData) {
        console.error("Failed to generate calendar data");
        return;
      }
      
      const blob = new Blob([calendarData], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${event.title || 'event'}.ics`);
      
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
  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      if (!event) {
        console.warn("No event provided for clipboard copy");
        return;
      }
      
      const calendarData = generateICalString(event);
      if (!calendarData) {
        console.error("Failed to generate calendar data for clipboard");
        return;
      }
      
      navigator.clipboard.writeText(calendarData)
        .then(() => {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        })
        .catch(err => {
          console.error('Failed to copy to clipboard: ', err);
          // Fallback for browsers that don't support clipboard API
          try {
            const textArea = document.createElement('textarea');
            textArea.value = calendarData;
            textArea.style.position = 'fixed';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            
            if (successful) {
              setIsCopied(true);
              setTimeout(() => setIsCopied(false), 2000);
            }
          } catch (fallbackErr) {
            console.error('Clipboard fallback failed:', fallbackErr);
          }
        });
    } catch (error) {
      console.error("Error copying to clipboard:", error);
    }
  };
  
  if (compact) {
    return (
      <>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant={variant} 
              size={size} 
              className="add-to-calendar-btn"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Add to Calendar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              openModal();
            }}>
              <QrCode className="w-4 h-4 mr-2" />
              <span>QR Code</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleDownload(e);
            }}>
              <Download className="w-4 h-4 mr-2" />
              <span>Download .ics</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleCopy(e);
            }}>
              <Copy className="w-4 h-4 mr-2" />
              <span>{isCopied ? 'Copied!' : 'Copy iCal'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <CalendarQRModal 
          event={event}
          isOpen={isModalOpen}
          onClose={closeModal}
        />
      </>
    );
  }
  
  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          openModal();
        }}
        className="add-to-calendar-btn"
        type="button"
      >
        <CalendarIcon className="w-4 h-4 mr-2" />
        Add to Calendar
      </Button>
      
      <CalendarQRModal 
        event={event}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
};

export default AddToCalendarButton;
