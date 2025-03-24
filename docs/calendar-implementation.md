# Calendar Implementation Documentation

## Overview
The calendar functionality in Captain GUI provides a way for users to track and manage important dates related to their job search, such as interviews, application deadlines, and follow-ups. The calendar was designed to integrate with job opportunities and provide visual cues for different types of events.

## Calendar Components

### Main Calendar Views
- **BigCalendarView**: The primary calendar display that shows events in a monthly grid format
- **WeeklyCalendarView**: A more detailed view focused on the current week
- **CalendarHeader**: Controls for filtering events and navigating between dates

### Event Management
- **Events are color-coded by type**:
  - Interview events (red)
  - Deadline events (yellow)
  - Follow-up events (blue)
  - Assessment events (purple)

### Key Files
- `components/calendar/BigCalendarView.jsx` - Main calendar implementation
- `components/calendar/CalendarHeader.jsx` - Navigation and filtering controls
- `components/tabs/CalendarTab.tsx` - Container for the calendar view in the tab interface

## Data Structure

### CalendarEvent Interface
```typescript
export interface CalendarEvent {
  id: number;
  title: string;
  date: string;
  type: 'interview' | 'deadline' | 'followup' | 'assessment';
  opportunityId?: number;
}
```

## Event Generation

Events can be:
1. **Manually created** by the user
2. **Automatically generated** based on opportunity status changes
3. **Derived from opportunity dates** (application deadlines, interview dates)

## Calendar Integration with Opportunities

The calendar integrates with opportunities in several ways:
- Status changes in opportunities trigger event creation
- Events link back to their associated opportunities
- The calendar displays opportunity-related timeline events

## Features for Future Implementation

### Calendar Export
The calendar export feature was designed to allow users to:
- Export events to standard calendar formats (iCal)
- Sync with external calendar applications (Google Calendar, Outlook)
- Share calendar events with others

### Implementation Details for Calendar Export

#### ICS Generation
The `generateICalString` function was used to create iCalendar (.ics) format strings:

```typescript
function generateICalString(events: CalendarEvent[]): string {
  let icalContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CAPTAIN//Job Application Calendar//EN'
  ];
  
  events.forEach(event => {
    const eventDate = new Date(event.date);
    const endDate = new Date(eventDate);
    endDate.setHours(endDate.getHours() + 1); // Default 1 hour duration
    
    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };
    
    icalContent = [
      ...icalContent,
      'BEGIN:VEVENT',
      `UID:${event.id}@captain-gui`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(eventDate)}`,
      `DTEND:${formatDate(endDate)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:Event Type: ${event.type}`,
      'END:VEVENT'
    ];
  });
  
  icalContent.push('END:VCALENDAR');
  return icalContent.join('\r\n');
}
```

#### Add to Calendar Button Component
The `AddToCalendarButton` component provided a user interface for exporting events:

```tsx
export function AddToCalendarButton({ events }: { events: CalendarEvent[] }) {
  const handleDownload = () => {
    const icalContent = generateICalString(events);
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'job_search_calendar.ics');
    document.body.appendChild(link);
    link.click();
    
    // Clean up
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  return (
    <Button onClick={handleDownload} className="flex items-center gap-2">
      <CalendarPlus size={16} />
      <span>Add to Calendar</span>
    </Button>
  );
}
```

### Integration with External Calendars

Future implementation could include:
- Direct integration with Google Calendar API
- Microsoft Graph API for Outlook Calendar integration
- CalDAV support for broader compatibility

## Calendar Usage Guidelines

For developers implementing or extending calendar functionality:

1. **Event Creation**:
   - Use consistent typing for events (`interview`, `deadline`, etc.)
   - Link events to opportunities with `opportunityId` when applicable
   - Provide clear, concise titles for events

2. **Date Handling**:
   - Always use ISO format strings for dates for consistency
   - Use the `parseEventDate` utility for reliable date parsing
   - Consider timezone differences in date display and calculations

3. **UI Considerations**:
   - Maintain color-coding conventions for event types
   - Ensure sufficient contrast for events against calendar background
   - Provide filtering capabilities for users with many events

## Future Enhancements

The calendar component could be enhanced with:
- Recurring events support
- Drag-and-drop event management
- Mobile calendar view optimization
- Reminders and notifications system
- Multi-calendar view (personal/professional separation)

## Removed Calendar Features

The following calendar features were removed in recent updates but could be reimplemented:
- ICS Calendar Export functionality
- Add to Calendar button in the Calendar header
- Direct Google Calendar integration
- Event sharing capabilities

These features have been documented here for potential future implementation. 