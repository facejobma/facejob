"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";

interface UseExperiencePromptReturn {
  shouldShowPrompt: boolean;
  isLoading: boolean;
  showPrompt: () => void;
  hidePrompt: () => void;
  skipPrompt: () => void;
}

export function useExperiencePrompt(candidatId: number | null): UseExperiencePromptReturn {
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const SKIP_KEY = `experience_prompt_skipped_${candidatId}`;
  const SKIP_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  const checkExperiences = async () => {
    if (!candidatId) {
      setIsLoading(false);
      return;
    }

    // Check if user has skipped recently
    const skipData = localStorage.getItem(SKIP_KEY);
    if (skipData) {
      const { timestamp } = JSON.parse(skipData);
      const now = Date.now();
      if (now - timestamp < SKIP_DURATION) {
        setIsLoading(false);
        return;
      } else {
        // Remove expired skip data
        localStorage.removeItem(SKIP_KEY);
      }
    }

    try {
      const authToken = Cookies.get("authToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/candidate-profile/${candidatId}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const hasExperiences = data.experiences && data.experiences.length > 0;
        
        // Show prompt if user has no experiences and hasn't skipped recently
        setShouldShowPrompt(!hasExperiences);
      }
    } catch (error) {
      console.error("Error checking experiences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const showPrompt = () => {
    setShouldShowPrompt(true);
  };

  const hidePrompt = () => {
    setShouldShowPrompt(false);
  };

  const skipPrompt = () => {
    // Store skip timestamp in localStorage
    localStorage.setItem(
      SKIP_KEY,
      JSON.stringify({
        timestamp: Date.now(),
      })
    );
    setShouldShowPrompt(false);
  };

  useEffect(() => {
    checkExperiences();
  }, [candidatId]);

  return {
    shouldShowPrompt,
    isLoading,
    showPrompt,
    hidePrompt,
    skipPrompt,
  };
}