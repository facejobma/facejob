"use client";

import React, { createContext, useContext, useState } from "react";

interface ExperiencePromptContextType {
  showPrompt: () => void;
  hidePrompt: () => void;
  isPromptVisible: boolean;
}

const ExperiencePromptContext = createContext<ExperiencePromptContextType | undefined>(undefined);

export function ExperiencePromptProvider({ children }: { children: React.ReactNode }) {
  const [isPromptVisible, setIsPromptVisible] = useState(false);

  const showPrompt = () => setIsPromptVisible(true);
  const hidePrompt = () => setIsPromptVisible(false);

  return (
    <ExperiencePromptContext.Provider value={{ showPrompt, hidePrompt, isPromptVisible }}>
      {children}
    </ExperiencePromptContext.Provider>
  );
}

export function useExperiencePromptContext() {
  const context = useContext(ExperiencePromptContext);
  if (context === undefined) {
    throw new Error("useExperiencePromptContext must be used within an ExperiencePromptProvider");
  }
  return context;
}