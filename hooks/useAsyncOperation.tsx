"use client";

import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";

interface UseAsyncOperationOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  successMessage?: string;
  errorMessage?: string;
  loadingKey?: string;
}

interface UseAsyncOperationReturn<T> {
  loading: boolean;
  error: Error | null;
  data: T | null;
  execute: (operation: () => Promise<T>) => Promise<T | null>;
  reset: () => void;
}

export function useAsyncOperation<T = any>(
  options: UseAsyncOperationOptions = {}
): UseAsyncOperationReturn<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const {
    onSuccess,
    onError,
    successMessage,
    errorMessage = "Une erreur est survenue",
  } = options;

  const execute = useCallback(
    async (operation: () => Promise<T>): Promise<T | null> => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await operation();
        
        setData(result);
        
        if (successMessage) {
          toast.success(successMessage);
        }
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        
        toast.error(errorMessage);
        
        if (onError) {
          onError(error);
        }
        
        return null;
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError, successMessage, errorMessage]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setData(null);
  }, []);

  return {
    loading,
    error,
    data,
    execute,
    reset,
  };
}

// Hook for fetch operations
export function useFetch<T = any>(url: string, options: RequestInit = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options)]);

  return {
    loading,
    error,
    data,
    fetchData,
    setData,
  };
}

// Hook for form submissions
export function useFormSubmission<T = any>(
  submitFunction: (data: any) => Promise<T>,
  options: UseAsyncOperationOptions = {}
) {
  const { loading, error, execute, reset } = useAsyncOperation<T>(options);

  const submit = useCallback(
    async (formData: any) => {
      return execute(() => submitFunction(formData));
    },
    [execute, submitFunction]
  );

  return {
    loading,
    error,
    submit,
    reset,
  };
}

// Hook for file uploads
export function useFileUpload(
  uploadFunction: (file: File) => Promise<string>,
  options: UseAsyncOperationOptions = {}
) {
  const [progress, setProgress] = useState(0);
  const { loading, error, execute, reset } = useAsyncOperation<string>(options);

  const upload = useCallback(
    async (file: File) => {
      setProgress(0);
      
      return execute(async () => {
        // Simulate progress for demo purposes
        const progressInterval = setInterval(() => {
          setProgress(prev => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return prev;
            }
            return prev + 10;
          });
        }, 200);

        try {
          const result = await uploadFunction(file);
          setProgress(100);
          return result;
        } finally {
          clearInterval(progressInterval);
        }
      });
    },
    [execute, uploadFunction]
  );

  const resetUpload = useCallback(() => {
    reset();
    setProgress(0);
  }, [reset]);

  return {
    loading,
    error,
    progress,
    upload,
    reset: resetUpload,
  };
}