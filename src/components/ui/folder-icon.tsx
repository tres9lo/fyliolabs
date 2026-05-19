import { FolderOpen, Folder } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderIconProps {
  className?: string;
  isOpen?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeStyles = {
  sm: "w-4 h-4",
  md: "w-6 h-6",
  lg: "w-10 h-10",
  xl: "w-14 h-14",
};

export function FolderIcon({ 
  className, 
  isOpen = false, 
  size = "md" 
}: FolderIconProps) {
  const Icon = isOpen ? FolderOpen : Folder;
  
  return (
    <div className={cn("relative group transition-transform duration-300", className)}>
      <Icon 
        strokeWidth={1.5}
        className={cn(
          "transition-colors duration-300",
          sizeStyles[size],
          "text-primary-500 fill-primary-500/20"
        )} 
      />
    </div>
  );
}
