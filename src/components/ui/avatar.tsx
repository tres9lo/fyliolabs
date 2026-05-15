"use client";

import { useState } from "react";
import Image from "next/image";

interface AvatarProps {
  name: string;
  url?: string | null;
  size?: "sm" | "md" | "lg";
}

export function Avatar({ name, url, size = "md" }: AvatarProps) {
  const [error, setError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  if (url && !error) {
    return (
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700`}>
        <Image
          src={url}
          alt={name}
          width={40}
          height={40}
          className="object-cover w-full h-full"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-primary-500 flex items-center justify-center text-white font-medium`}
    >
      {initials}
    </div>
  );
}
