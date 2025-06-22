import * as React from "react"
import { Calendar } from "@/components/ui/calendar"
import { TimePickerInput } from "@/components/ui/time-picker-input"
import { format } from "date-fns"
import { id } from "date-fns/locale"

interface CalendarWithTimeProps {
  date: Date
  onDateChange: (date: Date) => void
}

export function CalendarWithTime({ date, onDateChange }: CalendarWithTimeProps) {
  const handleTimeChange = (timeString: string) => {
    const [hours, minutes] = timeString.split(":").map(Number)
    const newDate = new Date(date)
    newDate.setHours(hours, minutes)
    onDateChange(newDate)
  }

  return (
    <div className="flex flex-col gap-2">
      <Calendar
        mode="single"
        selected={date}
        onSelect={(newDate) => newDate && onDateChange(newDate)}
        locale={id}
      />
      <TimePickerInput
        value={format(date, "HH:mm")}
        onChange={handleTimeChange}
      />
    </div>
  )
} 