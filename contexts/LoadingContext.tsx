"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface LoadingState {
  [key: string]: boolean;
}

interface LoadingContextType {
  loadingStates: LoadingState;
  setLoading: (key: string, loading: boolean) => void;
  isLoading: (key: string) => boolean;
  isAnyLoading: () => boolean;
  clearAllLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

interface LoadingProviderProps {
  children: ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>({});

  const setLoading = (key: string, loading: boolean) => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: loading
    }));
  };

  const isLoading = (key: string): boolean => {
    return loadingStates[key] || false;
  };

  const isAnyLoading = (): boolean => {
    return Object.values(loadingStates).some(loading => loading);
  };

  const clearAllLoading = () => {
    setLoadingStates({});
  };

  const value: LoadingContextType = {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    clearAllLoading,
  };

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error("useLoading must be used within a LoadingProvider");
  }
  return context;
};

// Custom hook for managing individual loading states
export const useLoadingState = (key: string) => {
  const { setLoading, isLoading } = useLoading();
  
  const startLoading = () => setLoading(key, true);
  const stopLoading = () => setLoading(key, false);
  const loading = isLoading(key);

  return {
    loading,
    startLoading,
    stopLoading,
    setLoading: (loading: boolean) => setLoading(key, loading),
  };
};