/**
 * Formats a date for iCalendar format (YYYYMMDDTHHMMSSZ)
 * @param {Date} date - JavaScript Date object
 * @returns {string} Formatted date string
 */
export const formatICalDate = (date) => {
  return date.toISOString().replace(/-|:|\.\d+/g, '');
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
  if (!event) return '';
  
  // Ensure we have dates as Date objects
  const startDate = event.startDate instanceof Date 
    ? event.startDate 
    : new Date(event.startDate || event.date || new Date());
  
  // Default end date is 1 hour after start if not provided
  const endDate = event.endDate instanceof Date 
    ? event.endDate 
    : new Date(startDate.getTime() + 60 * 60 * 1000);
  
  // Format the event details
  const summary = escapeICalText(event.title);
  const description = escapeICalText(event.description || event.notes || '');
  const location = escapeICalText(event.location || '');
  
  // Generate the iCalendar string
  return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//You're Hired!//Job Application Tracker//EN
BEGIN:VEVENT
UID:${Date.now()}@yourehired.app
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
};

/**
 * Gets the appropriate color for an event based on its type or associated opportunity
 * @param {Object} event - The event object
 * @returns {string} CSS color class
 */
export const getEventColor = (event) => {
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
  if (event.type && typeColorMap[event.type.toLowerCase()]) {
    return typeColorMap[event.type.toLowerCase()];
  }
  
  // Then check associated opportunity status
  if (event.opportunity && event.opportunity.status) {
    return typeColorMap[event.opportunity.status.toLowerCase()] || "bg-gray-400 text-white";
  }
  
  return "bg-gray-400 text-white";
};
