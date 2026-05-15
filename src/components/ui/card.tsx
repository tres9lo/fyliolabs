import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  footer?: React.ReactNode;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, description, footer, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900",
          className
        )}
        {...props}
      >
        {(title || description) && (
          <div className="p-6 pb-0">
            {title && (
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
        )}
        <div className={cn(title || description ? "p-6 pt-4" : "p-6", children ? "" : "py-6")}>
          {children}
        </div>
        {footer && <div className="border-t border-gray-200 dark:border-gray-800 p-6 pt-4">{footer}</div>}
      </div>
    );
  }
);

Card.displayName = "Card";

export default Card;
