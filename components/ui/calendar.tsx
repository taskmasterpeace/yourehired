"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import { DayPicker } from "react-day-picker"
import { addDays, format, isToday } from "date-fns"

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
  const renderDay = React.useCallback(
    (props: React.HTMLAttributes<HTMLDivElement> & { 
      day: { date: Date; displayMonth: Date; outside: boolean; }; 
      modifiers: Record<string, boolean>; 
    }) => {
      const { day, modifiers, ...dayProps } = props;
      // Only process if it's a Date object
      if (!(day.date instanceof Date)) {
        return <div {...dayProps}>Invalid</div>;
      }

      const currentEvents = getEventsForDay(day.date);
      const hasEvents = currentEvents.length > 0;
      const isDayToday = isToday(day.date);
      
      return (
        <div
          {...dayProps}
          className={cn(
            'relative p-0',
            dayProps.className,
            hasEvents && 'has-events'
          )}
        >
          <div className={cn(
            'flex h-9 w-9 items-center justify-center rounded-md',
            isDayToday && 'bg-primary text-primary-foreground font-bold'
          )}>
            <time dateTime={format(day.date, 'yyyy-MM-dd')}>
              {format(day.date, 'd')}
            </time>
          </div>
          
          {/* Event indicators */}
          {hasEvents && (
            <div className={cn(
              "absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5"
            )}>
              {currentEvents.slice(0, 3).map((event, idx) => (
                <div 
                  key={idx} 
                  className="h-1 w-1 rounded-full" 
                  style={{ backgroundColor: getEventColor(event) }} 
                />
              ))}
              {currentEvents.length > 3 && (
                <div className="h-1 w-1 rounded-full bg-gray-400" />
              )}
            </div>
          )}
        </div>
      );
    },
    [events]
  );
  
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
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-transparent",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100 flex items-center justify-center"
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
        Chevron: ({ orientation, ...props }) => {
          if (orientation === 'left') {
            return <ChevronLeft className="h-4 w-4" />;
          }
          return <ChevronRight className="h-4 w-4" />;
        },
        Day: renderDay
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
