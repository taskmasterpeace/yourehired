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

console.log("LOADING COMPONENT: CalendarQRModal.jsx - VERSION 3");

const CalendarQRModal = ({ event, isOpen, onClose }) => {
  console.log("CalendarQRModal received event:", event);
  
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
      <DialogContent style={{
        backgroundColor: 'white',
        padding: '20px',
        maxWidth: '400px',
        width: '100%',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
      }}>
        <DialogHeader>
          <DialogTitle style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
            Add to Calendar
          </DialogTitle>
        </DialogHeader>
        
        {/* Event Title */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>{event?.title}</h3>
          {event && (
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              {formatDisplayDate(event.startDate || event.date)}
            </p>
          )}
          {event?.location && (
            <p style={{ fontSize: '14px', color: '#6b7280' }}>
              {event.location}
            </p>
          )}
        </div>
        
        {/* QR Code - Ultra Simple */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginBottom: '20px',
          backgroundColor: 'white',
          padding: '16px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px'
        }}>
          {calendarData ? (
            <QRCodeSVG 
              value={calendarData}
              size={200}
              level="M"
              includeMargin={true}
            />
          ) : (
            <div style={{ 
              width: '200px', 
              height: '200px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#f3f4f6',
              borderRadius: '8px'
            }}>
              <span style={{ color: '#6b7280' }}>No calendar data</span>
            </div>
          )}
        </div>
        
        {/* Simple instructions */}
        <p style={{ 
          textAlign: 'center', 
          fontSize: '14px', 
          color: '#4b5563',
          marginBottom: '20px'
        }}>
          Scan with your phone's camera to add to your calendar
        </p>
        
        <DialogFooter>
          <Button onClick={handleDownload} className="bg-blue-500 hover:bg-blue-600 text-white">
            <Download className="w-4 h-4 mr-2" />
            Download .ics File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarQRModal;
