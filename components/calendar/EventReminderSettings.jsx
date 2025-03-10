import React from 'react';
import { Label } from "../ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "../ui/select";
import { Switch } from "../ui/switch";
import { Bell, Clock } from 'lucide-react';

const EventReminderSettings = ({ reminders, onChange }) => {
  // Default reminder if none provided
  const reminderSettings = reminders || {
    enabled: true,
    time: '30' // minutes before event
  };
  
  const handleChange = (field, value) => {
    onChange({
      ...reminderSettings,
      [field]: value
    });
  };
  
  return (
    <div className="grid gap-4 mt-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Bell className="h-4 w-4 mr-2 text-gray-500" />
          <Label htmlFor="reminder-enabled" className="text-sm font-medium">
            Enable reminder for this event
          </Label>
        </div>
        <Switch
          id="reminder-enabled"
          checked={reminderSettings.enabled}
          onCheckedChange={(checked) => handleChange('enabled', checked)}
        />
      </div>
      
      {reminderSettings.enabled && (
        <div className="pl-6">
          <div className="flex items-center mb-2">
            <Clock className="h-4 w-4 mr-2 text-gray-500" />
            <Label htmlFor="reminder-time" className="text-sm font-medium">
              Remind me
            </Label>
          </div>
          
          <Select 
            value={reminderSettings.time} 
            onValueChange={(value) => handleChange('time', value)}
          >
            <SelectTrigger id="reminder-time" className="w-full">
              <SelectValue placeholder="Select time" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">5 minutes before</SelectItem>
              <SelectItem value="10">10 minutes before</SelectItem>
              <SelectItem value="15">15 minutes before</SelectItem>
              <SelectItem value="30">30 minutes before</SelectItem>
              <SelectItem value="60">1 hour before</SelectItem>
              <SelectItem value="120">2 hours before</SelectItem>
              <SelectItem value="1440">1 day before</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  );
};

export default EventReminderSettings;
