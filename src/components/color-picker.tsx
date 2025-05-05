"use client";

import { useState, useMemo } from "react";
import { Check, ChevronDown } from "lucide-react";
import { HexColorPicker } from "react-colorful";
import { closest } from "color-2-name";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Predefined colors for the color picker
const PREDEFINED_COLORS = [
  "#E11D48", // Rose
  "#6366F1", // Indigo
  "#22C55E", // Green
  "#F59E0B", // Amber
  "#06B6D4", // Cyan
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#3B82F6", // Blue
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export function ColorPicker({ value, onChange, disabled }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const colorName = useMemo(() => closest(value), [value]);

  return (
    <div className="space-y-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
            type="button"
            disabled={disabled}
          >
            <div className="flex items-center gap-2 w-full">
              <div
                className="h-4 w-4 rounded-sm border"
                style={{ backgroundColor: value }}
              />
              <span className="flex-1 font-mono">
                {colorName?.name || value}
              </span>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-4" align="start">
          <div className="space-y-4">
            <HexColorPicker
              color={value}
              onChange={onChange}
              className="w-full"
            />

            <div className="space-y-2">
              <Label className="text-xs">Or choose from our color</Label>
              <div className="grid grid-cols-4 gap-2">
                {PREDEFINED_COLORS.map((presetColor) => (
                  <button
                    key={presetColor}
                    type="button"
                    className={cn(
                      "h-8 w-8 rounded-md border flex items-center justify-center",
                      value.toLowerCase() === presetColor.toLowerCase() &&
                        "ring-2 ring-ring ring-offset-1"
                    )}
                    style={{ backgroundColor: presetColor }}
                    onClick={() => onChange(presetColor)}
                    title={presetColor}
                    aria-label={`Select color: ${presetColor}`}
                    disabled={disabled}
                  >
                    {value.toLowerCase() === presetColor.toLowerCase() && (
                      <Check className="h-4 w-4 text-white drop-shadow-[0_0_1px_rgba(0,0,0,0.5)]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
} 