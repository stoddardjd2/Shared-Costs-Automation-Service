import React, { useEffect, useMemo, useState, useRef } from "react";
import { SkipForward, Calendar, ChevronLeft, ChevronRight } from "lucide-react";

const DatePicker = ({ startTiming, setStartTiming }) => {
  // --- Helpers: safe local parse/format for YYYY-MM-DD ---
  const isISODate = (v) =>
    typeof v === "string" && /^\d{4}-\d{2}-\d{2}$/.test(v);

  const parseISODateLocal = (iso) => {
    if (!isISODate(iso)) return null;
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d); // local midnight
  };

  const toISODateLocal = (date) => {
    if (!(date instanceof Date)) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const toISODateUTC = (date) => {
    if (!(date instanceof Date)) return null;

    const y = date.getUTCFullYear();
    const m = String(date.getUTCMonth() + 1).padStart(2, "0");
    const d = String(date.getUTCDate()).padStart(2, "0");

    return `${y}-${m}-${d}`;
  };

  // --- State ---
  const [selectedDate, setSelectedDate] = useState(() =>
    isISODate(startTiming) ? parseISODateLocal(startTiming) : null
  );
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(() =>
    isISODate(startTiming) ? parseISODateLocal(startTiming) : new Date()
  );

  // click-outside ref + handler
  const containerRef = useRef(null);
  useEffect(() => {
    if (!showCalendar) return;
    const handlePointerDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowCalendar(false);
      }
    };
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown, {
      passive: true,
    });
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [showCalendar]);

  // Keep internal selection in sync if parent changes startTiming
  useEffect(() => {
    if (isISODate(startTiming)) {
      const d = parseISODateLocal(startTiming);
      setSelectedDate(d);
      setCurrentMonth(d || new Date());
    } else if (startTiming === "now") {
      setSelectedDate(null);
      setCurrentMonth(new Date());
    }
  }, [startTiming]);

  const months = useMemo(
    () => [
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
    ],
    []
  );
  const daysOfWeek = useMemo(
    () => ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
    []
  );

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    const days = [];

    // leading blanks
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    // actual days
    for (let day = 1; day <= daysInMonth; day++)
      days.push(new Date(year, month, day));
    return days;
  };

  const handleDateSelect = (date) => {
    if (!date) return;

    const y = date.getFullYear();
    const m = date.getMonth();
    const d = date.getDate();

    const utcDate = new Date(Date.UTC(y, m, d)); // midnight UTC for that day

    setSelectedDate(date);
    setStartTiming(toISODateUTC(utcDate)); // now safe
    setShowCalendar(false);
  };

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + direction);
    setCurrentMonth(newMonth);
  };

  const isToday = (date) => {
    if (!date) return false;
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    const c = new Date(date);
    c.setHours(0, 0, 0, 0);
    return c.getTime() === t.getTime();
  };

  const isPastDate = (date) => {
    if (!date) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  const isSelected = (date) =>
    selectedDate && date?.toDateString() === selectedDate.toDateString();

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
        <div className="relative" ref={containerRef}>
          <button
            onClick={() => setShowCalendar(!showCalendar)}
            className={`w-full p-3 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${
              startTiming !== "now"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <Calendar className="w-5 h-5 text-gray-500" />
            <div className="text-left flex-1">
              <div className="text-sm font-medium text-gray-900">
                Start Date
              </div>
              <div className="text-xs text-gray-600">
                {formatSelectedDate()}
              </div>
            </div>
          </button>

          {/* Calendar Dropdown */}
          {showCalendar && (
            <div className="absolute min-w-[228px] bottom-full right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-10">
              {/* Header */}
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

              {/* Days of Week */}
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

              {/* Grid */}
              <div className="grid grid-cols-7 gap-1">
                {getDaysInMonth(currentMonth).map((date, index) => {
                  const past = isPastDate(date);
                  return (
                    <button
                      key={index}
                      onClick={() => date && !past && handleDateSelect(date)}
                      disabled={!date || past || isToday(date)}
                      className={`
                        h-8 w-8 text-xs font-medium rounded-lg transition-all
                        ${!date ? "invisible" : ""}
                        ${
                          past
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
