import React, { useState } from "react";
import { SkipForward, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const DatePicker = ({ startTiming, setStartTiming }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  // Mock functions - replace with your actual functions
  const isEditMode = true;
  const selectedCharge = { nextDue: "2025-09-15" };
  const getNextPeriodLabel = () => "Next billing cycle";

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date)
    setStartTiming(date);
    setShowCalendar(false);
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const isToday = (date) => {
    const today = new Date();
    return date?.toDateString() === today.toDateString();
  };

  const isPastDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const isSelected = (date) => {
    return selectedDate && date?.toDateString() === selectedDate.toDateString();
  };

  const formatSelectedDate = () => {
    if (!selectedDate) return "Select date";
    return selectedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-md mx-auto space-y-4">
        {/* Custom Date Option */}
        <div className="relative">
          <button
            onClick={() => {
              setShowCalendar(!showCalendar);
            }}
            
            className={`w-full p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${
              startTiming !== "now"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <Calendar className="w-5 h-5 text-gray-500" />
            <div className="text-left flex-1">
              <div className="text-sm font-medium text-gray-900 ">
                Custom Date
              </div>
              <div className="text-xs text-gray-600">
                {formatSelectedDate()}
              </div>
            </div>
          </button>

          {/* Calendar Dropdown */}
          {showCalendar && (
            <div className="absolute min-w-[228px] bottom-full 0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-10">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>

                <h3 className="text-sm font-semibold text-gray-900">
                  {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>

                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {daysOfWeek.map((day) => (
                  <div
                    key={day}
                    className="text-center text-xs font-medium text-gray-500 py-2"
                  >
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((date, index) => {
                  const isPast = isPastDate(date);
                  return (
                    <button
                      key={index}
                      onClick={() => date && !isPast && handleDateSelect(date)}
                      disabled={!date || isPast || isToday(date)}
                      className={`
                        h-8 w-8 text-xs font-medium rounded-lg transition-all
                        ${!date ? "invisible" : ""}
                        ${
                          isPast
                            ? "text-gray-300"
                            : isSelected(date)
                            ? "bg-blue-600 text-white"
                            : isToday(date)
                            ? "text-gray-300"
                            : "hover:bg-gray-100 text-gray-700 cursor-pointer"
                        }
                      `}
                    >
                      {date?.getDate()}
                    </button>
                  );
                })}
              </div>

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DatePicker;