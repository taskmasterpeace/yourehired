# Calendar Implementation Guide

## Overview
This document provides a comprehensive guide for implementing a robust calendar feature in the CAPTAIN application. It outlines data structures, components, and implementation details needed for a successful calendar module.

## Event Data Structure

```typescript
interface CalendarEvent {
  id: number;
  title: string;
  date: string; // ISO format date string
  startTime?: string; // HH:MM format
  endTime?: string; // HH:MM format
  type: 'interview' | 'deadline' | 'followup' | 'assessment';
  opportunityId?: number; // Link to job opportunity
  notes?: string;
  location?: string;
  allDay?: boolean;
}
```

## Required Features

### Calendar Views
- **Month View**: Traditional monthly calendar grid
- **Week View**: 7-day view with hourly breakdown
- **Day View**: Detailed single-day view with hourly slots
- **Agenda View**: List-based view of upcoming events

### Event Management
- Create new events with title, date, time, type
- Edit existing events
- Delete events with confirmation
- Link events to job opportunities
- Filter events by type or opportunity

### Visual Styling
- Color-coding based on event type:
  - Interviews: Purple (#8b5cf6)
  - Deadlines: Red (#ef4444)
  - Follow-ups: Blue (#3b82f6)
  - Assessments: Yellow (#eab308)
- Dark/light mode support
- Responsive design for mobile and desktop

### Event Actions
- Click events to view details
- Click empty slots to create new events
- Drag-and-drop to move events (optional)
- Resize events to change duration (optional)

## Integration with State Management

### State Actions
```typescript
// Add new event
dispatch({ type: 'ADD_EVENT', payload: eventData });

// Update existing event
dispatch({ type: 'UPDATE_EVENT', payload: { id, updates } });

// Delete event
dispatch({ type: 'DELETE_EVENT', payload: eventId });
```

## Recommended Libraries

### Calendar Libraries
- **FullCalendar**: Comprehensive solution with all required views
  - Installation: `npm install @fullcalendar/react @fullcalendar/core @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction`
  - Documentation: https://fullcalendar.io/docs
  
- **React Big Calendar**: Simpler alternative with good React integration
  - Installation: `npm install react-big-calendar date-fns`
  - Documentation: https://github.com/jquense/react-big-calendar

### Date Manipulation
- **date-fns**: Consistent date manipulation
  - Installation: `npm install date-fns`
  - Documentation: https://date-fns.org/docs/Getting-Started

## Component Structure

```
components/
  calendar/
    CalendarView.tsx       # Main container component
    CalendarHeader.tsx     # Navigation and controls
    EventForm.tsx          # Form for creating/editing events
    EventDetails.tsx       # Modal for viewing event details
    ColorLegend.tsx        # Legend for event color coding
  tabs/
    CalendarTab.tsx        # Tab container
```

## Implementation Notes

1. Handle date parsing consistently with a utility function
2. Store date strings in ISO format (YYYY-MM-DDTHH:MM:SS.sssZ)
3. Use a consistent format for display (e.g., "March 15, 2023")
4. Implement proper error handling for invalid dates
5. Save user preferences (current view, filters) in localStorage
6. Optimize for mobile with appropriate views and controls

## Future Enhancements

- Export events to external calendars (iCal, Google Calendar)
- Calendar sharing features
- Recurring events
- Event reminders and notifications
- Integration with external calendar services 