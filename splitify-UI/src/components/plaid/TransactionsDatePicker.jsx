import React, { useState, useEffect, useRef } from "react";
import { SkipForward, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const TransactionsDatePicker = ({ setDate, currentDate }) => {
  const [selectedDate, setSelectedDate] = useState(() => new Date(currentDate));
  const [showCalendar, setShowCalendar] = useState(false);

  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date(currentDate); // works for Date or ISO string
    return new Date(d.getFullYear(), d.getMonth(), 1); // month start
  });

  const containerRef = useRef(null);

  useEffect(() => {
    if (!showCalendar) return;
    const onDocClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showCalendar]);

  // Mock functions - replace with your actual functions

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
    console.log("ghet", date);
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
    if (!date) return;

    setSelectedDate(date);

    const pad = (n) => String(n).padStart(2, "0");
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const ymd = `${y}-${m}-${d}`; // e.g. 2025-08-05

    setDate(ymd);
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
    const date = selectedDate;
    const pad = (n) => String(n).padStart(2, "0");
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const ymd = `${y}-${m}-${d}`; // e.g. 2025-08-05

    return ymd;
    // return selectedDate.toLocaleDateString("en-US", {
    //   year: "numeric",
    //   month: "short",
    //   day: "numeric",
    // });
  };

  return (
    <div className="bg-gray-50">
      <div className="max-w-md mx-auto space-y-4">
        {/* Custom Date Option */}
        <div className="relative" ref={containerRef}>
          <button
            onClick={() => {
              setShowCalendar(!showCalendar);
            }}
            className={`w-full p-3 rounded-lg border cursor-pointer transition-all flex items-center gap-3  ${
              showCalendar
                ? "border-blue-600 bg-blue-50"
                : "border-gray-300 bg-white hover:border-gray-300"
            }`}
          >
            <Calendar className="w-5 h-5 text-gray-500" />
            <div className="text-left flex-1">
              {/* <div className="text-sm font-medium text-gray-900 ">
                Custom Date
              </div> */}
              <div className="text-sm font-med text-gray-900 whitespace-nowrap">
                {formatSelectedDate()}
              </div>
            </div>
          </button>

          {/* Calendar Dropdown */}
          {showCalendar && (
            <div className="absolute min-w-[228px] top-full 0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-10">
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
                  {
                    console.log("date", date);
                  }
                  return (
                    <button
                      key={index}
                      onClick={() => date && handleDateSelect(date)}
                      disabled={!date}
                      className={`
                        h-8 w-8 text-xs font-medium rounded-lg transition-all
                        ${!date ? "invisible" : ""}
                        ${
                          isSelected(date)
                            ? "bg-blue-600 text-white"
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

export default TransactionsDatePicker;
