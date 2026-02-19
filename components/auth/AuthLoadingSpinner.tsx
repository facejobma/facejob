import React from "react";

interface AuthLoadingSpinnerProps {
  message?: string;
}

export const AuthLoadingSpinner: React.FC<AuthLoadingSpinnerProps> = ({ 
  message = "Vérification de votre session..." 
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="text-center">
        {/* Animated Logo or Icon */}
        <div className="mb-6">
          <div className="relative w-20 h-20 mx-auto">
            {/* Outer spinning ring */}
            <div className="absolute inset-0 border-4 border-green-200 border-t-green-600 rounded-full animate-spin"></div>
            {/* Inner pulsing circle */}
            <div className="absolute inset-3 bg-green-500 rounded-full animate-pulse opacity-20"></div>
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-green-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading text */}
        <div className="space-y-2">
          <p className="text-gray-700 font-semibold text-lg">{message}</p>
          <div className="flex items-center justify-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLoadingSpinner;
