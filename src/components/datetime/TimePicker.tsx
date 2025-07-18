"use client";

import React from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type ClassicTimePickerProps = {
  hour: string;
  setHour: (value: string) => void;
  minute: string;
  setMinute: (value: string) => void;
  ampm: string;
  setAmpm: (value: string) => void;
};

export default function ClassicTimePicker({
  hour,
  setHour,
  minute,
  setMinute,
  ampm,
  setAmpm,
}: ClassicTimePickerProps) {
  const hourOptions = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const minuteOptions = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const ampmOptions = ["AM", "PM"];

  return (
    <div className="grid gap-2">
      <div className="flex gap-2 justify-evenly">
        {/* Hour */}
        <Select value={hour} onValueChange={setHour}>
          <SelectTrigger className="w-[70px]">
            <SelectValue placeholder="HH" />
          </SelectTrigger>
          <SelectContent>
            {hourOptions.map((h) => (
              <SelectItem key={h} value={h}>
                {h}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="px-1 text-lg font-semibold">:</span>

        {/* Minute */}
        <Select value={minute} onValueChange={setMinute}>
          <SelectTrigger className="w-[70px]">
            <SelectValue placeholder="MM" />
          </SelectTrigger>
          <SelectContent>
            {minuteOptions.map((m) => (
              <SelectItem key={m} value={m}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* AM / PM */}
        <Select value={ampm} onValueChange={setAmpm}>
          <SelectTrigger className="w-[80px]">
            <SelectValue placeholder="AM/PM" />
          </SelectTrigger>
          <SelectContent>
            {ampmOptions.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
