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
    
    if (!event) return;
    
    const calendarData = generateICalString(event);
    const blob = new Blob([calendarData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${event.title || 'event'}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Handle copy to clipboard
  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!event) return;
    
    const calendarData = generateICalString(event);
    navigator.clipboard.writeText(calendarData)
      .then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      })
      .catch(err => console.error('Failed to copy: ', err));
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
            >
              <CalendarIcon className="w-4 h-4 mr-2" />
              Add to Calendar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={openModal}>
              <QrCode className="w-4 h-4 mr-2" />
              <span>QR Code</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              <span>Download .ics</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopy}>
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
        onClick={openModal}
        className="add-to-calendar-btn"
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
