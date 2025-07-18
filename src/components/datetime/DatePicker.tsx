"use client";

import { useEffect, useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format, isBefore, isAfter, addDays, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const years = Array.from({ length: 50 }, (_, i) => 2000 + i);

export default function DateSelector({
  date,
  setDate,
  disablePast = false,
  maxFutureDays,
}: {
  date: Date | undefined;
  setDate: (d: Date | undefined) => void;
  disablePast?: boolean;
  maxFutureDays?: number;
}) {
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(date ?? new Date());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (visibleMonth) {
      setShowMonthPicker(false);
      setShowYearPicker(false);
    }
  }, [visibleMonth]);

  const handleMonthSelect = (month: number) => {
    const newDate = new Date(visibleMonth);
    newDate.setMonth(month);
    setVisibleMonth(newDate);
    setShowMonthPicker(false);
  };

  const handleYearSelect = (year: number) => {
    const newDate = new Date(visibleMonth);
    newDate.setFullYear(year);
    setVisibleMonth(newDate);
    setShowYearPicker(false);
  };

  const today = startOfDay(new Date());
  const maxDate = maxFutureDays ? addDays(today, maxFutureDays) : undefined;

  const disableDate = (d: Date) => {
    if (disablePast && isBefore(d, today)) return true;
    if (maxDate && isAfter(d, maxDate)) return true;
    return false;
  };

  const handleSelectDate = (selected?: Date) => {
    setDate(selected);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal mb-0",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Select a date</span>}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-auto animate-in fade-in zoom-in-95"
        sideOffset={5}
      >
        <div className="flex justify-between mb-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowMonthPicker((prev) => !prev);
              setShowYearPicker(false);
            }}
          >
            {months[visibleMonth.getMonth()]}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setShowYearPicker((prev) => !prev);
              setShowMonthPicker(false);
            }}
          >
            {visibleMonth.getFullYear()}
          </Button>
        </div>

        {showMonthPicker ? (
          <div className="grid grid-cols-4 gap-2">
            {months.map((m, i) => (
              <Button
                key={m}
                variant="ghost"
                onClick={() => handleMonthSelect(i)}
              >
                {m}
              </Button>
            ))}
          </div>
        ) : showYearPicker ? (
          <div className="grid grid-cols-4 gap-2 h-[200px] overflow-y-auto">
            {years.map((y) => (
              <Button
                key={y}
                variant="ghost"
                onClick={() => handleYearSelect(y)}
              >
                {y}
              </Button>
            ))}
          </div>
        ) : (
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelectDate}
            month={visibleMonth}
            onMonthChange={setVisibleMonth}
            disabled={disableDate}
            initialFocus
          />
        )}
      </PopoverContent>
    </Popover>
  );
}
