/**
 * Demo component showing how validation errors are handled
 * This demonstrates the exact error format from the backend:
 * 
 * Backend Response:
 * {
 *   "error_code": "VALIDATION_ERROR",
 *   "errors": {
 *     "email": ["Cette adresse email est déjà utilisée."]
 *   },
 *   "message": "Validation failed",
 *   "success": false
 * }
 */

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

const ValidationErrorDemo = () => {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Simulate backend validation error response
  const simulateValidationError = () => {
    const mockBackendResponse = {
      error_code: "VALIDATION_ERROR",
      errors: {
        email: ["Cette adresse email est déjà utilisée."],
        password: ["Le mot de passe doit contenir au moins 8 caractères."],
        firstName: ["Le prénom est obligatoire."]
      },
      message: "Validation failed",
      success: false
    };

    // Process errors the same way as in the signup forms
    const mappedErrors: Record<string, string> = {};
    Object.keys(mockBackendResponse.errors).forEach(field => {
      const errorMessages = (mockBackendResponse.errors as any)[field];
      mappedErrors[field] = Array.isArray(errorMessages) ? errorMessages[0] : errorMessages;
    });
    
    setFieldErrors(mappedErrors);
    
    // Show first error as toast
    const firstErrorField = Object.keys(mockBackendResponse.errors)[0];
    const firstErrorMessage = (mockBackendResponse.errors as any)[firstErrorField][0];
    toast.error(firstErrorMessage);
  };

  const clearErrors = () => {
    setFieldErrors({});
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Validation Error Demo</h3>
      
      <div className="space-y-4">
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email *
          </label>
          <input
            type="email"
            className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
              fieldErrors.email 
                ? "border-red-300 focus:ring-red-500" 
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="votre@email.com"
          />
          {fieldErrors.email && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password *
          </label>
          <input
            type="password"
            className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
              fieldErrors.password 
                ? "border-red-300 focus:ring-red-500" 
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="••••••••"
          />
          {fieldErrors.password && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.password}</p>
          )}
        </div>

        {/* First Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            className={`block w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
              fieldErrors.firstName 
                ? "border-red-300 focus:ring-red-500" 
                : "border-gray-300 focus:ring-blue-500"
            }`}
            placeholder="Your first name"
          />
          {fieldErrors.firstName && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.firstName}</p>
          )}
        </div>
      </div>

      <div className="mt-6 space-x-3">
        <button
          onClick={simulateValidationError}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Simulate Validation Error
        </button>
        <button
          onClick={clearErrors}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          Clear Errors
        </button>
      </div>

      {/* Error Display */}
      {Object.keys(fieldErrors).length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <h4 className="text-sm font-medium text-red-800 mb-2">Validation Errors:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {Object.entries(fieldErrors).map(([field, error]) => (
              <li key={field}>
                <strong>{field}:</strong> {error}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ValidationErrorDemo;