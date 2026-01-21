"use client";

import React from "react";
import { cn } from "@/lib/utils";

// Loading Spinner Component
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "secondary" | "white" | "gray";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "primary",
  className,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const colorClasses = {
    primary: "border-green-500",
    secondary: "border-blue-500",
    white: "border-white",
    gray: "border-gray-500",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-transparent",
        sizeClasses[size],
        `${colorClasses[color]} border-t-transparent`,
        className
      )}
    />
  );
};

// Loading Dots Component
interface LoadingDotsProps {
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white" | "gray";
  className?: string;
}

export const LoadingDots: React.FC<LoadingDotsProps> = ({
  size = "md",
  color = "primary",
  className,
}) => {
  const sizeClasses = {
    sm: "h-1 w-1",
    md: "h-2 w-2",
    lg: "h-3 w-3",
  };

  const colorClasses = {
    primary: "bg-green-500",
    secondary: "bg-blue-500",
    white: "bg-white",
    gray: "bg-gray-500",
  };

  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full animate-pulse",
            sizeClasses[size],
            colorClasses[color]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: "1.4s",
          }}
        />
      ))}
    </div>
  );
};

// Loading Pulse Component (for skeleton-like loading)
interface LoadingPulseProps {
  className?: string;
  children?: React.ReactNode;
}

export const LoadingPulse: React.FC<LoadingPulseProps> = ({
  className,
  children,
}) => {
  return (
    <div className={cn("animate-pulse bg-gray-200 rounded", className)}>
      {children}
    </div>
  );
};

// Full Page Loading Component
interface FullPageLoadingProps {
  message?: string;
  submessage?: string;
  size?: "md" | "lg" | "xl";
  showLogo?: boolean;
}

export const FullPageLoading: React.FC<FullPageLoadingProps> = ({
  message = "Chargement...",
  submessage,
  size = "lg",
  showLogo = false,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-220px)] bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <div className="text-center space-y-6">
        {/* Logo */}
        {showLogo && (
          <div className="mb-8">
            <div className="h-16 w-16 mx-auto bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">FJ</span>
            </div>
          </div>
        )}

        {/* Animated Loading Circle */}
        <div className="relative">
          <div className="relative">
            <LoadingSpinner size={size} color="primary" />
            {/* Pulse background effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full opacity-20 animate-pulse" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="space-y-2">
          <p className="text-lg font-semibold text-gray-900">{message}</p>
          {submessage && (
            <p className="text-sm text-gray-600">{submessage}</p>
          )}
        </div>

        {/* Loading Dots */}
        <LoadingDots size="md" color="primary" />
      </div>
    </div>
  );
};

// Inline Loading Component
interface InlineLoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  message = "Chargement...",
  size = "md",
  className,
}) => {
  return (
    <div className={cn("flex items-center justify-center space-x-3 py-4", className)}>
      <LoadingSpinner size={size} color="primary" />
      <span className="text-gray-600 font-medium">{message}</span>
    </div>
  );
};

// Button Loading Component
interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  loading,
  children,
  loadingText = "Chargement...",
  size = "md",
  className,
  disabled,
  onClick,
  type = "button",
}) => {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200",
        "bg-green-600 hover:bg-green-700 text-white",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClasses[size],
        className
      )}
    >
      {loading && (
        <LoadingSpinner
          size={size === "lg" ? "md" : "sm"}
          color="white"
          className="mr-2"
        />
      )}
      {loading ? loadingText : children}
    </button>
  );
};

// Table Loading Component
interface TableLoadingProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export const TableLoading: React.FC<TableLoadingProps> = ({
  rows = 5,
  columns = 4,
  className,
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <LoadingPulse
              key={colIndex}
              className="h-12 flex-1 rounded-lg"
            />
          ))}
        </div>
      ))}
    </div>
  );
};

// Card Loading Component
interface CardLoadingProps {
  className?: string;
}

export const CardLoading: React.FC<CardLoadingProps> = ({ className }) => {
  return (
    <div className={cn("border rounded-lg p-6 space-y-4", className)}>
      <LoadingPulse className="h-6 w-3/4 rounded" />
      <LoadingPulse className="h-4 w-full rounded" />
      <LoadingPulse className="h-4 w-2/3 rounded" />
      <div className="flex space-x-2 pt-2">
        <LoadingPulse className="h-8 w-20 rounded" />
        <LoadingPulse className="h-8 w-16 rounded" />
      </div>
    </div>
  );
};

// Video Loading Component
interface VideoLoadingProps {
  className?: string;
}

export const VideoLoading: React.FC<VideoLoadingProps> = ({ className }) => {
  return (
    <div className={cn("relative bg-gray-900 rounded-lg overflow-hidden", className)}>
      <LoadingPulse className="w-full h-full" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
          <LoadingSpinner size="lg" color="white" />
        </div>
      </div>
    </div>
  );
};

// Progress Loading Component
interface ProgressLoadingProps {
  progress?: number;
  message?: string;
  className?: string;
}

export const ProgressLoading: React.FC<ProgressLoadingProps> = ({
  progress = 0,
  message = "Chargement...",
  className,
}) => {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium text-gray-700">{message}</span>
        <span className="text-sm text-gray-500">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};