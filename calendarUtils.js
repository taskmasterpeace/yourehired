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
  // Ensure we have dates as Date objects
  const startDate = event.startDate instanceof Date 
    ? event.startDate 
    : new Date(event.startDate || event.date);
  
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
PRODID:-//CAPTAIN//Job Application Tracker//EN
BEGIN:VEVENT
UID:${Date.now()}@captain.app
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
