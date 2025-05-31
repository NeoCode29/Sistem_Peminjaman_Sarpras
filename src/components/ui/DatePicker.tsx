'use client';

import * as React from "react";
import { addMonths, subMonths, format, startOfMonth, endOfMonth, 
         startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from "@/lib/utils";

interface DatePickerProps {
  selected?: Date;
  onSelect?: (date: Date) => void;
  className?: string;
}

const dayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export function DatePicker({ selected, onSelect, className }: DatePickerProps) {
  const [currentDate, setCurrentDate] = React.useState(selected || new Date());

  const handlePrev = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDateClick = (day: Date) => {
    if (onSelect && isSameMonth(day, currentDate)) {
      onSelect(day);
    }
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between px-2 py-2">
      <button
        onClick={handlePrev}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <span className="text-sm font-medium">
        {format(currentDate, 'MMMM yyyy', { locale: id })}
      </span>
      <button
        onClick={handleNext}
        className="p-2 hover:bg-gray-100 rounded-md transition-colors"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );

  const renderDays = () => (
    <div className="grid grid-cols-7 gap-1 py-2 text-xs font-medium text-center">
      {dayLabels.map((day, idx) => (
        <div key={idx} className="text-muted-foreground">
          {day}
        </div>
      ))}
    </div>
  );

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);
        const isSelected = selected && isSameDay(day, selected);

        days.push(
          <button
            key={day.toString()}
            onClick={() => handleDateClick(cloneDay)}
            disabled={!isCurrentMonth}
            className={cn(
              "h-8 w-8 p-0 font-normal rounded-md",
              !isCurrentMonth && "text-muted-foreground opacity-50",
              isSelected && "bg-primary text-primary-foreground",
              !isSelected && isCurrentMonth && "hover:bg-accent",
              "aria-selected:bg-accent aria-selected:text-accent-foreground"
            )}
          >
            <time dateTime={format(day, 'yyyy-MM-dd')}>
              {format(day, 'd')}
            </time>
          </button>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return <div className="p-2">{rows}</div>;
  };

  return (
    <div className={cn("w-[280px] rounded-lg border bg-card text-card-foreground shadow-sm", className)}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}

function ChevronLeft(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m15 18-6-6 6-6"/>
    </svg>
  )
}

function ChevronRight(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
} 