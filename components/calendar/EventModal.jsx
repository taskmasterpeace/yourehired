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
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, Clock, MapPin, Briefcase } from 'lucide-react';
import { format } from 'date-fns';
import AddToCalendarButton from './AddToCalendarButton';

const EventModal = ({ isOpen, onClose, event, opportunities = [], onSave }) => {
  const [eventData, setEventData] = useState({
    id: '',
    title: '',
    date: new Date(),
    startTime: '09:00',
    endTime: '10:00',
    type: 'general',
    location: '',
    description: '',
    opportunityId: ''
  });
  
  // Initialize form with event data when editing
  useEffect(() => {
    if (event) {
      const eventDate = new Date(event.date || event.startDate || new Date());
      
      setEventData({
        id: event.id || '',
        title: event.title || '',
        date: eventDate,
        startTime: format(eventDate, 'HH:mm'),
        endTime: event.endDate ? format(new Date(event.endDate), 'HH:mm') : format(new Date(eventDate.getTime() + 60 * 60 * 1000), 'HH:mm'),
        type: event.type || 'general',
        location: event.location || '',
        description: event.description || '',
        opportunityId: event.opportunityId || ''
      });
    }
  }, [event]);
  
  // Handle form input changes
  const handleChange = (field, value) => {
    setEventData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create date objects for start and end times
    const startDate = new Date(eventData.date);
    const [startHours, startMinutes] = eventData.startTime.split(':');
    startDate.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10));
    
    const endDate = new Date(eventData.date);
    const [endHours, endMinutes] = eventData.endTime.split(':');
    endDate.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10));
    
    // Prepare the complete event object
    const completeEvent = {
      ...eventData,
      startDate,
      endDate
    };
    
    // If associated with an opportunity, add that data
    if (eventData.opportunityId) {
      const opportunity = opportunities.find(opp => opp.id === eventData.opportunityId);
      if (opportunity) {
        completeEvent.opportunity = opportunity;
      }
    }
    
    onSave(completeEvent);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {eventData.id ? 'Edit Event' : 'Create New Event'}
            </DialogTitle>
          </DialogHeader>
          
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
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {eventData.date ? format(eventData.date, 'PPP') : 'Select date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={eventData.date}
                      onSelect={(date) => handleChange('date', date)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid gap-2">
                <Label>Time</Label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1">
                    <Input 
                      type="time"
                      value={eventData.startTime}
                      onChange={(e) => handleChange('startTime', e.target.value)}
                      required
                    />
                  </div>
                  <span>to</span>
                  <div className="flex-1">
                    <Input 
                      type="time"
                      value={eventData.endTime}
                      onChange={(e) => handleChange('endTime', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Event Type and Location */}
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
                  <SelectContent>
                    <SelectItem value="interview">Interview</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="followup">Follow-up</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="location">Location</Label>
                <div className="flex">
                  <MapPin className="h-4 w-4 mr-2 mt-3 text-gray-400" />
                  <Input 
                    id="location"
                    value={eventData.location}
                    onChange={(e) => handleChange('location', e.target.value)}
                    placeholder="Add location (optional)"
                  />
                </div>
              </div>
            </div>
            
            {/* Associated Opportunity */}
            <div className="grid gap-2">
              <Label htmlFor="opportunity">Associated Job Opportunity</Label>
              <div className="flex">
                <Briefcase className="h-4 w-4 mr-2 mt-3 text-gray-400" />
                <Select 
                  value={eventData.opportunityId} 
                  onValueChange={(value) => handleChange('opportunityId', value)}
                >
                  <SelectTrigger id="opportunity" className="flex-1">
                    <SelectValue placeholder="Link to job opportunity (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {opportunities.map(opp => (
                      <SelectItem key={opp.id} value={opp.id}>
                        {opp.company} - {opp.position}
                      </SelectItem>
                    ))}
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
          
          <DialogFooter className="flex justify-between items-center">
            <div>
              {eventData.id && (
                <AddToCalendarButton 
                  event={{
                    title: eventData.title,
                    startDate: new Date(`${format(eventData.date, 'yyyy-MM-dd')}T${eventData.startTime}`),
                    endDate: new Date(`${format(eventData.date, 'yyyy-MM-dd')}T${eventData.endTime}`),
                    description: eventData.description,
                    location: eventData.location
                  }}
                  variant="outline"
                  size="sm"
                />
              )}
            </div>
            <div className="flex space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {eventData.id ? 'Update Event' : 'Create Event'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;
