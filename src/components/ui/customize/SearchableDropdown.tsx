// src\components\ui\customize\SearchableDropdown.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

type Option = {
  label: string;
  value: string | number;
};

type SearchableDropdownProps = {
  options: Option[];
  value: string | number | null;
  onChange: (value: string | number | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  hint?: string;
  clearable?: boolean;
  noOptionsMessage?: string;
};

export default function SearchableDropdown({
  options,
  value,
  onChange,
  placeholder = "Select option",
  className,
  disabled = false,
  hint = "",
  clearable = false,
  noOptionsMessage = "No results found.",
}: SearchableDropdownProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(""); // <-- Add this line
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLabel = options.find((o) => o.value === value)?.label;

  // Filter options by search
  const filteredOptions = search
    ? options.filter((option) =>
        option.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  // Autofocus the search input when opening dropdown
  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  return (
    <div className={cn("relative w-full", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn("w-full justify-between min-w-0", className)}
            disabled={disabled}
          >
            {selectedLabel ?? placeholder}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className={cn(
            "w-[var(--radix-popover-trigger-width)] min-w-0 p-0",
            "max-h-[70vh]",
            "overflow-y-auto",
            "shadow-lg"
          )}
          sideOffset={4}
        >
          <Command>
            {/* Here's the search input */}
            <CommandInput
              placeholder="Search..."
              ref={inputRef}
              value={search}
              onValueChange={setSearch}
              onChangeCapture={(e) => setSearch(e.currentTarget.value)}
            />
            <CommandEmpty>{noOptionsMessage}</CommandEmpty>
            <CommandGroup>
              {/* Empty option at the top */}
              {value !== null && (
                <CommandItem
                  key="empty"
                  value=""
                  onSelect={() => {
                    onChange(null);
                    setOpen(false);
                    setSearch("");
                  }}
                  className="text-muted-foreground"
                >
                  <span className="italic">{placeholder}</span>
                </CommandItem>
              )}
              {/* Render normal options */}
              {filteredOptions.length === 0 ? (
                <div className="py-2 px-4 text-sm text-muted-foreground">
                  {noOptionsMessage}
                </div>
              ) : (
                filteredOptions.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={() => {
                      onChange(option.value);
                      setOpen(false);
                      setSearch(""); // reset search when selecting
                    }}
                  >
                    {option.label}
                  </CommandItem>
                ))
              )}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {hint && (
        <div className="text-xs mt-1 text-zinc-500 dark:text-zinc-400">
          {hint}
        </div>
      )}
    </div>
  );
}
