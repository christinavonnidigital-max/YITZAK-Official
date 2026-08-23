import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Check, 
  X,
  Sparkles,
  AlertCircle
} from 'lucide-react';

interface CalendarDatePickerProps {
  value: string; // ISO 'YYYY-MM-DD' or empty
  onChange: (dateStr: string) => void;
  minDate?: Date; // Defaults to tomorrow or today
  label?: string;
  required?: boolean;
  className?: string;
  allowToday?: boolean; // If false, starts strictly from tomorrow
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const WEEKDAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Utility to format Date to 'YYYY-MM-DD' in local time
function formatDateToISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Utility to parse 'YYYY-MM-DD' string safely into a local Date
function parseISODate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  if (isNaN(year) || isNaN(month) || isNaN(day)) return null;
  return new Date(year, month, day);
}

// Format date into human-friendly string e.g. "Thu, 28 Aug 2026"
function formatHumanDate(dateStr: string): string {
  const d = parseISODate(dateStr);
  if (!d) return '';
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export default function CalendarDatePicker({
  value,
  onChange,
  minDate,
  label = 'Preferred Date',
  required = false,
  className = '',
  allowToday = false
}: CalendarDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Compute effective minimum date (midnight)
  const effectiveMinDate = React.useMemo(() => {
    if (minDate) {
      const d = new Date(minDate);
      d.setHours(0, 0, 0, 0);
      return d;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (!allowToday) {
      // strictly future dates (tomorrow onwards)
      today.setDate(today.getDate() + 1);
    }
    return today;
  }, [minDate, allowToday]);

  const parsedSelected = parseISODate(value);

  // Current viewing month and year
  const [viewDate, setViewDate] = useState<Date>(() => {
    if (parsedSelected && parsedSelected >= effectiveMinDate) {
      return new Date(parsedSelected.getFullYear(), parsedSelected.getMonth(), 1);
    }
    return new Date(effectiveMinDate.getFullYear(), effectiveMinDate.getMonth(), 1);
  });

  // Keep viewDate in sync when value changes externally
  useEffect(() => {
    if (parsedSelected && parsedSelected >= effectiveMinDate) {
      setViewDate(new Date(parsedSelected.getFullYear(), parsedSelected.getMonth(), 1));
    }
  }, [value, effectiveMinDate]);

  // Close calendar popover on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  // Can we navigate to previous month? (Only if previous month isn't completely before effectiveMinDate)
  const isPrevMonthDisabled = (() => {
    const prevMonthEnd = new Date(currentYear, currentMonth, 0); // last day of prev month
    prevMonthEnd.setHours(23, 59, 59, 999);
    return prevMonthEnd < effectiveMinDate;
  })();

  const handlePrevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPrevMonthDisabled) return;
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Generate calendar grid days
  const calendarDays = React.useMemo(() => {
    const days: Array<{
      date: Date;
      isCurrentMonth: boolean;
      isDisabled: boolean;
      isToday: boolean;
      isSelected: boolean;
      isoString: string;
    }> = [];

    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
    const daysInCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

    const todayDate = new Date();
    todayDate.setHours(0, 0, 0, 0);

    // 1. Previous month trailing days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(currentYear, currentMonth - 1, daysInPrevMonth - i);
      prevDate.setHours(0, 0, 0, 0);
      days.push({
        date: prevDate,
        isCurrentMonth: false,
        isDisabled: true, // past or other month
        isToday: prevDate.getTime() === todayDate.getTime(),
        isSelected: value === formatDateToISO(prevDate),
        isoString: formatDateToISO(prevDate)
      });
    }

    // 2. Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      date.setHours(0, 0, 0, 0);
      const isPast = date < effectiveMinDate;
      const isSunday = date.getDay() === 0; // standard corporate advisory warning if sunday
      const isoStr = formatDateToISO(date);

      days.push({
        date,
        isCurrentMonth: true,
        isDisabled: isPast,
        isToday: date.getTime() === todayDate.getTime(),
        isSelected: value === isoStr,
        isoString: isoStr
      });
    }

    // 3. Next month leading days to complete grid (total multiple of 7)
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let nextDay = 1; nextDay <= remainingCells; nextDay++) {
      const nextDate = new Date(currentYear, currentMonth + 1, nextDay);
      nextDate.setHours(0, 0, 0, 0);
      const isPast = nextDate < effectiveMinDate;
      const isoStr = formatDateToISO(nextDate);

      days.push({
        date: nextDate,
        isCurrentMonth: false,
        isDisabled: isPast,
        isToday: nextDate.getTime() === todayDate.getTime(),
        isSelected: value === isoStr,
        isoString: isoStr
      });
    }

    return days;
  }, [currentYear, currentMonth, effectiveMinDate, value]);

  const handleSelectDate = (isoString: string, isDisabled: boolean) => {
    if (isDisabled) return;
    onChange(isoString);
    setIsOpen(false);
  };

  // Quick preset helpers
  const applyQuickPreset = (offsetDays: number) => {
    const target = new Date(effectiveMinDate);
    // If effective min date is already tomorrow (+1), offsetDays 0 gives tomorrow
    target.setDate(target.getDate() + offsetDays);
    const iso = formatDateToISO(target);
    onChange(iso);
    setViewDate(new Date(target.getFullYear(), target.getMonth(), 1));
    setIsOpen(false);
  };

  const applyNextMonday = () => {
    const target = new Date();
    target.setHours(0, 0, 0, 0);
    const dayOfWeek = target.getDay(); // 0 is Sunday, 1 is Monday
    const daysUntilNextMonday = ((1 - dayOfWeek + 7) % 7) || 7;
    target.setDate(target.getDate() + daysUntilNextMonday);
    if (target < effectiveMinDate) {
      target.setDate(target.getDate() + 7);
    }
    const iso = formatDateToISO(target);
    onChange(iso);
    setViewDate(new Date(target.getFullYear(), target.getMonth(), 1));
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-1">
          <label className="block text-xs font-bold uppercase tracking-wider text-primary">
            {label} {required && <span className="text-red-500">*</span>}
          </label>
          <span className="text-[10px] text-[#B68A35] font-semibold flex items-center gap-1 font-mono">
            <Sparkles size={10} />
            Future Dates Only
          </span>
        </div>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        id="calendar-date-picker-trigger"
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full px-3.5 py-2.5 bg-mist border rounded-lg text-xs text-left flex items-center justify-between transition-all cursor-pointer ${
          isOpen 
            ? 'border-[#023625] ring-2 ring-[#023625]/20 bg-white shadow-xs' 
            : 'border-border hover:border-[#B68A35]/60 hover:bg-white'
        }`}
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className={`p-1.5 rounded-md transition-colors ${
            value ? 'bg-[#023625] text-[#E6CA85]' : 'bg-stone-200 text-stone-600'
          }`}>
            <CalendarIcon size={14} />
          </div>
          <div className="truncate">
            {value ? (
              <span className="font-semibold text-primary">
                {formatHumanDate(value)}
              </span>
            ) : (
              <span className="text-ash">
                Select a future date...
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {value && (
            <span
              role="button"
              tabIndex={0}
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.stopPropagation();
                  onChange('');
                }
              }}
              className="p-1 text-ash hover:text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Clear date"
            >
              <X size={13} />
            </span>
          )}
          <span className="text-[11px] font-mono font-medium text-stone-500 bg-white px-1.5 py-0.5 rounded border border-stone-200">
            {isOpen ? 'Close' : 'Pick'}
          </span>
        </div>
      </button>

      {/* Calendar Dropdown Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 sm:left-0 sm:right-auto sm:w-[320px] mt-1.5 bg-white rounded-xl shadow-2xl border border-stone-200 overflow-hidden"
          >
            {/* Calendar Header with Month/Year and navigation */}
            <div className="bg-[#012B1D] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-serif font-bold text-[#E6CA85] tracking-wide">
                  {MONTH_NAMES[currentMonth]} {currentYear}
                </span>
                <span className="text-[10px] text-white/70 font-sans">
                  Available Consultation Days
                </span>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  disabled={isPrevMonthDisabled}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    isPrevMonthDisabled
                      ? 'text-white/20 border-white/5 cursor-not-allowed'
                      : 'text-white border-white/10 hover:bg-white/10 hover:text-[#E6CA85] cursor-pointer'
                  }`}
                  title={isPrevMonthDisabled ? 'Past dates are locked' : 'Previous month'}
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg border border-white/10 text-white hover:bg-white/10 hover:text-[#E6CA85] transition-colors cursor-pointer"
                  title="Next month"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="bg-stone-50 border-b border-stone-200 px-3 py-2 flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => applyQuickPreset(0)}
                className="px-2 py-0.5 rounded-md bg-white border border-stone-200 hover:border-[#023625] hover:text-[#023625] text-[10px] font-semibold text-stone-700 transition-colors cursor-pointer"
              >
                Tomorrow
              </button>
              <button
                type="button"
                onClick={applyNextMonday}
                className="px-2 py-0.5 rounded-md bg-white border border-stone-200 hover:border-[#023625] hover:text-[#023625] text-[10px] font-semibold text-stone-700 transition-colors cursor-pointer"
              >
                Next Mon
              </button>
              <button
                type="button"
                onClick={() => applyQuickPreset(6)}
                className="px-2 py-0.5 rounded-md bg-white border border-stone-200 hover:border-[#023625] hover:text-[#023625] text-[10px] font-semibold text-stone-700 transition-colors cursor-pointer"
              >
                +1 Week
              </button>
              <button
                type="button"
                onClick={() => applyQuickPreset(13)}
                className="px-2 py-0.5 rounded-md bg-white border border-stone-200 hover:border-[#023625] hover:text-[#023625] text-[10px] font-semibold text-stone-700 transition-colors cursor-pointer"
              >
                +2 Weeks
              </button>
            </div>

            {/* Weekday Column Headers */}
            <div className="grid grid-cols-7 gap-1 px-3 pt-3 pb-1 text-center border-b border-stone-100 bg-stone-50/50">
              {WEEKDAY_NAMES.map((wd, i) => (
                <div 
                  key={wd} 
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    i === 0 || i === 6 ? 'text-amber-700' : 'text-stone-500'
                  }`}
                >
                  {wd}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-1 p-3">
              {calendarDays.map((cell, idx) => {
                const dayNum = cell.date.getDate();

                if (cell.isDisabled) {
                  return (
                    <div
                      key={`disabled_${idx}_${cell.isoString}`}
                      className="h-8 flex flex-col items-center justify-center rounded-lg text-stone-300 text-xs select-none cursor-not-allowed bg-stone-50/50"
                      title={cell.isCurrentMonth ? "Past date not available for new bookings" : ""}
                    >
                      <span className="line-through text-[11px] opacity-60">{dayNum}</span>
                    </div>
                  );
                }

                return (
                  <button
                    key={`active_${idx}_${cell.isoString}`}
                    type="button"
                    onClick={() => handleSelectDate(cell.isoString, false)}
                    className={`h-8 flex flex-col items-center justify-center rounded-lg text-xs font-semibold transition-all relative cursor-pointer ${
                      cell.isSelected
                        ? 'bg-[#023625] text-[#E6CA85] shadow-sm font-bold scale-105'
                        : cell.isCurrentMonth
                          ? 'text-stone-800 hover:bg-[#FAF8F5] hover:text-[#023625] hover:border-[#B68A35]/50 border border-transparent'
                          : 'text-stone-400 hover:bg-stone-100'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {cell.isToday && !cell.isSelected && (
                      <span className="w-1 h-1 rounded-full bg-[#B68A35] absolute bottom-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer note */}
            <div className="bg-[#FAF8F5] border-t border-stone-200 px-3 py-2 flex items-center justify-between text-[10px] text-stone-500">
              <span className="flex items-center gap-1 text-stone-600">
                <Clock size={11} className="text-[#023625]" />
                Bookings available 24h+ in advance
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="font-bold text-[#023625] hover:underline cursor-pointer"
              >
                Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
