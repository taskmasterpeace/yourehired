/**
 * Formats a date for iCalendar format (YYYYMMDDTHHMMSSZ)
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string
 */
export const formatICalDate = (date) => {
  try {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      console.error("Invalid date provided to formatICalDate:", date);
      // Return current time as fallback
      return new Date().toISOString().replace(/-|:|\.\d+/g, '');
    }
    return date.toISOString().replace(/-|:|\.\d+/g, '');
  } catch (error) {
    console.error("Error formatting iCal date:", error);
    return new Date().toISOString().replace(/-|:|\.\d+/g, '');
  }
};

/**
 * Escapes special characters in iCalendar text fields
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export const escapeICalText = (text) => {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
};

/**
 * Generates an iCalendar format string from event details
 * @param {Object} event - Event details
 * @returns {string} iCalendar formatted string
 */
export const generateICalString = (event) => {
  try {
    if (!event) return '';
    
    // Ensure we have dates as Date objects
    let startDate;
    try {
      if (event.startDate instanceof Date) {
        startDate = event.startDate;
      } else if (event.startDate) {
        startDate = new Date(event.startDate);
      } else if (event.date) {
        startDate = new Date(event.date);
      } else {
        startDate = new Date();
      }
      
      // Validate the date
      if (isNaN(startDate.getTime())) {
        console.warn("Invalid start date, using current date instead");
        startDate = new Date();
      }
    } catch (dateError) {
      console.error("Error parsing start date:", dateError);
      startDate = new Date();
    }
    
    // Default end date is 1 hour after start if not provided
    let endDate;
    try {
      if (event.endDate instanceof Date) {
        endDate = event.endDate;
      } else if (event.endDate) {
        endDate = new Date(event.endDate);
      } else {
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      }
      
      // Validate the date
      if (isNaN(endDate.getTime())) {
        console.warn("Invalid end date, using start date + 1 hour instead");
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
      }
    } catch (dateError) {
      console.error("Error parsing end date:", dateError);
      endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    }
    
    // Format the event details with safe fallbacks
    const summary = escapeICalText(event.title || 'Untitled Event');
    const description = escapeICalText(event.description || event.notes || '');
    const location = escapeICalText(event.location || '');
    
    // Generate a unique ID that's stable for the same event
    const uniqueId = event.id ? `${event.id}` : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate the iCalendar string
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//You're Hired!//Job Application Tracker//EN
BEGIN:VEVENT
UID:${uniqueId}@yourehired.app
DTSTAMP:${formatICalDate(new Date())}
DTSTART:${formatICalDate(startDate)}
DTEND:${formatICalDate(endDate)}
SUMMARY:${summary}
DESCRIPTION:${description}
LOCATION:${location}
BEGIN:VALARM
TRIGGER:-PT30M
ACTION:DISPLAY
DESCRIPTION:Reminder for ${summary}
END:VALARM
END:VEVENT
END:VCALENDAR`;
  } catch (error) {
    console.error("Error generating iCal string:", error);
    // Return a minimal valid iCal as fallback
    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//You're Hired!//Job Application Tracker//EN
BEGIN:VEVENT
UID:${Date.now()}@yourehired.app
DTSTAMP:${formatICalDate(new Date())}
DTSTART:${formatICalDate(new Date())}
DTEND:${formatICalDate(new Date(Date.now() + 60 * 60 * 1000))}
SUMMARY:Event
END:VEVENT
END:VCALENDAR`;
  }
};

/**
 * Gets the appropriate color for an event based on its type or associated opportunity
 * @param {Object} event - The event object
 * @returns {string} CSS color class
 */
export const getEventColor = (event) => {
  try {
    if (!event) return "bg-gray-400 text-white";
    
    const typeColorMap = {
      preparing: "bg-gray-400 text-white",
      applied: "bg-blue-500 text-white",
      interview: "bg-purple-500 text-white",
      assessment: "bg-yellow-500 text-white",
      negotiating: "bg-orange-500 text-white",
      offer: "bg-green-500 text-white",
      rejected: "bg-red-500 text-white",
      withdrawn: "bg-gray-600 text-white",
      deadline: "bg-red-500 text-white",
      followup: "bg-blue-500 text-white",
      general: "bg-gray-400 text-white"
    };
    
    // First check event type
    if (event.type && typeof event.type === 'string') {
      const type = event.type.toLowerCase();
      if (typeColorMap[type]) {
        return typeColorMap[type];
      }
    }
    
    // Then check associated opportunity status
    if (event.opportunity && 
        event.opportunity.status && 
        typeof event.opportunity.status === 'string') {
      const status = event.opportunity.status.toLowerCase();
      if (typeColorMap[status]) {
        return typeColorMap[status];
      }
    }
    
    return "bg-gray-400 text-white";
  } catch (error) {
    console.error("Error determining event color:", error);
    return "bg-gray-400 text-white"; // Fallback color
  }
};
