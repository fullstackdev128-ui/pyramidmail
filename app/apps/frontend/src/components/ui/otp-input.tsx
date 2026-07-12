import * as React from "react";
import { cn } from "@/lib/utils";

interface OTPInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}

export function OTPInput({ value, onChange, length = 5 }: OTPInputProps) {
  const inputs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    if (val.length > 1) return; // Prevent multi-character input

    const newValue = value.split("");
    newValue[index] = val;
    const combinedValue = newValue.join("");
    onChange(combinedValue);

    // Auto-focus next input
    if (val && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          type="text"
          maxLength={1}
          value={value[i] || ""}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          className={cn(
            "w-12 h-14 text-center text-xl font-semibold rounded-lg border border-slate-200 bg-[#EDF3F6] focus:border-[#0087CA] focus:ring-1 focus:ring-[#0087CA] outline-none transition-all",
            value[i] && "border-[#0087CA] bg-white"
          )}
        />
      ))}
    </div>
  );
}
