import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface FormFieldProps extends HTMLAttributes<HTMLDivElement> {
  label: string;
  error?: string;
  required?: boolean;
}

const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
  ({ className, label, error, required, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div>{children}</div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      </div>
    );
  }
);

FormField.displayName = "FormField";

export default FormField;
