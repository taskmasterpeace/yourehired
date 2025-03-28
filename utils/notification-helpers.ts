import { NotificationService } from "@/components/notifications/NotificationService";
// Helper to create an application status update notification
export async function notifyApplicationStatusChange(
  application: any,
  oldStatus: string,
  newStatus: string
) {
  return NotificationService.addNotification({
    title: "Application Status Update",
    message: `${application.companyName}: Status changed from ${oldStatus} to ${newStatus}`,
    type: "application_update",
    actionUrl: `/applications/${application.id}`,
    referenceId: application.id,
    referenceType: "application",
  });
}

// Helper to create a new event notification
export async function notifyNewEvent(event: any) {
  return NotificationService.addNotification({
    title: "New Event Added",
    message: `${event.title} on ${new Date(event.date).toLocaleDateString()}`,
    type: "new_event",
    actionUrl: `/calendar?event=${event.id}`,
    referenceId: event.id,
    referenceType: "event",
  });
}

// Helper to create an event reminder notification
export async function notifyEventReminder(
  event: any,
  minutesBefore: number = 30
) {
  return NotificationService.addNotification({
    title: "Upcoming Event Reminder",
    message: `${event.title} starts in ${minutesBefore} minutes`,
    type: "event_reminder",
    actionUrl: `/calendar?event=${event.id}`,
    referenceId: event.id,
    referenceType: "event",
  });
}

// Helper to create a system notification (for app-wide announcements)
export async function notifySystem(
  title: string,
  message: string,
  actionUrl?: string
) {
  return NotificationService.addNotification({
    title,
    message,
    type: "system",
    actionUrl,
  });
}
