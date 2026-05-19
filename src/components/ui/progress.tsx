import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  size?: "sm" | "md";
  color?: "primary" | "success" | "warning" | "danger";
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      className,
      value = 0,
      max = 100,
      size = "md",
      color = "primary",
      ...props
    },
    ref
  ) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const colorMap = {
      primary: "bg-primary-600",
      success: "bg-green-600",
      warning: "bg-amber-500",
      danger: "bg-red-600",
    };

    const sizeHeight = {
      sm: "h-1",
      md: "h-2",
    };

    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn("relative overflow-hidden rounded-full", sizeHeight[size], className)}
        {...props}
      >
        <div
          className={cn("h-full transition-all duration-300 ease-out", colorMap[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);

Progress.displayName = "Progress";

export default Progress;
export { Progress };
