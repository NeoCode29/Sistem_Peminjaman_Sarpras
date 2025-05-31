'use client';

import { useState } from 'react';
import { addMonths, subMonths, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth } from 'date-fns';
import { id } from 'date-fns/locale';

const dayLabels = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU', 'MINGGU'];

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());

  const handlePrev = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNext = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const renderHeader = () => (
    <div className="flex justify-between items-center p-4">
      <button onClick={handlePrev} className="p-2 text-black bg-white border shadow">
        ←
      </button>
      <span className="text-lg font-semibold text-black">
        {format(currentDate, 'MMMM - yyyy', { locale: id })}
      </span>
      <button onClick={handleNext} className="p-2 text-black bg-white border shadow">
        →
      </button>
    </div>
  );

  const renderDays = () => (
    <div className="grid grid-cols-7 text-xs text-black font-semibold text-center">
      {dayLabels.map((day, idx) => (
        <div key={idx} className="p-2">
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
        const formattedDate = format(day, 'd');
        const cloneDay = day;
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            key={cloneDay.toString()}
            className={`border p-2 text-center text-sm border-gray-300 ${
              isCurrentMonth ? 'text-black' : 'text-gray-400'
            }`}
          >
            {formattedDate}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }

    return <div className="border-l border-t">{rows}</div>;
  };

  return (
      <div
        className="bg-white border border-gray-400 rounded-lg overflow-hidden shadow"
        style={{ width: '642px', height: '' }}>
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
}
