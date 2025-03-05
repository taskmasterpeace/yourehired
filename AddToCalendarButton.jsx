import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { CalendarIcon } from 'lucide-react';
import CalendarQRModal from './CalendarQRModal';

const AddToCalendarButton = ({ event, variant = "default", size = "default" }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
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
