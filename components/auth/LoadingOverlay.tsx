"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isVisible, 
  message = "Chargement..." 
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 shadow-xl flex flex-col items-center space-y-4 max-w-sm mx-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
        <p className="text-secondary text-center font-medium">{message}</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;