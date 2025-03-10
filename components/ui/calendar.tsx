"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "../../lib/utils"
import { buttonVariants } from "../ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker> & { events?: any[] }

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  events = [],
  ...props
}: CalendarProps) {
  // Function to get events for a specific day with better error handling
  const getEventsForDay = (day: Date) => {
    // Add a check to ensure day is a valid Date object
    if (!day || !(day instanceof Date) || isNaN(day.getTime())) {
      return [];
    }
    
    // Safely filter events
    return events.filter(event => {
      try {
        if (!event || (!event.date && !event.startDate)) return false;
        
        const eventDate = new Date(event.date || event.startDate);
        
        // Check if eventDate is valid
        if (!(eventDate instanceof Date) || isNaN(eventDate.getTime())) {
          return false;
        }
        
        return day.getDate() === eventDate.getDate() && 
               day.getMonth() === eventDate.getMonth() && 
               day.getFullYear() === eventDate.getFullYear();
      } catch (error) {
        console.error("Error filtering event:", error, event);
        return false;
      }
    });
  };
  
  // Function to get color for event indicator based on status/type with better error handling
  const getEventColor = (event: any) => {
    if (!event) return "bg-gray-300"; // Default color for undefined events
    
    try {
      const statusColorMap: Record<string, string> = {
        preparing: "bg-gray-400",
        applied: "bg-blue-500",
        interview: "bg-purple-500",
        assessment: "bg-yellow-500",
        negotiating: "bg-orange-500",
        offer: "bg-green-500",
        rejected: "bg-red-500",
        withdrawn: "bg-gray-600",
        deadline: "bg-red-500",
        followup: "bg-blue-500",
        general: "bg-gray-400"
      };
      
      // Use event type or associated opportunity status
      let status = "general"; // Default status
      
      if (typeof event.type === "string") {
        status = event.type.toLowerCase();
      } else if (event.opportunity && typeof event.opportunity.status === "string") {
        status = event.opportunity.status.toLowerCase();
      }
      
      return statusColorMap[status] || "bg-gray-400";
    } catch (error) {
      console.error("Error determining event color:", error);
      return "bg-gray-300"; // Fallback color
    }
  };
  // Custom day renderer to show event indicators with improved error handling
  const renderDay = (day: Date, selectedDay: Date, dayProps: any) => {
    // Early return if dayProps is missing
    if (!dayProps) {
      console.warn("Calendar: dayProps is undefined in renderDay");
      return <div>{day?.getDate?.() || ""}</div>;
    }

    try {
      // Comprehensive safety check for the day parameter
      if (!day || !(day instanceof Date) || isNaN(day.getTime())) {
        return <div {...dayProps}>{dayProps.children}</div>;
      }
      
      // Safely get events for this day
      let dayEvents = [];
      try {
        dayEvents = getEventsForDay(day);
      } catch (eventError) {
        console.error("Error getting events for day:", eventError);
        dayEvents = [];
      }
      
      const hasEvents = dayEvents.length > 0;
      
      // Generate a safe key prefix
      const safeKeyPrefix = day instanceof Date && !isNaN(day.getTime()) 
        ? day.toISOString() 
        : `fallback-${Math.random()}`;
      
      return (
        <div {...dayProps} className={cn(dayProps.className)}>
          <div className="relative h-full w-full p-0">
            <div className="h-9 w-9 p-0 font-normal aria-selected:opacity-100">
              {day.getDate()}
            </div>
            
            {hasEvents && (
              <div className="absolute bottom-1 left-0 right-0 flex justify-center space-x-1">
                {dayEvents.slice(0, 3).map((event, i) => {
                  // Safe event color determination
                  let eventColor;
                  try {
                    eventColor = getEventColor(event);
                  } catch (colorError) {
                    console.error("Error getting event color:", colorError);
                    eventColor = "bg-muted-foreground";
                  }
                  
                  // Ensure we're only using the background color class
                  const bgColorClass = eventColor.split(' ')[0];
                  
                  return (
                    <div 
                      key={`${safeKeyPrefix}-event-${i}-${event?.id || i}`} 
                      className={`h-1.5 w-1.5 rounded-full ${bgColorClass}`}
                    />
                  );
                })}
                {dayEvents.length > 3 && (
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
                )}
              </div>
            )}
          </div>
        </div>
      );
    } catch (error) {
      // Fallback in case of any unexpected errors
      console.error("Error rendering calendar day:", error);
      return <div {...(dayProps || {})}>{dayProps?.children || day?.getDate?.() || ""}</div>;
    }
  };
  
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground aria-selected:bg-accent/50 aria-selected:text-muted-foreground",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
        IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
        Day: renderDay
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
