"use client";

import React from "react";
import { cn } from "@/lib/utils";

// Simple Loading Spinner
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
}) => {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-10 w-10 border-3",
    xl: "h-12 w-12 border-4",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-gray-200 border-t-green-600",
        sizeClasses[size],
        className
      )}
    />
  );
};

// Simple Full Page Loading
interface FullPageLoadingProps {
  message?: string;
  submessage?: string;
  showLogo?: boolean;
}

export const FullPageLoading: React.FC<FullPageLoadingProps> = ({
  message,
  submessage,
  showLogo = false,
}) => {
  return (
    <div className="flex items-center justify-center h-[calc(100vh-220px)]">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin"></div>
    </div>
  );
};

// Simple Inline Loading
interface InlineLoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const InlineLoading: React.FC<InlineLoadingProps> = ({
  message,
  size = "md",
  className,
}) => {
  return (
    <div className={cn("flex items-center justify-center py-4", className)}>
      <LoadingSpinner size={size} />
    </div>
  );
};

// Simple Button Loading
interface ButtonLoadingProps {
  loading: boolean;
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
}

export const ButtonLoading: React.FC<ButtonLoadingProps> = ({
  loading,
  children,
  loadingText = "Chargement...",
  className,
  disabled,
  onClick,
  type = "button",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={cn(
        "inline-flex items-center justify-center font-medium rounded-lg transition-colors",
        "bg-green-600 hover:bg-green-700 text-white px-4 py-2",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
    >
      {loading && (
        <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      )}
      {loading ? loadingText : children}
    </button>
  );
};

// Simple Progress Loading
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
    <div className={cn("space-y-2", className)}>
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">{message}</span>
        <span className="text-sm text-gray-500">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};