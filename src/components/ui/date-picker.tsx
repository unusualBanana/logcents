"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  date?: Date
  setDate: (date: Date | undefined) => void
  className?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  setDate,
  className,
  disabled,
}: DatePickerProps) {
  // Use default month from the selected date or current date
  const defaultMonth = date || new Date();
  
  // Create a new date object for today to use as the max date
  const today = new Date();
  
  // Format date for display
  const formattedDate = date ? format(date, "d MMM yyyy") : "";
  
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal h-10 px-3",
            !date && "text-muted-foreground",
            "bg-background hover:bg-muted/40 border",
            className
          )}
          disabled={disabled}
        >
          {date ? (
            <span className="text-sm">{formattedDate}</span>
          ) : (
            <span className="text-sm text-muted-foreground">Select date</span>
          )}
          <CalendarIcon className="ml-auto h-4 w-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-auto p-3" 
        align="center"
        style={{ width: "fit-content" }}
      >
        <div style={{ 
          display: "flex", 
          justifyContent: "center",
          alignItems: "center"
        }}>
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            defaultMonth={defaultMonth}
            disabled={{ after: today }}
            initialFocus
            fixedWeeks={true}
            numberOfMonths={1}
            className="p-0"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}