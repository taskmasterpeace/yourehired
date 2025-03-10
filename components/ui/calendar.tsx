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
  // Function to get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date || event.startDate);
      return day.getDate() === eventDate.getDate() && 
             day.getMonth() === eventDate.getMonth() && 
             day.getFullYear() === eventDate.getFullYear();
    });
  };
  
  // Function to get color for event indicator based on status/type
  const getEventColor = (event: any) => {
    const statusColorMap: Record<string, string> = {
      preparing: "bg-gray-400",
      applied: "bg-blue-500",
      interview: "bg-purple-500",
      assessment: "bg-yellow-500",
      negotiating: "bg-orange-500",
      offer: "bg-green-500",
      rejected: "bg-red-500",
      withdrawn: "bg-gray-600"
    };
    
    // Use event type or associated opportunity status
    const status = event.type || 
                  (event.opportunity && event.opportunity.status) || 
                  "applied";
                  
    return statusColorMap[status.toLowerCase()] || "bg-blue-500";
  };
  // Custom day renderer to show event indicators
  const renderDay = (day: Date, selectedDay: Date, dayProps: any) => {
    const dayEvents = getEventsForDay(day);
    const hasEvents = dayEvents.length > 0;
    
    return (
      <div {...dayProps}>
        <div className="relative h-full w-full p-0">
          <div className="h-9 w-9 p-0 font-normal aria-selected:opacity-100">
            {day.getDate()}
          </div>
          
          {hasEvents && (
            <div className="absolute bottom-1 left-0 right-0 flex justify-center space-x-1">
              {dayEvents.slice(0, 3).map((event, i) => (
                <div 
                  key={i} 
                  className={`h-1.5 w-1.5 rounded-full ${getEventColor(event)}`}
                />
              ))}
              {dayEvents.length > 3 && (
                <div className="h-1.5 w-1.5 rounded-full bg-gray-400" />
              )}
            </div>
          )}
        </div>
      </div>
    );
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
