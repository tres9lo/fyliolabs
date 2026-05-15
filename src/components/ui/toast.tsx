import { cn } from "@/lib/utils";

interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  onClose?: () => void;
}

export function Toast({ title, description, variant = "default", onClose }: ToastProps) {
  const variants = {
    default: "bg-white border-gray-200 text-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-white",
    destructive: "bg-red-50 border-red-200 text-red-900 dark:bg-red-900/20 dark:border-red-800 dark:text-red-100",
    success: "bg-green-50 border-green-200 text-green-900 dark:bg-green-900/20 dark:border-green-800 dark:text-green-100",
  };

  return (
    <div
      className={cn(
        "rounded-lg border p-4 shadow-lg transition-all duration-300",
        variants[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-semibold">{title}</h4>
          {description && (
            <p className="mt-1 text-sm opacity-90">{description}</p>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
