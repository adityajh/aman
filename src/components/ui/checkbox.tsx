"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  onCheckedChange?: (checked: boolean) => void
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, onCheckedChange, onChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e)
      onCheckedChange?.(e.target.checked)
    }

    return (
      <div className="relative flex items-center justify-center shrink-0">
        <input
          type="checkbox"
          ref={ref}
          onChange={handleChange}
          className={cn(
            "peer h-4 w-4 shrink-0 rounded border border-slate-300 bg-white ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-action focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none transition-all checked:bg-teal-action checked:border-teal-action cursor-pointer",
            className
          )}
          {...props}
        />
        <Check 
          className="absolute h-3 w-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" 
          strokeWidth={3}
        />
      </div>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
