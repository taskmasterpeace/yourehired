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
      <DialogContent style={{
        backgroundColor: 'white',
        padding: '20px',
        maxWidth: '400px',
        color: 'black',
        border: '1px solid #e5e7eb',
        borderRadius: '8px'
      }}>
        <DialogHeader>
          <DialogTitle style={{ color: '#111827', fontSize: '18px', fontWeight: 'bold' }}>
            Add to Calendar
          </DialogTitle>
        </DialogHeader>
        
        {/* Event Title */}
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#111827' }}>{event?.title}</h3>
          {event && (
            <p style={{ fontSize: '14px', color: '#4b5563' }}>
              {formatDisplayDate(event.startDate || event.date)}
            </p>
          )}
          {event?.location && (
            <p style={{ fontSize: '14px', color: '#4b5563' }}>
              {event.location}
            </p>
          )}
        </div>
        
        {/* QR Code - Using direct inline styles as per lessons learned */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center',
          backgroundColor: 'white',
          padding: '16px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          margin: '16px 0'
        }}>
          {calendarData ? (
            <QRCodeSVG 
              value={calendarData}
              size={200}
              includeMargin={true}
              bgColor={"#FFFFFF"}
              fgColor={"#000000"}
            />
          ) : (
            <div style={{ 
              width: '200px', 
              height: '200px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              backgroundColor: '#f3f4f6' 
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
          marginBottom: '16px' 
        }}>
          Scan with your phone's camera to add to your calendar
        </p>
        
        <DialogFooter>
          <Button 
            onClick={handleDownload} 
            style={{
              backgroundColor: '#3b82f6',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%'
            }}
          >
            <Download style={{ width: '16px', height: '16px', marginRight: '8px' }} />
            Download .ics File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarQRModal;
// This component is no longer used.
// QR code functionality has been integrated directly into EventModal.jsx
