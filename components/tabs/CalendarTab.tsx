"use client";
// components/tabs/CalendarTab.tsx
import type React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeCanvas } from "qrcode.react";
import { useRouter } from "next/navigation";
import {
  addMonths,
  format,
  getDay,
  getDaysInMonth,
  isSameDay,
  startOfMonth,
  subMonths,
} from "date-fns";
import {
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Download,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { JobApplication } from "@/types";
import { ApplicationService } from "@/lib/application-service";
import { v4 as uuidv4 } from "uuid";
import type {
  Opportunity,
  CalendarEvent as AppCalendarEvent,
} from "@/context/types";
import { useEffect, useState } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: string;
  applicationId: string;
  companyName: string;
  positionTitle: string;
  notes?: string;
  location?: string;
}

interface CalendarTabProps {
  events: AppCalendarEvent[];
  opportunities: Opportunity[];
  isDarkMode: boolean;
  user: any | null;
  dispatch: React.Dispatch<any>;
}

export function CalendarTab({
  events: appEvents,
  opportunities,
  isDarkMode,
  user,
  dispatch,
}: CalendarTabProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isViewEventOpen, setIsViewEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [animationDirection, setAnimationDirection] = useState<
    "left" | "right"
  >("right");
  const [isMonthChanging, setIsMonthChanging] = useState(false);
  const [calendarKey, setCalendarKey] = useState(
    format(currentDate, "yyyy-MM")
  );

  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: "",
    type: "Interview",
    applicationId: "",
    notes: "",
    location: "",
    time: "12:00",
  });

  const router = useRouter();
  const { toast } = useToast();
  const applicationService = new ApplicationService();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log("Loading applications and events...");

        // Load applications from storage
        const apps = await applicationService.getApplications();
        console.log(`Loaded ${apps.length} applications`);
        setApplications(apps);

        // Extract all events from applications
        const allEvents: CalendarEvent[] = [];

        apps.forEach((app) => {
          console.log(
            `Processing app ${app.id}: ${app.companyName} - Events:`,
            app.events
          );

          if (app.events && app.events.length > 0) {
            app.events.forEach((event) => {
              try {
                // Ensure date is properly parsed
                const eventDate = event.date
                  ? new Date(event.date)
                  : new Date();

                if (isNaN(eventDate.getTime())) {
                  console.warn(
                    `Invalid date for event ${event.id}: ${event.date}`
                  );
                  return; // Skip this event
                }

                allEvents.push({
                  id:
                    event.id ||
                    `event-${Math.random().toString(36).substr(2, 9)}`,
                  title: event.title || "Untitled Event",
                  date: eventDate,
                  type: event.type || "Custom",
                  applicationId: app.id,
                  companyName: app.companyName,
                  positionTitle: app.positionTitle,
                  notes: event.notes,
                  location: event.location,
                });
              } catch (err) {
                console.error(
                  `Error processing event for ${app.companyName}:`,
                  err,
                  event
                );
              }
            });
          }
        });

        console.log(`Processed ${allEvents.length} total events`);
        setEvents(allEvents);

        // Set an initial selected date (today) to show events right away
        setSelectedDate(new Date());
      } catch (error) {
        console.error("Failed to load data:", error);
        toast({
          variant: "destructive",
          title: "Error loading data",
          description: "There was a problem loading your calendar data.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  const handlePreviousMonth = () => {
    if (isMonthChanging) return;

    setAnimationDirection("left");
    setIsMonthChanging(true);

    setTimeout(() => {
      const newDate = subMonths(currentDate, 1);
      setCurrentDate(newDate);
      setCalendarKey(format(newDate, "yyyy-MM"));
      setIsMonthChanging(false);
    }, 200);
  };

  const handleNextMonth = () => {
    if (isMonthChanging) return;

    setAnimationDirection("right");
    setIsMonthChanging(true);

    setTimeout(() => {
      const newDate = addMonths(currentDate, 1);
      setCurrentDate(newDate);
      setCalendarKey(format(newDate, "yyyy-MM"));
      setIsMonthChanging(false);
    }, 200);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);

    // Check if there are events on this date
    const eventsOnDate = events.filter((event) => isSameDay(event.date, date));
    console.log(`Events on ${format(date, "yyyy-MM-dd")}:`, eventsOnDate);

    if (eventsOnDate.length > 0) {
      // If there's only one event, show it directly
      if (eventsOnDate.length === 1) {
        setSelectedEvent(eventsOnDate[0]);
        setIsViewEventOpen(true);
      }
      // Otherwise, we'll show the events in the day view
    } else {
      // If no events, open the add event dialog
      setNewEvent({
        ...newEvent,
        title: "",
        type: "Interview",
        applicationId: applications.length > 0 ? applications[0].id : "",
        notes: "",
        location: "",
        time: "12:00",
      });
      setIsAddEventOpen(true);
    }
  };

  const handleAddEvent = async () => {
    if (!selectedDate || !newEvent.title || !newEvent.applicationId) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all required fields.",
      });
      return;
    }

    try {
      // Create event date by combining selected date with time
      const [hours, minutes] = newEvent.time.split(":").map(Number);
      const eventDate = new Date(selectedDate);
      eventDate.setHours(hours, minutes, 0, 0);

      // Generate a UUID for the new event
      const eventId = uuidv4();

      // Add event to application through the service
      const success = await applicationService.addEvent(
        newEvent.applicationId,
        {
          id: eventId,
          title: newEvent.title,
          date: eventDate.toISOString(),
          type: newEvent.type,
          notes: newEvent.notes,
          location: newEvent.location,
          isCompleted: false,
        }
      );

      if (success) {
        // Find the application to get its details
        const application = applications.find(
          (app) => app.id === newEvent.applicationId
        );

        if (application) {
          // Create new event object
          const newEventObj = {
            id: eventId,
            title: newEvent.title,
            date: eventDate,
            type: newEvent.type,
            applicationId: newEvent.applicationId,
            companyName: application.companyName,
            positionTitle: application.positionTitle,
            notes: newEvent.notes,
            location: newEvent.location,
          };

          // Add event to local state
          setEvents((prev) => [...prev, newEventObj]);

          // Update applications list to include this new event
          setApplications((prevApps) =>
            prevApps.map((app) => {
              if (app.id === newEvent.applicationId) {
                // Add the new event to this application's events array
                return {
                  ...app,
                  events: [
                    ...(app.events || []),
                    {
                      id: eventId,
                      title: newEvent.title,
                      date: eventDate.toISOString(),
                      type: newEvent.type,
                      notes: newEvent.notes,
                      location: newEvent.location,
                      isCompleted: false,
                    },
                  ],
                };
              }
              return app;
            })
          );

          // Also update the state in the main app
          const appEvent = {
            id: eventId,
            title: newEvent.title,
            date: eventDate.toISOString(),
            type: newEvent.type,
            opportunityId: Number.parseInt(newEvent.applicationId),
            notes: newEvent.notes || "",
            location: newEvent.location || "",
          };

          dispatch({ type: "ADD_EVENT", payload: appEvent });

          toast({
            title: "Event added",
            description:
              "Your event has been successfully added to the calendar.",
          });

          // Close dialog and reset form
          setIsAddEventOpen(false);
          setNewEvent({
            title: "",
            type: "Interview",
            applicationId: "",
            notes: "",
            location: "",
            time: "12:00",
          });
        }
      } else {
        throw new Error("Failed to add event");
      }
    } catch (error) {
      console.error("Error adding event:", error);
      toast({
        variant: "destructive",
        title: "Failed to add event",
        description: "There was a problem saving your event. Please try again.",
      });
    }
  };
  // Corrected version of the generateCalendarLink function:
  const generateCalendarLink = (event: CalendarEvent) => {
    // Format dates for Google Calendar
    // Google Calendar requires dates in YYYYMMDDTHHmmssZ format
    const formatForGoogleCalendar = (date: Date) => {
      return format(date, "yyyyMMdd'T'HHmmss");
    };

    const startTime = formatForGoogleCalendar(event.date);
    // Assuming 1 hour event
    const endTime = formatForGoogleCalendar(
      new Date(event.date.getTime() + 60 * 60 * 1000)
    );

    // Create details with all the important information
    const details = `Type: ${event.type}
Company: ${event.companyName}
Position: ${event.positionTitle}
${event.notes ? "\nNotes: " + event.notes : ""}`;

    // Create Google Calendar URL
    const googleCalendarUrl = new URL("https://www.google.com/calendar/render");
    googleCalendarUrl.searchParams.append("action", "TEMPLATE");
    googleCalendarUrl.searchParams.append("text", event.title);
    googleCalendarUrl.searchParams.append("dates", `${startTime}/${endTime}`);
    googleCalendarUrl.searchParams.append("details", details);

    if (event.location) {
      googleCalendarUrl.searchParams.append("location", event.location);
    }

    return googleCalendarUrl.toString();
  };
  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;

    try {
      // Find the application
      const application = applications.find(
        (app) => app.id === selectedEvent.applicationId
      );

      if (application && application.events) {
        // Filter out the event to delete
        const updatedEvents = application.events.filter(
          (event) => event.id !== selectedEvent.id
        );

        // Create updated application
        const updatedApplication = {
          ...application,
          events: updatedEvents,
        };

        // Save the updated application
        const result = await applicationService.saveApplication(
          updatedApplication
        );

        if (result) {
          // Update local state for events
          setEvents((prev) =>
            prev.filter((event) => event.id !== selectedEvent.id)
          );

          // Update local state for applications
          setApplications((prevApps) =>
            prevApps.map((app) => {
              if (app.id === selectedEvent.applicationId) {
                return {
                  ...app,
                  events: updatedEvents,
                };
              }
              return app;
            })
          );

          // Also delete from main app state
          dispatch({ type: "DELETE_EVENT", payload: { id: selectedEvent.id } });

          toast({
            title: "Event deleted",
            description: "The event has been successfully deleted.",
          });

          // Close dialog
          setIsViewEventOpen(false);
          setSelectedEvent(null);
        } else {
          throw new Error("Failed to delete event");
        }
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        variant: "destructive",
        title: "Failed to delete event",
        description:
          "There was a problem deleting your event. Please try again.",
      });
    }
  };

  const downloadQRCode = () => {
    if (!selectedEvent) return;

    // Get the canvas element directly
    const canvas = document.getElementById(
      "event-qr-code"
    ) as HTMLCanvasElement;
    if (!canvas) return;

    // Convert canvas to data URL and trigger download
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `${selectedEvent.companyName}-${selectedEvent.type}-QRCode.png`;
    link.href = dataUrl;
    link.click();
  };
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentDate);
    const startDay = getDay(monthStart);
    const daysInMonth = getDaysInMonth(currentDate);
    const calendarDays = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      calendarDays.push(
        <div
          key={`empty-${i}`}
          className="h-24 border border-muted p-2 bg-muted/20"
        ></div>
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        day
      );
      const isToday = isSameDay(date, new Date());
      const isSelected = selectedDate && isSameDay(date, selectedDate);

      // Find events for this day
      const dayEvents = events.filter((event) => {
        try {
          return isSameDay(event.date, date);
        } catch (e) {
          console.error("Error comparing dates:", e, event);
          return false;
        }
      });

      calendarDays.push(
        <motion.div
          key={day}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: day * 0.01 }}
          className={cn(
            "h-24 border border-muted p-2 relative cursor-pointer hover:bg-muted/10 transition-colors",
            isToday && "bg-primary/5",
            isSelected && "ring-2 ring-primary ring-inset"
          )}
          onClick={() => handleDateClick(date)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex justify-between items-start">
            <span
              className={cn("text-sm font-medium", isToday && "text-primary")}
            >
              {day}
            </span>
          </div>
          <div className="mt-1 space-y-1 overflow-y-auto max-h-[calc(100%-20px)]">
            {dayEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={cn(
                  "text-xs p-1 rounded truncate",
                  event.type === "Interview" &&
                    !isDarkMode &&
                    "bg-amber-100 text-amber-800",
                  event.type === "Deadline" &&
                    !isDarkMode &&
                    "bg-red-100 text-red-800",
                  event.type === "Follow-up" &&
                    !isDarkMode &&
                    "bg-blue-100 text-blue-800",
                  event.type === "Custom" &&
                    !isDarkMode &&
                    "bg-gray-100 text-gray-800",
                  event.type === "Interview" &&
                    isDarkMode &&
                    "bg-amber-900/30 text-amber-200",
                  event.type === "Deadline" &&
                    isDarkMode &&
                    "bg-red-900/30 text-red-200",
                  event.type === "Follow-up" &&
                    isDarkMode &&
                    "bg-blue-900/30 text-blue-200",
                  event.type === "Custom" &&
                    isDarkMode &&
                    "bg-gray-700 text-gray-200"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedEvent(event);
                  setIsViewEventOpen(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {event.title}
              </motion.div>
            ))}
          </div>
        </motion.div>
      );
    }

    return calendarDays;
  };

  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];

    return events.filter((event) => {
      try {
        return isSameDay(event.date, selectedDate);
      } catch (e) {
        console.error("Error comparing dates for selected date:", e, event);
        return false;
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={isDarkMode ? "text-white" : ""}>
      <motion.div
        className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendar</h1>
          <p className={isDarkMode ? "text-gray-300" : "text-muted-foreground"}>
            Manage your interviews, deadlines, and follow-ups
          </p>
        </div>
        <div className="flex items-center mt-4 md:mt-0 space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setCurrentDate(new Date());
              setCalendarKey(format(new Date(), "yyyy-MM"));
            }}
            className="transition-all duration-200 hover:scale-105"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
            className="transition-all duration-200 hover:scale-105"
            disabled={isMonthChanging}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="transition-all duration-200 hover:scale-105"
            disabled={isMonthChanging}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <motion.div
            className="text-sm font-medium ml-2"
            key={format(currentDate, "MMMM-yyyy")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
          >
            {format(currentDate, "MMMM yyyy")}
          </motion.div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card className={isDarkMode ? "bg-gray-800 border-gray-700" : ""}>
          <CardContent className="p-4">
            {/* Calendar Header */}
            <div className="grid grid-cols-7 gap-0 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-medium py-2">
                  {day}
                </div>
              ))}
            </div>
            {/* Calendar Grid */}
            <AnimatePresence mode="wait">
              <motion.div
                key={calendarKey}
                className="grid grid-cols-7 gap-0"
                initial={{
                  opacity: 0,
                  x: animationDirection === "right" ? 50 : -50,
                }}
                animate={{ opacity: 1, x: 0 }}
                exit={{
                  opacity: 0,
                  x: animationDirection === "right" ? -50 : 50,
                }}
                transition={{ duration: 0.3 }}
              >
                {renderCalendar()}
              </motion.div>
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {/* Selected Day View */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            key="selected-day-view"
          >
            <Card
              className={`mt-6 ${
                isDarkMode ? "bg-gray-800 border-gray-700" : ""
              }`}
            >
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>
                    {format(selectedDate, "EEEE, MMMM d, yyyy")}
                  </CardTitle>
                  <CardDescription
                    className={isDarkMode ? "text-gray-300" : ""}
                  >
                    {getEventsForSelectedDate().length > 0
                      ? `${getEventsForSelectedDate().length} event${
                          getEventsForSelectedDate().length > 1 ? "s" : ""
                        }`
                      : "No events scheduled"}
                  </CardDescription>
                </div>
                <Button
                  onClick={() => {
                    setNewEvent({
                      ...newEvent,
                      title: "",
                      type: "Interview",
                      applicationId:
                        applications.length > 0 ? applications[0].id : "",
                      notes: "",
                      location: "",
                      time: "12:00",
                    });
                    setIsAddEventOpen(true);
                  }}
                  className="transition-all duration-200 hover:scale-105"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Event
                </Button>
              </CardHeader>
              <CardContent>
                {getEventsForSelectedDate().length > 0 ? (
                  <div className="space-y-4">
                    <AnimatePresence>
                      {getEventsForSelectedDate().map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{
                            duration: 0.3,
                            delay: index * 0.1,
                            ease: "easeOut",
                          }}
                          className={`flex items-start p-3 border rounded-lg cursor-pointer hover:bg-muted/10 ${
                            isDarkMode ? "border-gray-700" : ""
                          }`}
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsViewEventOpen(true);
                          }}
                          whileHover={{
                            scale: 1.01,
                            boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
                          }}
                          whileTap={{ scale: 0.99 }}
                        >
                          <div
                            className={cn(
                              "w-2 h-full rounded-full mr-3",
                              event.type === "Interview" && "bg-amber-500",
                              event.type === "Deadline" && "bg-red-500",
                              event.type === "Follow-up" && "bg-blue-500",
                              event.type === "Custom" && "bg-gray-500"
                            )}
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium">{event.title}</h3>
                              <Badge variant="outline">{event.type}</Badge>
                            </div>
                            <p
                              className={`text-sm ${
                                isDarkMode
                                  ? "text-gray-300"
                                  : "text-muted-foreground"
                              } mt-1`}
                            >
                              {event.companyName} - {event.positionTitle}
                            </p>
                            <div
                              className={`flex items-center text-xs ${
                                isDarkMode
                                  ? "text-gray-400"
                                  : "text-muted-foreground"
                              } mt-2`}
                            >
                              <Clock className="h-3 w-3 mr-1" />
                              {format(event.date, "h:mm a")}
                              {event.location && (
                                <span className="ml-3">
                                  📍 {event.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div
                    className="text-center py-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        duration: 0.5,
                        type: "spring",
                        stiffness: 200,
                      }}
                    >
                      <CalendarIcon
                        className={`h-12 w-12 ${
                          isDarkMode ? "text-gray-400" : "text-muted-foreground"
                        } mx-auto mb-4`}
                      />
                    </motion.div>
                    <h3 className="text-lg font-medium mb-2">
                      No events scheduled
                    </h3>
                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-300" : "text-muted-foreground"
                      } mb-4`}
                    >
                      Add an event to keep track of your interviews, deadlines,
                      and follow-ups.
                    </p>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Event Dialog */}
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent
          className={`sm:max-w-[500px] ${
            isDarkMode ? "bg-gray-800 text-white border-gray-700" : ""
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
          >
            <DialogHeader>
              <DialogTitle>Add Event</DialogTitle>
              <DialogDescription className={isDarkMode ? "text-gray-300" : ""}>
                {selectedDate &&
                  `Add a new event for ${format(selectedDate, "MMMM d, yyyy")}`}
              </DialogDescription>
            </DialogHeader>
            <motion.div
              className="grid gap-4 py-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="grid gap-2">
                <Label htmlFor="title">Event Title *</Label>
                <Input
                  id="title"
                  value={newEvent.title}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, title: e.target.value })
                  }
                  placeholder="e.g., Technical Interview"
                  className={isDarkMode ? "bg-gray-700 border-gray-600" : ""}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Event Type *</Label>
                  <Select
                    value={newEvent.type}
                    onValueChange={(value) =>
                      setNewEvent({ ...newEvent, type: value })
                    }
                  >
                    <SelectTrigger
                      id="type"
                      className={
                        isDarkMode ? "bg-gray-700 border-gray-600" : ""
                      }
                    >
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className={isDarkMode ? "bg-gray-700" : ""}>
                      <SelectItem value="Interview">Interview</SelectItem>
                      <SelectItem value="Deadline">Deadline</SelectItem>
                      <SelectItem value="Follow-up">Follow-up</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time *</Label>
                  <Input
                    id="time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) =>
                      setNewEvent({ ...newEvent, time: e.target.value })
                    }
                    className={isDarkMode ? "bg-gray-700 border-gray-600" : ""}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="application">Related Application *</Label>
                {applications.length > 0 ? (
                  <Select
                    value={newEvent.applicationId}
                    onValueChange={(value) =>
                      setNewEvent({ ...newEvent, applicationId: value })
                    }
                  >
                    <SelectTrigger
                      id="application"
                      className={
                        isDarkMode ? "bg-gray-700 border-gray-600" : ""
                      }
                    >
                      <SelectValue placeholder="Select application" />
                    </SelectTrigger>
                    <SelectContent className={isDarkMode ? "bg-gray-700" : ""}>
                      {applications.map((app) => (
                        <SelectItem key={app.id} value={app.id}>
                          {app.companyName} - {app.positionTitle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div
                    className={`text-sm ${
                      isDarkMode ? "text-gray-300" : "text-muted-foreground"
                    } border rounded-md p-2 ${
                      isDarkMode ? "border-gray-600" : ""
                    }`}
                  >
                    No applications available.{" "}
                    <Button
                      variant="link"
                      className="p-0 h-auto"
                      onClick={() => router.push("/opportunities/new")}
                    >
                      Add an application
                    </Button>{" "}
                    first.
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Location (Optional)</Label>
                <Input
                  id="location"
                  value={newEvent.location}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, location: e.target.value })
                  }
                  placeholder="e.g., Zoom, Office, Phone"
                  className={isDarkMode ? "bg-gray-700 border-gray-600" : ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={newEvent.notes}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, notes: e.target.value })
                  }
                  placeholder="Any additional details about this event"
                  rows={3}
                  className={isDarkMode ? "bg-gray-700 border-gray-600" : ""}
                />
              </div>
            </motion.div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddEventOpen(false)}
                className={isDarkMode ? "border-gray-600" : ""}
              >
                Cancel
              </Button>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  onClick={handleAddEvent}
                  disabled={
                    !newEvent.title ||
                    !newEvent.applicationId ||
                    applications.length === 0
                  }
                >
                  Add Event
                </Button>
              </motion.div>
            </DialogFooter>
          </motion.div>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewEventOpen} onOpenChange={setIsViewEventOpen}>
        <DialogContent
          className={`sm:max-w-[500px] ${
            isDarkMode ? "bg-gray-800 text-white border-gray-700" : ""
          }`}
        >
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{
                type: "spring",
                damping: 25,
                stiffness: 300,
              }}
            >
              <div className="absolute right-4 top-4"></div>
              <DialogHeader className="pb-2 border-b border-gray-200 dark:border-gray-700 pt-2">
                <div className="flex items-center justify-between pr-6">
                  <DialogTitle className="text-xl">
                    {selectedEvent.title}
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className={cn(
                      "ml-2 transition-colors",
                      selectedEvent.type === "Interview" &&
                        !isDarkMode &&
                        "bg-amber-100 text-amber-800 border-amber-200",
                      selectedEvent.type === "Deadline" &&
                        !isDarkMode &&
                        "bg-red-100 text-red-800 border-red-200",
                      selectedEvent.type === "Follow-up" &&
                        !isDarkMode &&
                        "bg-blue-100 text-blue-800 border-blue-200",
                      selectedEvent.type === "Custom" &&
                        !isDarkMode &&
                        "bg-gray-100 text-gray-800 border-gray-200",
                      selectedEvent.type === "Interview" &&
                        isDarkMode &&
                        "bg-amber-900/30 text-amber-200 border-amber-800",
                      selectedEvent.type === "Deadline" &&
                        isDarkMode &&
                        "bg-red-900/30 text-red-200 border-red-800",
                      selectedEvent.type === "Follow-up" &&
                        isDarkMode &&
                        "bg-blue-900/30 text-blue-200 border-blue-800",
                      selectedEvent.type === "Custom" &&
                        isDarkMode &&
                        "bg-gray-700 text-gray-200 border-gray-600"
                    )}
                  >
                    {selectedEvent.type}
                  </Badge>
                </div>
                <DialogDescription
                  className={cn(
                    "mt-2 flex items-center",
                    isDarkMode ? "text-gray-300" : "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(selectedEvent.date, "EEEE, MMMM d, yyyy")}
                  <span className="mx-2">•</span>
                  <Clock className="h-4 w-4 mr-2" />
                  {format(selectedEvent.date, "h:mm a")}
                </DialogDescription>
              </DialogHeader>
              <motion.div
                className="py-4 space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <motion.div
                  className="bg-muted/20 p-3 rounded-lg transition-all"
                  whileHover={{ scale: 1.01 }}
                >
                  <h3
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-gray-300" : "text-muted-foreground"
                    } mb-1`}
                  >
                    Application
                  </h3>
                  <p className="font-medium">
                    {selectedEvent.companyName} - {selectedEvent.positionTitle}
                  </p>
                </motion.div>
                {selectedEvent.location && (
                  <motion.div
                    className="bg-muted/20 p-3 rounded-lg transition-all"
                    whileHover={{ scale: 1.01 }}
                  >
                    <h3
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-300" : "text-muted-foreground"
                      } mb-1`}
                    >
                      Location
                    </h3>
                    <p className="flex items-center">
                      <span className="mr-2">📍</span> {selectedEvent.location}
                    </p>
                  </motion.div>
                )}
                {selectedEvent.notes && (
                  <motion.div
                    className="bg-muted/20 p-3 rounded-lg transition-all"
                    whileHover={{ scale: 1.01 }}
                  >
                    <h3
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-300" : "text-muted-foreground"
                      } mb-1`}
                    >
                      Notes
                    </h3>
                    <p className="whitespace-pre-wrap">{selectedEvent.notes}</p>
                  </motion.div>
                )}

                {/* Add QR Code Section right here */}

                <motion.div
                  className="bg-muted/20 p-3 rounded-lg transition-all"
                  whileHover={{ scale: 1.01 }}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex justify-between items-center mb-3">
                    <h3
                      className={`text-sm font-medium ${
                        isDarkMode ? "text-gray-300" : "text-muted-foreground"
                      }`}
                    >
                      Event QR Code
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadQRCode}
                      className="flex items-center gap-1"
                    >
                      <Download size={14} />
                      <span className="text-xs">Download</span>
                    </Button>
                  </div>
                  <div className="flex flex-col items-center justify-center py-2">
                    <div
                      className={`p-3 bg-white rounded-lg mb-2 ${
                        isDarkMode
                          ? "shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                          : "shadow-md"
                      }`}
                    >
                      <QRCodeCanvas
                        id="event-qr-code"
                        value={generateCalendarLink(selectedEvent)}
                        size={150}
                        level="H" // High error correction level
                        includeMargin={true}
                      />
                    </div>
                    <p
                      className={`text-xs text-center ${
                        isDarkMode ? "text-gray-400" : "text-muted-foreground"
                      }`}
                    >
                      Scan to add this event to your calendar
                    </p>
                  </div>
                </motion.div>
              </motion.div>
              <DialogFooter className="pt-2 border-t border-gray-200 dark:border-gray-700">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button variant="destructive" onClick={handleDeleteEvent}>
                    Delete Event
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button onClick={() => setIsViewEventOpen(false)}>
                    Close
                  </Button>
                </motion.div>
              </DialogFooter>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
